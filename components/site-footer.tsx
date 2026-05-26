import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import type { SerializedProfile } from "@/lib/mongodb";

export function SiteFooter({ profile }: { profile?: SerializedProfile }) {
  const footer = profile?.footer ?? {};
  const columns = footer.columns?.length
    ? footer.columns
    : [{ title: "Explore", links: [{ label: "Portfolio", url: "/portfolio" }, { label: "About", url: "/about" }, { label: "Contact", url: "/contact" }] }];
  const socials = [
    profile?.instagram ? { label: "Instagram", url: profile.instagram } : null,
    profile?.linkedin ? { label: "LinkedIn", url: profile.linkedin } : null,
    ...(profile?.socialLinks ?? [])
  ].filter(Boolean) as Array<{ label: string; url: string }>;

  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-giant" aria-hidden="true">{footer.brandText || "IMAGINE"}</div>
        <div className="footer-grid">
          <div className="footer-brand">
            <strong>{profile?.navigation?.brand || profile?.name || "Arka Wisesa"}</strong>
            <p>{footer.tagline || "Realtime 3D portfolio, interactive product staging, and CMS-ready publishing."}</p>
            {profile?.email ? <a className="footer-mail" href={`mailto:${profile.email}`}><Mail size={17} /> {profile.email}</a> : null}
          </div>
          {columns.map((column) => (
            <nav className="footer-column" key={column.title}>
              <span>{column.title}</span>
              {column.links.map((link) => (
                <Link href={link.url} key={`${column.title}-${link.label}`}>{link.label}</Link>
              ))}
            </nav>
          ))}
          <div className="footer-column">
            <span>Social</span>
            {socials.length ? socials.map((social) => <a href={social.url} key={`${social.label}-${social.url}`}>{social.label}</a>) : <Link href="/contact">Contact</Link>}
          </div>
          {footer.showNewsletter ?? true ? (
            <form className="newsletter">
              <label>Studio Notes</label>
              <div>
                <input aria-label="Email newsletter" placeholder="email@example.com" type="email" />
                <button aria-label="Submit newsletter" type="button"><ArrowRight size={17} /></button>
              </div>
            </form>
          ) : null}
        </div>
        <div className="footer-bottom">
          <span>Copyright {new Date().getFullYear()} {footer.copyright || "Arka Wisesa Studio. Built for realtime 3D portfolio publishing."}</span>
        </div>
      </div>
    </footer>
  );
}
