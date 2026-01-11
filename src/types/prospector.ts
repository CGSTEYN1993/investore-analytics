/**
 * InvestOre Analytics - Prospector-Style TypeScript Types
 * 
 * Based on Prospector Portal's comprehensive mining data model:
 * - Life of Mine (Mining, Processing, Capex, Cash Flow)
 * - Production & Sales Data
 * - Financial Statements
 * - People/Management Data
 * - Drilling Highlight Intercepts
 * - Royalties & Ownership
 * - Filing Documents
 */

// =============================================================================
// Enums
// =============================================================================

export type ReportingStandard = 'ni_43_101' | 'jorc' | 'sk_1300' | 'samrec' | 'cim';

export type MiningMethodDetail =
  | 'open_pit'
  | 'underground_longwall'
  | 'underground_room_pillar'
  | 'underground_cut_fill'
  | 'underground_sublevel_stoping'
  | 'underground_block_caving'
  | 'in_situ_leaching'
  | 'heap_leach'
  | 'dredging'
  | 'placer'
  | 'brine_extraction'
  | 'combined';

export type ProcessingMethodDetail =
  | 'cil'
  | 'cip'
  | 'flotation'
  | 'gravity'
  | 'heap_leach'
  | 'acid_leach'
  | 'solvent_extraction'
  | 'electrowinning'
  | 'smelting'
  | 'roasting'
  | 'bioleaching'
  | 'magnetic_separation'
  | 'dms'
  | 'direct_shipping_ore'
  | 'combined';

export type FilingCategory =
  | 'company'
  | 'project'
  | 'merger_acquisition'
  | 'earnings'
  | 'esg'
  | 'hot_news'
  | 'debt_equity_financing'
  | 'management_changes'
  | 'ipo'
  | 'ownership_changes'
  | 'technical_report'
  | 'drilling_results'
  | 'mineral_resource_update'
  | 'annual_update'
  | 'quarterly_update'
  | 'production_report'
  | 'guidance'
  | 'permitting';

export type FinancialPeriodType = 'annual' | 'semi_annual' | 'quarterly' | 'ytd' | 'ltm';

export type CostBasis = 'co_product' | 'by_product';

// =============================================================================
// Life of Mine Types
// =============================================================================

export interface LoMMiningScheduleItem {
  year: number;
  ore_mt?: number;
  waste_mt?: number;
  grade?: number;
  grade_unit?: string;
  strip_ratio?: number;
}

export interface LoMMining {
  id: number;
  project_id: number;
  study_id?: number;
  report_date: string;
  report_title?: string;
  report_url?: string;
  reporting_standard?: ReportingStandard;
  mine_life_years?: number;
  mining_method?: MiningMethodDetail;
  mining_methods_json?: string[];
  mining_rate_mtpa?: number;
  daily_mining_rate_tonnes?: number;
  total_mined_ore_mt?: number;
  total_mined_waste_mt?: number;
  strip_ratio?: number;
  mining_dilution_pct?: number;
  mining_recovery_pct?: number;
  avg_mined_grade?: number;
  grade_unit?: string;
  annual_schedule_json?: LoMMiningScheduleItem[];
  created_at: string;
  updated_at: string;
}

export interface LoMProcessing {
  id: number;
  project_id: number;
  study_id?: number;
  report_date: string;
  report_title?: string;
  processing_method?: ProcessingMethodDetail;
  processing_methods_json?: string[];
  processed_ore_mt?: number;
  throughput_rate_mtpa?: number;
  daily_throughput_tonnes?: number;
  avg_processed_grade?: number;
  grade_unit?: string;
  recoveries_json?: Record<string, number>;
  payabilities_json?: Record<string, number>;
  total_contained_metal_json?: Record<string, number>;
  total_production_json?: Record<string, number>;
  annual_schedule_json?: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

export interface LoMCapex {
  id: number;
  project_id: number;
  study_id?: number;
  report_date: string;
  currency: string;
  initial_capex?: number;
  mining_capex?: number;
  processing_capex?: number;
  infrastructure_capex?: number;
  owners_costs?: number;
  contingency?: number;
  sustaining_capex?: number;
  expansion_capex?: number;
  exploration_capex?: number;
  reclamation_closure_capex?: number;
  total_capex?: number;
  capex_breakdown_json?: Record<string, number>;
  annual_capex_json?: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

export interface LoMCashFlow {
  id: number;
  project_id: number;
  study_id?: number;
  report_date: string;
  currency: string;
  primary_commodity?: string;
  opex_mining_per_t?: number;
  opex_processing_per_t?: number;
  opex_ga_per_t?: number;
  opex_treatment_refining_per_t?: number;
  opex_byproduct_credit_per_t?: number;
  opex_freight_per_t?: number;
  opex_royalties_per_t?: number;
  opex_total_per_t?: number;
  cash_cost_operating?: number;
  cash_cost_total?: number;
  cost_unit: string;
  aisc?: number;
  aic?: number;
  npv?: number;
  npv_discount_rate_pct?: number;
  irr_pct?: number;
  payback_years?: number;
  npv_sensitivities_json?: Record<string, number>;
  price_assumptions_json?: Record<string, number>;
  annual_cashflow_json?: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

export interface LifeOfMineSummary {
  project_id: number;
  project_name: string;
  company_ticker: string;
  latest_report_date?: string;
  reporting_standard?: string;
  mine_life_years?: number;
  mining_method?: string;
  strip_ratio?: number;
  total_ore_mt?: number;
  avg_mined_grade?: number;
  grade_unit?: string;
  processing_method?: string;
  throughput_mtpa?: number;
  recovery_pct?: number;
  total_production_json?: Record<string, number>;
  initial_capex?: number;
  total_capex?: number;
  aisc?: number;
  npv?: number;
  irr_pct?: number;
  payback_years?: number;
  currency: string;
}

// =============================================================================
// Production Types
// =============================================================================

export interface ProductionData {
  id: number;
  company_id: number;
  project_id?: number;
  period_type: FinancialPeriodType;
  period_year: number;
  period_quarter?: number;
  period_half?: number;
  commodity: string;
  production_amount?: number;
  production_unit?: string;
  sales_amount?: number;
  sales_unit?: string;
  avg_realized_price?: number;
  price_currency: string;
  cash_cost?: number;
  cash_cost_basis?: CostBasis;
  aisc?: number;
  aisc_basis?: CostBasis;
  aic?: number;
  aic_basis?: CostBasis;
  equivalent_production?: number;
  equivalent_commodity?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionSummary {
  company_id: number;
  ticker: string;
  company_name: string;
  period_year: number;
  commodities: string[];
  total_production: Record<string, {
    production?: number;
    unit?: string;
    aisc?: number;
    cash_cost?: number;
  }>;
  guidance?: Record<string, {
    year?: number;
    production_low?: number;
    production_high?: number;
    unit?: string;
    aisc_low?: number;
    aisc_high?: number;
  }>;
}

export interface ProductionGuidance {
  id: number;
  company_id: number;
  guidance_year: number;
  is_multi_year: boolean;
  guidance_end_year?: number;
  commodity: string;
  production_low?: number;
  production_high?: number;
  production_mid?: number;
  production_unit?: string;
  aisc_low?: number;
  aisc_high?: number;
  cost_currency: string;
  capex_guidance?: number;
  guidance_date: string;
  source_url?: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Financial Statement Types
// =============================================================================

export interface BalanceSheet {
  id: number;
  company_id: number;
  period_type: FinancialPeriodType;
  period_end_date: string;
  period_year: number;
  period_quarter?: number;
  currency: string;
  // Assets
  cash_and_equivalents?: number;
  short_term_investments?: number;
  accounts_receivable?: number;
  inventory?: number;
  other_current_assets?: number;
  total_current_assets?: number;
  property_plant_equipment?: number;
  mineral_properties?: number;
  intangible_assets?: number;
  deferred_tax_assets?: number;
  other_non_current_assets?: number;
  total_non_current_assets?: number;
  total_assets?: number;
  // Liabilities
  accounts_payable?: number;
  short_term_debt?: number;
  current_portion_long_term_debt?: number;
  accrued_liabilities?: number;
  other_current_liabilities?: number;
  total_current_liabilities?: number;
  long_term_debt?: number;
  deferred_tax_liabilities?: number;
  reclamation_obligations?: number;
  other_non_current_liabilities?: number;
  total_non_current_liabilities?: number;
  total_liabilities?: number;
  // Equity
  share_capital?: number;
  retained_earnings?: number;
  accumulated_oci?: number;
  non_controlling_interest?: number;
  total_equity?: number;
  // Shares
  shares_outstanding?: number;
  shares_fully_diluted?: number;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeStatement {
  id: number;
  company_id: number;
  period_type: FinancialPeriodType;
  period_start_date?: string;
  period_end_date: string;
  period_year: number;
  period_quarter?: number;
  currency: string;
  // Revenue
  revenue?: number;
  revenue_gold?: number;
  revenue_silver?: number;
  revenue_copper?: number;
  revenue_other?: number;
  // Costs
  cost_of_sales?: number;
  gross_profit?: number;
  // Operating Expenses
  exploration_expense?: number;
  general_administrative?: number;
  depreciation_depletion?: number;
  impairment?: number;
  other_operating_expense?: number;
  total_operating_expense?: number;
  operating_income?: number;
  // Other
  interest_income?: number;
  interest_expense?: number;
  foreign_exchange?: number;
  derivative_gains_losses?: number;
  other_income_expense?: number;
  // Taxes & Net Income
  income_before_tax?: number;
  income_tax_expense?: number;
  net_income?: number;
  net_income_attributable?: number;
  // EPS
  eps_basic?: number;
  eps_diluted?: number;
  ebitda?: number;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowStatement {
  id: number;
  company_id: number;
  period_type: FinancialPeriodType;
  period_end_date: string;
  period_year: number;
  period_quarter?: number;
  currency: string;
  // Operating Activities
  net_income?: number;
  depreciation_amortization?: number;
  stock_based_compensation?: number;
  deferred_taxes?: number;
  working_capital_changes?: number;
  other_operating?: number;
  cash_from_operations?: number;
  // Investing Activities
  capital_expenditure?: number;
  mineral_property_costs?: number;
  acquisitions?: number;
  asset_sales?: number;
  investments?: number;
  other_investing?: number;
  cash_from_investing?: number;
  // Financing Activities
  debt_proceeds?: number;
  debt_repayments?: number;
  equity_issued?: number;
  dividends_paid?: number;
  share_repurchases?: number;
  other_financing?: number;
  cash_from_financing?: number;
  // Net Change
  fx_effect?: number;
  net_change_in_cash?: number;
  cash_beginning?: number;
  cash_ending?: number;
  free_cash_flow?: number;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyFinancialSummary {
  company_id: number;
  ticker: string;
  company_name: string;
  currency: string;
  as_of_date: string;
  market_cap?: number;
  enterprise_value?: number;
  cash_position?: number;
  total_debt?: number;
  net_debt?: number;
  ttm_revenue?: number;
  ttm_net_income?: number;
  ttm_ebitda?: number;
  ttm_free_cash_flow?: number;
  pe_ratio?: number;
  ev_ebitda?: number;
  current_ratio?: number;
  debt_equity?: number;
  book_value_per_share?: number;
  shares_outstanding?: number;
}

// =============================================================================
// People/Management Types
// =============================================================================

export interface EducationItem {
  degree: string;
  institution: string;
  year?: number;
}

export interface CompanyPerson {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  gender?: string;
  birth_year?: number;
  nationality?: string;
  biography?: string;
  photo_url?: string;
  linkedin_url?: string;
  education_json?: EducationItem[];
  qualifications?: string[];
  created_at: string;
  updated_at: string;
}

export interface PersonPosition {
  id: number;
  person_id: number;
  company_id: number;
  title: string;
  position_type?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  base_salary?: number;
  total_compensation?: number;
  salary_currency: string;
  compensation_year?: number;
  shares_owned?: number;
  options_owned?: number;
  created_at: string;
  updated_at: string;
}

export interface ManagementTeamMember {
  person_id: number;
  full_name: string;
  title: string;
  biography?: string;
  photo_url?: string;
  qualifications?: string[];
  tenure_years?: number;
  shares_owned?: number;
}

export interface CompanyManagementTeam {
  company_id: number;
  ticker: string;
  company_name: string;
  executives: ManagementTeamMember[];
  directors: ManagementTeamMember[];
}

// =============================================================================
// Drilling Types
// =============================================================================

export interface DrillHighlightIntercept {
  id: number;
  company_id: number;
  project_id?: number;
  announcement_date: string;
  announcement_title?: string;
  announcement_url?: string;
  hole_id: string;
  hole_type?: string;
  from_m: number;
  to_m: number;
  interval_m: number;
  commodity: string;
  grade: number;
  grade_unit: string;
  additional_grades_json?: Record<string, number>;
  true_width_m?: number;
  deposit_name?: string;
  zone_name?: string;
  is_highlight: boolean;
  created_at: string;
}

export interface DrillingSummary {
  company_id: number;
  project_id?: number;
  ticker: string;
  project_name?: string;
  total_holes: number;
  total_meters: number;
  best_intercepts: DrillHighlightIntercept[];
  recent_intercepts: DrillHighlightIntercept[];
}

// =============================================================================
// Royalty Types
// =============================================================================

export interface ProjectRoyalty {
  id: number;
  project_id: number;
  royalty_holder: string;
  royalty_holder_ticker?: string;
  royalty_type: string;
  royalty_rate_pct?: number;
  royalty_rate_description?: string;
  commodities?: string[];
  is_capped: boolean;
  cap_amount?: number;
  cap_currency?: string;
  is_buyback_available: boolean;
  buyback_price?: number;
  buyback_currency?: string;
  is_active: boolean;
  effective_date?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Ownership Types
// =============================================================================

export interface OwnershipRecord {
  id: number;
  company_id: number;
  record_date: string;
  shareholder_name: string;
  shareholder_type?: string;
  shares_held: number;
  percentage_held?: number;
  change_shares?: number;
  change_percentage?: number;
  position_value?: number;
  position_currency: string;
  source_url?: string;
  created_at: string;
}

export interface OwnershipSummary {
  company_id: number;
  ticker: string;
  company_name: string;
  as_of_date: string;
  top_shareholders: OwnershipRecord[];
  institutional_ownership_pct?: number;
  insider_ownership_pct?: number;
  retail_ownership_pct?: number;
}

// =============================================================================
// Filing Types
// =============================================================================

export interface FilingDocument {
  id: number;
  company_id: number;
  project_id?: number;
  document_key: string;
  exchange: string;
  filing_date: string;
  title: string;
  primary_category: FilingCategory;
  secondary_categories?: string[];
  summary?: string;
  pdf_url?: string;
  html_url?: string;
  ai_summary_json?: {
    key_highlights?: string[];
    sentiment?: string;
    entities?: Record<string, string[]>;
  };
  extracted_data_json?: Record<string, any>;
  is_processed: boolean;
  processed_at?: string;
  created_at: string;
}

export interface FilingSearchRequest {
  company_ids?: number[];
  tickers?: string[];
  exchanges?: string[];
  categories?: FilingCategory[];
  start_date?: string;
  end_date?: string;
  search_text?: string;
  limit?: number;
  offset?: number;
}

export interface FilingSearchResponse {
  total: number;
  limit: number;
  offset: number;
  filings: FilingDocument[];
}

// =============================================================================
// Stock Performance Types
// =============================================================================

export interface StockPrice {
  id: number;
  company_id: number;
  price_date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
  currency: string;
  adj_close?: number;
  change_1d_pct?: number;
  change_5d_pct?: number;
  change_1m_pct?: number;
  change_3m_pct?: number;
  change_1y_pct?: number;
  market_cap?: number;
}

export interface StockPerformanceSummary {
  company_id: number;
  ticker: string;
  company_name: string;
  currency: string;
  current_price: number;
  change_1d_pct?: number;
  change_5d_pct?: number;
  change_10d_pct?: number;
  change_1m_pct?: number;
  change_3m_pct?: number;
  change_1y_pct?: number;
  high_52w?: number;
  low_52w?: number;
  volume_avg_30d?: number;
  market_cap?: number;
}

// =============================================================================
// Project Startup Types
// =============================================================================

export interface ProjectStartupDate {
  id: number;
  project_id: number;
  milestone_type: string;
  projected_date?: string;
  projected_quarter?: string;
  projected_year?: number;
  confidence_level?: string;
  announcement_date?: string;
  source_url?: string;
  is_current_estimate: boolean;
  was_achieved?: boolean;
  actual_date?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Comprehensive Company Profile
// =============================================================================

export interface CompanyProfileFull {
  id: number;
  ticker: string;
  exchange: string;
  name: string;
  country?: string;
  primary_commodity?: string;
  website?: string;
  current_price?: number;
  market_cap?: number;
  enterprise_value?: number;
  shares_outstanding?: number;
  currency: string;
  cash_position?: number;
  total_debt?: number;
  ttm_revenue?: number;
  ttm_ebitda?: number;
  latest_production?: Record<string, {
    production?: number;
    unit?: string;
    aisc?: number;
  }>;
  production_guidance?: Record<string, {
    production_low?: number;
    production_high?: number;
    unit?: string;
  }>;
  num_projects: number;
  total_resources?: Record<string, any>;
  ceo?: string;
  management_team_count: number;
  latest_filings: FilingDocument[];
  performance?: StockPerformanceSummary;
  updated_at: string;
}

// =============================================================================
// API Response Wrapper
// =============================================================================

export interface ProspectorApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
