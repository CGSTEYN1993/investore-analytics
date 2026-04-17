"""Check SEC CIK lookups for LSE tickers."""
import urllib.request
import json
import time

headers = {"User-Agent": "InvestOre Analytics contact@investore.io"}

# Try various tickers for LSE companies
tickers = ["EDV", "CEY", "HOC", "FRES", "AAL", "GLEN", "ANTO", "TRQ"]

for ticker in tickers:
    try:
        url = f"https://data.sec.gov/submissions/CIK{ticker}.json"
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        print(f"{ticker}: CIK={data.get('cik')}, Name={data.get('name')}")
    except Exception as e:
        print(f"{ticker}: not found ({str(e)[:30]})")
    time.sleep(0.15)
