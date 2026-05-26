import type { Metadata } from "next";
import { BadgeCheck, Mail, MapPin } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { PageHeader, PageShell, Panel, SectionHeader, Tag } from "@/components/ui";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "Profil 3D artist, pengalaman, layanan, dan skill Blender/Unreal Engine."
};

export default async function AboutPage() {
  const profile = await getProfile();
  const page = profile.pages?.about ?? {};

  return (
    <>
      <SiteNav profile={profile} />
      <PageShell>
        <div className="split">
          <PageHeader eyebrow={page.eyebrow || "About The Artist"} title={page.title || profile.name}>{page.description || profile.bio}</PageHeader>
          <Panel className="contact-panel" data-reveal>
            <ul className="list">
              <li><MapPin size={18} /> {profile.location}</li>
              <li><Mail size={18} /> {profile.email}</li>
              <li><BadgeCheck size={18} color="var(--green)" /> {profile.experience}</li>
            </ul>
          </Panel>
        </div>

        <section className="section light about-experience">
          <SectionHeader title={page.experienceTitle || "Experience"}>{page.experienceDescription || "Terbiasa mengolah bentuk dari blocking sampai final asset, menjaga topology, UV, material PBR, dan export GLB/FBX untuk berbagai kebutuhan."}</SectionHeader>
          <div className="split">
            <Panel>
              <h3>{page.servicesTitle || "Services"}</h3>
              <ul className="list" style={{ marginTop: 18 }}>
                {profile.services.map((item) => (
                  <li key={item}><BadgeCheck size={18} color="var(--green)" /> {item}</li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <h3>{page.skillsTitle || "Skills"}</h3>
              <div className="tag-row" style={{ marginTop: 18 }}>
                {profile.skills.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </PageShell>
      <SiteFooter profile={profile} />
    </>
  );
}
