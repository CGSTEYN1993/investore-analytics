"""
InvestOre Analytics - ETL Pipeline Design with Prefect

This module defines the data ingestion pipelines for:
- Market data (stock prices)
- FX rates
- Resource estimates
- Company metrics

Features:
- Retry with exponential backoff
- Data lineage tracking
- Idempotent operations
- Schema versioning support
"""
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal
import asyncio
from prefect import flow, task, get_run_logger
from prefect.tasks import task_input_hash
from tenacity import retry, stop_after_attempt, wait_exponential
import httpx
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.models import (
    MarketDataPrice, FxRate, Company, CompanyMetrics,
    SourceRegistry, SourceStatus
)

from flows.company_universe_flow import asx_company_universe_sync_flow


# =============================================================================
# Configuration
# =============================================================================

class ETLConfig:
    """ETL pipeline configuration."""
    
    # Market Data Sources (examples - use licensed APIs in production)
    MARKET_DATA_SOURCES = {
        "tsx": {
            "name": "TSX Market Data",
            "type": "api",
            "url": "https://api.tmxmoney.com/v1",  # Example
            "rate_limit": 60,
        },
        "asx": {
            "name": "ASX Market Data", 
            "type": "api",
            "url": "https://api.asx.com.au/v1",  # Example
            "rate_limit": 30,
        },
    }
    
    # FX Data Source
    FX_SOURCE = {
        "name": "Exchange Rate API",
        "type": "api",
        "url": settings.FX_API_URL,
    }
    
    # Batch sizes
    PRICE_BATCH_SIZE = 100
    METRIC_BATCH_SIZE = 50


# =============================================================================
# Utility Tasks
# =============================================================================

@task(name="get_or_create_source", cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=1))
async def get_or_create_source(
    name: str,
    source_type: str,
    url: Optional[str] = None,
    license_info: Optional[str] = None
) -> int:
    """Get or create a source registry entry and return its ID."""
    logger = get_run_logger()
    
    async with AsyncSessionLocal() as db:
        # Check if source exists
        query = select(SourceRegistry).where(SourceRegistry.name == name)
        result = await db.execute(query)
        source = result.scalar_one_or_none()
        
        if source:
            return source.id
        
        # Create new source
        new_source = SourceRegistry(
            name=name,
            type=source_type,
            url=url,
            license=license_info,
            status=SourceStatus.ACTIVE
        )
        db.add(new_source)
        await db.commit()
        await db.refresh(new_source)
        
        logger.info(f"Created new source registry: {name}")
        return new_source.id


@task(name="update_source_status")
async def update_source_status(
    source_id: int,
    success: bool,
    error_message: Optional[str] = None
):
    """Update source status after ETL run."""
    async with AsyncSessionLocal() as db:
        if success:
            await db.execute(
                update(SourceRegistry)
                .where(SourceRegistry.id == source_id)
                .values(
                    status=SourceStatus.ACTIVE,
                    last_success=datetime.utcnow(),
                    error_count=0,
                    last_error=None
                )
            )
        else:
            await db.execute(
                update(SourceRegistry)
                .where(SourceRegistry.id == source_id)
                .values(
                    status=SourceStatus.ERROR,
                    last_error=error_message,
                    error_count=SourceRegistry.error_count + 1
                )
            )
        await db.commit()


# =============================================================================
# Market Data ETL
# =============================================================================

@task(name="fetch_market_prices", retries=3, retry_delay_seconds=60)
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=60))
async def fetch_market_prices(
    tickers: List[str],
    exchange: str,
    source_config: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Fetch market prices from exchange API.
    
    In production, replace with actual API calls to licensed data providers.
    """
    logger = get_run_logger()
    logger.info(f"Fetching prices for {len(tickers)} tickers from {exchange}")
    
    prices = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for ticker in tickers:
            try:
                # Example API call structure - replace with actual API
                # response = await client.get(
                #     f"{source_config['url']}/quotes/{ticker}",
                #     headers={"Authorization": f"Bearer {api_key}"}
                # )
                # data = response.json()
                
                # Placeholder - in production, parse actual API response
                prices.append({
                    "ticker": ticker,
                    "exchange": exchange,
                    "datetime": datetime.utcnow(),
                    "close": Decimal("0"),  # Replace with actual price
                    "volume": 0,
                    "currency": "CAD" if exchange == "TSX" else "AUD",
                })
                
            except Exception as e:
                logger.warning(f"Failed to fetch price for {ticker}: {e}")
                continue
    
    return prices


@task(name="store_market_prices")
async def store_market_prices(
    prices: List[Dict[str, Any]],
    source_id: int
) -> int:
    """Store market prices with upsert (idempotent)."""
    logger = get_run_logger()
    
    if not prices:
        return 0
    
    async with AsyncSessionLocal() as db:
        stored_count = 0
        
        for price in prices:
            stmt = insert(MarketDataPrice).values(
                ticker=price["ticker"],
                exchange=price["exchange"],
                datetime=price["datetime"],
                close=price["close"],
                volume=price.get("volume"),
                currency=price["currency"],
                source_id=source_id,
            ).on_conflict_do_update(
                index_elements=["ticker", "exchange", "datetime"],
                set_={
                    "close": price["close"],
                    "volume": price.get("volume"),
                    "source_id": source_id,
                }
            )
            await db.execute(stmt)
            stored_count += 1
        
        await db.commit()
        logger.info(f"Stored {stored_count} price records")
        return stored_count


@flow(name="market_data_etl", log_prints=True)
async def market_data_etl_flow(exchange: str = "TSX"):
    """
    Market data ETL flow.
    
    Fetches current prices for all active companies on the specified exchange.
    """
    logger = get_run_logger()
    logger.info(f"Starting market data ETL for {exchange}")
    
    source_config = ETLConfig.MARKET_DATA_SOURCES.get(exchange.lower(), {})
    
    # Get or create source
    source_id = await get_or_create_source(
        name=source_config.get("name", f"{exchange} Market Data"),
        source_type="api",
        url=source_config.get("url"),
    )
    
    try:
        # Get active companies for exchange
        async with AsyncSessionLocal() as db:
            query = select(Company.ticker).where(
                Company.exchange == exchange,
                Company.is_active == True
            )
            result = await db.execute(query)
            tickers = [row[0] for row in result.all()]
        
        if not tickers:
            logger.warning(f"No active companies found for {exchange}")
            return
        
        # Process in batches
        for i in range(0, len(tickers), ETLConfig.PRICE_BATCH_SIZE):
            batch = tickers[i:i + ETLConfig.PRICE_BATCH_SIZE]
            
            prices = await fetch_market_prices(batch, exchange, source_config)
            await store_market_prices(prices, source_id)
            
            # Rate limiting
            await asyncio.sleep(1)
        
        await update_source_status(source_id, success=True)
        logger.info(f"Market data ETL completed for {exchange}")
        
    except Exception as e:
        logger.error(f"Market data ETL failed: {e}")
        await update_source_status(source_id, success=False, error_message=str(e))
        raise


# =============================================================================
# FX Rate ETL
# =============================================================================

@task(name="fetch_fx_rates", retries=3, retry_delay_seconds=30)
async def fetch_fx_rates(base_currency: str = "USD") -> Dict[str, float]:
    """Fetch current FX rates from API."""
    logger = get_run_logger()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{settings.FX_API_URL}/{base_currency}")
        response.raise_for_status()
        data = response.json()
        
        return data.get("rates", {})


@task(name="store_fx_rates")
async def store_fx_rates(
    rates: Dict[str, float],
    base_currency: str,
    source_id: int
) -> int:
    """Store FX rates with upsert."""
    logger = get_run_logger()
    
    today = datetime.utcnow().date()
    stored_count = 0
    
    # Currencies we care about
    target_currencies = ["CAD", "AUD", "ZAR", "GBP", "EUR", "MXN", "BRL", "CLP"]
    
    async with AsyncSessionLocal() as db:
        for currency, rate in rates.items():
            if currency not in target_currencies:
                continue
            
            stmt = insert(FxRate).values(
                date=today,
                base_currency=base_currency,
                quote_currency=currency,
                rate=Decimal(str(rate)),
                source_id=source_id,
            ).on_conflict_do_update(
                index_elements=["date", "base_currency", "quote_currency"],
                set_={
                    "rate": Decimal(str(rate)),
                    "source_id": source_id,
                }
            )
            await db.execute(stmt)
            stored_count += 1
        
        await db.commit()
    
    logger.info(f"Stored {stored_count} FX rates")
    return stored_count


@flow(name="fx_rate_etl", log_prints=True)
async def fx_rate_etl_flow():
    """FX rate ETL flow."""
    logger = get_run_logger()
    logger.info("Starting FX rate ETL")
    
    source_id = await get_or_create_source(
        name="Exchange Rate API",
        source_type="api",
        url=settings.FX_API_URL,
        license_info="Free tier"
    )
    
    try:
        rates = await fetch_fx_rates("USD")
        await store_fx_rates(rates, "USD", source_id)
        
        await update_source_status(source_id, success=True)
        logger.info("FX rate ETL completed")
        
    except Exception as e:
        logger.error(f"FX rate ETL failed: {e}")
        await update_source_status(source_id, success=False, error_message=str(e))
        raise


# =============================================================================
# Metrics Calculation ETL
# =============================================================================

@task(name="calculate_company_metrics")
async def calculate_company_metrics(company_id: int, source_id: int) -> Optional[Dict]:
    """
    Calculate derived metrics for a company.
    
    Metrics calculated:
    - Market cap (in USD)
    - Enterprise value
    - EV per AuEq oz
    - Total AuEq resources
    """
    from app.utils.commodity_equivalence import CommodityEquivalenceCalculator
    
    logger = get_run_logger()
    calc = CommodityEquivalenceCalculator()
    
    async with AsyncSessionLocal() as db:
        # Get company
        company_query = select(Company).where(Company.id == company_id)
        company_result = await db.execute(company_query)
        company = company_result.scalar_one_or_none()
        
        if not company:
            return None
        
        # Get latest price
        price_query = (
            select(MarketDataPrice)
            .where(
                MarketDataPrice.ticker == company.ticker,
                MarketDataPrice.exchange == company.exchange
            )
            .order_by(MarketDataPrice.datetime.desc())
            .limit(1)
        )
        price_result = await db.execute(price_query)
        price_data = price_result.scalar_one_or_none()
        
        if not price_data:
            return None
        
        # Get FX rate if needed
        fx_rate = Decimal("1.0")
        if price_data.currency != "USD":
            fx_query = (
                select(FxRate)
                .where(
                    FxRate.base_currency == "USD",
                    FxRate.quote_currency == price_data.currency
                )
                .order_by(FxRate.date.desc())
                .limit(1)
            )
            fx_result = await db.execute(fx_query)
            fx_data = fx_result.scalar_one_or_none()
            if fx_data:
                fx_rate = fx_data.rate
        
        # Calculate USD price
        price_usd = price_data.close / fx_rate if fx_rate else price_data.close
        
        # Get previous metrics for shares outstanding
        prev_metrics_query = (
            select(CompanyMetrics)
            .where(CompanyMetrics.company_id == company_id)
            .order_by(CompanyMetrics.date.desc())
            .limit(1)
        )
        prev_result = await db.execute(prev_metrics_query)
        prev_metrics = prev_result.scalar_one_or_none()
        
        shares = prev_metrics.shares_outstanding if prev_metrics else 100_000_000  # Default
        cash = prev_metrics.cash_usd if prev_metrics else Decimal("0")
        debt = prev_metrics.debt_usd if prev_metrics else Decimal("0")
        
        # Calculate metrics
        market_cap = price_usd * shares
        ev = market_cap + debt - cash
        
        # Calculate total AuEq
        total_aueq = await calc.get_total_aueq_for_company(db, company_id)
        
        # EV per AuEq oz
        ev_per_aueq = ev / Decimal(str(total_aueq)) if total_aueq > 0 else None
        
        return {
            "company_id": company_id,
            "date": datetime.utcnow().date(),
            "market_cap_usd": market_cap,
            "enterprise_value_usd": ev,
            "cash_usd": cash,
            "debt_usd": debt,
            "shares_outstanding": shares,
            "total_aueq_oz": Decimal(str(total_aueq)) if total_aueq else None,
            "ev_per_aueq_oz": ev_per_aueq,
            "source_id": source_id,
        }


@task(name="store_company_metrics")
async def store_company_metrics(metrics: Dict[str, Any]) -> bool:
    """Store calculated metrics with upsert."""
    if not metrics:
        return False
    
    async with AsyncSessionLocal() as db:
        stmt = insert(CompanyMetrics).values(**metrics).on_conflict_do_update(
            index_elements=["company_id", "date"],
            set_={
                "market_cap_usd": metrics["market_cap_usd"],
                "enterprise_value_usd": metrics["enterprise_value_usd"],
                "total_aueq_oz": metrics["total_aueq_oz"],
                "ev_per_aueq_oz": metrics["ev_per_aueq_oz"],
                "source_id": metrics["source_id"],
            }
        )
        await db.execute(stmt)
        await db.commit()
        return True


@flow(name="metrics_calculation_etl", log_prints=True)
async def metrics_calculation_flow():
    """Calculate and store metrics for all active companies."""
    logger = get_run_logger()
    logger.info("Starting metrics calculation ETL")
    
    source_id = await get_or_create_source(
        name="InvestOre Calculated Metrics",
        source_type="derived",
    )
    
    try:
        # Get all active companies
        async with AsyncSessionLocal() as db:
            query = select(Company.id).where(Company.is_active == True)
            result = await db.execute(query)
            company_ids = [row[0] for row in result.all()]
        
        success_count = 0
        for company_id in company_ids:
            metrics = await calculate_company_metrics(company_id, source_id)
            if metrics and await store_company_metrics(metrics):
                success_count += 1
        
        await update_source_status(source_id, success=True)
        logger.info(f"Metrics calculation completed: {success_count}/{len(company_ids)} companies")
        
    except Exception as e:
        logger.error(f"Metrics calculation failed: {e}")
        await update_source_status(source_id, success=False, error_message=str(e))
        raise


# =============================================================================
# Main Orchestration Flow
# =============================================================================

@flow(name="daily_etl_orchestration", log_prints=True)
async def daily_etl_flow():
    """
    Main daily ETL orchestration flow.
    
    Runs in sequence:
    1. FX rates (needed for currency conversion)
    2. Market data for each exchange
    3. Metrics calculation
    """
    logger = get_run_logger()
    logger.info("Starting daily ETL orchestration")
    
    # 0. Keep ASX mining universe up to date
    await asx_company_universe_sync_flow(concurrency=10)

    # 1. FX Rates first
    await fx_rate_etl_flow()
    
    # 2. Market data for each exchange
    for exchange in ["TSX", "ASX"]:
        await market_data_etl_flow(exchange=exchange)
    
    # 3. Calculate metrics
    await metrics_calculation_flow()
    
    logger.info("Daily ETL orchestration completed")


# =============================================================================
# Schedule Configuration
# =============================================================================

if __name__ == "__main__":
    # Run the daily flow
    asyncio.run(daily_etl_flow())
