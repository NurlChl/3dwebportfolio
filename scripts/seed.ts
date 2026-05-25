import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB ?? "portfolio3d";

if (!uri) {
  throw new Error("DATABASE_URL is required");
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db(dbName);
  const profile = db.collection("profile");
  const portfolios = db.collection("portfolios");
  const now = new Date();

  await profile.deleteMany({});
  await portfolios.deleteMany({});

  await profile.insertOne({
    name: "Arka Wisesa",
    title: "3D Artist, Blender Generalist, Realtime Asset Creator",
    bio: "Membuat asset 3D siap produksi untuk game, cinematic, product showcase, dan realtime web experience. Fokus pada model bersih, material kuat, optimasi performa, dan presentasi interaktif.",
    location: "Jakarta, Indonesia",
    email: "hello@arkawisesa.studio",
    experience: "6+ tahun mengerjakan hard-surface, stylized environment, props, dan pipeline Blender ke Unreal Engine.",
    services: ["3D Modeling", "Texture & Lookdev", "Realtime Asset Optimization", "Unreal Engine Scene Setup", "Web 3D Portfolio"],
    skills: ["Blender", "Unreal Engine", "Substance Painter", "Three.js", "GLB/GLTF", "PBR Workflow"],
    updatedAt: now
  });

  await portfolios.insertMany([
    {
      title: "Orbital Workshop Drone",
      slug: "orbital-workshop-drone",
      summary: "Asset drone hard-surface dengan material PBR dan proporsi industrial sci-fi.",
      description: "Model ini dibuat untuk showcase realtime: low-poly silhouette tetap tajam, normal detail bersih, dan material metal-rubber dibuat agar tetap terbaca pada viewport web maupun Unreal Engine.",
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
      createdAt: now,
      updatedAt: now
    },
    {
      title: "Forest Shrine Kit",
      slug: "forest-shrine-kit",
      summary: "Modular environment kit untuk scene stylized fantasy.",
      description: "Set modular berisi batu, pillar, shrine, foliage proxy, dan trim material yang disiapkan untuk komposisi environment di Blender dan Unreal Engine.",
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
      createdAt: now,
      updatedAt: now
    },
    {
      title: "Compact Retro Console",
      slug: "compact-retro-console",
      summary: "Product-style 3D asset dengan bentuk playful dan material clean.",
      description: "Asset dibuat untuk presentasi produk digital dengan ukuran file ringan, animasi subtle, dan warna material yang tetap kontras di background terang maupun gelap.",
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
      createdAt: now,
      updatedAt: now
    }
  ]);

  await portfolios.createIndex({ slug: 1 }, { unique: true });
  await portfolios.createIndex({ published: 1, featured: -1, createdAt: -1 });
}

main()
  .finally(async () => {
    await client.close();
  });
