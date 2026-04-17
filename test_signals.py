import time, urllib.request, json

print("Waiting 100s for Railway redeploy...")
time.sleep(100)

base = "https://web-production-4faa7.up.railway.app/api/v1"

# Trigger analysis: NYSE and ASX as source, others as targets
url = base + "/signals/cross-exchange/analyze?source_exchanges=NYSE,ASX&target_exchanges=ASX,TSX,JSE,LSE,TSXV"
req = urllib.request.Request(url, method="POST")
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())

print(f"Signals created: {data['signals_created']}")
if data.get("signals"):
    for s in data["signals"][:10]:
        print(f"  {s['signal_type']} | {s['commodity_group']} | {s['source_exchange']}->{s['target_exchange']} | conf={s['confidence']}")
        print(f"    {s['headline'][:120]}")
else:
    print("No signals.")
    print(json.dumps(data, indent=2, default=str)[:1500])
