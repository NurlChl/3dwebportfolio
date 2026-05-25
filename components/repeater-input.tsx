"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

type RepeaterInputProps = {
  label: string;
  name: string;
  values?: string[];
  placeholder?: string;
};

export function RepeaterInput({ label, name, values = [""], placeholder }: RepeaterInputProps) {
  const [items, setItems] = useState(values.length ? values : [""]);

  return (
    <div className="field wide">
      <label>{label}</label>
      <div className="repeater-list">
        {items.map((value, index) => (
          <div className="repeater-row" key={`${name}-${index}`}>
            <input name={name} defaultValue={value} placeholder={placeholder} />
            <button type="button" aria-label="Hapus item" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn secondary repeater-add" type="button" onClick={() => setItems((current) => [...current, ""])}>
        <Plus size={16} /> Tambah
      </button>
    </div>
  );
}

type SocialLinksRepeaterProps = {
  links?: Array<{ label: string; url: string }>;
};

export function SocialLinksRepeater({ links = [] }: SocialLinksRepeaterProps) {
  const [items, setItems] = useState(links.length ? links : [{ label: "", url: "" }]);

  return (
    <div className="field wide">
      <label>Link sosial tambahan</label>
      <div className="repeater-list">
        {items.map((item, index) => (
          <div className="social-row" key={`social-${index}`}>
            <input name="socialLabel" defaultValue={item.label} placeholder="Nama platform" />
            <input name="socialUrl" defaultValue={item.url} placeholder="https://..." />
            <button type="button" aria-label="Hapus sosial" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn secondary repeater-add" type="button" onClick={() => setItems((current) => [...current, { label: "", url: "" }])}>
        <Plus size={16} /> Tambah sosial
      </button>
    </div>
  );
}
