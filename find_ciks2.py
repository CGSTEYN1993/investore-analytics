"""Look up SEC CIK numbers by NYSE ticker for dual-listed companies."""
import urllib.request
import json
import time

# SEC tickers for dual-listed TSX/LSE/JSE companies
# These are their US-listed tickers or ADR tickers
tickers = {
    # TSX dual-listed
    "CCJ": "Cameco (TSX: CCO)",
    "NXE": "NexGen Energy (TSX: NXE)",
    "DNN": "Denison Mines (TSX: DML)", 
    "HBM": "Hudbay Minerals (TSX: HBM)",
    "LAC": "Lithium Americas (TSX: LAC, but now LAAC)",
    "SLI": "Standard Lithium (TSX: SLI)",
    "WPM": "Wheaton Precious Metals (TSX: WPM)",
    "FNV": "Franco-Nevada (TSX: FNV)",
    "AG": "First Majestic Silver (TSX: AG)", 
    "KGC": "Kinross Gold (TSX: K)",
    "NTR": "Nutrien (TSX: NTR)",
    "AMLI": "American Lithium (TSX: LI)",
    # JSE dual-listed
    "GFI": "Gold Fields (JSE: GFI)",
    "SBSW": "Sibanye Stillwater (JSE: SSW)",
    # LSE companies with ADRs
    # Anglo American, Glencore, Antofagasta don't have US ADRs
    # Fresnillo likewise
    # TSXV
    "PMET": "Patriot Battery Metals",
    "FCU": "Fission Uranium",
    "ISO": "IsoEnergy",
}

headers = {"User-Agent": "InvestOre Analytics contact@investore.io"}

for ticker, name in tickers.items():
    try:
        url = f"https://data.sec.gov/submissions/CIK{ticker}.json"
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        cik = data.get("cik", "unknown")
        company_name = data.get("name", "unknown")
        padded_cik = str(cik).zfill(10)
        print(f'    "{ticker}": "{padded_cik}",  # {company_name} ({name})')
        time.sleep(0.15)
    except Exception as e:
        # Try padded lookup
        try:
            # Use company_tickers.json for exact ticker lookup
            url2 = f"https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK={ticker}&type=&dateb=&owner=include&count=1&search_text=&action=getcompany&output=atom"
            req2 = urllib.request.Request(url2, headers=headers)
            resp2 = urllib.request.urlopen(req2, timeout=10)
            content = resp2.read().decode()
            # Look for CIK in response
            import re
            cik_match = re.search(r'CIK=(\d+)', content)
            if cik_match:
                padded = cik_match.group(1).zfill(10)
                print(f'    "{ticker}": "{padded}",  # {name} (from EDGAR search)')
            else:
                print(f"    # {ticker}: NOT FOUND ({name})")
        except Exception as e2:
            print(f"    # {ticker}: NOT FOUND ({name}) - {e2}")
        time.sleep(0.15)
