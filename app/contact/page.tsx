import type { Metadata } from "next";
import { Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { PageHeader, PageShell, Panel, SectionHeader } from "@/components/ui";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Kontak 3D artist untuk project Blender, Unreal Engine, dan realtime 3D web portfolio."
};

export default async function ContactPage() {
  const profile = await getProfile();
  const socials = [
    profile.instagram ? { label: "Instagram", url: profile.instagram } : null,
    profile.facebook ? { label: "Facebook", url: profile.facebook } : null,
    profile.tiktok ? { label: "TikTok", url: profile.tiktok } : null,
    profile.linkedin ? { label: "LinkedIn", url: profile.linkedin } : null,
    ...(profile.socialLinks ?? [])
  ].filter(Boolean) as Array<{ label: string; url: string }>;

  return (
    <>
      <SiteNav />
      <PageShell>
        <div className="split">
          <PageHeader eyebrow="Start A Project" title="Contact">Kirim brief asset, kebutuhan realtime preview, atau pipeline Blender/Unreal yang ingin dibangun.</PageHeader>
          <Panel className="contact-panel" data-reveal>
            {profile.whatsapp ? (
              <a className="contact-link" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}>
                <MessageCircle size={20} /> WhatsApp
              </a>
            ) : null}
            <a className="contact-link" href={`mailto:${profile.email}`}>
              <Mail size={20} /> {profile.email}
            </a>
            {profile.instagram ? (
              <a className="contact-link" href={profile.instagram}>
                <Instagram size={20} /> Instagram
              </a>
            ) : null}
            {profile.linkedin ? (
              <a className="contact-link" href={profile.linkedin}>
                <Linkedin size={20} /> LinkedIn
              </a>
            ) : null}
          </Panel>
        </div>
        <section className="section">
          <SectionHeader title="Social Links">Semua kanal sosial bisa ditambah dan diubah dari CMS.</SectionHeader>
          <div className="contact-grid">
            {socials.map((social) => (
              <a className="panel contact-card" data-reveal href={social.url} key={`${social.label}-${social.url}`}>
                <span>{social.label}</span>
                <strong>{social.url.replace(/^https?:\/\//, "")}</strong>
              </a>
            ))}
          </div>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
