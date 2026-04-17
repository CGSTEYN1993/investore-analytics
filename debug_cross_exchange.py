"""Quick diagnostic for cross-exchange signal generation issues."""
import httpx, json, sys

API = "https://web-production-4faa7.up.railway.app/api/v1"

def check(label, url, method="GET", expect_ok=True):
    try:
        r = httpx.request(method, url, timeout=30, verify=False)
        ok = "OK" if r.status_code == 200 else f"HTTP {r.status_code}"
        body = r.json() if r.status_code < 500 else r.text[:200]
        print(f"  {label}: {ok}")
        return r.status_code, body
    except Exception as e:
        print(f"  {label}: ERROR - {e}")
        return 0, str(e)

print("=== 1. Exchange Status ===")
code, data = check("status", f"{API}/signals/exchanges/status")

print("\n=== 2. Pre-Open Report (ASX) ===")
code, data = check("pre-open/ASX", f"{API}/signals/pre-open/ASX")
if code == 200:
    print(f"    outlook={data.get('outlook')}, signals={data.get('total_signals')}")

print("\n=== 3. Cross-Exchange Signals (GET) ===")
code, data = check("cross-exchange", f"{API}/signals/cross-exchange")
if code == 200:
    print(f"    total={data.get('total')}")

print("\n=== 4. Migration ===")
code, data = check("migration", f"{API}/signals/run-migration", method="POST")
if isinstance(data, dict):
    print(f"    {data}")

print("\n=== 5. Analyze (POST) — the one that 500s ===")
code, data = check("analyze (auto)", f"{API}/signals/cross-exchange/analyze", method="POST")
if code != 200:
    print(f"    Error body: {data}")

print("\n=== 6. Analyze with explicit params ===")
code, data = check(
    "analyze (ASX→JSE)",
    f"{API}/signals/cross-exchange/analyze?source_exchanges=ASX&target_exchanges=JSE",
    method="POST"
)
if code != 200:
    print(f"    Error body: {data}")
else:
    print(f"    signals_created={data.get('signals_created')}")
    if data.get('signals'):
        for s in data['signals'][:2]:
            print(f"    - {s.get('headline', '')[:80]}")

print("\n=== 7. News hits stats (to check data availability) ===")
code, data = check("news-hits/stats", f"{API}/news-hits/stats")
if code == 200 and isinstance(data, dict):
    by_exc = data.get('by_exchange', {})
    print(f"    Total: {data.get('total_hits')}")
    for exc, cnt in sorted(by_exc.items(), key=lambda x: -x[1])[:6]:
        print(f"    {exc}: {cnt} hits")

print("\n=== 8. News hits recent for ASX (7 days) ===")
code, data = check("news-hits/recent?exchange=ASX&days=7", f"{API}/news-hits/recent?exchange=ASX&days=7&limit=3")
if code == 200 and isinstance(data, dict):
    print(f"    total={data.get('total')}")
    for h in data.get('hits', [])[:2]:
        print(f"    - {h.get('ticker')}: sent={h.get('sentiment_score')}, label={h.get('sentiment_label')}")

print("\n=== 9. News hits recent for NYSE (30 days) ===")
code, data = check("news-hits/recent?exchange=NYSE&days=30", f"{API}/news-hits/recent?exchange=NYSE&days=30&limit=3")
if code == 200 and isinstance(data, dict):
    print(f"    total={data.get('total')}")
    for h in data.get('hits', [])[:2]:
        print(f"    - {h.get('ticker')}: sent={h.get('sentiment_score')}, label={h.get('sentiment_label')}")
