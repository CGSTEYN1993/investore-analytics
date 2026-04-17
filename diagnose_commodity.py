"""
Diagnostic script: query the live API and raw DB diagnostics endpoint
to understand why contained_metal values are wildly inflated
(e.g. Barrick showing 2.3B oz instead of ~77Moz).
"""
import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "https://web-production-4faa7.up.railway.app"
S = requests.Session()
S.verify = False


def main():
    # 1. Fetch the gold commodity breakdown from the live API
    print("=" * 80)
    print("GOLD COMMODITY BREAKDOWN - LIVE API")
    print("=" * 80)

    url = f"{API_URL}/api/v1/commodity-breakdown/gold?sort_by=resources_contained&sort_dir=desc"
    resp = S.get(url, timeout=30)
    if resp.status_code != 200:
        print(f"ERROR: API returned {resp.status_code}")
        print(resp.text[:500])
        return

    data = resp.json()
    print(f"\nCommodity: {data.get('commodity')}")
    print(f"Meta: {data.get('meta')}")
    print(f"Spot price: {data.get('spot_price')}")
    print(f"Total companies: {data.get('total')}")

    companies = data.get("companies", [])
    
    # Show top 20 by resources_contained
    print(f"\n{'Ticker':<10} {'Name':<30} {'Exchange':<8} {'ResCont':>18} {'MI_Cont':>18} {'InfCont':>14} {'ResMt':>10} {'Grade':>8}")
    print("-" * 130)
    
    shown = 0
    for c in companies:
        rc = c.get("resources_contained")
        if rc is None:
            continue
        shown += 1
        if shown > 25:
            break
        mi = c.get("mi_resources_contained") or 0
        inf = c.get("inferred_contained") or 0
        mt = c.get("resources_mt") or 0
        g = c.get("resources_grade") or 0
        name = (c.get("name") or "?")[:28]
        print(f"{c['ticker']:<10} {name:<30} {c.get('exchange',''):<8} {rc:>18,.0f} {mi:>18,.0f} {inf:>14,.0f} {mt:>10,.2f} {g:>8,.4f}")

    # 2. Sanity check specific companies
    print("\n" + "=" * 80)
    print("SANITY CHECK - EXPECTED vs ACTUAL")
    print("For gold: resources_contained should be in oz")
    print("=" * 80)

    # Known approximate resource sizes (total M+I+Inf, Moz)
    expected = {
        "ABX": ("Barrick Gold", 77),
        "NEM": ("Newmont", 130),
        "GOLD": ("Barrick/Newmont", 77),
        "AEM": ("Agnico Eagle", 55),
        "NST": ("Northern Star", 20),
        "EVN": ("Evolution Mining", 12),
        "NCM": ("Newcrest/Newmont", 70),
        "RMS": ("Ramelius", 3),
        "DEG": ("De Grey Mining", 10),
        "WGX": ("Westgold", 5),
    }

    for c in companies:
        t = c.get("ticker")
        if t in expected:
            name, exp_moz = expected[t]
            rc = c.get("resources_contained") or 0
            actual_moz = rc / 1_000_000
            ratio = actual_moz / exp_moz if exp_moz > 0 else 0
            status = "OK" if 0.2 < ratio < 5 else "!! WRONG !!"
            print(f"\n{t} ({name}):")
            print(f"  Expected: ~{exp_moz} Moz = {exp_moz*1_000_000:,.0f} oz")
            print(f"  Actual:   {actual_moz:,.1f} Moz = {rc:,.0f} oz")
            print(f"  Ratio: {ratio:.2f}x  [{status}]")
            print(f"  Raw: MI_mt={c.get('mi_resources_mt')}, MI_grade={c.get('mi_resources_grade')}, "
                  f"Inf_mt={c.get('inferred_mt')}, Inf_grade={c.get('inferred_grade')}")

    # 3. Check how many companies have data vs not
    print("\n" + "=" * 80)
    print("DATA COVERAGE SUMMARY")
    print("=" * 80)
    
    has_resources = sum(1 for c in companies if c.get("resources_contained"))
    has_reserves = sum(1 for c in companies if c.get("reserves_contained"))
    has_economics = sum(1 for c in companies if c.get("npv") or c.get("aisc") or c.get("irr"))
    has_production = sum(1 for c in companies if c.get("annual_production"))
    has_market = sum(1 for c in companies if c.get("market_cap"))
    has_ev = sum(1 for c in companies if c.get("ev_per_resource"))
    total = len(companies)

    print(f"\nTotal gold companies: {total}")
    print(f"  With resources:   {has_resources} ({100*has_resources/total:.0f}%)" if total else "")
    print(f"  With reserves:    {has_reserves} ({100*has_reserves/total:.0f}%)" if total else "")
    print(f"  With economics:   {has_economics} ({100*has_economics/total:.0f}%)" if total else "")
    print(f"  With production:  {has_production} ({100*has_production/total:.0f}%)" if total else "")
    print(f"  With market cap:  {has_market} ({100*has_market/total:.0f}%)" if total else "")
    print(f"  With EV/resource: {has_ev} ({100*has_ev/total:.0f}%)" if total else "")

    # 4. Also check the summary endpoint
    print("\n" + "=" * 80)
    print("COMMODITY SUMMARY")
    print("=" * 80)

    resp2 = S.get(f"{API_URL}/api/v1/commodity-breakdown/summary", timeout=30)
    if resp2.status_code == 200:
        summary = resp2.json()
        print(f"\nTotal commodities: {summary.get('total_commodities')}")
        print(f"\n{'Commodity':<15} {'Symbol':<8} {'Count':>8} {'Producers':>10} {'Explorers':>10} {'Developers':>10}")
        print("-" * 65)
        for c in summary.get("commodities", []):
            print(f"{c['commodity']:<15} {c['metal_symbol']:<8} {c['company_count']:>8} "
                  f"{c['producers']:>10} {c['explorers']:>10} {c['developers']:>10}")

    # 5. Check multiple commodities quickly
    for slug, label, unit in [
        ("copper", "Copper", "t"),
        ("lithium", "Lithium", "t"),
        ("iron-ore", "Iron Ore", "t"),
        ("uranium", "Uranium", "lb"),
        ("silver", "Silver", "oz"),
        ("nickel", "Nickel", "t"),
        ("rare-earths", "Rare Earths", "t"),
    ]:
        print(f"\n{'=' * 80}")
        print(f"{label.upper()} BREAKDOWN")
        print("=" * 80)

        resp3 = S.get(f"{API_URL}/api/v1/commodity-breakdown/{slug}?sort_by=resources_contained&sort_dir=desc", timeout=30)
        if resp3.status_code == 200:
            d = resp3.json()
            cos = d.get("companies", [])
            total = d.get("total", 0)
            with_res = sum(1 for c in cos if c.get("resources_contained"))
            with_eco = sum(1 for c in cos if c.get("npv") or c.get("aisc") or c.get("irr"))
            with_mc = sum(1 for c in cos if c.get("market_cap"))
            print(f"Total: {total}, w/Resources: {with_res}, w/Economics: {with_eco}, w/MarketCap: {with_mc}")
            
            print(f"\n{'Ticker':<10} {'Name':<25} {'Ex':<5} {'ResCont':>15} {'ResMt':>10} {'Grade':>8}")
            print("-" * 78)
            shown = 0
            for c in cos:
                rc = c.get("resources_contained")
                if rc is None:
                    continue
                shown += 1
                if shown > 10:
                    break
                mt = c.get("resources_mt") or 0
                g = c.get("resources_grade") or 0
                name = (c.get("name") or "?")[:23]
                print(f"{c['ticker']:<10} {name:<25} {c.get('exchange',''):<5} {rc:>15,.0f} {mt:>10,.2f} {g:>8,.4f}")
        else:
            print(f"  ERROR: {resp3.status_code}")


if __name__ == "__main__":
    main()
