import urllib.request, json

base = "https://web-production-4faa7.up.railway.app/api/v1"

# Check what exchanges are in news_hits
req = urllib.request.Request(base + "/news-hits/stats")
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

print("Source breakdown:", data.get("source_breakdown"))
print()
print("Top companies:")
for c in data.get("top_companies", []):
    print(f"  {c['ticker']:6s} | exchange={c['exchange']:6s} | hits={c['hits']:3d} | sentiment={c.get('avg_sentiment')}")

print("\n--- Now check what _get_exchange_performance returns ---")
# The source_breakdown shows 'asx' and 'nyse' (lowercase!)
# But we're querying WHERE exchange = 'NYSE' (uppercase)!
print("\nLIKELY ISSUE: news_hits.exchange stores lowercase ('nyse','asx')")
print("But we're querying with uppercase ('NYSE','ASX')")
print()

# Verify by checking the raw data from a different endpoint
req2 = urllib.request.Request(base + "/news-hits/recent?limit=1")
resp2 = urllib.request.urlopen(req2)
data2 = json.loads(resp2.read())
if data2.get("news_hits"):
    print("Sample news_hit exchange field:", repr(data2["news_hits"][0].get("exchange")))
