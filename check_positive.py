import json

with open('temp_hits.json') as f:
    data = json.load(f)

pos = [h for h in data['news_hits'] if h.get('sentiment_label') in ('positive', 'very_positive')]
print(f"Total positive: {len(pos)}")
for p in pos:
    ticker = p['ticker']
    exchange = p['exchange']
    date = p['article_date'][:10]
    title = p['article_title'][:80]
    print(f"  {ticker} {exchange} | {date} | {title}")
