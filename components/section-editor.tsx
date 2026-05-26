"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SerializedProfile } from "@/lib/mongodb";

type Sections = NonNullable<SerializedProfile["sections"]>;
type Stat = NonNullable<Sections["stats"]>[number];
type Step = NonNullable<NonNullable<Sections["story"]>["steps"]>[number];
type Feature = NonNullable<Sections["features"]>[number];

const sectionLabels: Record<string, string> = {
  stats: "Stats",
  story: "Story",
  services: "Services",
  features: "Asset Superpowers",
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  cta: "CTA"
};

function swap(items: string[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function SectionEditor({ sections = {}, action, embedded = false }: { sections?: Sections; action: (formData: FormData) => void; embedded?: boolean }) {
  const [hero, setHero] = useState(sections.hero ?? {});
  const [stats, setStats] = useState<Stat[]>(sections.stats ?? []);
  const [story, setStory] = useState(sections.story ?? {});
  const [steps, setSteps] = useState<Step[]>(sections.story?.steps ?? []);
  const [features, setFeatures] = useState<Feature[]>(sections.features ?? []);
  const [cta, setCta] = useState(sections.cta ?? {});
  const [order, setOrder] = useState(sections.sectionOrder?.length ? sections.sectionOrder : Object.keys(sectionLabels));

  const payload = useMemo(
    () => JSON.stringify({ hero, stats, story: { ...story, steps }, features, cta, sectionOrder: order }),
    [hero, stats, story, steps, features, cta, order]
  );

  return (
    <form action={action} className={embedded ? "section-editor-embedded form-grid admin-form" : "panel form-grid admin-form"}>
      <input name="sections" type="hidden" value={payload} />
      <fieldset className="field-group wide">
        <legend>Hero</legend>
        <div className="field"><label>Headline</label><input value={hero.headline ?? ""} onChange={(event) => setHero({ ...hero, headline: event.target.value })} /></div>
        <div className="field"><label>CTA text</label><input value={hero.ctaText ?? ""} onChange={(event) => setHero({ ...hero, ctaText: event.target.value })} /></div>
        <div className="field wide"><label>Subheadline</label><textarea value={hero.subheadline ?? ""} onChange={(event) => setHero({ ...hero, subheadline: event.target.value })} /></div>
        <div className="field"><label>CTA link</label><input value={hero.ctaLink ?? ""} onChange={(event) => setHero({ ...hero, ctaLink: event.target.value })} /></div>
        <label className="toggle-row"><input type="checkbox" checked={hero.showScene ?? true} onChange={(event) => setHero({ ...hero, showScene: event.target.checked })} /> Tampilkan scene 3D</label>
      </fieldset>

      <fieldset className="field-group wide">
        <legend>Section order</legend>
        <div className="repeater-list wide">
          {order.map((item, index) => (
            <div className="order-row" key={item}>
              <strong>{sectionLabels[item] ?? item}</strong>
              <button type="button" aria-label="Naik" onClick={() => setOrder((current) => swap(current, index, -1))}><ArrowUp size={16} /></button>
              <button type="button" aria-label="Turun" onClick={() => setOrder((current) => swap(current, index, 1))}><ArrowDown size={16} /></button>
            </div>
          ))}
        </div>
      </fieldset>

      <Repeater title="Stats" items={stats} setItems={setStats} empty={{ value: "", label: "", icon: "" }} fields={["value", "label", "icon"]} />
      <fieldset className="field-group wide">
        <legend>Story</legend>
        <div className="field"><label>Title</label><input value={story.title ?? ""} onChange={(event) => setStory({ ...story, title: event.target.value })} /></div>
        <div className="field wide"><label>Subtitle</label><textarea value={story.subtitle ?? ""} onChange={(event) => setStory({ ...story, subtitle: event.target.value })} /></div>
      </fieldset>
      <Repeater title="Story Steps" items={steps} setItems={setSteps} empty={{ number: "", title: "", description: "" }} fields={["number", "title", "description"]} />
      <Repeater title="Features" items={features} setItems={setFeatures} empty={{ title: "", description: "", icon: "" }} fields={["title", "description", "icon"]} />

      <fieldset className="field-group wide">
        <legend>CTA</legend>
        <div className="field"><label>Title</label><input value={cta.title ?? ""} onChange={(event) => setCta({ ...cta, title: event.target.value })} /></div>
        <div className="field"><label>Button text</label><input value={cta.buttonText ?? ""} onChange={(event) => setCta({ ...cta, buttonText: event.target.value })} /></div>
        <div className="field wide"><label>Description</label><textarea value={cta.description ?? ""} onChange={(event) => setCta({ ...cta, description: event.target.value })} /></div>
        <div className="field wide"><label>Button link</label><input value={cta.buttonLink ?? ""} onChange={(event) => setCta({ ...cta, buttonLink: event.target.value })} /></div>
      </fieldset>

      <button className="btn primary" type="submit"><Save size={17} /> Simpan Sections</button>
    </form>
  );
}

function Repeater<T extends Record<string, string | undefined>>({
  title,
  items,
  setItems,
  empty,
  fields
}: {
  title: string;
  items: T[];
  setItems: (items: T[]) => void;
  empty: T;
  fields: Array<keyof T>;
}) {
  return (
    <fieldset className="field-group wide">
      <legend>{title}</legend>
      <div className="repeater-list wide">
        {items.map((item, index) => (
          <div className="nested-row" key={`${title}-${index}`}>
            {fields.map((field) => (
              <div className="field" key={String(field)}>
                <label>{String(field)}</label>
                <input value={item[field] ?? ""} onChange={(event) => setItems(items.map((current, itemIndex) => (itemIndex === index ? { ...current, [field]: event.target.value } : current)))} />
              </div>
            ))}
            <button className="icon-btn danger" type="button" aria-label="Hapus item" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <button className="btn secondary repeater-add" type="button" onClick={() => setItems([...items, empty])}><Plus size={16} /> Tambah {title}</button>
    </fieldset>
  );
}
