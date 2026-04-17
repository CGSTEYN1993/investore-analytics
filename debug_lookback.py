import urllib.request, json

base = "https://web-production-4faa7.up.railway.app/api/v1"

# Use company endpoint to check for NYSE companies with hits
# Let's look at hits by exchange with a longer lookback
url = base + "/news-hits/stats"
req = urllib.request.Request(url)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
print("30-day stats:", data.get("source_breakdown"))

# The issue is clear: lookback_hours=24 in _get_exchange_performance
# But NYSE data might be older than 24h.
# Let's check: how many ASX hits have scores (any) or non-neutral labels?
# We know ASX has 3043 hits in 30 days, mostly neutral + score=None

# Try to trigger with longer lookback
# The analyze endpoint doesn't support custom lookback... 
# The default in code is 24 hours which is too short

# Let's check the analyze endpoint to see if it accepts hours param
url2 = base + "/signals/cross-exchange/analyze?source_exchanges=ASX&target_exchanges=NYSE&lookback_hours=720"
try:
    req2 = urllib.request.Request(url2, method="POST")
    resp2 = urllib.request.urlopen(req2)
    data2 = json.loads(resp2.read())
    print("\nWith 720h lookback:", json.dumps(data2, indent=2, default=str)[:1000])
except Exception as e:
    print(f"\nWith 720h lookback: Error - {e}")

# Check without custom param  
url3 = base + "/signals/cross-exchange/analyze?source_exchanges=ASX&target_exchanges=NYSE"
try:
    req3 = urllib.request.Request(url3, method="POST")
    resp3 = urllib.request.urlopen(req3)
    data3 = json.loads(resp3.read())
    print("\nDefault (24h):", json.dumps(data3, indent=2, default=str)[:1000])
except Exception as e:
    print(f"\nDefault: Error - {e}")
