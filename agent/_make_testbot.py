"""One-shot: create + activate + fire a permissive test strategy on acct 11."""
import os, sys, time, requests

for line in open(os.path.join(os.path.dirname(__file__), ".env")):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1)
        os.environ[k.strip()] = v.strip()

api = "https://web-production-4faa7.up.railway.app/api/v1"
h = {
    "Authorization": f"Bearer {os.environ['INVESTORE_API_TOKEN']}",
    "Content-Type": "application/json",
}

# Wait for redeploy
for i in range(40):
    try:
        r = requests.get(f"{api}/trading/engine-status", headers=h, timeout=10)
        if r.ok:
            break
    except Exception as e:
        print("retry", i, e)
    time.sleep(3)
print("backend up:", r.status_code, r.text[:120])

body = {
    "account_id": 11,
    "name": "TestBot - Always Buy (RSI<=100)",
    "description": "Permissive end-to-end test of agent execution.",
    "strategy_type": "technical",
    "exchanges": ["ASX"],
    "commodities": None,
    "entry_rules": [
        {"type": "rsi_oversold", "params": {"period": 14, "threshold": 100}}
    ],
    "entry_logic": "OR",
    "min_rules_match": 1,
    "exit_rules": [
        {"type": "stop_loss", "params": {"pct": 5}},
        {"type": "take_profit", "params": {"pct": 5}},
        {"type": "time_based", "params": {"max_hold_days": 1}},
    ],
    "position_sizing": "fixed_pct",
    "position_size_pct": 1.0,
    "max_positions": 5,
    "order_type": "market",
    "limit_offset_pct": 0.5,
    "check_interval_minutes": 30,
    "trading_hours_only": False,
}
r = requests.post(f"{api}/trading/strategies", headers=h, json=body, timeout=120)
print("create:", r.status_code, r.text[:300])
if not r.ok:
    sys.exit(1)
sid = r.json().get("id")
print("strategy_id:", sid)

r = requests.patch(
    f"{api}/trading/strategies/{sid}/toggle",
    headers=h, json={"is_active": True}, timeout=15,
)
print("activate:", r.status_code, r.text[:200])

r = requests.post(f"{api}/trading/strategies/{sid}/run", headers=h, timeout=120)
print("run:", r.status_code, r.text[:600])
