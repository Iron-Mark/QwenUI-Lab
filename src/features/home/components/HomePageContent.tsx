import { getDictionary, type Locale } from "@/lib/i18n";
import { HomeBelowFoldClient } from "./HomeBelowFoldClient";
import { HomeMarketingHero } from "./HomeMarketingHero";

export function HomePageContent({ locale }: { locale: Locale }) {
  return (
    <>
      <div className="relative">
        <HomeMarketingHero locale={locale} copy={getDictionary(locale).hero} />
        <HomeBelowFoldClient />
      </div>
    </>
  );
}
