# ASX Company Universe Expansion

## Overview

This document describes the expanded ASX company coverage implemented to grow the platform from ~170 ASX companies to **890+ ASX mining and exploration companies**.

## Problem Statement

The original static company list contained only 170 ASX companies, while the ASX hosts **670+ mining and exploration companies**. This limited the platform's utility for comprehensive mining sector analysis.

## Solution Architecture

### 1. ASX Discovery API

Discovered the ASX Research API endpoint for company directory:

```
GET https://asx.api.markitdigital.com/asx-research/1.0/companies/directory
```

Returns paginated list of all 1,857+ ASX-listed companies with:
- Symbol
- Company name
- Sector/Industry classification
- Market cap
- Last trade price

### 2. Mining Company Classification

Companies are classified as mining/exploration based on:
1. **Sector filter**: Materials & Energy sectors (~893 candidates)
2. **Keyword scoring**: Mining-related terms in company descriptions
3. **Manual validation**: Edge cases reviewed

Keywords used for classification:
- Mining, mineral, exploration, ore, mine, deposit
- Gold, silver, copper, lithium, nickel, iron, zinc, lead
- Drill, resource, reserve, prospective, tenement, claims

### 3. Data Integration

The discovered companies are stored in:
- `backend/app/data/asx_discovered.py` - Static dictionary of 856 companies
- `etl/flows/company_universe_flow.py` - Prefect flow for database sync

## Files Changed

### New Files

| File | Description |
|------|-------------|
| `backend/app/data/asx_discovered.py` | Auto-generated dictionary of 856 ASX companies |
| `backend/scripts/discover_asx_universe.py` | Standalone discovery script |
| `etl/flows/company_universe_flow.py` | Prefect ETL flow for ongoing sync |

### Modified Files

| File | Changes |
|------|---------|
| `backend/app/data/companies.py` | Added import of `ASX_DISCOVERED` into `ALL_COMPANIES` |
| `backend/app/services/asx.py` | Dynamic ticker building from `ALL_COMPANIES` |
| `frontend/src/app/analysis/page.tsx` | Dynamic stats fetched from API |
| `README.md` | Updated company coverage documentation |
| `Makefile` | Added `etl-asx-universe` target |

## Company Counts

### Before Expansion
```
Total: 314 companies
ASX: 170
TSX/TSXV: 66
JSE: 29
CSE: 40
US: 25
LSE: 15
```

### After Expansion
```
Total: 1,065 companies
ASX: 890 (+720)
TSX/TSXV: 66
JSE: 29
CSE: 40
US: 25
LSE: 15
```

## Frontend Integration

The frontend fetches company data dynamically from:

1. **`/api/v1/spatial/summary`** - Total counts, by-exchange breakdown
2. **`/api/v1/spatial/exchanges`** - Exchange summaries with company counts
3. **`/api/v1/spatial/geojson`** - GeoJSON for map visualization
4. **`/api/v1/spatial/companies`** - Paginated company list

All endpoints now serve the expanded 1,065+ companies.

## Running the Discovery

### Manual Discovery Script

```bash
cd backend/scripts
python discover_asx_universe.py
```

Outputs:
- `asx_discovered_companies.json` - Full JSON export
- `asx_discovered.py` - Python code to copy to app/data/

### ETL Flow (Database Sync)

```bash
# Using Make
make etl-asx-universe

# Or directly with Prefect
cd etl
python -c "from flows.company_universe_flow import asx_company_universe_sync_flow; asx_company_universe_sync_flow()"
```

## API Data Flow

```
ASX Directory API → Discovery Script → asx_discovered.py
                                            ↓
                                      ALL_COMPANIES
                                            ↓
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            /spatial/geojson      /spatial/exchanges      /market/mining/tickers
                    ↓                       ↓                       ↓
                Global Map          Exchange Cards          Ticker Lists
```

## Future Improvements

1. **Scheduled Sync**: Run discovery weekly via Prefect scheduler
2. **Database-First**: Migrate from static file to database as source of truth
3. **Other Exchanges**: Apply same discovery pattern to TSX, LSE
4. **Coordinates**: Enrich companies with lat/long from project locations

## Verification

```bash
cd backend
python count_companies.py
```

Expected output:
```
Total companies: 1065
ASX: 890
TSX/TSXV: 66
JSE: 29
CSE: 40
US: 25
LSE: 15
```
