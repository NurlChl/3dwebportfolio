import type { Metadata } from "next";
import { PortfolioCard } from "@/components/portfolio-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { PageHeader, PageShell } from "@/components/ui";
import { getPublishedPortfolios } from "@/lib/data";

export const metadata: Metadata = {
  title: "Portfolio 3D",
  description: "Kumpulan asset 3D Blender, Unreal Engine, hard surface, environment, dan product model dengan realtime preview."
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const portfolios = await getPublishedPortfolios();
  const categories = ["All", ...Array.from(new Set(portfolios.map((item) => item.category)))];
  const params = await searchParams;
  const active = params.category ?? "All";
  const filtered = active === "All" ? portfolios : portfolios.filter((item) => item.category === active);

  return (
    <>
      <SiteNav />
      <PageShell>
        <div className="section-head">
          <PageHeader eyebrow="Browse Work" title="Portfolio 3D" />
          <p className="lead">Filter karya berdasarkan kategori dan buka detail untuk melihat model 3D secara interaktif.</p>
        </div>
        <div className="filters" data-reveal>
          {categories.map((category) => (
            <a className={category === active ? "active" : ""} href={category === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(category)}`} key={category}>
              {category}
            </a>
          ))}
        </div>
        <div className="grid portfolio-grid">
          {filtered.map((item) => (
            <PortfolioCard item={item} key={item.slug} />
          ))}
        </div>
      </PageShell>
      <SiteFooter />
    </>
  );
}
