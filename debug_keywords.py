"""Debug keyword matching for Google News RSS"""
import urllib.request, json

url = 'https://web-production-4faa7.up.railway.app/api/v1/etl/debug-gnews-test?company=Barrick+Gold'
req = urllib.request.Request(url)
resp = urllib.request.urlopen(req, timeout=30)
data = json.loads(resp.read())

keywords = ['resource', 'reserve', 'ni 43-101', 'drilling', 'assay', 'feasibility', 'pfs', 'dfs', 'pea', 'scoping', 'production', 'quarterly', 'mineral estimate', 'intercept', 'intersection', 'grade']

print("Total items:", data["total_items"])
print("Items shown:", len(data["items"]))
print()

for item in data['items']:
    t = item['title']
    t_lower = t.lower()
    matches = [kw for kw in keywords if kw in t_lower]
    has_link = bool(item['link'])
    print(f"[{item['source']}] {t[:90]}")
    print(f"  Keywords: {matches}")
    print(f"  Has link: {has_link}")
    print(f"  PubDate: {item['pubDate']}")
    print()
