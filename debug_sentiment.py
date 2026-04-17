import urllib.request, json

base = "https://web-production-4faa7.up.railway.app/api/v1"

# Get recent NYSE hits
req = urllib.request.Request(base + "/news-hits/recent?limit=50")
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

# Filter for NYSE
nyse_hits = [h for h in data.get("news_hits", []) if h.get("exchange") == "NYSE"]
print(f"NYSE hits in recent: {len(nyse_hits)}")
if nyse_hits:
    # Check sentiment distribution
    labels = {}
    for h in nyse_hits:
        label = h.get("sentiment_label", "none")
        score = h.get("sentiment_score")
        labels[label] = labels.get(label, 0) + 1
    print(f"Sentiment label distribution: {labels}")
    print()
    for h in nyse_hits[:5]:
        print(f"  {h['ticker']:6s} | label={h.get('sentiment_label','?'):15s} | score={h.get('sentiment_score')} | {h.get('article_title', '')[:60]}")

# Also check ASX
asx_hits = [h for h in data.get("news_hits", []) if h.get("exchange") == "ASX"]
print(f"\nASX hits in recent: {len(asx_hits)}")
if asx_hits:
    labels = {}
    for h in asx_hits:
        label = h.get("sentiment_label", "none")
        labels[label] = labels.get(label, 0) + 1
    print(f"Sentiment label distribution: {labels}")
    for h in asx_hits[:5]:
        print(f"  {h['ticker']:6s} | label={h.get('sentiment_label','?'):15s} | score={h.get('sentiment_score')} | {h.get('article_title', '')[:60]}")
