# Storefront — Guide fonctionnel

> TLDR pour chaque composant : ce qu'il affiche, d'où viennent les données, les règles.

---

## 1. Hero (plein écran)

**Source** : Codé en dur dans `page.tsx` (`HERO_SLIDES`)

| Règle | Détail |
|-------|--------|
| Contenu | Images/vidéos + texte + CTA, définis manuellement dans le code |
| Auto-rotation | Oui, toutes les 6s avec crossfade |
| Ken Burns | Léger zoom progressif (scale 1 → 1.04) pendant les 6s |
| Swipe mobile | Oui (touch natif) |
| Pause | Le timer se pause quand on hover le CTA |

**Pour modifier** : Éditer le tableau `HERO_SLIDES` dans `src/app/(main)/page.tsx`. On peut ajouter autant de slides qu'on veut.

---

## 2. Nouveautés (grille produits)

**Source** : Automatique — API Medusa

| Règle | Détail |
|-------|--------|
| Quels produits ? | **Tous les produits** du store, limités à 12, triés par défaut Medusa (création) |
| Filtre | Les produits dont **toutes** les variantes sont à stock 0 sont exclus |
| Tri | Ordre par défaut de l'API Medusa (date de création) |
| Pas de filtre par collection/catégorie | Tous les produits apparaissent, y compris les demo Medusa |

**Desktop** : Grille 4 colonnes — catégorie, titre, prix, barres de couleur rectangulaires, sélecteur de taille au clic, "Ajouter au panier"

**Mobile** : Grille 2 colonnes simplifiée — titre, prix, "+ X couleurs", bouton "+" qui ouvre un bottom sheet (createPortal) avec galerie d'images, couleurs, tailles, CTA

**Couleurs** : Extraites de l'option "Color" ou "Couleur" du produit. L'image change selon `metadata.color_images` si renseigné. Max 5 visibles, chevrons au-delà.

**Pour changer les produits affichés** : Modifier l'appel `getProducts()` dans `page.tsx` — ajouter un `collectionId` ou `categoryId` pour filtrer.

---

## 3. Nouvelle Collection (hero full-screen)

**Source** : Automatique — la collection la plus récente (par `created_at`)

| Règle | Détail |
|-------|--------|
| Quelle collection ? | La **première** collection triée par date de création décroissante |
| Condition d'affichage | La collection doit avoir `metadata.hero_image` renseigné, sinon la section ne s'affiche pas |
| Description | Lue depuis `metadata.description` de la collection |
| Animation | Fade-in + slide-up au scroll (IntersectionObserver, seuil 15%) |

**Pour modifier** : Changer l'image hero et la description dans Medusa Admin → Collection → Metadata :
```json
{
  "hero_image": "https://...",
  "description": "Texte de description..."
}
```

---

## 4. Explorer (carrousel collections)

**Source** : Automatique — **toutes** les collections du store

| Règle | Détail |
|-------|--------|
| Quelles collections ? | **Toutes**, sans exception ni filtre |
| Inclut Ice for Girls ? | Oui, si c'est une collection |
| Inclut Accessoires ? | Seulement si "Accessoires" est une **collection** (pas une catégorie). Actuellement les catégories (Accessoires, Chaussures, etc.) ne sont **pas** dans ce carrousel |
| Image | Chaque collection affiche `metadata.hero_image`. Sans image = fond gris avec "Ice" |
| Défilement | Auto-scroll continu (~24px/s), boucle infinie (items triplés) |
| Interaction | Drag/swipe + boutons prev/next + pause/play |
| Taille slides | Desktop: 50vw, Mobile: 85vw |

**Pour ajouter une collection au carrousel** : Il suffit de la créer dans Medusa Admin et d'ajouter `hero_image` dans ses metadata. Elle apparaît automatiquement.

**Pour exclure une collection** : Pas de mécanisme actuellement. Il faudrait ajouter un filtre (par handle ou metadata) dans `page.tsx`.

---

## 5. Chaussures (slideshow plein écran)

**Source** : Codé en dur dans `page.tsx` (`SHOE_IMAGES`)

| Règle | Détail |
|-------|--------|
| Images | 3 images définies manuellement (actuellement des Unsplash) |
| Auto-rotation | Toutes les 6s avec crossfade de 2s |
| Indicateurs | Barres en bas à droite avec **progression** qui se remplit pendant les 6s |
| CTA | Lien vers `/categories/chaussures` |
| Animation | Fade-in au scroll |

**Pour modifier** : Éditer `SHOE_IMAGES` dans `page.tsx`. Remplacer les URLs Unsplash par de vraies photos produit.

---

## 6. Triptyque (3 cartes éditorial)

**Source** : Codé en dur dans `page.tsx` (`TRIPTYCH_CARDS`)

| Règle | Détail |
|-------|--------|
| Contenu | 3 cartes : Boutique Marseille, Newsletter, Ice Gallery |
| Layout | 1 colonne mobile, 3 colonnes desktop, ratio 3:4 |
| Images | Unsplash actuellement |
| Interaction | Hover = zoom image + overlay s'éclaircit |
| Animation | Fade-in au scroll |

**Pour modifier** : Éditer `TRIPTYCH_CARDS` dans `page.tsx`.

---

## Résumé : Automatique vs Manuel

| Section | Source | Automatique ? |
|---------|--------|---------------|
| Hero | Code (`HERO_SLIDES`) | Non — modifier le code |
| Nouveautés | API Medusa | **Oui** — tous les produits en stock |
| Nouvelle Collection | API Medusa | **Oui** — collection la plus récente avec `hero_image` |
| Explorer | API Medusa | **Oui** — toutes les collections |
| Chaussures | Code (`SHOE_IMAGES`) | Non — modifier le code |
| Triptyque | Code (`TRIPTYCH_CARDS`) | Non — modifier le code |

---

## Animations scroll

Toutes les sections utilisent un IntersectionObserver pour déclencher un fade-in (`opacity-0 → 1` + `translate-y-8 → 0`) quand la section entre dans le viewport. L'animation se joue une seule fois (l'observer se déconnecte après).

---
---

# Navigation (Header / Navbar)

---

## Comportement général

| Règle | Détail |
|-------|--------|
| Position | `fixed` en haut, z-index 30 |
| Hauteur | 64px (`h-16`) |
| Hide on scroll | Se cache quand on scroll vers le bas, réapparaît quand on scroll vers le haut |
| Transparence | Sur les pages avec hero (accueil, etc.), le header est **transparent avec texte blanc** tant qu'on est dans la zone hero, puis fond blanc + texte noir une fois scrollé |
| Logo | Centré, lien vers `/` |

---

## Desktop (lg: ≥1024px)

**Gauche** :
- "Collections" → ouvre le **Mega Menu** au hover
- Nom de la collection la plus récente → lien direct (automatique, même logique que "Nouvelle Collection")

**Droite** :
- Recherche (icône loupe) → ouvre l'overlay de recherche
- "Compte" → lien `/account`
- "Panier (N)" → ouvre le cart drawer. Le `(N)` n'apparaît que si N > 0

**Underline animé** : Chaque lien a un underline qui slide de droite à gauche au hover (cubic-bezier).

---

## Mobile (< 1024px)

**Gauche** :
- Burger (2 lignes asymétriques) → ouvre le menu mobile (slide from left)
- Loupe → ouvre la recherche

**Centre** : Logo

**Droite** :
- Icône sac → ouvre le cart drawer
- Badge : chiffre en superscript, monochrome, pas de cercle. Rien quand le panier est vide

---

## Mega Menu

**Source** : Automatique — collections + catégories depuis l'API Medusa

| Règle | Détail |
|-------|--------|
| Ouverture | Desktop uniquement, au hover sur "Collections" |
| Fermeture | Mouse leave du header entier, touche Escape, ou navigation |
| Colonne gauche | **Collections** — toutes les collections + lien "Toutes les collections" |
| Colonne centre | **Boutique** — toutes les catégories (Sweatshirts, Shirts, Pants, etc.) avec leurs sous-catégories + lien "Tout voir" |
| Colonne droite | Image preview — change selon l'item survolé (`metadata.hero_image` pour les collections, `metadata.image` pour les catégories) |

**Pour ajouter un lien** : Créer la collection ou catégorie dans Medusa Admin. Elle apparaît automatiquement.

---

## Menu Mobile

**Source** : Automatique — mêmes collections + catégories

| Règle | Détail |
|-------|--------|
| Ouverture | Slide from left, full-screen |
| Structure | Accordéons dépliables : Collections, Boutique (catégories), puis liens directs (Compte, etc.) |
| Logo | Affiché en haut du menu |
| Fermeture | Bouton X, ou navigation vers une page |

---
---

# Cart (Panier)

---

## Persistance

| Règle | Détail |
|-------|--------|
| Stockage | `cart_id` dans **localStorage** du navigateur |
| Serveur | Le panier est stocké côté Medusa (API). Le frontend ne garde que l'ID |
| Expiration | Si le cart est expiré/invalide, il est automatiquement recréé au prochain ajout |
| Stock | Le cart **ne réserve PAS le stock**. Le stock est réservé uniquement au moment du paiement |

---

## Cart Drawer (panneau latéral)

**Ouverture** : Clic sur Panier (header) ou ajout d'un article

**Fermeture** : Clic backdrop, touche Escape, changement de page, clic X

**Layout mobile** :
```
[FIXE] Header : "Votre panier (N)" + X
[SCROLL] Free shipping bar (progression)
[SCROLL] Articles (image + titre + variante + quantité + prix)
[SCROLL] Sous-total
[SCROLL] Complétez le look (cross-sell, max 3)
[FIXE] CTA "Paiement — XX,XX €"
```

| Règle | Détail |
|-------|--------|
| Body scroll lock | Oui, avec fix iOS (position fixed + restore scroll) |
| Largeur | 100% mobile, 420px desktop |
| CTA toujours visible | Fixe en bas, affiche le prix total |

---

## Quantité (+/−)

| Règle | Détail |
|-------|--------|
| Optimistic update | L'UI change **instantanément** au clic, sans attendre le backend |
| Debounce | 400ms — spam-cliquer +++ n'envoie qu'**une seule requête** API avec la quantité finale |
| Bouton − à qty 1 | **Désactivé** (grisé). Seule la croix X supprime un article |
| Suppression | Clic X → fade-out optimistic → suppression backend |
| Rollback | Si le backend échoue, l'UI revient à l'état précédent automatiquement |

---

## Free Shipping Bar

| Règle | Détail |
|-------|--------|
| Seuil | **250 €** (configurable dans `src/lib/constants.ts` → `FREE_SHIPPING_THRESHOLD`) |
| Barre | 2px, se remplit proportionnellement au sous-total |
| Message | "Plus que X € pour la livraison offerte" ou "Livraison offerte" quand atteint |
| Position | En haut de la zone scrollable du drawer (première chose visible) |

---

## Cross-sell "Complétez le look"

**Source** : Module custom Medusa "Related Products"

| Règle | Détail |
|-------|--------|
| Algorithme | 1. Cherche les **associations manuelles** du premier article du panier (via `/store/products/:id/related`) |
| Fallback | 2. Si aucune association manuelle → affiche les **3 produits les plus récents** (hors articles déjà dans le panier) |
| Cap | Maximum **3 produits** affichés |
| Exclusions | Produits déjà dans le panier + produits sans stock |
| Re-fetch | Uniquement quand les **produits** dans le panier changent (pas quand la quantité change) |
| Inline size picker | Clic "+ Ajouter" → les tailles apparaissent → sélectionner → article ajouté |

**Associations manuelles** : Gérées via le widget Admin Medusa (Product → Related Products → checkboxes).

---

## Badge panier (header)

| Règle | Détail |
|-------|--------|
| Style | Chiffre monochrome en superscript, pas de cercle/badge coloré |
| Panier vide | Rien affiché (pas de "0") |
| Desktop | Texte "Panier (N)" |
| Mobile | Icône sac outline + chiffre en haut à droite |
| Compteur | Somme des quantités de tous les articles (pas le nombre de lignes) |
