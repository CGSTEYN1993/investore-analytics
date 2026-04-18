/**
 * Custom indicator registry for klinecharts.
 *
 * Adds canonical TA indicators on top of klinecharts' built-ins so the
 * InvestOre chart can match the practical subset of TradingView's catalog.
 *
 * All formulas are public-domain technical analysis (no copied code from
 * TradingView Pine Script).
 */

import { registerIndicator, type KLineData } from 'klinecharts';

// ─── Math helpers ─────────────────────────────────────────────────────────

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
    if (i === 0) {
      out.push(h - l);
    } else {
      const pc = data[i - 1].close;
      out.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
  }
  return out;
};

// ─── Custom indicator definitions ─────────────────────────────────────────

interface CustomIndicator {
  name: string;
  shortName: string;
  paneType: 'main' | 'sub';
  calcParams: number[];
  figures: Array<{ key: string; title: string; type: 'line' | 'bar' }>;
  calc: (data: KLineData[], params: number[]) => Record<string, number>[];
}

const INDICATORS: CustomIndicator[] = [
  // ─── Moving averages ─────────────────────────────────────────────────
  {
    name: 'WMA', shortName: 'WMA', paneType: 'main', calcParams: [9, 21],
    figures: [
      { key: 'wma1', title: 'WMA1: ', type: 'line' },
      { key: 'wma2', title: 'WMA2: ', type: 'line' },
    ],
    calc: (data, [n1, n2]) => {
      const closes = data.map(d => d.close);
      const wma = (n: number) => {
        const out: (number | undefined)[] = new Array(closes.length).fill(undefined);
        const denom = (n * (n + 1)) / 2;
        for (let i = n - 1; i < closes.length; i++) {
          let s = 0;
          for (let j = 0; j < n; j++) s += closes[i - j] * (n - j);
          out[i] = s / denom;
        }
        return out;
      };
      const a = wma(n1), b = wma(n2);
      return data.map((_, i) => ({ wma1: a[i] as number, wma2: b[i] as number }));
    },
  },
  {
    name: 'DEMA', shortName: 'DEMA', paneType: 'main', calcParams: [21],
    figures: [{ key: 'dema', title: 'DEMA: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const e1 = ema(closes, n);
      const e2 = ema(e1.map(x => x ?? 0), n);
      return data.map((_, i) => ({
        dema: e1[i] !== undefined && e2[i] !== undefined
          ? 2 * (e1[i] as number) - (e2[i] as number)
          : (undefined as unknown as number),
      }));
    },
  },
  {
    name: 'TEMA', shortName: 'TEMA', paneType: 'main', calcParams: [21],
    figures: [{ key: 'tema', title: 'TEMA: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const e1 = ema(closes, n);
      const e2 = ema(e1.map(x => x ?? 0), n);
      const e3 = ema(e2.map(x => x ?? 0), n);
      return data.map((_, i) => ({
        tema: e1[i] !== undefined && e2[i] !== undefined && e3[i] !== undefined
          ? 3 * (e1[i] as number) - 3 * (e2[i] as number) + (e3[i] as number)
          : (undefined as unknown as number),
      }));
    },
  },
  {
    name: 'HMA', shortName: 'HMA', paneType: 'main', calcParams: [20],
    figures: [{ key: 'hma', title: 'HMA: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const wma = (vals: number[], len: number) => {
        const out: (number | undefined)[] = new Array(vals.length).fill(undefined);
        const denom = (len * (len + 1)) / 2;
        for (let i = len - 1; i < vals.length; i++) {
          let s = 0;
          for (let j = 0; j < len; j++) s += vals[i - j] * (len - j);
          out[i] = s / denom;
        }
        return out;
      };
      const half = wma(closes, Math.floor(n / 2));
      const full = wma(closes, n);
      const diff = closes.map((_, i) =>
        half[i] !== undefined && full[i] !== undefined
          ? 2 * (half[i] as number) - (full[i] as number)
          : 0,
      );
      const sqrtN = Math.floor(Math.sqrt(n));
      const hma = wma(diff, sqrtN);
      return data.map((_, i) => ({ hma: hma[i] as number }));
    },
  },
  {
    name: 'VWMA', shortName: 'VWMA', paneType: 'main', calcParams: [20],
    figures: [{ key: 'vwma', title: 'VWMA: ', type: 'line' }],
    calc: (data, [n]) => {
      const out: { vwma: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < n - 1) { out.push({ vwma: undefined as unknown as number }); continue; }
        let pv = 0, v = 0;
        for (let j = i - n + 1; j <= i; j++) {
          const vol = data[j].volume ?? 0;
          pv += data[j].close * vol;
          v += vol;
        }
        out.push({ vwma: v > 0 ? pv / v : 0 });
      }
      return out;
    },
  },
  {
    name: 'VWAP', shortName: 'VWAP', paneType: 'main', calcParams: [],
    figures: [{ key: 'vwap', title: 'VWAP: ', type: 'line' }],
    calc: (data) => {
      let pv = 0, v = 0;
      return data.map(d => {
        const tp = (d.high + d.low + d.close) / 3;
        const vol = d.volume ?? 0;
        pv += tp * vol;
        v += vol;
        return { vwap: v > 0 ? pv / v : 0 };
      });
    },
  },

  // ─── Volatility / channels ───────────────────────────────────────────
  {
    name: 'ATR', shortName: 'ATR', paneType: 'sub', calcParams: [14],
    figures: [{ key: 'atr', title: 'ATR: ', type: 'line' }],
    calc: (data, [n]) => {
      const tr = trueRange(data);
      const a = wilder(tr, n);
      return data.map((_, i) => ({ atr: a[i] as number }));
    },
  },
  {
    name: 'STDEV', shortName: 'StDev', paneType: 'sub', calcParams: [20],
    figures: [{ key: 'stdev', title: 'StDev: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const s = stdev(closes, n);
      return data.map((_, i) => ({ stdev: s[i] as number }));
    },
  },
  {
    name: 'KC', shortName: 'Keltner', paneType: 'main', calcParams: [20, 2, 10],
    figures: [
      { key: 'mid', title: 'Mid: ', type: 'line' },
      { key: 'up', title: 'Up: ', type: 'line' },
      { key: 'dn', title: 'Dn: ', type: 'line' },
    ],
    calc: (data, [n, mult, atrLen]) => {
      const closes = data.map(d => d.close);
      const mid = ema(closes, n);
      const tr = trueRange(data);
      const atr = wilder(tr, atrLen);
      return data.map((_, i) => {
        const m = mid[i], a = atr[i];
        if (m === undefined || a === undefined) {
          return { mid: undefined as unknown as number, up: undefined as unknown as number, dn: undefined as unknown as number };
        }
        return { mid: m, up: m + mult * a, dn: m - mult * a };
      });
    },
  },
  {
    name: 'DC', shortName: 'Donchian', paneType: 'main', calcParams: [20],
    figures: [
      { key: 'up', title: 'Up: ', type: 'line' },
      { key: 'mid', title: 'Mid: ', type: 'line' },
      { key: 'dn', title: 'Dn: ', type: 'line' },
    ],
    calc: (data, [n]) => {
      return data.map((_, i) => {
        if (i < n - 1) return { up: undefined, mid: undefined, dn: undefined } as never;
        let hi = -Infinity, lo = Infinity;
        for (let j = i - n + 1; j <= i; j++) {
          if (data[j].high > hi) hi = data[j].high;
          if (data[j].low < lo) lo = data[j].low;
        }
        return { up: hi, mid: (hi + lo) / 2, dn: lo };
      });
    },
  },
  {
    name: 'ENV', shortName: 'Envelope', paneType: 'main', calcParams: [20, 2.5],
    figures: [
      { key: 'mid', title: 'Mid: ', type: 'line' },
      { key: 'up', title: 'Up: ', type: 'line' },
      { key: 'dn', title: 'Dn: ', type: 'line' },
    ],
    calc: (data, [n, pct]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n);
      return data.map((_, i) => {
        const v = m[i];
        if (v === undefined) return { mid: undefined, up: undefined, dn: undefined } as never;
        const off = v * (pct / 100);
        return { mid: v, up: v + off, dn: v - off };
      });
    },
  },
  {
    name: 'BBPCT', shortName: 'BB %b', paneType: 'sub', calcParams: [20, 2],
    figures: [{ key: 'pctb', title: '%b: ', type: 'line' }],
    calc: (data, [n, mult]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n), s = stdev(closes, n);
      return data.map((_, i) => {
        if (m[i] === undefined || s[i] === undefined) return { pctb: undefined as unknown as number };
        const up = (m[i] as number) + mult * (s[i] as number);
        const dn = (m[i] as number) - mult * (s[i] as number);
        const range = up - dn;
        return { pctb: range === 0 ? 0 : (closes[i] - dn) / range };
      });
    },
  },
  {
    name: 'BBW', shortName: 'BB Width', paneType: 'sub', calcParams: [20, 2],
    figures: [{ key: 'bbw', title: 'BBW: ', type: 'line' }],
    calc: (data, [n, mult]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n), s = stdev(closes, n);
      return data.map((_, i) => {
        if (m[i] === undefined || s[i] === undefined) return { bbw: undefined as unknown as number };
        const up = (m[i] as number) + mult * (s[i] as number);
        const dn = (m[i] as number) - mult * (s[i] as number);
        return { bbw: ((up - dn) / (m[i] as number)) * 100 };
      });
    },
  },
  {
    name: 'SUPERTREND', shortName: 'Supertrend', paneType: 'main', calcParams: [10, 3],
    figures: [{ key: 'st', title: 'ST: ', type: 'line' }],
    calc: (data, [n, mult]) => {
      const tr = trueRange(data);
      const atr = wilder(tr, n);
      const out: { st: number }[] = [];
      let prevSt = 0; let prevDir = 1;
      for (let i = 0; i < data.length; i++) {
        const a = atr[i];
        if (a === undefined) { out.push({ st: undefined as unknown as number }); continue; }
        const hl2 = (data[i].high + data[i].low) / 2;
        const upBand = hl2 + mult * a;
        const dnBand = hl2 - mult * a;
        let dir = prevDir;
        let st: number;
        if (i === 0 || prevSt === 0) {
          dir = data[i].close > hl2 ? 1 : -1;
          st = dir === 1 ? dnBand : upBand;
        } else {
          if (prevDir === 1) {
            st = Math.max(dnBand, prevSt);
            if (data[i].close < st) { dir = -1; st = upBand; }
          } else {
            st = Math.min(upBand, prevSt);
            if (data[i].close > st) { dir = 1; st = dnBand; }
          }
        }
        prevSt = st; prevDir = dir;
        out.push({ st });
      }
      return out;
    },
  },

  // ─── Momentum / oscillators ──────────────────────────────────────────
  {
    name: 'STOCH', shortName: 'Stoch', paneType: 'sub', calcParams: [14, 3, 3],
    figures: [
      { key: 'k', title: 'K: ', type: 'line' },
      { key: 'd', title: 'D: ', type: 'line' },
    ],
    calc: (data, [k, kSmooth, dPeriod]) => {
      const rawK: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < k - 1) { rawK.push(NaN); continue; }
        let hi = -Infinity, lo = Infinity;
        for (let j = i - k + 1; j <= i; j++) {
          if (data[j].high > hi) hi = data[j].high;
          if (data[j].low < lo) lo = data[j].low;
        }
        rawK.push(hi === lo ? 50 : ((data[i].close - lo) / (hi - lo)) * 100);
      }
      const smoothed = sma(rawK.map(v => isNaN(v) ? 0 : v), kSmooth);
      const dLine = sma(smoothed.map(v => v ?? 0), dPeriod);
      return data.map((_, i) => ({
        k: smoothed[i] as number,
        d: dLine[i] as number,
      }));
    },
  },
  {
    name: 'STOCHRSI', shortName: 'StochRSI', paneType: 'sub', calcParams: [14, 14, 3, 3],
    figures: [
      { key: 'k', title: 'K: ', type: 'line' },
      { key: 'd', title: 'D: ', type: 'line' },
    ],
    calc: (data, [rsiLen, stochLen, kSmooth, dPeriod]) => {
      const closes = data.map(d => d.close);
      // RSI
      const gains: number[] = [0], losses: number[] = [0];
      for (let i = 1; i < closes.length; i++) {
        const ch = closes[i] - closes[i - 1];
        gains.push(ch > 0 ? ch : 0);
        losses.push(ch < 0 ? -ch : 0);
      }
      const ag = wilder(gains, rsiLen);
      const al = wilder(losses, rsiLen);
      const rsi: number[] = closes.map((_, i) => {
        if (ag[i] === undefined || al[i] === undefined) return NaN;
        const rs = (al[i] as number) === 0 ? 100 : (ag[i] as number) / (al[i] as number);
        return 100 - 100 / (1 + rs);
      });
      // Stoch of RSI
      const k: number[] = [];
      for (let i = 0; i < rsi.length; i++) {
        if (i < stochLen - 1 || isNaN(rsi[i])) { k.push(NaN); continue; }
        let hi = -Infinity, lo = Infinity;
        for (let j = i - stochLen + 1; j <= i; j++) {
          if (isNaN(rsi[j])) continue;
          if (rsi[j] > hi) hi = rsi[j];
          if (rsi[j] < lo) lo = rsi[j];
        }
        k.push(hi === lo ? 50 : ((rsi[i] - lo) / (hi - lo)) * 100);
      }
      const ks = sma(k.map(v => isNaN(v) ? 0 : v), kSmooth);
      const ds = sma(ks.map(v => v ?? 0), dPeriod);
      return data.map((_, i) => ({ k: ks[i] as number, d: ds[i] as number }));
    },
  },
  {
    name: 'ADX', shortName: 'ADX', paneType: 'sub', calcParams: [14],
    figures: [
      { key: 'adx', title: 'ADX: ', type: 'line' },
      { key: 'pdi', title: '+DI: ', type: 'line' },
      { key: 'mdi', title: '-DI: ', type: 'line' },
    ],
    calc: (data, [n]) => {
      const tr = trueRange(data);
      const plusDM: number[] = [0], minusDM: number[] = [0];
      for (let i = 1; i < data.length; i++) {
        const up = data[i].high - data[i - 1].high;
        const dn = data[i - 1].low - data[i].low;
        plusDM.push(up > dn && up > 0 ? up : 0);
        minusDM.push(dn > up && dn > 0 ? dn : 0);
      }
      const atr = wilder(tr, n);
      const pdm = wilder(plusDM, n);
      const mdm = wilder(minusDM, n);
      const pdi = data.map((_, i) =>
        atr[i] !== undefined && pdm[i] !== undefined
          ? ((pdm[i] as number) / (atr[i] as number)) * 100 : NaN);
      const mdi = data.map((_, i) =>
        atr[i] !== undefined && mdm[i] !== undefined
          ? ((mdm[i] as number) / (atr[i] as number)) * 100 : NaN);
      const dx = data.map((_, i) => {
        const a = pdi[i], b = mdi[i];
        if (isNaN(a) || isNaN(b)) return NaN;
        const sum = a + b;
        return sum === 0 ? 0 : (Math.abs(a - b) / sum) * 100;
      });
      const adx = wilder(dx.map(v => isNaN(v) ? 0 : v), n);
      return data.map((_, i) => ({
        adx: adx[i] as number,
        pdi: pdi[i],
        mdi: mdi[i],
      }));
    },
  },
  {
    name: 'MFI', shortName: 'MFI', paneType: 'sub', calcParams: [14],
    figures: [{ key: 'mfi', title: 'MFI: ', type: 'line' }],
    calc: (data, [n]) => {
      const tp = data.map(d => (d.high + d.low + d.close) / 3);
      const rmf = tp.map((t, i) => t * (data[i].volume ?? 0));
      const out: { mfi: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < n) { out.push({ mfi: undefined as unknown as number }); continue; }
        let pos = 0, neg = 0;
        for (let j = i - n + 1; j <= i; j++) {
          if (tp[j] > tp[j - 1]) pos += rmf[j];
          else if (tp[j] < tp[j - 1]) neg += rmf[j];
        }
        const mr = neg === 0 ? 100 : pos / neg;
        out.push({ mfi: 100 - 100 / (1 + mr) });
      }
      return out;
    },
  },
  {
    name: 'CMF', shortName: 'CMF', paneType: 'sub', calcParams: [20],
    figures: [{ key: 'cmf', title: 'CMF: ', type: 'line' }],
    calc: (data, [n]) => {
      const mfv = data.map(d => {
        const range = d.high - d.low;
        if (range === 0) return 0;
        return (((d.close - d.low) - (d.high - d.close)) / range) * (d.volume ?? 0);
      });
      const out: { cmf: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < n - 1) { out.push({ cmf: undefined as unknown as number }); continue; }
        let mfvSum = 0, vSum = 0;
        for (let j = i - n + 1; j <= i; j++) {
          mfvSum += mfv[j]; vSum += (data[j].volume ?? 0);
        }
        out.push({ cmf: vSum === 0 ? 0 : mfvSum / vSum });
      }
      return out;
    },
  },
  {
    name: 'AD', shortName: 'A/D', paneType: 'sub', calcParams: [],
    figures: [{ key: 'ad', title: 'A/D: ', type: 'line' }],
    calc: (data) => {
      let cum = 0;
      return data.map(d => {
        const range = d.high - d.low;
        const mfm = range === 0 ? 0 : ((d.close - d.low) - (d.high - d.close)) / range;
        cum += mfm * (d.volume ?? 0);
        return { ad: cum };
      });
    },
  },
  {
    name: 'CHO', shortName: 'Chaikin Osc', paneType: 'sub', calcParams: [3, 10],
    figures: [{ key: 'cho', title: 'CHO: ', type: 'line' }],
    calc: (data, [fast, slow]) => {
      let cum = 0;
      const ad = data.map(d => {
        const range = d.high - d.low;
        const mfm = range === 0 ? 0 : ((d.close - d.low) - (d.high - d.close)) / range;
        cum += mfm * (d.volume ?? 0);
        return cum;
      });
      const ef = ema(ad, fast); const es = ema(ad, slow);
      return data.map((_, i) => ({
        cho: ef[i] !== undefined && es[i] !== undefined
          ? (ef[i] as number) - (es[i] as number) : (undefined as unknown as number),
      }));
    },
  },
  {
    name: 'UO', shortName: 'Ultimate', paneType: 'sub', calcParams: [7, 14, 28],
    figures: [{ key: 'uo', title: 'UO: ', type: 'line' }],
    calc: (data, [a, b, c]) => {
      const bp: number[] = [0]; const tr: number[] = [0];
      for (let i = 1; i < data.length; i++) {
        const minLC = Math.min(data[i].low, data[i - 1].close);
        const maxHC = Math.max(data[i].high, data[i - 1].close);
        bp.push(data[i].close - minLC);
        tr.push(maxHC - minLC);
      }
      const sumWin = (arr: number[], n: number, i: number) => {
        let s = 0;
        for (let j = Math.max(0, i - n + 1); j <= i; j++) s += arr[j];
        return s;
      };
      return data.map((_, i) => {
        if (i < c - 1) return { uo: undefined as unknown as number };
        const tA = sumWin(tr, a, i), tB = sumWin(tr, b, i), tC = sumWin(tr, c, i);
        if (tA === 0 || tB === 0 || tC === 0) return { uo: undefined as unknown as number };
        const avgA = sumWin(bp, a, i) / tA;
        const avgB = sumWin(bp, b, i) / tB;
        const avgC = sumWin(bp, c, i) / tC;
        return { uo: 100 * (4 * avgA + 2 * avgB + avgC) / 7 };
      });
    },
  },
  {
    name: 'BOP', shortName: 'BoP', paneType: 'sub', calcParams: [],
    figures: [{ key: 'bop', title: 'BoP: ', type: 'line' }],
    calc: (data) => data.map(d => {
      const r = d.high - d.low;
      return { bop: r === 0 ? 0 : (d.close - d.open) / r };
    }),
  },
  {
    name: 'AROON', shortName: 'Aroon', paneType: 'sub', calcParams: [14],
    figures: [
      { key: 'up', title: 'Up: ', type: 'line' },
      { key: 'dn', title: 'Dn: ', type: 'line' },
    ],
    calc: (data, [n]) => data.map((_, i) => {
      if (i < n) return { up: undefined as unknown as number, dn: undefined as unknown as number };
      let hi = -Infinity, lo = Infinity, hiIdx = i, loIdx = i;
      for (let j = i - n; j <= i; j++) {
        if (data[j].high >= hi) { hi = data[j].high; hiIdx = j; }
        if (data[j].low <= lo) { lo = data[j].low; loIdx = j; }
      }
      return {
        up: (100 * (n - (i - hiIdx))) / n,
        dn: (100 * (n - (i - loIdx))) / n,
      };
    }),
  },
  {
    name: 'AROONOSC', shortName: 'Aroon Osc', paneType: 'sub', calcParams: [14],
    figures: [{ key: 'osc', title: 'Osc: ', type: 'line' }],
    calc: (data, [n]) => data.map((_, i) => {
      if (i < n) return { osc: undefined as unknown as number };
      let hi = -Infinity, lo = Infinity, hiIdx = i, loIdx = i;
      for (let j = i - n; j <= i; j++) {
        if (data[j].high >= hi) { hi = data[j].high; hiIdx = j; }
        if (data[j].low <= lo) { lo = data[j].low; loIdx = j; }
      }
      const up = (100 * (n - (i - hiIdx))) / n;
      const dn = (100 * (n - (i - loIdx))) / n;
      return { osc: up - dn };
    }),
  },
  {
    name: 'VORTEX', shortName: 'Vortex', paneType: 'sub', calcParams: [14],
    figures: [
      { key: 'vip', title: '+VI: ', type: 'line' },
      { key: 'vim', title: '-VI: ', type: 'line' },
    ],
    calc: (data, [n]) => {
      const tr = trueRange(data);
      const vmp: number[] = [0], vmm: number[] = [0];
      for (let i = 1; i < data.length; i++) {
        vmp.push(Math.abs(data[i].high - data[i - 1].low));
        vmm.push(Math.abs(data[i].low - data[i - 1].high));
      }
      const sumWin = (arr: number[], i: number) => {
        let s = 0;
        for (let j = Math.max(0, i - n + 1); j <= i; j++) s += arr[j];
        return s;
      };
      return data.map((_, i) => {
        if (i < n) return { vip: undefined as unknown as number, vim: undefined as unknown as number };
        const t = sumWin(tr, i);
        if (t === 0) return { vip: undefined as unknown as number, vim: undefined as unknown as number };
        return { vip: sumWin(vmp, i) / t, vim: sumWin(vmm, i) / t };
      });
    },
  },
  {
    name: 'CHOP', shortName: 'Chop', paneType: 'sub', calcParams: [14],
    figures: [{ key: 'chop', title: 'Chop: ', type: 'line' }],
    calc: (data, [n]) => {
      const tr = trueRange(data);
      return data.map((_, i) => {
        if (i < n - 1) return { chop: undefined as unknown as number };
        let trSum = 0, hi = -Infinity, lo = Infinity;
        for (let j = i - n + 1; j <= i; j++) {
          trSum += tr[j];
          if (data[j].high > hi) hi = data[j].high;
          if (data[j].low < lo) lo = data[j].low;
        }
        const range = hi - lo;
        if (range === 0 || trSum === 0) return { chop: 0 };
        return { chop: (100 * Math.log10(trSum / range)) / Math.log10(n) };
      });
    },
  },
  {
    name: 'FORCE', shortName: 'Force', paneType: 'sub', calcParams: [13],
    figures: [{ key: 'force', title: 'Force: ', type: 'line' }],
    calc: (data, [n]) => {
      const raw: number[] = [0];
      for (let i = 1; i < data.length; i++) raw.push((data[i].close - data[i - 1].close) * (data[i].volume ?? 0));
      const e = ema(raw, n);
      return data.map((_, i) => ({ force: e[i] as number }));
    },
  },
  {
    name: 'EOM', shortName: 'EoM', paneType: 'sub', calcParams: [14],
    figures: [{ key: 'eom', title: 'EoM: ', type: 'line' }],
    calc: (data, [n]) => {
      const raw: number[] = [0];
      for (let i = 1; i < data.length; i++) {
        const dist = ((data[i].high + data[i].low) / 2) - ((data[i - 1].high + data[i - 1].low) / 2);
        const vol = data[i].volume ?? 0;
        const boxRatio = vol === 0 ? 0 : (vol / 100000000) / (data[i].high - data[i].low || 1);
        raw.push(boxRatio === 0 ? 0 : dist / boxRatio);
      }
      const s = sma(raw, n);
      return data.map((_, i) => ({ eom: s[i] as number }));
    },
  },
  {
    name: 'MASS', shortName: 'Mass Idx', paneType: 'sub', calcParams: [9, 25],
    figures: [{ key: 'mass', title: 'Mass: ', type: 'line' }],
    calc: (data, [emaLen, sumLen]) => {
      const range = data.map(d => d.high - d.low);
      const e1 = ema(range, emaLen);
      const e2 = ema(e1.map(v => v ?? 0), emaLen);
      const ratio = e1.map((v, i) => v !== undefined && e2[i] !== undefined && (e2[i] as number) !== 0
        ? (v as number) / (e2[i] as number) : 0);
      const out: { mass: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < sumLen - 1) { out.push({ mass: undefined as unknown as number }); continue; }
        let s = 0;
        for (let j = i - sumLen + 1; j <= i; j++) s += ratio[j];
        out.push({ mass: s });
      }
      return out;
    },
  },
  {
    name: 'KST', shortName: 'KST', paneType: 'sub', calcParams: [10, 15, 20, 30, 10, 10, 10, 15, 9],
    figures: [
      { key: 'kst', title: 'KST: ', type: 'line' },
      { key: 'sig', title: 'Signal: ', type: 'line' },
    ],
    calc: (data, p) => {
      const closes = data.map(d => d.close);
      const roc = (n: number) => closes.map((c, i) => i < n ? 0 : ((c - closes[i - n]) / closes[i - n]) * 100);
      const r1 = sma(roc(p[0]), p[4]);
      const r2 = sma(roc(p[1]), p[5]);
      const r3 = sma(roc(p[2]), p[6]);
      const r4 = sma(roc(p[3]), p[7]);
      const kst = closes.map((_, i) => (r1[i] ?? 0) + 2 * (r2[i] ?? 0) + 3 * (r3[i] ?? 0) + 4 * (r4[i] ?? 0));
      const sig = sma(kst, p[8]);
      return data.map((_, i) => ({ kst: kst[i], sig: sig[i] as number }));
    },
  },
  {
    name: 'COPPOCK', shortName: 'Coppock', paneType: 'sub', calcParams: [14, 11, 10],
    figures: [{ key: 'cop', title: 'Coppock: ', type: 'line' }],
    calc: (data, [longRoc, shortRoc, wmaLen]) => {
      const closes = data.map(d => d.close);
      const roc = (n: number) => closes.map((c, i) => i < n ? 0 : ((c - closes[i - n]) / closes[i - n]) * 100);
      const sumRoc = roc(longRoc).map((v, i) => v + roc(shortRoc)[i]);
      // WMA
      const denom = (wmaLen * (wmaLen + 1)) / 2;
      const out: number[] = new Array(closes.length).fill(NaN);
      for (let i = wmaLen - 1; i < sumRoc.length; i++) {
        let s = 0;
        for (let j = 0; j < wmaLen; j++) s += sumRoc[i - j] * (wmaLen - j);
        out[i] = s / denom;
      }
      return data.map((_, i) => ({ cop: isNaN(out[i]) ? (undefined as unknown as number) : out[i] }));
    },
  },
  {
    name: 'PPO', shortName: 'PPO', paneType: 'sub', calcParams: [12, 26, 9],
    figures: [
      { key: 'ppo', title: 'PPO: ', type: 'line' },
      { key: 'sig', title: 'Signal: ', type: 'line' },
      { key: 'hist', title: 'Hist: ', type: 'bar' },
    ],
    calc: (data, [fast, slow, sig]) => {
      const closes = data.map(d => d.close);
      const ef = ema(closes, fast); const es = ema(closes, slow);
      const ppo = closes.map((_, i) => ef[i] !== undefined && es[i] !== undefined && (es[i] as number) !== 0
        ? (((ef[i] as number) - (es[i] as number)) / (es[i] as number)) * 100 : 0);
      const sigLine = ema(ppo, sig);
      return data.map((_, i) => ({
        ppo: ppo[i], sig: sigLine[i] as number,
        hist: ppo[i] - (sigLine[i] ?? 0),
      }));
    },
  },
  {
    name: 'PVO', shortName: 'PVO', paneType: 'sub', calcParams: [12, 26, 9],
    figures: [
      { key: 'pvo', title: 'PVO: ', type: 'line' },
      { key: 'sig', title: 'Signal: ', type: 'line' },
      { key: 'hist', title: 'Hist: ', type: 'bar' },
    ],
    calc: (data, [fast, slow, sig]) => {
      const vols = data.map(d => d.volume ?? 0);
      const ef = ema(vols, fast); const es = ema(vols, slow);
      const pvo = vols.map((_, i) => ef[i] !== undefined && es[i] !== undefined && (es[i] as number) !== 0
        ? (((ef[i] as number) - (es[i] as number)) / (es[i] as number)) * 100 : 0);
      const sigLine = ema(pvo, sig);
      return data.map((_, i) => ({
        pvo: pvo[i], sig: sigLine[i] as number,
        hist: pvo[i] - (sigLine[i] ?? 0),
      }));
    },
  },
  {
    name: 'DPO', shortName: 'DPO', paneType: 'sub', calcParams: [21],
    figures: [{ key: 'dpo', title: 'DPO: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      const m = sma(closes, n);
      const shift = Math.floor(n / 2) + 1;
      return data.map((_, i) => {
        const idx = i - shift;
        if (idx < 0 || m[idx] === undefined) return { dpo: undefined as unknown as number };
        return { dpo: closes[i] - (m[idx] as number) };
      });
    },
  },
  {
    name: 'NETVOL', shortName: 'Net Vol', paneType: 'sub', calcParams: [],
    figures: [{ key: 'nv', title: 'Net: ', type: 'bar' }],
    calc: (data) => data.map(d => ({ nv: (d.close >= d.open ? 1 : -1) * (d.volume ?? 0) })),
  },
  {
    name: 'CVI', shortName: 'CVI', paneType: 'sub', calcParams: [],
    figures: [{ key: 'cvi', title: 'CVI: ', type: 'line' }],
    calc: (data) => {
      let cum = 0;
      return data.map(d => { cum += (d.volume ?? 0); return { cvi: cum }; });
    },
  },
  {
    name: 'NVI', shortName: 'NVI', paneType: 'sub', calcParams: [],
    figures: [{ key: 'nvi', title: 'NVI: ', type: 'line' }],
    calc: (data) => {
      let nvi = 1000;
      const out: { nvi: number }[] = [{ nvi }];
      for (let i = 1; i < data.length; i++) {
        if ((data[i].volume ?? 0) < (data[i - 1].volume ?? 0)) {
          nvi = nvi * (1 + (data[i].close - data[i - 1].close) / data[i - 1].close);
        }
        out.push({ nvi });
      }
      return out;
    },
  },
  {
    name: 'PVI', shortName: 'PVI', paneType: 'sub', calcParams: [],
    figures: [{ key: 'pvi', title: 'PVI: ', type: 'line' }],
    calc: (data) => {
      let pvi = 1000;
      const out: { pvi: number }[] = [{ pvi }];
      for (let i = 1; i < data.length; i++) {
        if ((data[i].volume ?? 0) > (data[i - 1].volume ?? 0)) {
          pvi = pvi * (1 + (data[i].close - data[i - 1].close) / data[i - 1].close);
        }
        out.push({ pvi });
      }
      return out;
    },
  },
  {
    name: 'LINREG', shortName: 'LinReg', paneType: 'main', calcParams: [20],
    figures: [{ key: 'lr', title: 'LR: ', type: 'line' }],
    calc: (data, [n]) => {
      const closes = data.map(d => d.close);
      return closes.map((_, i) => {
        if (i < n - 1) return { lr: undefined as unknown as number };
        let sx = 0, sy = 0, sxy = 0, sxx = 0;
        for (let j = 0; j < n; j++) {
          const x = j; const y = closes[i - n + 1 + j];
          sx += x; sy += y; sxy += x * y; sxx += x * x;
        }
        const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
        const intercept = (sy - slope * sx) / n;
        return { lr: slope * (n - 1) + intercept };
      });
    },
  },
  {
    name: 'PIVOTS', shortName: 'Pivots', paneType: 'main', calcParams: [],
    figures: [
      { key: 'p', title: 'P: ', type: 'line' },
      { key: 'r1', title: 'R1: ', type: 'line' },
      { key: 's1', title: 'S1: ', type: 'line' },
      { key: 'r2', title: 'R2: ', type: 'line' },
      { key: 's2', title: 'S2: ', type: 'line' },
    ],
    calc: (data) => data.map((_, i) => {
      if (i === 0) return { p: undefined, r1: undefined, s1: undefined, r2: undefined, s2: undefined } as never;
      const p = data[i - 1];
      const piv = (p.high + p.low + p.close) / 3;
      return {
        p: piv,
        r1: 2 * piv - p.low,
        s1: 2 * piv - p.high,
        r2: piv + (p.high - p.low),
        s2: piv - (p.high - p.low),
      };
    }),
  },
  {
    name: 'ZIGZAG', shortName: 'ZigZag', paneType: 'main', calcParams: [5],
    figures: [{ key: 'zz', title: 'ZZ: ', type: 'line' }],
    calc: (data, [pct]) => {
      const out: { zz: number }[] = data.map(() => ({ zz: undefined as unknown as number }));
      if (data.length === 0) return out;
      const threshold = pct / 100;
      let lastPivotIdx = 0; let lastPivotPrice = data[0].close; let dir: 0 | 1 | -1 = 0;
      out[0] = { zz: data[0].close };
      for (let i = 1; i < data.length; i++) {
        const c = data[i].close;
        const change = (c - lastPivotPrice) / lastPivotPrice;
        if (dir === 0) {
          if (Math.abs(change) >= threshold) {
            dir = change > 0 ? 1 : -1;
            lastPivotIdx = i; lastPivotPrice = c;
            out[i] = { zz: c };
          }
        } else if (dir === 1) {
          if (c > lastPivotPrice) { lastPivotIdx = i; lastPivotPrice = c; out[lastPivotIdx] = { zz: c }; }
          else if ((lastPivotPrice - c) / lastPivotPrice >= threshold) {
            dir = -1; lastPivotIdx = i; lastPivotPrice = c; out[i] = { zz: c };
          }
        } else {
          if (c < lastPivotPrice) { lastPivotIdx = i; lastPivotPrice = c; out[lastPivotIdx] = { zz: c }; }
          else if ((c - lastPivotPrice) / lastPivotPrice >= threshold) {
            dir = 1; lastPivotIdx = i; lastPivotPrice = c; out[i] = { zz: c };
          }
        }
      }
      return out;
    },
  },
];

let registered = false;

export function registerCustomIndicators() {
  if (registered) return;
  for (const ind of INDICATORS) {
    try {
      registerIndicator({
        name: ind.name,
        shortName: ind.shortName,
        calcParams: ind.calcParams,
        figures: ind.figures.map(f => ({
          key: f.key,
          title: f.title,
          type: f.type,
        })),
        calc: (dataList: KLineData[], indicator: { calcParams: number[] }) =>
          ind.calc(dataList, indicator.calcParams ?? ind.calcParams),
      });
    } catch (e) {
      console.warn(`[indicators] Failed to register ${ind.name}:`, e);
    }
  }
  registered = true;
}

// Indicator metadata for the UI menu
export const CUSTOM_INDICATOR_META = INDICATORS.map(i => ({
  id: i.name,
  label: i.shortName,
  paneType: i.paneType,
}));
