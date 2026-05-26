"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SerializedProfile } from "@/lib/mongodb";

type Testimonial = NonNullable<SerializedProfile["testimonials"]>[number];

export function TestimonialEditor({ testimonials = [], action }: { testimonials?: Testimonial[]; action: (formData: FormData) => void }) {
  const [items, setItems] = useState<Testimonial[]>(testimonials.length ? testimonials : [{ name: "", role: "", text: "", avatar: "" }]);
  const payload = useMemo(() => JSON.stringify(items.filter((item) => item.name || item.text)), [items]);

  return (
    <form action={action} className="panel form-grid admin-form">
      <input name="testimonials" type="hidden" value={payload} />
      <div className="editor-grid wide">
        {items.map((item, index) => (
          <article className="mini-card" key={`testimonial-${index}`}>
            <div className="field"><label>Nama</label><input value={item.name} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, name: event.target.value } : current)))} /></div>
            <div className="field"><label>Role</label><input value={item.role} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, role: event.target.value } : current)))} /></div>
            <div className="field"><label>Upload avatar</label><input name={`testimonialAvatarFile${index}`} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" /></div>
            <div className="field"><label>Atau avatar URL</label><input value={item.avatar ?? ""} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, avatar: event.target.value } : current)))} /></div>
            <div className="field wide"><label>Quote</label><textarea value={item.text} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, text: event.target.value } : current)))} /></div>
            <button className="btn secondary" type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /> Hapus</button>
          </article>
        ))}
      </div>
      <button className="btn secondary" type="button" onClick={() => setItems([...items, { name: "", role: "", text: "", avatar: "" }])}><Plus size={16} /> Tambah Testimonial</button>
      <button className="btn primary" type="submit"><Save size={17} /> Simpan Testimonials</button>
    </form>
  );
}
