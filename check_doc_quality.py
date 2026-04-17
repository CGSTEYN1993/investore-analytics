"""Check document quality for all companies on an exchange."""
import urllib.request
import json
import sys

exchange = sys.argv[1] if len(sys.argv) > 1 else "TSX"

EXCHANGE_SYMBOLS = {
    "TSX": ["ABX","NTR","FM","TECK.B","LUN","K","AG","ELD","WPM","FNV",
            "LAC","LI","SLI","HBM","CS","CCO","NXE","DML"],
    "TSXV": ["GGD","KRR","GCM","WRLG","BRC","DFLY","GLDX","SOLR","ROOK",
             "FPC","PMET","CRIT","LIO","CTM","FCU","ISO","ASN","AWE","AMK"],
    "CSE": ["GSVR","SSVR","KORE","NVX","PEGA","SURG","GENI","CDPR","ASCU","SALU",
            "FPX","OMM","GSHR","PRYM","BMET","CSM","CLM","KALI","THRM",
            "CNC","GIGA","ORE","DEFN","MKA","SOLA","BATT","OIII","AIS"],
    "LSE": ["AAL","GLEN","ANTO","FRES","POLY","HOC","CEY","EDV","POW","CAML",
            "SHG","BMN","KAZ","TRE","ARS"],
    "JSE": ["AGL","ANG","GFI","IMP","AMS","SSW","SOL","EXX","KIO","NHM",
            "HAR","DRD","SGL","RBP","BAW","OMN","MCZ","PAN","RNG","THA",
            "MTH","NRP","YRK","CAP","WSL","CML","BSR","PPC","GLN"],
    "NYSE": ["NEM","FCX","SCCO","NUE","AA","VALE","MP","ALB","SQM","GOLD",
             "AEM","RIO","BHP","TECK","HL","PAAS","KGC","HMY","CDE","EGO",
             "AGI","CENX","BTG","AU","OR"],
}

BASE = "https://web-production-4faa7.up.railway.app/api/v1"
symbols = EXCHANGE_SYMBOLS.get(exchange, [])
print(f"{exchange}: {len(symbols)} companies")
print(f"{'Symbol':8s} {'SEC':>12s} {'HTML':>12s} {'GNews':>8s} {'PDF':>8s} {'Empty':>8s}")
print("-" * 60)

for sym in symbols:
    try:
        url = f"{BASE}/etl/debug-doc-samples?symbol={sym}&limit=1&text_chars=10"
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        
        methods = {}
        for ms in data.get("method_stats", []):
            methods[ms["method"]] = {"count": ms["count"], "avg_len": ms.get("avg_text_len", 0)}
        
        sec = methods.get("sec_edgar", {})
        html = methods.get("html_scrape", {})
        gnews = methods.get("google_news", {})
        pdf = methods.get("pdfplumber", {})
        pdf2 = methods.get("pdf_text", {})
        efts = methods.get("sec_efts", {})
        empty = (methods.get("completed", {}).get("count", 0) + 
                 methods.get("pending", {}).get("count", 0))
        
        sec_str = f"{sec.get('count',0):3d}/{sec.get('avg_len',0):6d}" if sec else "     -"
        html_str = f"{html.get('count',0):3d}/{html.get('avg_len',0):6d}" if html else "     -"
        gnews_str = f"{gnews.get('count',0):3d}" if gnews else "  -"
        pdf_count = pdf.get("count", 0) + pdf2.get("count", 0) + efts.get("count", 0)
        pdf_str = f"{pdf_count:3d}" if pdf_count else "  -"
        empty_str = f"{empty:3d}" if empty else "  -"
        
        print(f"{sym:8s} {sec_str:>12s} {html_str:>12s} {gnews_str:>8s} {pdf_str:>8s} {empty_str:>8s}")
    except Exception as e:
        print(f"{sym:8s} ERROR: {str(e)[:50]}")
