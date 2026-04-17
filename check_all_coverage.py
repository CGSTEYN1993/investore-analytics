"""Check extraction data across multiple companies."""
import json
import urllib.request

API = "https://web-production-4faa7.up.railway.app/api/v1"

# First check the coverage endpoint for the full picture
try:
    resp = urllib.request.urlopen(f"{API}/etl/extraction-coverage", timeout=60)
    d = json.loads(resp.read())
except Exception as e:
    print(f"Coverage endpoint error: {e}")
    d = {"companies": []}

companies = d.get("companies", [])
with_drill = [c for c in companies if c.get("drilling", 0) > 0]
with_res = [c for c in companies if c.get("resources", 0) > 0]
with_econ = [c for c in companies if c.get("economics", 0) > 0]
with_docs = [c for c in companies if c.get("pdf_docs", 0) > 0]
pending = [c for c in companies if c.get("docs_pending", 0) > 0]

print("=" * 60)
print("EXTRACTION COVERAGE — ALL COMPANIES")
print("=" * 60)
print(f"Total companies:          {len(companies)}")
print(f"With PDF documents:       {len(with_docs)}")
print(f"With pending (unproc):    {len(pending)} ({sum(c.get('docs_pending',0) for c in companies)} docs)")
print(f"With resources:           {len(with_res)}")
print(f"With economics:           {len(with_econ)}")
print(f"With drilling intercepts: {len(with_drill)}")
print(f"Total documents:          {d.get('total_documents', 'N/A')}")
print(f"Pending documents:        {d.get('pending_documents', 'N/A')}")
print()

if with_drill:
    print(f"=== Companies with Drilling Data ({len(with_drill)}) ===")
    for c in sorted(with_drill, key=lambda x: -x.get("drilling", 0)):
        print(f"  {c['symbol']:8s} {c['exchange']:5s} drill={c['drilling']:4d}  res={c.get('resources',0):3d}  econ={c.get('economics',0):2d}  docs={c.get('pdf_docs',0)}")
    print()

# Show exchanges breakdown
exchanges = {}
for c in companies:
    ex = c.get("exchange", "?")
    if ex not in exchanges:
        exchanges[ex] = {"total": 0, "with_docs": 0, "with_data": 0, "pending": 0}
    exchanges[ex]["total"] += 1
    if c.get("pdf_docs", 0) > 0:
        exchanges[ex]["with_docs"] += 1
    if c.get("has_data"):
        exchanges[ex]["with_data"] += 1
    exchanges[ex]["pending"] += c.get("docs_pending", 0)

print("=== By Exchange ===")
for ex, s in sorted(exchanges.items(), key=lambda x: -x[1]["total"]):
    print(f"  {ex:6s} total={s['total']:3d}  with_docs={s['with_docs']:3d}  with_data={s['with_data']:3d}  pending={s['pending']}")
