'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Hammer, 
  DollarSign, 
  MapPin,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';
import miningDataService, { 
  CompanyMiningData,
  ResourceEstimate,
  DrillingResult,
  EconomicMetrics
} from '@/services/miningData';

interface CompanyMiningDataWidgetProps {
  symbol: string;
  className?: string;
}

export default function CompanyMiningDataWidget({ 
  symbol, 
  className = '' 
}: CompanyMiningDataWidgetProps) {
  const [data, setData] = useState<CompanyMiningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await miningDataService.getCompanyData(symbol, {
          includeDrilling: true,
          includeEconomics: true
        });
        setData(result);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('No extraction data available for this company yet');
        } else {
          setError('Failed to load mining data');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Data is extracted from ASX announcements
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Check if there's any data to display
  const hasData = (data.projects?.length ?? 0) > 0 || 
                  (data.resources?.length ?? 0) > 0 || 
                  (data.reserves?.length ?? 0) > 0 ||
                  (data.drilling?.length ?? 0) > 0 ||
                  (data.economics?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No extraction data available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Data will appear as announcements are processed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Extracted Mining Data
        </CardTitle>
        <CardDescription>
          AI-extracted data from {symbol} announcements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <SummaryCard 
            icon={<MapPin className="h-4 w-4" />}
            label="Projects"
            value={data.projects?.length ?? 0}
          />
          <SummaryCard 
            icon={<Database className="h-4 w-4" />}
            label="Resources"
            value={`${(data.total_resources_mt ?? 0).toFixed(1)} Mt`}
          />
          <SummaryCard 
            icon={<Target className="h-4 w-4" />}
            label="Reserves"
            value={`${(data.total_reserves_mt ?? 0).toFixed(1)} Mt`}
          />
          <SummaryCard 
            icon={<Hammer className="h-4 w-4" />}
            label="Drill Holes"
            value={data.drilling?.length ?? 0}
          />
        </div>

        {/* Tabs for detailed data */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="drilling">Drilling</TabsTrigger>
            <TabsTrigger value="economics">Economics</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-4">
            {(data.projects?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {(data.projects ?? []).map((project) => (
                  <div 
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{project.project_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {project.current_phase && (
                          <Badge variant="outline" className="text-xs">
                            {project.current_phase}
                          </Badge>
                        )}
                        {project.study_type && (
                          <Badge variant="secondary" className="text-xs">
                            {project.study_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {project.mine_life_years && (
                        <p>{project.mine_life_years} yr mine life</p>
                      )}
                      {project.extraction_confidence > 0 && (
                        <p className="text-xs">
                          {(project.extraction_confidence * 100).toFixed(0)}% confidence
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No project data extracted" />
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-4">
            {(data.resources?.length ?? 0) > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Project</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Commodity</th>
                      <th className="text-right py-2">Tonnage</th>
                      <th className="text-right py-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.resources ?? []).slice(0, 10).map((resource) => (
                      <tr key={resource.id} className="border-b">
                        <td className="py-2">{resource.project_name || '-'}</td>
                        <td className="py-2">
                          <CategoryBadge category={resource.category} />
                        </td>
                        <td className="py-2">{resource.commodity}</td>
                        <td className="py-2 text-right">
                          {resource.tonnage_mt?.toLocaleString()} Mt
                        </td>
                        <td className="py-2 text-right">
                          {resource.grade?.toFixed(2)} {resource.grade_unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(data.resources?.length ?? 0) > 10 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing 10 of {data.resources?.length ?? 0} resource estimates
                  </p>
                )}
              </div>
            ) : (
              <EmptyState message="No resource estimates extracted" />
            )}
          </TabsContent>

          {/* Drilling Tab */}
          <TabsContent value="drilling" className="mt-4">
            {(data.drilling?.length ?? 0) > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Hole ID</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-right py-2">From</th>
                      <th className="text-right py-2">To</th>
                      <th className="text-right py-2">Interval</th>
                      <th className="text-right py-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.drilling ?? []).slice(0, 10).map((drill) => (
                      <tr key={drill.id} className="border-b">
                        <td className="py-2 font-mono text-xs">{drill.hole_id}</td>
                        <td className="py-2">{drill.drill_type || '-'}</td>
                        <td className="py-2 text-right">{drill.depth_from?.toFixed(1)}m</td>
                        <td className="py-2 text-right">{drill.depth_to?.toFixed(1)}m</td>
                        <td className="py-2 text-right font-medium">
                          {drill.interval_m?.toFixed(1)}m
                        </td>
                        <td className="py-2 text-right text-green-600 font-medium">
                          {drill.grade?.toFixed(2)} {drill.grade_unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(data.drilling?.length ?? 0) > 10 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing 10 of {data.drilling?.length ?? 0} drill results
                  </p>
                )}
              </div>
            ) : (
              <EmptyState message="No drilling results extracted" />
            )}
          </TabsContent>

          {/* Economics Tab */}
          <TabsContent value="economics" className="mt-4">
            {(data.economics?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {(data.economics ?? []).map((econ) => (
                  <div 
                    key={econ.id}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">{econ.project_name || symbol}</p>
                      {econ.study_type && (
                        <Badge variant="secondary">{econ.study_type}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">NPV</p>
                        <p className="font-semibold text-green-600">
                          ${formatLargeNumber(econ.npv_usd)}
                        </p>
                        {econ.discount_rate && (
                          <p className="text-xs text-muted-foreground">
                            @ {econ.discount_rate}% discount
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">IRR</p>
                        <p className="font-semibold">{econ.irr_percent?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payback</p>
                        <p className="font-semibold">{econ.payback_years?.toFixed(1)} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capex</p>
                        <p className="font-semibold">${formatLargeNumber(econ.capex_usd)}</p>
                      </div>
                    </div>
                    {econ.aisc_per_oz && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm">
                          <span className="text-muted-foreground">AISC:</span>{' '}
                          <span className="font-medium">${econ.aisc_per_oz.toFixed(0)}/oz</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No economic metrics extracted" />
            )}
          </TabsContent>
        </Tabs>

        {/* Data Quality Note */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Data automatically extracted from ASX announcements using AI. 
            {data.latest_announcement && (
              <span> Latest: {new Date(data.latest_announcement).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper Components
function SummaryCard({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <div className="flex justify-center mb-1 text-muted-foreground">
        {icon}
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    measured: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    indicated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    inferred: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    proved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    probable: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
      {category}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <Database className="h-6 w-6 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function formatLargeNumber(value?: number): string {
  if (!value) return '-';
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}
