import { prisma } from "./lib/prisma";

const CATEGORIES = [
  { name: "Таъмири техника", slug: "repair", icon: "wrench" },
  { name: "Дӯзандагӣ", slug: "tailoring", icon: "scissors" },
  { name: "Насбкунӣ", slug: "installation", icon: "hammer" },
  { name: "Таълим", slug: "education", icon: "book" },
  { name: "Тозакунӣ", slug: "cleaning", icon: "sparkles" },
];

const PROVIDERS = [
  {
    name: "Али — Таъмири телефон",
    phone: "+992901234567",
    city: "Душанбе",
    categorySlug: "repair",
    description: "Таъмири телефон, планшет ва ноутбук. Хизмат дар маҳалла.",
    priceFrom: 50,
    isFeatured: true,
    status: "ACTIVE" as const,
  },
  {
    name: "Малика — Дӯзандагӣ",
    phone: "+992907654321",
    city: "Душанбе",
    categorySlug: "tailoring",
    description: "Дӯзандагии либос, таъмири либос, дизайни мода.",
    priceFrom: 30,
    isFeatured: true,
    status: "ACTIVE" as const,
  },
  {
    name: "Рустам — Насбкунии кондиционер",
    phone: "+992901112233",
    city: "Хуҷанд",
    categorySlug: "installation",
    description: "Насб ва таъмири кондиционер, обрӯ барқ.",
    priceFrom: 100,
    isFeatured: false,
    status: "ACTIVE" as const,
  },
  {
    name: "Зухра — Математика",
    phone: "+992904445566",
    city: "Душанбе",
    categorySlug: "education",
    description: "Таълими математика барои талабагон ва хонандагон.",
    priceFrom: 40,
    isFeatured: false,
    status: "ACTIVE" as const,
  },
  {
    name: "Фарход — Тозакунии хона",
    phone: "+992908887766",
    city: "Кӯлоб",
    categorySlug: "cleaning",
    description: "Тозакунии хона, офис ва биноҳои калон.",
    priceFrom: 80,
    isFeatured: false,
    status: "PENDING" as const,
  },
];

export async function ensureServices() {
  const count = await prisma.serviceCategory.count();
  if (count > 0) return;

  for (const c of CATEGORIES) {
    await prisma.serviceCategory.create({ data: c });
  }

  const cats = await prisma.serviceCategory.findMany();
  const slugToId = Object.fromEntries(cats.map((c: { slug: string; id: string }) => [c.slug, c.id]));

  for (const p of PROVIDERS) {
    await prisma.serviceProvider.create({
      data: {
        name: p.name,
        phone: p.phone,
        city: p.city,
        categoryId: slugToId[p.categorySlug],
        description: p.description,
        priceFrom: p.priceFrom,
        isFeatured: p.isFeatured,
        status: p.status,
        sellerId: p.phone === "+992901234567" ? (await prisma.seller.findFirst({ where: { phone: "+992900000002" } }))?.id : undefined,
      },
    });
  }

  console.log("Service catalog seeded");
}
