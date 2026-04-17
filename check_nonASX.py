"""Check what non-ASX documents look like in the DB."""
import requests, urllib3
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Check what tables exist related to non-ASX announcements
r = s.get(f'{BASE}/etl/db-status')
data = r.json()
print("=== DB Status ===")
for k, v in data.items():
    print(f"  {k}: {v}")

# Check JSE announcements
print("\n=== Sample non-ASX docs ===")
# Let's check via gap-fill which has some debug info
r = s.get(f'{BASE}/etl/gap-analysis')
data = r.json()
print(f"Coverage: {data.get('coverage_pct')}%")
print(f"Fillable from text: {data.get('fillable_from_text')}")

# Check specific exchange companies
for exchange in ['JSE', 'LSE', 'NYSE', 'TSX', 'CSE']:
    print(f"\n  {exchange} companies:")
    gaps = [c for c in data.get('gap_companies', []) if c.get('exchange') == exchange]
    print(f"    Gaps: {len(gaps)}")
    for c in gaps[:3]:
        print(f"    {c.get('symbol')}: docs={c.get('documents',0)}, text={c.get('with_text',0)}")
