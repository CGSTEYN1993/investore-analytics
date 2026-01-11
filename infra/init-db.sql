-- InvestOre Analytics - Database Initialization Script
-- This script runs on first database startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "timescaledb";  -- Time-series extension

-- Create schemas
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS etl;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions (adjust for your users)
GRANT ALL PRIVILEGES ON SCHEMA public TO investore;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO investore;
GRANT ALL PRIVILEGES ON SCHEMA etl TO investore;
GRANT ALL PRIVILEGES ON SCHEMA audit TO investore;

-- Create hypertables for time-series data (after tables are created by Alembic)
-- These will be run as a post-migration step

-- Function to create hypertable if table exists
CREATE OR REPLACE FUNCTION create_hypertable_if_exists(
    table_name TEXT,
    time_column TEXT
) RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1) THEN
        PERFORM create_hypertable($1, $2, if_not_exists => TRUE);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Index creation helpers
-- These improve query performance for common access patterns

-- Text search index helper
CREATE OR REPLACE FUNCTION create_text_search_index(
    table_name TEXT,
    column_name TEXT
) RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%I_%I_trgm ON %I USING gin (%I gin_trgm_ops)',
        table_name, column_name, table_name, column_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.change_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert audit log to hypertable for efficient time-based queries
SELECT create_hypertable('audit.change_log', 'changed_at', if_not_exists => TRUE);

-- Create index on audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit.change_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit.change_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_time ON audit.change_log(changed_at DESC);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.change_log (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.change_log (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.change_log (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for quick company statistics (refreshed by ETL)
-- This will be created after the main tables exist

-- Retention policy for time-series data
-- Drop data older than 5 years for market prices
-- SELECT add_retention_policy('market_data_prices', INTERVAL '5 years', if_not_exists => TRUE);

-- Continuous aggregates for common queries
-- These will be created after the main tables are populated

COMMENT ON SCHEMA analytics IS 'Derived analytics and aggregated data';
COMMENT ON SCHEMA etl IS 'ETL job tracking and metadata';
COMMENT ON SCHEMA audit IS 'Audit logs and change tracking';

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'InvestOre Analytics database initialization complete';
END $$;
