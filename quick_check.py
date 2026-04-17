"""Quick check: commodity breakdown results + coverage."""
import httpx, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Coverage
r2 = httpx.get(f"{BASE}/etl/extraction-coverage", timeout=60, verify=False)
cov = r2.json()
print(f"Total: {cov['total_companies']}")
print(f"With resources: {cov['with_resources']}")
print(f"With economics: {cov['with_economics']}")
print(f"Coverage: {cov['coverage_pct']}%")

# Count companies with any data
companies = cov.get("companies", [])
with_data = sum(1 for c in companies if c.get("has_data"))
without_data = sum(1 for c in companies if not c.get("has_data"))
with_docs = sum(1 for c in companies if not c.get("has_data") and c.get("docs_with_text", 0) > 0)
without_docs = sum(1 for c in companies if not c.get("has_data") and c.get("docs_with_text", 0) == 0)
print(f"\nWith any data: {with_data}")
print(f"Without data: {without_data}")
print(f"  - With text docs (can extract more): {with_docs}")
print(f"  - Without text docs (need download): {without_docs}")

# Show companies without data but with text
print("\nCompanies without data but WITH text:")
for c in sorted(companies, key=lambda x: x.get("docs_with_text", 0), reverse=True):
    if not c.get("has_data") and c.get("docs_with_text", 0) > 0:
        print(f"  {c['symbol']:10s} {c['exchange']:5s} {c['commodity']:17s} docs={c['pdf_docs']:4d} text={c['docs_with_text']:4d}")

# Show companies without data and WITHOUT text
print("\nCompanies without data AND without text (top 30):")
for c in sorted(companies, key=lambda x: x.get("pdf_docs", 0), reverse=True)[:30]:
    if not c.get("has_data") and c.get("docs_with_text", 0) == 0:
        print(f"  {c['symbol']:10s} {c['exchange']:5s} {c['commodity']:17s} docs={c['pdf_docs']:4d}")

# Commodity breakdown
print(f"\nCOMMODITY BREAKDOWN:")
for commodity in ["Gold", "Copper", "Lithium", "Iron Ore", "Uranium",
                   "Zinc", "Nickel", "Silver", "Rare Earths", "Platinum",
                   "Manganese", "Tin", "Cobalt", "Graphite", "Diversified",
                   "Mineral Sands", "Coal"]:
    try:
        r3 = httpx.get(f"{BASE}/commodities/{commodity}/peers", timeout=30, verify=False)
        if r3.status_code == 200:
            peers = r3.json()
            total = len(peers)
            with_res = sum(1 for p in peers if p.get("resource_mt"))
            with_econ = sum(1 for p in peers if any(p.get(k) for k in ["npv", "irr", "aisc", "c1_cost"]))
            print(f"  {commodity:17s}: {total:3d} companies, {with_res:3d} resources, {with_econ:3d} economics")
        elif r3.status_code == 404:
            pass  # No peers endpoint for this commodity
    except Exception as e:
        print(f"  {commodity:17s}: ERROR {e}")
