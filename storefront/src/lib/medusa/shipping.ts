import { sdk } from "@/lib/sdk"
import type { ShippingOption } from "@/types"

export async function getShippingOptions(
  cartId: string
): Promise<ShippingOption[]> {
  const { shipping_options } =
    await sdk.store.fulfillment.listCartOptions({ cart_id: cartId })

  return shipping_options as ShippingOption[]
}
