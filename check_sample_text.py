"""Check actual text stored for companies to understand extraction failures."""
import requests, urllib3, json, re
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Check companies with text but no resources extracted
for sym in ["ABX", "EDV", "NEM", "CCO", "K", "AGI", "ERO", "CS"]:
    print(f"\n{'='*60}")
    print(f"{sym}")
    print(f"{'='*60}")
    
    r = s.get(f"{BASE}/etl/sample-text/{sym}", timeout=30)
    if r.status_code != 200:
        print(f"  HTTP {r.status_code}: {r.text[:200]}")
        continue
    
    data = r.json()
    if data.get("error"):
        print(f"  Error: {data['error']}")
        continue
    
    docs = data.get("documents", [])
    print(f"  Documents with text: {data.get('count', 0)}")
    
    for doc in docs[:2]:
        print(f"\n  Title: {doc.get('title', '?')[:80]}")
        print(f"  Method: {doc.get('method')}")
        print(f"  Text length: {doc.get('text_length')}")
        print(f"  Resource lines ({len(doc.get('resource_lines', []))}):")
        for line in doc.get("resource_lines", [])[:15]:
            print(f"    > {line[:150]}")
        
        # Show first 500 chars of sample
        sample = doc.get("sample", "")[:500]
        print(f"  Text preview: {sample[:300]}...")
