-- =============================================================================
-- SCHEMA ADDITIONS BASED ON PDF ANALYSIS
-- Additional fields identified from analyzing DFS, Resource Updates, 
-- Quarterly Reports, Capital Raisings, Drilling Results, and Offtake agreements
-- =============================================================================

-- =============================================================================
-- 1. EXTEND extracted_economics TABLE
-- =============================================================================

-- NPV variations (pre-tax vs post-tax)
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS post_tax_npv_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS pre_tax_npv_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS npv_discount_rate FLOAT;

-- Additional capital costs
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS peak_funding_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS pre_production_cost_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS contingency_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS contingency_pct FLOAT;
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS closure_cost_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS rehabilitation_cost_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS working_capital_usd NUMERIC(20,2);

-- LOM metrics
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS lom_free_cash_flow_usd NUMERIC(20,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS lom_revenue_usd NUMERIC(20,2);

-- Cost breakdown per tonne
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS mining_cost_per_t NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS processing_cost_per_t NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS ga_cost_per_t NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS haulage_cost_per_t NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS total_site_cost_per_t NUMERIC(12,2);

-- FOB/CIF costs (for concentrates)
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS fob_cost_per_unit NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS cif_cost_per_unit NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS freight_cost_per_unit NUMERIC(12,2);

-- Margins
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS ebitda_margin_pct FLOAT;
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS operating_margin_pct FLOAT;

-- Sensitivity
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS breakeven_price NUMERIC(12,2);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS breakeven_commodity VARCHAR(20);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS npv_sensitivity_10pct NUMERIC(20,2);

-- =============================================================================
-- 2. EXTEND extracted_operational_metrics TABLE
-- =============================================================================

-- Mining parameters
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS mining_dilution_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS mining_recovery_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS ore_loss_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS fleet_utilisation_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS total_material_mtpa FLOAT;

-- Processing details
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS concentrate_grade NUMERIC(12,4);
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS concentrate_grade_unit VARCHAR(20);
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS processing_method VARCHAR(100);

-- Metallurgical recoveries by type
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS flotation_recovery_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS gravity_recovery_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS leach_recovery_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS cil_recovery_pct FLOAT;

-- Product quality
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS fe_content_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS moisture_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS silica_pct FLOAT;
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS alumina_pct FLOAT;

-- =============================================================================
-- 3. EXTEND extracted_projects TABLE
-- =============================================================================

-- Additional timeline fields
ALTER TABLE extracted_projects ADD COLUMN IF NOT EXISTS fid_date DATE;
ALTER TABLE extracted_projects ADD COLUMN IF NOT EXISTS construction_start_date DATE;
ALTER TABLE extracted_projects ADD COLUMN IF NOT EXISTS steady_state_date DATE;
ALTER TABLE extracted_projects ADD COLUMN IF NOT EXISTS ramp_up_months INTEGER;

-- =============================================================================
-- 4. EXTEND extracted_resource_estimates TABLE  
-- =============================================================================

-- Resource estimation details
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS block_size VARCHAR(50);
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS drill_spacing VARCHAR(50);
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS estimation_method VARCHAR(100);
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS specific_gravity FLOAT;
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS variogram_model VARCHAR(100);

-- =============================================================================
-- 5. EXTEND extracted_capital_raisings TABLE
-- =============================================================================

ALTER TABLE extracted_capital_raisings ADD COLUMN IF NOT EXISTS attaching_options_ratio VARCHAR(20);
ALTER TABLE extracted_capital_raisings ADD COLUMN IF NOT EXISTS escrow_end_date DATE;
ALTER TABLE extracted_capital_raisings ADD COLUMN IF NOT EXISTS director_participation_aud NUMERIC(20,2);

-- =============================================================================
-- 6. EXTEND extracted_offtake_agreements TABLE
-- =============================================================================

ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS floor_price NUMERIC(12,2);
ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS ceiling_price NUMERIC(12,2);
ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255);
ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS longstop_date DATE;
ALTER TABLE extracted_offtake_agreements ADD COLUMN IF NOT EXISTS conditions_precedent TEXT;

-- =============================================================================
-- 7. NEW TABLE: extracted_infrastructure
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_infrastructure (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Power
    grid_connected BOOLEAN,
    power_source VARCHAR(100),  -- grid, diesel, hybrid, solar, gas
    transmission_line_km FLOAT,
    substation_name VARCHAR(100),
    renewable_energy_pct FLOAT,
    power_consumption_mw FLOAT,
    
    -- Water
    water_source VARCHAR(255),
    water_license_id VARCHAR(100),
    water_consumption_gl_pa FLOAT,
    water_recycling_pct FLOAT,
    
    -- Transport - Roads
    sealed_road_access BOOLEAN,
    road_distance_km FLOAT,
    road_upgrade_required BOOLEAN,
    
    -- Transport - Rail
    rail_access BOOLEAN,
    rail_siding VARCHAR(100),
    rail_distance_km FLOAT,
    
    -- Transport - Port
    port_name VARCHAR(100),
    port_distance_km FLOAT,
    port_capacity_mtpa FLOAT,
    
    -- Site facilities
    accommodation_capacity INTEGER,
    accommodation_type VARCHAR(50),  -- camp, village, FIFO
    
    -- Tailings
    tailings_type VARCHAR(50),  -- conventional, dry stack, filtered
    tailings_capacity_mt FLOAT,
    tailings_area_ha FLOAT,
    
    -- Other
    airstrip BOOLEAN,
    airstrip_length_m FLOAT,
    gas_pipeline BOOLEAN,
    gas_pipeline_km FLOAT,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infrastructure_symbol ON extracted_infrastructure(symbol);
CREATE INDEX IF NOT EXISTS idx_infrastructure_project ON extracted_infrastructure(project_id);

-- =============================================================================
-- 8. NEW TABLE: extracted_royalties
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_royalties (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Royalty details
    royalty_type VARCHAR(50),  -- state, government, nsr, gross_revenue, profit_based
    royalty_name VARCHAR(255),
    royalty_holder VARCHAR(255),
    
    -- Rate
    royalty_pct FLOAT,
    royalty_fixed_amount NUMERIC(12,2),
    royalty_unit VARCHAR(20),  -- %, $/oz, $/t
    
    -- Scope
    applies_to VARCHAR(255),  -- specific deposit, commodity, or whole project
    commodity VARCHAR(20),
    
    -- Buyout terms (if applicable)
    buyout_available BOOLEAN DEFAULT FALSE,
    buyout_price_usd NUMERIC(20,2),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_royalties_symbol ON extracted_royalties(symbol);
CREATE INDEX IF NOT EXISTS idx_royalties_project ON extracted_royalties(project_id);

-- =============================================================================
-- 9. NEW TABLE: extracted_esg_metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_esg_metrics (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Reporting period
    reporting_period VARCHAR(50),  -- FY2025, Q1FY2025, CY2024
    period_start DATE,
    period_end DATE,
    
    -- Emissions
    scope_1_emissions_tco2e FLOAT,
    scope_2_emissions_tco2e FLOAT,
    scope_3_emissions_tco2e FLOAT,
    total_emissions_tco2e FLOAT,
    carbon_intensity FLOAT,
    carbon_intensity_unit VARCHAR(50),  -- tCO2e/oz, tCO2e/t product
    
    -- Energy
    total_energy_consumption_gj FLOAT,
    electricity_consumption_mwh FLOAT,
    renewable_energy_pct FLOAT,
    diesel_consumption_ml FLOAT,
    
    -- Water
    water_withdrawal_gl FLOAT,
    water_consumption_gl FLOAT,
    water_recycled_gl FLOAT,
    water_recycling_pct FLOAT,
    water_intensity FLOAT,  -- kL/oz or kL/t
    
    -- Waste
    waste_rock_mt FLOAT,
    tailings_mt FLOAT,
    hazardous_waste_t FLOAT,
    
    -- Land
    land_disturbed_ha FLOAT,
    land_rehabilitated_ha FLOAT,
    
    -- Biodiversity
    biodiversity_offset_ha FLOAT,
    protected_areas_nearby BOOLEAN,
    
    -- Safety
    trifr FLOAT,
    ltifr FLOAT,
    fatalities INTEGER DEFAULT 0,
    near_misses INTEGER,
    
    -- Workforce
    total_workforce INTEGER,
    female_workforce_pct FLOAT,
    indigenous_workforce_pct FLOAT,
    local_workforce_pct FLOAT,
    
    -- Community
    community_investment_usd NUMERIC(20,2),
    community_complaints INTEGER,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_symbol ON extracted_esg_metrics(symbol);
CREATE INDEX IF NOT EXISTS idx_esg_project ON extracted_esg_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_esg_period ON extracted_esg_metrics(reporting_period);

-- =============================================================================
-- 10. NEW TABLE: extracted_drilling_results
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_drilling_results (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Hole identification
    hole_id VARCHAR(50) NOT NULL,
    hole_type VARCHAR(20),  -- RC, DD, RAB, AC, Sonic
    
    -- Location
    easting FLOAT,
    northing FLOAT,
    elevation_rl FLOAT,
    coordinate_system VARCHAR(50),  -- MGA94 Zone 51, etc.
    
    -- Orientation
    azimuth FLOAT,
    dip FLOAT,
    
    -- Depths
    precollar_depth_m FLOAT,
    total_depth_m FLOAT,
    
    -- Status
    status VARCHAR(50),  -- complete, in_progress, planned, abandoned
    
    -- Target
    target_deposit VARCHAR(100),
    target_zone VARCHAR(100),
    drill_purpose VARCHAR(50),  -- exploration, infill, extensional, geotechnical
    
    -- Metadata
    drill_date DATE,
    extraction_confidence FLOAT DEFAULT 0.8,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drilling_symbol ON extracted_drilling_results(symbol);
CREATE INDEX IF NOT EXISTS idx_drilling_project ON extracted_drilling_results(project_id);
CREATE INDEX IF NOT EXISTS idx_drilling_hole ON extracted_drilling_results(hole_id);

-- =============================================================================
-- 11. NEW TABLE: extracted_drill_intercepts
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_drill_intercepts (
    id SERIAL PRIMARY KEY,
    drilling_result_id INTEGER REFERENCES extracted_drilling_results(id) ON DELETE CASCADE,
    
    -- Interval
    from_m FLOAT NOT NULL,
    to_m FLOAT NOT NULL,
    interval_m FLOAT NOT NULL,
    
    -- True width (if calculated)
    true_width_m FLOAT,
    true_width_pct FLOAT,
    
    -- Grade
    commodity VARCHAR(20) NOT NULL,
    grade FLOAT NOT NULL,
    grade_unit VARCHAR(20) NOT NULL,  -- g/t, %, ppm
    
    -- Contained metal (optional)
    contained_metal FLOAT,
    contained_metal_unit VARCHAR(20),  -- oz, t, lb
    
    -- Reporting parameters
    cutoff_grade FLOAT,
    cutoff_unit VARCHAR(20),
    max_internal_dilution_m FLOAT,
    minimum_width_m FLOAT,
    
    -- Multi-element (for polymetallic)
    grade_secondary FLOAT,
    grade_secondary_unit VARCHAR(20),
    commodity_secondary VARCHAR(20),
    
    -- Classification
    is_significant BOOLEAN DEFAULT TRUE,
    is_high_grade BOOLEAN DEFAULT FALSE,
    includes_subinterval BOOLEAN DEFAULT FALSE,
    
    -- Parent intercept (for including statements)
    parent_intercept_id INTEGER REFERENCES extracted_drill_intercepts(id),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intercepts_drill ON extracted_drill_intercepts(drilling_result_id);
CREATE INDEX IF NOT EXISTS idx_intercepts_commodity ON extracted_drill_intercepts(commodity);

-- =============================================================================
-- 12. NEW TABLE: extracted_byproducts
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_byproducts (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Byproduct details
    commodity VARCHAR(20) NOT NULL,
    is_coproduct BOOLEAN DEFAULT FALSE,  -- True if significant enough to be co-product
    
    -- Production
    annual_production FLOAT,
    production_unit VARCHAR(20),
    lom_production FLOAT,
    recovery_pct FLOAT,
    
    -- Economics
    annual_revenue_usd NUMERIC(20,2),
    credit_per_primary_unit NUMERIC(12,2),  -- Credit per oz Au, per t Cu, etc.
    assumed_price NUMERIC(12,2),
    price_unit VARCHAR(20),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_byproducts_symbol ON extracted_byproducts(symbol);
CREATE INDEX IF NOT EXISTS idx_byproducts_project ON extracted_byproducts(project_id);

-- =============================================================================
-- 13. NEW TABLE: extracted_product_specs (for concentrates/products)
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_product_specs (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Product identification
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50),  -- concentrate, dore, cathode, hydroxide, carbonate
    
    -- Primary specs
    primary_metal_content FLOAT,
    primary_metal_unit VARCHAR(20),  -- %Cu, %Li2O, %Fe, etc.
    
    -- Impurities/penalties
    moisture_pct FLOAT,
    silica_pct FLOAT,
    alumina_pct FLOAT,
    arsenic_ppm FLOAT,
    sulphur_pct FLOAT,
    iron_pct FLOAT,
    
    -- For lithium products
    li2o_pct FLOAT,
    na2o_pct FLOAT,
    k2o_pct FLOAT,
    
    -- For iron ore
    fe_pct FLOAT,
    phosphorus_pct FLOAT,
    loi_pct FLOAT,  -- Loss on ignition
    
    -- Production
    annual_production FLOAT,
    production_unit VARCHAR(20),
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_symbol ON extracted_product_specs(symbol);
CREATE INDEX IF NOT EXISTS idx_product_project ON extracted_product_specs(project_id);

-- =============================================================================
-- 14. NEW TABLE: extracted_workforce
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_workforce (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL,
    
    -- Phase
    workforce_phase VARCHAR(50),  -- construction, operations, closure
    
    -- Numbers
    total_workforce INTEGER,
    direct_employees INTEGER,
    contractors INTEGER,
    
    -- Roster
    roster_pattern VARCHAR(50),  -- 8/6, 2/1, 4/3, etc.
    fifo_dido VARCHAR(20),  -- FIFO, DIDO, residential
    
    -- Diversity
    female_pct FLOAT,
    indigenous_pct FLOAT,
    local_pct FLOAT,
    
    -- Metadata
    extraction_confidence FLOAT DEFAULT 0.8,
    source_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workforce_symbol ON extracted_workforce(symbol);
CREATE INDEX IF NOT EXISTS idx_workforce_project ON extracted_workforce(project_id);

-- Done!
SELECT 'Schema additions complete! New tables and columns added.' as status;
