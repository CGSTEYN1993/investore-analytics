-- =============================================================================
-- InvestOre Analytics - Auto Extraction Schema
-- 
-- Tables for the Auto Extraction Railway Service
-- Run this migration on Railway PostgreSQL to set up extraction tracking
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Extraction Jobs Table
-- Tracks all extraction jobs from the Auto Extraction Service
-- =============================================================================

CREATE TABLE IF NOT EXISTS extraction_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    inserted_items INTEGER DEFAULT 0,
    updated_items INTEGER DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    
    -- Metadata (symbols processed, options, etc.)
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused'))
);

-- Indexes for extraction_jobs
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_source ON extraction_jobs(source_type);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_status ON extraction_jobs(status);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_created ON extraction_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_source_status ON extraction_jobs(source_type, status);


-- =============================================================================
-- Extraction Checkpoints Table
-- Stores checkpoints for resumable extractions
-- =============================================================================

CREATE TABLE IF NOT EXISTS extraction_checkpoints (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    checkpoint_key VARCHAR(255) NOT NULL,
    checkpoint_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(source_type, checkpoint_key)
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_source ON extraction_checkpoints(source_type);


-- =============================================================================
-- Extracted Documents Table
-- Stores metadata about all fetched documents/announcements
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_documents (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(200) UNIQUE NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    
    -- Company info
    symbol VARCHAR(20),
    exchange VARCHAR(20),
    
    -- Document info
    title TEXT,
    document_url TEXT,
    pdf_url TEXT,
    local_path TEXT,
    
    -- Dates
    announcement_date DATE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Classification
    document_type VARCHAR(50),
    is_price_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Processing
    processing_status VARCHAR(20) DEFAULT 'pending',
    extracted_data JSONB DEFAULT '{}',
    full_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_processing_status CHECK (
        processing_status IN ('pending', 'processing', 'completed', 'failed', 'no_content', 'skipped')
    )
);

-- Indexes for extracted_documents
CREATE INDEX IF NOT EXISTS idx_extracted_docs_source ON extracted_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_symbol ON extracted_documents(symbol);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_exchange ON extracted_documents(exchange);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_date ON extracted_documents(announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_status ON extracted_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_type ON extracted_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_extracted_docs_symbol_date ON extracted_documents(symbol, announcement_date DESC);


-- =============================================================================
-- Extracted Drilling Results Table
-- Stores drilling results parsed from announcements
-- =============================================================================

CREATE TABLE IF NOT EXISTS extracted_drilling_results (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    document_id VARCHAR(200),
    
    -- Hole info
    hole_id VARCHAR(50),
    
    -- Interval
    depth_from NUMERIC(10, 2),
    depth_to NUMERIC(10, 2),
    interval NUMERIC(10, 2),
    
    -- Grade
    grade NUMERIC(15, 6),
    grade_unit VARCHAR(20),
    commodity VARCHAR(20),
    
    -- Intersection type
    intersection_type VARCHAR(50), -- 'main', 'including', 'within'
    
    -- Location (if available)
    azimuth NUMERIC(6, 2),
    dip NUMERIC(6, 2),
    easting NUMERIC(15, 2),
    northing NUMERIC(15, 2),
    
    -- Confidence
    confidence_score NUMERIC(3, 2) DEFAULT 0.5,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_drilling_document FOREIGN KEY (document_id) 
        REFERENCES extracted_documents(document_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_drilling_symbol ON extracted_drilling_results(symbol);
CREATE INDEX IF NOT EXISTS idx_drilling_commodity ON extracted_drilling_results(commodity);
CREATE INDEX IF NOT EXISTS idx_drilling_document ON extracted_drilling_results(document_id);
CREATE INDEX IF NOT EXISTS idx_drilling_grade ON extracted_drilling_results(grade DESC);


-- =============================================================================
-- Add document_id column to existing tables if not exists
-- =============================================================================

-- Add document_id to extracted_resource_estimates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extracted_resource_estimates' AND column_name = 'document_id'
    ) THEN
        ALTER TABLE extracted_resource_estimates ADD COLUMN document_id VARCHAR(200);
        CREATE INDEX idx_resource_document ON extracted_resource_estimates(document_id);
    END IF;
END $$;

-- Add document_id to extracted_economics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extracted_economics' AND column_name = 'document_id'
    ) THEN
        ALTER TABLE extracted_economics ADD COLUMN document_id VARCHAR(200);
        CREATE INDEX idx_economics_document ON extracted_economics(document_id);
    END IF;
END $$;

-- Add confidence_score to extracted_resource_estimates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extracted_resource_estimates' AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE extracted_resource_estimates ADD COLUMN confidence_score NUMERIC(3, 2) DEFAULT 0.5;
    END IF;
END $$;

-- Add confidence_score to extracted_economics
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'extracted_economics' AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE extracted_economics ADD COLUMN confidence_score NUMERIC(3, 2) DEFAULT 0.5;
    END IF;
END $$;


-- =============================================================================
-- Extraction Statistics View
-- Provides a summary view of extraction activity
-- =============================================================================

CREATE OR REPLACE VIEW extraction_stats AS
SELECT 
    -- Jobs stats
    (SELECT COUNT(*) FROM extraction_jobs WHERE created_at > NOW() - INTERVAL '7 days') as jobs_last_7_days,
    (SELECT COUNT(*) FROM extraction_jobs WHERE status = 'completed' AND created_at > NOW() - INTERVAL '7 days') as jobs_completed_7_days,
    (SELECT COUNT(*) FROM extraction_jobs WHERE status = 'failed' AND created_at > NOW() - INTERVAL '7 days') as jobs_failed_7_days,
    
    -- Documents stats
    (SELECT COUNT(*) FROM extracted_documents) as total_documents,
    (SELECT COUNT(*) FROM extracted_documents WHERE processing_status = 'pending') as pending_documents,
    (SELECT COUNT(*) FROM extracted_documents WHERE processing_status = 'completed') as processed_documents,
    
    -- Data stats
    (SELECT COUNT(*) FROM extracted_resource_estimates) as total_resources,
    (SELECT COUNT(*) FROM extracted_economics) as total_economics,
    (SELECT COUNT(*) FROM extracted_drilling_results) as total_drilling,
    
    -- Recent activity
    (SELECT MAX(created_at) FROM extraction_jobs) as last_job_created,
    (SELECT MAX(completed_at) FROM extraction_jobs WHERE status = 'completed') as last_job_completed;


-- =============================================================================
-- Source Statistics View
-- Breakdown by data source
-- =============================================================================

CREATE OR REPLACE VIEW extraction_source_stats AS
SELECT 
    source_type,
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE processing_status = 'completed') as processed,
    COUNT(*) FILTER (WHERE processing_status = 'pending') as pending,
    COUNT(*) FILTER (WHERE processing_status = 'failed') as failed,
    MIN(announcement_date) as earliest_date,
    MAX(announcement_date) as latest_date,
    MAX(created_at) as last_fetched
FROM extracted_documents
GROUP BY source_type
ORDER BY total_documents DESC;


-- =============================================================================
-- Grant permissions (adjust for your user)
-- =============================================================================

-- Grant all to investore user (Railway uses this by default)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Comments for documentation
COMMENT ON TABLE extraction_jobs IS 'Tracks extraction jobs from the Auto Extraction Railway Service';
COMMENT ON TABLE extraction_checkpoints IS 'Stores checkpoints for resumable extractions';
COMMENT ON TABLE extracted_documents IS 'Metadata for all fetched documents/announcements';
COMMENT ON TABLE extracted_drilling_results IS 'Drilling results parsed from announcements';
