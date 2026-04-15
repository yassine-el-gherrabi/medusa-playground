# Page d'accueil — Guide des sections

> TLDR pour chaque section : ce qu'elle affiche, d'où viennent les données, les règles.

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
