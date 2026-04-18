# Ice Industry — Roadmap complète

> Dernière mise à jour : 18 avril 2026

---

## Phase 1 — Storefront (en cours)

### PDP (Product Detail Page) — EN COURS
- [x] Carousel Embla (loop infini, swipe, compteur)
- [x] Tap-to-open galerie fullscreen verticale
- [x] Swatches couleur avec miniature produit
- [x] Scroll carousel vers l'image de la couleur sélectionnée
- [x] Tailles avec out-of-stock barré
- [x] Sticky CTA mobile full-width avec prix
- [x] Info mannequin entre couleur et taille
- [x] "Sélectionnez une taille" (pas "vos options")
- [x] Détails produit + Livraison/Retours (ouvert, pas accordéon)
- [x] Complétez le look (cross-sell Related Products module)
- [x] Vous aimerez aussi (produits récents)
- [x] Trust signals (retours 14j)
- [x] Click & collect Marseille
- [ ] Breadcrumb (Accueil > Collection > Produit)
- [ ] Partage social (copier lien, Instagram)
- [ ] Zoom pinch-to-zoom sur les images

### Boutique / PLP (Product Listing Page)
- [ ] Revoir le style des cards produit (luxe, cohérent avec homepage)
- [ ] Filtres par couleur
- [ ] Filtres par prix (range slider)
- [ ] Compteur de résultats ("12 articles")
- [ ] Animation de chargement au scroll infini
- [ ] Vue grille 2/3/4 colonnes toggle

### Pages Collection
- [ ] Revoir le style luxe (hero éditorial + grille produits)
- [ ] Bannière hero depuis metadata collection
- [ ] Description collection

### Pages Catégorie
- [ ] Revoir le style luxe
- [ ] Sous-catégories navigables
- [ ] Bannière hero depuis metadata catégorie

### Checkout
- [ ] Revoir l'UX complète (style luxe, étapes claires)
- [ ] Tester avec Stripe live (pas test)
- [ ] Apple Pay / Google Pay (activer dans Stripe Dashboard)
- [ ] Résumé commande sticky sur desktop
- [ ] Champ code promo
- [ ] Estimation frais de livraison
- [ ] Page de confirmation de commande post-paiement
- [ ] Email de confirmation de commande

### Compte client
- [ ] Revoir le style luxe (login, register, profil)
- [ ] Gestion d'adresses (ajout, modification, suppression)
- [ ] Adresse par défaut pour le checkout
- [ ] Historique de commande amélioré (statut visuel, tracking)
- [ ] Mot de passe oublié / reset password

### Recherche
- [ ] Revoir le style de la grille de résultats
- [ ] Résultats vides : message + suggestions
- [ ] Recherche par catégorie / collection

---

## Phase 2 — Pages manquantes

### Obligatoire avant la prod

| Page | Route | Contenu |
|------|-------|---------|
| **Mentions légales** | `/legal/mentions-legales` | Raison sociale, SIRET, hébergeur, directeur de publication — **obligatoire légalement** |
| **Livraison & Retours** | `/livraison` | Délais, tarifs, zones, politique retours — **réduit les abandons panier** |
| **Guide des tailles** | `/guide-des-tailles` | Tableau de mesures par produit — **réduit les retours** |
| **Notre boutique** | `/notre-boutique` | Adresse Marseille, horaires, Google Maps, photos — **le client y tient** |

### Important mais pas bloquant

| Page | Route | Contenu |
|------|-------|---------|
| Suivi de commande | `/suivi-commande` | Input numéro de commande → statut |
| Notre univers | `/notre-univers` | Brand story, valeurs, équipe |
| Carrières | `/carrieres` | Offres d'emploi ou page simple |
| Collaborations | `/collaborations` | Projets passés / à venir |

### Quick win : nettoyer le footer
- Retirer les liens vers les pages qui n'existent pas encore
- Les remettre au fur et à mesure qu'on les crée

---

## Phase 3 — Fonctionnalités transversales

### Emails transactionnels — MANDATORY
Le client DOIT recevoir des emails à chaque étape. Sans ça, pas de lancement.

| Email | Quand | Contenu |
|-------|-------|---------|
| **Confirmation de commande** | Après paiement | Récapitulatif articles, prix, adresse |
| **Expédition** | Quand le colis part | Numéro de suivi, lien tracking |
| **Livraison** | Quand c'est livré | Confirmation + demande d'avis |
| **Création de compte** | À l'inscription | Bienvenue + mot de passe |
| **Reset mot de passe** | Sur demande | Lien de réinitialisation |
| **Newsletter** | Sur inscription | Email de bienvenue newsletter |

**Solution** : Medusa v2 Notification Module + SendGrid ou Resend. Il faut :
- Créer un compte SendGrid/Resend
- Configurer le module notification dans Medusa
- Designer les templates d'emails (HTML)
- Configurer le domaine d'envoi (SPF, DKIM, DMARC)

### DNS & Domaine — MANDATORY
Le site sera sur `iceindustry.fr` (pas l'URL Vercel). Il faut :

| Action | Où | Détail |
|--------|-----|--------|
| **DNS A record** `iceindustry.fr` → Vercel | LWS (registrar actuel) | Pointer le domaine vers Vercel |
| **DNS CNAME** `www.iceindustry.fr` → Vercel | LWS | Redirection www |
| **DNS A record** `api.iceindustry.fr` → Hetzner | LWS | Déjà fait ✅ |
| **SPF record** pour les emails | LWS | Autoriser SendGrid/Resend à envoyer au nom de @iceindustry.fr |
| **DKIM record** pour les emails | LWS | Signature cryptographique des emails |
| **DMARC record** | LWS | Politique anti-spoofing |
| **Configurer le domaine dans Vercel** | Vercel Dashboard | Settings → Domains → iceindustry.fr |
| **SSL** | Automatique | Vercel (frontend) et Caddy (backend) gèrent le SSL |

### Newsletter — MANDATORY
- [ ] Brancher le formulaire sur le module Newsletter Medusa (déjà créé côté backend)
- [ ] OU intégrer Mailchimp/Brevo
- [ ] Double opt-in (obligatoire RGPD)
- [ ] Email de bienvenue automatique

### Bandeau cookies (RGPD) — MANDATORY
- [ ] Bandeau de consentement au premier visit
- [ ] Choix : accepter / refuser / personnaliser
- [ ] Catégories : essentiel, analytics, marketing
- [ ] Stocker le choix en cookie/localStorage
- [ ] Ne charger Google Analytics / Pixel qu'après consentement
- [ ] Lien vers la politique cookies

### Analytics
- [ ] Google Analytics 4 (conditionné au consentement cookies)
- [ ] Meta Pixel / Facebook (conditionné au consentement)
- [ ] Google Search Console (vérification domaine)
- [ ] Sitemap.xml (déjà généré ✅)
- [ ] Robots.txt (déjà généré ✅)

---

## Phase 4 — Logistique & Paiement

### Colissimo / Livraison
- [ ] Le client crée ses étiquettes manuellement sur colissimo.fr (comme avec WooCommerce)
- [ ] Configurer les tarifs de livraison dans Medusa Admin (options shipping)
- [ ] Click & collect : option gratuite pour Marseille
- [ ] Optionnel post-launch : intégration Sendcloud pour automatiser

### Stripe (paiement en ligne)
- [ ] Passer de la clé test à la clé live
- [ ] Activer Apple Pay dans Stripe Dashboard
- [ ] Activer Google Pay dans Stripe Dashboard
- [ ] Vérifier les webhooks Stripe → Medusa (confirmation de paiement)
- [ ] Tester un paiement réel de bout en bout

### Stripe Connect (2 entités juridiques) — POST-LAUNCH
- [ ] Créer le 2ème compte Stripe (entité multi-marques chaussures)
- [ ] Configurer Stripe Connect (platform + connected account)
- [ ] Module custom Medusa pour router les paiements selon le produit
- [ ] Tester avec des paiements réels sur les 2 comptes

### Zettle POS (boutique physique) — POST-LAUNCH
- [ ] Module custom Medusa ↔ Zettle (OAuth, sync produits, sync stock)
- [ ] Webhooks Zettle → Medusa (vente en boutique → stock -1 sur le site)
- [ ] Medusa events → Zettle (nouveau produit sur le site → apparaît sur Zettle)
- [ ] Job de réconciliation (rattrapage des écarts stock)
- [ ] Estimation : 3-5 semaines de dev

---

## Phase 5 — Post-launch & Améliorations

### Quick wins (1-2h chacun)
- [ ] Favicon + apple-touch-icon Ice Industry
- [ ] Open Graph image par défaut (quand partagé sur les réseaux)
- [ ] Page 404 custom avec suggestions produits
- [ ] Bouton "retour en haut" sur mobile
- [ ] Animation de transition entre les pages
- [ ] Lazy loading des images below-the-fold

### Features à valeur ajoutée
- [ ] Wishlist / favoris (coeur sur les cards + page dédiée)
- [ ] "Préviens-moi quand c'est dispo" (notify back in stock)
- [ ] Avis clients sur les produits
- [ ] Historique de navigation récente ("Vu récemment")
- [ ] Programme fidélité (points)
- [ ] Code promo / réductions
- [ ] Paiement en plusieurs fois (Klarna/Alma)

### Sécurité
- [ ] Cloudflare Access sur l'admin Medusa (SSO + 2FA)
- [ ] Firewall Hetzner (fermer le port 9000 direct, ne garder que Caddy)
- [ ] Rate limiting sur l'API
- [ ] Backup automatique de la base PostgreSQL
- [ ] Monitoring (uptime, erreurs)

### Auth client
- [ ] Google Sign-In (provider built-in Medusa)
- [ ] Apple Sign-In (provider custom)

### Performance
- [ ] Audit Lighthouse (objectif >90 sur les 4 métriques)
- [ ] Optimisation images (formats WebP/AVIF, tailles responsives)
- [ ] Prefetch des pages sur hover des liens
- [ ] Bundle analysis (réduire le JS client)

---

## Récap — Ordre de priorité

### Avant le launch (obligatoire)
1. Finir la PDP
2. Boutique / PLP
3. Collections + Catégories
4. Checkout (UX + Stripe live + Apple/Google Pay)
5. Pages légales (mentions légales)
6. Pages info (livraison, guide tailles, notre boutique)
7. Emails transactionnels (SendGrid/Resend)
8. Newsletter
9. Bandeau cookies RGPD
10. DNS iceindustry.fr → Vercel
11. Colissimo (config tarifs shipping dans Medusa)
12. Compte client (reset password, adresses)

### Semaine 1 post-launch
13. Analytics (GA4, Meta Pixel)
14. Stripe Connect (2ème entité)
15. Monitoring & backup

### Mois 1 post-launch
16. Zettle sync
17. Wishlist
18. Code promo
19. Cloudflare Access admin
20. Google/Apple Sign-In

---

## Notes pour le client

### Ce qui ne change pas pour lui
- Il crée ses étiquettes sur colissimo.fr (comme avant)
- Il utilise Zettle en boutique (comme avant, sync plus tard)
- Les frais de paiement Stripe sont les mêmes (~1.5%)

### Ce qui change (en mieux)
- Admin Medusa plus propre que WooCommerce
- Storefront 10x plus rapide et plus beau
- Stock en temps réel (quand Zettle sync sera en place)
- Emails transactionnels professionnels
- SEO optimisé (JSON-LD, meta, sitemap)

### Ce qu'il doit fournir
- [ ] Photos produits haute qualité (pas les placeholders Unsplash)
- [ ] Contenu éditorial (textes hero, descriptions collections)
- [ ] Infos mannequin par produit (taille, poids, taille portée)
- [ ] Tableau des tailles par catégorie de produit
- [ ] Texte mentions légales (raison sociale, SIRET, etc.)
- [ ] Politique de livraison (tarifs, délais, zones)
- [ ] Logo haute résolution (SVG idéalement)
- [ ] Clé Stripe live (pas test)
- [ ] Accès DNS chez LWS (identifiants)
