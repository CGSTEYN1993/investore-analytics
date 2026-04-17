"""Direct DB check: what's in the resource estimates table?"""
import httpx, urllib3, json
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Re-run the EXACT test from run_deep_extraction.py (Step 2)
print("=== Exact test from run_deep_extraction.py ===")
import requests
s = requests.Session()
s.verify = False

for commodity in ['gold', 'copper', 'lithium']:
    r = s.get(f'{BASE}/commodity-breakdown/{commodity}')
    data = r.json()
    companies = data.get('companies', [])
    total = data.get('total', 0)
    
    with_res = sum(1 for c in companies if c.get('resources_mt') or c.get('mi_resources_mt') or c.get('inferred_mt'))
    with_econ = sum(1 for c in companies if c.get('npv') or c.get('irr') or c.get('aisc'))
    
    print(f"\n{commodity.upper()}: {total} companies")
    print(f"  With resources: {with_res}/{total}")
    print(f"  With economics: {with_econ}/{total}")
    
    # Show first 5 companies with their data keys
    for c in companies[:5]:
        data_keys = {k: v for k, v in c.items() if v is not None and k not in ['ticker', 'name', 'exchange', 'company_type', 'primary_commodity']}
        print(f"  {c.get('ticker','?')}: {data_keys}")

# Check raw resource estimates via etl db-status
print("\n=== DB Status ===")
r = s.get(f'{BASE}/etl/db-status')
data = r.json()
if isinstance(data, dict):
    for k, v in data.items():
        if 'resource' in str(k).lower() or 'econ' in str(k).lower() or 'project' in str(k).lower():
            print(f"  {k}: {v}")

# Check gap-fill status which also queries DB
print("\n=== Gap Analysis ===")
r = s.get(f'{BASE}/etl/gap-analysis')
data = r.json()
print(f"  Total companies: {data.get('total_companies')}")
print(f"  With data: {data.get('companies_with_data')}")
print(f"  Coverage: {data.get('coverage_pct')}%")
# Show gap breakdown
for k in ['gap_companies_count', 'fillable_from_text', 'unfillable']:
    print(f"  {k}: {data.get(k)}")
