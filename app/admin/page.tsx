import Link from "next/link";
import { Contact, Edit3, FileText, FolderKanban, Images, LogOut, MessageSquareQuote, Navigation, Palette, Plus, Save, Search, Settings, Trash2, UserRound } from "lucide-react";
import { readdir } from "fs/promises";
import path from "path";
import { deletePortfolioAction, logoutAction, saveContactAction, saveDesignAction, saveFooterAction, saveNavigationAction, savePagesAction, savePortfolioAction, saveProfileAction, saveSectionsAction, saveSeoAction, saveTestimonialsAction, seedDemoPortfoliosAction } from "@/app/admin/actions";
import { getAllPortfoliosForAdmin, getFallbackPortfolios, getFallbackProfile, getProfile } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import type { SerializedProfile } from "@/lib/mongodb";
import { RepeaterInput, SocialLinksRepeater } from "@/components/repeater-input";
import { SectionEditor } from "@/components/section-editor";
import { FooterEditor, NavigationEditor, SeoEditor } from "@/components/site-config-editor";
import { TestimonialEditor } from "@/components/testimonial-editor";

export const dynamic = "force-dynamic";

type AdminView = "profile" | "pages" | "testimonials" | "footer" | "navigation" | "seo" | "media" | "new" | "edit" | "portfolio" | "contact" | "design";

const adminViews = ["profile", "pages", "testimonials", "footer", "navigation", "seo", "media", "new", "edit", "portfolio", "contact", "design"];
const pageKeys = ["home", "portfolio", "about", "contact"] as const;
const pageLabels = { home: "Home", portfolio: "Portfolio", about: "About", contact: "Contact" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string; updated?: string; id?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const activeView: AdminView =
    adminViews.includes(params.view ?? "") ? (params.view as AdminView) : "profile";
  let profile = getFallbackProfile();
  let portfolios = getFallbackPortfolios();
  let dbOffline = false;

  try {
    const [profileDoc, portfolioItems] = await Promise.all([getProfile(), getAllPortfoliosForAdmin()]);
    profile = profileDoc;
    portfolios = portfolioItems;
  } catch {
    dbOffline = true;
  }
  const dbPortfolioCount = portfolios.length;
  const visiblePortfolios = dbPortfolioCount ? portfolios : getFallbackPortfolios();
  const editingPortfolio = activeView === "edit" ? visiblePortfolios.find((item) => item.id === params.id) : null;
  const editingFallbackPortfolio = Boolean(editingPortfolio && editingPortfolio.id.startsWith("demo-"));
  const design = profile.design ?? {};
  const pages = profile.pages ?? {};
  const activePage = pageKeys.includes(params.page as (typeof pageKeys)[number]) ? (params.page as (typeof pageKeys)[number]) : "home";
  const mediaItems = activeView === "media" ? await getMediaItems() : [];

  return (
    <main className="shell">
      <div className="admin-layout">
        <aside className="admin-sidebar panel">
          <div className="brand">
            <span className="brand-mark">3D</span>
            <span>CMS Studio</span>
          </div>
          {dbOffline ? (
            <p className="meta" style={{ marginTop: 14, color: "var(--coral)" }}>
              MongoDB belum tersambung. Isi `DATABASE_URL` asli agar perubahan CMS tersimpan.
            </p>
          ) : null}
          {params.updated ? <p className="admin-success">Perubahan berhasil disimpan.</p> : null}
          <p className="meta" style={{ marginTop: 14 }}>Kelola profil, upload model GLB/GLTF, publish portfolio, dan jaga metadata SEO.</p>
          <nav className="admin-menu" aria-label="CMS menu">
            <Link className={activeView === "profile" ? "active" : ""} href="/admin?view=profile">
              <UserRound size={18} /> Profile
            </Link>
            <details className="admin-menu-group" open={activeView === "pages"}>
              <summary className={activeView === "pages" ? "active" : ""}>
                <span><FileText size={18} /> Pages</span>
              </summary>
              <div className="admin-submenu">
                {pageKeys.map((key) => (
                  <Link className={activeView === "pages" && activePage === key ? "active" : ""} href={`/admin?view=pages&page=${key}`} key={key}>
                    {pageLabels[key]}
                  </Link>
                ))}
              </div>
            </details>
            <Link className={activeView === "testimonials" ? "active" : ""} href="/admin?view=testimonials">
              <MessageSquareQuote size={18} /> Testimonials
            </Link>
            <Link className={activeView === "footer" ? "active" : ""} href="/admin?view=footer">
              <Settings size={18} /> Footer
            </Link>
            <Link className={activeView === "navigation" ? "active" : ""} href="/admin?view=navigation">
              <Navigation size={18} /> Navigation
            </Link>
            <Link className={activeView === "seo" ? "active" : ""} href="/admin?view=seo">
              <Search size={18} /> SEO
            </Link>
            <Link className={activeView === "media" ? "active" : ""} href="/admin?view=media">
              <Images size={18} /> Media
            </Link>
            <Link className={activeView === "new" ? "active" : ""} href="/admin?view=new">
              <Plus size={18} /> Tambah Portfolio
            </Link>
            <Link className={activeView === "portfolio" ? "active" : ""} href="/admin?view=portfolio">
              <FolderKanban size={18} /> Semua Portfolio
            </Link>
            <Link className={activeView === "contact" ? "active" : ""} href="/admin?view=contact">
              <Contact size={18} /> Kontak
            </Link>
            <Link className={activeView === "design" ? "active" : ""} href="/admin?view=design">
              <Palette size={18} /> Design System
            </Link>
          </nav>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link className="btn secondary" href="/">Lihat Website</Link>
            <form action={logoutAction}>
              <button className="btn secondary" type="submit"><LogOut size={17} /> Logout</button>
            </form>
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-topline">
            <div>
              <div className="eyebrow"><Settings size={14} /> CMS Control</div>
              <h1>
                {activeView === "profile"
                  ? "Profile"
                  : activeView === "pages"
                  ? `${pageLabels[activePage]} Page`
                  : activeView === "testimonials"
                    ? "Testimonials"
                  : activeView === "footer"
                    ? "Footer"
                  : activeView === "navigation"
                    ? "Navigation"
                  : activeView === "seo"
                    ? "SEO"
                  : activeView === "media"
                    ? "Media"
                  : activeView === "new"
                    ? "Tambah Portfolio"
                    : activeView === "edit"
                      ? "Edit Portfolio"
                      : activeView === "contact"
                        ? "Kontak"
                        : activeView === "design"
                          ? "Design System"
                          : "Portfolio"}
              </h1>
            </div>
            <p>
              {activeView === "profile"
                ? "Atur identitas artist, skill, service, dan konten About."
                : activeView === "pages"
                  ? `Ubah semua teks dan media yang tampil di halaman ${pageLabels[activePage]}.`
                : activeView === "testimonials"
                  ? "Tambah, edit, atau hapus testimonial/client review."
                : activeView === "footer"
                  ? "Atur teks footer, kolom link, newsletter, dan brand text besar."
                : activeView === "navigation"
                  ? "Atur brand, logo, dan item navigasi depan."
                : activeView === "seo"
                  ? "Atur title, description, dan OG image per halaman."
                : activeView === "media"
                  ? "Lihat file yang sudah diupload ke public/uploads."
                : activeView === "new" || activeView === "edit"
                  ? "Upload model, thumbnail, metadata SEO, dan status publish."
                  : activeView === "contact"
                    ? "Atur WhatsApp, email, dan social media yang tampil di halaman Contact."
                    : activeView === "design"
                      ? "Atur token visual dasar seperti font, warna, radius, dan aksen."
                      : "Pantau karya yang sudah dipublish atau draft."}
            </p>
          </div>

          {activeView === "profile" ? (
            <form action={saveProfileAction} className="panel form-grid admin-form">
              <div className="field"><label>Nama</label><input name="name" defaultValue={profile?.name ?? ""} required /></div>
              <div className="field"><label>Title</label><input name="title" defaultValue={profile?.title ?? ""} required /></div>
              <div className="field wide"><label>Bio</label><textarea name="bio" defaultValue={profile?.bio ?? ""} required /></div>
              <div className="field"><label>Lokasi</label><input name="location" defaultValue={profile?.location ?? ""} required /></div>
              <div className="field"><label>Email</label><input name="email" type="email" defaultValue={profile?.email ?? ""} required /></div>
              <div className="field wide"><label>Experience</label><textarea name="experience" defaultValue={profile?.experience ?? ""} required /></div>
              <RepeaterInput label="Services" name="services" values={profile.services} placeholder="3D Modeling" />
              <RepeaterInput label="Skills" name="skills" values={profile.skills} placeholder="Blender" />
              <button className="btn primary" type="submit"><Save size={17} /> Simpan Profile</button>
            </form>
          ) : null}

          {activeView === "testimonials" ? <TestimonialEditor action={saveTestimonialsAction} testimonials={profile.testimonials} /> : null}

          {activeView === "footer" ? <FooterEditor action={saveFooterAction} footer={profile.footer} /> : null}

          {activeView === "navigation" ? <NavigationEditor action={saveNavigationAction} navigation={profile.navigation} /> : null}

          {activeView === "seo" ? <SeoEditor action={saveSeoAction} seo={profile.seo} /> : null}

          {activeView === "media" ? (
            <section className="panel admin-list">
              <div className="editor-grid">
                {mediaItems.length ? mediaItems.map((item) => (
                  <a className="mini-card media-card" href={item.url} key={item.url} target="_blank" rel="noreferrer">
                    {item.kind === "image" ? <div className="media-thumb" style={{ backgroundImage: `url(${item.url})` }} /> : <div className="media-model">GLB</div>}
                    <strong>{item.name}</strong>
                    <span>{item.url}</span>
                  </a>
                )) : <p className="meta">Belum ada file di public/uploads.</p>}
              </div>
            </section>
          ) : null}

          {activeView === "pages" ? (
            <div className="panel page-editor-stack">
              <form action={savePagesAction} className="form-grid admin-form">
                <input name="pageKey" type="hidden" value={activePage} />
                <fieldset className="field-group wide">
                  <legend>{pageLabels[activePage]}</legend>
                  <div className="field"><label>Eyebrow</label><input name={`${activePage}Eyebrow`} defaultValue={pages[activePage]?.eyebrow ?? ""} /></div>
                  <div className="field"><label>Title</label><input name={`${activePage}Title`} defaultValue={pages[activePage]?.title ?? ""} /></div>
                  <div className="field wide"><label>Description</label><textarea name={`${activePage}Description`} defaultValue={pages[activePage]?.description ?? ""} /></div>
                  <div className="field"><label>Upload image</label><input name={`${activePage}ImageFile`} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" /></div>
                  <div className="field"><label>Atau image URL</label><input name={`${activePage}ImageUrl`} defaultValue={pages[activePage]?.imageUrl ?? ""} placeholder="/uploads/images/hero.webp" /></div>
                </fieldset>
                <PageFields pageKey={activePage} page={pages[activePage] ?? {}} />
                <button className="btn primary" type="submit"><Save size={17} /> Simpan {pageLabels[activePage]} Page</button>
              </form>
              {activePage === "home" ? <SectionEditor action={saveSectionsAction} sections={profile.sections} embedded /> : null}
            </div>
          ) : null}

          {activeView === "new" || activeView === "edit" ? (
            <form action={savePortfolioAction} className="panel form-grid admin-form">
              {editingPortfolio && !editingFallbackPortfolio ? <input name="id" type="hidden" value={editingPortfolio.id} /> : null}
              {editingFallbackPortfolio && editingPortfolio ? <input name="cloneFallbackId" type="hidden" value={editingPortfolio.id} /> : null}
              {editingFallbackPortfolio ? <p className="admin-success wide">Portfolio demo akan disimpan sebagai data MongoDB baru saat kamu klik Simpan Portfolio.</p> : null}
              <div className="field"><label>Judul</label><input name="title" defaultValue={editingPortfolio?.title ?? ""} required /></div>
              <div className="field"><label>Kategori</label><input name="category" defaultValue={editingPortfolio?.category ?? ""} placeholder="Hard Surface, Environment, Product" required /></div>
              <div className="field wide"><label>Ringkasan SEO</label><textarea name="summary" defaultValue={editingPortfolio?.summary ?? ""} required /></div>
              <div className="field wide"><label>Deskripsi Detail</label><textarea name="description" defaultValue={editingPortfolio?.description ?? ""} required /></div>
              <div className="field"><label>Role</label><input name="role" defaultValue={editingPortfolio?.role ?? ""} placeholder="Modeling, UV, Texture" required /></div>
              <div className="field"><label>Client</label><input name="client" defaultValue={editingPortfolio?.client ?? ""} /></div>
              <div className="field"><label>Tahun</label><input name="year" type="number" min="1990" max="2100" defaultValue={editingPortfolio?.year ?? new Date().getFullYear()} required /></div>
              <RepeaterInput label="Software" name="software" values={editingPortfolio?.software ?? ["Blender"]} placeholder="Blender" />
              <RepeaterInput label="Tags SEO" name="tags" values={editingPortfolio?.tags ?? ["3d asset"]} placeholder="pbr" />
              <div className="field"><label>Upload model .glb/.gltf</label><input name="modelFile" type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" /></div>
              <div className="field"><label>Atau URL model eksternal</label><input name="modelUrl" defaultValue={editingPortfolio?.modelUrl ?? ""} placeholder="https://cdn.example.com/model.glb" /></div>
              <div className="field"><label>Upload thumbnail</label><input name="posterFile" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" /></div>
              <div className="field"><label>Atau URL thumbnail</label><input name="posterUrl" defaultValue={editingPortfolio?.posterUrl ?? ""} /></div>
              <div className="admin-checks wide">
                <label><input name="featured" type="checkbox" defaultChecked={editingPortfolio?.featured ?? false} /> Featured di Home</label>
                <label><input name="published" type="checkbox" defaultChecked={editingPortfolio?.published ?? true} /> Published</label>
              </div>
              <button className="btn primary" type="submit"><Plus size={17} /> {editingPortfolio ? "Simpan Portfolio" : "Publish Portfolio"}</button>
            </form>
          ) : null}

          {activeView === "contact" ? (
            <form action={saveContactAction} className="panel form-grid admin-form">
              <div className="field"><label>WhatsApp</label><input name="whatsapp" defaultValue={profile.whatsapp ?? ""} placeholder="+628..." /></div>
              <div className="field"><label>Email kontak</label><input name="email" type="email" defaultValue={profile.email ?? ""} /></div>
              <div className="field"><label>Instagram</label><input name="instagram" defaultValue={profile.instagram ?? ""} placeholder="https://instagram.com/..." /></div>
              <div className="field"><label>Facebook</label><input name="facebook" defaultValue={profile.facebook ?? ""} /></div>
              <div className="field"><label>TikTok</label><input name="tiktok" defaultValue={profile.tiktok ?? ""} /></div>
              <div className="field"><label>LinkedIn</label><input name="linkedin" defaultValue={profile.linkedin ?? ""} /></div>
              <SocialLinksRepeater links={profile.socialLinks ?? []} />
              <button className="btn primary" type="submit"><Save size={17} /> Simpan Kontak</button>
            </form>
          ) : null}

          {activeView === "design" ? (
            <form action={saveDesignAction} className="panel form-grid admin-form">
              <div className="field"><label>Heading font</label><input name="headingFont" defaultValue={design.headingFont ?? "Trebuchet MS"} /></div>
              <div className="field"><label>Body font</label><input name="bodyFont" defaultValue={design.bodyFont ?? "Inter"} /></div>
              <div className="field"><label>Accent color</label><input name="accentColor" type="color" defaultValue={design.accentColor ?? "#c7ff5a"} /></div>
              <div className="field"><label>Background color</label><input name="backgroundColor" type="color" defaultValue={design.backgroundColor ?? "#05070b"} /></div>
              <div className="field"><label>Text color</label><input name="textColor" type="color" defaultValue={design.textColor ?? "#f7efe4"} /></div>
              <div className="field"><label>Button radius</label><input name="buttonRadius" defaultValue={design.buttonRadius ?? "999px"} /></div>
              <div className="field"><label>H1 size</label><input name="h1Size" defaultValue={design.h1Size ?? "clamp(58px, 12vw, 168px)"} /></div>
              <div className="field"><label>H2 size</label><input name="h2Size" defaultValue={design.h2Size ?? "clamp(38px, 7vw, 94px)"} /></div>
              <div className="field"><label>H3 size</label><input name="h3Size" defaultValue={design.h3Size ?? "clamp(22px, 2.4vw, 34px)"} /></div>
              <div className="field"><label>H4 size</label><input name="h4Size" defaultValue={design.h4Size ?? "24px"} /></div>
              <div className="field"><label>H5 size</label><input name="h5Size" defaultValue={design.h5Size ?? "20px"} /></div>
              <div className="field"><label>H6 size</label><input name="h6Size" defaultValue={design.h6Size ?? "16px"} /></div>
              <div className="field"><label>Body text size</label><input name="bodySize" defaultValue={design.bodySize ?? "16px"} /></div>
              <div className="field"><label>Small/meta size</label><input name="smallSize" defaultValue={design.smallSize ?? "13px"} /></div>
              <div className="field"><label>Button text size</label><input name="buttonSize" defaultValue={design.buttonSize ?? "15px"} /></div>
              <div className="field"><label>Badge text size</label><input name="badgeSize" defaultValue={design.badgeSize ?? "13px"} /></div>
              <button className="btn primary" type="submit"><Save size={17} /> Simpan Design</button>
            </form>
          ) : null}

          {activeView === "portfolio" ? (
          <section className="panel admin-list">
            {!dbPortfolioCount ? (
              <div className="admin-empty-state">
                <div>
                  <strong>Portfolio website depan masih memakai data demo.</strong>
                  <p className="meta">Klik tombol ini untuk memasukkan 3 portfolio demo ke MongoDB agar bisa diedit permanen dari CMS.</p>
                </div>
                <form action={seedDemoPortfoliosAction}>
                  <button className="btn primary" type="submit"><Plus size={17} /> Masukkan Demo ke CMS</button>
                </form>
              </div>
            ) : null}
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Model</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePortfolios.map((item) => (
                    <tr key={item.id}>
                      <td><Link href={`/portfolio/${item.slug}`}>{item.title}</Link></td>
                      <td>{item.category}</td>
                      <td>{item.id.startsWith("demo-") ? "Demo" : item.published ? "Published" : "Draft"}</td>
                      <td>{item.modelUrl}</td>
                      <td>
                        <div className="table-actions">
                          <Link className="btn secondary" href={`/admin?view=edit&id=${item.id}`}><Edit3 size={16} /> Edit</Link>
                          {!item.id.startsWith("demo-") ? (
                            <form action={deletePortfolioAction}>
                              <input name="id" type="hidden" value={item.id} />
                              <button className="btn secondary" type="submit"><Trash2 size={16} /> Hapus</button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}

async function getMediaItems() {
  const roots = [
    { dir: path.join(process.cwd(), "public", "uploads", "images"), base: "/uploads/images", kind: "image" as const },
    { dir: path.join(process.cwd(), "public", "uploads", "models"), base: "/uploads/models", kind: "model" as const }
  ];
  const items = await Promise.all(
    roots.map(async (root) => {
      try {
        const files = await readdir(root.dir);
        return files.map((name) => ({ name, url: `${root.base}/${name}`, kind: root.kind }));
      } catch {
        return [];
      }
    })
  );
  return items.flat();
}

function PageFields({ pageKey, page }: { pageKey: (typeof pageKeys)[number]; page: NonNullable<SerializedProfile["pages"]>[typeof pageKey] }) {
  const currentPage = (page ?? {}) as Record<string, string | undefined>;
  if (pageKey === "home") {
    return (
      <fieldset className="field-group wide">
        <legend>Home Content</legend>
        <TextField pageKey={pageKey} field="heroHeadline" label="Hero H1 / main headline" page={currentPage} wide />
        <TextField pageKey={pageKey} field="heroSubheadline" label="Hero subheadline" page={currentPage} wide textarea />
        <TextField pageKey={pageKey} field="primaryCtaText" label="Primary CTA text" page={currentPage} />
        <TextField pageKey={pageKey} field="primaryCtaLink" label="Primary CTA link" page={currentPage} />
        <TextField pageKey={pageKey} field="secondaryCtaText" label="Secondary CTA text" page={currentPage} />
        <TextField pageKey={pageKey} field="secondaryCtaLink" label="Secondary CTA link" page={currentPage} />
        <TextField pageKey={pageKey} field="scrollCueText" label="Scroll cue text" page={currentPage} />
        <TextField pageKey={pageKey} field="liveStageEyebrow" label="Live stage eyebrow" page={currentPage} />
        <TextField pageKey={pageKey} field="liveStageTitle" label="Live stage title" page={currentPage} wide />
        <TextField pageKey={pageKey} field="liveStageMeta" label="Live stage meta" page={currentPage} wide />
        <TextField pageKey={pageKey} field="storyEyebrow" label="Story eyebrow text" page={currentPage} />
        <TextField pageKey={pageKey} field="servicesTitle" label="Services section title" page={currentPage} />
        <TextField pageKey={pageKey} field="servicesDescription" label="Services section description" page={currentPage} wide textarea />
        <TextField pageKey={pageKey} field="servicesPanelTitle" label="Services panel title" page={currentPage} />
        <TextField pageKey={pageKey} field="skillsPanelTitle" label="Skills panel title" page={currentPage} />
        <TextField pageKey={pageKey} field="featuresTitle" label="Features section title" page={currentPage} />
        <TextField pageKey={pageKey} field="featuresDescription" label="Features section description" page={currentPage} wide textarea />
        <TextField pageKey={pageKey} field="portfolioTitle" label="Portfolio section title" page={currentPage} />
        <TextField pageKey={pageKey} field="portfolioButtonText" label="Portfolio button text" page={currentPage} />
        <TextField pageKey={pageKey} field="testimonialsTitle" label="Testimonials title" page={currentPage} />
        <TextField pageKey={pageKey} field="testimonialsDescription" label="Testimonials description" page={currentPage} wide textarea />
        <TextField pageKey={pageKey} field="ctaEyebrow" label="CTA eyebrow" page={currentPage} />
      </fieldset>
    );
  }

  if (pageKey === "portfolio") {
    return (
      <fieldset className="field-group wide">
        <legend>Portfolio Content</legend>
        <TextField pageKey={pageKey} field="allCategoryLabel" label="All category label" page={currentPage} />
        <TextField pageKey={pageKey} field="emptyText" label="Empty state text" page={currentPage} wide />
        <TextField pageKey={pageKey} field="detailNotesTitle" label="Detail notes title" page={currentPage} />
        <TextField pageKey={pageKey} field="detailRoleLabel" label="Detail role label" page={currentPage} />
        <TextField pageKey={pageKey} field="detailYearLabel" label="Detail year label" page={currentPage} />
        <TextField pageKey={pageKey} field="detailClientLabel" label="Detail client label" page={currentPage} />
        <TextField pageKey={pageKey} field="detailViewerLoadingText" label="Viewer loading text" page={currentPage} />
        <TextField pageKey={pageKey} field="detailViewerHintText" label="Viewer hint text" page={currentPage} />
        <TextField pageKey={pageKey} field="detailLoadingBadgeText" label="3D loading badge text" page={currentPage} />
        <TextField pageKey={pageKey} field="detailPreviewCategoryLabel" label="Fallback preview category label" page={currentPage} />
      </fieldset>
    );
  }

  if (pageKey === "about") {
    return (
      <fieldset className="field-group wide">
        <legend>About Content</legend>
        <TextField pageKey={pageKey} field="experienceTitle" label="Experience title" page={currentPage} />
        <TextField pageKey={pageKey} field="experienceDescription" label="Experience description" page={currentPage} wide textarea />
        <TextField pageKey={pageKey} field="servicesTitle" label="Services title" page={currentPage} />
        <TextField pageKey={pageKey} field="skillsTitle" label="Skills title" page={currentPage} />
      </fieldset>
    );
  }

  return (
    <fieldset className="field-group wide">
      <legend>Contact Content</legend>
      <TextField pageKey={pageKey} field="socialsTitle" label="Social links title" page={currentPage} />
      <TextField pageKey={pageKey} field="socialsDescription" label="Social links description" page={currentPage} wide textarea />
      <TextField pageKey={pageKey} field="whatsappLabel" label="WhatsApp button label" page={currentPage} />
      <TextField pageKey={pageKey} field="emailLabel" label="Email button label" page={currentPage} />
    </fieldset>
  );
}

function TextField({
  pageKey,
  field,
  label,
  page,
  wide,
  textarea
}: {
  pageKey: string;
  field: string;
  label: string;
  page: Record<string, string | undefined>;
  wide?: boolean;
  textarea?: boolean;
}) {
  const name = `${pageKey}${field[0].toUpperCase()}${field.slice(1)}`;
  return (
    <div className={wide ? "field wide" : "field"}>
      <label>{label}</label>
      {textarea ? <textarea name={name} defaultValue={page[field] ?? ""} /> : <input name={name} defaultValue={page[field] ?? ""} />}
    </div>
  );
}
