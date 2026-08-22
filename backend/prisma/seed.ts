import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.couponUse.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Admin123!", 12);
  const sellerPass = await bcrypt.hash("Seller123!", 12);
  const userPass = await bcrypt.hash("User123!", 12);

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Nurov",
      email: "admin@nurov.tj",
      phone: "+992900000001",
      passwordHash: password,
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      firstName: "Фарход",
      lastName: "Нуров",
      email: "seller@nurov.tj",
      phone: "+992900000002",
      passwordHash: sellerPass,
      role: "SELLER",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    },
  });

  const buyer = await prisma.user.create({
    data: {
      firstName: "Дилшод",
      lastName: "Каримов",
      email: "user@nurov.tj",
      phone: "+992900000003",
      passwordHash: userPass,
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: sellerUser.id,
      shopName: "Nurov Store",
      phone: "+992900000002",
      email: "seller@nurov.tj",
      address: "Душанбе, хиёбони Рӯдакӣ 12",
      description: "Мағозаи расмии электроника ва либос бо кафолати аслӣ.",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
      documents: [],
      status: "APPROVED",
      balance: 2450,
    },
  });

  const cats = await Promise.all(
    [
      { name: "Телефонҳо", slug: "phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", description: "Смартфонҳо ва аксессуарҳо" },
      { name: "Ноутбукҳо", slug: "laptops", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", description: "Ноутбук ва ультрабук" },
      { name: "Компютерҳо", slug: "computers", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400", description: "ПК ва монитор" },
      { name: "Аксессуарҳо", slug: "accessories", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400", description: "Гӯшмонак, зарядка, ғилоф" },
      { name: "Либос", slug: "clothes", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400", description: "Либоси мардона ва занона" },
      { name: "Пойафзор", slug: "shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Кефш ва кроссовка" },
      { name: "Хона", slug: "home", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", description: "Барои хона ва ошхона" },
      { name: "Электроника", slug: "electronics", image: "https://images.unsplash.com/photo-1550009158-9ebf69182e96?w=400", description: "Гаджетҳо ва техника" },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const productsData = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Титани сабук, камераи 48MP, чипи A17 Pro. Маҳсулоти аслӣ бо кафолати 12 моҳ.",
      price: 8990,
      discount: 5,
      brand: "Apple",
      stock: 12,
      categoryId: bySlug.phones,
      specs: { Хотира: "256GB", Ранг: "Titanium", Экран: "6.1\"" },
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1696446701792-daab3151922b?w=800",
      ],
    },
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-s24",
      description: "Флагмани Samsung бо AI ва батареяи қавӣ.",
      price: 7490,
      discount: 8,
      brand: "Samsung",
      stock: 18,
      categoryId: bySlug.phones,
      specs: { Хотира: "256GB", Ранг: "Black" },
      images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"],
    },
    {
      name: "MacBook Air M3",
      slug: "macbook-air-m3",
      description: "13-дюйм, чипи M3, то 18 соат кор. Барои кор ва таҳсил.",
      price: 12990,
      discount: 0,
      brand: "Apple",
      stock: 7,
      categoryId: bySlug.laptops,
      specs: { CPU: "M3", RAM: "16GB", SSD: "512GB" },
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description: "Ноутбуки касбӣ бо экрани OLED.",
      price: 11490,
      discount: 10,
      brand: "Dell",
      stock: 5,
      categoryId: bySlug.laptops,
      specs: { CPU: "i7", RAM: "16GB" },
      images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"],
    },
    {
      name: "AirPods Pro 2",
      slug: "airpods-pro-2",
      description: "Гӯшмонаки бесим бо noise cancelling.",
      price: 1990,
      discount: 0,
      brand: "Apple",
      stock: 30,
      categoryId: bySlug.accessories,
      specs: { Намуд: "In-ear", Bluetooth: "5.3" },
      images: ["https://images.unsplash.com/photo-1600294037681-c81c04de707d?w=800"],
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Гӯшмонаки болои гӯш бо беҳтарин ANC.",
      price: 2890,
      discount: 12,
      brand: "Sony",
      stock: 14,
      categoryId: bySlug.accessories,
      specs: { ANC: "Ҳа", Вақт: "30 соат" },
      images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    },
    {
      name: "Куртаи пашмин",
      slug: "wool-coat",
      description: "Куртаи зимистона, пашми табиӣ, дӯхти Даҳан.",
      price: 890,
      discount: 15,
      brand: "Nurov",
      stock: 20,
      categoryId: bySlug.clothes,
      specs: { Андоза: "M–XL", Мавод: "Wool" },
      images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800"],
    },
    {
      name: "Кроссовка Nike Air",
      slug: "nike-air",
      description: "Пойафзори варзишӣ, бароҳат ва сабук.",
      price: 690,
      discount: 0,
      brand: "Nike",
      stock: 25,
      categoryId: bySlug.shoes,
      specs: { Андоза: "40–45" },
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
    },
    {
      name: "Чойник электрикии сталь",
      slug: "kettle",
      description: "1.7л, пӯлоди зангногир, хомӯшшавии автоматӣ.",
      price: 249,
      discount: 0,
      brand: "Bosch",
      stock: 40,
      categoryId: bySlug.home,
      specs: { Ҳаҷм: "1.7л", Қувва: "2200W" },
      images: ["https://images.unsplash.com/photo-1571552879083-e0b4d194d1e5?w=800"],
    },
    {
      name: "Монитори LG 27\"",
      slug: "lg-monitor",
      description: "4K UHD, IPS, барои дизайн ва бозӣ.",
      price: 3290,
      discount: 7,
      brand: "LG",
      stock: 9,
      categoryId: bySlug.computers,
      specs: { Диагонал: "27\"", Resolution: "4K" },
      images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"],
    },
    {
      name: "Apple Watch Series 9",
      slug: "apple-watch-9",
      description: "Соати ҳушманд бо Double Tap ва батареяи якрӯза.",
      price: 3490,
      discount: 0,
      brand: "Apple",
      stock: 11,
      categoryId: bySlug.electronics,
      specs: { Андоза: "45mm", GPS: "Ҳа" },
      images: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800"],
    },
    {
      name: "iPad Air",
      slug: "ipad-air",
      description: "Планшети сабук бо чипи M2 ва Apple Pencil.",
      price: 5990,
      discount: 4,
      brand: "Apple",
      stock: 8,
      categoryId: bySlug.electronics,
      specs: { Хотира: "128GB", Экран: "10.9\"" },
      images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"],
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const { images, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        sellerId: seller.id,
        moderationStatus: "APPROVED",
        images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
      },
    });
    createdProducts.push(product);
  }

  const iphone = createdProducts[0];
  const airpods = createdProducts[4];

  await prisma.address.create({
    data: {
      userId: buyer.id,
      fullName: "Дилшод Каримов",
      phone: "+992900000003",
      city: "Душанбе",
      address: "кӯчаи Айнӣ 45, хонаи 12",
      isDefault: true,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      number: 10245,
      fullName: "Дилшод Каримов",
      phone: "+992900000003",
      city: "Душанбе",
      address: "кӯчаи Айнӣ 45, хонаи 12",
      deliveryMethod: "STANDARD",
      deliveryFee: 5,
      subtotal: Number(iphone.price) * 0.95 + Number(airpods.price),
      total: Number(iphone.price) * 0.95 + Number(airpods.price) + 5,
      status: "DELIVERED",
      items: {
        create: [
          {
            productId: iphone.id,
            sellerId: seller.id,
            name: iphone.name,
            price: Number(iphone.price) * 0.95,
            quantity: 1,
            status: "DELIVERED",
          },
          {
            productId: airpods.id,
            sellerId: seller.id,
            name: airpods.name,
            price: airpods.price,
            quantity: 1,
            status: "DELIVERED",
          },
        ],
      },
      payment: { create: { method: "COD", status: "PAID", amount: Number(iphone.price) * 0.95 + Number(airpods.price) + 5 } },
    },
  });

  await prisma.review.create({
    data: {
      userId: buyer.id,
      productId: iphone.id,
      orderId: order.id,
      rating: 5,
      comment: "Маҳсулот аслӣ, зуд расид. Тавсия медиҳам.",
    },
  });

  await prisma.favorite.createMany({
    data: [
      { userId: buyer.id, productId: createdProducts[2].id },
      { userId: buyer.id, productId: airpods.id },
    ],
  });

  await prisma.cartItem.create({
    data: { userId: buyer.id, productId: createdProducts[5].id, quantity: 1 },
  });

  await prisma.notification.createMany({
    data: [
      { userId: buyer.id, type: "ORDER_SHIPPED", title: "Фармоиш фиристода шуд", body: "Фармоиши шумо роҳ гирифт." },
      { userId: sellerUser.id, type: "NEW_ORDER", title: "Фармоиши нав", body: "Фармоиши нав қабул шуд." },
      { userId: admin.id, type: "SYSTEM", title: "Система омода аст", body: "Nurov Marketplace seed шуд." },
    ],
  });

  await prisma.crmContact.create({
    data: {
      name: "Дилшод Каримов",
      phone: "+992900000003",
      email: "user@nurov.tj",
      company: "Nurov Customer",
    },
  });
  await prisma.crmLead.createMany({
    data: [
      { title: "Хариди iPhone", name: "Дилшод Каримов", phone: "+992900000003", email: "user@nurov.tj", status: "CONVERTED", source: "ORDER" },
      { title: "Саволи MacBook", name: "Зарина", phone: "+992900000010", status: "NEW", source: "CHAT" },
    ],
  });
  await prisma.crmDeal.create({
    data: {
      title: "Order #10245",
      amount: Number(iphone.price) * 0.95 + Number(airpods.price) + 5,
      stage: "WON",
      orderId: order.id,
    },
  });

  const week = new Date();
  week.setDate(week.getDate() + 14);
  await prisma.coupon.createMany({
    data: [
      { code: "NUROV10", type: "PERCENT", value: 10, minSubtotal: 50, maxUses: 999, active: true, expiresAt: week },
      { code: "SALE20", type: "PERCENT", value: 20, minSubtotal: 200, maxUses: 200, active: true, expiresAt: week },
      { code: "WELCOME", type: "FIXED", value: 15, minSubtotal: 30, maxUses: 999, active: true, expiresAt: week },
    ],
  });

  console.log("Seed OK");
  console.log("Admin:  admin@nurov.tj  / Admin123!");
  console.log("Seller: seller@nurov.tj / Seller123!");
  console.log("User:   user@nurov.tj   / User123!");
  console.log("Coupons: NUROV10 (10%), SALE20 (20%), WELCOME (15 с.)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
