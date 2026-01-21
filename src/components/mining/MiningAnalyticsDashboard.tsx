'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Database, 
  MapPin, 
  Hammer, 
  DollarSign,
  Activity,
  FileText,
  Target
} from 'lucide-react';
import miningDataService, { 
  ResourcesByCommodity, 
  ProjectPhases, 
  DrillingResult,
  EconomicMetrics,
  ExtractionStats 
} from '@/services/miningData';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const phaseColors: Record<string, string> = {
  exploration: '#3B82F6',
  development: '#F59E0B', 
  construction: '#8B5CF6',
  production: '#10B981',
  care_maintenance: '#6B7280',
  closure: '#EF4444'
};

export default function MiningAnalyticsDashboard() {
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [resources, setResources] = useState<ResourcesByCommodity[]>([]);
  const [phases, setPhases] = useState<ProjectPhases | null>(null);
  const [drilling, setDrilling] = useState<DrillingResult[]>([]);
  const [economics, setEconomics] = useState<EconomicMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, resourcesData, phasesData, drillingData, economicsData] = await Promise.all([
          miningDataService.getExtractionStats(),
          miningDataService.getResourcesSummary(),
          miningDataService.getProjectPhases(),
          miningDataService.getDrillingHighlights({ limit: 10 }),
          miningDataService.getEconomicsComparisons({ minNpv: 100000000 })
        ]);
        
        setStats(statsData);
        setResources(resourcesData);
        setPhases(phasesData);
        setDrilling(drillingData);
        setEconomics(economicsData);
      } catch (err) {
        setError('Failed to load mining data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Transform data for charts
  const phaseChartData = phases 
    ? Object.entries(phases).map(([phase, count]) => ({
        phase: phase.replace('_', ' ').toUpperCase(),
        count,
        fill: phaseColors[phase] || '#6B7280'
      }))
    : [];

  const resourceChartData = resources.slice(0, 8).map((r, i) => ({
    commodity: r.commodity,
    measured: r.by_category.measured_mt,
    indicated: r.by_category.indicated_mt,
    inferred: r.by_category.inferred_mt,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Documents Processed"
          value={stats?.processed_documents ?? 0}
          total={stats?.total_documents}
          icon={<FileText className="h-5 w-5" />}
          color="blue"
        />
        <StatCard 
          title="Projects Extracted"
          value={stats?.projects_extracted ?? 0}
          icon={<MapPin className="h-5 w-5" />}
          color="green"
        />
        <StatCard 
          title="Resource Estimates"
          value={stats?.resources_extracted ?? 0}
          icon={<Database className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard 
          title="Drilling Results"
          value={stats?.drilling_results ?? 0}
          icon={<Hammer className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="drilling">Drilling</TabsTrigger>
          <TabsTrigger value="economics">Economics</TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Resources by Commodity
                </CardTitle>
                <CardDescription>
                  Tonnage breakdown by resource category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="commodity" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} Mt`, '']}
                    />
                    <Legend />
                    <Bar dataKey="measured" name="Measured" fill="#10B981" stackId="a" />
                    <Bar dataKey="indicated" name="Indicated" fill="#3B82F6" stackId="a" />
                    <Bar dataKey="inferred" name="Inferred" fill="#F59E0B" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Summary</CardTitle>
                <CardDescription>Top commodities by total tonnage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.slice(0, 6).map((resource, i) => (
                    <div key={resource.commodity} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="font-medium">{resource.commodity}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {resource.by_category.total_mt.toLocaleString()} Mt
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {resource.company_count} companies
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Projects by Development Phase
                </CardTitle>
                <CardDescription>
                  Distribution of mining projects across lifecycle stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={phaseChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ phase, count }) => `${phase}: ${count}`}
                      outerRadius={100}
                      dataKey="count"
                    >
                      {phaseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phase Breakdown</CardTitle>
                <CardDescription>Project counts by development stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phaseChartData.map((phase) => (
                    <div key={phase.phase} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: phase.fill }}
                        />
                        <span className="capitalize">{phase.phase.toLowerCase()}</span>
                      </div>
                      <Badge variant="outline">{phase.count} projects</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Drilling Tab */}
        <TabsContent value="drilling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Top Drilling Intercepts
              </CardTitle>
              <CardDescription>
                Highest grade drill results from recent announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Symbol</th>
                      <th className="text-left py-2 px-3">Project</th>
                      <th className="text-left py-2 px-3">Hole ID</th>
                      <th className="text-right py-2 px-3">From (m)</th>
                      <th className="text-right py-2 px-3">To (m)</th>
                      <th className="text-right py-2 px-3">Interval</th>
                      <th className="text-right py-2 px-3">Grade</th>
                      <th className="text-left py-2 px-3">Commodity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilling.map((drill) => (
                      <tr key={drill.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{drill.symbol}</td>
                        <td className="py-2 px-3">{drill.project_name || '-'}</td>
                        <td className="py-2 px-3">{drill.hole_id}</td>
                        <td className="py-2 px-3 text-right">{drill.depth_from?.toFixed(1)}</td>
                        <td className="py-2 px-3 text-right">{drill.depth_to?.toFixed(1)}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {drill.interval_m?.toFixed(1)}m
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="font-semibold text-green-600">
                            {drill.grade?.toFixed(2)} {drill.grade_unit}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="secondary">{drill.commodity}</Badge>
                        </td>
                      </tr>
                    ))}
                    {drilling.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No drilling results available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Economics Tab */}
        <TabsContent value="economics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Project Economics Comparison
              </CardTitle>
              <CardDescription>
                NPV and IRR metrics from feasibility studies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Symbol</th>
                      <th className="text-left py-2 px-3">Project</th>
                      <th className="text-left py-2 px-3">Study Type</th>
                      <th className="text-right py-2 px-3">NPV</th>
                      <th className="text-right py-2 px-3">IRR</th>
                      <th className="text-right py-2 px-3">Payback</th>
                      <th className="text-right py-2 px-3">Capex</th>
                      <th className="text-right py-2 px-3">AISC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {economics.map((econ) => (
                      <tr key={econ.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{econ.symbol}</td>
                        <td className="py-2 px-3">{econ.project_name || '-'}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline">{econ.study_type || 'N/A'}</Badge>
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-green-600">
                          ${formatMillions(econ.npv_usd)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {econ.irr_percent?.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          {econ.payback_years?.toFixed(1)} yrs
                        </td>
                        <td className="py-2 px-3 text-right">
                          ${formatMillions(econ.capex_usd)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          ${econ.aisc_per_oz?.toFixed(0)}/oz
                        </td>
                      </tr>
                    ))}
                    {economics.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No economic studies available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  total, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  total?: number; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    yellow: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          {total && (
            <p className="text-xs text-muted-foreground">
              of {total.toLocaleString()} ({((value / total) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatMillions(value?: number): string {
  if (!value) return '-';
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return value.toLocaleString();
}
