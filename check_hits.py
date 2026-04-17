import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

for exchange in ["JSE", "LSE", "NYSE", "ASX"]:
    url = f"{BASE}/news-hits?exchange={exchange}&limit=5"
    req = urllib.request.Request(url)
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        data = json.loads(resp.read())
        total = data.get("total", len(data.get("hits", [])))
        print(f"{exchange}: {total} hits")
        for h in data.get("hits", [])[:2]:
            ticker = h.get("ticker", "?")
            sent = h.get("sentiment_label", "?")
            dt = str(h.get("article_date", ""))[:10]
            print(f"  {ticker} - {sent} - {dt}")
    except Exception as e:
        print(f"{exchange}: {e}")
