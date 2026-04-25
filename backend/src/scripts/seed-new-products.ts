import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createCollectionsWorkflow,
  updateCollectionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

const IMG = "https://api.iceindustry.fr/images"
const HERO = `${IMG}/hero/HERO_DESK_ICE2.webp`

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE MAPS — Real product photos on Hetzner CDN
// ═══════════════════════════════════════════════════════════════════════════

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
    Noir: [1].map((n) => ({ url: `${IMG}/casquette-noir/${n}.jpg` })),
  },
}

/** Flatten all color images into a single de-duped array for the product */
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

// ═══════════════════════════════════════════════════════════════════════════
// STOCK OVERRIDES — Default is 50 per variant
// ═══════════════════════════════════════════════════════════════════════════

const stockOverrides: Record<string, Record<string, number>> = {
  "hoodie-ice":      { "Gris/XL": 0, "Noir/S": 2 },
  "veste-softshell": { "Violet/S": 0, "Violet/M": 0 },
  "short-mesh":      { "*": 0 },                       // entirely OOS
  "tshirt-mesh":     { "Navy/XL": 3, "Beige/S": 1 },
  "doudoune-ice":    { "Noir/XL": 0 },
}

function getStockQuantity(handle: string, color: string, size: string | null): number {
  const overrides = stockOverrides[handle]
  if (!overrides) return 50
  if (overrides["*"] !== undefined) return overrides["*"]
  const key = size ? `${color}/${size}` : color
  if (overrides[key] !== undefined) return overrides[key]
  return 50
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS (7)
// ═══════════════════════════════════════════════════════════════════════════

interface ShootMeta {
  title: string
  edition: string
  image_url: string
  credits: { photographer: string; stylist: string; location: string }
  product_ids: string[]
}

interface CollectionDef {
  title: string
  handle: string
  description: string
  season: string
  manifesto: string
  hero_image: string
  shoot?: Omit<ShootMeta, "product_ids">
}

const collections: CollectionDef[] = [
  {
    title: "Seamless Bi-Material",
    handle: "seamless-bi-material",
    description: "La fusion parfaite. Deux matières, zéro couture visible. Une collection technique qui repense les bases du streetwear.",
    season: "Printemps · Été 2026",
    manifesto: "Née dans les rues de Marseille, la collection Seamless Bi-Material repousse les limites du streetwear technique. Chaque pièce est construite autour de coutures courbes signature, assemblées sur des machines industrielles japonaises. Le nylon haute densité résiste au vent et à l'eau tout en offrant une silhouette sculptée. Une collection pensée pour ceux qui bougent, qui créent, qui ne s'arrêtent jamais.",
    hero_image: HERO,
    shoot: {
      title: "Seamless · On Location",
      edition: "01",
      image_url: HERO,
      credits: { photographer: "Lucien Faucon", stylist: "Noa Varenne", location: "Marseille · Saint-Victor" },
    },
  },
  {
    title: "Linea Nebula",
    handle: "linea-nebula",
    description: "Inspirée par les étoiles et la nuit marseillaise, Linea Nebula repousse les limites du streetwear avec des matières techniques et un design avant-gardiste.",
    season: "Automne · Hiver 2026",
    manifesto: "Le fleece Ice Industry, c'est le confort sans compromis. Du coton brossé 400 g/m² qui vieillit bien, des bords-côtes nervurés qui tiennent dans le temps, des surpiqûres ton-sur-ton qui racontent l'attention au détail. Chaque pièce est pensée pour être portée tous les jours, du matin au soir, de la rue au canapé. Même à Marseille, le mistral ne pardonne pas — notre réponse au froid dans des silhouettes épurées.",
    hero_image: HERO,
    shoot: {
      title: "Linea Nebula · Night Session",
      edition: "02",
      image_url: HERO,
      credits: { photographer: "Lucien Faucon", stylist: "Noa Varenne", location: "Marseille · Vieux-Port" },
    },
  },
  {
    title: "Oscura",
    handle: "oscura",
    description: "L'obscurité comme source d'inspiration. Des pièces sombres et élégantes pour ceux qui vivent la nuit.",
    season: "Toutes saisons",
    manifesto: "Les accessoires Ice Industry complètent la silhouette. Chaque pièce porte la même attention au détail que nos vêtements — logo brodé avec précision, matériaux sélectionnés pour durer, design qui traverse les saisons sans se démoder.",
    hero_image: HERO,
  },
  {
    title: "Abyss",
    handle: "abyss",
    description: "Plongée dans les profondeurs. Des teintes profondes, des coupes oversize et une identité visuelle brute.",
    season: "Automne · Hiver 2026",
    manifesto: "Plongée dans les profondeurs du style urbain. La collection Abyss explore les teintes les plus profondes de la palette Ice Industry — des noirs abyssaux aux bleus nuit, chaque pièce est une immersion dans l'obscurité maîtrisée.",
    hero_image: HERO,
  },
  {
    title: "ICE Reflect",
    handle: "ice-reflect",
    description: "Reflets urbains. Des pièces aux finitions réfléchissantes qui captent la lumière de la ville.",
    season: "Printemps · Été 2026",
    manifesto: "La lumière de Marseille se reflète dans chaque pièce de cette collection. ICE Reflect capture l'énergie de la ville à travers des finitions qui jouent avec la lumière — une mode qui brille sans en faire trop.",
    hero_image: HERO,
  },
  {
    title: "Capsule Shadow",
    handle: "capsule-shadow",
    description: "Dans l'ombre naît le style. Une capsule monochrome aux coupes affirmées.",
    season: "Automne · Hiver 2026",
    manifesto: "Dans l'ombre naît le style. La Capsule Shadow est une méditation monochrome — des noirs profonds, des coupes affirmées, une élégance brute qui ne cherche pas la lumière mais la mérite.",
    hero_image: HERO,
  },
  {
    title: "Capsule Concrete",
    handle: "capsule-concrete",
    description: "Née du béton. Inspirée par l'architecture brute de Marseille.",
    season: "Printemps · Été 2026",
    manifesto: "Née du béton marseillais. La Capsule Concrete puise son inspiration dans l'architecture brute de la cité phocéenne — des lignes dures, des matières résistantes, un design qui refuse le superflu.",
    hero_image: HERO,
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES (hierarchical)
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryDef {
  name: string
  handle: string
  children?: { name: string; handle: string }[]
}

const categories: CategoryDef[] = [
  {
    name: "Vêtements",
    handle: "vetements",
    children: [
      { name: "Hauts", handle: "hauts" },
      { name: "Bas", handle: "bas" },
      { name: "Vestes & Manteaux", handle: "vestes-manteaux" },
    ],
  },
  {
    name: "Accessoires",
    handle: "accessoires",
    children: [
      { name: "Lunettes de soleil", handle: "lunettes-de-soleil" },
      { name: "Casquettes", handle: "casquettes" },
      { name: "Cache-cou", handle: "cache-cou" },
    ],
  },
  {
    name: "Chaussures",
    handle: "chaussures",
  },
  {
    name: "Ice for Girls",
    handle: "ice-for-girls",
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS (15)
// ═══════════════════════════════════════════════════════════════════════════

interface ProductDef {
  title: string
  handle: string
  description: string
  collection: string  // matches CollectionDef.title
  category: string    // matches a leaf category name
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
 * Seamless Bi-Material → 9 products → grid mode (>=9)
 * Linea Nebula         → 4 products → mid mode (3-8)
 * Oscura               → 2 products → lookbook mode (1-2)
 * Abyss                → 0 products → empty state
 * ICE Reflect          → 0 products → empty state
 * Capsule Shadow       → 0 products → empty state
 * Capsule Concrete     → 0 products → empty state
 */

const products: ProductDef[] = [
  // ─── Seamless Bi-Material (9 products → grid mode) ────────────────
  {
    title: "Veste Nylon Patchwork",
    handle: "veste-nylon-patchwork",
    description: "Veste à capuche en nylon avec coutures patchwork courbes. Zip intégral, patch Ice Industry sur le bras, boutons-pression aux poignets.",
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
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
    collection: "Seamless Bi-Material",
    category: "Bas",
    colors: ["Violet"],
    sizes: ["S", "M", "L", "XL"],
    price: 65,
    weight: 200,
    model_info: "Le mannequin mesure 185 cm et porte du M",
  },

  // ─── Linea Nebula (4 products → mid mode) ─────────────────────────
  {
    title: "Hoodie Ice Industry",
    handle: "hoodie-ice",
    description: "Sweat à capuche en coton fleece. Poche kangourou, patch Ice Industry sur le bras, genouillères articulées.",
    collection: "Linea Nebula",
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
    collection: "Linea Nebula",
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
    collection: "Linea Nebula",
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
    collection: "Linea Nebula",
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

  // ─── Oscura (2 products → lookbook mode) ──────────────────────────
  {
    title: "Lunettes Ice Industry",
    handle: "lunettes-ice",
    description: "Lunettes de soleil Ice Industry. Monture écaille, verres teintés.",
    collection: "Oscura",
    category: "Lunettes de soleil",
    colors: ["Écaille"],
    sizes: [],
    price: 75,
    weight: 30,
  },
  {
    title: "Casquette Ice Industry",
    handle: "casquette-ice",
    description: "Casquette Ice Industry. Logo brodé, visière courbée, ajustement arrière.",
    collection: "Oscura",
    category: "Casquettes",
    colors: ["Noir"],
    sizes: [],
    price: 35,
    weight: 80,
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export default async function seedNewProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger") as any
  const query = container.resolve("query") as any
  const inventoryService = container.resolve(Modules.INVENTORY) as any

  logger.info("=== Ice Industry Seed: Starting ===")

  // ── 1. Get existing store infrastructure ──────────────────────────
  const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id"] })
  const salesChannel = salesChannels[0]
  if (!salesChannel) throw new Error("No sales channel found")

  const { data: stockLocations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const defaultLocation = stockLocations.find((l: any) => l.name === "Entrepôt principal") || stockLocations[0]
  if (!defaultLocation) throw new Error("No stock location found")

  // ── 2. Create collections (7) ─────────────────────────────────────
  logger.info(`Creating ${collections.length} collections...`)

  const { result: createdCollections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: collections.map((c) => ({
        title: c.title,
        handle: c.handle,
        metadata: {
          hero_image: c.hero_image,
          description: c.description,
          season: c.season,
          manifesto: c.manifesto,
          // shoot is added post-creation once we have product_ids
        },
      })),
    },
  })

  const colMap: Record<string, string> = {}
  createdCollections.forEach((c: any) => { colMap[c.title] = c.id })
  logger.info(`  Created ${createdCollections.length} collections`)

  // ── 3. Create categories (hierarchical) ───────────────────────────
  logger.info("Creating categories...")

  // First pass: parent categories
  const { result: parentCats } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: categories.map((c) => ({
        name: c.name,
        handle: c.handle,
        is_active: true,
      })),
    },
  })

  const catMap: Record<string, string> = {}
  parentCats.forEach((c: any) => { catMap[c.name] = c.id })
  logger.info(`  Created ${parentCats.length} parent categories`)

  // Second pass: child categories with parent_category_id
  const childDefs: { name: string; handle: string; parentId: string }[] = []
  for (const parent of categories) {
    if (!parent.children) continue
    for (const child of parent.children) {
      childDefs.push({ name: child.name, handle: child.handle, parentId: catMap[parent.name] })
    }
  }

  if (childDefs.length > 0) {
    const { result: childCats } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: childDefs.map((c) => ({
          name: c.name,
          handle: c.handle,
          parent_category_id: c.parentId,
          is_active: true,
        })),
      },
    })
    childCats.forEach((c: any) => { catMap[c.name] = c.id })
    logger.info(`  Created ${childCats.length} child categories`)
  }

  // ── 4. Create products (15) ───────────────────────────────────────
  logger.info(`Creating ${products.length} products...`)

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
            weight: p.weight,
            options: { Couleur: color, Taille: size },
            prices: [{ amount: p.price, currency_code: "eur" }],
          })
        }
      }
    } else {
      for (const color of p.colors) {
        variants.push({
          title: color,
          sku: `ICE-${p.handle.toUpperCase().replace(/-/g, "").slice(0, 10)}-${color.slice(0, 3).toUpperCase()}`,
          manage_inventory: true,
          weight: p.weight,
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
          category_ids: catMap[p.category] ? [catMap[p.category]] : [],
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

    // Track product ID per collection (for shoot.product_ids)
    if (!collectionProductIds[p.collection]) collectionProductIds[p.collection] = []
    collectionProductIds[p.collection].push(product.id)

    // ── 5. Set inventory levels with stock overrides ──
    for (const variant of product.variants) {
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

      if (quantity !== 50) {
        logger.info(`    Stock override: ${variant.title} → ${quantity}`)
      }
    }
  }

  // ── 6. Update collection metadata with shoot.product_ids ──────────
  logger.info("Updating collection shoot metadata with product IDs...")

  for (const col of collections) {
    if (!col.shoot) continue
    const collectionId = colMap[col.title]
    if (!collectionId) continue

    const productIds = collectionProductIds[col.title] || []

    // Seamless Bi-Material: use first 4 product IDs for shoot
    // Linea Nebula: use all 4 product IDs for shoot
    const shootProductIds = col.title === "Seamless Bi-Material"
      ? productIds.slice(0, 4)
      : productIds

    const shoot: ShootMeta = {
      ...col.shoot,
      product_ids: shootProductIds,
    }

    try {
      await updateCollectionsWorkflow(container).run({
        input: {
          selector: { id: collectionId },
          update: {
            metadata: {
              hero_image: col.hero_image,
              description: col.description,
              season: col.season,
              manifesto: col.manifesto,
              shoot,
            },
          },
        },
      })
      logger.info(`  Updated ${col.title} shoot with ${shootProductIds.length} product IDs`)
    } catch (err: any) {
      logger.warn(`  Failed to update ${col.title} shoot metadata: ${err.message}`)
    }
  }

  // ── 7. Link stock location to sales channel ───────────────────────
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: defaultLocation.id,
        add: [salesChannel.id],
      },
    })
    logger.info("Linked stock location to sales channel")
  } catch {
    logger.info("Stock location <> sales channel link already exists (skipped)")
  }

  // ── Summary ───────────────────────────────────────────────────────
  const colCounts: Record<string, number> = {}
  for (const p of products) {
    colCounts[p.collection] = (colCounts[p.collection] || 0) + 1
  }

  logger.info(`=== Ice Industry Seed Complete ===`)
  logger.info(`  ${collections.length} collections | ${Object.keys(catMap).length} categories | ${products.length} products`)
  logger.info("Layout mode distribution:")
  for (const col of collections) {
    const count = colCounts[col.title] || 0
    const mode = count >= 9 ? "grid" : count >= 3 ? "mid" : count >= 1 ? "lookbook" : "empty"
    logger.info(`  ${col.title.padEnd(22)} → ${count} products → ${mode} mode`)
  }
}
