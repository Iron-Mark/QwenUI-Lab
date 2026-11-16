"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Eye, PanelsTopLeft, Sparkles, UploadCloud } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogActionFooter } from "@/components/ui/dialog-action-footer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { localizedHref } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale.client";
import { cn } from "@/lib/utils";
import type { DashboardSampleData } from "../data/dashboard-data";

const DashboardSamplePanels = dynamic(
  () => import("./DashboardSamplePanels").then((mod) => mod.DashboardSamplePanels),
  {
    loading: () => (
      <div className="min-h-0 flex-1 space-y-5 p-5" aria-busy="true">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  },
);

export function DashboardSampleDialog({
  stats,
  revenueData,
  performanceData,
  channelMixData,
  activities,
  quickActions,
}: DashboardSampleData) {
  const { locale, dict } = useLocale();
  const t = dict.dashboardSample;
  const sampleWorkflowHref = `${localizedHref("/demo", locale)}#upload-flow`;

  return (
    <Dialog>
      <section
        className="mb-5 rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm md:mb-8"
        data-testid="example-output-section"
        aria-labelledby="dashboard-sample-heading"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            <DashboardSampleThumbnail />
            <div className="min-w-0 py-1 sm:py-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                {t.launcherEyebrow}
              </div>
              <h2
                id="dashboard-sample-heading"
                className="mt-2 font-display text-xl font-semibold tracking-tight text-card-foreground sm:text-2xl"
              >
                {t.title}
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                {t.launcherDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-[420px]:flex-row md:shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={sampleWorkflowHref}
                    className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                  />
                }
              >
                {t.loadSample}
                <ArrowRight className="size-4" aria-hidden />
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.loadSampleTooltip}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DialogTrigger
                    type="button"
                    aria-haspopup="dialog"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "gap-2",
                    )}
                  />
                }
              >
                <Eye className="size-4" aria-hidden />
                {t.preview}
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.previewTooltip}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      <DialogContent
        className="flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(88dvh,52rem)] sm:max-w-6xl sm:rounded-2xl"
        data-testid="dashboard-sample-dialog"
      >
        <DialogHeader className="shrink-0 border-b border-border bg-muted/20 px-4 py-4 pr-12 sm:px-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <PanelsTopLeft className="size-3.5 text-primary" aria-hidden />
            {t.dialogEyebrow}
          </div>
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.title}
          </DialogTitle>
          <DialogDescription className="max-w-2xl leading-6">
            {t.dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <DashboardSamplePanels
          stats={stats}
          revenueData={revenueData}
          performanceData={performanceData}
          channelMixData={channelMixData}
          activities={activities}
          quickActions={quickActions}
        />

        <DialogActionFooter>
          <DialogClose
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-h-11",
            )}
          >
            {t.close}
          </DialogClose>
          <Link
            href={sampleWorkflowHref}
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 gap-2")}
          >
            <UploadCloud className="size-4" aria-hidden />
            {t.loadIntoWorkflow}
          </Link>
        </DialogActionFooter>
      </DialogContent>
    </Dialog>
  );
}

function DashboardSampleThumbnail() {
  return (
    <div
      className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30 shadow-inner sm:block"
      aria-hidden="true"
    >
      <div className="grid h-full grid-cols-[0.8fr_1fr] gap-1 p-2">
        <div className="rounded-md bg-muted/70 p-1.5">
          <div className="h-2 w-10 rounded-full bg-primary/55" />
          <div className="mt-3 h-3 w-14 rounded bg-foreground/20" />
          <div className="mt-1.5 h-2 w-9 rounded bg-muted-foreground/25" />
        </div>
        <div className="grid gap-1">
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded bg-muted/70" />
            <div className="rounded bg-muted/70" />
          </div>
          <div className="rounded bg-muted/70 p-1.5">
            <div className="h-2 w-14 rounded bg-primary/45" />
            <div className="mt-2 flex h-6 items-end gap-1">
              <span className="h-3 flex-1 rounded-sm bg-primary/35" />
              <span className="h-5 flex-1 rounded-sm bg-primary/55" />
              <span className="h-4 flex-1 rounded-sm bg-primary/40" />
              <span className="h-6 flex-1 rounded-sm bg-primary/65" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
