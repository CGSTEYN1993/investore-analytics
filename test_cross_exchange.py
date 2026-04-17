import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Test 1: Exchange status
print("=== Exchange Status ===")
try:
    req = urllib.request.Request(f"{BASE}/signals/exchanges/status")
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    data = json.loads(resp.read())
    print(f"Total exchanges: {data['total']}")
    print(f"Open: {data['open_count']}, Closed: {data['closed_count']}")
    for ex in data["exchanges"]:
        status = "OPEN" if ex["is_open"] else "CLOSED"
        mins = ""
        if ex.get("minutes_until_open"):
            mins = f" (opens in {int(ex['minutes_until_open'])}m)"
        print(f"  {ex['code']:6s} {status:6s} {ex['local_time']:15s}{mins}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Cross-exchange signals
print("\n=== Cross-Exchange Signals ===")
try:
    req = urllib.request.Request(f"{BASE}/signals/cross-exchange?limit=5")
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    data = json.loads(resp.read())
    print(f"Total signals: {data['total']}")
    print(f"Bullish: {data['bullish_count']}, Bearish: {data['bearish_count']}")
    for sig in data["signals"][:3]:
        print(f"  {sig['headline'][:80]}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Pre-open report
print("\n=== Pre-Open Report (ASX) ===")
try:
    req = urllib.request.Request(f"{BASE}/signals/pre-open/ASX")
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    data = json.loads(resp.read())
    print(f"Exchange: {data['exchange']} ({data['exchange_name']})")
    print(f"Outlook: {data['outlook_emoji']} {data['outlook']}")
    print(f"Signals: {data['total_signals']} ({data['bullish_signals']} bullish, {data['bearish_signals']} bearish)")
    if data.get("minutes_until_open"):
        print(f"Opens in: {int(data['minutes_until_open'])} minutes")
except Exception as e:
    print(f"Error: {e}")

# Test 4: Run migration
print("\n=== Run Migration ===")
try:
    req = urllib.request.Request(f"{BASE}/signals/run-migration", method="POST")
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    data = json.loads(resp.read())
    print(f"Status: {data['status']}")
    if data.get("tables"):
        print(f"Tables: {data['tables']}")
except Exception as e:
    print(f"Error: {e}")

print("\nDone!")
