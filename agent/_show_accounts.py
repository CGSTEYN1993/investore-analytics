import os, json, requests
for l in open(os.path.join(os.path.dirname(__file__), ".env")):
    if "=" in l and not l.startswith("#"):
        k, v = l.strip().split("=", 1)
        os.environ[k] = v
h = {"Authorization": f"Bearer {os.environ['INVESTORE_API_TOKEN']}"}
r = requests.get("https://web-production-4faa7.up.railway.app/api/v1/trading/accounts", headers=h, timeout=60)
print("accounts:", r.status_code)
print(json.dumps(r.json(), default=str, indent=2))
