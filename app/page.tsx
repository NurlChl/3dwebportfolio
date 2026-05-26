import Link from "next/link";
import { ArrowRight, BadgeCheck, Cuboid, FileText, Sparkles } from "lucide-react";
import { CounterAnimation } from "@/components/counter-animation";
import { MagneticButton } from "@/components/magnetic-button";
import { PortfolioCard } from "@/components/portfolio-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { StudioWorld } from "@/components/studio-world";
import { getProfile, getPublishedPortfolios } from "@/lib/data";

const iconMap = { BadgeCheck, Cuboid, FileText, Sparkles };

export default async function HomePage() {
  const [profile, portfolios] = await Promise.all([getProfile(), getPublishedPortfolios()]);
  const featured = portfolios.filter((item) => item.featured).slice(0, 3);
  const sections = profile.sections ?? {};
  const hero = sections.hero ?? {};
  const homePage = profile.pages?.home ?? {};
  const stats = sections.stats ?? [];
  const story = sections.story ?? {};
  const features = sections.features ?? [];
  const cta = sections.cta ?? {};
  const order = sections.sectionOrder?.length ? sections.sectionOrder : ["stats", "story", "services", "features", "portfolio", "testimonials", "cta"];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.bio,
    email: profile.email,
    address: profile.location,
    url: siteUrl,
    knowsAbout: profile.skills,
    makesOffer: profile.services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service }
    }))
  };

  const renderSection = (section: string) => {
    if (section === "stats") {
      return (
        <section className="section" id="start" key="stats">
          <div className="shell stats" data-reveal>
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon as keyof typeof iconMap] ?? Sparkles;
              return (
                <div className="stat glass" key={`${stat.value}-${stat.label}`}>
                  <Icon size={22} />
                  <strong><CounterAnimation value={stat.value} /></strong>
                  <span>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (section === "story") {
      return (
        <section className="section story-section" key="story">
          <div className="shell story-grid">
            <div className="story-copy" data-reveal>
              <div className="eyebrow">{homePage.storyEyebrow || "Where assets"}</div>
              <h2>{story.title || "Come Alive"}</h2>
              <p className="lead">{story.subtitle}</p>
            </div>
            <div className="chapter-stack">
              {(story.steps ?? []).map((step) => (
                <article className="chapter" data-reveal key={`${step.number}-${step.title}`}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section === "services") {
      return (
        <section className="section light" key="services">
          <div className="shell">
            <div className="section-head">
              <h2>{homePage.servicesTitle || "Service & Skill"}</h2>
              <p>{homePage.servicesDescription || "Pipeline dirancang untuk asset yang enak dilihat, mudah dipakai ulang, dan cukup ringan untuk realtime web viewer."}</p>
            </div>
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <div className="marquee-track">{profile.skills.map((skill) => <span key={`${skill}-2`}>{skill}</span>)}</div>
            </div>
            <div className="split">
              <div className="panel" data-reveal>
                <h3>{homePage.servicesPanelTitle || "Services"}</h3>
                <ul className="list" style={{ marginTop: 18 }}>
                  {profile.services.map((service) => <li key={service}><BadgeCheck size={18} color="var(--green)" /> {service}</li>)}
                </ul>
              </div>
              <div className="panel" data-reveal>
                <h3>{homePage.skillsPanelTitle || "Core Software"}</h3>
                <div className="tag-row" style={{ marginTop: 18 }}>{profile.skills.map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section === "features") {
      return (
        <section className="section light papercraft-section" key="features">
          <div className="shell">
            <div className="section-head">
              <h2>{homePage.featuresTitle || "Asset Superpowers"}</h2>
              <p>{homePage.featuresDescription || "Playful seperti papercraft, tapi tetap presisi untuk showcase produk, game prototype, dan web viewer."}</p>
            </div>
            <div className="arch-grid">
              {features.map((feature, index) => (
                <article className="arch-card" data-reveal key={feature.title}>
                  <div className={`paper-prop prop-${(index % 4) + 1}`} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section === "portfolio") {
      return (
        <section className="shell section" key="portfolio">
          <div className="section-head">
            <h2>{homePage.portfolioTitle || "Portfolio Terbaru"}</h2>
            <Link className="btn secondary" href="/portfolio">{homePage.portfolioButtonText || "Semua karya"} <Cuboid size={18} /></Link>
          </div>
          <div className="grid portfolio-grid">{featured.map((item) => <PortfolioCard item={item} key={item.slug} />)}</div>
        </section>
      );
    }

    if (section === "testimonials" && profile.testimonials?.length) {
      return (
        <section className="section testimonial-section" key="testimonials">
          <div className="shell">
            <div className="section-head">
              <h2>{homePage.testimonialsTitle || "Client Notes"}</h2>
              <p>{homePage.testimonialsDescription || "Trust signal ringan untuk menunjukkan bagaimana asset 3D dipakai di pitching, prototype, dan product showcase."}</p>
            </div>
            <div className="testimonial-strip">
              {profile.testimonials.map((item) => (
                <article className="testimonial-card" data-reveal key={`${item.name}-${item.role}`}>
                  <p>{item.text}</p>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section === "cta") {
      return (
        <section className="section cta-section" key="cta">
          <div className="shell cta-panel" data-reveal>
            <div>
              <div className="eyebrow">{homePage.ctaEyebrow || "Launch ready"}</div>
              <h2>{cta.title}</h2>
              <p>{cta.description}</p>
            </div>
            <MagneticButton href={cta.buttonLink || "/contact"}>{cta.buttonText || "Mulai Project"} <ArrowRight size={18} /></MagneticButton>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <>
      <SiteNav profile={profile} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <main>
        <section className="shell hero">
          <div className="hero-copy">
            <div className="eyebrow">{homePage.eyebrow || "Realtime 3D Portfolio"}</div>
            <h1 data-reveal>{homePage.heroHeadline || hero.headline || homePage.title || profile.name}</h1>
            <p className="lead">{homePage.heroSubheadline || hero.subheadline || homePage.description || `${profile.title}. ${profile.bio}`}</p>
            <div className="actions">
              <MagneticButton href={homePage.primaryCtaLink || hero.ctaLink || "/portfolio"}>{homePage.primaryCtaText || hero.ctaText || "Lihat Portfolio"} <ArrowRight size={18} /></MagneticButton>
              <Link className="btn secondary" href={homePage.secondaryCtaLink || "/about"}>{homePage.secondaryCtaText || "Profil Artist"} <Sparkles size={18} /></Link>
            </div>
            <a className="scroll-cue" href="#start"><span /> {homePage.scrollCueText || "Scroll to start"}</a>
          </div>
          {hero.showScene ?? true ? (
            <div className="hero-stage">
              <StudioWorld />
              <div className="floating-panel">
                <span className="eyebrow">{homePage.liveStageEyebrow || "Live Asset Stage"}</span>
                <strong>{homePage.liveStageTitle || "Orbit-ready models, built for web."}</strong>
                <p className="meta">{homePage.liveStageMeta || "Blender / Unreal / GLB / PBR / Three.js"}</p>
              </div>
            </div>
          ) : null}
        </section>
        {order.map(renderSection)}
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
