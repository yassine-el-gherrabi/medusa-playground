import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import RelatedProductsModuleService from "../../../../../modules/related-products/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service = req.scope.resolve<RelatedProductsModuleService>("relatedProducts")

  const relations = await service.listRelatedProducts({
    product_id: id,
  })

  res.json({
    related_product_ids: relations.map((r: { related_product_id: string }) => r.related_product_id),
  })
}
