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

const IMG = "https://medusa-public-images.s3.eu-west-1.amazonaws.com"

const images = {
  teeBlack: [{ url: `${IMG}/tee-black-front.png` }, { url: `${IMG}/tee-black-back.png` }],
  teeWhite: [{ url: `${IMG}/tee-white-front.png` }, { url: `${IMG}/tee-white-back.png` }],
  sweatshirt: [{ url: `${IMG}/sweatshirt-vintage-front.png` }, { url: `${IMG}/sweatshirt-vintage-back.png` }],
  sweatpants: [{ url: `${IMG}/sweatpants-gray-front.png` }, { url: `${IMG}/sweatpants-gray-back.png` }],
  shorts: [{ url: `${IMG}/shorts-vintage-front.png` }, { url: `${IMG}/shorts-vintage-back.png` }],
}

function sizeVariants(price: number, prefix: string, sizes = ["S", "M", "L", "XL"]) {
  return sizes.map((size) => ({
    title: size,
    sku: `${prefix}-${size}`,
    options: { Taille: size },
    prices: [{ amount: price, currency_code: "eur" }],
  }))
}

function shoeVariants(price: number, prefix: string) {
  const sizes = ["39", "40", "41", "42", "43", "44", "45"]
  return sizes.map((size) => ({
    title: `EU ${size}`,
    sku: `${prefix}-${size}`,
    options: { Pointure: size },
    prices: [{ amount: price, currency_code: "eur" }],
  }))
}

function oneVariant(price: number, sku: string) {
  return [
    {
      title: "Default",
      sku,
      options: { Type: "Default" },
      prices: [{ amount: price, currency_code: "eur" }],
    },
  ]
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
            address_1: "42 Rue de la République",
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

  // Find existing fulfillment sets
  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
  let fulfillmentSetId = fulfillmentSets[0]?.id

  if (!fulfillmentSetId) {
    logger.info("No fulfillment set found, creating one...")
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Ice Industry Shipping",
      type: "shipping",
    })
    fulfillmentSetId = fulfillmentSet.id
  }

  // Find existing service zones or create one
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

  // Find shipping option providers
  const providers = await fulfillmentModuleService.listFulfillmentProviders({})
  const manualProvider = providers.find((p: any) => p.id.includes("manual")) || providers[0]

  if (manualProvider) {
    // Create Click & Collect shipping option
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Retrait en boutique (Click & Collect)",
            price_type: "flat",
            service_zone_id: serviceZoneId,
            shipping_profile_id: shippingProfile.id,
            provider_id: manualProvider.id,
            type: { label: "Click & Collect", description: "Retrait en boutique", code: "click-collect" },
            prices: [{ currency_code: "eur", amount: 0 }],
          },
        ],
      })
      logger.info("Created Click & Collect shipping option")
    } catch (e: any) {
      logger.warn(`Click & Collect shipping option: ${e.message}`)
    }

    // Create Standard shipping
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Livraison Standard (3-5 jours)",
            price_type: "flat",
            service_zone_id: serviceZoneId,
            shipping_profile_id: shippingProfile.id,
            provider_id: manualProvider.id,
            type: { label: "Standard", description: "Livraison standard", code: "standard" },
            prices: [{ currency_code: "eur", amount: 5.9 }],
          },
        ],
      })
      logger.info("Created Standard shipping option (5.90 EUR)")
    } catch (e: any) {
      logger.warn(`Standard shipping: ${e.message}`)
    }

    // Create Express shipping
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Livraison Express (1-2 jours)",
            price_type: "flat",
            service_zone_id: serviceZoneId,
            shipping_profile_id: shippingProfile.id,
            provider_id: manualProvider.id,
            type: { label: "Express", description: "Livraison express", code: "express" },
            prices: [{ currency_code: "eur", amount: 9.9 }],
          },
        ],
      })
      logger.info("Created Express shipping option (9.90 EUR)")
    } catch (e: any) {
      logger.warn(`Express shipping: ${e.message}`)
    }
  }

  // ─── CATEGORIES ────────────────────────────────────────────────

  logger.info("Creating Ice Industry categories...")

  const { result: parents } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        { name: "Vetements", handle: "vetements", is_active: true, is_internal: false },
        { name: "Accessoires", handle: "accessoires", is_active: true, is_internal: false },
        { name: "Chaussures", handle: "chaussures", is_active: true, is_internal: false },
        { name: "Ice for Girls", handle: "ice-for-girls", is_active: true, is_internal: false },
      ],
    },
  })

  const parentMap: Record<string, string> = {}
  for (const p of parents) parentMap[p.name] = p.id

  const { result: children } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        // Accessoires subcategories
        { name: "Lunettes de soleil", handle: "lunettes", is_active: true, parent_category_id: parentMap["Accessoires"] },
        { name: "Casquettes", handle: "casquettes", is_active: true, parent_category_id: parentMap["Accessoires"] },
        { name: "Cache-cou", handle: "cache-cou", is_active: true, parent_category_id: parentMap["Accessoires"] },
        // Chaussures subcategories
        { name: "Nike", handle: "chaussures-nike", is_active: true, parent_category_id: parentMap["Chaussures"] },
        { name: "Jordan", handle: "chaussures-jordan", is_active: true, parent_category_id: parentMap["Chaussures"] },
        { name: "New Balance", handle: "chaussures-new-balance", is_active: true, parent_category_id: parentMap["Chaussures"] },
      ],
    },
  })

  const catMap: Record<string, string> = {}
  for (const c of children) catMap[c.name] = c.id
  for (const p of parents) catMap[p.name] = p.id

  logger.info(`Created ${parents.length} parent + ${children.length} sub categories.`)

  // ─── COLLECTIONS (CAPSULES) ────────────────────────────────────

  logger.info("Creating capsule collections...")

  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: "Capsule Origines",
          handle: "capsule-origines",
          metadata: {
            hero_image: `${IMG}/sweatshirt-vintage-front.png`,
            description: "La collection qui a tout lance. Retour aux sources du streetwear marseillais avec des pieces iconiques qui ont defini l'identite Ice Industry.",
            shoot_gallery: [
              `${IMG}/tee-black-front.png`,
              `${IMG}/sweatshirt-vintage-front.png`,
              `${IMG}/sweatpants-gray-front.png`,
            ],
          },
        },
        {
          title: "Capsule Nuit",
          handle: "capsule-nuit",
          metadata: {
            hero_image: `${IMG}/tee-black-front.png`,
            description: "Inspiree par les nuits marseillaises. Des pieces sombres et elegantes pour ceux qui vivent la nuit, avec des details reflectifs et des coupes modernes.",
            shoot_gallery: [
              `${IMG}/tee-black-front.png`,
              `${IMG}/tee-black-back.png`,
              `${IMG}/shorts-vintage-front.png`,
            ],
          },
        },
        {
          title: "Capsule Blaze",
          handle: "capsule-blaze",
          metadata: {
            hero_image: `${IMG}/tee-white-front.png`,
            description: "Le feu interieur. Une collection audacieuse qui melange couleurs vives et coupes streetwear pour affirmer votre style sans compromis.",
            shoot_gallery: [
              `${IMG}/tee-white-front.png`,
              `${IMG}/tee-white-back.png`,
              `${IMG}/sweatshirt-vintage-back.png`,
            ],
          },
        },
        {
          title: "Capsule Arctic",
          handle: "capsule-arctic",
          metadata: {
            hero_image: `${IMG}/sweatshirt-vintage-front.png`,
            description: "La derniere capsule Ice Industry. Inspiree par le froid et la purete, cette collection repousse les limites du streetwear avec des matieres techniques et un design avant-gardiste.",
            shoot_gallery: [
              `${IMG}/sweatshirt-vintage-front.png`,
              `${IMG}/sweatshirt-vintage-back.png`,
              `${IMG}/sweatpants-gray-front.png`,
            ],
          },
        },
      ],
    },
  })

  const collectionMap: Record<string, string> = {}
  for (const c of collections) collectionMap[c.title] = c.id

  logger.info(`Created ${collections.length} capsule collections.`)

  // ─── PRODUCTS ──────────────────────────────────────────────────

  logger.info("Creating Ice Industry products...")

  const products: any[] = [
    // ── Vetements ──
    {
      title: "Hoodie Ice Classic",
      handle: "hoodie-ice-classic",
      description: "Le hoodie signature Ice Industry. Coton epais 400g, coupe oversize, broderie logo sur la poitrine. Un incontournable du streetwear marseillais.",
      category_ids: [catMap["Vetements"]],
      collection_id: collectionMap["Capsule Arctic"],
      images: images.sweatshirt,
      weight: 550,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(69, "ICE-HOOD"),
    },
    {
      title: "T-shirt Logo Ice",
      handle: "t-shirt-logo-ice",
      description: "T-shirt 100% coton organique avec le logo Ice Industry serigraphie. Coupe regular, col rond renforce.",
      category_ids: [catMap["Vetements"]],
      collection_id: collectionMap["Capsule Arctic"],
      images: images.teeBlack,
      weight: 200,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(35, "ICE-TEE"),
    },
    {
      title: "Pantalon Cargo Ice",
      handle: "pantalon-cargo-ice",
      description: "Cargo en toile resistante avec poches laterales et broderie Ice. Coupe large, taille ajustable par cordon.",
      category_ids: [catMap["Vetements"]],
      collection_id: collectionMap["Capsule Blaze"],
      images: images.sweatpants,
      weight: 500,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(79, "ICE-CARGO"),
    },
    {
      title: "Veste Coupe-vent Ice",
      handle: "veste-coupe-vent-ice",
      description: "Coupe-vent leger impermeable avec capuche escamotable. Bandes reflechissantes et logo Ice brode.",
      category_ids: [catMap["Vetements"]],
      collection_id: collectionMap["Capsule Nuit"],
      images: images.sweatshirt,
      weight: 350,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(99, "ICE-WIND"),
    },
    {
      title: "Jogging Essential Ice",
      handle: "jogging-essential-ice",
      description: "Jogging en molleton brosse, coupe slim avec chevilles resserrees. Logo Ice Industry brode sur la cuisse.",
      category_ids: [catMap["Vetements"]],
      collection_id: collectionMap["Capsule Origines"],
      images: images.sweatpants,
      weight: 420,
      options: [{ title: "Taille", values: ["S", "M", "L", "XL"] }],
      variants: sizeVariants(59, "ICE-JOG"),
    },

    // ── Ice for Girls ──
    {
      title: "Robe Ice Flow",
      handle: "robe-ice-flow",
      description: "Robe mi-longue en jersey stretch avec logo Ice subtil. Coupe fluide et confortable, parfaite du matin au soir.",
      category_ids: [catMap["Ice for Girls"]],
      collection_id: collectionMap["Capsule Blaze"],
      images: images.teeWhite,
      weight: 250,
      options: [{ title: "Taille", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants(65, "ICE-ROBE", ["XS", "S", "M", "L"]),
    },
    {
      title: "Crop Top Ice",
      handle: "crop-top-ice",
      description: "Crop top en coton cotelee avec logo Ice brode. Coupe ajustee, finitions soignees.",
      category_ids: [catMap["Ice for Girls"]],
      collection_id: collectionMap["Capsule Blaze"],
      images: images.teeWhite,
      weight: 120,
      options: [{ title: "Taille", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants(29, "ICE-CROP", ["XS", "S", "M", "L"]),
    },
    {
      title: "Jupe Ice Street",
      handle: "jupe-ice-street",
      description: "Mini-jupe cargo avec poches a rabat et logo Ice. Toile stretch pour un confort optimal.",
      category_ids: [catMap["Ice for Girls"]],
      collection_id: collectionMap["Capsule Nuit"],
      images: images.shorts,
      weight: 220,
      options: [{ title: "Taille", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants(45, "ICE-JUPE", ["XS", "S", "M", "L"]),
    },
    {
      title: "Hoodie Ice for Girls",
      handle: "hoodie-ice-for-girls",
      description: "Hoodie oversized adapte a la morphologie feminine. Coton 400g, broderie Ice for Girls exclusive.",
      category_ids: [catMap["Ice for Girls"]],
      collection_id: collectionMap["Capsule Arctic"],
      images: images.sweatshirt,
      weight: 500,
      options: [{ title: "Taille", values: ["XS", "S", "M", "L"] }],
      variants: sizeVariants(69, "ICE-HOODG", ["XS", "S", "M", "L"]),
    },

    // ── Accessoires / Lunettes ──
    {
      title: "Lunettes Ice Shade",
      handle: "lunettes-ice-shade",
      description: "Lunettes de soleil polarisees monture acetate. Protection UV400. Logo Ice grave sur les branches.",
      category_ids: [catMap["Lunettes de soleil"]],
      collection_id: collectionMap["Capsule Blaze"],
      images: images.teeBlack,
      weight: 35,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(45, "ICE-SHADE"),
    },
    {
      title: "Lunettes Ice Mirror",
      handle: "lunettes-ice-mirror",
      description: "Lunettes de soleil verres miroir avec monture metallique fine. Style aviateur revisite par Ice Industry.",
      category_ids: [catMap["Lunettes de soleil"]],
      images: images.teeBlack,
      weight: 30,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(55, "ICE-MIRROR"),
    },

    // ── Accessoires / Casquettes ──
    {
      title: "Casquette Logo Ice",
      handle: "casquette-logo-ice",
      description: "Casquette 6 panels en coton brosse avec logo Ice Industry brode en facade. Fermeture boucle metal.",
      category_ids: [catMap["Casquettes"]],
      collection_id: collectionMap["Capsule Origines"],
      images: images.teeBlack,
      weight: 80,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(35, "ICE-CAP"),
    },
    {
      title: "Casquette Snapback Ice",
      handle: "casquette-snapback-ice",
      description: "Snapback structuree avec visiere plate. Broderie 3D du logo Ice et fermeture snap reglable.",
      category_ids: [catMap["Casquettes"]],
      collection_id: collectionMap["Capsule Nuit"],
      images: images.teeBlack,
      weight: 90,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(39, "ICE-SNAP"),
    },

    // ── Accessoires / Cache-cou ──
    {
      title: "Cache-cou Polar Ice",
      handle: "cache-cou-polar-ice",
      description: "Cache-cou en polaire douce avec logo Ice Industry. Polyvalent : tour de cou, bonnet, bandeau. Parfait pour le mistral.",
      category_ids: [catMap["Cache-cou"]],
      collection_id: collectionMap["Capsule Arctic"],
      images: images.sweatshirt,
      weight: 60,
      options: [{ title: "Type", values: ["Default"] }],
      variants: oneVariant(25, "ICE-NECK"),
    },

    // ── Chaussures ──
    {
      title: "Nike Air Max Ice Edition",
      handle: "nike-air-max-ice",
      description: "Air Max exclusivite Ice Industry. Coloris glacier unique, semelle Air visible, details glaces sur le talon.",
      category_ids: [catMap["Nike"]],
      images: images.shorts,
      weight: 400,
      options: [{ title: "Pointure", values: ["39", "40", "41", "42", "43", "44", "45"] }],
      variants: shoeVariants(159, "ICE-AMAX"),
    },
    {
      title: "Jordan 1 Ice Edition",
      handle: "jordan-1-ice",
      description: "Jordan 1 High en collaboration Ice Industry. Cuir premium blanc et bleu glacier, swoosh glace.",
      category_ids: [catMap["Jordan"]],
      images: images.shorts,
      weight: 450,
      options: [{ title: "Pointure", values: ["39", "40", "41", "42", "43", "44", "45"] }],
      variants: shoeVariants(189, "ICE-J1"),
    },
    {
      title: "New Balance 550 Ice Edition",
      handle: "nb-550-ice",
      description: "New Balance 550 revisitee par Ice Industry. Cuir blanc, accents bleu polaire, semelle gomme.",
      category_ids: [catMap["New Balance"]],
      images: images.shorts,
      weight: 380,
      options: [{ title: "Pointure", values: ["39", "40", "41", "42", "43", "44", "45"] }],
      variants: shoeVariants(149, "ICE-NB550"),
    },
    {
      title: "Nike Dunk Low Ice Edition",
      handle: "nike-dunk-low-ice",
      description: "Dunk Low aux couleurs Ice Industry. Cuir tumbled, double branding, lacets assortis inclus.",
      category_ids: [catMap["Nike"]],
      images: images.shorts,
      weight: 370,
      options: [{ title: "Pointure", values: ["39", "40", "41", "42", "43", "44", "45"] }],
      variants: shoeVariants(129, "ICE-DUNK"),
    },
  ]

  // Create products in batches of 5
  const batchSize = 5
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

  // Set inventory for default location
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
        stocked_quantity: 100,
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

  // Set inventory for boutique location
  const boutiqueLevels: CreateInventoryLevelInput[] = inventoryItems.map((item: any) => ({
    location_id: boutiqueLocation.id,
    stocked_quantity: 20,
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
