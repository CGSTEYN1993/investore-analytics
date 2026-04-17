"""Check all active signals and trending data"""
import httpx

BASE = "https://web-production-4faa7.up.railway.app/api/v1"
client = httpx.Client(timeout=60, verify=False)

# Full signal list
r = client.get(f"{BASE}/sentiment/signals", params={"limit": 50})
data = r.json()
print(f"Total signals: {data.get('total', 0)}")
print(f"\n{'Type':<8} {'Strength':<10} {'Ticker':<8} {'Headline'}")
print("-" * 80)
for sig in data.get('signals', []):
    print(f"{sig['signal_type']:<8} {sig['signal_strength']:<10} {sig['ticker']:<8} {sig['headline'][:60]}")

# Check trending with broader parameters
print("\n\n=== Trending (14d lookback) ===")
r = client.get(f"{BASE}/sentiment/trending", params={"limit": 20, "days": 14})
data = r.json()
for t in data.get('trending', []):
    print(f"  {t['ticker']}: {t.get('news_count_7d', 0)} news, avg={t.get('avg_sentiment', 0):.3f}")

# Company sentiment for a signal ticker
print("\n=== CUE sentiment (buy signal) ===")
r = client.get(f"{BASE}/sentiment/company/CUE")
if r.status_code == 200:
    d = r.json()
    print(f"  7d: {d.get('avg_sentiment_7d')}, 30d: {d.get('avg_sentiment_30d')}")
    print(f"  Signal: {d.get('investment_signal')}, Trend: {d.get('trend')}")
    print(f"  Hits 7d: {d.get('hits_7d')}, Hits 30d: {d.get('hits_30d')}")
    for h in d.get('recent_headlines', [])[:3]:
        print(f"  📰 {h.get('title', h.get('headline', '?'))[:70]} [{h.get('sentiment','?')}]")

# Company sentiment for a sell signal
print("\n=== PRN sentiment (sell signal) ===")
r = client.get(f"{BASE}/sentiment/company/PRN")
if r.status_code == 200:
    d = r.json()
    print(f"  7d: {d.get('avg_sentiment_7d')}, 30d: {d.get('avg_sentiment_30d')}")
    print(f"  Signal: {d.get('investment_signal')}, Trend: {d.get('trend')}")
    for h in d.get('recent_headlines', [])[:3]:
        print(f"  📰 {h.get('title', h.get('headline', '?'))[:70]} [{h.get('sentiment','?')}]")

client.close()
