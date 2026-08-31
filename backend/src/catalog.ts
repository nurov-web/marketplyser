import { prisma } from "./lib/prisma";
import { invalidateHomeCache } from "./controllers/product.controller";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=80`;

const CATEGORIES = [
  { name: "Телефонҳо", slug: "phones", image: img("photo-1592899677977-9c10ca588bbd"), description: "Смартфонҳо ва аксессуарҳо" },
  { name: "Ноутбукҳо", slug: "laptops", image: img("photo-1496181133206-80ce9b88a853"), description: "Ноутбук ва ультрабук" },
  { name: "Компютерҳо", slug: "computers", image: img("photo-1527443224154-c4a3942d3acf"), description: "ПК ва монитор" },
  { name: "Аксессуарҳо", slug: "accessories", image: img("photo-1505740420928-5e560c06d30e"), description: "Гӯшмонак, зарядка, ғилоф" },
  { name: "Либос", slug: "clothes", image: img("photo-1489987707025-afc232f7ea62"), description: "Либоси мардона ва занона" },
  { name: "Пойафзор", slug: "shoes", image: img("photo-1449505278894-297fdb3edbc1"), description: "Кефш ва кроссовка" },
  { name: "Хона", slug: "home", image: img("photo-1556911220-bff31c812dba"), description: "Барои хона ва ошхона" },
  { name: "Электроника", slug: "electronics", image: img("photo-1523275335684-37898b6baf30"), description: "Гаджетҳо ва техника" },
];

const PRODUCTS: {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  brand: string;
  stock: number;
  category: string;
  specs: Record<string, string>;
  image: string;
}[] = [
  { name: "iPhone 15 Pro", slug: "iphone-15-pro", description: "Титани сабук, камераи 48MP, чипи A17 Pro. Аслӣ, кафолати 12 моҳ.", price: 8990, discount: 5, brand: "Apple", stock: 12, category: "phones", specs: { Хотира: "256GB", Ранг: "Titanium" }, image: img("photo-1695048133142-1a20484d2569") },
  { name: "Samsung Galaxy S24", slug: "samsung-galaxy-s24", description: "Флагмани Samsung бо AI ва батареяи қавӣ.", price: 7490, discount: 8, brand: "Samsung", stock: 18, category: "phones", specs: { Хотира: "256GB", Ранг: "Black" }, image: img("photo-1610945415295-d9bbf067e59c") },
  { name: "Xiaomi 14", slug: "xiaomi-14", description: "Камераи Leica, экран 120Hz, нархи одилона.", price: 4290, discount: 6, brand: "Xiaomi", stock: 22, category: "phones", specs: { Хотира: "256GB", Ранг: "White" }, image: img("photo-1598327105666-5b89351aff97") },
  { name: "Google Pixel 8", slug: "google-pixel-8", description: "Беҳтарин камераи Android ва навсозии дарозмуддат.", price: 5190, discount: 0, brand: "Google", stock: 10, category: "phones", specs: { Хотира: "128GB", Ранг: "Obsidian" }, image: img("photo-1592899677977-9c10ca588bbd") },
  { name: "MacBook Air M3", slug: "macbook-air-m3", description: "13-дюйм, чипи M3, то 18 соат кор. Барои кор ва таҳсил.", price: 12990, discount: 0, brand: "Apple", stock: 7, category: "laptops", specs: { CPU: "M3", RAM: "16GB", SSD: "512GB" }, image: img("photo-1517336714731-489689fd1ca8") },
  { name: "Dell XPS 15", slug: "dell-xps-15", description: "Ноутбуки касбӣ бо экрани OLED.", price: 11490, discount: 10, brand: "Dell", stock: 5, category: "laptops", specs: { CPU: "i7", RAM: "16GB" }, image: img("photo-1593642632823-8f785ba67e45") },
  { name: "Lenovo ThinkPad E14", slug: "lenovo-thinkpad-e14", description: "Барои офис, клавиатураи қавӣ ва батареяи дароз.", price: 6790, discount: 7, brand: "Lenovo", stock: 9, category: "laptops", specs: { CPU: "i5", RAM: "16GB" }, image: img("photo-1496181133206-80ce9b88a853") },
  { name: "ASUS VivoBook 15", slug: "asus-vivobook-15", description: "Ноутбуки сабук барои таҳсил ва интернет.", price: 4590, discount: 4, brand: "ASUS", stock: 14, category: "laptops", specs: { CPU: "Ryzen 5", RAM: "8GB" }, image: img("photo-1484788984921-03950022c9ef") },
  { name: "Монитори LG 27\" 4K", slug: "lg-monitor-27", description: "4K UHD, IPS, барои дизайн ва бозӣ.", price: 3290, discount: 7, brand: "LG", stock: 9, category: "computers", specs: { Диагонал: "27\"", Resolution: "4K" }, image: img("photo-1527443224154-c4a3942d3acf") },
  { name: "Клавиатураи механикӣ", slug: "mech-keyboard", description: "RGB, свитчҳои қаҳваранг, барои кор ва бозӣ.", price: 390, discount: 0, brand: "Keychron", stock: 28, category: "computers", specs: { Намуд: "Wireless", Layout: "ANSI" }, image: img("photo-1511467687858-23d96c32e4ae") },
  { name: "Мушаки Logitech MX", slug: "logitech-mx", description: "Эргономик, бисёр дастгоҳ, батареяи дароз.", price: 490, discount: 5, brand: "Logitech", stock: 20, category: "computers", specs: { Bluetooth: "Ҳа", DPI: "4000" }, image: img("photo-1527864550417-7fd91fc51a46") },
  { name: "AirPods Pro 2", slug: "airpods-pro-2", description: "Гӯшмонаки бесим бо noise cancelling.", price: 1990, discount: 0, brand: "Apple", stock: 30, category: "accessories", specs: { Намуд: "In-ear", Bluetooth: "5.3" }, image: img("photo-1600294037681-c81c04de707d") },
  { name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", description: "Гӯшмонаки болои гӯш бо беҳтарин ANC.", price: 2890, discount: 12, brand: "Sony", stock: 14, category: "accessories", specs: { ANC: "Ҳа", Вақт: "30 соат" }, image: img("photo-1546435770-a3e426bf472b") },
  { name: "Зарядкаи Anker 65W", slug: "anker-65w", description: "USB-C, зуд заряд, барои ноутбук ва телефон.", price: 290, discount: 0, brand: "Anker", stock: 40, category: "accessories", specs: { Қувва: "65W", Порт: "2x USB-C" }, image: img("photo-1583863788434-e58a36330cf0") },
  { name: "Куртаи пашмин", slug: "wool-coat", description: "Куртаи зимистона, пашми табиӣ.", price: 890, discount: 15, brand: "Nurov", stock: 20, category: "clothes", specs: { Андоза: "M–XL", Мавод: "Wool" }, image: img("photo-1539533018447-63fcce2678e3") },
  { name: "Ҷинси мардона", slug: "mens-jeans", description: "Ҷинси классикӣ, дӯхти мустаҳкам.", price: 320, discount: 0, brand: "Nurov", stock: 35, category: "clothes", specs: { Андоза: "30–38", Ранг: "Blue" }, image: img("photo-1542272604-787c3835535d") },
  { name: "Либоси занона", slug: "womens-dress", description: "Либоси рӯзмарра, матои сабук.", price: 280, discount: 10, brand: "Nurov", stock: 24, category: "clothes", specs: { Андоза: "S–L", Ранг: "Beige" }, image: img("photo-1515372039744-b8f02a3ae446") },
  { name: "Кроссовка Nike Air", slug: "nike-air", description: "Пойафзори варзишӣ, бароҳат ва сабук.", price: 690, discount: 0, brand: "Nike", stock: 25, category: "shoes", specs: { Андоза: "40–45" }, image: img("photo-1542291026-7eec264c27ff") },
  { name: "Adidas Ultraboost", slug: "adidas-ultraboost", description: "Барои давидан ва рӯзмарра.", price: 790, discount: 8, brand: "Adidas", stock: 16, category: "shoes", specs: { Андоза: "39–44" }, image: img("photo-1608231387042-66d1773070a5") },
  { name: "Ботинкаи чармӣ", slug: "leather-boots", description: "Ботинкаи зимистона, чарми табиӣ.", price: 540, discount: 0, brand: "Nurov", stock: 18, category: "shoes", specs: { Андоза: "40–45", Мавод: "Leather" }, image: img("photo-1520639888713-7851133b1ed0") },
  { name: "Чойник электрикии сталь", slug: "steel-kettle", description: "1.7л, пӯлоди зангногир, хомӯшшавии автоматӣ.", price: 249, discount: 0, brand: "Bosch", stock: 40, category: "home", specs: { Ҳаҷм: "1.7л", Қувва: "2200W" }, image: img("photo-1571552879083-e0b4d194d1e5") },
  { name: "Чангкашаки дастӣ", slug: "handheld-vacuum", description: "Бесим, барои хона ва мошин.", price: 590, discount: 9, brand: "Xiaomi", stock: 15, category: "home", specs: { Намуд: "Cordless", Вақт: "30 дақ" }, image: img("photo-1558317374-067fb5f30001") },
  { name: "Apple Watch Series 9", slug: "apple-watch-9", description: "Соати ҳушманд бо GPS ва батареяи якрӯза.", price: 3490, discount: 0, brand: "Apple", stock: 11, category: "electronics", specs: { Андоза: "45mm", GPS: "Ҳа" }, image: img("photo-1434493789847-2f02dc6ca35d") },
  { name: "iPad Air", slug: "ipad-air", description: "Планшети сабук бо чипи M2 ва Apple Pencil.", price: 5990, discount: 4, brand: "Apple", stock: 8, category: "electronics", specs: { Хотира: "128GB", Экран: "10.9\"" }, image: img("photo-1544244015-0df4b3ffc6b0") },
  { name: "Колонкаи JBL Flip 6", slug: "jbl-flip-6", description: "Баландгӯяки обногузар, овози қавӣ.", price: 890, discount: 6, brand: "JBL", stock: 21, category: "electronics", specs: { Bluetooth: "5.1", IP: "IP67" }, image: img("photo-1608043152269-423dbba4e7e1") },
];

export async function ensureCatalog() {
  const productCount = await prisma.product.count();
  if (productCount >= 25) return;

  let seller = await prisma.seller.findFirst({ where: { status: "APPROVED" } });
  if (!seller) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return;
    seller = await prisma.seller.create({
      data: {
        userId: admin.id,
        shopName: "Nurov Store",
        phone: admin.phone,
        email: admin.email,
        address: "Душанбе",
        description: "Мағозаи расмӣ",
        documents: [],
        status: "APPROVED",
      },
    });
  }

  const bySlug: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: c.image, description: c.description },
      create: c,
    });
    bySlug[c.slug] = row.id;
  }

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      if (!existing.moderationStatus || existing.moderationStatus !== "APPROVED") {
        await prisma.product.update({ where: { id: existing.id }, data: { moderationStatus: "APPROVED" } });
      }
      const images = await prisma.productImage.count({ where: { productId: existing.id } });
      if (!images) {
        await prisma.productImage.create({ data: { productId: existing.id, url: p.image, sortOrder: 0 } });
      }
      continue;
    }
    await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: bySlug[p.category],
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discount: p.discount,
        brand: p.brand,
        stock: p.stock,
        specs: p.specs,
        moderationStatus: "APPROVED",
        images: { create: [{ url: p.image, sortOrder: 0 }] },
      },
    });
  }

  invalidateHomeCache();
  console.log("Catalog ready: 25 products");
}
