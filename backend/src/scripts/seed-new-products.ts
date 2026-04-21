import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createCollectionsWorkflow,
  updateCollectionsWorkflow,
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

// ── Stock overrides ──
// Default stock for every variant is 50.
// Override format: { "Color/Size": quantity } or { "*": quantity } for all variants.

const stockOverrides: Record<string, Record<string, number>> = {
  "hoodie-ice":      { "Gris/XL": 0, "Noir/S": 2 },
  "veste-softshell": { "Violet/S": 0, "Violet/M": 0 },
  "short-mesh":      { "*": 0 },
  "tshirt-mesh":     { "Navy/XL": 3, "Beige/S": 1 },
  "doudoune-ice":    { "Noir/XL": 0 },
}

function getStockQuantity(handle: string, color: string, size: string | null): number {
  const overrides = stockOverrides[handle]
  if (!overrides) return 50

  // Wildcard: all variants get this quantity
  if (overrides["*"] !== undefined) return overrides["*"]

  // Check "Color/Size" key for sized products, or just "Color" for accessories
  const key = size ? `${color}/${size}` : color
  if (overrides[key] !== undefined) return overrides[key]

  return 50
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

/**
 * Collection distribution (designed for layout mode testing):
 *
 * Nylon Patchwork  → 9 products → grid mode (>=9)
 *   veste-nylon-patchwork, pantalon-nylon-patchwork, tshirt-coutures-courbes,
 *   tshirt-ml-patchwork, hoodie-ice, jogger-ice, doudoune-sans-manches,
 *   doudoune-ice, tshirt-mesh
 *
 * Softshell Mesh   → 4 products → mid mode (3-8)
 *   veste-softshell, pantalon-cargo-mesh, zip-top-mesh, short-mesh
 *
 * Fleece           → 0 products → empty state
 * Matelassé        → 0 products → empty state
 *
 * Accessoires Ice  → 2 products → lookbook mode (1-2)
 *   lunettes-ice, casquette-ice
 */

const products: ProductDef[] = [
  // ─── Nylon Patchwork (9 products → grid mode) ───────────────────
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
    title: "Hoodie Ice Industry",
    handle: "hoodie-ice",
    description: "Sweat à capuche en coton fleece. Poche kangourou, patch Ice Industry sur le bras, genouillères articulées.",
    collection: "Nylon Patchwork",
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
    collection: "Nylon Patchwork",
    category: "Bas",
    colors: ["Gris", "Noir"],
    sizes: ["S", "M", "L", "XL"],
    price: 95,
    weight: 420,
    model_info: "Le mannequin mesure 182 cm / 75 kg et porte du M",
  },
  {
    title: "Doudoune Sans Manches",
    handle: "doudoune-sans-manches",
    description: "Doudoune sans manches matelassée. Col montant, zip intégral, poches latérales zippées.",
    collection: "Nylon Patchwork",
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
    collection: "Nylon Patchwork",
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
    title: "T-shirt Mesh",
    handle: "tshirt-mesh",
    description: "T-shirt avec panneaux mesh aux épaules. Coupe régulière, finitions techniques.",
    collection: "Nylon Patchwork",
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

  // ─── Softshell Mesh (4 products → mid mode) ────────────────────
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

  // ─── Accessoires Ice (2 products → lookbook mode) ──────────────
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

// ── Collection metadata ──

interface ShootMeta {
  title: string
  edition: string
  image_url: string
  credits: { photographer: string; stylist: string; location: string }
  product_ids: string[] // filled post-creation
}

interface CollectionDef {
  description: string
  season: string
  manifesto: string
  hero_image: string
  shoot?: Omit<ShootMeta, "product_ids">
}

const collectionData: Record<string, CollectionDef> = {
  "Nylon Patchwork": {
    description: "Coutures courbes en nylon technique. La signature Ice Industry.",
    season: "Printemps · Été 2026",
    manifesto: "Née dans les rues de Marseille, la collection Nylon Patchwork repousse les limites du streetwear technique. Chaque pièce est construite autour de coutures courbes signature, assemblées sur des machines industrielles japonaises. Le nylon haute densité résiste au vent et à l'eau tout en offrant une silhouette sculptée. Une collection pensée pour ceux qui bougent, qui créent, qui ne s'arrêtent jamais.",
    hero_image: `${IMG}/hero/HERO_DESK_ICE2.webp`,
    shoot: {
      title: "Nylon Patchwork · On Location",
      edition: "01",
      image_url: `${IMG}/hero/HERO_DESK_ICE2.webp`,
      credits: { photographer: "Lucien Faucon", stylist: "Noa Varenne", location: "Marseille · Saint-Victor" },
    },
  },
  "Softshell Mesh": {
    description: "Panneaux mesh et softshell. Performance et style urbain.",
    season: "Printemps · Été 2026",
    manifesto: "La collection Softshell Mesh fusionne l'ingénierie outdoor avec l'esthétique urbaine. Chaque vêtement intègre des panneaux mesh stratégiques pour la ventilation et un tissu softshell triple couche pour la protection. Des coutures thermosoudées, des zips étanches YKK — des détails qui font la différence entre un vêtement et un outil de vie quotidienne.",
    hero_image: `${IMG}/hero/HERO_DESK_ICE2.webp`,
    shoot: {
      title: "Softshell Mesh · Studio Session",
      edition: "02",
      image_url: `${IMG}/hero/HERO_DESK_ICE2.webp`,
      credits: { photographer: "Lucien Faucon", stylist: "Noa Varenne", location: "Marseille · Studio Friche" },
    },
  },
  "Fleece": {
    description: "Coton fleece premium. Confort et durabilité au quotidien.",
    season: "Automne · Hiver 2026",
    manifesto: "Le fleece Ice Industry, c'est le confort sans compromis. Du coton brossé 400 g/m² qui vieillit bien, des bords-côtes nervurés qui tiennent dans le temps, des surpiqûres ton-sur-ton qui racontent l'attention au détail. Chaque pièce est pensée pour être portée tous les jours, du matin au soir, de la rue au canapé.",
    hero_image: `${IMG}/hero/HERO_DESK_ICE2.webp`,
  },
  "Matelassé": {
    description: "Doudounes matelassées. Protection contre le froid marseillais.",
    season: "Automne · Hiver 2026",
    manifesto: "Même à Marseille, le mistral ne pardonne pas. La collection Matelassé est notre réponse au froid — du duvet synthétique haute performance dans des silhouettes épurées. Matelassage asymétrique, poches sécurisées, capuches amovibles. Chaque doudoune est un bouclier contre les éléments, sans sacrifier le style.",
    hero_image: `${IMG}/hero/HERO_DESK_ICE2.webp`,
  },
  "Accessoires Ice": {
    description: "Lunettes, casquettes et accessoires Ice Industry.",
    season: "Toutes saisons",
    manifesto: "Les accessoires Ice Industry complètent la silhouette. Chaque pièce porte la même attention au détail que nos vêtements — logo brodé avec précision, matériaux sélectionnés pour durer, design qui traverse les saisons sans se démoder.",
    hero_image: `${IMG}/hero/HERO_DESK_ICE2.webp`,
  },
}

// ── Seed function ──

export default async function seedNewProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger") as any
  const query = container.resolve("query") as any
  const inventoryService = container.resolve(Modules.INVENTORY) as any

  logger.info("=== Seed New Products: Starting ===")

  // ── Get existing store data ──
  const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id"] })
  const salesChannel = salesChannels[0]
  if (!salesChannel) throw new Error("No sales channel found")

  const { data: stockLocations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const defaultLocation = stockLocations.find((l: any) => l.name === "Entrepôt principal") || stockLocations[0]
  if (!defaultLocation) throw new Error("No stock location found")

  // ── Create collections ──
  const collectionNames = [...new Set(products.map((p) => p.collection))]

  // Also include empty collections (Fleece, Matelassé) that have metadata but no products
  for (const name of Object.keys(collectionData)) {
    if (!collectionNames.includes(name)) collectionNames.push(name)
  }

  logger.info(`Creating ${collectionNames.length} collections...`)
  const { result: createdCollections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: collectionNames.map((name) => {
        const meta = collectionData[name]
        return {
          title: name,
          handle: name.toLowerCase().replace(/ /g, "-").replace(/é/g, "e"),
          metadata: {
            description: meta?.description || "",
            season: meta?.season || "",
            manifesto: meta?.manifesto || "",
            hero_image: meta?.hero_image || `${IMG}/hero/HERO_DESK_ICE2.webp`,
            // shoot is added post-creation once we have product_ids
          },
        }
      }),
    },
  })

  const colMap: Record<string, string> = {}
  createdCollections.forEach((c: any) => { colMap[c.title] = c.id })
  logger.info(`Created ${createdCollections.length} collections`)

  // ── Get / create categories ──
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })
  const catMap: Record<string, string> = {}
  existingCategories.forEach((c: any) => { catMap[c.name] = c.id })

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

  // Track created product IDs per collection (for shoot.product_ids)
  const collectionProductIds: Record<string, string[]> = {}

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const colorImgs = productImages[p.handle] || {}
    const allImages = flattenImages(colorImgs)
    const thumbnail = allImages[0]?.url || ""

    // Build variants: color x size
    const variants: any[] = []
    const hasSizes = p.sizes.length > 0

    if (hasSizes) {
      for (const color of p.colors) {
        for (const size of p.sizes) {
          variants.push({
            title: `${color} / ${size}`,
            sku: `ICE-${p.handle.toUpperCase().replace(/-/g, "").slice(0, 10)}-${color.slice(0, 3).toUpperCase()}-${size}`,
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
          sku: `ICE-${p.handle.toUpperCase().replace(/-/g, "").slice(0, 10)}-${color.slice(0, 3).toUpperCase()}`,
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

    // Track product ID for shoot metadata
    if (!collectionProductIds[p.collection]) collectionProductIds[p.collection] = []
    collectionProductIds[p.collection].push(product.id)

    // ── Set up inventory levels with stock overrides ──
    for (const variant of product.variants) {
      // Parse color and size from variant title
      const parts = variant.title.split(" / ")
      const variantColor = parts[0]
      const variantSize = parts.length > 1 ? parts[1] : null

      const quantity = getStockQuantity(p.handle, variantColor, variantSize)

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
            stocked_quantity: quantity,
          }])
        } catch { /* level might already exist */ }
      }

      // Log non-default stock levels
      if (quantity !== 50) {
        logger.info(`    Stock override: ${variant.title} → ${quantity}`)
      }
    }
  }

  // ── Post-creation: update collection metadata with shoot.product_ids ──
  logger.info("Updating collection shoot metadata with product IDs...")

  for (const [collectionName, meta] of Object.entries(collectionData)) {
    if (!meta.shoot) continue
    const collectionId = colMap[collectionName]
    if (!collectionId) continue

    const productIds = collectionProductIds[collectionName] || []
    const shoot: ShootMeta = {
      ...meta.shoot,
      product_ids: productIds,
    }

    try {
      await updateCollectionsWorkflow(container).run({
        input: {
          selector: { id: collectionId },
          update: {
            metadata: {
              description: meta.description,
              season: meta.season,
              manifesto: meta.manifesto,
              hero_image: meta.hero_image,
              shoot,
            },
          },
        },
      })
      logger.info(`  Updated ${collectionName} shoot with ${productIds.length} product IDs`)
    } catch (err: any) {
      logger.warn(`  Failed to update ${collectionName} shoot metadata: ${err.message}`)
    }
  }

  // ── Note: stock location <> sales channel link ──
  // If inventory doesn't appear in storefront, link the stock location to the
  // sales channel via Admin API:
  //   POST /admin/stock-locations/:id/sales-channels
  //   body: { add: ["sales_channel_id"] }
  // Or use the Medusa admin UI: Settings → Locations → Edit → Sales Channels.

  logger.info(`=== Seed New Products Complete: ${products.length} products across ${createdCollections.length} collections ===`)
  logger.info("Layout mode distribution:")
  logger.info("  Nylon Patchwork  → 9 products → grid mode")
  logger.info("  Softshell Mesh   → 4 products → mid mode")
  logger.info("  Fleece           → 0 products → empty state")
  logger.info("  Matelassé        → 0 products → empty state")
  logger.info("  Accessoires Ice  → 2 products → lookbook mode")
}
