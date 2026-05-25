import { cache } from "react";
import {
  portfoliosCollection,
  profileCollection,
  serializeDoc,
  type SerializedPortfolio,
  type SerializedProfile
} from "@/lib/mongodb";

const fallbackPortfolio: SerializedPortfolio[] = [
  {
    id: "demo-drone",
    title: "Orbital Workshop Drone",
    slug: "orbital-workshop-drone",
    summary: "Asset drone hard-surface dengan material PBR dan proporsi industrial sci-fi.",
    description: "Model preview demo memakai procedural geometry jika file GLB belum diunggah melalui CMS.",
    role: "Modeling, UV, texture, lookdev",
    client: "Personal Project",
    year: 2026,
    category: "Hard Surface",
    software: ["Blender", "Substance Painter", "Three.js"],
    tags: ["drone", "sci-fi", "pbr"],
    modelUrl: "/models/drone.glb",
    posterUrl: null,
    featured: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "demo-shrine",
    title: "Forest Shrine Kit",
    slug: "forest-shrine-kit",
    summary: "Modular environment kit untuk scene stylized fantasy.",
    description: "Kit environment untuk Blender dan Unreal dengan modul yang mudah dikombinasikan.",
    role: "Environment modeling, modular kit, material pass",
    client: "Studio Prototype",
    year: 2025,
    category: "Environment",
    software: ["Blender", "Unreal Engine"],
    tags: ["environment", "stylized", "modular"],
    modelUrl: "/models/shrine.glb",
    posterUrl: null,
    featured: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "demo-console",
    title: "Compact Retro Console",
    slug: "compact-retro-console",
    summary: "Product-style 3D asset dengan bentuk playful dan material clean.",
    description: "Asset product showcase realtime yang ringan untuk web portfolio.",
    role: "Product modeling, lighting, optimization",
    client: "Commercial Concept",
    year: 2026,
    category: "Product",
    software: ["Blender", "Three.js"],
    tags: ["product", "console", "realtime"],
    modelUrl: "/models/console.glb",
    posterUrl: null,
    featured: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const fallbackProfile: SerializedProfile = {
  id: "demo-profile",
  name: "Arka Wisesa",
  title: "3D Artist, Blender Generalist, Realtime Asset Creator",
  bio: "Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience.",
  location: "Jakarta, Indonesia",
  email: "hello@arkawisesa.studio",
  experience: "6+ tahun mengerjakan hard-surface, stylized environment, props, dan pipeline Blender ke Unreal Engine.",
  services: ["3D Modeling", "Texture & Lookdev", "Realtime Asset Optimization", "Unreal Engine Scene Setup"],
  skills: ["Blender", "Unreal Engine", "Substance Painter", "Three.js", "GLB/GLTF", "PBR Workflow"],
  whatsapp: "+6281234567890",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/",
  linkedin: "https://linkedin.com/",
  socialLinks: [],
  pages: {
    home: { eyebrow: "Realtime 3D Portfolio", title: "Arka Wisesa", description: "3D Artist, Blender Generalist, Realtime Asset Creator. Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience." },
    portfolio: { eyebrow: "Browse Work", title: "Portfolio 3D", description: "Filter karya berdasarkan kategori dan buka detail untuk melihat model 3D secara interaktif." },
    about: { eyebrow: "About The Artist", title: "Arka Wisesa", description: "Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience." },
    contact: { eyebrow: "Start A Project", title: "Contact", description: "Kirim brief asset, kebutuhan realtime preview, atau pipeline Blender/Unreal yang ingin dibangun." }
  },
  design: {
    headingFont: "Trebuchet MS",
    bodyFont: "Inter",
    accentColor: "#c7ff5a",
    backgroundColor: "#05070b",
    textColor: "#f7efe4",
    buttonRadius: "999px",
    h1Size: "clamp(58px, 12vw, 168px)",
    h2Size: "clamp(38px, 7vw, 94px)",
    h3Size: "clamp(22px, 2.4vw, 34px)",
    h4Size: "24px",
    h5Size: "20px",
    h6Size: "16px",
    bodySize: "16px",
    smallSize: "13px",
    buttonSize: "15px",
    badgeSize: "13px"
  },
  updatedAt: new Date()
};

export function getFallbackProfile() {
  return fallbackProfile;
}

export function getFallbackPortfolios() {
  return fallbackPortfolio;
}

export const getProfile = cache(async () => {
  try {
    const profile = await (await profileCollection()).findOne({});
    return profile ? serializeDoc(profile) : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
});

export const getPublishedPortfolios = cache(async () => {
  try {
    const items = await (await portfoliosCollection())
      .find({ published: true })
      .sort({ featured: -1, createdAt: -1 })
      .toArray();
    return items.length ? items.map(serializeDoc) : fallbackPortfolio;
  } catch {
    return fallbackPortfolio;
  }
});

export async function getAllPortfoliosForAdmin() {
  const items = await (await portfoliosCollection()).find({}).sort({ updatedAt: -1 }).toArray();
  return items.map(serializeDoc);
}

export async function getPortfolioBySlug(slug: string) {
  const items = await getPublishedPortfolios();
  return items.find((item) => item.slug === slug) ?? null;
}
