import { cache } from "react";
import { getStructuredProfile } from "@/lib/cms-store";
import {
  portfoliosCollection,
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
    home: {
      eyebrow: "Realtime 3D Portfolio",
      title: "Arka Wisesa",
      description: "3D Artist, Blender Generalist, Realtime Asset Creator. Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience.",
      heroHeadline: "3D worlds that feel ready to touch.",
      heroSubheadline: "Portfolio interaktif untuk asset Blender, Unreal Engine, GLB, dan product visual yang bisa dikelola penuh dari CMS.",
      primaryCtaText: "Lihat Portfolio",
      primaryCtaLink: "/portfolio",
      secondaryCtaText: "Profil Artist",
      secondaryCtaLink: "/about",
      scrollCueText: "Scroll to start",
      liveStageEyebrow: "Live Asset Stage",
      liveStageTitle: "Orbit-ready models, built for web.",
      liveStageMeta: "Blender / Unreal / GLB / PBR / Three.js",
      storyEyebrow: "Where assets",
      servicesTitle: "Service & Skill",
      servicesDescription: "Pipeline dirancang untuk asset yang enak dilihat, mudah dipakai ulang, dan cukup ringan untuk realtime web viewer.",
      servicesPanelTitle: "Services",
      skillsPanelTitle: "Core Software",
      featuresTitle: "Asset Superpowers",
      featuresDescription: "Playful seperti papercraft, tapi tetap presisi untuk showcase produk, game prototype, dan web viewer.",
      portfolioTitle: "Portfolio Terbaru",
      portfolioButtonText: "Semua karya",
      testimonialsTitle: "Client Notes",
      testimonialsDescription: "Trust signal ringan untuk menunjukkan bagaimana asset 3D dipakai di pitching, prototype, dan product showcase.",
      ctaEyebrow: "Launch ready"
    },
    portfolio: {
      eyebrow: "Browse Work",
      title: "Portfolio 3D",
      description: "Filter karya berdasarkan kategori dan buka detail untuk melihat model 3D secara interaktif.",
      allCategoryLabel: "All",
      emptyText: "Belum ada portfolio untuk kategori ini.",
      detailNotesTitle: "Project Notes",
      detailRoleLabel: "Role",
      detailYearLabel: "Year",
      detailClientLabel: "Client",
      detailViewerLoadingText: "Preparing realtime 3D preview",
      detailViewerHintText: "Drag to orbit / Scroll to zoom",
      detailLoadingBadgeText: "Loading 3D",
      detailPreviewCategoryLabel: "3D model"
    },
    about: {
      eyebrow: "About The Artist",
      title: "Arka Wisesa",
      description: "Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience.",
      experienceTitle: "Experience",
      experienceDescription: "Terbiasa mengolah bentuk dari blocking sampai final asset, menjaga topology, UV, material PBR, dan export GLB/FBX untuk berbagai kebutuhan.",
      servicesTitle: "Services",
      skillsTitle: "Skills"
    },
    contact: {
      eyebrow: "Start A Project",
      title: "Contact",
      description: "Kirim brief asset, kebutuhan realtime preview, atau pipeline Blender/Unreal yang ingin dibangun.",
      socialsTitle: "Social Links",
      socialsDescription: "Semua kanal sosial bisa ditambah dan diubah dari CMS.",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email"
    }
  },
  sections: {
    hero: {
      headline: "3D worlds that feel ready to touch.",
      subheadline: "Portfolio interaktif untuk asset Blender, Unreal Engine, GLB, dan product visual yang bisa dikelola penuh dari CMS.",
      ctaText: "Lihat Portfolio",
      ctaLink: "/portfolio",
      showScene: true
    },
    stats: [
      { value: "6+", label: "Tahun produksi asset 3D", icon: "BadgeCheck" },
      { value: "GLB", label: "Preview langsung di browser", icon: "Cuboid" },
      { value: "PBR", label: "Texture workflow siap engine", icon: "Sparkles" },
      { value: "SEO", label: "Structured pages dan sitemap", icon: "FileText" }
    ],
    story: {
      title: "Come Alive",
      subtitle: "Setiap karya disiapkan sebagai experience kecil: bisa diputar, diperiksa materialnya, dan dibaca proses pembuatannya langsung dari browser.",
      steps: [
        { number: "01", title: "Model", description: "Blocking, silhouette, topology, dan bentuk utama yang siap produksi." },
        { number: "02", title: "Texture", description: "Material PBR, warna, roughness, dan detail yang tetap terbaca realtime." },
        { number: "03", title: "Publish", description: "GLB/GLTF ringan untuk web, Unreal preview, dan CMS portfolio." }
      ]
    },
    features: [
      { title: "Realtime Ready", description: "GLB/GLTF ringan, orbit control, dan material tetap tajam.", icon: "Cuboid" },
      { title: "Engine Friendly", description: "Struktur asset siap dipindah ke Unreal atau pipeline game.", icon: "BadgeCheck" },
      { title: "Craft Detail", description: "Bentuk, warna, dan surface dibuat terasa handcrafted, bukan generik.", icon: "Sparkles" },
      { title: "CMS Publish", description: "Upload model, isi metadata SEO, publish karya tanpa sentuh code.", icon: "FileText" }
    ],
    cta: {
      title: "Ready to stage your next 3D asset?",
      description: "Kirim brief, upload reference, dan mulai dari model hero sampai realtime viewer yang siap publish.",
      buttonText: "Mulai Project",
      buttonLink: "/contact"
    },
    sectionOrder: ["stats", "story", "services", "features", "portfolio", "testimonials", "cta"]
  },
  testimonials: [
    { name: "Maya R.", role: "Creative Producer", text: "Asset preview-nya langsung enak dipakai untuk pitching. Klien bisa melihat bentuk dan material tanpa menunggu render tambahan." },
    { name: "Dimas P.", role: "Game Prototype Lead", text: "Pipeline GLB dan texture-nya rapi. Export ke engine jadi jauh lebih singkat dan konsisten." },
    { name: "Nadia S.", role: "Product Designer", text: "Visualnya punya rasa handcrafted, tapi tetap bersih dan profesional untuk showcase produk." }
  ],
  footer: {
    brandText: "IMAGINE",
    tagline: "Realtime 3D portfolio, interactive product staging, and CMS-ready publishing.",
    columns: [
      { title: "Explore", links: [{ label: "Portfolio", url: "/portfolio" }, { label: "About", url: "/about" }, { label: "Contact", url: "/contact" }] },
      { title: "Services", links: [{ label: "3D Modeling", url: "/about" }, { label: "Realtime Viewer", url: "/portfolio" }, { label: "CMS Publishing", url: "/admin/login" }] }
    ],
    copyright: "Arka Wisesa Studio. Built for realtime 3D portfolio publishing.",
    showNewsletter: true
  },
  navigation: {
    brand: "Arka Wisesa",
    items: [
      { label: "Home", url: "/" },
      { label: "Portfolio", url: "/portfolio" },
      { label: "About", url: "/about" },
      { label: "Contact", url: "/contact" }
    ]
  },
  seo: {
    home: { title: "Arka Wisesa - 3D Artist Portfolio", description: "Portfolio 3D artist untuk asset Blender, Unreal Engine, dan realtime GLB preview di web." },
    portfolio: { title: "Portfolio 3D", description: "Kumpulan asset 3D Blender, Unreal Engine, hard surface, environment, dan product model dengan realtime preview." },
    about: { title: "About", description: "Profil 3D artist, pengalaman, layanan, dan skill Blender/Unreal Engine." },
    contact: { title: "Contact", description: "Kontak 3D artist untuk project Blender, Unreal Engine, dan realtime 3D web portfolio." }
  },
  design: {
    headingFont: "Space Grotesk",
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

export function mergeProfileWithFallback(profile: SerializedProfile): SerializedProfile {
  return {
    ...fallbackProfile,
    ...profile,
    pages: {
      home: { ...fallbackProfile.pages?.home, ...profile.pages?.home },
      portfolio: { ...fallbackProfile.pages?.portfolio, ...profile.pages?.portfolio },
      about: { ...fallbackProfile.pages?.about, ...profile.pages?.about },
      contact: { ...fallbackProfile.pages?.contact, ...profile.pages?.contact }
    },
    sections: {
      ...fallbackProfile.sections,
      ...profile.sections,
      hero: { ...fallbackProfile.sections?.hero, ...profile.sections?.hero },
      story: {
        ...fallbackProfile.sections?.story,
        ...profile.sections?.story,
        steps: profile.sections?.story?.steps ?? fallbackProfile.sections?.story?.steps
      },
      cta: { ...fallbackProfile.sections?.cta, ...profile.sections?.cta },
      stats: profile.sections?.stats ?? fallbackProfile.sections?.stats,
      features: profile.sections?.features ?? fallbackProfile.sections?.features,
      sectionOrder: profile.sections?.sectionOrder ?? fallbackProfile.sections?.sectionOrder
    },
    footer: {
      ...fallbackProfile.footer,
      ...profile.footer,
      columns: profile.footer?.columns ?? fallbackProfile.footer?.columns
    },
    navigation: {
      ...fallbackProfile.navigation,
      ...profile.navigation,
      items: profile.navigation?.items ?? fallbackProfile.navigation?.items
    },
    seo: {
      home: { ...fallbackProfile.seo?.home, ...profile.seo?.home },
      portfolio: { ...fallbackProfile.seo?.portfolio, ...profile.seo?.portfolio },
      about: { ...fallbackProfile.seo?.about, ...profile.seo?.about },
      contact: { ...fallbackProfile.seo?.contact, ...profile.seo?.contact }
    },
    design: { ...fallbackProfile.design, ...profile.design },
    testimonials: profile.testimonials ?? fallbackProfile.testimonials,
    socialLinks: profile.socialLinks ?? fallbackProfile.socialLinks
  };
}

export const getProfile = cache(async () => {
  try {
    const profile = await getStructuredProfile();
    return profile ? mergeProfileWithFallback(profile) : fallbackProfile;
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
