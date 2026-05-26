import { MongoClient, ObjectId, type Collection, type Document, type WithId } from "mongodb";

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

const uri = cleanEnvValue(process.env.DATABASE_URL);

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
    home?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      heroHeadline?: string;
      heroSubheadline?: string;
      primaryCtaText?: string;
      primaryCtaLink?: string;
      secondaryCtaText?: string;
      secondaryCtaLink?: string;
      scrollCueText?: string;
      liveStageEyebrow?: string;
      liveStageTitle?: string;
      liveStageMeta?: string;
      storyEyebrow?: string;
      servicesTitle?: string;
      servicesDescription?: string;
      servicesPanelTitle?: string;
      skillsPanelTitle?: string;
      featuresTitle?: string;
      featuresDescription?: string;
      portfolioTitle?: string;
      portfolioButtonText?: string;
      testimonialsTitle?: string;
      testimonialsDescription?: string;
      ctaEyebrow?: string;
    };
    portfolio?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      allCategoryLabel?: string;
      emptyText?: string;
      detailCategoryFallback?: string;
      detailNotesTitle?: string;
      detailRoleLabel?: string;
      detailYearLabel?: string;
      detailClientLabel?: string;
      detailViewerLoadingText?: string;
      detailViewerHintText?: string;
      detailLoadingBadgeText?: string;
      detailPreviewCategoryLabel?: string;
    };
    about?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      experienceTitle?: string;
      experienceDescription?: string;
      servicesTitle?: string;
      skillsTitle?: string;
    };
    contact?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      socialsTitle?: string;
      socialsDescription?: string;
      whatsappLabel?: string;
      emailLabel?: string;
    };
  };
  sections?: {
    hero?: { headline?: string; subheadline?: string; ctaText?: string; ctaLink?: string; showScene?: boolean };
    stats?: Array<{ value: string; label: string; icon?: string }>;
    story?: { title?: string; subtitle?: string; steps?: Array<{ number: string; title: string; description: string }> };
    features?: Array<{ title: string; description: string; icon?: string }>;
    cta?: { title?: string; description?: string; buttonText?: string; buttonLink?: string };
    sectionOrder?: string[];
  };
  testimonials?: Array<{ name: string; role: string; text: string; avatar?: string }>;
  footer?: {
    brandText?: string;
    tagline?: string;
    columns?: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
    copyright?: string;
    showNewsletter?: boolean;
  };
  navigation?: {
    brand?: string;
    logo?: string;
    items?: Array<{ label: string; url: string; isExternal?: boolean }>;
  };
  seo?: {
    home?: { title?: string; description?: string; ogImage?: string };
    portfolio?: { title?: string; description?: string; ogImage?: string };
    about?: { title?: string; description?: string; ogImage?: string };
    contact?: { title?: string; description?: string; ogImage?: string };
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
