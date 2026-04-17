"""Batch 2: Deep extraction for next 50 gap companies."""
import httpx, time, json, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app"

print("=== BATCH 2: Next 50 gap companies ===")
t0 = time.time()
r = httpx.post(
    f"{BASE}/etl/deep-extract",
    json={"batch_size": 50, "reprocess": False, "download_new": True},
    timeout=600,
    verify=False,
)
d = r.json()
elapsed = time.time() - t0
print(f"Status: {d.get('status')}")
print(f"Elapsed: {elapsed:.0f}s")
print(f"Symbols targeted: {d.get('symbols_targeted')}")
print(f"Symbols processed: {d.get('symbols_processed')}")
print(f"Docs analyzed: {d.get('documents_analyzed')}")
print(f"New PDFs: {d.get('new_pdfs_downloaded')}")
print(f"Tables extracted: {d.get('tables_extracted')}")
print(f"Tables classified: {d.get('tables_classified')}")
print(f"Projects upserted: {d.get('projects_upserted')}")
print(f"Resources inserted: {d.get('resources_inserted')}")
print(f"Economics inserted: {d.get('economics_inserted')}")
print(f"Reserves found: {d.get('reserves_found')}")
print(f"Production found: {d.get('production_found')}")
print(f"Errors: {d.get('errors')}")
if d.get("error_details"):
    for e in d["error_details"][:5]:
        print(f"  ERR: {e}")

# Check coverage
print()
print("=== Updated Coverage ===")
r2 = httpx.get(f"{BASE}/etl/extraction-coverage", timeout=60, verify=False)
cov = r2.json()
print(f"Total: {cov['total_companies']}")
print(f"Covered: {cov['with_data']}")
print(f"Gaps: {cov['gaps']}")
print(f"Coverage: {cov['coverage_pct']}%")

# Check commodity breakdown again
print()
print("=== Updated Commodity Breakdown ===")
for commodity in ["Gold", "Copper", "Lithium", "Iron Ore", "Uranium", "Zinc", "Nickel", "Silver", "Rare Earths", "Platinum"]:
    r3 = httpx.get(f"{BASE}/commodities/{commodity}/peers", timeout=30, verify=False)
    if r3.status_code == 200:
        peers = r3.json()
        total = len(peers)
        with_res = sum(1 for p in peers if p.get("resource_mt"))
        with_econ = sum(1 for p in peers if any(p.get(k) for k in ["npv", "irr", "aisc", "c1_cost"]))
        with_prod = sum(1 for p in peers if p.get("annual_production_oz") or p.get("annual_production_t"))
        print(f"  {commodity:15s}: {total:3d} companies, {with_res:3d} res, {with_econ:3d} econ, {with_prod:3d} prod")
    else:
        print(f"  {commodity:15s}: HTTP {r3.status_code}")
