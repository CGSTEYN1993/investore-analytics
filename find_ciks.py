"""Find SEC CIK numbers for TSX companies that file with the SEC."""
import urllib.request
import urllib.parse
import json
import time

companies_to_find = {
    "FM": "First Quantum Minerals",
    "LUN": "Lundin Mining",
    "CCO": "Cameco",
    "NXE": "NexGen Energy",
    "DML": "Denison Mines",
    "HBM": "Hudbay Minerals",
    "CS": "Capstone Copper",
    "LAC": "Lithium Americas",
    "SLI": "Standard Lithium",
    "WPM": "Wheaton Precious Metals",
    "FNV": "Franco-Nevada",
    "AG": "First Majestic Silver",
    "K": "Kinross Gold",
    "NTR": "Nutrien",
    "LI": "American Lithium",
    # LSE companies
    "AAL": "Anglo American",
    "GLEN": "Glencore",
    "ANTO": "Antofagasta",
    "FRES": "Fresnillo",
    # JSE companies that may file
    "GFI": "Gold Fields",
    "ANG": "AngloGold",
    "IMP": "Impala Platinum",
    "AMS": "Anglo American Platinum",
    "SSW": "Sibanye Stillwater",
}

headers = {"User-Agent": "InvestOre Analytics contact@investore.io"}

for ticker, name in companies_to_find.items():
    try:
        # Use SEC company search
        encoded_name = urllib.parse.quote(name)
        url = f"https://efts.sec.gov/LATEST/search-index?q=%22{encoded_name}%22&forms=20-F,40-F,6-K&dateRange=custom&startdt=2023-01-01&enddt=2026-12-31"
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        total = data.get("hits", {}).get("total", {}).get("value", 0)
        if total > 0:
            first = data["hits"]["hits"][0]
            src = first.get("_source", {})
            names = src.get("display_names", [])
            entity = names[0] if names else "unknown"
            print(f"{ticker:6s} ({name:30s}): {total:4d} hits - {entity}")
        else:
            print(f"{ticker:6s} ({name:30s}): NO SEC FILINGS FOUND")
        time.sleep(0.15)
    except Exception as e:
        print(f"{ticker:6s} ({name:30s}): error - {e}")
