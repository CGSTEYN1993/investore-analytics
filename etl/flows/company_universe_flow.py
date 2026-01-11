"""
InvestOre Analytics - ASX Company Universe Sync (Prefect)

Keeps the ASX mining/exploration universe up-to-date by:
- Pulling the full ASX company directory (paged)
- Filtering to candidate industries (Materials, Energy)
- Enriching each symbol with /companies/{symbol}/about + /header
- Classifying mining/exploration based on description keywords
- Upserting into the SQLAlchemy Company table

This is designed to be run on a schedule (e.g. daily) and is idempotent.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx
from prefect import flow, task, get_run_logger
from prefect.tasks import task_input_hash
from tenacity import retry, stop_after_attempt, wait_exponential
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert

from app.core.database import AsyncSessionLocal
from app.models import Company, SourceRegistry, SourceStatus


ASX_BASE_URL = "https://asx.api.markitdigital.com/asx-research/1.0"
ASX_DIRECTORY_URL = f"{ASX_BASE_URL}/companies/directory"

CANDIDATE_INDUSTRIES = {"Materials", "Energy"}

MINING_KEYWORDS = (
    "mining",
    "miner",
    "mine",
    "exploration",
    "explore",
    "resources",
    "minerals",
    "metals",
    "ore",
    "deposit",
    "drilling",
    "drill",
    "tenement",
    "project",
    "gold",
    "silver",
    "copper",
    "lithium",
    "nickel",
    "uranium",
    "iron ore",
    "coal",
    "graphite",
    "rare earth",
    "vanadium",
    "zinc",
    "lead",
    "tin",
    "cobalt",
    "manganese",
    "platinum",
    "palladium",
    "mineral sands",
    "oil",
    "gas",
    "petroleum",
)

# A small exclude list to reduce obvious false positives within Materials.
# (We keep this conservative to avoid missing miners.)
EXCLUDE_KEYWORDS = (
    "real estate",
    "reit",
    "bank",
    "insurance",
    "biotech",
    "pharmaceutical",
    "software",
)


def _score_description(text: str) -> int:
    t = (text or "").lower()
    score = 0
    for kw in MINING_KEYWORDS:
        if kw in t:
            score += 1
    for kw in EXCLUDE_KEYWORDS:
        if kw in t:
            score -= 2
    return score


@task(name="get_or_create_source", cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=6))
async def get_or_create_source(name: str, url: str) -> int:
    """Get or create a SourceRegistry entry and return its id."""
    logger = get_run_logger()

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SourceRegistry).where(SourceRegistry.name == name))
        existing = result.scalar_one_or_none()
        if existing:
            return existing.id

        new_source = SourceRegistry(
            name=name,
            type="api",
            url=url,
            license="ASX Research API (Markit Digital)",
            status=SourceStatus.ACTIVE,
        )
        db.add(new_source)
        await db.commit()
        await db.refresh(new_source)
        logger.info(f"Created source registry: {name}")
        return new_source.id


@task(name="fetch_asx_directory_page", retries=3, retry_delay_seconds=10)
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=20))
async def fetch_asx_directory_page(page: int) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(ASX_DIRECTORY_URL, params={"page": page})
        r.raise_for_status()
        return r.json().get("data", {})


@task(name="fetch_asx_about", retries=3, retry_delay_seconds=10)
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=20))
async def fetch_asx_about(symbol: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(f"{ASX_BASE_URL}/companies/{symbol}/about")
        r.raise_for_status()
        return r.json().get("data", {})


@task(name="fetch_asx_header", retries=3, retry_delay_seconds=10)
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=20))
async def fetch_asx_header(symbol: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(f"{ASX_BASE_URL}/companies/{symbol}/header")
        r.raise_for_status()
        return r.json().get("data", {})


async def _gather_limited(coros, limit: int = 10):
    sem = asyncio.Semaphore(limit)

    async def _wrap(c):
        async with sem:
            return await c

    return await asyncio.gather(*[_wrap(c) for c in coros], return_exceptions=True)


@task(name="discover_asx_mining_universe")
async def discover_asx_mining_universe(concurrency: int = 10) -> List[Dict[str, Any]]:
    """Discover ASX mining/exploration companies and return normalized upsert rows."""
    logger = get_run_logger()

    first = await fetch_asx_directory_page(1)
    total = int(first.get("count", 0) or 0)
    first_items = first.get("items", []) or []
    page_size = len(first_items) or 25
    total_pages = max(1, (total + page_size - 1) // page_size)

    logger.info(f"ASX directory: total={total}, pages={total_pages}, page_size={page_size}")

    directory_items: List[Dict[str, Any]] = []

    def _add(batch: List[Dict[str, Any]]):
        for it in batch:
            if it.get("industry") in CANDIDATE_INDUSTRIES:
                directory_items.append(it)

    _add(first_items)

    for page in range(2, total_pages + 1):
        data = await fetch_asx_directory_page(page)
        batch = data.get("items", []) or []
        if not batch:
            break
        _add(batch)

    logger.info(f"Candidate universe (Materials/Energy): {len(directory_items)}")

    # Enrich with about/header and classify
    symbols = [it["symbol"].upper() for it in directory_items if it.get("symbol")]

    about_results = await _gather_limited([fetch_asx_about(s) for s in symbols], limit=concurrency)
    header_results = await _gather_limited([fetch_asx_header(s) for s in symbols], limit=concurrency)

    now = datetime.utcnow()
    rows: List[Dict[str, Any]] = []

    for it, about, header in zip(directory_items, about_results, header_results):
        symbol = (it.get("symbol") or "").upper()
        if not symbol:
            continue

        about_data: Dict[str, Any] = {} if isinstance(about, Exception) else (about or {})
        header_data: Dict[str, Any] = {} if isinstance(header, Exception) else (header or {})

        description = about_data.get("description") or ""
        score = _score_description(description)

        # Conservative: require at least one mining keyword to be included.
        # (Industry filter alone is too broad.)
        if score <= 0:
            continue

        name = (
            header_data.get("displayName")
            or about_data.get("displayName")
            or it.get("displayName")
            or symbol
        )

        rows.append(
            {
                "ticker": symbol,
                "exchange": "ASX",
                "name": name,
                "country": "Australia",
                "sector": "Mining",
                "primary_commodity": None,
                "currency": "AUD",
                "website": about_data.get("websiteUrl"),
                "is_active": True,
                "updated_at": now,
                "metadata_json": {
                    "asx": {
                        "source": "companies/directory",
                        "xid": it.get("xid"),
                        "dateListed": it.get("dateListed"),
                        "industry": it.get("industry"),
                        "marketCap": it.get("marketCap"),
                        "priceChangeFiveDayPercent": it.get("priceChangeFiveDayPercent"),
                        "isRecentListing": it.get("isRecentListing"),
                        "statusCode": it.get("statusCode"),
                        "header": {
                            "sector": header_data.get("sector"),
                            "industryGroup": header_data.get("industryGroup"),
                            "marketCap": header_data.get("marketCap"),
                        },
                        "about": {
                            "description": description,
                            "indices": about_data.get("indices"),
                        },
                        "miningScore": score,
                        "lastSeen": now.isoformat(),
                    }
                },
            }
        )

    logger.info(f"Discovered ASX mining/exploration companies: {len(rows)}")
    return rows


@task(name="upsert_companies")
async def upsert_companies(rows: List[Dict[str, Any]]) -> int:
    logger = get_run_logger()

    if not rows:
        return 0

    async with AsyncSessionLocal() as db:
        upserted = 0
        for row in rows:
            stmt = (
                insert(Company)
                .values(**row)
                .on_conflict_do_update(
                    index_elements=["ticker", "exchange"],
                    set_={
                        "name": row["name"],
                        "country": row.get("country"),
                        "sector": row.get("sector"),
                        "primary_commodity": row.get("primary_commodity"),
                        "currency": row.get("currency"),
                        "website": row.get("website"),
                        "is_active": True,
                        "metadata_json": row.get("metadata_json"),
                        "updated_at": row.get("updated_at", datetime.utcnow()),
                    },
                )
            )
            await db.execute(stmt)
            upserted += 1

        await db.commit()

    logger.info(f"Upserted {upserted} ASX companies")
    return upserted


@task(name="deactivate_missing_companies")
async def deactivate_missing_companies(current_symbols: List[str]) -> int:
    """Mark ASX companies as inactive if they were previously active but not seen in the latest run."""
    logger = get_run_logger()
    current_set = set(s.upper() for s in current_symbols)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Company.ticker)
            .where(Company.exchange == "ASX")
            .where(Company.is_active.is_(True))
        )
        active = [row[0] for row in result.all()]

        missing = [t for t in active if t.upper() not in current_set]
        if not missing:
            return 0

        await db.execute(
            update(Company)
            .where(Company.exchange == "ASX")
            .where(Company.ticker.in_(missing))
            .values(is_active=False, updated_at=datetime.utcnow())
        )
        await db.commit()

    logger.info(f"Deactivated {len(missing)} ASX companies")
    return len(missing)


@flow(name="asx_company_universe_sync", log_prints=True)
async def asx_company_universe_sync_flow(concurrency: int = 10):
    logger = get_run_logger()
    logger.info("Starting ASX company universe sync")

    source_id = await get_or_create_source(
        name="ASX Company Directory",
        url=ASX_DIRECTORY_URL,
    )

    try:
        rows = await discover_asx_mining_universe(concurrency=concurrency)
        upserted = await upsert_companies(rows)
        current_symbols = [r["ticker"] for r in rows]
        deactivated = await deactivate_missing_companies(current_symbols)

        # Update source status
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(SourceRegistry)
                .where(SourceRegistry.id == source_id)
                .values(
                    status=SourceStatus.ACTIVE,
                    last_success=datetime.utcnow(),
                    error_count=0,
                    last_error=None,
                )
            )
            await db.commit()

        return {
            "upserted": upserted,
            "deactivated": deactivated,
            "active_universe": len(current_symbols),
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception("ASX company universe sync failed")
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(SourceRegistry)
                .where(SourceRegistry.id == source_id)
                .values(
                    status=SourceStatus.ERROR,
                    last_error=str(e),
                    error_count=SourceRegistry.error_count + 1,
                )
            )
            await db.commit()
        raise


if __name__ == "__main__":
    asyncio.run(asx_company_universe_sync_flow(concurrency=10))
