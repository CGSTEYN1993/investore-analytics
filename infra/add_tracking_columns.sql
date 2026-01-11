-- =============================================================================
-- ADD TRACKING COLUMNS - Symbol, Project, Announcement Date
-- =============================================================================
-- This script adds company/project/date tracking columns to extraction tables
-- that are missing them, and populates existing rows using document_id joins.
-- 
-- RUN THIS SCRIPT WITHOUT TRUNCATING ANY TABLES
-- =============================================================================

-- =============================================================================
-- PART 1: ADD MISSING COLUMNS TO TABLES
-- =============================================================================

-- 1. extracted_areas - missing symbol, announcement_date
ALTER TABLE extracted_areas ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_areas ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 2. extracted_economics - missing symbol, announcement_date
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_economics ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 3. extracted_resource_estimates - missing symbol, announcement_date
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_resource_estimates ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 4. extracted_ore_reserves - missing symbol, announcement_date
ALTER TABLE extracted_ore_reserves ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_ore_reserves ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 5. extracted_permits - missing symbol, announcement_date
ALTER TABLE extracted_permits ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_permits ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 6. extracted_production_estimates - missing symbol, announcement_date
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_production_estimates ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 7. extracted_operational_metrics - missing symbol, announcement_date
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_operational_metrics ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 8. extracted_study_findings - missing symbol, announcement_date
ALTER TABLE extracted_study_findings ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_study_findings ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 9. extracted_ebitda_profiles - missing symbol, announcement_date
ALTER TABLE extracted_ebitda_profiles ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_ebitda_profiles ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 10. extracted_drill_intercepts - missing symbol, document_id, project_id, announcement_date
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS document_id VARCHAR(32);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES extracted_projects(id) ON DELETE SET NULL;
ALTER TABLE extracted_drill_intercepts ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 11. extracted_infrastructure - missing announcement_date
ALTER TABLE extracted_infrastructure ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 12. extracted_royalties - missing announcement_date  
ALTER TABLE extracted_royalties ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 13. extracted_esg_metrics - missing announcement_date
ALTER TABLE extracted_esg_metrics ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 14. extracted_byproducts - missing announcement_date
ALTER TABLE extracted_byproducts ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 15. extracted_drilling_results - missing announcement_date (already has symbol and project_id)
ALTER TABLE extracted_drilling_results ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- =============================================================================
-- PART 2: CREATE INDEXES ON NEW COLUMNS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_areas_symbol ON extracted_areas(symbol);
CREATE INDEX IF NOT EXISTS idx_areas_date ON extracted_areas(announcement_date);

CREATE INDEX IF NOT EXISTS idx_economics_symbol ON extracted_economics(symbol);
CREATE INDEX IF NOT EXISTS idx_economics_date ON extracted_economics(announcement_date);

CREATE INDEX IF NOT EXISTS idx_resources_symbol ON extracted_resource_estimates(symbol);
CREATE INDEX IF NOT EXISTS idx_resources_date ON extracted_resource_estimates(announcement_date);

CREATE INDEX IF NOT EXISTS idx_reserves_symbol ON extracted_ore_reserves(symbol);
CREATE INDEX IF NOT EXISTS idx_reserves_date ON extracted_ore_reserves(announcement_date);

CREATE INDEX IF NOT EXISTS idx_permits_symbol ON extracted_permits(symbol);
CREATE INDEX IF NOT EXISTS idx_permits_date ON extracted_permits(announcement_date);

CREATE INDEX IF NOT EXISTS idx_production_est_symbol ON extracted_production_estimates(symbol);
CREATE INDEX IF NOT EXISTS idx_production_est_date ON extracted_production_estimates(announcement_date);

CREATE INDEX IF NOT EXISTS idx_operational_symbol ON extracted_operational_metrics(symbol);
CREATE INDEX IF NOT EXISTS idx_operational_date ON extracted_operational_metrics(announcement_date);

CREATE INDEX IF NOT EXISTS idx_study_symbol ON extracted_study_findings(symbol);
CREATE INDEX IF NOT EXISTS idx_study_date ON extracted_study_findings(announcement_date);

CREATE INDEX IF NOT EXISTS idx_ebitda_symbol ON extracted_ebitda_profiles(symbol);
CREATE INDEX IF NOT EXISTS idx_ebitda_date ON extracted_ebitda_profiles(announcement_date);

CREATE INDEX IF NOT EXISTS idx_intercepts_symbol ON extracted_drill_intercepts(symbol);
CREATE INDEX IF NOT EXISTS idx_intercepts_document ON extracted_drill_intercepts(document_id);
CREATE INDEX IF NOT EXISTS idx_intercepts_project ON extracted_drill_intercepts(project_id);
CREATE INDEX IF NOT EXISTS idx_intercepts_date ON extracted_drill_intercepts(announcement_date);

CREATE INDEX IF NOT EXISTS idx_infra_date ON extracted_infrastructure(announcement_date);
CREATE INDEX IF NOT EXISTS idx_royalties_date ON extracted_royalties(announcement_date);
CREATE INDEX IF NOT EXISTS idx_esg_date ON extracted_esg_metrics(announcement_date);
CREATE INDEX IF NOT EXISTS idx_byproducts_date ON extracted_byproducts(announcement_date);
CREATE INDEX IF NOT EXISTS idx_drilling_date ON extracted_drilling_results(announcement_date);

-- =============================================================================
-- PART 3: POPULATE MISSING DATA FROM DOCUMENT JOINS
-- =============================================================================

-- Populate from extracted_pdf_documents (source of truth for symbol and announcement_date)

-- 1. extracted_areas
UPDATE extracted_areas ea
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE ea.project_id = p.id
AND (ea.symbol IS NULL OR ea.announcement_date IS NULL);

-- Also update from direct document_id reference
UPDATE extracted_areas ea
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE ea.document_id = epd.document_id
AND (ea.symbol IS NULL OR ea.announcement_date IS NULL);

-- 2. extracted_economics
UPDATE extracted_economics ee
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE ee.project_id = p.id
AND (ee.symbol IS NULL OR ee.announcement_date IS NULL);

UPDATE extracted_economics ee
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE ee.document_id = epd.document_id
AND (ee.symbol IS NULL OR ee.announcement_date IS NULL);

-- 3. extracted_resource_estimates
UPDATE extracted_resource_estimates ere
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE ere.project_id = p.id
AND (ere.symbol IS NULL OR ere.announcement_date IS NULL);

UPDATE extracted_resource_estimates ere
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE ere.document_id = epd.document_id
AND (ere.symbol IS NULL OR ere.announcement_date IS NULL);

-- 4. extracted_ore_reserves
UPDATE extracted_ore_reserves eor
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE eor.project_id = p.id
AND (eor.symbol IS NULL OR eor.announcement_date IS NULL);

UPDATE extracted_ore_reserves eor
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE eor.document_id = epd.document_id
AND (eor.symbol IS NULL OR eor.announcement_date IS NULL);

-- 5. extracted_permits
UPDATE extracted_permits ep
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE ep.project_id = p.id
AND (ep.symbol IS NULL OR ep.announcement_date IS NULL);

UPDATE extracted_permits ep
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE ep.document_id = epd.document_id
AND (ep.symbol IS NULL OR ep.announcement_date IS NULL);

-- 6. extracted_production_estimates
UPDATE extracted_production_estimates epe
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE epe.project_id = p.id
AND (epe.symbol IS NULL OR epe.announcement_date IS NULL);

UPDATE extracted_production_estimates epe
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE epe.document_id = epd.document_id
AND (epe.symbol IS NULL OR epe.announcement_date IS NULL);

-- 7. extracted_operational_metrics
UPDATE extracted_operational_metrics eom
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE eom.project_id = p.id
AND (eom.symbol IS NULL OR eom.announcement_date IS NULL);

UPDATE extracted_operational_metrics eom
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE eom.document_id = epd.document_id
AND (eom.symbol IS NULL OR eom.announcement_date IS NULL);

-- 8. extracted_study_findings
UPDATE extracted_study_findings esf
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE esf.project_id = p.id
AND (esf.symbol IS NULL OR esf.announcement_date IS NULL);

UPDATE extracted_study_findings esf
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE esf.document_id = epd.document_id
AND (esf.symbol IS NULL OR esf.announcement_date IS NULL);

-- 9. extracted_ebitda_profiles
UPDATE extracted_ebitda_profiles eep
SET symbol = p.symbol,
    announcement_date = epd.announcement_date
FROM extracted_projects p
JOIN extracted_pdf_documents epd ON p.document_id = epd.document_id
WHERE eep.project_id = p.id
AND (eep.symbol IS NULL OR eep.announcement_date IS NULL);

UPDATE extracted_ebitda_profiles eep
SET symbol = epd.symbol,
    announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE eep.document_id = epd.document_id
AND (eep.symbol IS NULL OR eep.announcement_date IS NULL);

-- 10. extracted_drill_intercepts (from drilling_results)
UPDATE extracted_drill_intercepts edi
SET document_id = edr.document_id,
    symbol = edr.symbol,
    project_id = edr.project_id,
    announcement_date = epd.announcement_date
FROM extracted_drilling_results edr
LEFT JOIN extracted_pdf_documents epd ON edr.document_id = epd.document_id
WHERE edi.drilling_result_id = edr.id
AND (edi.document_id IS NULL OR edi.symbol IS NULL OR edi.announcement_date IS NULL);

-- 11. extracted_infrastructure
UPDATE extracted_infrastructure ei
SET announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE ei.document_id = epd.document_id
AND ei.announcement_date IS NULL;

-- 12. extracted_royalties
UPDATE extracted_royalties er
SET announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE er.document_id = epd.document_id
AND er.announcement_date IS NULL;

-- 13. extracted_esg_metrics
UPDATE extracted_esg_metrics eem
SET announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE eem.document_id = epd.document_id
AND eem.announcement_date IS NULL;

-- 14. extracted_byproducts
UPDATE extracted_byproducts eb
SET announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE eb.document_id = epd.document_id
AND eb.announcement_date IS NULL;

-- 15. extracted_drilling_results
UPDATE extracted_drilling_results edr
SET announcement_date = epd.announcement_date
FROM extracted_pdf_documents epd
WHERE edr.document_id = epd.document_id
AND edr.announcement_date IS NULL;

-- =============================================================================
-- PART 4: VERIFY RESULTS
-- =============================================================================

SELECT 'Column additions and data population complete!' as status;

-- Show counts of rows with missing tracking data
SELECT 'extracted_areas' as table_name, 
       COUNT(*) as total_rows,
       COUNT(*) FILTER (WHERE symbol IS NULL) as missing_symbol,
       COUNT(*) FILTER (WHERE announcement_date IS NULL) as missing_date
FROM extracted_areas
UNION ALL
SELECT 'extracted_economics', COUNT(*), 
       COUNT(*) FILTER (WHERE symbol IS NULL),
       COUNT(*) FILTER (WHERE announcement_date IS NULL)
FROM extracted_economics
UNION ALL
SELECT 'extracted_resource_estimates', COUNT(*), 
       COUNT(*) FILTER (WHERE symbol IS NULL),
       COUNT(*) FILTER (WHERE announcement_date IS NULL)
FROM extracted_resource_estimates
UNION ALL
SELECT 'extracted_ore_reserves', COUNT(*), 
       COUNT(*) FILTER (WHERE symbol IS NULL),
       COUNT(*) FILTER (WHERE announcement_date IS NULL)
FROM extracted_ore_reserves
UNION ALL
SELECT 'extracted_drilling_results', COUNT(*), 
       COUNT(*) FILTER (WHERE symbol IS NULL),
       COUNT(*) FILTER (WHERE announcement_date IS NULL)
FROM extracted_drilling_results
UNION ALL
SELECT 'extracted_drill_intercepts', COUNT(*), 
       COUNT(*) FILTER (WHERE symbol IS NULL),
       COUNT(*) FILTER (WHERE announcement_date IS NULL)
FROM extracted_drill_intercepts;
