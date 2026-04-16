# InvestOre Analytics — Full App Audit & Improvement Plan

**Scope:** Trading platform, data extraction / ETL, analysis pages, mock data, aesthetics.
**Style target:** Interactive Brokers TWS (professional, multi-panel, data-dense).
**Mock-data policy:** Replace with `N/A` text when no real data is available.

---

## 1. Executive Summary

| Area | State | Headline finding |
|------|-------|------------------|
| Trading platform | ~80% real | Watchlist page is fully mocked; debug endpoints expose synthetic trade generators |
| Data extraction / ETL | Runs reliably but heavily sampled | `[:30]` / `[:25]` slicing means <5% of TSX / NYSE universe is ever scanned |
| Analysis pages | 21 of 25 real | 3 fully-mocked pages (`exchanges`, `map`, `constraints`); 1 partially-mocked (`commodities`) |
| Mock data footprint | ~760 lines | 23 frontend + 47 backend instances |
| Aesthetics | Solid base | Inconsistent empty-state handling (`—`, `0`, `N/A` all used); fake `Math.random()` sparkline bars |

---

## 2. Critical mock-data to replace

### Frontend (highest impact)

| # | File | Issue |
|---|------|-------|
| 1 | `frontend/src/app/watchlist/page.tsx` L12–45 | 9 hardcoded tickers with fake prices (NGD $1.85, KGC $8.15, etc.) and fake % changes |
| 2 | `frontend/src/app/portfolio/page.tsx` L11 | Full hardcoded portfolio (NEM $42.85, FCX $41.30, ALB $98.45, BHP $62.15, CCJ $44.03) |
| 3 | `frontend/src/app/analysis/exchanges/page.tsx` L8–94, L113 | 8 exchanges + topPerformers with hardcoded market cap, volume, and % change |
| 4 | `frontend/src/app/analysis/map/page.tsx` L20–150 | 10 hardcoded project coordinates + 7 hardcoded constraint areas |
| 5 | `frontend/src/app/analysis/constraints/page.tsx` L25–250 | Duplicate of map constraints with extended metadata |
| 6 | `frontend/src/app/analysis/commodities/page.tsx` L23–76 | `fallbackCategories` with `companies: 0, change: 0` — shown when API fails |
| 7 | `frontend/src/app/analysis/commodities/page.tsx` L128 | `Math.random() * 100` for mini chart bars (changes on every render) |

### Backend

| # | File | Issue |
|---|------|-------|
| 1 | `backend/app/api/market.py` L308–370 | ~130 lines of synthetic OHLCV via `random.uniform` / `random.gauss` |
| 2 | `backend/app/api/market.py` L690–816 | ~120 lines generating synthetic commodity spot prices |
| 3 | `backend/app/api/market.py` L915–955 | Synthetic capital raisings (`random.uniform(2, 20) * 1_000_000`) |
| 4 | `backend/app/services/wa_dmirs.py` L335–482 | ~150 lines of fake geochemistry samples |
| 5 | `backend/app/api/trading.py` L1000–1150 | `POST /debug/generate-trades` — synthetic trade generator, no auth gating |
| 6 | `backend/app/api/gap_fill.py` L823–851 | Creates `placeholder_{sym}` PDF documents flagged `'placeholder', true` |
| 7 | `backend/app/api/etl.py` L117–150 | `SAMPLE_COMPANIES` / `SAMPLE_RESOURCES` seed data |

---

## 3. ETL / data-population gaps

| Exchange | Sampled | Universe | Coverage |
|---------|---------|----------|----------|
| ASX | 150 tickers hardcoded | ~2,000 | 7% |
| TSX/TSXV | **`[:30]`** | 2,000+ | <2% |
| JSE | `[:20]` | 60+ | 33% |
| LSE | `[:25]` | 80+ | 31% |
| NYSE | `[:25]` | 6,000+ | <1% |

Missing pipelines:
- **Real-time price fetcher** — `market_data_prices` table exists but is never populated by the scheduler.
- **SEDAR+ integration** — code exists but is never called.
- **USGS / Geoscience Australia** — referenced in docs, no fetcher active.
- **Exponential backoff** on 429/5xx — absent everywhere.
- **URL normalisation for dedup** — `mining.com`, `mining.com/`, `mining.com#section` stored as 3 rows.

---

## 4. Analysis-page UX issues

- Inconsistent empty-state symbols: `—`, `0`, `N/A` all used for the same "no data" meaning.
- `/analysis/commodities/` starts with `companies: 0` zero-filled fallback — if API fails the user sees "0 companies" for every commodity.
- Decorative sparkline uses `Math.random()` — gives users the impression of real volatility.
- `/analysis/map/` SVG has no mobile breakpoints.
- No error boundaries — a single bad data point crashes the whole page.

---

## 5. Aesthetic observations

- Theme (dark `bg-metallic-950`, `primary-500` teal, green buy / red sell) is coherent and should be preserved.
- Trading pages lack the dense, multi-panel feel of TWS: one wide KPI row + one table. Should move to 3-column grids (watchlist / positions / signals) on wide viewports.
- Dashboard "24/7 Data Updates" tile is hardcoded copy.
- Loading states are plain text — a skeleton loader would be a large perceived-performance win.

---

## 6. Fix order (by impact / effort ratio)

### Tier 1 — user-visible trust fixes (this PR)
1. Remove all hardcoded watchlist/portfolio/exchange/map/constraints data → show real data when available, `N/A` otherwise.
2. Remove `Math.random()` sparkline bars.
3. Normalise empty-state to `N/A` everywhere.
4. Gate `/debug/*` trading endpoints behind admin role.

### Tier 2 — aesthetic polish (this PR)
5. TWS-inspired dense multi-panel layout on `/trading` dashboard.
6. Skeleton loaders for tables and cards.
7. Consistent stat-card component with `N/A` handling.

### Tier 3 — data-quality (follow-up)
8. Remove `[:30]` / `[:25]` slicing in scheduler.
9. Activate market-data price fetcher.
10. Exponential backoff + URL normalisation.
11. Persistent extraction-health metrics.

### Tier 4 — pro features (future)
12. TradingView Lightweight Charts on position detail.
13. Short-position UI.
14. Portfolio heat-map / correlation matrix.
15. Webhook / email alerts.
