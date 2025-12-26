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

  // Duplicate items to create seamless loop
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden h-10 flex items-center">
      <div className="animate-ticker flex whitespace-nowrap">
        {tickerItems.map((item, index) => (
          <div key={index} className="inline-flex items-center mx-6 text-sm font-mono">
            <span className="text-slate-400 font-bold mr-2">{item.symbol}</span>
            <span className="text-slate-200 mr-2">${item.price}</span>
            <span className={`${item.up ? 'text-green-500' : 'text-red-500'} flex items-center`}>
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
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TickerTape;
