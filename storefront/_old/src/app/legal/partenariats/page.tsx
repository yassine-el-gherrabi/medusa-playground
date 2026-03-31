export default function PartenariatsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Partenariats</h1>

      <p className="text-sm text-muted-foreground mb-8">
        Ice Industry collabore regulierement avec des artistes, des marques et des createurs
        partageant notre vision du streetwear. Si vous souhaitez collaborer avec nous, nous serions
        ravis d&apos;en discuter.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Types de partenariats</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Collaborations artistiques</h3>
          <p className="text-sm text-muted-foreground">
            Nous collaborons avec des artistes locaux et internationaux pour des collections
            capsules exclusives.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-1">Influenceurs et createurs de contenu</h3>
          <p className="text-sm text-muted-foreground">
            Nous travaillons avec des createurs de contenu authentiques qui partagent les valeurs
            de la marque.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-1">Evenements</h3>
          <p className="text-sm text-muted-foreground">
            Sponsoring d&apos;evenements culturels et sportifs en lien avec notre univers.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Nous contacter</h2>
      <p className="text-sm text-muted-foreground">
        Pour toute proposition de partenariat, ecrivez-nous a{" "}
        <a href="mailto:partnerships@iceindustry.fr" className="text-foreground underline hover:no-underline">
          partnerships@iceindustry.fr
        </a>{" "}
        en detaillant votre projet.
      </p>
    </div>
  )
}
