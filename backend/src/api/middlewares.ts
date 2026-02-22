import { defineMiddlewares } from "@medusajs/framework/http"
import { newsletterMiddlewares } from "./store/newsletter/middlewares"

export default defineMiddlewares({
  routes: [...newsletterMiddlewares],
})
