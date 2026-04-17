"""Analyze copper company assignment gaps between ASX_MINING_TICKERS and ALL_COMPANIES."""
import sys
sys.path.insert(0, 'backend')
from app.services.asx import ASX_MINING_TICKERS
from app.data.companies import ALL_COMPANIES, get_companies_by_commodity, Commodity

# Count copper companies in ASX_MINING_TICKERS not in ALL_COMPANIES
copper_slash_in_asx = {k: v for k, v in ASX_MINING_TICKERS.items() if 'Copper' in v.get('commodity', '')}
copper_in_all = get_companies_by_commodity(Commodity.COPPER)

print('=== COPPER COMPANIES IN ALL_COMPANIES (primary or secondary) ===')
for sym, info in sorted(copper_in_all.items()):
    prim = info.primary_commodity.value
    exch = info.exchange.value
    print(f'  {sym:8s} {info.name:35s} primary={prim:12s} exchange={exch}')
print(f'Total: {len(copper_in_all)}')

print()
print('=== ASX COPPER TICKERS NOT IN ALL_COMPANIES ===')
missing = {k: v for k, v in copper_slash_in_asx.items() if k not in ALL_COMPANIES}
for sym in sorted(missing):
    info = missing[sym]
    print(f'  {sym:8s} {info["name"]:35s} commodity={info["commodity"]}')
print(f'Total missing: {len(missing)}')

print()
print('=== SPECIFIC: ANX, KGL, ALM status ===')
for sym in ['ANX', 'KGL', 'ALM']:
    in_all = sym in ALL_COMPANIES
    in_asx = sym in ASX_MINING_TICKERS
    asx_info = ASX_MINING_TICKERS.get(sym, {})
    all_info = ALL_COMPANIES.get(sym)
    if all_info:
        print(f'  {sym}: IN ALL_COMPANIES as primary={all_info.primary_commodity.value}, IN ASX_TICKERS={in_asx} commodity={asx_info.get("commodity","N/A")}')
    else:
        print(f'  {sym}: NOT in ALL_COMPANIES, IN ASX_TICKERS={in_asx} commodity={asx_info.get("commodity","N/A")}')

print()
print(f'=== TOTAL ALL_COMPANIES: {len(ALL_COMPANIES)} ===')

# Count companies with potentially wrong primary_commodity
mismatched = []
for sym, info in ALL_COMPANIES.items():
    if sym in ASX_MINING_TICKERS:
        asx_comm = ASX_MINING_TICKERS[sym].get('commodity', '')
        all_comm = info.primary_commodity.value
        if 'Copper' in asx_comm and all_comm != 'Copper' and 'Copper' not in [c.value for c in info.secondary_commodities]:
            mismatched.append((sym, info.name, all_comm, asx_comm))

print()
print('=== ASX COMPANIES WITH COPPER MISMATCH (ASX says copper, ALL_COMPANIES disagrees) ===')
for sym, name, all_c, asx_c in sorted(mismatched):
    print(f'  {sym:8s} {name:35s} ALL_COMPANIES={all_c:12s} ASX_TICKERS={asx_c}')
print(f'Total mismatched: {len(mismatched)}')

# Broader: ALL tickers in ASX_MINING that are NOT in ALL_COMPANIES
all_missing = {k: v for k, v in ASX_MINING_TICKERS.items() if k not in ALL_COMPANIES}
print(f'\n=== TOTAL ASX_MINING_TICKERS not in ALL_COMPANIES: {len(all_missing)} / {len(ASX_MINING_TICKERS)} ===')

# Group missing by commodity
from collections import Counter
comm_counts = Counter()
for k, v in all_missing.items():
    comm_counts[v.get('commodity', 'Unknown')] += 1
print('\nMissing by commodity:')
for c, n in comm_counts.most_common(20):
    print(f'  {c:25s} {n}')
