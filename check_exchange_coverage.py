"""Check what JSE/non-ASX doc records look like."""
import requests, urllib3
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Use etl endpoint to check raw docs for DRD (JSE, 2629 docs)
# Check if there's a way to query specific company docs
r = s.get(f'{BASE}/etl/extraction-coverage?exchange=JSE')
data = r.json()
print("=== JSE Coverage ===")
print(f"Total: {data.get('total_companies')}")
print(f"With resources: {data.get('with_resources')}")
print(f"With economics: {data.get('with_economics')}")
for c in data.get('companies', []):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} res={c.get('resources',0):5d} econ={c.get('economics',0):3d} docs={c.get('pdf_docs',0):5d} text={c.get('docs_with_text',0):5d}")

print("\n=== LSE Coverage ===")
r = s.get(f'{BASE}/etl/extraction-coverage?exchange=LSE')
data = r.json()
for c in data.get('companies', []):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} res={c.get('resources',0):5d} econ={c.get('economics',0):3d} docs={c.get('pdf_docs',0):5d} text={c.get('docs_with_text',0):5d}")

print("\n=== NYSE Coverage ===")
r = s.get(f'{BASE}/etl/extraction-coverage?exchange=NYSE')
data = r.json()
for c in data.get('companies', []):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} res={c.get('resources',0):5d} econ={c.get('economics',0):3d} docs={c.get('pdf_docs',0):5d} text={c.get('docs_with_text',0):5d}")

print("\n=== TSX Coverage ===")
r = s.get(f'{BASE}/etl/extraction-coverage?exchange=TSX')
data = r.json()
for c in data.get('companies', []):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} res={c.get('resources',0):5d} econ={c.get('economics',0):3d} docs={c.get('pdf_docs',0):5d} text={c.get('docs_with_text',0):5d}")

print("\n=== CSE Coverage ===")
r = s.get(f'{BASE}/etl/extraction-coverage?exchange=CSE')
data = r.json()
for c in data.get('companies', []):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} res={c.get('resources',0):5d} econ={c.get('economics',0):3d} docs={c.get('pdf_docs',0):5d} text={c.get('docs_with_text',0):5d}")
