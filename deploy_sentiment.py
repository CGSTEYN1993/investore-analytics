"""
Post-deployment: Run sentiment signals migration and generate initial signals.
"""
import httpx
import time

BASE = "https://web-production-4faa7.up.railway.app/api/v1"

def main():
    client = httpx.Client(timeout=120, verify=False)
    
    # Wait for deployment
    print("Waiting 45s for Railway deployment...")
    time.sleep(45)
    
    # 1. Health check
    print("\n[1] Health check...")
    try:
        r = client.get(f"{BASE}/health")
        print(f"   Status: {r.status_code}")
    except Exception as e:
        print(f"   Failed: {e}")
        print("   Waiting 30s more...")
        time.sleep(30)
    
    # 2. Run migration (create investment_signals table)
    print("\n[2] Running migration...")
    try:
        r = client.post(f"{BASE}/sentiment/run-migration")
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            print(f"   Response: {r.json()}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    # 3. Generate signals
    print("\n[3] Generating signals (30 day lookback, min 2 articles)...")
    try:
        r = client.post(f"{BASE}/sentiment/generate-signals", params={"lookback_days": 30, "min_articles": 2})
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"   Signals generated: {data.get('signals_generated', '?')}")
            print(f"   Companies analyzed: {data.get('companies_analyzed', '?')}")
            # Show summary
            if 'summary' in data:
                print(f"   Summary: {data['summary']}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    # 4. Check active signals
    print("\n[4] Fetching active signals...")
    try:
        r = client.get(f"{BASE}/sentiment/signals", params={"limit": 10})
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            signals = data.get('signals', [])
            print(f"   Active signals: {data.get('total', len(signals))}")
            for sig in signals[:5]:
                emoji = "📈" if sig['signal_type'] == 'invest' else "📉" if sig['signal_type'] == 'divest' else "👀"
                print(f"   {emoji} {sig['ticker']} ({sig['signal_type']}/{sig['signal_strength']}): {sig['headline']}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    # 5. Test trending
    print("\n[5] Trending stocks...")
    try:
        r = client.get(f"{BASE}/sentiment/trending", params={"limit": 10})
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            trending = data.get('trending', [])
            print(f"   Trending stocks: {len(trending)}")
            for t in trending[:5]:
                print(f"   • {t['ticker']}: {t['news_count_7d']} news, avg={t.get('avg_sentiment', 0):.3f}, bias={t.get('sentiment_bias', 'n/a')}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    # 6. Test company sentiment
    print("\n[6] Company sentiment (NST)...")
    try:
        r = client.get(f"{BASE}/sentiment/company/NST")
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"   Ticker: {data.get('ticker')}")
            print(f"   7d avg: {data.get('avg_sentiment_7d')}")
            print(f"   30d avg: {data.get('avg_sentiment_30d')}")
            print(f"   Trend: {data.get('trend')}")
            print(f"   Signal: {data.get('investment_signal')}")
            headlines = data.get('recent_headlines', [])
            print(f"   Recent headlines: {len(headlines)}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    # 7. Test commodity sentiment
    print("\n[7] Commodity sentiment (Gold)...")
    try:
        r = client.get(f"{BASE}/sentiment/commodity/Gold")
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"   Commodity: {data.get('commodity')}")
            print(f"   Sector bias: {data.get('sector_bias')}")
            print(f"   7d avg: {data.get('avg_sentiment_7d')}")
            print(f"   Total hits: {data.get('total_news_hits')}")
            movers = data.get('top_movers', [])
            print(f"   Top movers: {[m['ticker'] for m in movers[:5]]}")
        else:
            print(f"   Body: {r.text[:500]}")
    except Exception as e:
        print(f"   Failed: {e}")
    
    print("\n✅ Done!")
    client.close()

if __name__ == "__main__":
    main()
