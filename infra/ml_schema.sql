-- InvestOre Analytics - ML Extraction Schema
-- Comprehensive tables for extracting mining announcement data

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE project_phase AS ENUM (
        'grassroots', 'exploration', 'resource_definition', 'scoping_study',
        'pre_feasibility', 'feasibility', 'permitting', 'construction',
        'commissioning', 'production', 'expansion', 'care_maintenance', 'closure'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE resource_category_enum AS ENUM ('measured', 'indicated', 'inferred');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reserve_category AS ENUM ('proven', 'probable');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE commodity_type AS ENUM (
        'Au', 'Ag', 'Cu', 'Zn', 'Pb', 'Ni', 'Co', 'Li', 'Fe', 'U',
        'REE', 'Mn', 'Sn', 'W', 'Mo', 'Pt', 'Pd', 'Other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE permit_status AS ENUM (
        'not_required', 'not_applied', 'application_submitted', 'under_review',
        'conditionally_approved', 'approved', 'expired', 'rejected'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE funding_status AS ENUM (
        'not_funded', 'seeking_funding', 'partially_funded', 'fully_funded',
        'debt_financed', 'equity_financed', 'mixed_financing'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE area_type AS ENUM (
        'project', 'deposit', 'pit', 'pit_shell', 'underground', 'zone',
        'lode', 'tenement', 'prospect', 'target'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- EXTRACTED PROJECTS - Main project data
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_projects (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL REFERENCES extracted_pdf_documents(document_id) ON DELETE CASCADE,
    
    -- Project identification
    symbol VARCHAR(20) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    
    -- Project phase & timeline
    current_phase project_phase,
    first_production_date DATE,
    first_production_year INTEGER,
    mine_life_years FLOAT,
    construction_period_months INTEGER,
    
    -- Study information
    study_type VARCHAR(50),
    study_date DATE,
    
    -- Funding status
    funding_status funding_status,
    funding_secured_pct FLOAT,
    funding_required_usd NUMERIC(20, 2),
    
    -- Future potential
    exploration_upside TEXT,
    expansion_potential TEXT,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    effective_date DATE,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_project_symbol ON extracted_projects(symbol);
CREATE INDEX IF NOT EXISTS idx_extracted_project_name ON extracted_projects(project_name);
CREATE INDEX IF NOT EXISTS idx_extracted_project_phase ON extracted_projects(current_phase);

-- =============================================================================
-- EXTRACTED AREAS - Deposits, pits, zones, tenements
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_areas (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Area identification
    area_name VARCHAR(255) NOT NULL,
    area_type area_type,
    
    -- Location
    latitude FLOAT,
    longitude FLOAT,
    
    -- Tenement details
    tenement_id VARCHAR(50),
    tenement_area_km2 FLOAT,
    tenement_expiry_date DATE,
    
    -- Pit details
    pit_depth_m FLOAT,
    pit_length_m FLOAT,
    pit_width_m FLOAT,
    
    -- Metadata
    description TEXT,
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_area_project ON extracted_areas(project_id);
CREATE INDEX IF NOT EXISTS idx_area_name ON extracted_areas(area_name);
CREATE INDEX IF NOT EXISTS idx_area_type ON extracted_areas(area_type);

-- =============================================================================
-- EXTRACTED ECONOMICS - CAPEX, OPEX, NPV, IRR, EBITDA
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_economics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Capital costs
    initial_capex_usd NUMERIC(20, 2),
    sustaining_capex_usd NUMERIC(20, 2),
    total_capex_usd NUMERIC(20, 2),
    peak_funding_usd NUMERIC(20, 2),
    
    -- Operating costs
    opex_per_tonne NUMERIC(12, 2),
    opex_per_tonne_unit VARCHAR(20),
    c1_cost NUMERIC(12, 2),
    c1_cost_unit VARCHAR(20),
    aisc NUMERIC(12, 2),
    aisc_unit VARCHAR(20),
    
    -- Profitability metrics
    npv_usd NUMERIC(20, 2),
    npv_discount_rate FLOAT,
    irr_pct FLOAT,
    payback_years FLOAT,
    
    -- EBITDA
    annual_ebitda_usd NUMERIC(20, 2),
    lom_ebitda_usd NUMERIC(20, 2),
    ebitda_margin_pct FLOAT,
    
    -- Revenue
    annual_revenue_usd NUMERIC(20, 2),
    lom_revenue_usd NUMERIC(20, 2),
    
    -- Commodity price assumptions (JSON)
    commodity_prices JSONB DEFAULT '{}',
    
    -- Exchange rate
    fx_rate FLOAT,
    fx_currency_pair VARCHAR(10),
    
    -- Other assumptions
    diesel_price NUMERIC(10, 2),
    electricity_price NUMERIC(10, 4),
    electricity_unit VARCHAR(20),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    effective_date DATE,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_economics_project ON extracted_economics(project_id);

-- =============================================================================
-- EXTRACTED RESOURCE ESTIMATES - Measured, Indicated, Inferred
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_resource_estimates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    area_id INTEGER REFERENCES extracted_areas(id) ON DELETE SET NULL,
    
    -- Classification
    category resource_category_enum NOT NULL,
    
    -- Tonnage
    tonnage NUMERIC(20, 4),
    tonnage_unit VARCHAR(10) DEFAULT 'Mt',
    
    -- Primary commodity
    commodity commodity_type NOT NULL,
    grade NUMERIC(12, 6),
    grade_unit VARCHAR(20),
    contained_metal NUMERIC(20, 4),
    contained_unit VARCHAR(20),
    
    -- Secondary commodities (JSON array)
    secondary_commodities JSONB DEFAULT '[]',
    
    -- Cut-off grade
    cutoff_grade NUMERIC(12, 6),
    cutoff_unit VARCHAR(20),
    cutoff_description VARCHAR(100),
    
    -- Mining method
    mining_method VARCHAR(50),
    
    -- Metadata
    mre_date DATE,
    jorc_compliant BOOLEAN DEFAULT TRUE,
    competent_person VARCHAR(255),
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_project ON extracted_resource_estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_category ON extracted_resource_estimates(category);
CREATE INDEX IF NOT EXISTS idx_resource_commodity ON extracted_resource_estimates(commodity);

-- =============================================================================
-- EXTRACTED ORE RESERVES - Proven, Probable
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_ore_reserves (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    area_id INTEGER REFERENCES extracted_areas(id) ON DELETE SET NULL,
    
    -- Classification
    category reserve_category NOT NULL,
    
    -- Tonnage
    tonnage NUMERIC(20, 4),
    tonnage_unit VARCHAR(10) DEFAULT 'Mt',
    
    -- Primary commodity
    commodity commodity_type NOT NULL,
    grade NUMERIC(12, 6),
    grade_unit VARCHAR(20),
    contained_metal NUMERIC(20, 4),
    contained_unit VARCHAR(20),
    
    -- Secondary commodities
    secondary_commodities JSONB DEFAULT '[]',
    
    -- Cut-off
    cutoff_grade NUMERIC(12, 6),
    cutoff_unit VARCHAR(20),
    
    -- Mining method
    mining_method VARCHAR(50),
    
    -- Metadata
    ore_date DATE,
    jorc_compliant BOOLEAN DEFAULT TRUE,
    competent_person VARCHAR(255),
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reserve_project ON extracted_ore_reserves(project_id);
CREATE INDEX IF NOT EXISTS idx_reserve_category ON extracted_ore_reserves(category);

-- =============================================================================
-- EXTRACTED PERMITS - Legal, permits, obligations
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_permits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Permit identification
    permit_type VARCHAR(100) NOT NULL,
    permit_name VARCHAR(255),
    permit_number VARCHAR(100),
    
    -- Status
    status permit_status,
    application_date DATE,
    approval_date DATE,
    expiry_date DATE,
    
    -- Terms & conditions
    conditions TEXT,
    obligations TEXT,
    constraints TEXT,
    
    -- Indigenous agreements
    is_ilua BOOLEAN DEFAULT FALSE,
    traditional_owner_group VARCHAR(255),
    
    -- Metadata
    issuing_authority VARCHAR(255),
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permit_project ON extracted_permits(project_id);
CREATE INDEX IF NOT EXISTS idx_permit_type ON extracted_permits(permit_type);
CREATE INDEX IF NOT EXISTS idx_permit_status ON extracted_permits(status);

-- =============================================================================
-- EXTRACTED PRODUCTION ESTIMATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_production_estimates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Production period
    year INTEGER,
    period_type VARCHAR(50),
    
    -- Commodity
    commodity commodity_type NOT NULL,
    
    -- Production volumes
    production_amount NUMERIC(20, 4),
    production_unit VARCHAR(20),
    
    -- Concentrate
    concentrate_tonnage NUMERIC(20, 4),
    concentrate_unit VARCHAR(20),
    concentrate_grade_pct FLOAT,
    
    -- Ore processed
    ore_processed_mt NUMERIC(20, 4),
    ore_grade NUMERIC(12, 6),
    ore_grade_unit VARCHAR(20),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_project ON extracted_production_estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_production_commodity ON extracted_production_estimates(commodity);

-- =============================================================================
-- EXTRACTED OPERATIONAL METRICS - Recovery, stripping, waste/ore
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_operational_metrics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Recovery rates
    recovery_pct FLOAT,
    recovery_commodity commodity_type,
    recovery_method VARCHAR(100),
    
    -- Leach test results
    leach_recovery_pct FLOAT,
    leach_duration_days INTEGER,
    leach_test_type VARCHAR(100),
    
    -- Mining metrics
    stripping_ratio FLOAT,
    mining_rate_mtpa FLOAT,
    
    -- Annual volumes
    waste_mined_mt NUMERIC(20, 4),
    ore_mined_mt NUMERIC(20, 4),
    ore_hauled_mt NUMERIC(20, 4),
    
    -- Throughput
    processing_rate_mtpa FLOAT,
    nameplate_capacity_mtpa FLOAT,
    
    -- Dilution & mining loss
    dilution_pct FLOAT,
    mining_loss_pct FLOAT,
    
    -- Metadata
    period_type VARCHAR(50),
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operational_project ON extracted_operational_metrics(project_id);

-- =============================================================================
-- EXTRACTED STUDY FINDINGS - PFS, FS key findings
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_study_findings (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Study type
    study_type VARCHAR(50) NOT NULL,
    study_date DATE,
    study_author VARCHAR(255),
    
    -- Key findings
    finding_category VARCHAR(100),
    finding_text TEXT,
    
    -- Recommendations
    recommendations TEXT,
    
    -- Risks identified (JSON array)
    risks_identified JSONB DEFAULT '[]',
    
    -- Next steps
    next_steps TEXT,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_project ON extracted_study_findings(project_id);
CREATE INDEX IF NOT EXISTS idx_study_type ON extracted_study_findings(study_type);

-- =============================================================================
-- EXTRACTED EBITDA PROFILES - Year by year financials
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_ebitda_profiles (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE CASCADE,
    document_id VARCHAR(32) NOT NULL,
    
    -- Period
    year INTEGER,
    fiscal_year VARCHAR(20),
    
    -- Financials
    revenue_usd NUMERIC(20, 2),
    operating_costs_usd NUMERIC(20, 2),
    royalty_usd NUMERIC(20, 2),
    ebitda_usd NUMERIC(20, 2),
    
    -- Production context
    ore_processed_mt NUMERIC(20, 4),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebitda_project ON extracted_ebitda_profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_ebitda_year ON extracted_ebitda_profiles(year);

-- =============================================================================
-- PROJECT SUMMARIES - Denormalized for quick queries
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_summaries (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    
    -- Latest values
    current_phase project_phase,
    primary_commodity commodity_type,
    
    -- Total resources
    total_measured_mt NUMERIC(20, 4) DEFAULT 0,
    total_indicated_mt NUMERIC(20, 4) DEFAULT 0,
    total_inferred_mt NUMERIC(20, 4) DEFAULT 0,
    total_resource_mt NUMERIC(20, 4) DEFAULT 0,
    
    -- Average grades
    avg_measured_grade NUMERIC(12, 6),
    avg_indicated_grade NUMERIC(12, 6),
    avg_inferred_grade NUMERIC(12, 6),
    
    -- Total reserves
    total_proven_mt NUMERIC(20, 4) DEFAULT 0,
    total_probable_mt NUMERIC(20, 4) DEFAULT 0,
    total_reserve_mt NUMERIC(20, 4) DEFAULT 0,
    
    -- Key economics
    npv_usd NUMERIC(20, 2),
    irr_pct FLOAT,
    capex_usd NUMERIC(20, 2),
    c1_cost NUMERIC(12, 2),
    
    -- Timeline
    mine_life_years FLOAT,
    first_production_date DATE,
    
    -- Counts
    num_deposits INTEGER DEFAULT 0,
    num_documents_processed INTEGER DEFAULT 0,
    
    -- Last update
    last_document_id VARCHAR(32),
    last_updated TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(symbol, project_name)
);

CREATE INDEX IF NOT EXISTS idx_summary_symbol ON project_summaries(symbol);
CREATE INDEX IF NOT EXISTS idx_summary_phase ON project_summaries(current_phase);

-- Done!
SELECT 'ML Extraction Schema Created Successfully!' as status;
