"""Targeted debug - step-by-step analysis to find the 500."""
import httpx, json, traceback

API = "https://web-production-4faa7.up.railway.app/api/v1"

# Step 1: Check auto-analyze response in detail
print("=== Auto-analyze (should work) ===")
r = httpx.post(f"{API}/signals/cross-exchange/analyze", timeout=30, verify=False)
print(f"  Status: {r.status_code}")
print(f"  Body: {json.dumps(r.json(), indent=2)[:500]}")

# Step 2: Test with various exchange combos to find which breaks
combos = [
    ("NYSE", "ASX"),
    ("ASX", "NYSE"),
    ("ASX", "JSE"),
    ("NYSE", "JSE"),
    ("TSX", "ASX"),
    ("LSE", "ASX"),
]

for src, tgt in combos:
    url = f"{API}/signals/cross-exchange/analyze?source_exchanges={src}&target_exchanges={tgt}"
    r = httpx.post(url, timeout=30, verify=False)
    status = "OK" if r.status_code == 200 else f"HTTP {r.status_code}"
    if r.status_code == 200:
        body = r.json()
        msg = f"signals={body.get('signals_created', 0)}"
        if body.get('status') == 'no_source_exchanges':
            msg = body.get('message', '')[:60]
    else:
        msg = r.text[:100]
    print(f"  {src}→{tgt}: {status} — {msg}")

# Step 3: Check news_hits data exists for ASX
print("\n=== News hits check ===")
r = httpx.get(f"{API}/news-hits/recent?exchange=ASX&limit=5&days=30", timeout=30, verify=False)
body = r.json()
print(f"  ASX 30-day hits: {body}")
