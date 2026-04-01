import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import RelatedProductsModuleService from "../../../../../modules/related-products/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service = req.scope.resolve<RelatedProductsModuleService>("relatedProducts")

  const relations = await service.listRelatedProducts({
    product_id: id,
  })

  res.json({ related_products: relations })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { related_product_ids, type = "complete_the_look" } = req.body as {
    related_product_ids: string[]
    type?: string
  }

  const service = req.scope.resolve<RelatedProductsModuleService>("relatedProducts")

  // Delete existing relations of this type for this product
  const existing = await service.listRelatedProducts({
    product_id: id,
    type,
  })

  if (existing.length > 0) {
    await service.deleteRelatedProducts(existing.map((r: { id: string }) => r.id))
  }

  // Create new relations
  if (related_product_ids.length > 0) {
    const newRelations = related_product_ids.map((relatedId) => ({
      product_id: id,
      related_product_id: relatedId,
      type,
    }))

    await service.createRelatedProducts(newRelations)
  }

  // Return updated list
  const updated = await service.listRelatedProducts({
    product_id: id,
  })

  res.json({ related_products: updated })
}
