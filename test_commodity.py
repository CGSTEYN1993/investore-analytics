"""Test commodity breakdown with correct URL."""
import httpx, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

print("=== COMMODITY BREAKDOWN (correct URLs) ===")
for commodity in ["Gold", "Copper", "Lithium", "Iron Ore", "Uranium",
                   "Zinc", "Nickel", "Silver", "Rare Earths", "Platinum",
                   "Manganese", "Tin", "Cobalt", "Graphite", "Diversified",
                   "Mineral Sands", "Coal"]:
    try:
        r = httpx.get(f"{BASE}/commodity-breakdown/{commodity}", timeout=30, verify=False)
        if r.status_code == 200:
            data = r.json()
            companies = data.get("companies", [])
            total = len(companies)
            with_res = sum(1 for c in companies if c.get("resource_mt"))
            with_econ = sum(1 for c in companies if any(c.get(k) for k in ["npv_usd", "irr_pct", "aisc", "c1_cost"]))
            with_reserve = sum(1 for c in companies if c.get("reserve_mt"))
            with_prod = sum(1 for c in companies if c.get("annual_production"))
            print(f"  {commodity:17s}: {total:3d} cos, {with_res:3d} res, {with_econ:3d} econ, {with_reserve:3d} reserve, {with_prod:3d} prod")
            # Show first 3 with data
            for c in companies[:3]:
                if c.get("resource_mt") or c.get("npv_usd"):
                    sym = c.get("symbol", "?")
                    print(f"    {sym}: res={c.get('resource_mt')}, npv={c.get('npv_usd')}, irr={c.get('irr_pct')}, aisc={c.get('aisc')}")
        else:
            print(f"  {commodity:17s}: HTTP {r.status_code} - {r.text[:100]}")
    except Exception as e:
        print(f"  {commodity:17s}: ERROR {e}")

# Also test summary
print("\n=== COMMODITY SUMMARY ===")
r = httpx.get(f"{BASE}/commodity-breakdown/summary", timeout=30, verify=False)
if r.status_code == 200:
    data = r.json()
    for item in data.get("commodities", data) if isinstance(data, dict) else data:
        if isinstance(item, dict):
            name = item.get("commodity", "?")
            count = item.get("company_count", item.get("total", "?"))
            print(f"  {name}: {count} companies")
else:
    print(f"  HTTP {r.status_code}: {r.text[:200]}")
