"""Check what routes are available on deployed Railway."""
import httpx, json, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app"

r = httpx.get(f"{BASE}/openapi.json", timeout=30, verify=False)
if r.status_code == 200:
    spec = r.json()
    paths = sorted(spec.get("paths", {}).keys())
    print(f"Total routes: {len(paths)}")
    for p in paths:
        methods = list(spec["paths"][p].keys())
        print(f"  {', '.join(m.upper() for m in methods):10s} {p}")
else:
    print(f"OpenAPI failed: {r.status_code}")
    # Try health
    r2 = httpx.get(f"{BASE}/health", timeout=10, verify=False)
    print(f"Health: {r2.status_code} - {r2.text}")

# Check if the deployment has the latest code
print()
print("=== Check git status ===")
