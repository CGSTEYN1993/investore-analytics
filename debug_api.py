"""Batch 2: Deep extraction - debug response."""
import httpx, time, json, urllib3
urllib3.disable_warnings()

BASE = "https://web-production-4faa7.up.railway.app"

# First check what the raw response is
print("=== Check deep-extract raw response ===")
r = httpx.post(
    f"{BASE}/etl/deep-extract",
    json={"batch_size": 5, "reprocess": False, "download_new": True},
    timeout=600,
    verify=False,
)
print(f"Status code: {r.status_code}")
print(f"Response: {r.text[:2000]}")

print()
print("=== Check coverage raw response ===")
r2 = httpx.get(f"{BASE}/etl/extraction-coverage", timeout=60, verify=False)
print(f"Status code: {r2.status_code}")
print(f"Response: {r2.text[:2000]}")

print()
print("=== Check routes ===")
r3 = httpx.get(f"{BASE}/openapi.json", timeout=30, verify=False)
if r3.status_code == 200:
    spec = r3.json()
    paths = [p for p in spec.get("paths", {}).keys() if "deep" in p or "extract" in p or "coverage" in p]
    print(f"Matching routes: {paths}")
    # Also check all etl routes
    etl_paths = [p for p in spec.get("paths", {}).keys() if "/etl/" in p]
    print(f"All ETL routes: {etl_paths}")
