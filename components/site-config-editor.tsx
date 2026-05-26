"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SerializedProfile } from "@/lib/mongodb";

type Footer = NonNullable<SerializedProfile["footer"]>;
type FooterColumn = NonNullable<Footer["columns"]>[number];
type Nav = NonNullable<SerializedProfile["navigation"]>;
type NavItem = NonNullable<Nav["items"]>[number];
type Seo = NonNullable<SerializedProfile["seo"]>;

export function FooterEditor({ footer = {}, action }: { footer?: Footer; action: (formData: FormData) => void }) {
  const [data, setData] = useState<Footer>(footer);
  const [columns, setColumns] = useState<FooterColumn[]>(footer.columns ?? []);
  const payload = useMemo(() => JSON.stringify({ ...data, columns }), [data, columns]);

  return (
    <form action={action} className="panel form-grid admin-form">
      <input name="footer" type="hidden" value={payload} />
      <div className="field"><label>Brand text besar</label><input value={data.brandText ?? ""} onChange={(event) => setData({ ...data, brandText: event.target.value })} /></div>
      <div className="field"><label>Copyright</label><input value={data.copyright ?? ""} onChange={(event) => setData({ ...data, copyright: event.target.value })} /></div>
      <div className="field wide"><label>Tagline</label><textarea value={data.tagline ?? ""} onChange={(event) => setData({ ...data, tagline: event.target.value })} /></div>
      <label className="toggle-row wide"><input type="checkbox" checked={data.showNewsletter ?? true} onChange={(event) => setData({ ...data, showNewsletter: event.target.checked })} /> Tampilkan newsletter placeholder</label>
      <div className="editor-grid wide">
        {columns.map((column, columnIndex) => (
          <article className="mini-card" key={`column-${columnIndex}`}>
            <div className="field"><label>Judul kolom</label><input value={column.title} onChange={(event) => setColumns(columns.map((current, index) => (index === columnIndex ? { ...current, title: event.target.value } : current)))} /></div>
            {(column.links ?? []).map((link, linkIndex) => (
              <div className="nested-row" key={`link-${columnIndex}-${linkIndex}`}>
                <input value={link.label} placeholder="Label" onChange={(event) => updateFooterLink(columns, setColumns, columnIndex, linkIndex, "label", event.target.value)} />
                <input value={link.url} placeholder="/url" onChange={(event) => updateFooterLink(columns, setColumns, columnIndex, linkIndex, "url", event.target.value)} />
                <button className="icon-btn danger" type="button" aria-label="Hapus link" onClick={() => setColumns(columns.map((current, index) => (index === columnIndex ? { ...current, links: current.links.filter((_, itemIndex) => itemIndex !== linkIndex) } : current)))}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn secondary" type="button" onClick={() => setColumns(columns.map((current, index) => (index === columnIndex ? { ...current, links: [...(current.links ?? []), { label: "", url: "" }] } : current)))}><Plus size={16} /> Tambah link</button>
          </article>
        ))}
      </div>
      <button className="btn secondary" type="button" onClick={() => setColumns([...columns, { title: "", links: [{ label: "", url: "" }] }])}><Plus size={16} /> Tambah Kolom</button>
      <button className="btn primary" type="submit"><Save size={17} /> Simpan Footer</button>
    </form>
  );
}

export function NavigationEditor({ navigation = {}, action }: { navigation?: Nav; action: (formData: FormData) => void }) {
  const [data, setData] = useState<Nav>(navigation);
  const [items, setItems] = useState<NavItem[]>(navigation.items ?? []);
  const payload = useMemo(() => JSON.stringify({ ...data, items }), [data, items]);

  return (
    <form action={action} className="panel form-grid admin-form">
      <input name="navigation" type="hidden" value={payload} />
      <div className="field"><label>Brand</label><input value={data.brand ?? ""} onChange={(event) => setData({ ...data, brand: event.target.value })} /></div>
      <div className="field"><label>Upload logo</label><input name="logoFile" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" /></div>
      <div className="field wide"><label>Atau logo URL</label><input value={data.logo ?? ""} onChange={(event) => setData({ ...data, logo: event.target.value })} /></div>
      <div className="editor-grid wide">
        {items.map((item, index) => (
          <article className="mini-card" key={`nav-${index}`}>
            <div className="field"><label>Label</label><input value={item.label} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, label: event.target.value } : current)))} /></div>
            <div className="field"><label>URL</label><input value={item.url} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, url: event.target.value } : current)))} /></div>
            <label className="toggle-row"><input type="checkbox" checked={item.isExternal ?? false} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, isExternal: event.target.checked } : current)))} /> External</label>
            <button className="btn secondary" type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /> Hapus</button>
          </article>
        ))}
      </div>
      <button className="btn secondary" type="button" onClick={() => setItems([...items, { label: "", url: "", isExternal: false }])}><Plus size={16} /> Tambah Nav</button>
      <button className="btn primary" type="submit"><Save size={17} /> Simpan Navigation</button>
    </form>
  );
}

export function SeoEditor({ seo = {}, action }: { seo?: Seo; action: (formData: FormData) => void }) {
  const [data, setData] = useState<Seo>(seo);
  const keys = ["home", "portfolio", "about", "contact"] as const;
  const payload = useMemo(() => JSON.stringify(data), [data]);

  return (
    <form action={action} className="panel form-grid admin-form">
      <input name="seo" type="hidden" value={payload} />
      {keys.map((key) => (
        <fieldset className="field-group wide" key={key}>
          <legend>{key[0].toUpperCase() + key.slice(1)}</legend>
          <div className="field"><label>Title</label><input value={data[key]?.title ?? ""} onChange={(event) => setData({ ...data, [key]: { ...data[key], title: event.target.value } })} /></div>
          <div className="field"><label>Upload OG image</label><input name={`${key}OgFile`} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" /></div>
          <div className="field"><label>Atau OG image URL</label><input value={data[key]?.ogImage ?? ""} onChange={(event) => setData({ ...data, [key]: { ...data[key], ogImage: event.target.value } })} /></div>
          <div className="field wide"><label>Description</label><textarea value={data[key]?.description ?? ""} onChange={(event) => setData({ ...data, [key]: { ...data[key], description: event.target.value } })} /></div>
        </fieldset>
      ))}
      <button className="btn primary" type="submit"><Save size={17} /> Simpan SEO</button>
    </form>
  );
}

function updateFooterLink(columns: FooterColumn[], setColumns: (columns: FooterColumn[]) => void, columnIndex: number, linkIndex: number, field: "label" | "url", value: string) {
  setColumns(
    columns.map((column, index) =>
      index === columnIndex
        ? { ...column, links: column.links.map((link, itemIndex) => (itemIndex === linkIndex ? { ...link, [field]: value } : link)) }
        : column
    )
  );
}
