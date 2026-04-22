"""Delete all strategies + fix account 11 port."""
import os, requests
for line in open(os.path.join(os.path.dirname(__file__), ".env")):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1)
        os.environ[k.strip()] = v.strip()

b = "https://web-production-4faa7.up.railway.app/api/v1"
h = {"Authorization": f"Bearer {os.environ['INVESTORE_API_TOKEN']}",
     "Content-Type": "application/json"}

ss = requests.get(f"{b}/trading/strategies", headers=h, timeout=30).json()
print("strategies:", [(s["id"], s["name"], s.get("is_active")) for s in ss])
for s in ss:
    r = requests.delete(f"{b}/trading/strategies/{s['id']}", headers=h, timeout=30)
    print(f"  delete {s['id']}: {r.status_code} {r.text[:120]}")

print("\nAfter delete:")
ss2 = requests.get(f"{b}/trading/strategies", headers=h, timeout=30).json()
print("strategies remaining:", [(s["id"], s["name"]) for s in ss2])
