"""Debug Google News RSS XML structure"""
import urllib.request
import urllib.parse

query = '"Barrick Gold" resource'
encoded_query = urllib.parse.quote(query)
url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en&gl=CA&ceid=CA:en&num=5"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
xml_data = resp.read().decode()

# Print first 3 items raw
import re
items = re.findall(r'<item>(.*?)</item>', xml_data, re.DOTALL)
print(f"Total items: {len(items)}")
for i, item in enumerate(items[:3]):
    print(f"\n--- Item {i+1} ---")
    print(item[:800])
