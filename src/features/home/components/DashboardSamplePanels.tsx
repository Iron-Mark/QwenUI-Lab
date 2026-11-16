"use client";

import {
  BarChart3,
  Boxes,
  Code2,
  Download,
  Eye,
  FileCode2,
  LayoutDashboard,
  ListChecks,
  PanelsTopLeft,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { ActivityList } from "./ActivityList";
import { ChartPreview } from "./ChartPreview";
import { QuickActionButton } from "./QuickActionButton";
import { RevenueCard } from "./RevenueCard";
import { StatCard } from "./StatCard";
import { WorkflowBanner } from "./WorkflowBanner";
import { ObservabilityErrorBoundary } from "@/components/providers/ObservabilityErrorBoundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveTabsList } from "@/components/ui/responsive-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { interpolate } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale.client";
import type { DashboardSampleData } from "../data/dashboard-data";

const samplePlan = [
  {
    titleKey: "planCaptureTitle",
    bodyKey: "planCaptureBody",
    icon: ScanSearch,
  },
  {
    titleKey: "planDetectTitle",
    bodyKey: "planDetectBody",
    icon: Boxes,
  },
  {
    titleKey: "planPrepareTitle",
    bodyKey: "planPrepareBody",
    icon: Code2,
  },
  {
    titleKey: "planRefineTitle",
    bodyKey: "planRefineBody",
    icon: Sparkles,
  },
] as const;

const detectedUi = [
  {
    labelKey: "detectedMetricCards",
    value: "4",
    bodyKey: "detectedMetricCardsBody",
    icon: LayoutDashboard,
  },
  {
    labelKey: "detectedChartRegions",
    value: "2",
    bodyKey: "detectedChartRegionsBody",
    icon: BarChart3,
  },
  {
    labelKey: "detectedActivityFeed",
    value: "5 rows",
    bodyKey: "detectedActivityFeedBody",
    icon: ListChecks,
  },
  {
    labelKey: "detectedActionControls",
    value: "4",
    bodyKey: "detectedActionControlsBody",
    icon: PanelsTopLeft,
  },
] as const;

const exportOptions = [
  {
    titleKey: "exportComponentTitle",
    bodyKey: "exportComponentBody",
    icon: FileCode2,
  },
  {
    titleKey: "exportTailwindTitle",
    bodyKey: "exportTailwindBody",
    icon: Sparkles,
  },
  {
    titleKey: "exportDownloadTitle",
    bodyKey: "exportDownloadBody",
    icon: Download,
  },
] as const;

export function DashboardSamplePanels({
  stats,
  revenueData,
  performanceData,
  channelMixData,
  activities,
  quickActions,
}: DashboardSampleData) {
  const { dict } = useLocale();
  const t = dict.dashboardSample;
  const workflowStepLabels = [
    t.workflowStepScreenshot,
    t.workflowStepDetection,
    t.workflowStepPlan,
    t.workflowStepCode,
    t.workflowStepRefine,
    t.workflowStepFinal,
  ];

  return (
    <Tabs defaultValue="preview" className="min-h-0 flex-1 gap-0">
      <div className="shrink-0 px-4 py-3 sm:px-5">
        <ResponsiveTabsList
          aria-label={t.sectionsAria}
          columns={4}
        >
          <TabsTrigger
            value="preview"
            className="h-11 min-h-11 rounded-xl px-3 text-xs sm:text-sm"
          >
            <Eye className="size-4" aria-hidden />
            {t.tabPreview}
          </TabsTrigger>
          <TabsTrigger
            value="plan"
            className="h-11 min-h-11 rounded-xl px-3 text-xs sm:text-sm"
          >
            <ListChecks className="size-4" aria-hidden />
            {t.tabPlan}
          </TabsTrigger>
          <TabsTrigger
            value="detected"
            className="h-11 min-h-11 rounded-xl px-3 text-xs sm:text-sm"
          >
            <ScanSearch className="size-4" aria-hidden />
            {t.tabDetected}
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="h-11 min-h-11 rounded-xl px-3 text-xs sm:text-sm"
          >
            <Download className="size-4" aria-hidden />
            {t.tabDownload}
          </TabsTrigger>
        </ResponsiveTabsList>
      </div>

      <TabsContent value="preview" className="min-h-0 flex-1">
        <ScrollArea className="h-full" data-testid="dashboard-sample-dialog-preview">
          <div className="grid gap-5 p-4 sm:p-5">
            <WorkflowBanner
              ariaLabel={t.workflowAria}
              title={t.workflowTitle}
              stepLabels={workflowStepLabels}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <RevenueCard
                  data={revenueData}
                  title={t.revenueTitle}
                  description={t.revenueDescription}
                  formatValueAriaLabel={(point) =>
                    interpolate(t.revenueValueAria, {
                      month: point.month,
                      value: point.revenue.toLocaleString(),
                    })
                  }
                />
              </div>
              <div className="lg:col-span-3">
                <ObservabilityErrorBoundary fallbackTitle={t.chartError}>
                  <ChartPreview
                    performanceData={performanceData}
                    channelMixData={channelMixData}
                    title={t.chartTitle}
                    description={t.chartDescription}
                    trafficMixLabel={t.trafficMix}
                    performanceChartAriaLabel={t.performanceChartAria}
                    performanceTooltipLabel={t.performanceTooltipLabel}
                    channelChartAriaLabel={t.channelChartAria}
                  />
                </ObservabilityErrorBoundary>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <ActivityList
                activities={activities}
                title={t.activityTitle}
                description={t.activityDescription}
                emptyMessage={t.activityEmpty}
              />
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t.quickActionsTitle}</CardTitle>
                  <CardDescription>{t.quickActionsDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                      <QuickActionButton key={action.id} action={action} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="plan" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {samplePlan.map(({ titleKey, bodyKey, icon: Icon }, index) => (
              <div
                key={titleKey}
                className="rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {interpolate(t.stepLabel, { count: String(index + 1) })}
                    </p>
                    <h3 className="mt-1 font-semibold text-card-foreground">
                      {t[titleKey]}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {t[bodyKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="detected" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {detectedUi.map(({ labelKey, value, bodyKey, icon: Icon }) => (
              <div
                key={labelKey}
                className="rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-card-foreground">
                        {t[labelKey]}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {t[bodyKey]}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-semibold text-card-foreground">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="export" className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="grid gap-3 p-4 sm:p-5">
            {exportOptions.map(({ titleKey, bodyKey, icon: Icon }) => (
              <div
                key={titleKey}
                className="rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-card-foreground">
                      {t[titleKey]}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {t[bodyKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
