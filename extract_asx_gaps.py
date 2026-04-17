"""Check if ASX gap companies have asx_announcements records and trigger extraction."""
import requests, urllib3
urllib3.disable_warnings()

s = requests.Session()
s.verify = False
BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Check if there are asx_announcements for these gap companies
gap_symbols = ["PNR", "WSR", "AKE", "AVZ", "AZL", "BOD", "CLQ", "DGO", "ESS", 
               "GCY", "KDR", "KIN", "KLL", "LRS", "MCR", "MZZ", "PRS", "RED", 
               "SLR", "SYA", "TIE", "TRY"]

# Try to force deep-extract for each individually
for sym in gap_symbols[:5]:
    print(f"\n=== Deep-extract {sym} ===")
    r = s.post(
        f"{BASE}/etl/deep-extract",
        params={"symbol": sym, "download_new": True, "batch_size": 1},
        timeout=120,
    )
    if r.status_code == 200:
        d = r.json()
        print(f"  Status: {d.get('status')}")
        print(f"  Processed: {d.get('symbols_processed')}")
        print(f"  Docs analyzed: {d.get('documents_analyzed')}")
        print(f"  PDFs downloaded: {d.get('new_pdfs_downloaded')}")
        print(f"  Resources: {d.get('resources_inserted')}")
        print(f"  Economics: {d.get('economics_inserted')}")
        print(f"  Production: {d.get('production_found')}")
        if d.get("error_details"):
            for e in d["error_details"][:3]:
                print(f"  ERR: {e}")
    else:
        print(f"  HTTP {r.status_code}: {r.text[:200]}")

# Also try force reprocess for PNR and WSR which have text
print("\n=== Reprocess PNR (has text) ===")
r = s.post(f"{BASE}/etl/deep-extract", params={"symbol": "PNR", "reprocess": True, "download_new": True}, timeout=120)
if r.status_code == 200:
    d = r.json()
    print(f"  Docs: {d.get('documents_analyzed')}, Res: {d.get('resources_inserted')}, Econ: {d.get('economics_inserted')}")

print("\n=== Reprocess WSR (has text) ===")
r = s.post(f"{BASE}/etl/deep-extract", params={"symbol": "WSR", "reprocess": True, "download_new": True}, timeout=120)
if r.status_code == 200:
    d = r.json()
    print(f"  Docs: {d.get('documents_analyzed')}, Res: {d.get('resources_inserted')}, Econ: {d.get('economics_inserted')}")

# Now sync ASX announcements for the 20 companies with 0 docs
# Check if there's an endpoint to trigger ASX sync
print("\n=== Check ASX sync capabilities ===")
for ep in ["/etl/sync-asx", "/etl/sync-asx-announcements", "/etl/asx-sync", "/etl/fetch-asx-announcements"]:
    r = s.get(f"{BASE}{ep}", timeout=10)
    print(f"  GET {ep}: {r.status_code}")
    r = s.post(f"{BASE}{ep}", json={"symbols": ["AKE"]}, timeout=10)
    print(f"  POST {ep}: {r.status_code}")
