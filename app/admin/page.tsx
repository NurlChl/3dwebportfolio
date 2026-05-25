import Link from "next/link";
import { Contact, Edit3, FileText, FolderKanban, LogOut, Palette, Plus, Save, Settings, Trash2, UserRound } from "lucide-react";
import { deletePortfolioAction, logoutAction, saveContactAction, saveDesignAction, savePagesAction, savePortfolioAction, saveProfileAction } from "@/app/admin/actions";
import { getAllPortfoliosForAdmin, getFallbackPortfolios, getFallbackProfile } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import { profileCollection, serializeDoc } from "@/lib/mongodb";
import { RepeaterInput, SocialLinksRepeater } from "@/components/repeater-input";

export const dynamic = "force-dynamic";

type AdminView = "profile" | "pages" | "new" | "edit" | "portfolio" | "contact" | "design";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string; updated?: string; id?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const activeView: AdminView =
    params.view === "pages" || params.view === "new" || params.view === "edit" || params.view === "portfolio" || params.view === "contact" || params.view === "design" ? params.view : "profile";
  let profile = getFallbackProfile();
  let portfolios = getFallbackPortfolios();
  let dbOffline = false;

  try {
    const [profileDoc, portfolioItems] = await Promise.all([(await profileCollection()).findOne({}), getAllPortfoliosForAdmin()]);
    profile = profileDoc ? serializeDoc(profileDoc) : profile;
    portfolios = portfolioItems;
  } catch {
    dbOffline = true;
  }
  const editingPortfolio = activeView === "edit" ? portfolios.find((item) => item.id === params.id) : null;
  const design = profile.design ?? {};
  const pages = profile.pages ?? {};

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
            <Link className={activeView === "pages" ? "active" : ""} href="/admin?view=pages">
              <FileText size={18} /> Pages
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
                    ? "Pages"
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
                  ? "Ubah teks utama dan media pendukung untuk halaman Home, Portfolio, About, dan Contact."
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

          {activeView === "pages" ? (
            <form action={savePagesAction} className="panel form-grid admin-form">
              {(["home", "portfolio", "about", "contact"] as const).map((key) => (
                <fieldset className="field-group wide" key={key}>
                  <legend>{key[0].toUpperCase() + key.slice(1)}</legend>
                  <div className="field"><label>Eyebrow</label><input name={`${key}Eyebrow`} defaultValue={pages[key]?.eyebrow ?? ""} /></div>
                  <div className="field"><label>Title</label><input name={`${key}Title`} defaultValue={pages[key]?.title ?? ""} /></div>
                  <div className="field wide"><label>Description</label><textarea name={`${key}Description`} defaultValue={pages[key]?.description ?? ""} /></div>
                  <div className="field wide"><label>Image URL</label><input name={`${key}ImageUrl`} defaultValue={pages[key]?.imageUrl ?? ""} placeholder="/uploads/images/hero.webp" /></div>
                </fieldset>
              ))}
              <button className="btn primary" type="submit"><Save size={17} /> Simpan Pages</button>
            </form>
          ) : null}

          {activeView === "new" || activeView === "edit" ? (
            <form action={savePortfolioAction} className="panel form-grid admin-form" encType="multipart/form-data">
              {editingPortfolio ? <input name="id" type="hidden" value={editingPortfolio.id} /> : null}
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
                  {portfolios.map((item) => (
                    <tr key={item.id}>
                      <td><Link href={`/portfolio/${item.slug}`}>{item.title}</Link></td>
                      <td>{item.category}</td>
                      <td>{item.published ? "Published" : "Draft"}</td>
                      <td>{item.modelUrl}</td>
                      <td>
                        <div className="table-actions">
                          <Link className="btn secondary" href={`/admin?view=edit&id=${item.id}`}><Edit3 size={16} /> Edit</Link>
                          <form action={deletePortfolioAction}>
                            <input name="id" type="hidden" value={item.id} />
                            <button className="btn secondary" type="submit"><Trash2 size={16} /> Hapus</button>
                          </form>
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
