"use client"

import { useState } from "react"

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to an API endpoint
    setSubmitted(true)
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"

  return (
    <div className="animate-fade-in">
      <section className="py-16 md:py-24 text-center px-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
          Aide
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Contact</h1>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md px-4 py-3">
                Merci pour votre message ! Nous vous repondrons dans les meilleurs delais.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sujet</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
                >
                  Envoyer
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">contact@iceindustry.fr</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Boutique</h3>
              <p className="text-sm text-muted-foreground">
                Ice Industry
                <br />
                13001 Marseille, France
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Horaires</h3>
              <p className="text-sm text-muted-foreground">
                Mar - Sam : 10h30 - 19h00
                <br />
                Dim - Lun : Ferme
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Reseaux sociaux</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/iceindustry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@iceindustry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
