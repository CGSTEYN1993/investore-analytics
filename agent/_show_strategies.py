import os, json, requests
for l in open(os.path.join(os.path.dirname(__file__), ".env")):
    if "=" in l and not l.startswith("#"):
        k, v = l.strip().split("=", 1)
        os.environ[k] = v
h = {"Authorization": f"Bearer {os.environ['INVESTORE_API_TOKEN']}"}
r = requests.get("https://web-production-4faa7.up.railway.app/api/v1/trading/strategies", headers=h, timeout=60)
print(r.status_code)
for s in r.json()[:2]:
    print(json.dumps({k: s.get(k) for k in (
        "id","name","account_id","exchanges","commodities","entry_rules",
        "exit_rules","strategy_type","order_type","position_sizing",
        "min_market_cap","max_market_cap","min_avg_volume",
        "position_size_pct","limit_offset_pct","check_interval_minutes")}, default=str, indent=2))
