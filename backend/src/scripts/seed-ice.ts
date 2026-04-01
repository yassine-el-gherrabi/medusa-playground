import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createCollectionsWorkflow,
  createProductsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"

const ICE = "https://iceindustry.fr/wp-content/uploads"
const UNS = "https://images.unsplash.com"

// ── Hero images for collections ──
const heroImages = {
  lineaNebula: `${UNS}/photo-1523398002811-999ca8dec234?w=1600&q=80`,
  oscura: `${UNS}/photo-1509631179647-0177331693ae?w=1600&q=80`,
  seamless: `${UNS}/photo-1551028719-00167b16eac5?w=1600&q=80`,
  iceReflect: `${UNS}/photo-1576566588028-4147f3842f27?w=1600&q=80`,
  abyss: `${UNS}/photo-1578681994506-b8f463449011?w=1600&q=80`,
  shadow: `${UNS}/photo-1441986300917-64674bd600d8?w=1600&q=80`,
  concrete: `${UNS}/photo-1483985988355-763728e1935b?w=1600&q=80`,
}

const catImages = {
  vetements: `${UNS}/photo-1490481651871-ab68de25d43d?w=800&q=80`,
  accessoires: `${UNS}/photo-1556306535-0f09a537f0a3?w=800&q=80`,
  chaussures: `${UNS}/photo-1542291026-7eec264c27ff?w=800&q=80`,
  iceForGirls: `${UNS}/photo-1483985988355-763728e1935b?w=800&q=80`,
}

// ── Variant helpers ──

type ColorImages = Record<string, { url: string }[]>

/** Create variants for each Couleur × Taille combination */
function colorSizeVariants(
  price: number,
  prefix: string,
  colors: string[],
  sizes = ["S", "M", "L", "XL"]
) {
  const variants: any[] = []
  for (let ci = 0; ci < colors.length; ci++) {
    const color = colors[ci]
    const colorCode = `C${ci + 1}` // C1, C2, C3 — avoids duplicates
    for (const size of sizes) {
      variants.push({
        title: `${color} / ${size}`,
        sku: `${prefix}-${colorCode}-${size}`,
        options: { Couleur: color, Taille: size },
        prices: [{ amount: price, currency_code: "eur" }],
      })
    }
  }
  return variants
}

/** Single-color size variants */
function sizeVariants(price: number, prefix: string, sizes = ["S", "M", "L", "XL"]) {
  return sizes.map((size) => ({
    title: size,
    sku: `${prefix}-${size}`,
    options: { Taille: size },
    prices: [{ amount: price, currency_code: "eur" }],
  }))
}

/** Accessory with color variants but no size */
function colorOnlyVariants(price: number, prefix: string, colors: string[]) {
  return colors.map((color, i) => ({
    title: color,
    sku: `${prefix}-C${i + 1}`,
    options: { Couleur: color },
    prices: [{ amount: price, currency_code: "eur" }],
  }))
}

/** Single variant (one-size accessories) */
function oneVariant(price: number, sku: string) {
  return [{ title: "Default", sku, options: { Type: "Default" }, prices: [{ amount: price, currency_code: "eur" }] }]
}

/** Flatten color_images map into product-level images array */
function flattenImages(colorImages: ColorImages): { url: string }[] {
  const seen = new Set<string>()
  const result: { url: string }[] = []
  for (const imgs of Object.values(colorImages)) {
    for (const img of imgs) {
      if (!seen.has(img.url)) {
        seen.add(img.url)
        result.push(img)
      }
    }
  }
  return result
}

// ── Real product images from iceindustry.fr ──

const productImages = {
  tshirtSeamless: {
    Bleu: [
      { url: `${ICE}/2026/02/IMG_0764-Photoroom-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/IMG_0772-Photoroom-1500x1500.jpeg` },
    ],
    Blanc: [
      { url: `${ICE}/2026/02/IMG_0775-Photoroom-1500x1500.jpeg` },
    ],
    Beige: [
      { url: `${ICE}/2026/02/IMG_0761-Photoroom-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/IMG_0771-Photoroom-1500x1500.jpeg` },
    ],
  },
  pantalonSeamless: {
    Noir: [
      { url: `${ICE}/2026/02/fbb51479-bfcc-4d7e-861c-0067aaf28200-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/7313c95c-42d4-43e3-9754-c912b7609254-1500x1500.jpeg` },
    ],
    Violet: [
      { url: `${ICE}/2026/02/98e1988b-6df1-4aaf-83b9-265fed70750e-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/7b665908-f36d-4343-9976-ab8f71b25f5d-1500x1500.jpeg` },
    ],
  },
  vesteSeamless: {
    Noir: [
      { url: `${ICE}/2026/02/a8b5d91b-6d66-4610-8433-46768eb81d8d-1-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/d4584ecf-7bf1-45cc-8051-ac04258fa23e-1500x1500.jpeg` },
    ],
    Bleu: [
      { url: `${ICE}/2026/02/d09c7fa2-1cc1-495e-bc80-f8ded7d14445-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/2266dc9e-528d-4452-88e2-5a474568fcab-1500x1500.jpeg` },
    ],
    Violet: [
      { url: `${ICE}/2026/02/3a7dbc1b-23f1-4bbd-9046-698c8dc637c9-1500x1500.jpeg` },
      { url: `${ICE}/2026/02/575596a4-35ed-42e5-a139-728327ad1cf9-1500x1500.jpeg` },
    ],
  },
  vesteLineaNebula: {
    Noir: [
      { url: `${ICE}/2025/12/Jacket_Black_0-1500x1500.png` },
      { url: `${ICE}/2025/12/Jacket_Black_6-1500x1500.png` },
    ],
    Gris: [
      { url: `${ICE}/2025/12/Jacket_8-1500x1500.png` },
      { url: `${ICE}/2025/12/Jacket_13-1500x1500.png` },
    ],
  },
  pantalonLineaNebula: {
    Noir: [
      { url: `${ICE}/2025/12/pants_0-1500x1500.png` },
      { url: `${ICE}/2025/12/pants_7-1500x1500.png` },
    ],
    Gris: [
      { url: `${ICE}/2025/12/trouser_grey_0-1500x1500.png` },
      { url: `${ICE}/2025/12/trouser_grey_5-1500x1500.png` },
    ],
    Vert: [
      { url: `${ICE}/2025/12/trouser_green_0-1500x1500.png` },
      { url: `${ICE}/2025/12/trouser_green_7-1500x1500.png` },
    ],
  },
  tshirtMLLineaNebula: [
    { url: `${ICE}/2025/12/long-sleeve_1-1500x1500.png` },
    { url: `${ICE}/2025/12/long-sleeve_6-1500x1500.png` },
  ],
  sweatOscura: [
    { url: `${ICE}/2025/12/IMG-20251202-WA0019-Photoroom-1500x1500.jpg` },
    { url: `${ICE}/2025/12/IMG-20251202-WA0004-Photoroom-1500x1500.jpg` },
  ],
  joggingOscura: [
    { url: `${ICE}/2025/12/IMG-20251202-WA0012-Photoroom-1500x1500.jpg` },
    { url: `${ICE}/2025/12/IMG-20251202-WA0013-Photoroom-1500x1500.jpg` },
  ],
  doudouneIceVest: [
    { url: `${ICE}/2026/02/0dd7989f-67af-48f9-b6df-6f34d0f9d6b2-1500x1500.jpeg` },
    { url: `${ICE}/2026/02/bd0a40e7-a023-4a46-a392-b47fe87319a5-1500x1500.jpeg` },
  ],
  downJacketPolaris: [
    { url: `${ICE}/2026/01/b760e0ed-aef2-49bb-93d5-f23442c84a9e-1500x1500.jpeg` },
    { url: `${ICE}/2026/01/4d401a97-6490-45e9-97df-263e4ddde926-1500x1500.jpeg` },
  ],
  casquetteMountain: [
    { url: `${ICE}/2026/02/ID9W0018-Photoroom-1500x1500.jpg` },
    { url: `${ICE}/2026/02/ID9W0019-Photoroom-1500x1500.jpg` },
  ],
  casquetteReflect: {
    "Noir V2": [
      { url: `${ICE}/2026/02/ID9W0008-Photoroom-1500x1500.jpg` },
      { url: `${ICE}/2026/02/ID9W0009-Photoroom-1500x1500.jpg` },
    ],
    "Noir/Gris": [
      { url: `${ICE}/2025/11/990f628a-7e20-4174-916c-8c495f2f729f.jpeg` },
      { url: `${ICE}/2025/11/9a67d195-efc1-4be1-96c1-250d90b3c202.jpeg` },
    ],
  },
}

export default async function seedIceData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("=== Ice Industry Seed: Starting ===")

  // ─── FIND EXISTING INFRASTRUCTURE ──────────────────────────────

  const [salesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannel) throw new Error("Run the default seed first (npx medusa exec src/scripts/seed.ts)")

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) throw new Error("No shipping profile found")

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  const defaultStockLocation = stockLocations[0]
  if (!defaultStockLocation) throw new Error("No stock location found")

  const salesChannelRef = { id: salesChannel.id }

  // ─── BOUTIQUE STOCK LOCATION ───────────────────────────────────

  logger.info("Creating Boutique Ice Industry Marseille stock location...")

  const { result: boutiqueLocations } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Boutique Ice Industry Marseille",
          address: {
            address_1: "2 Rue Grignan",
            city: "Marseille",
            postal_code: "13001",
            country_code: "fr",
          },
        },
      ],
    },
  })
  const boutiqueLocation = boutiqueLocations[0]
  logger.info(`Created boutique stock location: ${boutiqueLocation.id}`)

  // ─── SHIPPING OPTIONS ──────────────────────────────────────────

  logger.info("Updating shipping options...")

  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
  let fulfillmentSetId = fulfillmentSets[0]?.id

  if (!fulfillmentSetId) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Ice Industry Shipping",
      type: "shipping",
    })
    fulfillmentSetId = fulfillmentSet.id
  }

  const serviceZones = await fulfillmentModuleService.listServiceZones({
    fulfillment_set: { id: fulfillmentSetId },
  })
  let serviceZoneId = serviceZones[0]?.id

  if (!serviceZoneId) {
    const serviceZone = await fulfillmentModuleService.createServiceZones({
      name: "France",
      fulfillment_set_id: fulfillmentSetId,
      geo_zones: [{ type: "country", country_code: "fr" }],
    })
    serviceZoneId = serviceZone.id
  }

  const providers = await fulfillmentModuleService.listFulfillmentProviders({})
  const manualProvider = providers.find((p: any) => p.id.includes("manual")) || providers[0]

  if (manualProvider) {
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [{
          name: "Retrait en boutique (Click & Collect)",
          price_type: "flat",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          provider_id: manualProvider.id,
          type: { label: "Click & Collect", description: "Retrait en boutique", code: "click-collect" },
          prices: [{ currency_code: "eur", amount: 0 }],
        }],
      })
      logger.info("Created Click & Collect shipping option")
    } catch (e: any) { logger.warn(`Click & Collect: ${e.message}`) }

    try {
      await createShippingOptionsWorkflow(container).run({
        input: [{
          name: "Livraison Standard (3-5 jours)",
          price_type: "flat",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          provider_id: manualProvider.id,
          type: { label: "Standard", description: "Livraison standard", code: "standard" },
          prices: [{ currency_code: "eur", amount: 5.9 }],
        }],
      })
      logger.info("Created Standard shipping (5.90 EUR)")
    } catch (e: any) { logger.warn(`Standard shipping: ${e.message}`) }

    try {
      await createShippingOptionsWorkflow(container).run({
        input: [{
          name: "Livraison Express (1-2 jours)",
          price_type: "flat",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          provider_id: manualProvider.id,
          type: { label: "Express", description: "Livraison express", code: "express" },
          prices: [{ currency_code: "eur", amount: 9.9 }],
        }],
      })
      logger.info("Created Express shipping (9.90 EUR)")
    } catch (e: any) { logger.warn(`Express shipping: ${e.message}`) }
  }

  // ─── CATEGORIES ────────────────────────────────────────────────

  logger.info("Creating Ice Industry categories...")

  const { result: parents } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Vêtements", handle: "vetements", is_active: true, is_internal: false, metadata: { image: catImages.vetements } },
        { name: "Accessoires", handle: "accessoires", is_active: true, is_internal: false, metadata: { image: catImages.accessoires } },
        { name: "Chaussures", handle: "chaussures", is_active: true, is_internal: false, metadata: { image: catImages.chaussures } },
        { name: "Ice for Girls", handle: "ice-for-girls", is_active: true, is_internal: false, metadata: { image: catImages.iceForGirls } },
      ],
    },
  })

  const parentMap: Record<string, string> = {}
  for (const p of parents) parentMap[p.name] = p.id

  const { result: children } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Hauts", handle: "hauts", is_active: true, parent_category_id: parentMap["Vêtements"] },
        { name: "Bas", handle: "bas", is_active: true, parent_category_id: parentMap["Vêtements"] },
        { name: "Vestes & Manteaux", handle: "vestes-manteaux", is_active: true, parent_category_id: parentMap["Vêtements"] },
        { name: "Lunettes de soleil", handle: "lunettes-de-soleil", is_active: true, parent_category_id: parentMap["Accessoires"] },
        { name: "Casquettes", handle: "casquettes", is_active: true, parent_category_id: parentMap["Accessoires"] },
        { name: "Cache-cou", handle: "cache-cou", is_active: true, parent_category_id: parentMap["Accessoires"] },
      ],
    },
  })

  const catMap: Record<string, string> = {}
  for (const c of children) catMap[c.name] = c.id
  for (const p of parents) catMap[p.name] = p.id

  logger.info(`Created ${parents.length} parent + ${children.length} sub categories.`)

  // ─── COLLECTIONS ───────────────────────────────────────────────

  logger.info("Creating capsule collections...")

  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: "Seamless Bi-Material",
          handle: "seamless-bi-material",
          metadata: {
            hero_image: heroImages.seamless,
            description: "La fusion parfaite. Deux matières, zéro couture visible. Une collection technique qui repense les bases du streetwear.",
          },
        },
        {
          title: "Linea Nebula",
          handle: "linea-nebula",
          metadata: {
            hero_image: heroImages.lineaNebula,
            description: "Inspirée par les étoiles et la nuit marseillaise, Linea Nebula repousse les limites du streetwear avec des matières techniques et un design avant-gardiste.",
          },
        },
        {
          title: "Oscura",
          handle: "oscura",
          metadata: {
            hero_image: heroImages.oscura,
            description: "L'obscurité comme source d'inspiration. Des pièces sombres et élégantes pour ceux qui vivent la nuit.",
          },
        },
        {
          title: "Abyss",
          handle: "abyss",
          metadata: {
            hero_image: heroImages.abyss,
            description: "Plongée dans les profondeurs. Des teintes profondes, des coupes oversize et une identité visuelle brute.",
          },
        },
        {
          title: "ICE Reflect",
          handle: "ice-reflect",
          metadata: {
            hero_image: heroImages.iceReflect,
            description: "Reflets urbains. Des pièces aux finitions réfléchissantes qui captent la lumière de la ville.",
          },
        },
        {
          title: "Capsule Shadow",
          handle: "capsule-shadow",
          metadata: {
            hero_image: heroImages.shadow,
            description: "Dans l'ombre naît le style. Une capsule monochrome aux coupes affirmées.",
          },
        },
        {
          title: "Capsule Concrete",
          handle: "capsule-concrete",
          metadata: {
            hero_image: heroImages.concrete,
            description: "Née du béton. Inspirée par l'architecture brute de Marseille.",
          },
        },
      ],
    },
  })

  const colMap: Record<string, string> = {}
  for (const c of collections) colMap[c.title] = c.id

  logger.info(`Created ${collections.length} collections.`)

  // ─── PRODUCTS (real Ice Industry catalog) ──────────────────────

  logger.info("Creating Ice Industry products...")

  const products: any[] = [
    // ── SEAMLESS BI-MATERIAL ──
    {
      title: "T-shirt Seamless Bi-Material",
      handle: "tshirt-seamless-bi-material",
      description: "T-shirt bi-matière sans couture avec coupe technique. Un essentiel du streetwear revisité avec des matières premium.",
      category_ids: [catMap["Hauts"]],
      collection_id: colMap["Seamless Bi-Material"],
      images: flattenImages(productImages.tshirtSeamless),
      metadata: { color_images: productImages.tshirtSeamless, is_new: true },
      weight: 200,
      options: [
        { title: "Couleur", values: ["Bleu", "Blanc", "Beige"] },
        { title: "Taille", values: ["S", "M", "L", "XL"] },
      ],
      variants: colorSizeVariants(79.9, "ICE-TSB", ["Bleu", "Blanc", "Beige"]),
    },
    {
      title: "Pantalon Seamless",
      handle: "pantalon-seamless",
      description: "Pantalon technique sans couture. Coupe droite, taille élastiquée, finitions premium.",
      category_ids: [catMap["Bas"]],
      collection_id: colMap["Seamless Bi-Material"],
      images: flattenImages(productImages.pantalonSeamless),
      metadata: { color_images: productImages.pantalonSeamless },
      weight: 400,
      options: [
        { title: "Couleur", values: ["Noir", "Violet"] },
        { title: "Taille", values: ["S", "M", "L", "XL"] },
      ],
      variants: colorSizeVariants(100, "ICE-PS", ["Noir", "Violet"]),
    },
    {
      title: "Veste Seamless",
      handle: "veste-seamless",
      description: "Veste technique sans couture apparente. Zip intégral, poches zippées, coupe ajustée.",
      category_ids: [catMap["Vestes & Manteaux"]],
      collection_id: colMap["Seamless Bi-Material"],
      images: flattenImages(productImages.vesteSeamless),
      metadata: { color_images: productImages.vesteSeamless, compare_at_price: 160, is_new: true },
      weight: 500,
      options: [
        { title: "Couleur", values: ["Noir", "Bleu", "Violet"] },
        { title: "Taille", values: ["S", "M", "L", "XL"] },
      ],
      variants: colorSizeVariants(120, "ICE-VS", ["Noir", "Bleu", "Violet"]),
    },

    // ── LINEA NEBULA ──
    {
      title: "Veste Linea Nebula",
      handle: "veste-linea-nebula",
      description: "Veste signature de la collection Linea Nebula. Matières techniques, design avant-gardiste, détails réfléchissants.",
      category_ids: [catMap["Vestes & Manteaux"]],
      collection_id: colMap["Linea Nebula"],
      images: flattenImages(productImages.vesteLineaNebula),
      metadata: { color_images: productImages.vesteLineaNebula },
      weight: 550,
      options: [
        { title: "Couleur", values: ["Noir", "Gris"] },
        { title: "Taille", values: ["S", "M", "L", "XL"] },
      ],
      variants: colorSizeVariants(150, "ICE-VLN", ["Noir", "Gris"]),
    },
    {
      title: "Pantalon Linea Nebula",
      handle: "pantalon-linea-nebula",
      description: "Pantalon de la collection Linea Nebula. Coupe technique, poches cargo, finitions premium.",
      category_ids: [catMap["Bas"]],
      collection_id: colMap["Linea Nebula"],
      images: flattenImages(productImages.pantalonLineaNebula),
      metadata: { color_images: productImages.pantalonLineaNebula },
      weight: 450,
      options: [
        { title: "Couleur", values: ["Noir", "Gris", "Vert"] },
        { title: "Taille", values: ["S", "M", "L", "XL"] },
      ],
      variants: colorSizeVariants(145, "ICE-PLN", ["Noir", "Gris", "Vert"]),
    },
    {
      title: "T-shirt Manche Longue Linea Nebula",
      handle: "tshirt-ml-linea-nebula",
      description: "T-shirt manche longue de la collection Linea Nebula. Coton premium, coupe regular, logo brodé.",
      category_ids: [catMap["Hauts"]],
      collection_id: colMap["Linea Nebula"],
      images: productImages.tshirtMLLineaNebula,
      weight: 250,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(95, "ICE-TMLN"),
    },

    // ── OSCURA ──
    {
      title: "Sweat à Capuche Oscura",
      handle: "sweat-capuche-oscura",
      description: "Sweat à capuche de la collection Oscura. Molleton épais, coupe oversize, broderie logo ton sur ton.",
      category_ids: [catMap["Hauts"]],
      collection_id: colMap["Oscura"],
      images: productImages.sweatOscura,
      metadata: { is_sold_out: true },
      weight: 550,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(105, "ICE-SHO"),
    },
    {
      title: "Jogging Oscura",
      handle: "jogging-oscura",
      description: "Jogging de la collection Oscura. Molleton brossé, coupe slim, chevilles resserrées.",
      category_ids: [catMap["Bas"]],
      collection_id: colMap["Oscura"],
      images: productImages.joggingOscura,
      weight: 420,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(95, "ICE-JO"),
    },

    // ── PIÈCES STANDALONE ──
    {
      title: "Doudoune Ice Vest",
      handle: "doudoune-ice-vest",
      description: "Doudoune sans manches matelassée. Garnissage synthétique, col montant, fermeture zip.",
      category_ids: [catMap["Vestes & Manteaux"]],
      collection_id: colMap["Abyss"],
      images: productImages.doudouneIceVest,
      metadata: { compare_at_price: 300 },
      weight: 350,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(240, "ICE-VEST"),
    },
    {
      title: "Down Jacket Polaris",
      handle: "down-jacket-polaris",
      description: "Doudoune longue Polaris. Garnissage duvet, capuche amovible, coupe oversize. La pièce ultime pour l'hiver.",
      category_ids: [catMap["Vestes & Manteaux"]],
      collection_id: colMap["Abyss"],
      images: productImages.downJacketPolaris,
      weight: 800,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(300, "ICE-POL"),
    },

    // ── ACCESSOIRES ──
    {
      title: "Casquette ICE Mountain",
      handle: "casquette-ice-mountain",
      description: "Casquette structurée avec broderie ICE Mountain. Fermeture boucle métal, visière courbée.",
      category_ids: [catMap["Casquettes"]],
      collection_id: colMap["ICE Reflect"],
      images: productImages.casquetteMountain,
      weight: 80,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(74.99, "ICE-CMTN"),
    },
    {
      title: "Casquette ICE Reflect",
      handle: "casquette-ice-reflect",
      description: "Casquette ICE Reflect avec détails réfléchissants. Disponible en deux coloris.",
      category_ids: [catMap["Casquettes"]],
      collection_id: colMap["ICE Reflect"],
      images: flattenImages(productImages.casquetteReflect),
      metadata: { color_images: productImages.casquetteReflect },
      weight: 80,
      options: [{ title: "Couleur", values: ["Noir V2", "Noir/Gris"] }],
      variants: colorOnlyVariants(74.99, "ICE-CREF", ["Noir V2", "Noir/Gris"]),
    },
  ]

  // Create products in batches
  const batchSize = 4
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    await createProductsWorkflow(container).run({
      input: {
        products: batch.map((p) => ({
          ...p,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          sales_channels: [salesChannelRef],
        })),
      },
    })
    logger.info(`Created products ${i + 1}-${Math.min(i + batchSize, products.length)} of ${products.length}`)
  }

  logger.info("Finished creating products.")

  // ─── INVENTORY ─────────────────────────────────────────────────

  logger.info("Setting up inventory levels...")

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: { location_id: defaultStockLocation.id },
  })
  const existingItemIds = new Set(existingLevels.map((l: any) => l.inventory_item_id))

  const newLevels: CreateInventoryLevelInput[] = []
  for (const item of inventoryItems) {
    if (!existingItemIds.has(item.id)) {
      newLevels.push({
        location_id: defaultStockLocation.id,
        stocked_quantity: 50,
        inventory_item_id: item.id,
      })
    }
  }

  if (newLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: newLevels },
    })
    logger.info(`Created ${newLevels.length} inventory levels (default location).`)
  }

  const boutiqueLevels: CreateInventoryLevelInput[] = inventoryItems.map((item: any) => ({
    location_id: boutiqueLocation.id,
    stocked_quantity: 10,
    inventory_item_id: item.id,
  }))

  if (boutiqueLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: boutiqueLevels },
    })
    logger.info(`Created ${boutiqueLevels.length} inventory levels (boutique Marseille).`)
  }

  logger.info(`=== Ice Industry Seed Complete: ${products.length} products, ${parents.length + children.length} categories, ${collections.length} collections ===`)
}
