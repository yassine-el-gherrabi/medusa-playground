import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const IMG = "https://medusa-public-images.s3.eu-west-1.amazonaws.com";

const images = {
  teeBlack: [{ url: `${IMG}/tee-black-front.png` }, { url: `${IMG}/tee-black-back.png` }],
  teeWhite: [{ url: `${IMG}/tee-white-front.png` }, { url: `${IMG}/tee-white-back.png` }],
  sweatshirt: [{ url: `${IMG}/sweatshirt-vintage-front.png` }, { url: `${IMG}/sweatshirt-vintage-back.png` }],
  sweatpants: [{ url: `${IMG}/sweatpants-gray-front.png` }, { url: `${IMG}/sweatpants-gray-back.png` }],
  shorts: [{ url: `${IMG}/shorts-vintage-front.png` }, { url: `${IMG}/shorts-vintage-back.png` }],
};

function sizeVariants(prices: { eur: number; usd: number }, prefix: string, sizes = ["S", "M", "L", "XL"]) {
  return sizes.map((size) => ({
    title: size,
    sku: `${prefix}-${size}`,
    options: { Size: size },
    prices: [
      { amount: prices.eur, currency_code: "eur" },
      { amount: prices.usd, currency_code: "usd" },
    ],
  }));
}

function sizeColorVariants(
  prices: { eur: number; usd: number },
  prefix: string,
  colors: string[],
  sizes = ["S", "M", "L", "XL"]
) {
  const variants: any[] = [];
  for (const size of sizes) {
    for (const color of colors) {
      variants.push({
        title: `${size} / ${color}`,
        sku: `${prefix}-${size}-${color.toUpperCase().replace(/\s/g, "")}`,
        options: { Size: size, Color: color },
        prices: [
          { amount: prices.eur, currency_code: "eur" },
          { amount: prices.usd, currency_code: "usd" },
        ],
      });
    }
  }
  return variants;
}

function oneVariant(prices: { eur: number; usd: number }, sku: string) {
  return [
    {
      title: "Default",
      sku,
      options: { Type: "Default" },
      prices: [
        { amount: prices.eur, currency_code: "eur" },
        { amount: prices.usd, currency_code: "usd" },
      ],
    },
  ];
}

export default async function seedRichData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("=== Rich Seed: Starting ===");

  // Find existing infrastructure
  const [salesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!salesChannel) throw new Error("Run the default seed first (npx medusa exec src/scripts/seed.ts)");

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
  const shippingProfile = shippingProfiles[0];
  if (!shippingProfile) throw new Error("No shipping profile found");

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = stockLocations[0];
  if (!stockLocation) throw new Error("No stock location found");

  const salesChannelRef = { id: salesChannel.id };

  // ─── CATEGORIES ────────────────────────────────────────────────

  logger.info("Creating parent categories...");
  const { result: parents } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Men", handle: "men", is_active: true, is_internal: false },
        { name: "Women", handle: "women", is_active: true, is_internal: false },
        { name: "Accessories", handle: "accessories", is_active: true, is_internal: false },
        { name: "Home & Living", handle: "home-living", is_active: true, is_internal: false },
        { name: "Sport", handle: "sport", is_active: true, is_internal: false },
      ],
    },
  });

  const parentMap: Record<string, string> = {};
  for (const p of parents) parentMap[p.name] = p.id;

  logger.info("Creating subcategories...");
  const { result: children } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        // Men
        { name: "T-Shirts", handle: "men-tshirts", is_active: true, parent_category_id: parentMap["Men"] },
        { name: "Hoodies & Sweatshirts", handle: "men-hoodies", is_active: true, parent_category_id: parentMap["Men"] },
        { name: "Jackets", handle: "men-jackets", is_active: true, parent_category_id: parentMap["Men"] },
        { name: "Pants & Joggers", handle: "men-pants", is_active: true, parent_category_id: parentMap["Men"] },
        // Women
        { name: "Tops", handle: "women-tops", is_active: true, parent_category_id: parentMap["Women"] },
        { name: "Dresses", handle: "women-dresses", is_active: true, parent_category_id: parentMap["Women"] },
        { name: "Skirts", handle: "women-skirts", is_active: true, parent_category_id: parentMap["Women"] },
        { name: "Outerwear", handle: "women-outerwear", is_active: true, parent_category_id: parentMap["Women"] },
        // Accessories
        { name: "Bags", handle: "bags", is_active: true, parent_category_id: parentMap["Accessories"] },
        { name: "Hats & Caps", handle: "hats-caps", is_active: true, parent_category_id: parentMap["Accessories"] },
        { name: "Scarves & Wraps", handle: "scarves-wraps", is_active: true, parent_category_id: parentMap["Accessories"] },
        // Home & Living
        { name: "Candles", handle: "candles", is_active: true, parent_category_id: parentMap["Home & Living"] },
        { name: "Mugs & Drinkware", handle: "mugs-drinkware", is_active: true, parent_category_id: parentMap["Home & Living"] },
        { name: "Blankets & Throws", handle: "blankets-throws", is_active: true, parent_category_id: parentMap["Home & Living"] },
        // Sport
        { name: "Running", handle: "sport-running", is_active: true, parent_category_id: parentMap["Sport"] },
        { name: "Training", handle: "sport-training", is_active: true, parent_category_id: parentMap["Sport"] },
        { name: "Yoga", handle: "sport-yoga", is_active: true, parent_category_id: parentMap["Sport"] },
      ],
    },
  });

  const catMap: Record<string, string> = {};
  for (const c of children) catMap[c.name] = c.id;
  for (const p of parents) catMap[p.name] = p.id;

  logger.info(`Created ${parents.length} parent + ${children.length} sub categories.`);

  // ─── PRODUCTS ──────────────────────────────────────────────────

  logger.info("Creating products...");

  const products: any[] = [
    // ── Men / T-Shirts ──
    {
      title: "Classic Crew Tee",
      handle: "classic-crew-tee",
      description: "A timeless crew neck t-shirt crafted from 100% organic cotton. Soft, breathable, and perfect for everyday wear.",
      category_ids: [catMap["T-Shirts"]],
      images: images.teeBlack,
      weight: 200,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }, { title: "Color", values: ["Black", "White"] }],
      variants: sizeColorVariants({ eur: 29.99, usd: 34.99 }, "CREW-TEE", ["Black", "White"]),
    },
    {
      title: "Vintage Logo Tee",
      handle: "vintage-logo-tee",
      description: "Retro-inspired logo tee with a faded print. Pre-washed for that lived-in feel from day one.",
      category_ids: [catMap["T-Shirts"]],
      images: images.teeWhite,
      weight: 210,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 34.99, usd: 39.99 }, "VNTG-TEE"),
    },
    {
      title: "Graphic Print Tee",
      handle: "graphic-print-tee",
      description: "Bold graphic artwork meets premium cotton. Stand out with this artist collaboration piece.",
      category_ids: [catMap["T-Shirts"]],
      images: images.teeBlack,
      weight: 220,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 39.99, usd: 44.99 }, "GFX-TEE"),
    },
    {
      title: "Slim Fit V-Neck",
      handle: "slim-fit-vneck",
      description: "Modern slim-fit v-neck tee in premium Pima cotton. A wardrobe essential with a refined silhouette.",
      category_ids: [catMap["T-Shirts"]],
      images: images.teeWhite,
      weight: 190,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }, { title: "Color", values: ["Navy", "Grey", "White"] }],
      variants: sizeColorVariants({ eur: 32.99, usd: 37.99 }, "SLIM-VN", ["Navy", "Grey", "White"]),
    },
    {
      title: "Oversized Drop Shoulder Tee",
      handle: "oversized-drop-tee",
      description: "Relaxed oversized fit with dropped shoulders. Heavy-weight cotton for a structured drape.",
      category_ids: [catMap["T-Shirts"]],
      images: images.teeBlack,
      weight: 280,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 44.99, usd: 49.99 }, "OVER-TEE"),
    },

    // ── Men / Hoodies ──
    {
      title: "Essential Pullover Hoodie",
      handle: "essential-pullover-hoodie",
      description: "Your go-to hoodie. Heavyweight French terry with a kangaroo pocket and adjustable drawcord hood.",
      category_ids: [catMap["Hoodies & Sweatshirts"]],
      images: images.sweatshirt,
      weight: 550,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }, { title: "Color", values: ["Charcoal", "Navy", "Cream"] }],
      variants: sizeColorVariants({ eur: 69.99, usd: 79.99 }, "ESS-HOOD", ["Charcoal", "Navy", "Cream"]),
    },
    {
      title: "Zip-Up Hoodie",
      handle: "zip-up-hoodie",
      description: "Full-zip hoodie with metal YKK zipper. Ribbed cuffs and hem for a clean finish.",
      category_ids: [catMap["Hoodies & Sweatshirts"]],
      images: images.sweatshirt,
      weight: 580,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 74.99, usd: 84.99 }, "ZIP-HOOD"),
    },
    {
      title: "Fleece Crewneck Sweatshirt",
      handle: "fleece-crewneck",
      description: "Ultra-soft brushed fleece interior. Minimal branding for a clean, versatile look.",
      category_ids: [catMap["Hoodies & Sweatshirts"]],
      images: images.sweatshirt,
      weight: 480,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 59.99, usd: 69.99 }, "FLEECE-CRW"),
    },

    // ── Men / Jackets ──
    {
      title: "Bomber Jacket",
      handle: "bomber-jacket",
      description: "Classic bomber silhouette with ribbed collar, cuffs, and hem. Water-resistant shell with satin lining.",
      category_ids: [catMap["Jackets"]],
      images: images.sweatshirt,
      weight: 700,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 129.99, usd: 149.99 }, "BOMBER"),
    },
    {
      title: "Denim Jacket",
      handle: "denim-jacket",
      description: "Heavyweight 14oz selvedge denim. Button front with chest pockets. Ages beautifully over time.",
      category_ids: [catMap["Jackets"]],
      images: images.sweatshirt,
      weight: 850,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 119.99, usd: 139.99 }, "DENIM-JKT"),
    },
    {
      title: "Lightweight Windbreaker",
      handle: "lightweight-windbreaker",
      description: "Packable windbreaker that folds into its own pocket. Ideal for travel and unpredictable weather.",
      category_ids: [catMap["Jackets"]],
      images: images.teeBlack,
      weight: 300,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }, { title: "Color", values: ["Black", "Olive", "Sky Blue"] }],
      variants: sizeColorVariants({ eur: 89.99, usd: 99.99 }, "WIND", ["Black", "Olive", "Sky Blue"]),
    },

    // ── Men / Pants ──
    {
      title: "Slim Chinos",
      handle: "slim-chinos",
      description: "Tailored slim-fit chinos in stretch cotton twill. Versatile enough for the office or weekend.",
      category_ids: [catMap["Pants & Joggers"]],
      images: images.sweatpants,
      weight: 450,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }, { title: "Color", values: ["Khaki", "Navy", "Black"] }],
      variants: sizeColorVariants({ eur: 64.99, usd: 74.99 }, "CHINO", ["Khaki", "Navy", "Black"]),
    },
    {
      title: "Cargo Pants",
      handle: "cargo-pants",
      description: "Relaxed-fit cargo pants with six pockets. Washed cotton canvas with an easy-going attitude.",
      category_ids: [catMap["Pants & Joggers"]],
      images: images.sweatpants,
      weight: 500,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 74.99, usd: 84.99 }, "CARGO"),
    },
    {
      title: "Tech Joggers",
      handle: "tech-joggers",
      description: "Performance joggers with 4-way stretch and zip pockets. Tapered leg with elastic cuffs.",
      category_ids: [catMap["Pants & Joggers"]],
      images: images.sweatpants,
      weight: 380,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 54.99, usd: 64.99 }, "TECH-JOG"),
    },

    // ── Women / Tops ──
    {
      title: "Relaxed Fit Tee",
      handle: "relaxed-fit-tee",
      description: "Easy, relaxed silhouette in soft slub cotton. The perfect everyday tee with a slightly boxy cut.",
      category_ids: [catMap["Tops"]],
      images: images.teeWhite,
      weight: 180,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }, { title: "Color", values: ["Blush", "Sage", "Cloud"] }],
      variants: sizeColorVariants({ eur: 27.99, usd: 32.99 }, "RLX-TEE", ["Blush", "Sage", "Cloud"], ["XS", "S", "M", "L"]),
    },
    {
      title: "Linen Blouse",
      handle: "linen-blouse",
      description: "Airy pure linen blouse with mother-of-pearl buttons. Elegant enough for dinner, cool enough for summer.",
      category_ids: [catMap["Tops"]],
      images: images.teeWhite,
      weight: 160,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 59.99, usd: 69.99 }, "LINEN-BLS", ["XS", "S", "M", "L"]),
    },
    {
      title: "Cropped Tank Top",
      handle: "cropped-tank",
      description: "Ribbed cropped tank in organic cotton. A layering essential with a modern crop length.",
      category_ids: [catMap["Tops"]],
      images: images.teeWhite,
      weight: 120,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }, { title: "Color", values: ["White", "Black", "Terracotta"] }],
      variants: sizeColorVariants({ eur: 22.99, usd: 26.99 }, "CROP-TANK", ["White", "Black", "Terracotta"], ["XS", "S", "M", "L"]),
    },

    // ── Women / Dresses ──
    {
      title: "Summer Wrap Dress",
      handle: "summer-wrap-dress",
      description: "Flattering wrap silhouette in a vibrant floral print. Adjustable tie waist and flutter sleeves.",
      category_ids: [catMap["Dresses"]],
      images: images.teeWhite,
      weight: 250,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 79.99, usd: 89.99 }, "WRAP-DRESS", ["XS", "S", "M", "L"]),
    },
    {
      title: "Midi Shirt Dress",
      handle: "midi-shirt-dress",
      description: "Effortless midi-length shirt dress in organic cotton poplin. Button-through with a removable belt.",
      category_ids: [catMap["Dresses"]],
      images: images.teeWhite,
      weight: 300,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 89.99, usd: 99.99 }, "MIDI-DRESS", ["XS", "S", "M", "L"]),
    },

    // ── Women / Skirts ──
    {
      title: "A-Line Mini Skirt",
      handle: "aline-mini-skirt",
      description: "Classic A-line mini in stretch denim. High waist with a flattering fit and raw hem detail.",
      category_ids: [catMap["Skirts"]],
      images: images.shorts,
      weight: 320,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 49.99, usd: 59.99 }, "ALINE-SKRT", ["XS", "S", "M", "L"]),
    },
    {
      title: "Pleated Maxi Skirt",
      handle: "pleated-maxi-skirt",
      description: "Flowing pleated maxi skirt in chiffon. Elasticated waist for an easy, elegant fit.",
      category_ids: [catMap["Skirts"]],
      images: images.sweatpants,
      weight: 280,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 69.99, usd: 79.99 }, "PLEATED-MX", ["XS", "S", "M", "L"]),
    },

    // ── Women / Outerwear ──
    {
      title: "Trench Coat",
      handle: "trench-coat",
      description: "Timeless double-breasted trench coat. Water-resistant cotton gabardine with a detachable belt.",
      category_ids: [catMap["Outerwear"]],
      images: images.sweatshirt,
      weight: 900,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants({ eur: 149.99, usd: 169.99 }, "TRENCH", ["XS", "S", "M", "L"]),
    },
    {
      title: "Puffer Vest",
      handle: "puffer-vest",
      description: "Lightweight quilted puffer vest with recycled down fill. Snap buttons and zip pockets.",
      category_ids: [catMap["Outerwear"]],
      images: images.sweatshirt,
      weight: 400,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }, { title: "Color", values: ["Black", "Olive", "Burgundy"] }],
      variants: sizeColorVariants({ eur: 99.99, usd: 114.99 }, "PUFFER-V", ["Black", "Olive", "Burgundy"], ["XS", "S", "M", "L"]),
    },

    // ── Accessories / Bags ──
    {
      title: "Canvas Tote Bag",
      handle: "canvas-tote-bag",
      description: "Heavy-duty organic canvas tote with reinforced handles. Spacious interior with an inside pocket.",
      category_ids: [catMap["Bags"]],
      images: images.teeWhite,
      weight: 350,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 34.99, usd: 39.99 }, "CANVAS-TOTE"),
    },
    {
      title: "Leather Crossbody Bag",
      handle: "leather-crossbody",
      description: "Full-grain leather crossbody with adjustable strap. Compact design fits your essentials perfectly.",
      category_ids: [catMap["Bags"]],
      images: images.shorts,
      weight: 420,
      options: [{ title: "Color", values: ["Tan", "Black"] }],
      variants: [
        { title: "Tan", sku: "XBODY-TAN", options: { Color: "Tan" }, prices: [{ amount: 89.99, currency_code: "eur" }, { amount: 99.99, currency_code: "usd" }] },
        { title: "Black", sku: "XBODY-BLK", options: { Color: "Black" }, prices: [{ amount: 89.99, currency_code: "eur" }, { amount: 99.99, currency_code: "usd" }] },
      ],
    },
    {
      title: "Everyday Backpack",
      handle: "everyday-backpack",
      description: "Water-resistant backpack with padded laptop sleeve. Multiple compartments for organized carry.",
      category_ids: [catMap["Bags"]],
      images: images.teeBlack,
      weight: 600,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 79.99, usd: 89.99 }, "BACKPACK"),
    },

    // ── Accessories / Hats ──
    {
      title: "Baseball Cap",
      handle: "baseball-cap",
      description: "Six-panel baseball cap in washed cotton. Adjustable brass buckle closure.",
      category_ids: [catMap["Hats & Caps"]],
      images: images.teeBlack,
      weight: 80,
      options: [{ title: "Color", values: ["Black", "Navy", "Stone"] }],
      variants: [
        { title: "Black", sku: "CAP-BLK", options: { Color: "Black" }, prices: [{ amount: 24.99, currency_code: "eur" }, { amount: 29.99, currency_code: "usd" }] },
        { title: "Navy", sku: "CAP-NVY", options: { Color: "Navy" }, prices: [{ amount: 24.99, currency_code: "eur" }, { amount: 29.99, currency_code: "usd" }] },
        { title: "Stone", sku: "CAP-STN", options: { Color: "Stone" }, prices: [{ amount: 24.99, currency_code: "eur" }, { amount: 29.99, currency_code: "usd" }] },
      ],
    },
    {
      title: "Bucket Hat",
      handle: "bucket-hat",
      description: "Reversible bucket hat in cotton canvas. Solid on one side, pattern on the other.",
      category_ids: [catMap["Hats & Caps"]],
      images: images.teeBlack,
      weight: 90,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 29.99, usd: 34.99 }, "BUCKET-HAT"),
    },
    {
      title: "Merino Beanie",
      handle: "merino-beanie",
      description: "Ribbed beanie in soft merino wool. Lightweight warmth for cool mornings and cold nights.",
      category_ids: [catMap["Hats & Caps"]],
      images: images.sweatshirt,
      weight: 60,
      options: [{ title: "Color", values: ["Charcoal", "Cream", "Rust"] }],
      variants: [
        { title: "Charcoal", sku: "BEANIE-CHR", options: { Color: "Charcoal" }, prices: [{ amount: 34.99, currency_code: "eur" }, { amount: 39.99, currency_code: "usd" }] },
        { title: "Cream", sku: "BEANIE-CRM", options: { Color: "Cream" }, prices: [{ amount: 34.99, currency_code: "eur" }, { amount: 39.99, currency_code: "usd" }] },
        { title: "Rust", sku: "BEANIE-RST", options: { Color: "Rust" }, prices: [{ amount: 34.99, currency_code: "eur" }, { amount: 39.99, currency_code: "usd" }] },
      ],
    },

    // ── Accessories / Scarves ──
    {
      title: "Cashmere Scarf",
      handle: "cashmere-scarf",
      description: "Pure cashmere scarf with hand-rolled edges. Luxuriously soft and lightweight.",
      category_ids: [catMap["Scarves & Wraps"]],
      images: images.sweatshirt,
      weight: 120,
      options: [{ title: "Color", values: ["Camel", "Grey", "Navy"] }],
      variants: [
        { title: "Camel", sku: "SCARF-CML", options: { Color: "Camel" }, prices: [{ amount: 79.99, currency_code: "eur" }, { amount: 89.99, currency_code: "usd" }] },
        { title: "Grey", sku: "SCARF-GRY", options: { Color: "Grey" }, prices: [{ amount: 79.99, currency_code: "eur" }, { amount: 89.99, currency_code: "usd" }] },
        { title: "Navy", sku: "SCARF-NVY", options: { Color: "Navy" }, prices: [{ amount: 79.99, currency_code: "eur" }, { amount: 89.99, currency_code: "usd" }] },
      ],
    },

    // ── Home / Candles ──
    {
      title: "Vanilla & Amber Soy Candle",
      handle: "vanilla-amber-candle",
      description: "Hand-poured soy wax candle with warm vanilla and amber notes. 60-hour burn time.",
      category_ids: [catMap["Candles"]],
      images: images.teeWhite,
      weight: 350,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 32.99, usd: 37.99 }, "CANDLE-VAN"),
    },
    {
      title: "Cedar & Sage Candle",
      handle: "cedar-sage-candle",
      description: "Woodsy cedar blended with fresh sage. Clean-burning coconut soy wax in a reusable vessel.",
      category_ids: [catMap["Candles"]],
      images: images.teeWhite,
      weight: 350,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 32.99, usd: 37.99 }, "CANDLE-CED"),
    },
    {
      title: "Lavender Fields Candle",
      handle: "lavender-fields-candle",
      description: "Calming lavender with hints of eucalyptus. Perfect for winding down after a long day.",
      category_ids: [catMap["Candles"]],
      images: images.teeWhite,
      weight: 350,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 28.99, usd: 33.99 }, "CANDLE-LAV"),
    },

    // ── Home / Mugs ──
    {
      title: "Artisan Ceramic Mug",
      handle: "artisan-ceramic-mug",
      description: "Handcrafted stoneware mug with reactive glaze finish. Each piece is unique. 350ml capacity.",
      category_ids: [catMap["Mugs & Drinkware"]],
      images: images.teeWhite,
      weight: 400,
      options: [{ title: "Color", values: ["Sage", "Midnight", "Sand"] }],
      variants: [
        { title: "Sage", sku: "MUG-SAGE", options: { Color: "Sage" }, prices: [{ amount: 19.99, currency_code: "eur" }, { amount: 24.99, currency_code: "usd" }] },
        { title: "Midnight", sku: "MUG-MID", options: { Color: "Midnight" }, prices: [{ amount: 19.99, currency_code: "eur" }, { amount: 24.99, currency_code: "usd" }] },
        { title: "Sand", sku: "MUG-SAND", options: { Color: "Sand" }, prices: [{ amount: 19.99, currency_code: "eur" }, { amount: 24.99, currency_code: "usd" }] },
      ],
    },
    {
      title: "Insulated Travel Mug",
      handle: "insulated-travel-mug",
      description: "Double-wall vacuum insulated. Keeps drinks hot for 6 hours, cold for 12. Leak-proof lid.",
      category_ids: [catMap["Mugs & Drinkware"]],
      images: images.teeBlack,
      weight: 320,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 29.99, usd: 34.99 }, "TRAVEL-MUG"),
    },

    // ── Home / Blankets ──
    {
      title: "Chunky Knit Throw",
      handle: "chunky-knit-throw",
      description: "Oversized chunky knit throw blanket in soft acrylic. 130x170cm. Statement piece for any room.",
      category_ids: [catMap["Blankets & Throws"]],
      images: images.sweatshirt,
      weight: 1200,
      options: [{ title: "Color", values: ["Ivory", "Grey", "Blush"] }],
      variants: [
        { title: "Ivory", sku: "THROW-IVR", options: { Color: "Ivory" }, prices: [{ amount: 69.99, currency_code: "eur" }, { amount: 79.99, currency_code: "usd" }] },
        { title: "Grey", sku: "THROW-GRY", options: { Color: "Grey" }, prices: [{ amount: 69.99, currency_code: "eur" }, { amount: 79.99, currency_code: "usd" }] },
        { title: "Blush", sku: "THROW-BLS", options: { Color: "Blush" }, prices: [{ amount: 69.99, currency_code: "eur" }, { amount: 79.99, currency_code: "usd" }] },
      ],
    },
    {
      title: "Linen Bedspread",
      handle: "linen-bedspread",
      description: "Stonewashed linen bedspread in a generous 240x260cm size. Naturally temperature-regulating.",
      category_ids: [catMap["Blankets & Throws"]],
      images: images.sweatpants,
      weight: 1800,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 129.99, usd: 149.99 }, "LINEN-BED"),
    },

    // ── Sport / Running ──
    {
      title: "Performance Running Tee",
      handle: "performance-running-tee",
      description: "Moisture-wicking technical tee with mesh ventilation panels. Reflective details for low-light runs.",
      category_ids: [catMap["Running"]],
      images: images.teeBlack,
      weight: 150,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 44.99, usd: 49.99 }, "RUN-TEE"),
    },
    {
      title: "Running Shorts",
      handle: "running-shorts",
      description: "Lightweight running shorts with built-in liner and zip pocket. 5-inch inseam.",
      category_ids: [catMap["Running"]],
      images: images.shorts,
      weight: 120,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 39.99, usd: 44.99 }, "RUN-SHORT"),
    },

    // ── Sport / Training ──
    {
      title: "Training Hoodie",
      handle: "training-hoodie",
      description: "Technical training hoodie in quick-dry fabric. Thumbhole cuffs and media pocket.",
      category_ids: [catMap["Training"]],
      images: images.sweatshirt,
      weight: 420,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 64.99, usd: 74.99 }, "TRAIN-HOOD"),
    },
    {
      title: "Compression Leggings",
      handle: "compression-leggings",
      description: "High-performance compression leggings with graduated support. Squat-proof and ultra-stretchy.",
      category_ids: [catMap["Training"]],
      images: images.sweatpants,
      weight: 200,
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants({ eur: 54.99, usd: 64.99 }, "COMP-LEG"),
    },

    // ── Sport / Yoga ──
    {
      title: "Yoga Mat Bag",
      handle: "yoga-mat-bag",
      description: "Adjustable canvas carrier for standard yoga mats. Shoulder strap with zip pocket.",
      category_ids: [catMap["Yoga"]],
      images: images.teeBlack,
      weight: 250,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant({ eur: 29.99, usd: 34.99 }, "YOGA-BAG"),
    },
    {
      title: "High-Waist Yoga Pants",
      handle: "high-waist-yoga-pants",
      description: "Buttery-soft high-waist yoga pants with four-way stretch. Flat seams prevent chafing.",
      category_ids: [catMap["Yoga"]],
      images: images.sweatpants,
      weight: 220,
      options: [{ title: "Size", values: ["XS", "S", "M", "L"] }, { title: "Color", values: ["Black", "Deep Plum", "Forest"] }],
      variants: sizeColorVariants({ eur: 49.99, usd: 59.99 }, "YOGA-PANT", ["Black", "Deep Plum", "Forest"], ["XS", "S", "M", "L"]),
    },
  ];

  // Create products in batches of 5 to avoid overload
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await createProductsWorkflow(container).run({
      input: {
        products: batch.map((p) => ({
          ...p,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [salesChannelRef],
        })),
      },
    });
    logger.info(`Created products ${i + 1}-${Math.min(i + batchSize, products.length)} of ${products.length}`);
  }

  logger.info("Finished creating products.");

  // ─── INVENTORY ─────────────────────────────────────────────────

  logger.info("Setting up inventory levels...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // Get existing inventory levels to avoid duplicates
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: { location_id: stockLocation.id },
  });
  const existingItemIds = new Set(existingLevels.map((l: any) => l.inventory_item_id));

  const newLevels: CreateInventoryLevelInput[] = [];
  for (const item of inventoryItems) {
    if (!existingItemIds.has(item.id)) {
      newLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 500,
        inventory_item_id: item.id,
      });
    }
  }

  if (newLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: newLevels },
    });
    logger.info(`Created ${newLevels.length} inventory levels.`);
  }

  logger.info(`=== Rich Seed Complete: ${products.length} products, ${parents.length + children.length} categories ===`);
}
