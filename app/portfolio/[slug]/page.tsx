import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { ModelViewer } from "@/components/model-viewer";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getPortfolioBySlug, getProfile, getPublishedPortfolios } from "@/lib/data";

type DetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await getPublishedPortfolios();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article"
    }
  };
}

export default async function PortfolioDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  const [item, profile] = await Promise.all([getPortfolioBySlug(slug), getProfile()]);
  if (!item) notFound();
  const page = profile.pages?.portfolio ?? {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.summary,
    url: `${siteUrl}/portfolio/${item.slug}`,
    dateCreated: item.year.toString(),
    keywords: [...item.tags, ...item.software].join(", "),
    creator: {
      "@type": "Person",
      name: "Arka Wisesa"
    }
  };

  return (
    <>
      <SiteNav profile={profile} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }} />
      <main className="shell section page-hero">
        <div className="eyebrow">{item.category}</div>
        <h1 data-reveal style={{ fontSize: "clamp(42px, 7vw, 86px)", marginTop: 14 }}>{item.title}</h1>
        <p className="lead" style={{ marginTop: 18 }}>{item.summary}</p>

        <div className="detail-stage" data-reveal>
          <ModelViewer
            title={item.title}
            modelUrl={item.modelUrl}
            loadingText={page.detailViewerLoadingText}
            hintText={page.detailViewerHintText}
            loadingBadgeText={page.detailLoadingBadgeText}
            previewCategoryLabel={page.detailPreviewCategoryLabel}
          />
        </div>

        <div className="detail-layout">
          <article className="panel">
            <h2 style={{ fontSize: 34 }}>{page.detailNotesTitle || "Project Notes"}</h2>
            <p className="lead" style={{ marginTop: 16 }}>{item.description}</p>
          </article>
          <aside className="panel">
            <ul className="list">
              <li><BadgeCheck size={18} color="var(--green)" /> {page.detailRoleLabel || "Role"}: {item.role}</li>
              <li><BadgeCheck size={18} color="var(--green)" /> {page.detailYearLabel || "Year"}: {item.year}</li>
              {item.client ? <li><BadgeCheck size={18} color="var(--green)" /> {page.detailClientLabel || "Client"}: {item.client}</li> : null}
            </ul>
            <div className="tag-row" style={{ marginTop: 22 }}>
              {[...item.software, ...item.tags].map((tag) => (
                <span className="pill" key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
