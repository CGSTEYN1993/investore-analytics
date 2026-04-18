/**
 * Strategy registry — registers a set of canonical entry/exit strategies
 * as klinecharts overlay indicators that draw buy/sell markers on the
 * main candlestick pane.
 *
 * Each strategy outputs `{ buy?: number, sell?: number }` per candle.
 * Markers are drawn as circles below (buy) or above (sell) the bar.
 *
 * All logic implements public-domain TA strategy principles — no Pine
 * Script copied from TradingView.
 */

import { registerIndicator, type KLineData } from 'klinecharts';

// ─── Math helpers (local copy to keep this file self-contained) ───────

const sma = (vals: number[], n: number): (number | undefined)[] => {
  const out: (number | undefined)[] = new Array(vals.length).fill(undefined);
  let sum = 0;
  for (let i = 0; i < vals.length; i++) {
    sum += vals[i];
    if (i >= n) sum -= vals[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
};

const ema = (vals: number[], n: number): (number | undefined)[] => {
  const out: (number | undefined)[] = new Array(vals.length).fill(undefined);
  const k = 2 / (n + 1);
  let prev: number | undefined;
  for (let i = 0; i < vals.length; i++) {
    if (i === n - 1) {
      let s = 0;
      for (let j = 0; j <= i; j++) s += vals[j];
      prev = s / n;
      out[i] = prev;
    } else if (i >= n) {
      prev = vals[i] * k + (prev as number) * (1 - k);
      out[i] = prev;
    }
  }
  return out;
};

const wilder = (vals: number[], n: number): (number | undefined)[] => {
  const out: (number | undefined)[] = new Array(vals.length).fill(undefined);
  let prev: number | undefined;
  for (let i = 0; i < vals.length; i++) {
    if (i === n - 1) {
      let s = 0;
      for (let j = 0; j <= i; j++) s += vals[j];
      prev = s / n;
      out[i] = prev;
    } else if (i >= n) {
      prev = ((prev as number) * (n - 1) + vals[i]) / n;
      out[i] = prev;
    }
  }
  return out;
};

const stdev = (vals: number[], n: number): (number | undefined)[] => {
  const m = sma(vals, n);
  const out: (number | undefined)[] = new Array(vals.length).fill(undefined);
  for (let i = n - 1; i < vals.length; i++) {
    const mean = m[i] as number;
    let s = 0;
    for (let j = i - n + 1; j <= i; j++) s += (vals[j] - mean) ** 2;
    out[i] = Math.sqrt(s / n);
  }
  return out;
};

const trueRange = (data: KLineData[]): number[] => {
  const out: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const h = data[i].high, l = data[i].low;
    if (i === 0) { out.push(h - l); continue; }
    const pc = data[i - 1].close;
    out.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  return out;
};

// ─── Signal output helpers ────────────────────────────────────────────

type Signal = { buy?: number; sell?: number };
const empty = (): Signal => ({});
const buyAt = (price: number): Signal => ({ buy: price });
const sellAt = (price: number): Signal => ({ sell: price });

/**
 * Wraps a signal generator that returns +1/-1/0 per bar into the
 * `{ buy, sell }` marker shape, attaching markers below low / above high.
 */
function markersFromSignals(data: KLineData[], signals: number[]): Signal[] {
  return data.map((d, i) => {
    if (signals[i] > 0) return buyAt(d.low);
    if (signals[i] < 0) return sellAt(d.high);
    return empty();
  });
}

/** Convert direction series (1 long / -1 short / 0 flat) into change events. */
function eventsFromDirection(dir: number[]): number[] {
  const out: number[] = new Array(dir.length).fill(0);
  let prev = 0;
  for (let i = 0; i < dir.length; i++) {
    const d = dir[i];
    if (d !== prev) {
      if (d > 0) out[i] = 1;
      else if (d < 0) out[i] = -1;
      prev = d;
    }
  }
  return out;
}

// ─── Strategy definitions ─────────────────────────────────────────────

interface StrategyDef {
  name: string;
  shortName: string;
  calcParams: number[];
  calc: (data: KLineData[], params: number[]) => Signal[];
}

const STRATEGIES: StrategyDef[] = [
  // 1. BarUpDn — buy after N consecutive up bars, sell after N consecutive down bars
  {
    name: 'STRAT_BARUPDN', shortName: 'BarUpDn',
    calcParams: [3],
    calc: (data, [n]) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = n; i < data.length; i++) {
        let up = true, dn = true;
        for (let j = i - n + 1; j <= i; j++) {
          if (data[j].close <= data[j].open) up = false;
          if (data[j].close >= data[j].open) dn = false;
        }
        sig[i] = up ? 1 : dn ? -1 : 0;
      }
      return markersFromSignals(data, eventsFromDirection(sig));
    },
  },

  // 2. Bollinger Bands — mean-reversion: buy on cross up through lower band, sell on cross down through upper
  {
    name: 'STRAT_BOLL', shortName: 'BB Strategy',
    calcParams: [20, 2],
    calc: (data, [n, mult]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n), s = stdev(closes, n);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (m[i] === undefined || s[i] === undefined) continue;
        const up = (m[i] as number) + mult * (s[i] as number);
        const dn = (m[i] as number) - mult * (s[i] as number);
        const upPrev = (m[i - 1] as number) + mult * (s[i - 1] as number);
        const dnPrev = (m[i - 1] as number) - mult * (s[i - 1] as number);
        if (closes[i - 1] < dnPrev && closes[i] > dn) sig[i] = 1;
        else if (closes[i - 1] > upPrev && closes[i] < up) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 3. Bollinger Bands directed — trend-following: buy when close breaks above upper, sell when breaks below lower
  {
    name: 'STRAT_BOLL_DIR', shortName: 'BB Directed',
    calcParams: [20, 2],
    calc: (data, [n, mult]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n), s = stdev(closes, n);
      const dir: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (m[i] === undefined || s[i] === undefined) continue;
        const up = (m[i] as number) + mult * (s[i] as number);
        const dn = (m[i] as number) - mult * (s[i] as number);
        if (closes[i] > up) dir[i] = 1;
        else if (closes[i] < dn) dir[i] = -1;
        else dir[i] = dir[i - 1];
      }
      return markersFromSignals(data, eventsFromDirection(dir));
    },
  },

  // 4. Channel Breakout — buy when high breaks N-bar highest high, sell when low breaks N-bar lowest low
  {
    name: 'STRAT_CHANBO', shortName: 'Channel BO',
    calcParams: [20],
    calc: (data, [n]) => {
      const dir: number[] = new Array(data.length).fill(0);
      for (let i = n; i < data.length; i++) {
        let hi = -Infinity, lo = Infinity;
        for (let j = i - n; j < i; j++) {
          if (data[j].high > hi) hi = data[j].high;
          if (data[j].low < lo) lo = data[j].low;
        }
        if (data[i].high > hi) dir[i] = 1;
        else if (data[i].low < lo) dir[i] = -1;
        else dir[i] = dir[i - 1];
      }
      return markersFromSignals(data, eventsFromDirection(dir));
    },
  },

  // 5. Consecutive Up/Down — like BarUpDn but compares closes
  {
    name: 'STRAT_CONSEC', shortName: 'Consec U/D',
    calcParams: [4],
    calc: (data, [n]) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = n; i < data.length; i++) {
        let up = true, dn = true;
        for (let j = i - n + 1; j <= i; j++) {
          if (data[j].close <= data[j - 1].close) up = false;
          if (data[j].close >= data[j - 1].close) dn = false;
        }
        sig[i] = up ? 1 : dn ? -1 : 0;
      }
      return markersFromSignals(data, eventsFromDirection(sig));
    },
  },

  // 6. Greedy — buy after a strong bullish bar (large body relative to ATR), sell after strong bearish
  {
    name: 'STRAT_GREEDY', shortName: 'Greedy',
    calcParams: [14, 1.5],
    calc: (data, [n, mult]) => {
      const tr = trueRange(data);
      const atr = wilder(tr, n);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 0; i < data.length; i++) {
        const a = atr[i]; if (a === undefined) continue;
        const body = data[i].close - data[i].open;
        if (body > mult * a) sig[i] = 1;
        else if (-body > mult * a) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 7. Inside Bar — current bar's range inside previous bar; signal in direction of next break
  {
    name: 'STRAT_INSIDE', shortName: 'Inside Bar',
    calcParams: [],
    calc: (data) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 2; i < data.length; i++) {
        const inside = data[i - 1].high < data[i - 2].high && data[i - 1].low > data[i - 2].low;
        if (!inside) continue;
        if (data[i].close > data[i - 1].high) sig[i] = 1;
        else if (data[i].close < data[i - 1].low) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 8. Keltner Channels — trend follow: buy on close above upper band, sell on close below lower
  {
    name: 'STRAT_KC', shortName: 'Keltner',
    calcParams: [20, 2, 10],
    calc: (data, [n, mult, atrLen]) => {
      const closes = data.map(d => d.close);
      const mid = ema(closes, n);
      const tr = trueRange(data);
      const atr = wilder(tr, atrLen);
      const dir: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (mid[i] === undefined || atr[i] === undefined) continue;
        const up = (mid[i] as number) + mult * (atr[i] as number);
        const dn = (mid[i] as number) - mult * (atr[i] as number);
        if (closes[i] > up) dir[i] = 1;
        else if (closes[i] < dn) dir[i] = -1;
        else dir[i] = dir[i - 1];
      }
      return markersFromSignals(data, eventsFromDirection(dir));
    },
  },

  // 9. MACD — buy on MACD crossing above signal, sell on cross below
  {
    name: 'STRAT_MACD', shortName: 'MACD',
    calcParams: [12, 26, 9],
    calc: (data, [fast, slow, sig]) => {
      const closes = data.map(d => d.close);
      const ef = ema(closes, fast), es = ema(closes, slow);
      const macd = closes.map((_, i) =>
        ef[i] !== undefined && es[i] !== undefined ? (ef[i] as number) - (es[i] as number) : NaN);
      const sigLine = ema(macd.map(v => isNaN(v) ? 0 : v), sig);
      const out: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (isNaN(macd[i]) || sigLine[i] === undefined || sigLine[i - 1] === undefined) continue;
        const a = macd[i] - (sigLine[i] as number);
        const b = macd[i - 1] - (sigLine[i - 1] as number);
        if (b <= 0 && a > 0) out[i] = 1;
        else if (b >= 0 && a < 0) out[i] = -1;
      }
      return markersFromSignals(data, out);
    },
  },

  // 10. Momentum — buy when close - close[N] crosses above 0, sell when crosses below
  {
    name: 'STRAT_MOMENTUM', shortName: 'Momentum',
    calcParams: [12],
    calc: (data, [n]) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = n + 1; i < data.length; i++) {
        const m = data[i].close - data[i - n].close;
        const mp = data[i - 1].close - data[i - n - 1].close;
        if (mp <= 0 && m > 0) sig[i] = 1;
        else if (mp >= 0 && m < 0) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 11. MovingAvg 2-Line Cross — fast MA crossing slow MA
  {
    name: 'STRAT_MA2X', shortName: 'MA2 Cross',
    calcParams: [9, 21],
    calc: (data, [fast, slow]) => {
      const closes = data.map(d => d.close);
      const f = sma(closes, fast), s = sma(closes, slow);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (f[i] === undefined || s[i] === undefined || f[i - 1] === undefined || s[i - 1] === undefined) continue;
        const a = (f[i] as number) - (s[i] as number);
        const b = (f[i - 1] as number) - (s[i - 1] as number);
        if (b <= 0 && a > 0) sig[i] = 1;
        else if (b >= 0 && a < 0) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 12. MovingAvg Cross — price crossing single MA
  {
    name: 'STRAT_MAX', shortName: 'MA Cross',
    calcParams: [50],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (m[i] === undefined || m[i - 1] === undefined) continue;
        const a = closes[i] - (m[i] as number);
        const b = closes[i - 1] - (m[i - 1] as number);
        if (b <= 0 && a > 0) sig[i] = 1;
        else if (b >= 0 && a < 0) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 13. Outside Bar — engulfing previous range; signal in direction of close vs prev close
  {
    name: 'STRAT_OUTSIDE', shortName: 'Outside Bar',
    calcParams: [],
    calc: (data) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        const outside = data[i].high > data[i - 1].high && data[i].low < data[i - 1].low;
        if (!outside) continue;
        if (data[i].close > data[i - 1].close) sig[i] = 1;
        else if (data[i].close < data[i - 1].close) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 14. Parabolic SAR — flip events
  {
    name: 'STRAT_SAR', shortName: 'PSAR',
    calcParams: [2, 2, 20], // step×100, max×100, init lookback (kept simple)
    calc: (data) => {
      const af0 = 0.02, afMax = 0.2, afStep = 0.02;
      const sig: number[] = new Array(data.length).fill(0);
      if (data.length < 3) return markersFromSignals(data, sig);
      let isLong = data[1].close > data[0].close;
      let af = af0;
      let ep = isLong ? data[1].high : data[1].low;
      let sar = isLong ? data[0].low : data[0].high;
      for (let i = 2; i < data.length; i++) {
        const prevSar = sar;
        sar = sar + af * (ep - sar);
        if (isLong) {
          if (data[i].low < sar) {
            isLong = false; sig[i] = -1;
            sar = ep; ep = data[i].low; af = af0;
          } else {
            if (data[i].high > ep) { ep = data[i].high; af = Math.min(af + afStep, afMax); }
            sar = Math.min(sar, data[i - 1].low, data[i - 2].low);
          }
        } else {
          if (data[i].high > sar) {
            isLong = true; sig[i] = 1;
            sar = ep; ep = data[i].high; af = af0;
          } else {
            if (data[i].low < ep) { ep = data[i].low; af = Math.min(af + afStep, afMax); }
            sar = Math.max(sar, data[i - 1].high, data[i - 2].high);
          }
        }
        void prevSar;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 15. Pivot Extension — buy on close above prev-bar pivot R1, sell on close below S1
  {
    name: 'STRAT_PIVOT_EXT', shortName: 'Pivot Ext',
    calcParams: [],
    calc: (data) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        const p = (data[i - 1].high + data[i - 1].low + data[i - 1].close) / 3;
        const r1 = 2 * p - data[i - 1].low;
        const s1 = 2 * p - data[i - 1].high;
        if (data[i].close > r1) sig[i] = 1;
        else if (data[i].close < s1) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 16. Pivot Reversal — local swing high/low (3-bar) → reversal entry
  {
    name: 'STRAT_PIVOT_REV', shortName: 'Pivot Rev',
    calcParams: [2],
    calc: (data, [n]) => {
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = n; i < data.length - n; i++) {
        let isHi = true, isLo = true;
        for (let j = 1; j <= n; j++) {
          if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) isHi = false;
          if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) isLo = false;
        }
        if (isHi) sig[i] = -1;
        else if (isLo) sig[i] = 1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 17. Price Channel — Donchian breakout (close-based, separate entry/exit windows)
  {
    name: 'STRAT_PRICE_CH', shortName: 'Price Channel',
    calcParams: [20, 10],
    calc: (data, [entry, exitN]) => {
      const dir: number[] = new Array(data.length).fill(0);
      for (let i = entry; i < data.length; i++) {
        let hi = -Infinity, lo = Infinity;
        for (let j = i - entry; j < i; j++) {
          if (data[j].high > hi) hi = data[j].high;
          if (data[j].low < lo) lo = data[j].low;
        }
        if (data[i].close > hi) dir[i] = 1;
        else if (data[i].close < lo) dir[i] = -1;
        else {
          let xh = -Infinity, xl = Infinity;
          for (let j = Math.max(0, i - exitN); j < i; j++) {
            if (data[j].high > xh) xh = data[j].high;
            if (data[j].low < xl) xl = data[j].low;
          }
          if (dir[i - 1] > 0 && data[i].close < xl) dir[i] = 0;
          else if (dir[i - 1] < 0 && data[i].close > xh) dir[i] = 0;
          else dir[i] = dir[i - 1];
        }
      }
      return markersFromSignals(data, eventsFromDirection(dir));
    },
  },

  // 18. RSI — buy on cross up through 30, sell on cross down through 70
  {
    name: 'STRAT_RSI', shortName: 'RSI',
    calcParams: [14, 30, 70],
    calc: (data, [n, lo, hi]) => {
      const closes = data.map(d => d.close);
      const gains: number[] = [0], losses: number[] = [0];
      for (let i = 1; i < closes.length; i++) {
        const ch = closes[i] - closes[i - 1];
        gains.push(ch > 0 ? ch : 0);
        losses.push(ch < 0 ? -ch : 0);
      }
      const ag = wilder(gains, n), al = wilder(losses, n);
      const rsi = closes.map((_, i) => {
        if (ag[i] === undefined || al[i] === undefined) return NaN;
        const rs = (al[i] as number) === 0 ? 100 : (ag[i] as number) / (al[i] as number);
        return 100 - 100 / (1 + rs);
      });
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        if (isNaN(rsi[i]) || isNaN(rsi[i - 1])) continue;
        if (rsi[i - 1] < lo && rsi[i] >= lo) sig[i] = 1;
        else if (rsi[i - 1] > hi && rsi[i] <= hi) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 19. Stochastic Slow — %K cross %D in oversold/overbought zones
  {
    name: 'STRAT_STOCH', shortName: 'Stoch Slow',
    calcParams: [14, 3, 3, 20, 80],
    calc: (data, [k, kSm, dPer, lo, hi]) => {
      const rawK: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < k - 1) { rawK.push(NaN); continue; }
        let h = -Infinity, l = Infinity;
        for (let j = i - k + 1; j <= i; j++) {
          if (data[j].high > h) h = data[j].high;
          if (data[j].low < l) l = data[j].low;
        }
        rawK.push(h === l ? 50 : ((data[i].close - l) / (h - l)) * 100);
      }
      const ks = sma(rawK.map(v => isNaN(v) ? 0 : v), kSm);
      const ds = sma(ks.map(v => v ?? 0), dPer);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        const a = ks[i], b = ds[i], pa = ks[i - 1], pb = ds[i - 1];
        if (a === undefined || b === undefined || pa === undefined || pb === undefined) continue;
        if (pa <= pb && a > b && a < lo) sig[i] = 1;
        else if (pa >= pb && a < b && a > hi) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 20. Supertrend — direction flip
  {
    name: 'STRAT_SUPERTREND', shortName: 'Supertrend',
    calcParams: [10, 3],
    calc: (data, [n, mult]) => {
      const tr = trueRange(data);
      const atr = wilder(tr, n);
      const sig: number[] = new Array(data.length).fill(0);
      let prevSt = 0; let prevDir = 0;
      for (let i = 0; i < data.length; i++) {
        const a = atr[i]; if (a === undefined) continue;
        const hl2 = (data[i].high + data[i].low) / 2;
        const upBand = hl2 + mult * a;
        const dnBand = hl2 - mult * a;
        let dir = prevDir; let st: number;
        if (prevSt === 0) {
          dir = data[i].close > hl2 ? 1 : -1;
          st = dir === 1 ? dnBand : upBand;
        } else if (prevDir === 1) {
          st = Math.max(dnBand, prevSt);
          if (data[i].close < st) { dir = -1; st = upBand; sig[i] = -1; }
        } else {
          st = Math.min(upBand, prevSt);
          if (data[i].close > st) { dir = 1; st = dnBand; sig[i] = 1; }
        }
        prevSt = st; prevDir = dir;
      }
      return markersFromSignals(data, sig);
    },
  },

  // 21. Volty Expan Close — close exceeds previous close ± k*stdev(N)
  {
    name: 'STRAT_VOLTY', shortName: 'Volty Expan',
    calcParams: [40, 2],
    calc: (data, [n, mult]) => {
      const closes = data.map(d => d.close);
      const sd = stdev(closes, n);
      const sig: number[] = new Array(data.length).fill(0);
      for (let i = 1; i < data.length; i++) {
        const s = sd[i]; if (s === undefined) continue;
        if (closes[i] > closes[i - 1] + mult * s) sig[i] = 1;
        else if (closes[i] < closes[i - 1] - mult * s) sig[i] = -1;
      }
      return markersFromSignals(data, sig);
    },
  },
];

// ─── Registration ─────────────────────────────────────────────────────

let registered = false;

export function registerStrategies() {
  if (registered) return;
  for (const strat of STRATEGIES) {
    try {
      registerIndicator({
        name: strat.name,
        shortName: strat.shortName,
        calcParams: strat.calcParams,
        figures: [
          {
            key: 'buy',
            title: 'Buy: ',
            type: 'circle',
            styles: () => ({ style: 'fill', color: '#10B981' }),
          },
          {
            key: 'sell',
            title: 'Sell: ',
            type: 'circle',
            styles: () => ({ style: 'fill', color: '#EF4444' }),
          },
        ],
        calc: (dataList: KLineData[], indicator: { calcParams: number[] }) =>
          strat.calc(dataList, indicator.calcParams ?? strat.calcParams),
      });
    } catch (e) {
      console.warn(`[strategies] Failed to register ${strat.name}:`, e);
    }
  }
  registered = true;
}

export const STRATEGY_META = STRATEGIES.map(s => ({
  id: s.name,
  label: s.shortName,
}));
