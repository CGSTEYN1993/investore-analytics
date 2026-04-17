"""Debug Google News RSS with proper URL encoding"""
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

# Fix: URL-encode the query
company = "Barrick Gold"
query = f'"{company}" (resource OR reserve OR production OR drilling)'
encoded_query = urllib.parse.quote(query)
url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en&gl=CA&ceid=CA:en"
print(f"URL: {url[:120]}...")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    xml_data = resp.read().decode()
    root = ET.fromstring(xml_data)
    items = root.findall('.//item')
    print(f"Found {len(items)} items\n")
    for item in items[:8]:
        title = item.find('title')
        source = item.find('source')
        pub_date = item.find('pubDate')
        link = item.find('link')
        link_text = link.tail.strip() if link is not None and link.tail else ""
        t = title.text if title is not None else "?"
        s = source.text if source is not None else "?"
        d = pub_date.text[:20] if pub_date is not None else "?"
        print(f"[{s}] {t[:90]}")
        print(f"  Date: {d}")
        print(f"  Link: {link_text[:80]}")
        print()
except Exception as e:
    print(f"Error: {e}")

# Also test Newswire.ca
print("=" * 60)
print("TEST: Newswire.ca for Barrick Gold")
url2 = f"https://www.newswire.ca/search?query={urllib.parse.quote('Barrick Gold mineral resource')}"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp2 = urllib.request.urlopen(req2, timeout=10)
    html2 = resp2.read().decode()
    print(f"Length: {len(html2)}")
    import re
    links2 = re.findall(r'href="(/news-releases/[^"]+)"[^>]*>([^<]{10,})', html2)
    print(f"Release links: {len(links2)}")
    for h, t in links2[:5]:
        print(f"  {t.strip()[:80]}")
except Exception as e:
    print(f"Error: {e}")

# Test Yahoo Finance
print("\n" + "=" * 60)
print("TEST: Yahoo Finance news for ABX.TO")
url3 = f"https://finance.yahoo.com/quote/ABX.TO/news/"
req3 = urllib.request.Request(url3, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp3 = urllib.request.urlopen(req3, timeout=10)
    html3 = resp3.read().decode()
    print(f"Length: {len(html3)}")
except Exception as e:
    print(f"Error: {e}")
