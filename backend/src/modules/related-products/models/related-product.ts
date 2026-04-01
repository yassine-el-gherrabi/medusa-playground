import { model } from "@medusajs/framework/utils"

const RelatedProduct = model.define("related_product", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  related_product_id: model.text(),
  type: model.text().default("complete_the_look"),
})

export default RelatedProduct
