import type { Metadata } from "next";
import { StructuredDataScript } from "@/components/layout/StructuredDataScript";
import { HomePageContent } from "@/features/home/components/HomePageContent";
import { resolveLocale } from "@/lib/i18n";
import {
  createHomeRouteMetadata,
  createHomeRouteStructuredData,
} from "@/features/home/lib/home-route";

export const metadata: Metadata = createHomeRouteMetadata();

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(Array.isArray(lang) ? lang[0] : lang);
  const structuredData = createHomeRouteStructuredData();

  return (
    <main className="relative">
      <StructuredDataScript id="home-structured-data" data={structuredData} />
      <HomePageContent locale={locale} />
    </main>
  );
}
