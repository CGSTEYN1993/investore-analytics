/**
 * Subscription Tier Feature Access Configuration
 * 
 * Defines which features are available to each subscription tier
 */

export type SubscriptionTier = 'free' | 'analyst' | 'enterprise';

export interface FeatureAccess {
  name: string;
  description: string;
  free: boolean | number;
  analyst: boolean | number;
  enterprise: boolean | number;
}

// Feature access definitions
export const FEATURE_ACCESS: Record<string, FeatureAccess> = {
  // Analysis Features
  commodity_analysis: {
    name: 'Commodity Analysis',
    description: 'Analyze mining companies by commodity',
    free: true,    // Limited to 3 commodities
    analyst: true,
    enterprise: true,
  },
  exchange_analysis: {
    name: 'Exchange Analysis',
    description: 'View mining companies by stock exchange',
    free: true,    // Limited view
    analyst: true,
    enterprise: true,
  },
  country_analysis: {
    name: 'Country/Region Analysis',
    description: 'Mining companies by country/state',
    free: true,    // Top 5 countries only
    analyst: true,
    enterprise: true,
  },
  interactive_map: {
    name: 'Interactive Map',
    description: 'Interactive map to explore mining projects',
    free: false,
    analyst: true,
    enterprise: true,
  },
  
  // Company Data
  company_profiles: {
    name: 'Company Profiles',
    description: 'Detailed company information',
    free: 5,       // 5 profiles per day
    analyst: 50,   // 50 per day
    enterprise: true, // Unlimited
  },
  announcements: {
    name: 'Company Announcements',
    description: 'Latest company announcements',
    free: 10,      // Last 10 announcements
    analyst: 100,  // Last 100
    enterprise: true, // Full history
  },
  drilling_data: {
    name: 'Drilling Campaigns',
    description: 'Drilling program status and results',
    free: false,
    analyst: true,
    enterprise: true,
  },
  assay_results: {
    name: 'Assay Results',
    description: 'Detailed assay results and intervals',
    free: false,
    analyst: true,
    enterprise: true,
  },
  
  // Project Stage Filtering
  stage_filter: {
    name: 'Project Stage Filter',
    description: 'Filter by exploration/feasibility/operational',
    free: true,    // Basic stages only
    analyst: true,
    enterprise: true,
  },
  study_data: {
    name: 'Engineering Studies',
    description: 'PEA, PFS, FS study details',
    free: false,
    analyst: true,
    enterprise: true,
  },
  operational_data: {
    name: 'Operational Metrics',
    description: 'Production, costs, guidance',
    free: false,
    analyst: true,
    enterprise: true,
  },
  
  // Market Data
  share_price: {
    name: 'Share Price',
    description: 'Current and historical prices',
    free: true,    // Delayed 15 min
    analyst: true, // Real-time
    enterprise: true,
  },
  market_cap: {
    name: 'Market Cap',
    description: 'Market capitalization data',
    free: true,
    analyst: true,
    enterprise: true,
  },
  trading_volume: {
    name: 'Trading Volume',
    description: 'Volume and liquidity metrics',
    free: false,
    analyst: true,
    enterprise: true,
  },
  dividend_data: {
    name: 'Dividend Data',
    description: 'Dividend history and yields',
    free: false,
    analyst: true,
    enterprise: true,
  },
  shares_outstanding: {
    name: 'Shares Outstanding',
    description: 'Share structure details',
    free: true,
    analyst: true,
    enterprise: true,
  },
  
  // Advanced Features
  peer_comparison: {
    name: 'Peer Comparison',
    description: 'Compare companies side by side',
    free: 2,       // Compare 2 companies
    analyst: 10,   // Up to 10
    enterprise: true, // Unlimited
  },
  custom_graphs: {
    name: 'Custom Graphs',
    description: 'Create custom visualizations',
    free: false,
    analyst: true,
    enterprise: true,
  },
  export_data: {
    name: 'Export Data',
    description: 'Export to CSV/Excel',
    free: false,
    analyst: true,
    enterprise: true,
  },
  api_access: {
    name: 'API Access',
    description: 'Programmatic data access',
    free: false,
    analyst: false,
    enterprise: true,
  },
  
  // Geology & Technical
  geology_data: {
    name: 'Geology Data',
    description: 'Deposit type, mineralization',
    free: false,
    analyst: true,
    enterprise: true,
  },
  orebody_graphics: {
    name: 'Orebody Graphics',
    description: '3D orebody visualizations',
    free: false,
    analyst: false,
    enterprise: true,
  },
  tenement_data: {
    name: 'Tenement Data',
    description: 'Land package details',
    free: false,
    analyst: true,
    enterprise: true,
  },
  infrastructure: {
    name: 'Infrastructure',
    description: 'Distance to ports, rails, etc.',
    free: false,
    analyst: true,
    enterprise: true,
  },
  neighboring_companies: {
    name: 'Neighboring Companies',
    description: 'Nearby projects and companies',
    free: false,
    analyst: true,
    enterprise: true,
  },
  
  // User Features
  watchlist: {
    name: 'Watchlists',
    description: 'Create and manage watchlists',
    free: 1,       // 1 watchlist, 10 companies
    analyst: 5,    // 5 watchlists, 50 each
    enterprise: true, // Unlimited
  },
  portfolio: {
    name: 'Portfolio Tracking',
    description: 'Track holdings and performance',
    free: false,
    analyst: true,
    enterprise: true,
  },
  alerts: {
    name: 'Price Alerts',
    description: 'Custom price and news alerts',
    free: 3,       // 3 alerts
    analyst: 25,   // 25 alerts
    enterprise: true, // Unlimited
  },
  saved_searches: {
    name: 'Saved Searches',
    description: 'Save filter configurations',
    free: 1,
    analyst: 10,
    enterprise: true,
  },
  
  // AI Features
  ai_analysis: {
    name: 'AI Analysis',
    description: 'AI-powered insights',
    free: false,
    analyst: true,
    enterprise: true,
  },
  ai_chat: {
    name: 'AI Mining Analyst',
    description: 'Natural language queries',
    free: 5,       // 5 queries/day
    analyst: 50,   // 50/day
    enterprise: true, // Unlimited
  },
};

// Helper function to check feature access
export function hasFeatureAccess(
  feature: string,
  tier: SubscriptionTier
): boolean | number {
  const access = FEATURE_ACCESS[feature];
  if (!access) return false;
  return access[tier];
}

// Check if feature is available (boolean check)
export function canAccessFeature(
  feature: string,
  tier: SubscriptionTier
): boolean {
  const access = hasFeatureAccess(feature, tier);
  return access === true || (typeof access === 'number' && access > 0);
}

// Get feature limit for tier
export function getFeatureLimit(
  feature: string,
  tier: SubscriptionTier
): number | null {
  const access = hasFeatureAccess(feature, tier);
  if (access === true) return null; // Unlimited
  if (typeof access === 'number') return access;
  return 0;
}

// Tier display names
export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  analyst: 'Analyst',
  enterprise: 'Enterprise',
};

// Tier colors for UI
export const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'text-metallic-400',
  analyst: 'text-primary-400',
  enterprise: 'text-amber-400',
};

// Commodity color mapping for graphs
export const COMMODITY_COLORS: Record<string, string> = {
  Au: '#FFD700',  // Gold
  Ag: '#C0C0C0',  // Silver
  Cu: '#B87333',  // Copper
  Pt: '#E5E4E2',  // Platinum
  Pd: '#CED0DD',  // Palladium
  Li: '#00CED1',  // Lithium (electric blue)
  Co: '#0047AB',  // Cobalt (blue)
  Ni: '#727472',  // Nickel
  Zn: '#7D7F7D',  // Zinc
  Pb: '#465362',  // Lead
  Fe: '#8B4513',  // Iron
  U: '#32CD32',   // Uranium (green glow)
  REE: '#9B59B6', // Rare Earths (purple)
  Mn: '#A0522D',  // Manganese
  Sn: '#D3D3D3',  // Tin
  W: '#4A4A4A',   // Tungsten
  Mo: '#808080',  // Molybdenum
  V: '#20B2AA',   // Vanadium
  Cr: '#708090',  // Chromium
  Ti: '#B0C4DE',  // Titanium
  Graphite: '#1C1C1C', // Graphite
  Diamond: '#B9F2FF', // Diamond
  Coal: '#2F2F2F', // Coal
  PGM: '#E5E4E2', // PGM basket
};

// Get commodity color with fallback
export function getCommodityColor(symbol: string): string {
  return COMMODITY_COLORS[symbol] || '#6B7280';
}
