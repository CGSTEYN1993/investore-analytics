"""Fetch exchange docs one company at a time (avoid gateway timeouts)."""
import urllib.request
import json
import sys
import time

exchange = sys.argv[1] if len(sys.argv) > 1 else "TSX"
days = int(sys.argv[2]) if len(sys.argv) > 2 else 730

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

# Get the full symbol list by using batch_size=1 and offsetting
# Actually, just use the server endpoint with small batches
# The server iterates ALL_COMPANIES filtered by exchange in dict order
# We can do batch_size=5 multiple times — it skips already-fetched companies?
# No, it just picks the first N companies each time.

# Better: fetch exchange symbols from the coverage endpoint (limited to 10)
# and also read from known company lists

# Known companies per exchange (from companies.py)
EXCHANGE_SYMBOLS = {
    "TSX": ["ABX","NTR","FM","TECK.B","LUN","K","AG","ELD","WPM","FNV",
            "LAC","LI","SLI","HBM","CS","CCO","NXE","DML",
            "GMIN","LUG","SEA","NSR","NGT","EDR","SIL","MAG","SSL","TML",
            "OSK","WDO","ALS","CG","IMG","OGC","PRB","SKE","TXG","ERO",
            "FIL","GLO","CCJ","FCuG"],
    "TSXV": ["GGD","KRR","GCM","WRLG","BRC","DFLY","GLDX","SOLR","ROOK",
             "FPC","PMET","CRIT","LIO","CTM","FCU","ISO","ASN","AWE","AMK"],
    "CSE": ["GSVR","SSVR","KORE","NVX","PEGA","SURG","GENI","CDPR","ASCU","SALU",
            "FPX","NICU","CVV","PTU","ISO","UCU","ABRA","CELL","ZEN","CRUZ",
            "VIPR","PGLD","ROCA","BMET","MERG","ELEM","AUAU","DISC","NGEX","NEON"],
    "LSE": ["AAL","GLEN","ANTO","FRES","POLY","HOC","CEY","EDV","POW","CAML",
            "KAZ","YEL","ACA","SHG","TRQ"],
    "JSE": ["AGL","ANG","GFI","IMP","AMS","SSW","SOL","EXX","KIO","NHM",
            "RBP","THA","HAR","DRD","PAN","JMN","DTC","MRF","BSA","TGA",
            "MCZ","OMN","WSB","IVN","SGL","NPH","ARI","PPC","AFE"],
    "NYSE": ["NEM","FCX","SCCO","NUE","AA","VALE","MP","ALB","SQM","GOLD",
             "AEM","RIO","BHP","TECK","HL","PAAS","KGC","HMY","CDE","EGO",
             "AGI","CENX","BTG","AU","OR"],
}

symbols = EXCHANGE_SYMBOLS.get(exchange, [])
if not symbols:
    print(f"No symbols configured for {exchange}")
    sys.exit(1)

print(f"{exchange}: {len(symbols)} companies to fetch")

total_fetched = 0
total_inserted = 0
total_errors = 0

for i, sym in enumerate(symbols):
    try:
        url = f"{BASE}/etl/fetch-exchange/{exchange}?symbol={sym}&days_lookback={days}"
        req = urllib.request.Request(url, method="POST")
        resp = urllib.request.urlopen(req, timeout=300)
        result = json.loads(resp.read())
        
        pc = result.get("per_company", {}).get(sym, {})
        f = pc.get("fetched", 0)
        ins = pc.get("inserted", 0)
        e = pc.get("errors", 0)
        dur = round(result.get("duration_seconds", 0), 1)
        
        total_fetched += f
        total_inserted += ins
        total_errors += e
        
        status = f"fetched={f:3d} inserted={ins:3d} errors={e}" if f > 0 or e > 0 else "no new docs"
        print(f"[{i+1}/{len(symbols)}] {sym:8s}: {status} ({dur}s)")
        
    except Exception as ex:
        total_errors += 1
        err_msg = str(ex)
        if hasattr(ex, 'read'):
            try:
                err_msg = ex.read().decode()[:100]
            except:
                pass
        print(f"[{i+1}/{len(symbols)}] {sym:8s}: ERROR - {err_msg[:80]}")
    
    time.sleep(1)

print(f"\n{'='*50}")
print(f"{exchange} TOTAL: fetched={total_fetched} inserted={total_inserted} errors={total_errors}")
