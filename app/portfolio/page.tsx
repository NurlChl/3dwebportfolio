import type { Metadata } from "next";
import { PortfolioCard } from "@/components/portfolio-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { PageHeader, PageShell } from "@/components/ui";
import { getProfile, getPublishedPortfolios } from "@/lib/data";

export const metadata: Metadata = {
  title: "Portfolio 3D",
  description: "Kumpulan asset 3D Blender, Unreal Engine, hard surface, environment, dan product model dengan realtime preview."
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [profile, portfolios] = await Promise.all([getProfile(), getPublishedPortfolios()]);
  const page = profile.pages?.portfolio ?? {};
  const allLabel = page.allCategoryLabel || "All";
  const categories = [allLabel, ...Array.from(new Set(portfolios.map((item) => item.category)))];
  const params = await searchParams;
  const active = params.category ?? allLabel;
  const filtered = active === allLabel ? portfolios : portfolios.filter((item) => item.category === active);

  return (
    <>
      <SiteNav profile={profile} />
      <PageShell>
        <div className="section-head">
          <PageHeader eyebrow={page.eyebrow || "Browse Work"} title={page.title || "Portfolio 3D"} />
          <p className="lead">{page.description || "Filter karya berdasarkan kategori dan buka detail untuk melihat model 3D secara interaktif."}</p>
        </div>
        <div className="filters" data-reveal>
          {categories.map((category) => (
            <a className={category === active ? "active" : ""} href={category === allLabel ? "/portfolio" : `/portfolio?category=${encodeURIComponent(category)}`} key={category}>
              {category}
            </a>
          ))}
        </div>
        <div className="grid portfolio-grid">
          {filtered.map((item) => (
            <PortfolioCard item={item} key={item.slug} />
          ))}
        </div>
        {!filtered.length ? <p className="meta">{page.emptyText || "Belum ada portfolio untuk kategori ini."}</p> : null}
      </PageShell>
      <SiteFooter profile={profile} />
    </>
  );
}
