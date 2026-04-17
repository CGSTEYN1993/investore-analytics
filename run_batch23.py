"""Batch 2+3: Deep extraction for remaining gap companies."""
import httpx, time, json, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

for batch_num in [2, 3]:
    print(f"\n{'='*60}")
    print(f"BATCH {batch_num}: Next 50 gap companies")
    print(f"{'='*60}")
    t0 = time.time()
    r = httpx.post(
        f"{BASE}/etl/deep-extract",
        json={"batch_size": 50, "reprocess": False, "download_new": True},
        timeout=700,
        verify=False,
    )
    d = r.json()
    elapsed = time.time() - t0
    print(f"Status: {d.get('status')}")
    print(f"Elapsed: {elapsed:.0f}s")
    for k in ["symbols_targeted", "symbols_processed", "documents_analyzed",
              "new_pdfs_downloaded", "tables_extracted", "tables_classified",
              "projects_upserted", "resources_inserted", "economics_inserted",
              "reserves_found", "production_found", "errors"]:
        print(f"  {k}: {d.get(k)}")
    if d.get("error_details"):
        for e in d["error_details"][:3]:
            print(f"  ERR: {e}")

# Check final coverage
print(f"\n{'='*60}")
print("FINAL COVERAGE")
print(f"{'='*60}")
r2 = httpx.get(f"{BASE}/etl/extraction-coverage", timeout=60, verify=False)
cov = r2.json()
print(f"Total: {cov['total_companies']}")
print(f"Covered: {cov['with_data']}")
print(f"Gaps: {cov['gaps']}")
print(f"Coverage: {cov['coverage_pct']}%")

# Commodity breakdown
print(f"\n{'='*60}")
print("COMMODITY BREAKDOWN (ALL)")
print(f"{'='*60}")
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
        else:
            print(f"  {commodity:17s}: HTTP {r3.status_code}")
    except Exception as e:
        print(f"  {commodity:17s}: ERROR {e}")
