import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  plugins: [
    {
      resolve: "medusa-colissimo",
      options: {},
    },
  ],
  modules: [
    {
      resolve: "./src/modules/newsletter",
    },
    {
      resolve: "./src/modules/related-products",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "medusa-colissimo/providers/colissimo",
            id: "colissimo",
            options: {
              contractNumber: process.env.COLISSIMO_CONTRACT_NUMBER,
              password: process.env.COLISSIMO_PASSWORD,
              businessAddress: {
                companyName: "Ice Industry",
                line2: "Marseille",
                city: "Marseille",
                zipCode: "13001",
                countryCode: "FR",
                phoneNumber: "+33764085797",
                email: "contact@iceindustry.fr",
              },
              enableReturns: true,
              enableCalculatedPricing: true,
              pricingTable: {
                // Colissimo Domicile sans signature
                DOM: {
                  FR: [
                    { maxWeight: 0.25, price: 495 },
                    { maxWeight: 0.5, price: 615 },
                    { maxWeight: 0.75, price: 700 },
                    { maxWeight: 1, price: 765 },
                    { maxWeight: 2, price: 865 },
                    { maxWeight: 5, price: 1095 },
                    { maxWeight: 10, price: 1595 },
                    { maxWeight: 30, price: 2295 },
                  ],
                },
                // Colissimo Domicile avec signature
                DOS: {
                  FR: [
                    { maxWeight: 0.25, price: 595 },
                    { maxWeight: 0.5, price: 715 },
                    { maxWeight: 0.75, price: 800 },
                    { maxWeight: 1, price: 865 },
                    { maxWeight: 2, price: 965 },
                    { maxWeight: 5, price: 1195 },
                    { maxWeight: 10, price: 1695 },
                    { maxWeight: 30, price: 2395 },
                  ],
                },
                // Colissimo Point Relais
                A2P: {
                  FR: [
                    { maxWeight: 0.25, price: 395 },
                    { maxWeight: 0.5, price: 495 },
                    { maxWeight: 0.75, price: 575 },
                    { maxWeight: 1, price: 650 },
                    { maxWeight: 2, price: 750 },
                    { maxWeight: 5, price: 950 },
                    { maxWeight: 10, price: 1395 },
                    { maxWeight: 30, price: 1995 },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ],
})
