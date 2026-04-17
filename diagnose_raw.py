"""
Query extraction-coverage to understand raw data distribution,
and use sample-text endpoint to check specific companies.
"""
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "https://web-production-4faa7.up.railway.app"
S = requests.Session()
S.verify = False


def main():
    # 1. Extraction Coverage
    print("=" * 80)
    print("EXTRACTION COVERAGE")
    print("=" * 80)

    resp = S.get(f"{API_URL}/api/v1/etl/extraction-coverage", timeout=60)
    if resp.status_code == 200:
        data = resp.json()
        companies = data.get("companies", [])
        print(f"Total companies: {len(companies)}")
        
        # Show gold companies with high resource counts
        gold_cos = [c for c in companies if c.get("resources", 0) > 0]
        gold_cos.sort(key=lambda x: x.get("resources", 0), reverse=True)
        
        print(f"\nCompanies with resources: {len(gold_cos)}")
        print(f"\n{'Symbol':<10} {'Name':<30} {'Resources':>10} {'Reserves':>10} {'Economics':>10} {'Production':>10} {'Docs':>8}")
        print("-" * 95)
        for c in gold_cos[:30]:
            sym = c.get("symbol", "?")
            name = (c.get("name") or "?")[:28]
            res = c.get("resources", 0)
            rev = c.get("reserves", 0)
            eco = c.get("economics", 0)
            prod = c.get("production", 0)
            docs = c.get("documents", 0)
            print(f"{sym:<10} {name:<30} {res:>10} {rev:>10} {eco:>10} {prod:>10} {docs:>8}")
    else:
        print(f"extraction-coverage: {resp.status_code}")
        print(resp.text[:500])

    # 2. Check sample text for key companies to see what extraction found
    print("\n" + "=" * 80)
    print("SAMPLE TEXT - checking extraction source data")
    print("=" * 80)
    
    for sym in ["GOLD", "ABX", "EVN"]:
        resp = S.get(f"{API_URL}/api/v1/etl/sample-text/{sym}", timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            print(f"\n=== {sym} ===")
            if isinstance(data, dict):
                for k, v in data.items():
                    if isinstance(v, str):
                        print(f"  {k}: {v[:200]}...")
                    elif isinstance(v, (int, float)):
                        print(f"  {k}: {v}")
                    elif isinstance(v, list) and len(v) > 0:
                        print(f"  {k}: {len(v)} items")
                        for item in v[:3]:
                            if isinstance(item, dict):
                                print(f"    {json.dumps(item, default=str)[:200]}")
                            else:
                                print(f"    {str(item)[:200]}")
                    elif isinstance(v, dict):
                        print(f"  {k}: {json.dumps(v, default=str)[:300]}")
        else:
            print(f"\n{sym}: {resp.status_code}")


if __name__ == "__main__":
    main()
