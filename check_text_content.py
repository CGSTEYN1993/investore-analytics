"""Check actual text content for companies with text but no resources."""
import requests, urllib3
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Use gap-fill endpoint which can show document text
# Or we can use deep-extract-symbol for a single company and check 
# Let's check a few specific companies with text but 0 resources

# ABX = Barrick Gold (TSX, text=85, econ=12, res=0)
# EDV = Endeavour Mining (LSE, text=285, econ=6, res=0)  
# NEM = Newmont (NYSE, text=29, econ=8, res=0)
# CCO = Cameco (TSX, text=87, econ=9, res=0)

# Check the first text doc for ABX to see what format resources are in
# We need to use the /etl/sync-company-data or similar endpoint
# Or better, let's use the extraction API to check what text is stored

# Let's use the DB query via the announcements endpoint
for sym in ["ABX", "EDV", "NEM", "CCO", "AGI", "K"]:
    print(f"\n{'='*60}")
    print(f"Checking {sym}")
    print(f"{'='*60}")
    
    # Try announcements endpoint
    r = s.get(f"{BASE}/announcements/{sym}", timeout=30)
    if r.status_code == 200:
        data = r.json()
        anns = data if isinstance(data, list) else data.get('announcements', data.get('results', []))
        print(f"  Announcements: {len(anns) if isinstance(anns, list) else 'dict'}")
        if isinstance(anns, list):
            for a in anns[:3]:
                print(f"    {a.get('title', a.get('headline', '?'))[:80]}")
    else:
        print(f"  Announcements: HTTP {r.status_code}")

    # Try to search for specific text patterns via etl endpoints
    r = s.get(f"{BASE}/etl/company-text/{sym}", timeout=30)
    if r.status_code == 200:
        data = r.json()
        texts = data if isinstance(data, list) else data.get('documents', data.get('texts', []))
        if isinstance(texts, list):
            print(f"  Text docs: {len(texts)}")
            for t in texts[:2]:
                txt = t.get('full_text', t.get('text', ''))
                if txt:
                    print(f"    Doc: {t.get('title', '?')[:60]}")
                    # Search for resource-related content
                    lines = txt.split('\n')
                    for i, line in enumerate(lines):
                        lower = line.lower()
                        if any(kw in lower for kw in ['resource', 'reserve', 'mt @', 'mt at', 'million tonnes', 'measured', 'indicated', 'inferred', 'moz', 'mlb']):
                            print(f"      L{i}: {line[:120]}")
        elif isinstance(data, dict):
            print(f"  Response keys: {list(data.keys())[:10]}")
    elif r.status_code == 404:
        print(f"  No company-text endpoint")
    else:
        print(f"  company-text: HTTP {r.status_code}")
