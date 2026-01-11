-- =============================================================================
-- UNIFIED SCHEMA INTEGRATION: Prospector + Extraction Tables
-- =============================================================================
-- This script:
-- 1. Adds 'exchange' column to all extraction tables
-- 2. Creates only NEW Prospector tables that don't overlap with existing
-- 3. Maps overlapping concepts to avoid data duplication
--
-- TABLE MAPPING:
-- ================================================================================
-- PROSPECTOR TABLE              | EXISTING TABLE                | ACTION
-- ================================================================================
-- production_data               | extracted_production_estimates| EXTEND existing
-- production_guidance           | extracted_guidance            | EXTEND existing
-- drill_highlight_intercepts    | extracted_drill_intercepts    | EXTEND existing
-- project_royalties             | extracted_royalties           | EXTEND existing
-- ownership_records             | extracted_substantial_holders | EXTEND existing
-- filing_documents              | extracted_pdf_documents       | USE existing
-- ================================================================================
-- lom_mining                    | -                             | NEW (unique)
-- lom_processing                | -                             | NEW (unique)
-- lom_capex                     | -                             | NEW (unique)
-- lom_cashflow                  | -                             | NEW (unique)
-- balance_sheets                | -                             | NEW (unique)
-- income_statements             | -                             | NEW (unique)
-- cashflow_statements           | -                             | NEW (unique)
-- company_people                | -                             | NEW (unique)
-- person_positions              | -                             | NEW (unique)
-- stock_price_history           | -                             | NEW (unique)
-- project_startup_dates         | -                             | NEW (unique)
-- ================================================================================

-- =============================================================================
-- PART 1: ADD EXCHANGE COLUMN TO ALL EXISTING EXTRACTION TABLES
-- =============================================================================

-- Core extraction tables
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_projects ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_areas ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_ore_reserves ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_permits ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_study_findings ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_ebitda_profiles ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);

-- Drilling tables
ALTER TABLE extracted_drilling_results ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);

-- Capital & finance tables  
ALTER TABLE extracted_capital_raisings ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_debt_facilities ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_strategic_deals ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_director_dealings ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_catalysts ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_guidance ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);

-- Other extraction tables
ALTER TABLE extracted_infrastructure ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_esg_metrics ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);
ALTER TABLE extracted_byproducts ADD COLUMN IF NOT EXISTS exchange VARCHAR(20);

-- Create indexes on exchange columns
CREATE INDEX IF NOT EXISTS idx_pdf_docs_exchange ON extracted_pdf_documents(exchange);
CREATE INDEX IF NOT EXISTS idx_projects_exchange ON extracted_projects(exchange);
CREATE INDEX IF NOT EXISTS idx_resources_exchange ON extracted_resource_estimates(exchange);
CREATE INDEX IF NOT EXISTS idx_reserves_exchange ON extracted_ore_reserves(exchange);
CREATE INDEX IF NOT EXISTS idx_drilling_exchange ON extracted_drilling_results(exchange);
CREATE INDEX IF NOT EXISTS idx_intercepts_exchange ON extracted_drill_intercepts(exchange);
CREATE INDEX IF NOT EXISTS idx_economics_exchange ON extracted_economics(exchange);
CREATE INDEX IF NOT EXISTS idx_capital_exchange ON extracted_capital_raisings(exchange);

-- =============================================================================
-- PART 2: POPULATE EXCHANGE FROM SYMBOL PREFIX
-- =============================================================================

-- ASX symbols are typically 3 characters
UPDATE extracted_pdf_documents SET exchange = 'ASX' 
WHERE exchange IS NULL AND LENGTH(symbol) = 3 AND symbol ~ '^[A-Z]{3}$';

-- TSX symbols can have .TO suffix or be 1-4 chars
UPDATE extracted_pdf_documents SET exchange = 'TSX' 
WHERE exchange IS NULL AND (symbol LIKE '%.TO' OR symbol LIKE '%.V');

-- JSE symbols
UPDATE extracted_pdf_documents SET exchange = 'JSE' 
WHERE exchange IS NULL AND symbol LIKE '%.JO';

-- NYSE/NASDAQ (longer symbols)
UPDATE extracted_pdf_documents SET exchange = 'NYSE' 
WHERE exchange IS NULL AND LENGTH(symbol) >= 4 AND symbol ~ '^[A-Z]{4,5}$';

-- Propagate exchange to other tables from document
UPDATE extracted_projects ep
SET exchange = epd.exchange
FROM extracted_pdf_documents epd
WHERE ep.document_id = epd.document_id
AND ep.exchange IS NULL AND epd.exchange IS NOT NULL;

UPDATE extracted_resource_estimates ere
SET exchange = epd.exchange
FROM extracted_pdf_documents epd
WHERE ere.document_id = epd.document_id
AND ere.exchange IS NULL AND epd.exchange IS NOT NULL;

UPDATE extracted_ore_reserves eor
SET exchange = epd.exchange
FROM extracted_pdf_documents epd
WHERE eor.document_id = epd.document_id
AND eor.exchange IS NULL AND epd.exchange IS NOT NULL;

UPDATE extracted_drilling_results edr
SET exchange = epd.exchange
FROM extracted_pdf_documents epd
WHERE edr.document_id = epd.document_id
AND edr.exchange IS NULL AND epd.exchange IS NOT NULL;

UPDATE extracted_economics ee
SET exchange = epd.exchange
FROM extracted_pdf_documents epd
WHERE ee.document_id = epd.document_id
AND ee.exchange IS NULL AND epd.exchange IS NOT NULL;

-- =============================================================================
-- PART 3: EXTEND EXISTING TABLES WITH PROSPECTOR-STYLE COLUMNS
-- =============================================================================

-- extracted_production_estimates - add cost metrics (like production_data)
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS period_type VARCHAR(20);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS period_end DATE;
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS cash_cost_per_oz NUMERIC(12, 4);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS aisc_per_oz NUMERIC(12, 4);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS head_grade NUMERIC(12, 6);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS mill_recovery_pct NUMERIC(5, 2);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS revenue_usd NUMERIC(20, 2);

-- extracted_guidance - add more guidance fields
ALTER TABLE extracted_guidance ADD COLUMN IF NOT EXISTS capex_low_usd NUMERIC(20, 2);
ALTER TABLE extracted_guidance ADD COLUMN IF NOT EXISTS capex_high_usd NUMERIC(20, 2);
ALTER TABLE extracted_guidance ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT TRUE;
ALTER TABLE extracted_guidance ADD COLUMN IF NOT EXISTS revision_number INTEGER DEFAULT 0;

-- extracted_drill_intercepts - add coordinates and highlight fields
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS latitude NUMERIC(12, 8);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS longitude NUMERIC(12, 8);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS azimuth NUMERIC(5, 2);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS dip NUMERIC(5, 2);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN DEFAULT FALSE;
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS highlight_reason TEXT;
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS grade_thickness NUMERIC(12, 4);

-- extracted_royalties - add holder details
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS royalty_holder_ticker VARCHAR(20);
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS royalty_holder_exchange VARCHAR(20);
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS buyback_option BOOLEAN DEFAULT FALSE;
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS buyback_price NUMERIC(20, 2);
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS effective_date DATE;
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- extracted_substantial_holders - add more ownership fields
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS holder_ticker VARCHAR(20);
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS holder_exchange VARCHAR(20);
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS market_value_usd NUMERIC(20, 2);
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS is_beneficial_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS is_insider BOOLEAN DEFAULT FALSE;
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS as_of_date DATE;
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS filing_type VARCHAR(50);
ALTER TABLE extracted_substantial_holders ADD COLUMN IF NOT EXISTS filing_url VARCHAR(500);

-- =============================================================================
-- PART 4: CREATE NEW PROSPECTOR-ONLY TABLES (No Overlap)
-- =============================================================================

-- Enums for new tables
DO $$ BEGIN
    CREATE TYPE reporting_standard AS ENUM (
        'jorc', 'ni_43_101', 'sk_1300', 'samrec', 'cim', 'sec', 'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE mining_method_detail AS ENUM (
        'open_pit', 'underground_longwall', 'underground_room_and_pillar',
        'underground_cut_and_fill', 'underground_block_caving', 'underground_sublevel_stoping',
        'surface_strip', 'dredging', 'in_situ_recovery', 'heap_leach', 'placer', 'combined'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE processing_method_detail AS ENUM (
        'flotation', 'gravity', 'cyanide_leach', 'heap_leach', 'bioleaching',
        'autoclave', 'roasting', 'smelting', 'electrowinning', 'solvent_extraction',
        'magnetic_separation', 'dense_media_separation', 'acid_leach', 'combined'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE financial_period_type AS ENUM (
        'annual', 'semi_annual', 'quarterly', 'monthly', 'ytd'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4.1 Life of Mine Mining Schedule
CREATE TABLE IF NOT EXISTS lom_mining (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    project_name VARCHAR(255),
    announcement_date DATE,
    
    year INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    
    mining_method mining_method_detail,
    ore_mined_kt NUMERIC(20, 2),
    waste_mined_kt NUMERIC(20, 2),
    strip_ratio NUMERIC(10, 4),
    total_material_kt NUMERIC(20, 2),
    
    grades_json JSONB DEFAULT '{}',
    ore_processed_kt NUMERIC(20, 2),
    recovery_rates_json JSONB DEFAULT '{}',
    metal_produced_json JSONB DEFAULT '{}',
    
    reporting_standard reporting_standard,
    report_date DATE,
    notes TEXT,
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name, year)
);

CREATE INDEX IF NOT EXISTS idx_lom_mining_symbol ON lom_mining(symbol);
CREATE INDEX IF NOT EXISTS idx_lom_mining_exchange ON lom_mining(exchange);

-- 4.2 Life of Mine Processing
CREATE TABLE IF NOT EXISTS lom_processing (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    project_name VARCHAR(255),
    announcement_date DATE,
    
    year INTEGER NOT NULL,
    processing_method processing_method_detail,
    throughput_ktpa NUMERIC(20, 2),
    mill_utilization_pct NUMERIC(5, 2),
    recovery_rates_json JSONB DEFAULT '{}',
    processing_cost_per_tonne NUMERIC(12, 4),
    
    extraction_confidence FLOAT DEFAULT 0.8,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name, year)
);

CREATE INDEX IF NOT EXISTS idx_lom_processing_symbol ON lom_processing(symbol);
CREATE INDEX IF NOT EXISTS idx_lom_processing_exchange ON lom_processing(exchange);

-- 4.3 Life of Mine CAPEX
CREATE TABLE IF NOT EXISTS lom_capex (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    project_name VARCHAR(255),
    announcement_date DATE,
    
    year INTEGER NOT NULL,
    initial_capex_usd NUMERIC(20, 2),
    sustaining_capex_usd NUMERIC(20, 2),
    expansion_capex_usd NUMERIC(20, 2),
    closure_capex_usd NUMERIC(20, 2),
    total_capex_usd NUMERIC(20, 2),
    capex_breakdown_json JSONB DEFAULT '{}',
    
    currency VARCHAR(3) DEFAULT 'USD',
    extraction_confidence FLOAT DEFAULT 0.8,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name, year)
);

CREATE INDEX IF NOT EXISTS idx_lom_capex_symbol ON lom_capex(symbol);
CREATE INDEX IF NOT EXISTS idx_lom_capex_exchange ON lom_capex(exchange);

-- 4.4 Life of Mine Cashflow
CREATE TABLE IF NOT EXISTS lom_cashflow (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    project_name VARCHAR(255),
    announcement_date DATE,
    
    year INTEGER NOT NULL,
    gross_revenue_usd NUMERIC(20, 2),
    net_smelter_return_usd NUMERIC(20, 2),
    operating_costs_usd NUMERIC(20, 2),
    royalties_usd NUMERIC(20, 2),
    ebitda_usd NUMERIC(20, 2),
    taxes_usd NUMERIC(20, 2),
    capex_usd NUMERIC(20, 2),
    free_cash_flow_usd NUMERIC(20, 2),
    cumulative_fcf_usd NUMERIC(20, 2),
    discounted_fcf_usd NUMERIC(20, 2),
    discount_rate NUMERIC(5, 2),
    commodity_prices_json JSONB DEFAULT '{}',
    
    currency VARCHAR(3) DEFAULT 'USD',
    extraction_confidence FLOAT DEFAULT 0.8,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name, year)
);

CREATE INDEX IF NOT EXISTS idx_lom_cashflow_symbol ON lom_cashflow(symbol);
CREATE INDEX IF NOT EXISTS idx_lom_cashflow_exchange ON lom_cashflow(exchange);

-- 4.5 Balance Sheets
CREATE TABLE IF NOT EXISTS balance_sheets (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    announcement_date DATE,
    
    period_type financial_period_type NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    -- Assets
    cash_and_equivalents NUMERIC(20, 2),
    total_current_assets NUMERIC(20, 2),
    ppe_net NUMERIC(20, 2),
    mineral_properties NUMERIC(20, 2),
    total_non_current_assets NUMERIC(20, 2),
    total_assets NUMERIC(20, 2),
    
    -- Liabilities
    total_current_liabilities NUMERIC(20, 2),
    long_term_debt NUMERIC(20, 2),
    total_non_current_liabilities NUMERIC(20, 2),
    total_liabilities NUMERIC(20, 2),
    
    -- Equity
    share_capital NUMERIC(20, 2),
    retained_earnings NUMERIC(20, 2),
    total_equity NUMERIC(20, 2),
    shares_outstanding BIGINT,
    
    currency VARCHAR(3) DEFAULT 'USD',
    reporting_standard reporting_standard,
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, period_end_date)
);

CREATE INDEX IF NOT EXISTS idx_balance_symbol ON balance_sheets(symbol);
CREATE INDEX IF NOT EXISTS idx_balance_exchange ON balance_sheets(exchange);
CREATE INDEX IF NOT EXISTS idx_balance_date ON balance_sheets(period_end_date);

-- 4.6 Income Statements
CREATE TABLE IF NOT EXISTS income_statements (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    announcement_date DATE,
    
    period_type financial_period_type NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    revenue NUMERIC(20, 2),
    cost_of_sales NUMERIC(20, 2),
    gross_profit NUMERIC(20, 2),
    total_operating_expenses NUMERIC(20, 2),
    operating_income NUMERIC(20, 2),
    income_before_tax NUMERIC(20, 2),
    net_income NUMERIC(20, 2),
    basic_eps NUMERIC(12, 4),
    diluted_eps NUMERIC(12, 4),
    
    currency VARCHAR(3) DEFAULT 'USD',
    reporting_standard reporting_standard,
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, period_start_date, period_end_date)
);

CREATE INDEX IF NOT EXISTS idx_income_symbol ON income_statements(symbol);
CREATE INDEX IF NOT EXISTS idx_income_exchange ON income_statements(exchange);

-- 4.7 Cashflow Statements
CREATE TABLE IF NOT EXISTS cashflow_statements (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    announcement_date DATE,
    
    period_type financial_period_type NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    cash_from_operations NUMERIC(20, 2),
    cash_from_investing NUMERIC(20, 2),
    cash_from_financing NUMERIC(20, 2),
    net_change_in_cash NUMERIC(20, 2),
    beginning_cash NUMERIC(20, 2),
    ending_cash NUMERIC(20, 2),
    free_cash_flow NUMERIC(20, 2),
    
    currency VARCHAR(3) DEFAULT 'USD',
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, period_start_date, period_end_date)
);

CREATE INDEX IF NOT EXISTS idx_cashflow_symbol ON cashflow_statements(symbol);
CREATE INDEX IF NOT EXISTS idx_cashflow_exchange ON cashflow_statements(exchange);

-- 4.8 Company People
CREATE TABLE IF NOT EXISTS company_people (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    announcement_date DATE,
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    title VARCHAR(255),
    position_type VARCHAR(50),
    
    biography TEXT,
    years_experience INTEGER,
    
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, full_name, title)
);

CREATE INDEX IF NOT EXISTS idx_people_symbol ON company_people(symbol);
CREATE INDEX IF NOT EXISTS idx_people_exchange ON company_people(exchange);

-- 4.9 Stock Price History
CREATE TABLE IF NOT EXISTS stock_price_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    
    trade_date DATE NOT NULL,
    open_price NUMERIC(12, 4),
    high_price NUMERIC(12, 4),
    low_price NUMERIC(12, 4),
    close_price NUMERIC(12, 4) NOT NULL,
    adjusted_close NUMERIC(12, 4),
    volume BIGINT,
    value_traded NUMERIC(20, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    daily_return NUMERIC(10, 6),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_stock_symbol ON stock_price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_exchange ON stock_price_history(exchange);
CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_price_history(trade_date);

-- 4.10 Project Startup/Milestone Dates
CREATE TABLE IF NOT EXISTS project_milestones (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(20),
    project_name VARCHAR(255) NOT NULL,
    announcement_date DATE,
    
    discovery_date DATE,
    first_resource_date DATE,
    first_reserve_date DATE,
    construction_start_date DATE,
    first_production_date DATE,
    commercial_production_date DATE,
    
    planned_construction_start DATE,
    planned_first_production DATE,
    planned_commercial_production DATE,
    
    extraction_confidence FLOAT DEFAULT 0.8,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name)
);

CREATE INDEX IF NOT EXISTS idx_milestones_symbol ON project_milestones(symbol);
CREATE INDEX IF NOT EXISTS idx_milestones_exchange ON project_milestones(exchange);

-- =============================================================================
-- PART 5: SUMMARY
-- =============================================================================

SELECT 'Unified schema integration complete!' as status;

-- Summary of changes:
-- 1. Added 'exchange' column to 24 extraction tables
-- 2. Extended 5 existing tables with Prospector-style columns
-- 3. Created 10 NEW tables (unique to Prospector):
--    - lom_mining
--    - lom_processing
--    - lom_capex
--    - lom_cashflow
--    - balance_sheets
--    - income_statements
--    - cashflow_statements
--    - company_people
--    - stock_price_history
--    - project_milestones
