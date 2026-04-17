"""Debug GlobeNewsWire scraping"""
import urllib.request
import re

url = 'https://www.globenewswire.com/search?q=Barrick+Gold+mineral+resource'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode()

# Look for news-release links
links = re.findall(r'href="(/news-release/[^"]+)"[^>]*>([^<]{10,})', html)
print(f"Found {len(links)} news-release links")
for href, title in links[:10]:
    print(f"  {title.strip()[:80]}")
    print(f"    -> {href[:80]}")

# Check for pagetitle class
pagetitle = re.findall(r'class="[^"]*pagetitle[^"]*"', html)
print(f"\npagetitle classes: {len(pagetitle)}")

# Look for data-autid pattern (common in GNW)
autid = re.findall(r'data-autid="[^"]*"', html[:50000])
print(f"data-autid elements: {len(autid)}")
for a in autid[:5]:
    print(f"  {a}")

# Check for SPA markers
if 'data-reactroot' in html or '__NEXT_DATA__' in html:
    print('\n** Page uses client-side rendering')
elif '__nuxt' in html:
    print('\n** Nuxt.js SPA')
else:
    print('\n** Appears to be server-rendered')

# Save a portion for inspection
with open('gnw_debug.html', 'w', encoding='utf-8') as f:
    f.write(html[:50000])
print(f"\nSaved first 50k chars to gnw_debug.html")
