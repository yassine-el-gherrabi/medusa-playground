export default function NousRejoindrePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nous rejoindre</h1>

      <p className="text-sm text-muted-foreground mb-8">
        Ice Industry est une marque en pleine croissance basee a Marseille. Nous recherchons des
        talents passionnes par le streetwear et la culture urbaine pour rejoindre notre equipe.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Postes ouverts</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nous n&apos;avons pas de postes ouverts pour le moment, mais nous sommes toujours a
        l&apos;ecoute de candidatures spontanees.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Candidature spontanee</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Envoyez votre CV et une lettre de motivation a{" "}
        <a href="mailto:jobs@iceindustry.fr" className="text-foreground underline hover:no-underline">
          jobs@iceindustry.fr
        </a>
        . Preciser le poste qui vous interesse et ce que vous pourriez apporter a l&apos;equipe.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Ce que nous recherchons</h2>
      <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
        <li>Passion pour la mode streetwear et la culture urbaine</li>
        <li>Esprit d&apos;equipe et autonomie</li>
        <li>Creativite et sens du detail</li>
        <li>Connaissance du marche local marseillais (un plus)</li>
      </ul>
    </div>
  )
}
