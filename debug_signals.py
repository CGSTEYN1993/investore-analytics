"""Debug why signals aren't generating - check what sentiment data exists"""
import httpx

BASE = "https://web-production-4faa7.up.railway.app/api/v1"
client = httpx.Client(timeout=60, verify=False)

# Check what data the news_hits table actually has
print("=== Checking news_hits sentiment data ===")

# Try the news-hits stats endpoint
r = client.get(f"{BASE}/news-hits/stats")
print(f"\nNews stats: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    for k, v in data.items():
        print(f"  {k}: {v}")

# Try recent news
r = client.get(f"{BASE}/news-hits/recent", params={"limit": 5})
print(f"\nRecent news: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    items = data if isinstance(data, list) else data.get('items', data.get('news_hits', []))
    for item in items[:5]:
        print(f"  {item.get('ticker', '?')}: score={item.get('sentiment_score')}, label={item.get('sentiment_label')}, impact={item.get('stock_impact_prediction')}")

# Check the generate-signals response more carefully
print("\n=== Generate signals (verbose) ===")
r = client.post(f"{BASE}/sentiment/generate-signals", params={"lookback_days": 90, "min_articles": 1})
print(f"Status: {r.status_code}")
print(f"Full response: {r.text[:2000]}")

# Check company sentiment for a known ticker with news
r = client.get(f"{BASE}/sentiment/company/BHP")
print(f"\nBHP sentiment: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    for k, v in data.items():
        if k != 'recent_headlines':
            print(f"  {k}: {v}")
        else:
            print(f"  recent_headlines: {len(v)} items")
            for h in v[:3]:
                print(f"    - {h}")

client.close()
