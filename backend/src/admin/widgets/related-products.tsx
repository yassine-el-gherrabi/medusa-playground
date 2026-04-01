import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Checkbox } from "@medusajs/ui"

type RelatedProduct = {
  id: string
  product_id: string
  related_product_id: string
  type: string
}

type Product = {
  id: string
  title: string
  thumbnail: string | null
}

const RelatedProductsWidget = ({ data }: { data: { id: string } }) => {
  const productId = data.id
  const [relations, setRelations] = useState<RelatedProduct[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch current relations + all products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [relRes, prodRes] = await Promise.all([
          fetch(`/admin/products/${productId}/related`, { credentials: "include" }),
          fetch(`/admin/products?limit=100&fields=id,title,thumbnail`, { credentials: "include" }),
        ])

        const relData = await relRes.json()
        const prodData = await prodRes.json()

        setRelations(relData.related_products || [])
        setAllProducts((prodData.products || []).filter((p: Product) => p.id !== productId))
      } catch {
        // Silently fail — module may not be migrated yet
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  const relatedIds = new Set(relations.map((r) => r.related_product_id))

  const startEditing = () => {
    setSelectedIds(new Set(relatedIds))
    setEditing(true)
  }

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${productId}/related`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ related_product_ids: Array.from(selectedIds) }),
      })
      const data = await res.json()
      setRelations(data.related_products || [])
      setEditing(false)
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Heading level="h2">Produits associés</Heading>
        <Text className="text-ui-fg-subtle mt-2">Chargement...</Text>
      </Container>
    )
  }

  const relatedProducts = allProducts.filter((p) => relatedIds.has(p.id))

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Complétez le look</Heading>
        <Button
          variant="secondary"
          size="small"
          onClick={editing ? save : startEditing}
          isLoading={saving}
        >
          {editing ? "Enregistrer" : "Modifier"}
        </Button>
      </div>

      {editing ? (
        /* Edit mode — checkbox list */
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {allProducts.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-ui-bg-base-hover cursor-pointer"
            >
              <Checkbox
                checked={selectedIds.has(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
              />
              {product.thumbnail && (
                <img
                  src={product.thumbnail}
                  alt=""
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <Text size="small">{product.title}</Text>
            </label>
          ))}
          {allProducts.length === 0 && (
            <Text className="text-ui-fg-subtle">Aucun produit disponible</Text>
          )}
          <div className="flex gap-2 mt-3 pt-3 border-t border-ui-border-base">
            <Button variant="secondary" size="small" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button size="small" onClick={save} isLoading={saving}>
              Enregistrer
            </Button>
          </div>
        </div>
      ) : (
        /* Display mode — list related products */
        <div>
          {relatedProducts.length === 0 ? (
            <Text className="text-ui-fg-subtle">
              Aucun produit associé. Cliquez sur Modifier pour en ajouter.
            </Text>
          ) : (
            <div className="space-y-2">
              {relatedProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-2">
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <Text size="small">{product.title}</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default RelatedProductsWidget
