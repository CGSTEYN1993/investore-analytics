"""Inspect SEC filing structure to understand exhibit files."""
import urllib.request
import json

headers = {"User-Agent": "InvestOre Analytics contact@investore.io"}
url = "https://data.sec.gov/submissions/CIK0001725964.json"
req = urllib.request.Request(url, headers=headers)
resp = urllib.request.urlopen(req, timeout=30)
data = json.loads(resp.read())

recent = data.get("filings", {}).get("recent", {})
forms = recent.get("form", [])
dates = recent.get("filingDate", [])
accessions = recent.get("accessionNumber", [])
primary_docs = recent.get("primaryDocument", [])
descs = recent.get("primaryDocDescription", [])

# Show first few foreign filings
count = 0
for i, f in enumerate(forms):
    if f in ("6-K", "40-F", "20-F") and count < 3:
        acc = accessions[i].replace("-", "")
        cik = "1725964"
        pdoc = primary_docs[i]
        desc = descs[i] if i < len(descs) else ""
        print(f"{f} [{dates[i]}]: {desc} -> {pdoc}")
        
        # Fetch filing index to see all documents
        idx_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/"
        import time
        time.sleep(0.15)
        try:
            req2 = urllib.request.Request(idx_url, headers=headers)
            resp2 = urllib.request.urlopen(req2, timeout=15)
            from html.parser import HTMLParser
            content = resp2.read().decode()
            # Find exhibit files
            import re
            files = re.findall(r'href="([^"]+\.(htm|html|pdf))"', content)
            for f_url, ext in files:
                if "ex" in f_url.lower() or "exhibit" in f_url.lower() or "99" in f_url:
                    print(f"  EXHIBIT: {f_url}")
        except Exception as e:
            print(f"  Error: {e}")
        
        count += 1
        print()
