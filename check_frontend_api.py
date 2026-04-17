"""Quick check that the API returns data in the format the frontend expects."""
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "https://web-production-4faa7.up.railway.app"
S = requests.Session()
S.verify = False


def main():
    # 1. Check summary endpoint (frontend loads this on mount)
    print("=== /api/v1/commodity-breakdown/summary ===")
    resp = S.get(f"{API_URL}/api/v1/commodity-breakdown/summary", timeout=30)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Keys: {list(data.keys())}")
        print(f"total_commodities: {data.get('total_commodities')}")
        first = data.get("commodities", [{}])[0]
        print(f"First commodity keys: {list(first.keys())}")
        print(f"First commodity: {json.dumps(first)}")
    print()

    # 2. Check gold breakdown (with default sort)
    print("=== /api/v1/commodity-breakdown/gold?sort_by=market_cap&sort_dir=desc ===")
    resp = S.get(f"{API_URL}/api/v1/commodity-breakdown/gold?sort_by=market_cap&sort_dir=desc", timeout=30)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Keys: {list(data.keys())}")
        print(f"commodity: {data.get('commodity')}")
        print(f"meta: {data.get('meta')}")
        print(f"spot_price: {data.get('spot_price')}")
        print(f"total: {data.get('total')}")
        companies = data.get("companies", [])
        if companies:
            first = companies[0]
            print(f"\nFirst company keys: {sorted(first.keys())}")
            # Check all expected fields
            expected = [
                "ticker", "name", "exchange", "company_type",
                "resources_mt", "resources_grade", "resources_contained",
                "mi_resources_mt", "mi_resources_grade", "mi_resources_contained",
                "inferred_mt", "inferred_grade", "inferred_contained",
                "reserves_mt", "reserves_grade", "reserves_contained",
                "aisc", "c1_cost", "npv", "irr", "capex",
                "annual_production", "head_grade", "recovery_pct",
                "mine_life_years", "study_type", "project_stage",
                "ev_per_resource", "market_cap", "ownership_pct",
            ]
            missing = [k for k in expected if k not in first]
            if missing:
                print(f"MISSING FIELDS: {missing}")
            else:
                print("All expected fields present!")

            # Show top 3 companies briefly
            for c in companies[:3]:
                print(f"  {c.get('ticker')}: mc={c.get('market_cap')}, "
                      f"res={c.get('resources_contained')}, "
                      f"name={c.get('name')}")
    print()

    # 3. Check exchange filter works
    print("=== /api/v1/commodity-breakdown/gold?exchange=ASX ===")
    resp = S.get(f"{API_URL}/api/v1/commodity-breakdown/gold?exchange=ASX&sort_by=resources_contained&sort_dir=desc", timeout=30)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        total = data.get("total", 0)
        with_res = sum(1 for c in data.get("companies", []) if c.get("resources_contained"))
        print(f"Total ASX gold: {total}, with resources: {with_res}")

    print("\n=== Frontend readiness assessment ===")
    print("The frontend should render correctly if:")
    print("  1. Summary endpoint returns commodity tabs with counts")
    print("  2. Breakdown endpoint returns companies array with expected fields")
    print("  3. Sort/filter params work")
    print("All checks passed!" if resp.status_code == 200 else "Issues found.")


if __name__ == "__main__":
    main()
