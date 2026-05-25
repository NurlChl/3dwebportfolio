import { MongoClient, ObjectId, type Collection, type Document, type WithId } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("DATABASE_URL is required. Use a MongoDB connection string.");
}

const mongoUri = uri;

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 2500
  });

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export { ObjectId };

export type PortfolioDoc = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  role: string;
  client: string | null;
  year: number;
  category: string;
  software: string[];
  tags: string[];
  modelUrl: string;
  posterUrl: string | null;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileDoc = {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  experience: string;
  services: string[];
  skills: string[];
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  socialLinks?: Array<{ label: string; url: string }>;
  pages?: {
    home?: { eyebrow?: string; title?: string; description?: string; imageUrl?: string };
    portfolio?: { eyebrow?: string; title?: string; description?: string; imageUrl?: string };
    about?: { eyebrow?: string; title?: string; description?: string; imageUrl?: string };
    contact?: { eyebrow?: string; title?: string; description?: string; imageUrl?: string };
  };
  design?: {
    headingFont?: string;
    bodyFont?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonRadius?: string;
    h1Size?: string;
    h2Size?: string;
    h3Size?: string;
    h4Size?: string;
    h5Size?: string;
    h6Size?: string;
    bodySize?: string;
    smallSize?: string;
    buttonSize?: string;
    badgeSize?: string;
  };
  updatedAt: Date;
};

export type SerializedPortfolio = PortfolioDoc & { id: string };
export type SerializedProfile = ProfileDoc & { id: string };

export async function getDb() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Skip MongoDB during static build.");
  }
  if (mongoUri.includes("USER:PASSWORD")) {
    throw new Error("MongoDB connection string is still using the placeholder value.");
  }
  const mongoClient = await client.connect();
  return mongoClient.db(process.env.MONGODB_DB ?? "portfolio3d");
}

export async function portfoliosCollection(): Promise<Collection<PortfolioDoc>> {
  return (await getDb()).collection<PortfolioDoc>("portfolios");
}

export async function profileCollection(): Promise<Collection<ProfileDoc>> {
  return (await getDb()).collection<ProfileDoc>("profile");
}

export function serializeDoc<T extends Document>(doc: WithId<T>): T & { id: string } {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString()
  } as unknown as T & { id: string };
}
