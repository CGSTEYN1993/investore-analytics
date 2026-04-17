"""Check available routes via various methods."""
import httpx, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app"

# Try different route patterns
routes_to_test = [
    ("GET", "/health"),
    ("GET", "/api/v1/etl/db-status"),
    ("GET", "/api/v1/etl/extraction-coverage"),
    ("POST", "/api/v1/etl/deep-extract"),
    ("GET", "/etl/extraction-coverage"),
    ("POST", "/etl/deep-extract"),
    ("GET", "/docs"),
    ("GET", "/api/v1/commodities/Gold/peers"),
]

for method, path in routes_to_test:
    try:
        if method == "GET":
            r = httpx.get(f"{BASE}{path}", timeout=10, verify=False)
        else:
            r = httpx.post(f"{BASE}{path}", json={"batch_size": 1}, timeout=10, verify=False)
        status = r.status_code
        body = r.text[:100] if status != 200 else "OK"
        print(f"  {method:4s} {path:50s} -> {status} {body}")
    except Exception as e:
        print(f"  {method:4s} {path:50s} -> ERROR {e}")
