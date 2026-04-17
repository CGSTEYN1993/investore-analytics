"""Check ASX gap companies specifically - these have real PDFs."""
import requests, urllib3
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

print("=== ASX Coverage ===")
r = s.get(f"{BASE}/etl/extraction-coverage?exchange=ASX")
data = r.json()
print(f"Total ASX: {data.get('total_companies')}")
print(f"With resources: {data.get('with_resources')}")
print(f"With economics: {data.get('with_economics')}")
print(f"Coverage: {data.get('coverage_pct')}%")

companies = data.get("companies", [])
with_data = [c for c in companies if c.get("has_data")]
without_data = [c for c in companies if not c.get("has_data")]

print(f"\nWith data: {len(with_data)}")
print(f"Without data: {len(without_data)}")

# Show gaps with documents
print(f"\nASX companies WITHOUT data:")
for c in sorted(without_data, key=lambda x: x.get("pdf_docs", 0), reverse=True):
    print(f"  {c['symbol']:10s} {c['commodity']:17s} docs={c.get('pdf_docs',0):4d} text={c.get('docs_with_text',0):4d}")

# Check NEM (dual-listed ASX/NYSE) which has quarterly reports
print(f"\n=== NEM (Newmont) sample text ===")
r = s.get(f"{BASE}/etl/sample-text/NEM")
data = r.json()
for doc in data.get("documents", [])[:1]:
    print(f"  Title: {doc.get('title')}")
    print(f"  Method: {doc.get('method')}")
    # Show resource lines
    for line in doc.get("resource_lines", [])[:5]:
        print(f"    > {line[:120]}")
    # Show first 1000 chars
    sample = doc.get("sample", "")
    # Look for production/financial data
    for line in sample.split("\n"):
        lw = line.lower()
        if any(kw in lw for kw in ["production", "revenue", "ebitda", "gold", "copper", "ounces", "tonnes", "sold", "realized", "price"]):
            print(f"    FIN> {line.strip()[:150]}")
