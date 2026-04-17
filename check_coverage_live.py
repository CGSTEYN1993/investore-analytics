"""Quick check of extraction coverage from live API."""
import json
import urllib.request

url = "https://web-production-4faa7.up.railway.app/api/v1/etl/extraction-coverage"
resp = urllib.request.urlopen(url, timeout=60)
d = json.loads(resp.read())

companies = d.get("companies", [])
with_res = sum(1 for c in companies if c.get("resources", 0) > 0)
with_econ = sum(1 for c in companies if c.get("economics", 0) > 0)
with_drill = sum(1 for c in companies if c.get("drilling", 0) > 0)
with_docs = sum(1 for c in companies if c.get("documents", 0) > 0)
with_text = sum(1 for c in companies if c.get("documents_with_text", 0) > 0)

print(f"=== Extraction Coverage Summary ===")
print(f"Total companies in registry: {len(companies)}")
print(f"Companies with documents:    {with_docs}")
print(f"Companies with text content: {with_text}")
print(f"Companies with resources:    {with_res}")
print(f"Companies with economics:    {with_econ}")
print(f"Companies with drilling:     {with_drill}")
print()

# Check how many documents total, and how many are unprocessed
url2 = "https://web-production-4faa7.up.railway.app/api/v1/mining/overview"
try:
    resp2 = urllib.request.urlopen(url2, timeout=30)
    d2 = json.loads(resp2.read())
except Exception:
    d2 = {}

# Show some companies with drilling data
drill_companies = [c for c in companies if c.get("drilling", 0) > 0]
if drill_companies:
    print(f"=== Companies with Drilling Data ({len(drill_companies)}) ===")
    for c in sorted(drill_companies, key=lambda x: -x.get("drilling", 0))[:20]:
        print(f"  {c['symbol']:8s} drilling={c['drilling']:4d}  resources={c.get('resources',0):3d}  economics={c.get('economics',0):2d}  docs={c.get('documents',0)}")

# Show top companies by document count (that haven't been fully extracted yet)
print()
print(f"=== Top companies with docs but NO resources (need extraction) ===")
needs_extraction = [c for c in companies if c.get("documents_with_text", 0) > 0 and c.get("resources", 0) == 0]
for c in sorted(needs_extraction, key=lambda x: -x.get("documents_with_text", 0))[:15]:
    print(f"  {c['symbol']:8s} docs_with_text={c.get('documents_with_text',0):3d}  exchange={c.get('exchange','?')}")
