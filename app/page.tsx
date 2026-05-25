import Link from "next/link";
import { ArrowRight, BadgeCheck, Cuboid, Sparkles } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { StudioWorld } from "@/components/studio-world";
import { getProfile, getPublishedPortfolios } from "@/lib/data";

export default async function HomePage() {
  const [profile, portfolios] = await Promise.all([getProfile(), getPublishedPortfolios()]);
  const featured = portfolios.filter((item) => item.featured).slice(0, 3);
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
      itemOffered: {
        "@type": "Service",
        name: service
      }
    }))
  };

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <main>
        <section className="shell hero">
          <div className="hero-copy">
            <div className="eyebrow">Realtime 3D Portfolio</div>
            <h1 data-reveal>{profile.name}</h1>
            <p className="lead">{profile.title}. {profile.bio}</p>
            <div className="actions">
              <Link className="btn primary" href="/portfolio">
                Lihat Portfolio <ArrowRight size={18} />
              </Link>
              <Link className="btn secondary" href="/about">
                Profil Artist <Sparkles size={18} />
              </Link>
            </div>
            <a className="scroll-cue" href="#start">
              <span />
              Scroll to start
            </a>
          </div>
          <div className="hero-stage">
            <StudioWorld />
            <div className="floating-panel">
              <span className="eyebrow">Live Asset Stage</span>
              <strong>Orbit-ready models, built for web.</strong>
              <p className="meta">Blender · Unreal · GLB · PBR · Three.js</p>
            </div>
          </div>
        </section>

        <section className="section" id="start">
          <div className="shell stats" data-reveal>
            <div className="stat">
              <strong>6+</strong>
              <span>Tahun produksi asset 3D</span>
            </div>
            <div className="stat">
              <strong>GLB</strong>
              <span>Preview langsung di browser</span>
            </div>
            <div className="stat">
              <strong>PBR</strong>
              <span>Texture workflow siap engine</span>
            </div>
            <div className="stat">
              <strong>SEO</strong>
              <span>Structured pages dan sitemap</span>
            </div>
          </div>
        </section>

        <section className="section story-section">
          <div className="shell story-grid">
            <div className="story-copy" data-reveal>
              <div className="eyebrow">Where assets</div>
              <h2>Come Alive</h2>
              <p className="lead">
                Portfolio ini bukan galeri gambar statis. Setiap karya disiapkan sebagai experience kecil:
                bisa diputar, diperiksa materialnya, dan dibaca proses pembuatannya langsung dari browser.
              </p>
            </div>
            <div className="chapter-stack">
              {[
                ["01", "Model", "Blocking, silhouette, topology, dan bentuk utama yang siap produksi."],
                ["02", "Texture", "Material PBR, warna, roughness, dan detail yang tetap terbaca realtime."],
                ["03", "Publish", "GLB/GLTF ringan untuk web, Unreal preview, dan CMS portfolio."]
              ].map(([number, title, text]) => (
                <article className="chapter" data-reveal key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section light">
          <div className="shell">
          <div className="section-head">
            <h2>Service & Skill</h2>
            <p>Pipeline dirancang untuk asset yang enak dilihat, mudah dipakai ulang, dan cukup ringan untuk realtime web viewer.</p>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {profile.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <div className="marquee-track">
              {profile.skills.map((skill) => <span key={`${skill}-2`}>{skill}</span>)}
            </div>
          </div>
          <div className="split">
            <div className="panel" data-reveal>
              <h3>Services</h3>
              <ul className="list" style={{ marginTop: 18 }}>
                {profile.services.map((service) => (
                  <li key={service}>
                    <BadgeCheck size={18} color="var(--green)" /> {service}
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel" data-reveal>
              <h3>Core Software</h3>
              <div className="tag-row" style={{ marginTop: 18 }}>
                {profile.skills.map((skill) => (
                  <span className="pill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="section light papercraft-section">
          <div className="shell">
            <div className="section-head">
              <h2>Asset Superpowers</h2>
              <p>Terinspirasi dari feel playful Cinnamon dan papercraft world Aimee: tiap kemampuan ditampilkan seperti prop 3D kecil yang punya karakter.</p>
            </div>
            <div className="arch-grid">
              {[
                ["Realtime Ready", "GLB/GLTF ringan, orbit control, dan material tetap tajam."],
                ["Engine Friendly", "Struktur asset siap dipindah ke Unreal atau pipeline game."],
                ["Craft Detail", "Bentuk, warna, dan surface dibuat terasa handcrafted, bukan generik."],
                ["CMS Publish", "Upload model, isi metadata SEO, publish karya tanpa sentuh code."]
              ].map(([title, text], index) => (
                <article className="arch-card" data-reveal key={title}>
                  <div className={`paper-prop prop-${index + 1}`} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shell section">
          <div className="section-head">
            <h2>Portfolio Terbaru</h2>
            <Link className="btn secondary" href="/portfolio">
              Semua karya <Cuboid size={18} />
            </Link>
          </div>
          <div className="grid portfolio-grid">
            {featured.map((item) => (
              <PortfolioCard item={item} key={item.slug} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
