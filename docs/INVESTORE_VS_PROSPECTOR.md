# InvestOre Analytics vs Prospector Portal: Feature Comparison

## Executive Summary

**InvestOre Analytics** focuses on **exploration-stage companies** with automated data extraction from announcements, while **Prospector Portal** focuses on **producing companies** with comprehensive operational and financial data. The integration enhances InvestOre with Prospector-style data structures for companies that graduate from exploration to production.

---

## 🏆 What InvestOre Has That Prospector Doesn't

### 1. **AI-Powered Announcement Extraction (V1-V10 Pipeline)**
| Feature | Description |
|---------|-------------|
| Automated PDF parsing | Extracts drilling results, resources, reserves from ASX/TSX announcements |
| LLM validation | AI validates extracted data for accuracy |
| Sentiment analysis | Analyzes announcement sentiment (-1 to +1) |
| Real-time processing | Processes new announcements as they're released |

### 2. **Exploration-Focused Data**
- **Drilling campaigns** with hole-by-hole tracking
- **Assay results** with interval details
- **Tenement/claims** management with geometry
- **Infrastructure proximity** calculations (distance to port, rail, power)

### 3. **Geological Intelligence**
- **Deposit classification** (porphyry, VMS, SEDEX, orogenic, etc.)
- **Mineralization styles** and alteration types
- **Host rock** and structural controls
- **Orebody 3D models** (strike, dip, thickness)

### 4. **Geoscience Australia Integration**
- Live connection to government geological data
- Regional geology context
- Known mineral occurrences

### 5. **Peer Comparison Engine**
- Custom peer set building with saved filters
- EV/oz comparisons across commodities
- Multi-exchange normalization (AUD/CAD/USD)
- Resource-stage filtering

### 6. **Interactive Mapping**
- Project locations on map
- Infrastructure overlay
- Tenement boundaries
- Drill hole collar positions

---

## 🆕 What Prospector Integration Adds to InvestOre

### 1. **Life of Mine (LOM) Plans**
```
NEW TABLES: lom_mining, lom_processing, lom_capex, lom_cashflow
```
- Year-by-year production schedules
- Mining method details (sublevel stoping, block caving, etc.)
- Processing recovery rates by commodity
- Capex breakdown (initial, sustaining, closure)
- NPV waterfall data

### 2. **Production Tracking with Cost Metrics**
```
NEW TABLES: production_data, production_guidance
```
- Actual production vs guidance
- **Cash Costs** (co-product/by-product basis)
- **AISC** (All-in Sustaining Cost)
- **AIC** (All-in Cost)
- Quarterly/annual production history

### 3. **Full Financial Statements**
```
NEW TABLES: balance_sheets, income_statements, cashflow_statements
```
- Balance sheet components (assets, liabilities, equity)
- Income statement (revenue through EPS)
- Cash flow statement (operating, investing, financing)
- Mining-specific items (reclamation liabilities, mineral properties)

### 4. **Management & People Data**
```
NEW TABLES: company_people, person_positions
```
- Executive biographies
- Compensation tracking
- Board committee memberships
- Career history

### 5. **Royalty Tracking**
```
NEW TABLE: project_royalties
```
- NSR, GRR, NPI, streaming agreements
- Royalty holder identification
- Buyback options
- Commodity coverage

### 6. **Institutional Ownership**
```
NEW TABLE: ownership_records
```
- 13F filings tracking
- Insider transactions
- Strategic investors
- Ownership changes over time

### 7. **Filing Categorization** (Prospector's 18 categories)
```
NEW TABLE: filing_documents
```
Categories: drilling_results, resource_estimate, reserve_estimate, technical_report, PEA, PFS, FS, quarterly_report, annual_report, earnings, guidance, production_results, M&A, financing, management_change, regulatory, ESG, other

### 8. **Stock Performance Tracking**
```
NEW TABLE: stock_price_history
```
- OHLCV data
- Adjusted prices
- Daily returns
- Value traded

---

## 📊 Side-by-Side Comparison

| Feature | InvestOre | Prospector | After Integration |
|---------|-----------|------------|-------------------|
| **Exchanges Covered** | ASX, TSX, CSE | ASX, TSX, TSXV, NYSE, JSE, LSE, CSE | ✅ Same as Prospector |
| **Company Focus** | Exploration → Development | Development → Production | ✅ Full lifecycle |
| **Announcement Parsing** | ✅ Automated AI | ❌ Manual | ✅ Automated |
| **Drilling Data** | ✅ Detailed campaigns | ✅ Highlight intercepts | ✅ Both |
| **Resource Estimates** | ✅ JORC/NI 43-101 | ✅ Multi-standard | ✅ Enhanced |
| **Reserve Estimates** | ✅ Basic | ✅ Detailed | ✅ Detailed |
| **Production Data** | ❌ Limited | ✅ With AISC | ✅ Full cost metrics |
| **Financial Statements** | ❌ Basic metrics | ✅ Full statements | ✅ Full statements |
| **Life of Mine Plans** | ❌ | ✅ Detailed | ✅ Detailed |
| **People/Management** | ❌ | ✅ With compensation | ✅ With compensation |
| **Royalties** | ❌ | ✅ Tracked | ✅ Tracked |
| **Ownership** | ❌ | ✅ 13F tracking | ✅ 13F tracking |
| **Geology Types** | ✅ Detailed | ❌ Limited | ✅ Detailed |
| **Infrastructure Distance** | ✅ Calculated | ❌ | ✅ Calculated |
| **Geoscience Gov Data** | ✅ Integrated | ❌ | ✅ Integrated |
| **Tenement Tracking** | ✅ With geometry | ❌ Limited | ✅ With geometry |
| **Peer Comparison** | ✅ EV/oz engine | ✅ Basic | ✅ Advanced |
| **Sentiment Analysis** | ✅ AI-powered | ❌ | ✅ AI-powered |
| **Interactive Maps** | ✅ | ✅ | ✅ |

---

## 🔄 Integration Strategy

### Phase 1: Data Structure (COMPLETED)
- ✅ Prospector-style SQLAlchemy models
- ✅ Pydantic schemas for API
- ✅ API endpoints
- ✅ TypeScript types
- ✅ SQL migration script

### Phase 2: Data Population (NEXT)
1. **Drilling highlights** - Extract from existing announcement parsing
2. **Production data** - Pull from financial reports for producing companies
3. **Filing categorization** - Auto-categorize existing announcements
4. **Financial statements** - Scrape from ASX/TSX/SEC filings

### Phase 3: Frontend Components
1. Production/cost charts with AISC trends
2. Financial statement views
3. LOM visualization
4. Management team profiles
5. Ownership breakdown charts

---

## 🎯 Target User Profiles

| Profile | Primary Platform | Why |
|---------|------------------|-----|
| **Exploration Investor** | InvestOre | AI extraction, geology focus, early-stage screening |
| **Production Investor** | Both | Cost metrics, production trends, financial analysis |
| **Royalty Analyst** | InvestOre + Prospector | Royalty tracking, exposure analysis |
| **Institutional Analyst** | Both | Full company lifecycle coverage |
| **Geologist** | InvestOre | Deposit classification, drilling details, geology data |

---

## 💡 Unique InvestOre Value Propositions

1. **"From Announcement to Database in Seconds"**
   - No other platform automatically extracts structured data from PDF announcements

2. **"Geology-First Analysis"**
   - Deposit type classification enables peer comparison by geological model

3. **"Infrastructure Intelligence"**
   - Know how far a project is from nearest port, rail, power before anyone else

4. **"Government Data Integration"**
   - Geoscience Australia data provides regional context

5. **"Explorer to Producer Tracking"**
   - Now with Prospector models, track companies through their entire lifecycle

---

## 📈 Future Enhancements

With the Prospector models in place, InvestOre can now:

1. **Compare production costs** across peer sets
2. **Track cost curve positions** (quartile analysis)
3. **Model company transitions** from explorer to producer
4. **Alert on material filings** by category
5. **Analyze institutional ownership changes**
6. **Track management team movements** across companies
