-- =============================================================================
-- DATA PROVENANCE TRACKING SCHEMA
-- =============================================================================
-- Tracks the source of every extracted data point for full audit trail
-- Enables users to verify data against original sources
-- =============================================================================

-- Source types enum
DO $$ BEGIN
    CREATE TYPE data_source_type AS ENUM (
        'asx_announcement',    -- ASX company announcement
        'tsx_filing',          -- TSX/SEDAR filing
        'jse_sens',            -- JSE SENS announcement
        'cse_news',            -- CSE news release
        'sec_filing',          -- SEC Edgar filing
        'company_website',     -- Company investor relations
        'technical_report',    -- NI 43-101 / JORC Technical Report
        'feasibility_study',   -- PFS/DFS/BFS document
        'annual_report',       -- Annual report
        'quarterly_report',    -- Quarterly activities
        'investor_presentation', -- Investor deck
        'third_party',         -- Third-party data provider
        'manual_entry'         -- Manually entered data
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Confidence level enum
DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM (
        'verified',      -- Manually verified against source
        'high',          -- LLM extracted with high confidence
        'medium',        -- LLM extracted with medium confidence
        'low',           -- LLM extracted with low confidence
        'estimated',     -- Calculated or estimated value
        'unverified'     -- Not yet verified
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- MAIN PROVENANCE TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_provenance (
    id SERIAL PRIMARY KEY,
    
    -- What data point this refers to
    target_table VARCHAR(100) NOT NULL,
    target_column VARCHAR(100) NOT NULL,
    target_row_id INTEGER NOT NULL,
    
    -- The extracted value (for audit)
    extracted_value TEXT,
    
    -- Source document
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE SET NULL,
    source_type VARCHAR(50),
    source_url VARCHAR(1000),
    
    -- Specific location in document
    page_number INTEGER,
    section_name VARCHAR(255),
    table_name VARCHAR(255),
    paragraph_text TEXT,  -- The exact text the data was extracted from
    
    -- Extraction metadata
    extraction_model VARCHAR(50),      -- gpt-4o, gpt-4o-mini, etc.
    extraction_prompt_version VARCHAR(20),
    extraction_timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Confidence scoring
    confidence_score FLOAT,            -- 0.0 to 1.0
    confidence_level VARCHAR(20),
    confidence_reason TEXT,            -- Why this confidence level
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Original vs cleaned value
    raw_extracted_text TEXT,           -- Exact text before cleaning
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Compound index for lookups
    UNIQUE(target_table, target_column, target_row_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_provenance_target ON data_provenance(target_table, target_row_id);
CREATE INDEX IF NOT EXISTS idx_provenance_document ON data_provenance(document_id);
CREATE INDEX IF NOT EXISTS idx_provenance_confidence ON data_provenance(confidence_score);
CREATE INDEX IF NOT EXISTS idx_provenance_unverified ON data_provenance(is_verified) WHERE is_verified = FALSE;

-- =============================================================================
-- SOURCE DOCUMENTS EXTENDED TABLE
-- =============================================================================

-- Add source tracking columns to extracted_pdf_documents if not exists
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS source_type VARCHAR(50);
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS source_url VARCHAR(1000);
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS report_type VARCHAR(50);
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS report_date DATE;
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS qualified_person VARCHAR(255);
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS classification_standard VARCHAR(50);
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS is_official_filing BOOLEAN DEFAULT FALSE;
ALTER TABLE extracted_pdf_documents ADD COLUMN IF NOT EXISTS is_verified_source BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- REPORT CLASSIFICATION TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_classifications (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(32) REFERENCES extracted_pdf_documents(document_id) ON DELETE CASCADE,
    
    -- Report classification
    report_category VARCHAR(50) NOT NULL,  -- technical_report, feasibility, announcement, etc.
    report_subcategory VARCHAR(50),        -- pfs, dfs, bfs, maiden_resource, etc.
    
    -- Compliance standards
    jorc_compliant BOOLEAN DEFAULT FALSE,
    ni_43_101_compliant BOOLEAN DEFAULT FALSE,
    sk_1300_compliant BOOLEAN DEFAULT FALSE,
    samrec_compliant BOOLEAN DEFAULT FALSE,
    
    -- Qualified persons
    qualified_persons JSONB DEFAULT '[]',  -- Array of {name, role, company, qualification}
    
    -- Effective dates
    effective_date DATE,
    report_date DATE,
    
    -- Reliability scoring
    reliability_score FLOAT,  -- 0.0 to 1.0 based on source quality
    reliability_factors JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_report_class_category ON report_classifications(report_category);

-- =============================================================================
-- EXTRACTION AUDIT LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS extraction_audit_log (
    id SERIAL PRIMARY KEY,
    
    -- Extraction run info
    extraction_run_id VARCHAR(50) NOT NULL,
    extractor_version VARCHAR(20),
    model_used VARCHAR(50),
    
    -- Target info
    document_id VARCHAR(32),
    symbol VARCHAR(20),
    
    -- Extraction details
    prompt_used TEXT,
    raw_response TEXT,
    parsed_response JSONB,
    
    -- Results
    tables_updated JSONB DEFAULT '[]',
    rows_inserted INTEGER DEFAULT 0,
    rows_updated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds FLOAT,
    
    -- Tokens used (for cost tracking)
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    estimated_cost_usd FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_document ON extraction_audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_run ON extraction_audit_log(extraction_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON extraction_audit_log(created_at);

-- =============================================================================
-- DATA QUALITY TRACKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_quality_issues (
    id SERIAL PRIMARY KEY,
    
    -- Target
    target_table VARCHAR(100) NOT NULL,
    target_row_id INTEGER NOT NULL,
    symbol VARCHAR(20),
    
    -- Issue details
    issue_type VARCHAR(50) NOT NULL,  -- missing_data, inconsistent, outlier, duplicate
    issue_severity VARCHAR(20) NOT NULL,  -- critical, high, medium, low
    issue_description TEXT NOT NULL,
    
    -- Suggested fix
    suggested_fix TEXT,
    auto_fixable BOOLEAN DEFAULT FALSE,
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_issues_table ON data_quality_issues(target_table);
CREATE INDEX IF NOT EXISTS idx_quality_issues_symbol ON data_quality_issues(symbol);
CREATE INDEX IF NOT EXISTS idx_quality_issues_unresolved ON data_quality_issues(is_resolved) WHERE is_resolved = FALSE;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to record provenance when inserting data
CREATE OR REPLACE FUNCTION record_provenance(
    p_target_table VARCHAR,
    p_target_column VARCHAR,
    p_target_row_id INTEGER,
    p_extracted_value TEXT,
    p_document_id VARCHAR,
    p_source_type VARCHAR,
    p_source_url VARCHAR,
    p_confidence_score FLOAT,
    p_extraction_model VARCHAR DEFAULT 'gpt-4o-mini',
    p_raw_text TEXT DEFAULT NULL,
    p_page_number INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    provenance_id INTEGER;
BEGIN
    INSERT INTO data_provenance (
        target_table, target_column, target_row_id,
        extracted_value, document_id, source_type, source_url,
        confidence_score, extraction_model, raw_extracted_text, page_number,
        confidence_level
    ) VALUES (
        p_target_table, p_target_column, p_target_row_id,
        p_extracted_value, p_document_id, p_source_type, p_source_url,
        p_confidence_score, p_extraction_model, p_raw_text, p_page_number,
        CASE 
            WHEN p_confidence_score >= 0.9 THEN 'high'
            WHEN p_confidence_score >= 0.7 THEN 'medium'
            WHEN p_confidence_score >= 0.5 THEN 'low'
            ELSE 'unverified'
        END
    )
    ON CONFLICT (target_table, target_column, target_row_id) 
    DO UPDATE SET
        extracted_value = EXCLUDED.extracted_value,
        confidence_score = EXCLUDED.confidence_score,
        extraction_timestamp = NOW()
    RETURNING id INTO provenance_id;
    
    RETURN provenance_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get data with provenance
CREATE OR REPLACE FUNCTION get_data_with_provenance(
    p_table VARCHAR,
    p_row_id INTEGER
)
RETURNS TABLE (
    column_name VARCHAR,
    value TEXT,
    source_url VARCHAR,
    confidence_score FLOAT,
    is_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.target_column::VARCHAR,
        dp.extracted_value::TEXT,
        dp.source_url::VARCHAR,
        dp.confidence_score,
        dp.is_verified
    FROM data_provenance dp
    WHERE dp.target_table = p_table
    AND dp.target_row_id = p_row_id
    ORDER BY dp.target_column;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SUMMARY VIEW
-- =============================================================================

CREATE OR REPLACE VIEW data_provenance_summary AS
SELECT 
    target_table,
    COUNT(*) as total_records,
    AVG(confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE is_verified) as verified_count,
    COUNT(*) FILTER (WHERE confidence_level = 'high') as high_confidence_count,
    COUNT(*) FILTER (WHERE confidence_level = 'low') as low_confidence_count,
    COUNT(DISTINCT document_id) as unique_sources
FROM data_provenance
GROUP BY target_table
ORDER BY target_table;

SELECT 'Data provenance schema created successfully!' as status;
