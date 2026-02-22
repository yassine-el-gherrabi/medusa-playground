export default function ResellPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Politique Resell</h1>

      <p className="text-sm text-muted-foreground mb-8">
        Ice Industry est oppose a la revente speculative de ses produits. Nous souhaitons que nos
        pieces soient accessibles a notre communaute a un prix juste.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Notre position</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Les produits Ice Industry sont destines a un usage personnel. La revente a des fins
        lucratives au-dessus du prix de vente original est contraire a nos valeurs.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Mesures anti-resell</h2>
      <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
        <li>Limitation des quantites par client lors des drops</li>
        <li>Verification des commandes multiples</li>
        <li>Droit d&apos;annulation des commandes suspectes</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-3">Revente entre particuliers</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Si vous souhaitez revendre un article Ice Industry que vous ne portez plus, nous vous
        encourageons a le faire au prix d&apos;achat ou en dessous. Privilegiez les echanges au
        sein de la communaute.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Signalement</h2>
      <p className="text-sm text-muted-foreground">
        Si vous constatez une revente speculative de produits Ice Industry, merci de nous signaler
        a{" "}
        <a href="mailto:contact@iceindustry.fr" className="text-foreground underline hover:no-underline">
          contact@iceindustry.fr
        </a>
        .
      </p>
    </div>
  )
}
