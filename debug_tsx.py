"""Debug Google News RSS and alternative sources for TSX"""
import urllib.request
import re
import xml.etree.ElementTree as ET

# Test 1: Google News RSS for Barrick Gold
print("=" * 60)
print("TEST 1: Google News RSS")
query = '"Barrick Gold" (resource OR reserve OR production OR drilling OR feasibility)'
url = f"https://news.google.com/rss/search?q={query}&hl=en&gl=CA&ceid=CA:en"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    xml_data = resp.read().decode()
    root = ET.fromstring(xml_data)
    items = root.findall('.//item')
    print(f"  Found {len(items)} items")
    for item in items[:5]:
        title = item.find('title')
        source = item.find('source')
        pub_date = item.find('pubDate')
        link = item.find('link')
        link_text = link.tail.strip() if link is not None and link.tail else ""
        print(f"  [{source.text if source is not None else '?'}] {title.text[:80] if title is not None else '?'}")
        print(f"    {link_text[:80]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 2: TMX Money news API
print("\n" + "=" * 60)
print("TEST 2: TMX Money API")
url = "https://app-money.tmx.com/graphql"
# This is a GraphQL API - let's try the REST endpoint
url2 = "https://www.tmx.com/json/news/press-releases/ABX"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp2 = urllib.request.urlopen(req2, timeout=10)
    print(f"  TMX Status: {resp2.status}")
    data2 = resp2.read().decode()
    print(f"  Length: {len(data2)}")
    print(f"  Content: {data2[:500]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 3: Accesswire search
print("\n" + "=" * 60)
print("TEST 3: Accesswire")
url3 = "https://www.accesswire.com/newsroom/Barrick-Gold"
req3 = urllib.request.Request(url3, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp3 = urllib.request.urlopen(req3, timeout=10)
    html3 = resp3.read().decode()
    print(f"  Length: {len(html3)}")
    links3 = re.findall(r'href="(/newsroom/[^"]+)"[^>]*>([^<]{10,})', html3)
    print(f"  Article links: {len(links3)}")
    for h, t in links3[:5]:
        print(f"    {t.strip()[:80]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 4: Newsfile
print("\n" + "=" * 60)
print("TEST 4: Newsfile Corp")
url4 = "https://www.newsfilecorp.com/search?query=Barrick+Gold+mineral+resource"
req4 = urllib.request.Request(url4, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp4 = urllib.request.urlopen(req4, timeout=10)
    html4 = resp4.read().decode()
    print(f"  Length: {len(html4)}")
    links4 = re.findall(r'href="(/release/[^"]+)"[^>]*>([^<]{10,})', html4)
    print(f"  Release links: {len(links4)}")
    for h, t in links4[:5]:
        print(f"    {t.strip()[:80]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 5: SEDAR+ 
print("\n" + "=" * 60)
print("TEST 5: SEDAR+ API")
url5 = "https://www.sedarplus.ca/csa-party-profile?q=barrick+gold&pageSize=5&sort=completedDate_desc"
req5 = urllib.request.Request(url5, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
try:
    resp5 = urllib.request.urlopen(req5, timeout=10)
    print(f"  Status: {resp5.status}")
    data5 = resp5.read().decode()
    print(f"  Response: {data5[:500]}")
except Exception as e:
    print(f"  Error: {e}")

# Test 6: Canadian Mining Journal / Junior Mining Network
print("\n" + "=" * 60)
print("TEST 6: Junior Mining Network")
url6 = "https://www.juniorminingnetwork.com/mining-topics/gold.html"
req6 = urllib.request.Request(url6, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp6 = urllib.request.urlopen(req6, timeout=10)
    html6 = resp6.read().decode()
    print(f"  Length: {len(html6)}")
    links6 = re.findall(r'href="([^"]*(?:news|article|release)[^"]*)"[^>]*>([^<]{10,})', html6[:100000])
    print(f"  Article links: {len(links6)}")
    for h, t in links6[:5]:
        print(f"    {t.strip()[:80]}")
except Exception as e:
    print(f"  Error: {e}")
