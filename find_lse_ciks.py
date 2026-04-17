"""Find SEC CIK numbers for LSE companies."""
import urllib.request
import json
import time
import re

headers = {"User-Agent": "InvestOre Analytics contact@investore.io"}

# LSE companies to search
companies = {
    "AAL": "Anglo American",
    "GLEN": "Glencore",
    "ANTO": "Antofagasta",
    "FRES": "Fresnillo plc",
    "POLY": "Polymetal",
    "HOC": "Hochschild Mining",
    "CEY": "Centamin",
    "EDV": "Endeavour Mining",
    "POW": "Pan Oriental",
    "CAML": "Central Asia Metals",
    "KAZ": "KAZ Minerals",
    "YEL": "Yellow Cake",
    "ACA": "Acacia Mining",
    "SHG": "Shanta Gold",
    "TRQ": "Turquoise Hill",
}

for ticker, name in companies.items():
    try:
        # Search by company name
        import urllib.parse
        encoded = urllib.parse.quote(f'"{name}"')
        url = f"https://efts.sec.gov/LATEST/search-index?q={encoded}&forms=20-F,40-F,6-K,10-K&dateRange=custom&startdt=2022-01-01&enddt=2026-12-31"
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        total = data.get("hits", {}).get("total", {}).get("value", 0)
        if total > 0:
            first = data["hits"]["hits"][0]
            src = first.get("_source", {})
            names = src.get("display_names", [])
            entity = names[0] if names else "unknown"
            print(f"{ticker:6s} ({name:25s}): {total:4d} hits - {entity}")
        else:
            print(f"{ticker:6s} ({name:25s}): NO RESULTS")
        time.sleep(0.15)
    except Exception as e:
        print(f"{ticker:6s} ({name:25s}): error - {e}")
