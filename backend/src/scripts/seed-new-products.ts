import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createCollectionsWorkflow,
} from "@medusajs/medusa/core-flows"

const IMG = "https://api.iceindustry.fr/images"

// ── Image maps per product slug and color ──

const productImages: Record<string, Record<string, { url: string }[]>> = {
  "veste-nylon-patchwork": {
    Kaki: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-nylon-patchwork-kaki/${n}.jpg` })),
    Noir: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-nylon-patchwork-noir/${n}.jpg` })),
    Gris: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-nylon-patchwork-gris/${n}.jpg` })),
  },
  "pantalon-nylon-patchwork": {
    Kaki: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/pantalon-nylon-patchwork-kaki/${n}.jpg` })),
    Noir: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/pantalon-nylon-patchwork-noir/${n}.jpg` })),
    Gris: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/pantalon-nylon-patchwork-gris/${n}.jpg` })),
  },
  "hoodie-ice": {
    Gris: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/hoodie-gris/${n}.jpg` })),
    Noir: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/hoodie-noir/${n}.jpg` })),
  },
  "jogger-ice": {
    Gris: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/jogger-gris/${n}.jpg` })),
    Noir: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/jogger-noir/${n}.jpg` })),
  },
  "tshirt-coutures-courbes": {
    Noir: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/tshirt-coutures-courbes-noir/${n}.jpg` })),
  },
  "tshirt-ml-patchwork": {
    Gris: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/tshirt-ml-patchwork-gris/${n}.jpg` })),
  },
  "veste-softshell": {
    Noir: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-softshell-noir/${n}.jpg` })),
    Beige: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-softshell-beige/${n}.jpg` })),
    Violet: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/veste-softshell-violet/${n}.jpg` })),
  },
  "pantalon-cargo-mesh": {
    Noir: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/pantalon-cargo-mesh-noir/${n}.jpg` })),
    Beige: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/pantalon-cargo-mesh-beige/${n}.jpg` })),
    Violet: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/pantalon-cargo-mesh-violet/${n}.jpg` })),
  },
  "tshirt-mesh": {
    Noir: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/tshirt-mesh-noir/${n}.jpg` })),
    Beige: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/tshirt-mesh-beige/${n}.jpg` })),
    Navy: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/tshirt-mesh-navy/${n}.jpg` })),
  },
  "zip-top-mesh": {
    Violet: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/zip-top-mesh-violet/${n}.jpg` })),
  },
  "short-mesh": {
    Violet: [1, 2, 3, 4].map((n) => ({ url: `${IMG}/short-mesh-violet/${n}.jpg` })),
  },
  "doudoune-sans-manches": {
    Noir: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/doudoune-sans-manches-noir/${n}.jpg` })),
  },
  "doudoune-ice": {
    Noir: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `${IMG}/doudoune-noir/${n}.jpg` })),
  },
  "lunettes-ice": {
    Écaille: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/lunettes-ice/${n}.jpg` })),
  },
  "casquette-ice": {
    Noir: [1, 2, 3, 4, 5].map((n) => ({ url: `${IMG}/casquette-noir/${n}.jpg` })),
  },
}

// Flatten all color images into a single array for the product
function flattenImages(colorMap: Record<string, { url: string }[]>): { url: string }[] {
  const seen = new Set<string>()
  const result: { url: string }[] = []
  for (const imgs of Object.values(colorMap)) {
    for (const img of imgs) {
      if (!seen.has(img.url)) {
        seen.add(img.url)
        result.push(img)
      }
    }
  }
  return result
}

// ── Product definitions ──

interface ProductDef {
  title: string
  handle: string
  description: string
  collection: string
  category: string
  colors: string[]
  sizes: string[]
  price: number
  weight: number
  model_info?: string
  editorial?: { label: string; text: string }[]
}

const products: ProductDef[] = [
  {
    title: "Veste Nylon Patchwork",
    handle: "veste-nylon-patchwork",
    description: "Veste à capuche en nylon avec coutures patchwork courbes. Zip intégral, patch Ice Industry sur le bras, boutons-pression aux poignets.",
    collection: "Nylon Patchwork",
    category: "Vestes & Manteaux",
    colors: ["Kaki", "Noir", "Gris"],
    sizes: ["S", "M", "L", "XL"],
    price: 160,
    weight: 550,
    model_info: "Le mannequin mesure 185 cm et porte du M",
    editorial: [
      { label: "Matière · Nylon technique", text: "Nylon haute densité avec coutures patchwork courbes, signature de la collection. Résistant à l'eau et au vent, doublure mesh respirante." },
      { label: "Fabrication · Atelier Marseille", text: "Chaque pièce est assemblée à la main dans notre atelier. Coutures courbes réalisées sur machines industrielles japonaises, finitions bords francs." },
    ],
  },
  {
    title: "Pantalon Nylon Patchwork",
    handle: "pantalon-nylon-patchwork",
    description: "Pantalon en nylon avec coutures patchwork courbes. Taille élastique, patch Ice Industry, bas resserré.",
    collection: "Nylon Patchwork",
    category: "Bas",
    colors: ["Kaki", "Noir", "Gris"],
    sizes: ["S", "M", "L", "XL"],
    price: 120,
    weight: 400,
    model_info: "Le mannequin mesure 185 cm et porte du M",
    editorial: [
      { label: "Matière · Nylon technique", text: "Même nylon haute densité que la veste, coutures patchwork courbes. Taille élastique avec cordon intérieur, bas resserré." },
      { label: "Coupe · Relaxed tapered", text: "Coupe ample à la cuisse, resserrée à la cheville. Pensée pour le mouvement urbain, portée basse sur les hanches." },
    ],
  },
  {
    title: "Hoodie Ice Industry",
    handle: "hoodie-ice",
    description: "Sweat à capuche en coton fleece. Poche kangourou, patch Ice Industry sur le bras, genouillères articulées.",
    collection: "Fleece",
    category: "Hauts",
    colors: ["Gris", "Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 110,
    weight: 500,
    model_info: "Le mannequin mesure 182 cm / 75 kg et porte du M",
    editorial: [
      { label: "Matière · Coton fleece 400 g/m²", text: "Fleece lourd en coton brossé, toucher doux à l'intérieur. Poche kangourou renforcée, capuche doublée." },
      { label: "Détails · Patch brodé", text: "Patch Ice Industry brodé sur le bras gauche. Bords-côtes nervurés aux poignets et à la taille, surpiqûres ton-sur-ton." },
    ],
  },
  {
    title: "Jogger Ice Industry",
    handle: "jogger-ice",
    description: "Pantalon jogger en coton fleece. Taille élastique avec cordon, poches cargo latérales, patch Ice Industry.",
    collection: "Fleece",
    category: "Bas",
    colors: ["Gris", "Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 95,
    weight: 420,
    model_info: "Le mannequin mesure 182 cm / 75 kg et porte du M",
  },
  {
    title: "T-shirt Coutures Courbes",
    handle: "tshirt-coutures-courbes",
    description: "T-shirt technique avec coutures courbes en nylon. Coupe ajustée, logo Ice Industry.",
    collection: "Nylon Patchwork",
    category: "Hauts",
    colors: ["Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 75,
    weight: 200,
    model_info: "Le mannequin mesure 185 cm et porte du M",
  },
  {
    title: "T-shirt Manches Longues Patchwork",
    handle: "tshirt-ml-patchwork",
    description: "T-shirt manches longues avec coutures patchwork. Nylon technique, logo Ice Industry.",
    collection: "Nylon Patchwork",
    category: "Hauts",
    colors: ["Gris"],
    sizes: ["S", "M", "L", "XL"],
    price: 85,
    weight: 250,
    model_info: "Le mannequin mesure 185 cm et porte du M",
  },
  {
    title: "Veste Softshell",
    handle: "veste-softshell",
    description: "Veste à capuche softshell avec panneaux mesh aux épaules. Zip intégral, poches zippées, coupe technique.",
    collection: "Softshell Mesh",
    category: "Vestes & Manteaux",
    colors: ["Noir", "Beige", "Violet"],
    sizes: ["S", "M", "L", "XL"],
    price: 150,
    weight: 500,
    model_info: "Le mannequin mesure 187 cm / 78 kg et porte du L",
    editorial: [
      { label: "Matière · Softshell 3 couches", text: "Tissu softshell triple couche : extérieur déperlant, membrane coupe-vent, intérieur micro-polaire. Panneaux mesh aux épaules pour la ventilation." },
      { label: "Construction · Technique", text: "Coutures thermosoudées, zips étanches YKK, capuche ajustable. Conçue pour la transition entre l'urbain et l'outdoor." },
    ],
  },
  {
    title: "Pantalon Cargo Mesh",
    handle: "pantalon-cargo-mesh",
    description: "Pantalon cargo avec panneaux mesh. Poches cargo latérales, taille élastique, coupe relaxed.",
    collection: "Softshell Mesh",
    category: "Bas",
    colors: ["Noir", "Beige", "Violet"],
    sizes: ["S", "M", "L", "XL"],
    price: 110,
    weight: 380,
    model_info: "Le mannequin mesure 187 cm / 78 kg et porte du L",
    editorial: [
      { label: "Matière · Nylon + Mesh", text: "Nylon ripstop léger avec inserts mesh aux genoux et à l'arrière. Poches cargo à rabat avec boutons-pression." },
      { label: "Coupe · Cargo relaxed", text: "Taille élastique avec cordon, coupe droite généreuse. Six poches au total dont deux cargo latérales à soufflet." },
    ],
  },
  {
    title: "T-shirt Mesh",
    handle: "tshirt-mesh",
    description: "T-shirt avec panneaux mesh aux épaules. Coupe régulière, finitions techniques.",
    collection: "Softshell Mesh",
    category: "Hauts",
    colors: ["Noir", "Beige", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    price: 70,
    weight: 180,
    model_info: "Le mannequin mesure 185 cm et porte du M",
    editorial: [
      { label: "Matière · Jersey + Mesh", text: "Corps en jersey de coton 180 g/m², panneaux mesh techniques aux épaules. Respirabilité maximale sans sacrifier le style." },
      { label: "Finitions · Détails techniques", text: "Col renforcé double épaisseur, ourlet arrondi, étiquette tissée Ice Industry au col. Coupe régulière, épaule tombante." },
    ],
  },
  {
    title: "Zip Top Mesh",
    handle: "zip-top-mesh",
    description: "Top zippé manches courtes avec panneaux mesh. Col montant, zip intégral.",
    collection: "Softshell Mesh",
    category: "Hauts",
    colors: ["Violet"],
    sizes: ["S", "M", "L", "XL"],
    price: 80,
    weight: 200,
    model_info: "Le mannequin mesure 185 cm et porte du M",
  },
  {
    title: "Short Mesh",
    handle: "short-mesh",
    description: "Short avec panneaux mesh. Taille élastique, poches latérales.",
    collection: "Softshell Mesh",
    category: "Bas",
    colors: ["Violet"],
    sizes: ["S", "M", "L", "XL"],
    price: 65,
    weight: 200,
    model_info: "Le mannequin mesure 185 cm et porte du M",
  },
  {
    title: "Doudoune Sans Manches",
    handle: "doudoune-sans-manches",
    description: "Doudoune sans manches matelassée. Col montant, zip intégral, poches latérales zippées.",
    collection: "Matelassé",
    category: "Vestes & Manteaux",
    colors: ["Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 140,
    weight: 350,
    model_info: "Le mannequin mesure 185 cm et porte du M",
    editorial: [
      { label: "Garnissage · Duvet synthétique", text: "Isolation en duvet synthétique haute performance. Idéale en couche intermédiaire ou seule en mi-saison." },
      { label: "Design · Minimaliste", text: "Col montant, zip intégral, poches latérales zippées invisibles. Silhouette épurée, matelassage fin et discret." },
    ],
  },
  {
    title: "Doudoune Ice Industry",
    handle: "doudoune-ice",
    description: "Doudoune matelassée longue. Capuche, zip intégral, poches latérales et intérieures.",
    collection: "Matelassé",
    category: "Vestes & Manteaux",
    colors: ["Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 180,
    weight: 800,
    model_info: "Le mannequin mesure 187 cm / 78 kg et porte du L",
    editorial: [
      { label: "Garnissage · Duvet synthétique", text: "Isolation en duvet synthétique haute performance. Rapport chaleur/poids optimal, garde ses propriétés même humide." },
      { label: "Design · Matelassé signature", text: "Matelassage horizontal asymétrique, capuche amovible. Poches latérales zippées et poche intérieure sécurisée." },
    ],
  },
  {
    title: "Lunettes Ice Industry",
    handle: "lunettes-ice",
    description: "Lunettes de soleil Ice Industry. Monture écaille, verres teintés.",
    collection: "Accessoires Ice",
    category: "Accessoires",
    colors: ["Écaille"],
    sizes: [],
    price: 75,
    weight: 30,
  },
  {
    title: "Casquette Ice Industry",
    handle: "casquette-ice",
    description: "Casquette Ice Industry. Logo brodé, visière courbée, ajustement arrière.",
    collection: "Accessoires Ice",
    category: "Accessoires",
    colors: ["Noir"],
    sizes: [],
    price: 35,
    weight: 80,
  },
]

// ── Seed function ──

export default async function seedNewProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger") as any
  const query = container.resolve("query") as any
  const pricingService = container.resolve(Modules.PRICING) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL) as any
  const inventoryService = container.resolve(Modules.INVENTORY) as any
  const linkService = container.resolve("remoteLink") as any

  logger.info("=== Seed New Products: Starting ===")

  // Get existing store data
  const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id"] })
  const salesChannel = salesChannels[0]
  if (!salesChannel) throw new Error("No sales channel found")

  const { data: stockLocations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const defaultLocation = stockLocations.find((l: any) => l.name === "Entrepôt principal") || stockLocations[0]
  if (!defaultLocation) throw new Error("No stock location found")

  // ── Create collections ──
  const collectionNames = [...new Set(products.map((p) => p.collection))]
  const collectionDescriptions: Record<string, string> = {
    "Nylon Patchwork": "Coutures courbes en nylon technique. La signature Ice Industry.",
    "Softshell Mesh": "Panneaux mesh et softshell. Performance et style urbain.",
    "Fleece": "Coton fleece premium. Confort et durabilité au quotidien.",
    "Matelassé": "Doudounes matelassées. Protection contre le froid marseillais.",
    "Accessoires Ice": "Lunettes, casquettes et accessoires Ice Industry.",
  }

  logger.info(`Creating ${collectionNames.length} collections...`)
  const { result: createdCollections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: collectionNames.map((name) => ({
        title: name,
        handle: name.toLowerCase().replace(/ /g, "-").replace(/é/g, "e"),
        metadata: {
          description: collectionDescriptions[name] || "",
          hero_image: `https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&q=80`,
        },
      })),
    },
  })
  const colMap: Record<string, string> = {}
  createdCollections.forEach((c: any) => { colMap[c.title] = c.id })
  logger.info(`Created ${createdCollections.length} collections`)

  // ── Get existing categories ──
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const catMap: Record<string, string> = {}
  existingCategories.forEach((c: any) => { catMap[c.name] = c.id })

  // Create missing categories
  const neededCats = [...new Set(products.map((p) => p.category))].filter((c) => !catMap[c])
  if (neededCats.length > 0) {
    logger.info(`Creating ${neededCats.length} missing categories...`)
    const { result: newCats } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: neededCats.map((name) => ({ name, is_active: true })) },
    })
    newCats.forEach((c: any) => { catMap[c.name] = c.id })
  }

  // ── Create products ──
  logger.info(`Creating ${products.length} products...`)

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const colorImgs = productImages[p.handle] || {}
    const allImages = flattenImages(colorImgs)
    const thumbnail = allImages[0]?.url || ""

    // Build variants: color × size
    const variants: any[] = []
    const hasSizes = p.sizes.length > 0

    if (hasSizes) {
      for (const color of p.colors) {
        for (const size of p.sizes) {
          variants.push({
            title: `${color} / ${size}`,
            sku: `ICE-${p.handle.toUpperCase().slice(0, 6)}-${color.slice(0, 3).toUpperCase()}-${size}`,
            manage_inventory: true,
            options: { Couleur: color, Taille: size },
            prices: [{ amount: p.price, currency_code: "eur" }],
          })
        }
      }
    } else {
      // No sizes (accessories)
      for (const color of p.colors) {
        variants.push({
          title: color,
          sku: `ICE-${p.handle.toUpperCase().slice(0, 6)}-${color.slice(0, 3).toUpperCase()}`,
          manage_inventory: true,
          options: { Couleur: color },
          prices: [{ amount: p.price, currency_code: "eur" }],
        })
      }
    }

    const options = hasSizes
      ? [{ title: "Couleur", values: p.colors }, { title: "Taille", values: p.sizes }]
      : [{ title: "Couleur", values: p.colors }]

    const { result: created } = await createProductsWorkflow(container).run({
      input: {
        products: [{
          title: p.title,
          handle: p.handle,
          description: p.description,
          status: ProductStatus.PUBLISHED,
          thumbnail,
          collection_id: colMap[p.collection],
          categories: catMap[p.category] ? [{ id: catMap[p.category] }] : [],
          images: allImages,
          weight: p.weight,
          options,
          variants,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            color_images: colorImgs,
            ...(p.model_info ? { model_info: p.model_info } : {}),
            ...(p.editorial ? { editorial: p.editorial } : {}),
          },
        }],
      },
    })

    const product = created[0]
    logger.info(`  Created: ${product.title} (${product.variants.length} variants)`)

    // Set up inventory levels
    for (const variant of product.variants) {
      const inventoryItems = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
        filters: { sku: variant.sku },
      })
      const item = inventoryItems.data[0]
      if (item) {
        try {
          await inventoryService.createInventoryLevels([{
            inventory_item_id: item.id,
            location_id: defaultLocation.id,
            stocked_quantity: 50,
          }])
        } catch { /* level might already exist */ }
      }
    }
  }

  logger.info(`=== Seed New Products Complete: ${products.length} products ===`)
}
