import {
  designCollection,
  footerCollection,
  homeSectionsCollection,
  navigationCollection,
  pagesCollection,
  profileCollection,
  seoCollection,
  serializeDoc,
  siteProfileCollection,
  testimonialsCollection,
  type PageKey,
  type ProfileDoc,
  type SerializedProfile
} from "@/lib/mongodb";

const pageKeys: PageKey[] = ["home", "portfolio", "about", "contact"];

type SiteProfilePatch = Partial<
  Pick<
    ProfileDoc,
    | "name"
    | "title"
    | "bio"
    | "location"
    | "email"
    | "experience"
    | "services"
    | "skills"
    | "whatsapp"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "linkedin"
    | "socialLinks"
  >
>;

function pickSiteProfile(source?: Partial<ProfileDoc> | null): SiteProfilePatch {
  if (!source) return {};
  return {
    name: source.name,
    title: source.title,
    bio: source.bio,
    location: source.location,
    email: source.email,
    experience: source.experience,
    services: source.services,
    skills: source.skills,
    whatsapp: source.whatsapp,
    instagram: source.instagram,
    facebook: source.facebook,
    tiktok: source.tiktok,
    linkedin: source.linkedin,
    socialLinks: source.socialLinks
  };
}

function dropUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;
}

export async function getStructuredProfile(): Promise<SerializedProfile | null> {
  const [legacy, siteProfile, pageDocs, sectionDoc, testimonialDocs, footerDoc, navigationDoc, seoDoc, designDoc] = await Promise.all([
    (await profileCollection()).findOne({}),
    (await siteProfileCollection()).findOne({ key: "main" }),
    (await pagesCollection()).find({}).toArray(),
    (await homeSectionsCollection()).findOne({ key: "home" }),
    (await testimonialsCollection()).find({}).sort({ order: 1 }).toArray(),
    (await footerCollection()).findOne({ key: "main" }),
    (await navigationCollection()).findOne({ key: "main" }),
    (await seoCollection()).findOne({ key: "main" }),
    (await designCollection()).findOne({ key: "main" })
  ]);

  if (!legacy && !siteProfile) return null;

  const legacyProfile = legacy ? serializeDoc(legacy) : ({ id: siteProfile?._id.toString() ?? "structured-profile" } as SerializedProfile);
  const pages = { ...(legacyProfile.pages ?? {}) };
  for (const doc of pageDocs) {
    if (pageKeys.includes(doc.key)) {
      pages[doc.key] = doc.content;
    }
  }

  return {
    ...legacyProfile,
    ...dropUndefined(pickSiteProfile(legacyProfile)),
    ...dropUndefined(pickSiteProfile(siteProfile)),
    id: siteProfile?._id.toString() ?? legacyProfile.id,
    pages,
    sections: sectionDoc?.sections ?? legacyProfile.sections,
    testimonials: testimonialDocs.length
      ? testimonialDocs.map(({ name, role, text, avatar }) => ({ name, role, text, avatar }))
      : legacyProfile.testimonials,
    footer: footerDoc?.data ?? legacyProfile.footer,
    navigation: navigationDoc?.data ?? legacyProfile.navigation,
    seo: seoDoc?.data ?? legacyProfile.seo,
    design: designDoc?.data ?? legacyProfile.design,
    updatedAt: siteProfile?.updatedAt ?? legacyProfile.updatedAt ?? new Date()
  };
}

export async function saveSiteProfile(data: SiteProfilePatch) {
  await (await siteProfileCollection()).updateOne(
    { key: "main" },
    { $set: { ...dropUndefined(data), key: "main", updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getStoredPages() {
  const [legacy, docs] = await Promise.all([(await profileCollection()).findOne({}), (await pagesCollection()).find({}).toArray()]);
  const pages = { ...(legacy?.pages ?? {}) };
  for (const doc of docs) {
    if (pageKeys.includes(doc.key)) {
      pages[doc.key] = doc.content;
    }
  }
  return pages;
}

export async function savePages(pages: NonNullable<ProfileDoc["pages"]>, keys: readonly PageKey[]) {
  const collection = await pagesCollection();
  await Promise.all(
    keys.map((key) =>
      collection.updateOne(
        { key },
        { $set: { key, content: pages[key] ?? {}, updatedAt: new Date() } },
        { upsert: true }
      )
    )
  );
}

export async function saveHomeSections(sections: NonNullable<ProfileDoc["sections"]>) {
  await (await homeSectionsCollection()).updateOne(
    { key: "home" },
    { $set: { key: "home", sections, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function saveTestimonials(testimonials: NonNullable<ProfileDoc["testimonials"]>) {
  const collection = await testimonialsCollection();
  await collection.deleteMany({});
  if (testimonials.length) {
    await collection.insertMany(testimonials.map((item, order) => ({ ...item, order, updatedAt: new Date() })));
  }
}

export async function saveFooter(footer: ProfileDoc["footer"]) {
  await (await footerCollection()).updateOne(
    { key: "main" },
    { $set: { key: "main", data: footer, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function saveNavigation(navigation: ProfileDoc["navigation"]) {
  await (await navigationCollection()).updateOne(
    { key: "main" },
    { $set: { key: "main", data: navigation, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function saveSeo(seo: ProfileDoc["seo"]) {
  await (await seoCollection()).updateOne(
    { key: "main" },
    { $set: { key: "main", data: seo, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function saveDesign(design: ProfileDoc["design"]) {
  await (await designCollection()).updateOne(
    { key: "main" },
    { $set: { key: "main", data: design, updatedAt: new Date() } },
    { upsert: true }
  );
}
