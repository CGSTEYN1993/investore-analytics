-- =============================================================================
-- GEOSCIENCE DATA SCHEMA
-- Stores Australian geoscience data from Geoscience Australia and WA DMIRS
-- for map display, company linking, and AI analyst context
-- =============================================================================

-- Operating Mines (from GA + DMIRS)
CREATE TABLE IF NOT EXISTS geoscience_mines (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255),              -- GA/DMIRS feature ID
    name VARCHAR(500) NOT NULL,
    company VARCHAR(500),                -- Operator / Owner
    ticker VARCHAR(20),                  -- Linked ASX/TSX ticker (if matched)
    commodity VARCHAR(500),
    status VARCHAR(100),                 -- Operating, Developing, Care & Maintenance
    mine_type VARCHAR(100),              -- Open Pit, Underground, etc.
    state VARCHAR(20),
    region VARCHAR(200),
    deposit_type VARCHAR(200),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    resource_mt DOUBLE PRECISION,        -- Total resource tonnage
    grade DOUBLE PRECISION,
    grade_unit VARCHAR(20),
    source VARCHAR(100) NOT NULL DEFAULT 'Geoscience Australia',
    layer_type VARCHAR(50) NOT NULL DEFAULT 'operating_mine',  -- operating_mine, developing_mine, critical_mineral
    raw_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- Mineral Deposits (OZMIN + MINEDEX)
CREATE TABLE IF NOT EXISTS geoscience_deposits (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255),
    name VARCHAR(500) NOT NULL,
    commodity VARCHAR(500),
    deposit_type VARCHAR(200),
    deposit_group VARCHAR(200),
    state VARCHAR(20),
    region VARCHAR(200),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    resource_size VARCHAR(100),
    ticker VARCHAR(20),                  -- Linked ticker
    source VARCHAR(100) NOT NULL DEFAULT 'OZMIN',
    raw_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- Boreholes / Drillholes (GA + WAMEX)
CREATE TABLE IF NOT EXISTS geoscience_boreholes (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255),
    name VARCHAR(500) NOT NULL,
    purpose VARCHAR(200),
    status VARCHAR(100),
    depth_m DOUBLE PRECISION,
    driller VARCHAR(500),
    drill_method VARCHAR(100),
    year_drilled INTEGER,
    commodity VARCHAR(200),
    state VARCHAR(20),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    ticker VARCHAR(20),
    source VARCHAR(100) NOT NULL DEFAULT 'Geoscience Australia',
    raw_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- Geochemistry Samples (GSWA)
CREATE TABLE IF NOT EXISTS geoscience_geochemistry (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255),
    sample_id VARCHAR(255),
    name VARCHAR(500),
    sample_type VARCHAR(100),
    rock_type VARCHAR(200),
    geological_unit VARCHAR(200),
    au_ppb DOUBLE PRECISION,
    ag_ppm DOUBLE PRECISION,
    cu_ppm DOUBLE PRECISION,
    pb_ppm DOUBLE PRECISION,
    zn_ppm DOUBLE PRECISION,
    ni_ppm DOUBLE PRECISION,
    state VARCHAR(20) DEFAULT 'WA',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'GSWA',
    raw_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source, source_id)
);

-- Mining Tenements (WA)
CREATE TABLE IF NOT EXISTS geoscience_tenements (
    id SERIAL PRIMARY KEY,
    tenement_id VARCHAR(100) NOT NULL,   -- E45/1234
    tenement_type VARCHAR(50),           -- Exploration, Mining, Prospecting, Retention
    holder VARCHAR(500),
    ticker VARCHAR(20),
    commodity VARCHAR(500),
    area_ha DOUBLE PRECISION,
    status VARCHAR(100),                 -- Live, Pending, Surrendered
    grant_date DATE,
    end_date DATE,
    state VARCHAR(20) DEFAULT 'WA',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    geometry JSONB,                      -- Polygon boundary
    source VARCHAR(100) NOT NULL DEFAULT 'DMIRS',
    raw_properties JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenement_id, source)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_geo_mines_ticker ON geoscience_mines(ticker);
CREATE INDEX IF NOT EXISTS idx_geo_mines_commodity ON geoscience_mines(commodity);
CREATE INDEX IF NOT EXISTS idx_geo_mines_location ON geoscience_mines(lat, lng);
CREATE INDEX IF NOT EXISTS idx_geo_mines_layer ON geoscience_mines(layer_type);

CREATE INDEX IF NOT EXISTS idx_geo_deposits_ticker ON geoscience_deposits(ticker);
CREATE INDEX IF NOT EXISTS idx_geo_deposits_commodity ON geoscience_deposits(commodity);
CREATE INDEX IF NOT EXISTS idx_geo_deposits_location ON geoscience_deposits(lat, lng);

CREATE INDEX IF NOT EXISTS idx_geo_boreholes_ticker ON geoscience_boreholes(ticker);
CREATE INDEX IF NOT EXISTS idx_geo_boreholes_location ON geoscience_boreholes(lat, lng);

CREATE INDEX IF NOT EXISTS idx_geo_geochem_location ON geoscience_geochemistry(lat, lng);
CREATE INDEX IF NOT EXISTS idx_geo_geochem_au ON geoscience_geochemistry(au_ppb);

CREATE INDEX IF NOT EXISTS idx_geo_tenements_ticker ON geoscience_tenements(ticker);
CREATE INDEX IF NOT EXISTS idx_geo_tenements_holder ON geoscience_tenements(holder);
CREATE INDEX IF NOT EXISTS idx_geo_tenements_id ON geoscience_tenements(tenement_id);
