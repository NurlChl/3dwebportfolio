import { MongoClient } from "mongodb";
import { existsSync, readFileSync } from "fs";
import path from "path";

type PageKey = "home" | "portfolio" | "about" | "contact";

const pageKeys: PageKey[] = ["home", "portfolio", "about", "contact"];

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "").replace(/\\\$/g, "$");
}

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = cleanEnvValue(trimmed.slice(separatorIndex + 1));
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getDatabaseName(uri: string) {
  const explicitDb = cleanEnvValue(process.env.MONGODB_DB);
  if (explicitDb) return explicitDb;
  try {
    const pathname = new URL(uri).pathname.replace(/^\//, "");
    return pathname || "portfolio3d";
  } catch {
    return "portfolio3d";
  }
}

loadLocalEnv();

const uri = cleanEnvValue(process.env.DATABASE_URL ?? process.env.MONGODB_URI);
if (!uri) {
  throw new Error("DATABASE_URL or MONGODB_URI is required");
}

const mongoUri = uri;
const client = new MongoClient(mongoUri);

async function main() {
  await client.connect();
  const db = client.db(getDatabaseName(mongoUri));
  const legacyProfile = await db.collection("profile").findOne({});

  if (!legacyProfile) {
    console.log("No legacy profile document found. Nothing to migrate.");
    return;
  }

  const now = new Date();
  const {
    pages,
    sections,
    testimonials,
    footer,
    navigation,
    seo,
    design,
    _id,
    ...siteProfile
  } = legacyProfile;
  void _id;

  await db.collection("site_profile").updateOne(
    { key: "main" },
    {
      $set: {
        key: "main",
        name: siteProfile.name,
        title: siteProfile.title,
        bio: siteProfile.bio,
        location: siteProfile.location,
        email: siteProfile.email,
        experience: siteProfile.experience,
        services: siteProfile.services,
        skills: siteProfile.skills,
        whatsapp: siteProfile.whatsapp,
        instagram: siteProfile.instagram,
        facebook: siteProfile.facebook,
        tiktok: siteProfile.tiktok,
        linkedin: siteProfile.linkedin,
        socialLinks: siteProfile.socialLinks,
        updatedAt: now
      }
    },
    { upsert: true }
  );

  for (const key of pageKeys) {
    if (pages?.[key]) {
      await db.collection("pages").updateOne({ key }, { $set: { key, content: pages[key], updatedAt: now } }, { upsert: true });
    }
  }

  if (sections) {
    await db.collection("home_sections").updateOne({ key: "home" }, { $set: { key: "home", sections, updatedAt: now } }, { upsert: true });
  }

  if (Array.isArray(testimonials)) {
    await db.collection("testimonials").deleteMany({});
    if (testimonials.length) {
      await db.collection("testimonials").insertMany(testimonials.map((item, order) => ({ ...item, order, updatedAt: now })));
    }
  }

  await Promise.all([
    footer ? db.collection("footer").updateOne({ key: "main" }, { $set: { key: "main", data: footer, updatedAt: now } }, { upsert: true }) : null,
    navigation ? db.collection("navigation").updateOne({ key: "main" }, { $set: { key: "main", data: navigation, updatedAt: now } }, { upsert: true }) : null,
    seo ? db.collection("seo").updateOne({ key: "main" }, { $set: { key: "main", data: seo, updatedAt: now } }, { upsert: true }) : null,
    design ? db.collection("design").updateOne({ key: "main" }, { $set: { key: "main", data: design, updatedAt: now } }, { upsert: true }) : null
  ]);

  await Promise.all([
    db.collection("site_profile").createIndex({ key: 1 }, { unique: true }),
    db.collection("pages").createIndex({ key: 1 }, { unique: true }),
    db.collection("home_sections").createIndex({ key: 1 }, { unique: true }),
    db.collection("testimonials").createIndex({ order: 1 }),
    db.collection("footer").createIndex({ key: 1 }, { unique: true }),
    db.collection("navigation").createIndex({ key: 1 }, { unique: true }),
    db.collection("seo").createIndex({ key: 1 }, { unique: true }),
    db.collection("design").createIndex({ key: 1 }, { unique: true }),
    db.collection("portfolios").createIndex({ slug: 1 }, { unique: true }),
    db.collection("portfolios").createIndex({ published: 1, featured: -1, createdAt: -1 })
  ]);

  console.log("CMS schema migration completed.");
}

main().finally(async () => {
  await client.close();
});
