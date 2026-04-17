"""Fetch documents for an exchange and print results."""
import urllib.request
import json
import sys

exchange = sys.argv[1] if len(sys.argv) > 1 else "TSX"
batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else 50
days = int(sys.argv[3]) if len(sys.argv) > 3 else 730

url = f"https://web-production-4faa7.up.railway.app/api/v1/etl/fetch-exchange/{exchange}?batch_size={batch_size}&days_lookback={days}"
print(f"Fetching {exchange} (batch={batch_size}, days={days})...")

req = urllib.request.Request(url, method="POST")
resp = urllib.request.urlopen(req, timeout=900)
data = json.loads(resp.read())

print(f"\n{'='*50}")
print(f"Exchange: {data.get('exchange')}")
print(f"Companies targeted: {data.get('companies_targeted')}")
print(f"Companies processed: {data.get('companies_processed')}")
print(f"Total fetched: {data.get('total_fetched')}")
print(f"Total inserted: {data.get('total_inserted')}")
print(f"Total skipped: {data.get('total_skipped', 0)}")
print(f"Total errors: {data.get('total_errors')}")
print(f"Duration: {round(data.get('duration_seconds', 0), 1)}s")
print(f"{'='*50}")

for sym, stats in sorted(data.get("per_company", {}).items()):
    f = stats.get("fetched", 0)
    i = stats.get("inserted", 0)
    s = stats.get("skipped", 0)
    e = stats.get("errors", 0)
    if f > 0 or e > 0:
        print(f"  {sym:8s}: fetched={f:3d} inserted={i:3d} skipped={s:3d} errors={e}")
    else:
        print(f"  {sym:8s}: no docs found")
