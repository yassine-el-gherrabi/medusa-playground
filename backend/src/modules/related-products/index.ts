import RelatedProductsModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const RELATED_PRODUCTS_MODULE = "relatedProducts"

export default Module(RELATED_PRODUCTS_MODULE, {
  service: RelatedProductsModuleService,
})
