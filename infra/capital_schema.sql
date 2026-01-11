-- =============================================================================
-- CAPITAL RAISINGS & SHARE PRICE IMPACT DATA
-- =============================================================================

-- Capital Raising Types
DO $$ BEGIN
    CREATE TYPE capital_raising_type AS ENUM (
        'placement', 'rights_issue', 'spp', 'ipo', 'entitlement_offer',
        'convertible_note', 'share_purchase_plan', 'institutional_placement',
        'retail_offer', 'private_placement', 'follow_on_offering'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Deal/Agreement Types
DO $$ BEGIN
    CREATE TYPE deal_type AS ENUM (
        'offtake', 'joint_venture', 'earn_in', 'acquisition', 'divestment',
        'merger', 'strategic_partnership', 'streaming', 'royalty', 'farm_in',
        'option_agreement', 'binding_loi', 'non_binding_loi', 'mou'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Debt Instrument Types
DO $$ BEGIN
    CREATE TYPE debt_type AS ENUM (
        'senior_debt', 'subordinated_debt', 'project_finance', 'revolving_credit',
        'convertible_bond', 'green_bond', 'equipment_finance', 'working_capital',
        'bridge_loan', 'streaming_finance', 'royalty_finance', 'offtake_prepay'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- CAPITAL RAISINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_capital_raisings (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    
    -- Raising details
    raising_type capital_raising_type,
    announcement_date DATE,
    completion_date DATE,
    
    -- Amounts
    amount_raised_aud NUMERIC(20, 2),
    amount_raised_usd NUMERIC(20, 2),
    target_amount_aud NUMERIC(20, 2),
    
    -- Pricing
    issue_price NUMERIC(12, 6),
    discount_to_market_pct FLOAT,
    last_close_price NUMERIC(12, 6),
    vwap_reference NUMERIC(12, 6),
    
    -- Shares
    shares_issued BIGINT,
    shares_pre_raising BIGINT,
    shares_post_raising BIGINT,
    dilution_pct FLOAT,
    
    -- Options/Warrants attached
    options_issued BIGINT,
    option_exercise_price NUMERIC(12, 6),
    option_expiry_date DATE,
    
    -- Lead managers/Underwriters
    lead_manager VARCHAR(255),
    underwriter VARCHAR(255),
    is_underwritten BOOLEAN DEFAULT FALSE,
    
    -- Use of funds
    use_of_funds JSONB DEFAULT '[]',
    -- Example: [{"purpose": "Drilling", "amount": 5000000}, {"purpose": "Working capital", "amount": 2000000}]
    
    -- Participation
    institutional_component_aud NUMERIC(20, 2),
    retail_component_aud NUMERIC(20, 2),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raising_symbol ON extracted_capital_raisings(symbol);
CREATE INDEX IF NOT EXISTS idx_raising_type ON extracted_capital_raisings(raising_type);
CREATE INDEX IF NOT EXISTS idx_raising_date ON extracted_capital_raisings(announcement_date);

-- =============================================================================
-- DEBT FACILITIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_debt_facilities (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Facility details
    debt_type debt_type,
    facility_name VARCHAR(255),
    lender VARCHAR(255),
    
    -- Amounts
    facility_amount_usd NUMERIC(20, 2),
    drawn_amount_usd NUMERIC(20, 2),
    available_amount_usd NUMERIC(20, 2),
    
    -- Terms
    interest_rate_pct FLOAT,
    interest_type VARCHAR(50),  -- fixed, floating, SOFR+margin
    margin_pct FLOAT,
    
    -- Dates
    announcement_date DATE,
    maturity_date DATE,
    first_drawdown_date DATE,
    
    -- Covenants & conditions
    covenants JSONB DEFAULT '[]',
    conditions_precedent TEXT,
    security_package TEXT,
    
    -- Repayment
    repayment_schedule JSONB DEFAULT '[]',
    balloon_payment_usd NUMERIC(20, 2),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_symbol ON extracted_debt_facilities(symbol);
CREATE INDEX IF NOT EXISTS idx_debt_type ON extracted_debt_facilities(debt_type);

-- =============================================================================
-- OFFTAKE AGREEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_offtake_agreements (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Counterparty
    offtaker VARCHAR(255),
    offtaker_country VARCHAR(100),
    
    -- Product
    commodity commodity_type,
    product_type VARCHAR(100),  -- Concentrate, metal, ore
    
    -- Volume
    annual_volume NUMERIC(20, 4),
    volume_unit VARCHAR(20),
    total_volume NUMERIC(20, 4),
    volume_pct_of_production FLOAT,
    
    -- Pricing
    pricing_mechanism VARCHAR(255),  -- LME, LBMA, fixed, formula
    pricing_discount_pct FLOAT,
    treatment_charge NUMERIC(12, 2),
    refining_charge NUMERIC(12, 2),
    tc_rc_unit VARCHAR(20),
    
    -- Term
    announcement_date DATE,
    start_date DATE,
    end_date DATE,
    term_years FLOAT,
    
    -- Prepayment (if streaming/prepay)
    prepayment_usd NUMERIC(20, 2),
    
    -- Status
    is_binding BOOLEAN DEFAULT TRUE,
    status VARCHAR(50),  -- negotiating, signed, active, completed
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offtake_symbol ON extracted_offtake_agreements(symbol);
CREATE INDEX IF NOT EXISTS idx_offtake_commodity ON extracted_offtake_agreements(commodity);

-- =============================================================================
-- STRATEGIC DEALS (JV, Earn-in, Acquisitions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_strategic_deals (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Deal identification
    deal_type deal_type,
    deal_name VARCHAR(255),
    counterparty VARCHAR(255),
    counterparty_asx_code VARCHAR(20),
    
    -- Deal structure
    consideration_cash_usd NUMERIC(20, 2),
    consideration_shares BIGINT,
    consideration_share_price NUMERIC(12, 6),
    total_consideration_usd NUMERIC(20, 2),
    
    -- Ownership/Interest
    interest_acquired_pct FLOAT,
    interest_retained_pct FLOAT,
    earn_in_target_pct FLOAT,
    
    -- Earn-in terms
    earn_in_spend_required_usd NUMERIC(20, 2),
    earn_in_period_months INTEGER,
    earn_in_milestones JSONB DEFAULT '[]',
    
    -- JV terms
    jv_operator VARCHAR(255),
    jv_management_fee_pct FLOAT,
    
    -- Conditions
    conditions_precedent TEXT,
    regulatory_approvals_required TEXT,
    
    -- Timeline
    announcement_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Status
    status VARCHAR(50),  -- announced, conditional, completed, terminated
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_symbol ON extracted_strategic_deals(symbol);
CREATE INDEX IF NOT EXISTS idx_deal_type ON extracted_strategic_deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deal_date ON extracted_strategic_deals(announcement_date);

-- =============================================================================
-- MAJOR SHAREHOLDERS & SUBSTANTIAL HOLDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_substantial_holders (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    
    -- Holder details
    holder_name VARCHAR(255) NOT NULL,
    holder_type VARCHAR(50),  -- institution, insider, strategic, retail
    
    -- Holding
    shares_held BIGINT,
    holding_pct FLOAT,
    previous_holding_pct FLOAT,
    change_pct FLOAT,
    
    -- Transaction
    announcement_date DATE,
    transaction_type VARCHAR(50),  -- acquisition, disposal, on-market, off-market
    transaction_price NUMERIC(12, 6),
    transaction_value_aud NUMERIC(20, 2),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holder_symbol ON extracted_substantial_holders(symbol);
CREATE INDEX IF NOT EXISTS idx_holder_name ON extracted_substantial_holders(holder_name);

-- =============================================================================
-- DIRECTOR & INSIDER TRANSACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_director_dealings (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    
    -- Director details
    director_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),  -- CEO, Chairman, NED, etc.
    
    -- Transaction
    transaction_date DATE,
    transaction_type VARCHAR(50),  -- purchase, sale, exercise_options, grant
    
    -- Details
    shares_traded BIGINT,
    price NUMERIC(12, 6),
    value_aud NUMERIC(20, 2),
    
    -- Holdings after
    direct_holding BIGINT,
    indirect_holding BIGINT,
    total_holding BIGINT,
    holding_pct FLOAT,
    
    -- Options/Performance rights
    options_exercised BIGINT,
    options_exercise_price NUMERIC(12, 6),
    performance_rights_vested BIGINT,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_director_symbol ON extracted_director_dealings(symbol);
CREATE INDEX IF NOT EXISTS idx_director_name ON extracted_director_dealings(director_name);
CREATE INDEX IF NOT EXISTS idx_director_date ON extracted_director_dealings(transaction_date);

-- =============================================================================
-- SHARE PRICE CATALYSTS & EVENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_catalysts (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Catalyst details
    catalyst_type VARCHAR(100) NOT NULL,
    -- Types: drilling_results, resource_update, study_release, production_start,
    -- permit_approval, offtake_signed, funding_secured, acquisition, discovery, etc.
    
    catalyst_description TEXT,
    
    -- Timeline
    announcement_date DATE,
    expected_date DATE,
    actual_date DATE,
    
    -- Impact assessment (extracted or inferred)
    expected_impact VARCHAR(50),  -- positive, negative, neutral
    materiality VARCHAR(50),  -- high, medium, low
    
    -- Quantified impact (if available)
    resource_change_mt NUMERIC(20, 4),
    grade_change NUMERIC(12, 6),
    npv_change_usd NUMERIC(20, 2),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalyst_symbol ON extracted_catalysts(symbol);
CREATE INDEX IF NOT EXISTS idx_catalyst_type ON extracted_catalysts(catalyst_type);
CREATE INDEX IF NOT EXISTS idx_catalyst_date ON extracted_catalysts(announcement_date);

-- =============================================================================
-- GUIDANCE & FORECASTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_guidance (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Period
    guidance_period VARCHAR(50),  -- FY2025, H1FY2025, CY2025, Q1FY2025
    fiscal_year INTEGER,
    
    -- Production guidance
    production_low NUMERIC(20, 4),
    production_high NUMERIC(20, 4),
    production_unit VARCHAR(20),
    production_commodity commodity_type,
    
    -- Cost guidance
    c1_cost_low NUMERIC(12, 2),
    c1_cost_high NUMERIC(12, 2),
    aisc_low NUMERIC(12, 2),
    aisc_high NUMERIC(12, 2),
    cost_unit VARCHAR(20),
    
    -- Capital guidance
    capex_guidance_low NUMERIC(20, 2),
    capex_guidance_high NUMERIC(20, 2),
    
    -- Revenue/EBITDA guidance
    revenue_guidance_low NUMERIC(20, 2),
    revenue_guidance_high NUMERIC(20, 2),
    ebitda_guidance_low NUMERIC(20, 2),
    ebitda_guidance_high NUMERIC(20, 2),
    
    -- Guidance status
    is_upgrade BOOLEAN,
    is_downgrade BOOLEAN,
    previous_guidance TEXT,
    
    -- Metadata
    announcement_date DATE,
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guidance_symbol ON extracted_guidance(symbol);
CREATE INDEX IF NOT EXISTS idx_guidance_period ON extracted_guidance(guidance_period);

-- Done!
SELECT 'Capital Raising & Share Impact Schema Created!' as status;
