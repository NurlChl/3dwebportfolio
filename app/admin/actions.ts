"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSession, createSession, requireAdmin, verifyAdmin } from "@/lib/auth";
import { getStoredPages, saveDesign, saveFooter, saveHomeSections, saveNavigation, savePages, saveSeo, saveSiteProfile, saveTestimonials } from "@/lib/cms-store";
import { getFallbackPortfolios, getFallbackProfile } from "@/lib/data";
import { ObjectId, portfoliosCollection } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";

const portfolioSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  summary: z.string().min(10),
  description: z.string().min(20),
  role: z.string().min(2),
  client: z.string().optional(),
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.string().min(2),
  software: z.string().min(2),
  tags: z.string().optional(),
  modelUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false)
});

function splitList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getList(formData: FormData, name: string, fallback?: string) {
  const values = formData
    .getAll(name)
    .map((item) => String(item).trim())
    .filter(Boolean);
  return values.length ? values : splitList(fallback);
}

function getSocialLinks(formData: FormData) {
  const labels = formData.getAll("socialLabel").map((item) => String(item).trim());
  const urls = formData.getAll("socialUrl").map((item) => String(item).trim());
  return labels
    .map((label, index) => ({ label, url: urls[index] ?? "" }))
    .filter((item) => item.label && item.url);
}

async function saveUpload(file: File | null, kind: "model" | "image") {
  if (!file || file.size === 0) return null;

  const allowed = kind === "model" ? [".glb", ".gltf"] : [".jpg", ".jpeg", ".png", ".webp"];
  const extension = path.extname(file.name).toLowerCase();
  if (!allowed.includes(extension)) {
    throw new Error(kind === "model" ? "File model harus .glb atau .gltf" : "Thumbnail harus .jpg, .png, atau .webp");
  }

  const maxSize = kind === "model" ? 80 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(kind === "model" ? "Ukuran file maksimal 80MB untuk upload CMS lokal." : "Ukuran thumbnail maksimal 8MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", kind === "model" ? "models" : "images");
  await mkdir(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${slugify(path.basename(file.name, extension))}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, safeName), buffer);
  return `/uploads/${kind === "model" ? "models" : "images"}/${safeName}`;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!(await verifyAdmin(email, password))) {
    redirect("/admin/login?error=invalid");
  }

  await createSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function saveProfileAction(formData: FormData) {
  await requireAdmin();

  const data = {
    name: String(formData.get("name") ?? ""),
    title: String(formData.get("title") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    location: String(formData.get("location") ?? ""),
    email: String(formData.get("email") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    services: getList(formData, "services", String(formData.get("services") ?? "")),
    skills: getList(formData, "skills", String(formData.get("skills") ?? ""))
  };

  await saveSiteProfile(data);

  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin?view=profile&updated=profile");
}

export async function savePortfolioAction(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const cloneFallbackId = String(formData.get("cloneFallbackId") ?? "").trim();
  const parsed = portfolioSchema.parse({
    ...raw,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on"
  });

  const uploadedUrl = await saveUpload(formData.get("modelFile") as File | null, "model");
  const uploadedPosterUrl = await saveUpload(formData.get("posterFile") as File | null, "image");
  const slug = slugify(parsed.title);
  const data = {
    title: parsed.title,
    slug,
    summary: parsed.summary,
    description: parsed.description,
    role: parsed.role,
    client: parsed.client || null,
    year: parsed.year,
    category: parsed.category,
    software: getList(formData, "software", parsed.software),
    tags: getList(formData, "tags", parsed.tags),
    modelUrl: uploadedUrl ?? parsed.modelUrl ?? "",
    posterUrl: uploadedPosterUrl ?? parsed.posterUrl ?? null,
    featured: parsed.featured,
    published: parsed.published,
    updatedAt: new Date()
  };

  if (!data.modelUrl) {
    throw new Error("Upload file .glb/.gltf atau isi URL model.");
  }

  const collection = await portfoliosCollection();
  if (parsed.id && !cloneFallbackId) {
    await collection.updateOne({ _id: new ObjectId(parsed.id) }, { $set: data });
  } else {
    await collection.insertOne({ ...data, createdAt: new Date() });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${slug}`);
  redirect("/admin?view=portfolio&updated=portfolio");
}

export async function seedDemoPortfoliosAction() {
  await requireAdmin();
  const collection = await portfoliosCollection();
  const now = new Date();
  for (const item of getFallbackPortfolios()) {
    const { id, createdAt, updatedAt, ...portfolio } = item;
    void id;
    void createdAt;
    void updatedAt;
    await collection.updateOne(
      { slug: portfolio.slug },
      {
        $setOnInsert: { ...portfolio, createdAt: now, updatedAt: now }
      },
      { upsert: true }
    );
  }
  revalidatePath("/");
  revalidatePath("/portfolio");
  redirect("/admin?view=portfolio&updated=seeded");
}

export async function saveContactAction(formData: FormData) {
  await requireAdmin();
  const data = {
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    facebook: String(formData.get("facebook") ?? "").trim(),
    tiktok: String(formData.get("tiktok") ?? "").trim(),
    linkedin: String(formData.get("linkedin") ?? "").trim(),
    socialLinks: getSocialLinks(formData),
    updatedAt: new Date()
  };

  await saveSiteProfile(data);

  revalidatePath("/contact");
  redirect("/admin?view=contact&updated=contact");
}

export async function saveDesignAction(formData: FormData) {
  await requireAdmin();
  const design = {
    headingFont: String(formData.get("headingFont") ?? "").trim(),
    bodyFont: String(formData.get("bodyFont") ?? "").trim(),
    accentColor: String(formData.get("accentColor") ?? "").trim(),
    backgroundColor: String(formData.get("backgroundColor") ?? "").trim(),
    textColor: String(formData.get("textColor") ?? "").trim(),
    buttonRadius: String(formData.get("buttonRadius") ?? "").trim(),
    h1Size: String(formData.get("h1Size") ?? "").trim(),
    h2Size: String(formData.get("h2Size") ?? "").trim(),
    h3Size: String(formData.get("h3Size") ?? "").trim(),
    h4Size: String(formData.get("h4Size") ?? "").trim(),
    h5Size: String(formData.get("h5Size") ?? "").trim(),
    h6Size: String(formData.get("h6Size") ?? "").trim(),
    bodySize: String(formData.get("bodySize") ?? "").trim(),
    smallSize: String(formData.get("smallSize") ?? "").trim(),
    buttonSize: String(formData.get("buttonSize") ?? "").trim(),
    badgeSize: String(formData.get("badgeSize") ?? "").trim()
  };
  await saveDesign(design);
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/about");
  revalidatePath("/contact");
  redirect("/admin?view=design&updated=design");
}

export async function savePagesAction(formData: FormData) {
  await requireAdmin();
  const pageKeys = ["home", "portfolio", "about", "contact"] as const;
  const selectedPage = String(formData.get("pageKey") ?? "").trim();
  const keysToSave = pageKeys.includes(selectedPage as (typeof pageKeys)[number]) ? [selectedPage as (typeof pageKeys)[number]] : pageKeys;
  const fallbackPages = getFallbackProfile().pages ?? {};
  const currentPages = await getStoredPages();
  const pages = {
    home: { ...fallbackPages.home, ...currentPages.home },
    portfolio: { ...fallbackPages.portfolio, ...currentPages.portfolio },
    about: { ...fallbackPages.about, ...currentPages.about },
    contact: { ...fallbackPages.contact, ...currentPages.contact }
  };
  const updates = Object.fromEntries(
    await Promise.all(
      keysToSave.map(async (key) => {
        const uploadedImage = await saveUpload(formData.get(`${key}ImageFile`) as File | null, "image");
        return [
          key,
          {
            ...(pages[key] ?? {}),
            ...getPageFormFields(formData, key),
            imageUrl: uploadedImage ?? String(formData.get(`${key}ImageUrl`) ?? "").trim()
          }
        ];
      })
    )
  );
  await savePages({ ...pages, ...updates }, keysToSave);
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/about");
  revalidatePath("/contact");
  redirect(`/admin?view=pages&page=${keysToSave[0]}&updated=pages`);
}

function getPageFormFields(formData: FormData, key: "home" | "portfolio" | "about" | "contact") {
  const base = {
    eyebrow: String(formData.get(`${key}Eyebrow`) ?? "").trim(),
    title: String(formData.get(`${key}Title`) ?? "").trim(),
    description: String(formData.get(`${key}Description`) ?? "").trim()
  };
  const fields: Record<typeof key, string[]> = {
    home: [
      "heroHeadline",
      "heroSubheadline",
      "primaryCtaText",
      "primaryCtaLink",
      "secondaryCtaText",
      "secondaryCtaLink",
      "scrollCueText",
      "liveStageEyebrow",
      "liveStageTitle",
      "liveStageMeta",
      "storyEyebrow",
      "servicesTitle",
      "servicesDescription",
      "servicesPanelTitle",
      "skillsPanelTitle",
      "featuresTitle",
      "featuresDescription",
      "portfolioTitle",
      "portfolioButtonText",
      "testimonialsTitle",
      "testimonialsDescription",
      "ctaEyebrow"
    ],
    portfolio: [
      "allCategoryLabel",
      "emptyText",
      "detailNotesTitle",
      "detailRoleLabel",
      "detailYearLabel",
      "detailClientLabel",
      "detailViewerLoadingText",
      "detailViewerHintText",
      "detailLoadingBadgeText",
      "detailPreviewCategoryLabel"
    ],
    about: ["experienceTitle", "experienceDescription", "servicesTitle", "skillsTitle"],
    contact: ["socialsTitle", "socialsDescription", "whatsappLabel", "emailLabel"]
  };
  return {
    ...base,
    ...Object.fromEntries(fields[key].map((field) => [field, String(formData.get(`${key}${capitalize(field)}`) ?? "").trim()]))
  };
}

function capitalize(value: string) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function parseJsonField<T>(formData: FormData, name: string, fallback: T) {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/about");
  revalidatePath("/contact");
}

export async function saveSectionsAction(formData: FormData) {
  await requireAdmin();
  const sections = parseJsonField(formData, "sections", {});
  await saveHomeSections(sections);
  revalidatePublicPages();
  redirect("/admin?view=pages&page=home&updated=sections");
}

export async function saveTestimonialsAction(formData: FormData) {
  await requireAdmin();
  const testimonials = parseJsonField<Array<{ name: string; role: string; text: string; avatar?: string }>>(formData, "testimonials", []);
  const withUploads = await Promise.all(
    testimonials.map(async (testimonial, index) => ({
      ...testimonial,
      avatar: (await saveUpload(formData.get(`testimonialAvatarFile${index}`) as File | null, "image")) ?? testimonial.avatar
    }))
  );
  await saveTestimonials(withUploads);
  revalidatePath("/");
  redirect("/admin?view=testimonials&updated=testimonials");
}

export async function saveFooterAction(formData: FormData) {
  await requireAdmin();
  const footer = parseJsonField(formData, "footer", {});
  await saveFooter(footer);
  revalidatePublicPages();
  redirect("/admin?view=footer&updated=footer");
}

export async function saveNavigationAction(formData: FormData) {
  await requireAdmin();
  const navigation = parseJsonField(formData, "navigation", {});
  const uploadedLogo = await saveUpload(formData.get("logoFile") as File | null, "image");
  if (uploadedLogo) {
    Object.assign(navigation, { logo: uploadedLogo });
  }
  await saveNavigation(navigation);
  revalidatePublicPages();
  redirect("/admin?view=navigation&updated=navigation");
}

export async function saveSeoAction(formData: FormData) {
  await requireAdmin();
  const seo = parseJsonField<Record<string, { title?: string; description?: string; ogImage?: string }>>(formData, "seo", {});
  await Promise.all(
    (["home", "portfolio", "about", "contact"] as const).map(async (key) => {
      const uploadedImage = await saveUpload(formData.get(`${key}OgFile`) as File | null, "image");
      if (uploadedImage) {
        seo[key] = { ...(seo[key] ?? {}), ogImage: uploadedImage };
      }
    })
  );
  await saveSeo(seo);
  revalidatePublicPages();
  redirect("/admin?view=seo&updated=seo");
}

export async function deletePortfolioAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await (await portfoliosCollection()).deleteOne({ _id: new ObjectId(id) });
  }
  revalidatePath("/");
  revalidatePath("/portfolio");
  redirect("/admin?view=portfolio&updated=deleted");
}
