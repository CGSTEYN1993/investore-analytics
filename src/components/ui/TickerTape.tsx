'use client';

import React from 'react';

const TickerTape = () => {
  const items = [
    { symbol: 'GOLD', price: '2,045.30', change: '+0.45%', up: true },
    { symbol: 'SILVER', price: '24.12', change: '-0.12%', up: false },
    { symbol: 'COPPER', price: '3.85', change: '+1.20%', up: true },
    { symbol: 'LITHIUM', price: '13,250', change: '-2.50%', up: false },
    { symbol: 'PLATINUM', price: '980.50', change: '+0.15%', up: true },
    { symbol: 'PALLADIUM', price: '1,105.00', change: '-1.10%', up: false },
    { symbol: 'URANIUM', price: '92.50', change: '+3.40%', up: true },
    { symbol: 'NICKEL', price: '16,400', change: '-0.80%', up: false },
  ];

  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-metallic-950 border-b border-metallic-800/50 overflow-hidden h-8 flex items-center">
      <div className="animate-ticker flex whitespace-nowrap">
        {tickerItems.map((item, index) => (
          <div key={index} className="inline-flex items-center mx-5 text-xs font-mono">
            <span className="text-metallic-500 font-semibold mr-1.5">{item.symbol}</span>
            <span className="text-metallic-300 mr-1.5">${item.price}</span>
            <span className={`${item.up ? 'text-emerald-500' : 'text-red-400'}`}>
              {item.up ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          animation: ticker 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TickerTape;
