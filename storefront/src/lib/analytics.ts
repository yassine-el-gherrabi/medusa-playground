declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function push(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
}

export function trackProductView(product: {
  id: string
  title: string
  price?: number
  currency?: string
}) {
  push("view_item", {
    ecommerce: {
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          currency: product.currency || "EUR",
        },
      ],
    },
  })
}

export function trackAddToCart(item: {
  id: string
  title: string
  variantId: string
  price?: number
  currency?: string
  quantity: number
}) {
  push("add_to_cart", {
    ecommerce: {
      items: [
        {
          item_id: item.id,
          item_name: item.title,
          item_variant: item.variantId,
          price: item.price,
          currency: item.currency || "EUR",
          quantity: item.quantity,
        },
      ],
    },
  })
}

export function trackCheckoutStart(cart: {
  id: string
  total: number
  currency: string
  items: { id: string; title: string; quantity: number; price: number }[]
}) {
  push("begin_checkout", {
    ecommerce: {
      currency: cart.currency,
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: item.id,
        item_name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  })
}

export function trackPurchase(order: {
  id: string
  total: number
  currency: string
  tax?: number
  shipping?: number
  items: { id: string; title: string; quantity: number; price: number }[]
}) {
  push("purchase", {
    ecommerce: {
      transaction_id: order.id,
      value: order.total,
      currency: order.currency,
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      items: order.items.map((item) => ({
        item_id: item.id,
        item_name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  })
}

export function trackNewsletterSignup(email: string) {
  push("newsletter_signup", { email_domain: email.split("@")[1] })
}

export function trackCTAClick(ctaName: string, destination?: string) {
  push("cta_click", { cta_name: ctaName, destination })
}
