# Newsletter System — Ice Industry

## Architecture

```
Client (formulaires) → API Route /api/newsletter → Brevo API
                              ↓
                    Security layers (4)
                    1. Honeypot
                    2. Rate limit (3/min/IP)
                    3. Email validation (RFC 5322)
                    4. Disposable email blocklist
```

**Service** : Brevo (ex-Sendinblue) — RGPD France, gratuit 300 emails/jour
**Liste** : ID 2 (liste principale)
**Types** : `src/types/newsletter.ts` (NewsletterSource enum + NewsletterPayload type)
**Sécurité** : `src/lib/newsletter-security.ts`
**API** : `src/app/api/newsletter/route.ts`
**Hook** : `src/hooks/useNewsletter.ts`

## Points d'entrée (5)

| Point | Fichier | addToList | Données envoyées |
|-------|---------|-----------|-----------------|
| Footer | `components/layout/FooterNewsletter.tsx` | ✅ oui | email + honeypot |
| Page /newsletter | `app/(main)/newsletter/page.tsx` | ✅ oui | email + honeypot |
| Checkout (checkbox) | `components/checkout/CheckoutForm.tsx` | ✅ oui | email + prénom + nom + tel |
| Register | `app/(main)/account/register/page.tsx` | ❌ non | email + prénom + nom |
| Profil update | `app/(main)/account/page.tsx` | ❌ non | email + prénom + nom + tel + date naissance |

## Flows utilisateur

### 1. Visiteur s'inscrit via footer/page newsletter
```
Email saisi → honeypot vérifié → rate limit → validation → disposable check
→ Brevo: contact créé, ajouté à liste 2
→ Attributs: SOURCE="footer"
```

### 2. Visiteur passe commande + coche la checkbox
```
Commande validée → fire-and-forget vers /api/newsletter
→ Brevo: contact créé/enrichi, ajouté à liste 2
→ Attributs: PRENOM, NOM, SMS, SOURCE="checkout"
```

### 3. Visiteur crée un compte (sans commander)
```
Register réussi → fire-and-forget vers /api/newsletter
→ Brevo: contact créé/enrichi, PAS ajouté à liste (pas de consentement)
→ Attributs: PRENOM, NOM, SOURCE="register"
```

### 4. Client met à jour son profil
```
Profil sauvegardé → fire-and-forget vers /api/newsletter
→ Brevo: contact enrichi, PAS ajouté à liste
→ Attributs: PRENOM, NOM, SMS, DATE_NAISSANCE, SOURCE="profile"
```

### 5. Enrichissement progressif (même email, plusieurs interactions)
```
Étape 1 (footer)    → Brevo: { email } — dans la liste
Étape 2 (register)  → Brevo: { email, PRENOM, NOM } — PAS ajouté à la liste
Étape 3 (checkout)  → Brevo: { email, PRENOM, NOM, SMS } — déjà dans la liste
Étape 4 (profil)    → Brevo: { email, DATE_NAISSANCE } — enrichi
```
Brevo fusionne automatiquement via `updateEnabled: true`. Pas de doublon.

## Consentement RGPD

- **Ajout à la liste newsletter** = uniquement sur consentement explicite (footer, page newsletter, checkbox checkout)
- **Checkbox checkout** = décochée par défaut (RGPD: pas de pré-cochage)
- **Register/profil** = sync des données uniquement, pas d'inscription newsletter
- Un contact Brevo sans appartenance à une liste ne reçoit aucune campagne

## Attributs Brevo

| Attribut | Type | Source |
|----------|------|--------|
| PRENOM | text | Register, checkout, profil |
| NOM | text | Register, checkout, profil |
| SMS | text | Checkout, profil |
| DATE_NAISSANCE | date | Profil (YYYY-MM-DD) |
| SOURCE | text | Tous (enum: footer, newsletter_page, checkout, register, profile) |

## Sécurité

### Honeypot
- Champ `<input name="website">` invisible (CSS absolute + opacity 0)
- `tabIndex={-1}` + `aria-hidden="true"` pour l'accessibilité
- Si rempli → réponse `{ success: true }` silencieuse (bot piégé)
- Présent sur : footer, page newsletter. Pas sur checkout (Stripe anti-fraude).

### Rate limit
- 3 requêtes/minute/IP en mémoire
- Reset au redeploy (acceptable sur serverless)
- Cleanup automatique toutes les 5 minutes
- Réponse 429 avec header `Retry-After`

### Validation email
- Regex RFC 5322
- Longueur : 5-254 caractères, local ≤64, domaine ≤253
- Pas de double dots
- TLD requis (≥2 caractères)

### Emails jetables
- ~250 domaines bloqués (Set pour O(1))
- Couvre : tempmail, yopmail, guerrillamail, mailinator, etc.
- Réponse 400 : "Les adresses email temporaires ne sont pas acceptées"

## Env vars

```
BREVO_API_KEY=xkeysib-...  (server-side only, jamais exposé au client)
```

## Brevo dashboard

- URL : https://app.brevo.com
- Les templates de campagne sont créés dans Brevo par le développeur
- Le client compose le contenu et envoie depuis Brevo (autonome)
- Stats (taux ouverture, clics) disponibles dans Brevo
