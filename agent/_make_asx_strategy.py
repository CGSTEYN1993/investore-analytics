"""Create one tight, autonomous ASX mining strategy for paper trading.

Rules are intentionally conservative so the bot only fires on real
high-conviction setups during ASX market hours.
"""
import os, json, requests

for line in open(os.path.join(os.path.dirname(__file__), ".env")):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1)
        os.environ[k.strip()] = v.strip()

b = "https://web-production-4faa7.up.railway.app/api/v1"
h = {"Authorization": f"Bearer {os.environ['INVESTORE_API_TOKEN']}",
     "Content-Type": "application/json"}

strategy = {
    "account_id": 11,
    "name": "ASX Mining — Sentiment + RSI Oversold",
    "description": "Buys ASX miners when news sentiment is positive AND RSI is oversold. Limit orders, max 3 positions, 2% sizing, ASX hours only.",
    "strategy_type": "hybrid",
    "exchanges": ["ASX"],
    "commodities": None,
    # Conservative universe filter
    "min_market_cap": 50_000_000,    # AUD 50M minimum (avoid penny shells)
    "max_market_cap": None,
    "min_avg_volume": 100_000,       # decent daily liquidity
    "entry_rules": [
        # Both must trigger (AND): real positive news AND technical oversold
        {"type": "sentiment_spike",
         "threshold": 0.3, "lookback_hours": 48, "min_articles": 2},
        {"type": "rsi_oversold",
         "period": 14, "threshold": 35},
    ],
    "entry_logic": "AND",
    "min_rules_match": 2,
    "exit_rules": [
        # Engine-side exits: take profit / stop loss / time-based
        {"type": "take_profit_pct", "pct": 8.0},
        {"type": "stop_loss_pct",   "pct": 4.0},
        {"type": "time_stop_days",  "days": 14},
    ],
    "position_sizing": "fixed_pct",
    "position_size_pct": 2.0,        # 2% of equity per trade
    "max_positions": 3,
    "order_type": "limit",
    "limit_offset_pct": 0.5,         # 0.5% inside-the-spread
    "check_interval_minutes": 30,
    "trading_hours_only": True,      # only fire during ASX session
}

print("Creating strategy...")
r = requests.post(f"{b}/trading/strategies", headers=h, json=strategy, timeout=30)
print(f"create: {r.status_code}")
if r.status_code >= 300:
    print(r.text)
    raise SystemExit(1)
created = r.json()
sid = created["id"]
print(f"  id={sid} name={created['name']}")

print(f"Activating strategy {sid}...")
r = requests.patch(
    f"{b}/trading/strategies/{sid}/toggle",
    headers=h,
    json={"is_active": True},
    timeout=30,
)
print(f"toggle: {r.status_code} {r.text[:200]}")

print("\nFinal strategy state:")
r = requests.get(f"{b}/trading/strategies", headers=h, timeout=30).json()
for s in r:
    print(f"  id={s['id']:<3} active={s['is_active']!s:<5} paused={s['is_paused']!s:<5} {s['name']}")
