-- =============================================================================
-- InvestOre Analytics - Prospector Portal Style Data Models
-- Migration Script
-- 
-- Creates tables for comprehensive mining data coverage inspired by 
-- Prospector Portal: Life of Mine plans, Production, Financials, People,
-- Drilling highlights, Royalties, Ownership, Filings, and Stock history
-- =============================================================================

-- Enums
DO $$ BEGIN
    CREATE TYPE reporting_standard AS ENUM (
        'jorc', 'ni_43_101', 'sk_1300', 'samrec', 'cim', 'sec', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mining_method_detail AS ENUM (
        'open_pit', 'underground_longwall', 'underground_room_and_pillar',
        'underground_cut_and_fill', 'underground_block_caving', 'underground_sublevel_stoping',
        'surface_strip', 'dredging', 'in_situ_recovery', 'heap_leach', 'placer', 'combined'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_method_detail AS ENUM (
        'flotation', 'gravity', 'cyanide_leach', 'heap_leach', 'bioleaching',
        'autoclave', 'roasting', 'smelting', 'electrowinning', 'solvent_extraction',
        'magnetic_separation', 'dense_media_separation', 'acid_leach', 'combined'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE filing_category AS ENUM (
        'drilling_results', 'resource_estimate', 'reserve_estimate', 'technical_report',
        'preliminary_economic_assessment', 'prefeasibility_study', 'feasibility_study',
        'quarterly_report', 'annual_report', 'earnings', 'guidance', 'production_results',
        'merger_acquisition', 'financing', 'management_change', 'regulatory', 'esg', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE financial_period_type AS ENUM (
        'annual', 'semi_annual', 'quarterly', 'monthly', 'ytd'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cost_basis AS ENUM (
        'co_product', 'by_product'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =============================================================================
-- Life of Mine (LOM) Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS lom_mining (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Time period
    year INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    
    -- Mining parameters
    mining_method mining_method_detail,
    ore_mined_kt NUMERIC(20, 2),
    waste_mined_kt NUMERIC(20, 2),
    strip_ratio NUMERIC(10, 4),
    total_material_kt NUMERIC(20, 2),
    
    -- Grades by commodity (JSONB for flexibility)
    grades_json JSONB DEFAULT '{}',
    -- Example: {"Au": 1.5, "Ag": 15.0, "Cu": 0.5}
    
    -- Processing
    ore_processed_kt NUMERIC(20, 2),
    recovery_rates_json JSONB DEFAULT '{}',
    
    -- Produced metal
    metal_produced_json JSONB DEFAULT '{}',
    -- Example: {"Au_oz": 50000, "Ag_oz": 500000, "Cu_lbs": 10000000}
    
    -- Metadata
    reporting_standard reporting_standard,
    report_date DATE,
    source_document_id INTEGER,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, year)
);

CREATE INDEX idx_lom_mining_project ON lom_mining(project_id);
CREATE INDEX idx_lom_mining_year ON lom_mining(year);


CREATE TABLE IF NOT EXISTS lom_processing (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    processing_method processing_method_detail,
    
    -- Throughput
    throughput_ktpa NUMERIC(20, 2),
    mill_utilization_pct NUMERIC(5, 2),
    
    -- Recovery by commodity
    recovery_rates_json JSONB DEFAULT '{}',
    
    -- Operating costs
    processing_cost_per_tonne NUMERIC(12, 4),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, year)
);


CREATE TABLE IF NOT EXISTS lom_capex (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    
    -- Capital expenditure breakdown (USD)
    initial_capex_usd NUMERIC(20, 2),
    sustaining_capex_usd NUMERIC(20, 2),
    expansion_capex_usd NUMERIC(20, 2),
    closure_capex_usd NUMERIC(20, 2),
    total_capex_usd NUMERIC(20, 2),
    
    -- Category breakdown
    capex_breakdown_json JSONB DEFAULT '{}',
    -- Example: {"mining_fleet": 50000000, "processing_plant": 200000000, "infrastructure": 30000000}
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, year)
);


CREATE TABLE IF NOT EXISTS lom_cashflow (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    
    -- Revenue and costs
    gross_revenue_usd NUMERIC(20, 2),
    net_smelter_return_usd NUMERIC(20, 2),
    operating_costs_usd NUMERIC(20, 2),
    royalties_usd NUMERIC(20, 2),
    
    -- EBITDA and cashflow
    ebitda_usd NUMERIC(20, 2),
    taxes_usd NUMERIC(20, 2),
    capex_usd NUMERIC(20, 2),
    free_cash_flow_usd NUMERIC(20, 2),
    
    -- Cumulative
    cumulative_fcf_usd NUMERIC(20, 2),
    
    -- NPV contribution (discounted)
    discounted_fcf_usd NUMERIC(20, 2),
    discount_rate NUMERIC(5, 2),
    
    -- Assumptions
    commodity_prices_json JSONB DEFAULT '{}',
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, year)
);


-- =============================================================================
-- Production Data Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS production_data (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Period
    period_type financial_period_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    -- Production by commodity (JSONB for multi-commodity support)
    production_json JSONB DEFAULT '{}',
    -- Example: {"Au_oz": 50000, "Ag_oz": 500000, "Cu_lbs": 10000000}
    
    -- Cost metrics
    cost_basis cost_basis,
    cash_cost_per_oz NUMERIC(12, 4),
    aisc_per_oz NUMERIC(12, 4),  -- All-in Sustaining Cost
    aic_per_oz NUMERIC(12, 4),   -- All-in Cost
    
    -- Cost breakdown
    mining_cost NUMERIC(20, 2),
    processing_cost NUMERIC(20, 2),
    ga_cost NUMERIC(20, 2),
    sustaining_capex NUMERIC(20, 2),
    exploration_cost NUMERIC(20, 2),
    
    -- Recovery
    mill_recovery_pct NUMERIC(5, 2),
    head_grade NUMERIC(12, 6),
    head_grade_unit VARCHAR(20),
    
    -- Sales
    sales_volume_json JSONB DEFAULT '{}',
    realized_price_json JSONB DEFAULT '{}',
    revenue_usd NUMERIC(20, 2),
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    source_document_id INTEGER,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, project_id, period_start, period_end)
);

CREATE INDEX idx_production_company ON production_data(company_id);
CREATE INDEX idx_production_project ON production_data(project_id);
CREATE INDEX idx_production_period ON production_data(period_start, period_end);


CREATE TABLE IF NOT EXISTS production_guidance (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Guidance period
    guidance_year INTEGER NOT NULL,
    guidance_quarter INTEGER,  -- Null for annual guidance
    
    -- Production guidance (ranges)
    production_low_json JSONB DEFAULT '{}',
    production_high_json JSONB DEFAULT '{}',
    production_mid_json JSONB DEFAULT '{}',
    
    -- Cost guidance (ranges)
    aisc_low NUMERIC(12, 4),
    aisc_high NUMERIC(12, 4),
    cash_cost_low NUMERIC(12, 4),
    cash_cost_high NUMERIC(12, 4),
    
    -- Capex guidance
    capex_low_usd NUMERIC(20, 2),
    capex_high_usd NUMERIC(20, 2),
    
    -- Status
    is_current BOOLEAN DEFAULT TRUE,
    revision_number INTEGER DEFAULT 0,
    
    -- Metadata
    announcement_date DATE,
    source_document_id INTEGER,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guidance_company ON production_guidance(company_id);


-- =============================================================================
-- Financial Statements
-- =============================================================================

CREATE TABLE IF NOT EXISTS balance_sheets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Period
    period_type financial_period_type NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    -- Assets
    cash_and_equivalents NUMERIC(20, 2),
    short_term_investments NUMERIC(20, 2),
    accounts_receivable NUMERIC(20, 2),
    inventory NUMERIC(20, 2),
    total_current_assets NUMERIC(20, 2),
    
    ppe_net NUMERIC(20, 2),  -- Property, Plant & Equipment
    mineral_properties NUMERIC(20, 2),
    goodwill NUMERIC(20, 2),
    intangibles NUMERIC(20, 2),
    total_non_current_assets NUMERIC(20, 2),
    total_assets NUMERIC(20, 2),
    
    -- Liabilities
    accounts_payable NUMERIC(20, 2),
    short_term_debt NUMERIC(20, 2),
    current_portion_lt_debt NUMERIC(20, 2),
    total_current_liabilities NUMERIC(20, 2),
    
    long_term_debt NUMERIC(20, 2),
    deferred_tax_liabilities NUMERIC(20, 2),
    reclamation_liabilities NUMERIC(20, 2),
    total_non_current_liabilities NUMERIC(20, 2),
    total_liabilities NUMERIC(20, 2),
    
    -- Equity
    share_capital NUMERIC(20, 2),
    retained_earnings NUMERIC(20, 2),
    total_equity NUMERIC(20, 2),
    
    -- Shares
    shares_outstanding BIGINT,
    treasury_shares BIGINT,
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    reporting_standard reporting_standard,
    is_audited BOOLEAN DEFAULT FALSE,
    source_document_id INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, period_end_date)
);

CREATE INDEX idx_balance_company ON balance_sheets(company_id);
CREATE INDEX idx_balance_date ON balance_sheets(period_end_date);


CREATE TABLE IF NOT EXISTS income_statements (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Period
    period_type financial_period_type NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    -- Revenue
    revenue NUMERIC(20, 2),
    cost_of_sales NUMERIC(20, 2),
    gross_profit NUMERIC(20, 2),
    
    -- Operating expenses
    exploration_expense NUMERIC(20, 2),
    general_admin NUMERIC(20, 2),
    depreciation_amortization NUMERIC(20, 2),
    impairment_charges NUMERIC(20, 2),
    other_operating_expense NUMERIC(20, 2),
    total_operating_expenses NUMERIC(20, 2),
    
    -- Operating income
    operating_income NUMERIC(20, 2),
    
    -- Other income/expense
    interest_income NUMERIC(20, 2),
    interest_expense NUMERIC(20, 2),
    other_income NUMERIC(20, 2),
    fx_gain_loss NUMERIC(20, 2),
    
    -- Pre-tax and tax
    income_before_tax NUMERIC(20, 2),
    income_tax_expense NUMERIC(20, 2),
    
    -- Net income
    net_income NUMERIC(20, 2),
    net_income_attributable NUMERIC(20, 2),  -- Attributable to shareholders
    
    -- Per share
    basic_eps NUMERIC(12, 4),
    diluted_eps NUMERIC(12, 4),
    weighted_avg_shares BIGINT,
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    reporting_standard reporting_standard,
    source_document_id INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, period_start_date, period_end_date)
);

CREATE INDEX idx_income_company ON income_statements(company_id);


CREATE TABLE IF NOT EXISTS cashflow_statements (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Period
    period_type financial_period_type NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    
    -- Operating activities
    net_income NUMERIC(20, 2),
    depreciation_amortization NUMERIC(20, 2),
    stock_compensation NUMERIC(20, 2),
    working_capital_changes NUMERIC(20, 2),
    other_operating NUMERIC(20, 2),
    cash_from_operations NUMERIC(20, 2),
    
    -- Investing activities
    capex NUMERIC(20, 2),
    acquisitions NUMERIC(20, 2),
    disposals NUMERIC(20, 2),
    exploration_expenditure NUMERIC(20, 2),
    other_investing NUMERIC(20, 2),
    cash_from_investing NUMERIC(20, 2),
    
    -- Financing activities
    debt_issued NUMERIC(20, 2),
    debt_repaid NUMERIC(20, 2),
    equity_issued NUMERIC(20, 2),
    dividends_paid NUMERIC(20, 2),
    share_buybacks NUMERIC(20, 2),
    other_financing NUMERIC(20, 2),
    cash_from_financing NUMERIC(20, 2),
    
    -- Net change
    fx_effect NUMERIC(20, 2),
    net_change_in_cash NUMERIC(20, 2),
    beginning_cash NUMERIC(20, 2),
    ending_cash NUMERIC(20, 2),
    
    -- Free cash flow
    free_cash_flow NUMERIC(20, 2),
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    source_document_id INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, period_start_date, period_end_date)
);


-- =============================================================================
-- People / Management
-- =============================================================================

CREATE TABLE IF NOT EXISTS company_people (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    
    -- Contact
    email VARCHAR(255),
    linkedin_url VARCHAR(500),
    
    -- Biography
    biography TEXT,
    education TEXT,
    years_experience INTEGER,
    
    -- Photo
    photo_url VARCHAR(500),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_people_company ON company_people(company_id);


CREATE TABLE IF NOT EXISTS person_positions (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES company_people(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Position details
    title VARCHAR(255) NOT NULL,
    position_type VARCHAR(50),  -- executive, director, officer, etc.
    department VARCHAR(100),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Compensation (annual)
    base_salary NUMERIC(20, 2),
    bonus NUMERIC(20, 2),
    stock_awards NUMERIC(20, 2),
    option_awards NUMERIC(20, 2),
    other_compensation NUMERIC(20, 2),
    total_compensation NUMERIC(20, 2),
    
    -- Committee memberships
    committee_memberships TEXT[],
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    fiscal_year INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- =============================================================================
-- Drilling Highlights
-- =============================================================================

CREATE TABLE IF NOT EXISTS drill_highlight_intercepts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Hole identification
    hole_id VARCHAR(50) NOT NULL,
    drill_type VARCHAR(20),  -- RC, DD, RAB
    
    -- Location
    latitude NUMERIC(12, 8),
    longitude NUMERIC(12, 8),
    collar_elevation NUMERIC(12, 2),
    azimuth NUMERIC(5, 2),
    dip NUMERIC(5, 2),
    total_depth NUMERIC(12, 2),
    
    -- Intercept interval
    from_depth NUMERIC(12, 2) NOT NULL,
    to_depth NUMERIC(12, 2) NOT NULL,
    interval_length NUMERIC(12, 2) NOT NULL,
    true_width NUMERIC(12, 2),
    
    -- Grade (primary commodity)
    commodity VARCHAR(20) NOT NULL,
    grade NUMERIC(12, 6) NOT NULL,
    grade_unit VARCHAR(20) NOT NULL,  -- g/t, %, ppm
    
    -- Secondary commodities
    secondary_grades_json JSONB DEFAULT '{}',
    -- Example: {"Ag_g/t": 15.0, "Cu_%": 0.5}
    
    -- Grade-thickness (GT) product
    grade_thickness NUMERIC(12, 4),
    
    -- Highlight status
    is_highlight BOOLEAN DEFAULT TRUE,
    highlight_reason TEXT,  -- "Best intercept in campaign", etc.
    
    -- Source
    announcement_date DATE,
    source_document_id INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drill_highlights_company ON drill_highlight_intercepts(company_id);
CREATE INDEX idx_drill_highlights_project ON drill_highlight_intercepts(project_id);
CREATE INDEX idx_drill_highlights_commodity ON drill_highlight_intercepts(commodity);
CREATE INDEX idx_drill_highlights_date ON drill_highlight_intercepts(announcement_date);


-- =============================================================================
-- Royalties
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_royalties (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Royalty holder
    royalty_holder VARCHAR(255) NOT NULL,
    royalty_holder_ticker VARCHAR(20),  -- If publicly traded
    royalty_holder_exchange VARCHAR(20),
    
    -- Royalty details
    royalty_type VARCHAR(50) NOT NULL,  -- NSR, GRR, NPI, Stream
    royalty_rate NUMERIC(10, 6),  -- Percentage
    royalty_rate_unit VARCHAR(20),  -- %, $/oz, etc.
    
    -- Area covered
    area_description TEXT,
    commodities_covered TEXT[],  -- ["Au", "Ag", "Cu"]
    
    -- Financial terms
    buyback_option BOOLEAN DEFAULT FALSE,
    buyback_price NUMERIC(20, 2),
    buyback_rate_reduction NUMERIC(10, 6),
    
    -- Dates
    effective_date DATE,
    expiry_date DATE,
    
    -- Source
    source_document_id INTEGER,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_royalties_project ON project_royalties(project_id);


-- =============================================================================
-- Ownership / Shareholders
-- =============================================================================

CREATE TABLE IF NOT EXISTS ownership_records (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Holder information
    holder_name VARCHAR(255) NOT NULL,
    holder_type VARCHAR(50),  -- institution, insider, retail, strategic
    holder_ticker VARCHAR(20),
    holder_exchange VARCHAR(20),
    
    -- Ownership
    shares_held BIGINT NOT NULL,
    percent_outstanding NUMERIC(10, 6),
    market_value_usd NUMERIC(20, 2),
    
    -- Change
    change_shares BIGINT,
    change_percent NUMERIC(10, 6),
    
    -- Position type
    is_beneficial_owner BOOLEAN DEFAULT FALSE,
    is_insider BOOLEAN DEFAULT FALSE,
    insider_relationship VARCHAR(100),
    
    -- Dates
    report_date DATE NOT NULL,
    as_of_date DATE,
    
    -- Filing reference
    filing_type VARCHAR(50),  -- 13F, 13D, 13G, Form 4, etc.
    filing_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ownership_company ON ownership_records(company_id);
CREATE INDEX idx_ownership_holder ON ownership_records(holder_name);
CREATE INDEX idx_ownership_date ON ownership_records(report_date);


-- =============================================================================
-- Filing Documents
-- =============================================================================

CREATE TABLE IF NOT EXISTS filing_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Document details
    title VARCHAR(500) NOT NULL,
    category filing_category NOT NULL,
    
    -- Dates
    filing_date DATE NOT NULL,
    document_date DATE,
    
    -- Content
    summary TEXT,
    full_text TEXT,
    
    -- URLs
    source_url VARCHAR(1000),
    pdf_url VARCHAR(1000),
    
    -- Exchange info
    exchange VARCHAR(20),
    exchange_reference VARCHAR(100),
    
    -- Flags
    is_material BOOLEAN DEFAULT FALSE,
    is_price_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Related entities
    related_project_ids INTEGER[],
    
    -- NLP/Extraction
    key_figures_json JSONB DEFAULT '{}',
    extracted_data_json JSONB DEFAULT '{}',
    sentiment_score NUMERIC(5, 4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_filings_company ON filing_documents(company_id);
CREATE INDEX idx_filings_category ON filing_documents(category);
CREATE INDEX idx_filings_date ON filing_documents(filing_date);


-- =============================================================================
-- Stock Price History
-- =============================================================================

CREATE TABLE IF NOT EXISTS stock_price_history (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Date
    trade_date DATE NOT NULL,
    
    -- OHLCV
    open_price NUMERIC(12, 4),
    high_price NUMERIC(12, 4),
    low_price NUMERIC(12, 4),
    close_price NUMERIC(12, 4) NOT NULL,
    adjusted_close NUMERIC(12, 4),
    volume BIGINT,
    
    -- Value traded
    value_traded NUMERIC(20, 2),
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Returns
    daily_return NUMERIC(10, 6),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, trade_date)
);

CREATE INDEX idx_stock_company ON stock_price_history(company_id);
CREATE INDEX idx_stock_date ON stock_price_history(trade_date);


-- =============================================================================
-- Project Startup Dates
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_startup_dates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Milestone dates
    discovery_date DATE,
    first_resource_date DATE,
    first_reserve_date DATE,
    construction_start_date DATE,
    first_production_date DATE,
    commercial_production_date DATE,
    
    -- Planned dates (if not yet achieved)
    planned_construction_start DATE,
    planned_first_production DATE,
    planned_commercial_production DATE,
    
    -- Source
    source_document_id INTEGER,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id)
);


-- =============================================================================
-- Update trigger function
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all new tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'lom_mining', 'lom_processing', 'lom_capex', 'lom_cashflow',
            'production_data', 'production_guidance',
            'balance_sheets', 'income_statements', 'cashflow_statements',
            'company_people', 'person_positions',
            'drill_highlight_intercepts', 'project_royalties',
            'ownership_records', 'filing_documents', 'project_startup_dates'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;


-- =============================================================================
-- Summary
-- =============================================================================
-- Tables created:
--   - lom_mining, lom_processing, lom_capex, lom_cashflow (Life of Mine)
--   - production_data, production_guidance (Production)
--   - balance_sheets, income_statements, cashflow_statements (Financials)
--   - company_people, person_positions (Management)
--   - drill_highlight_intercepts (Drilling)
--   - project_royalties (Royalties)
--   - ownership_records (Ownership)
--   - filing_documents (Filings)
--   - stock_price_history (Stock)
--   - project_startup_dates (Milestones)
-- =============================================================================

COMMENT ON TABLE lom_mining IS 'Life of Mine mining schedule with yearly production projections';
COMMENT ON TABLE production_data IS 'Actual production results with cost metrics (Cash Cost, AISC, AIC)';
COMMENT ON TABLE balance_sheets IS 'Company balance sheet data for financial analysis';
COMMENT ON TABLE drill_highlight_intercepts IS 'Significant drilling intercepts for discovery tracking';
COMMENT ON TABLE filing_documents IS 'Company filings categorized like Prospector Portal (18 categories)';
