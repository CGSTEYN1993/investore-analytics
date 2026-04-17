"""
Script to run deep extraction and verify data coverage improvements.
"""
import requests
import urllib3
import json
import time

urllib3.disable_warnings()
s = requests.Session()
s.verify = False
base = 'https://web-production-4faa7.up.railway.app/api/v1'

# Step 1: Add missing columns to extracted_economics
print("=" * 60)
print("STEP 1: Adding missing DB columns")
print("=" * 60)

# We need to run a migration - add study_type column if missing
# This needs to be done via an endpoint or direct DB access
# For now let's check if the commodity_breakdown fix works

print("\n" + "=" * 60)
print("STEP 2: Test commodity breakdown (should now show data)")
print("=" * 60)

for commodity in ['gold', 'copper', 'lithium']:
    r = s.get(f'{base}/commodity-breakdown/{commodity}')
    data = r.json()
    companies = data.get('companies', [])
    total = data.get('total', 0)
    
    with_res = sum(1 for c in companies if c.get('resources_mt') or c.get('mi_resources_mt') or c.get('inferred_mt'))
    with_econ = sum(1 for c in companies if c.get('npv') or c.get('irr') or c.get('aisc'))
    
    print(f"\n{commodity.upper()}: {total} companies")
    print(f"  With resources: {with_res}/{total}")
    print(f"  With economics: {with_econ}/{total}")
    
    # Show companies with data
    for c in companies:
        if c.get('resources_mt') or c.get('npv'):
            print(f"    {c['ticker']}: res_mt={c.get('resources_mt')}, npv={c.get('npv')}, irr={c.get('irr')}, aisc={c.get('aisc')}")

print("\n" + "=" * 60)
print("STEP 3: Check extraction coverage report")
print("=" * 60)

r = s.get(f'{base}/etl/extraction-coverage')
data = r.json()
print(f"Total companies: {data.get('total_companies')}")
print(f"With resources: {data.get('with_resources')}")
print(f"With economics: {data.get('with_economics')}")
print(f"Coverage: {data.get('coverage_pct')}%")

# Show companies with most data
companies = data.get('companies', [])
companies_with_data = sorted(
    [c for c in companies if c.get('has_data')],
    key=lambda c: c.get('resources', 0) + c.get('economics', 0),
    reverse=True
)
print(f"\nTop companies with data:")
for c in companies_with_data[:20]:
    print(f"  {c['symbol']:10s} {c['exchange']:5s} {c['commodity']:15s} res={c['resources']:5d} econ={c['economics']:3d} docs={c['pdf_docs']:5d} text={c['docs_with_text']:5d}")

# Show companies without data that have documents
no_data_with_docs = sorted(
    [c for c in companies if not c.get('has_data') and c.get('docs_with_text', 0) > 0],
    key=lambda c: c.get('docs_with_text', 0),
    reverse=True
)
print(f"\nCompanies WITHOUT data but WITH text ({len(no_data_with_docs)}):")
for c in no_data_with_docs[:20]:
    print(f"  {c['symbol']:10s} {c['exchange']:5s} {c['commodity']:15s} docs={c['pdf_docs']:5d} text={c['docs_with_text']:5d}")

print("\n" + "=" * 60)
print("STEP 4: Run deep extraction on gap companies")
print("=" * 60)

# Run deep extraction - first batch of 50 gap companies
print("\nStarting deep extraction (batch 1: 50 companies)...")
r = s.post(f'{base}/etl/deep-extract?batch_size=50&download_new=true', timeout=600)
data = r.json()
print(f"Status: {data.get('status')}")
print(f"Elapsed: {data.get('elapsed_sec')}s")
print(f"Symbols targeted: {data.get('symbols_targeted')}")
print(f"Symbols processed: {data.get('symbols_processed')}")
print(f"Docs analyzed: {data.get('documents_analyzed')}")
print(f"New PDFs downloaded: {data.get('new_pdfs_downloaded')}")
print(f"Tables extracted: {data.get('tables_extracted')}")
print(f"Tables classified: {data.get('tables_classified')}")
print(f"Projects upserted: {data.get('projects_upserted')}")
print(f"Resources inserted: {data.get('resources_inserted')}")
print(f"Economics inserted: {data.get('economics_inserted')}")
print(f"Reserves found: {data.get('reserves_found')}")
print(f"Production found: {data.get('production_found')}")
print(f"Errors: {data.get('error_count')}")
if data.get('errors'):
    for e in data['errors'][:5]:
        print(f"  ERROR: {e}")

# Check updated coverage
print("\n" + "=" * 60)
print("STEP 5: Check updated coverage")
print("=" * 60)

r = s.get(f'{base}/etl/gap-analysis')
data = r.json()
print(f"Total: {data.get('total_companies')}")
print(f"Covered: {data.get('covered')}")
print(f"Gaps: {data.get('gaps')}")
print(f"Coverage: {data.get('coverage_pct')}%")
