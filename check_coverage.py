"""Check extraction coverage and identify gaps"""
import httpx

BASE = "https://web-production-4faa7.up.railway.app/api/v1"
client = httpx.Client(timeout=60, verify=False)

# 1. Overall extraction coverage
print("=== Extraction Coverage ===")
try:
    r = client.get(f"{BASE}/etl/extraction-coverage")
    if r.status_code == 200:
        data = r.json()
        print(f"  Total companies: {data.get('total_companies')}")
        print(f"  With resources: {data.get('with_resources')}")
        print(f"  With economics: {data.get('with_economics')}")
        print(f"  Coverage: {data.get('coverage_pct', 0):.1f}%")
        gaps = data.get('gap_tickers', [])
        if gaps:
            print(f"  Gap tickers (first 20): {gaps[:20]}")
    else:
        print(f"  Status: {r.status_code} — {r.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# 2. ETL status
print("\n=== ETL Status ===")
try:
    r = client.get(f"{BASE}/etl/status")
    if r.status_code == 200:
        data = r.json()
        for k, v in data.items():
            print(f"  {k}: {v}")
    else:
        print(f"  Status: {r.status_code} — {r.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

# 3. Commodity breakdown stats
print("\n=== Commodity Breakdown (resource/economics presence) ===")
for commodity in ["Gold", "Copper", "Lithium", "Zinc", "Nickel", "Iron Ore", "Uranium"]:
    try:
        r = client.get(f"{BASE}/commodities/{commodity}/breakdown")
        if r.status_code == 200:
            data = r.json()
            companies = data.get("companies", [])
            with_res = sum(1 for c in companies if c.get("resource_estimates"))
            with_econ = sum(1 for c in companies if c.get("economics"))
            total = len(companies)
            print(f"  {commodity:12s}: {total:3d} companies | {with_res:3d} resources ({with_res/max(total,1)*100:4.0f}%) | {with_econ:3d} economics ({with_econ/max(total,1)*100:4.0f}%)")
    except:
        pass

# 4. Database stats
print("\n=== Database Stats ===")
try:
    r = client.get(f"{BASE}/companies", params={"limit": 1})
    if r.status_code == 200:
        data = r.json()
        total = data.get('total', '?')
        print(f"  Total companies: {total}")
except:
    pass

# 5. Trending (test the fix)
print("\n=== Trending (post-fix) ===")
try:
    r = client.get(f"{BASE}/sentiment/trending", params={"limit": 10, "days": 14})
    if r.status_code == 200:
        data = r.json()
        for t in data.get('trending', [])[:5]:
            print(f"  {t.get('ticker','?'):6s}: {t.get('news_count_7d', t.get('hits', 0)):3d} news, bias={t.get('sentiment_bias', t.get('bias', '?'))}")
    else:
        print(f"  Status: {r.status_code} — {r.text[:200]}")
except Exception as e:
    print(f"  Error: {e}")

client.close()
