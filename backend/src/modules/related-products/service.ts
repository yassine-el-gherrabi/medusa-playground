import { MedusaService } from "@medusajs/framework/utils"
import RelatedProduct from "./models/related-product"

class RelatedProductsModuleService extends MedusaService({
  RelatedProduct,
}) {}

export default RelatedProductsModuleService
