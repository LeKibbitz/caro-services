'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with backend/webhook
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🇱🇺 Spécialiste Frontaliers FR → Luxembourg</div>
            <h1>
              Vos déclarations.<br />
              <span>Pas vos économies.</span>
            </h1>
            <p className="hero-subtitle">
              Déclarations TVA, impôts et comptabilité au Luxembourg.<br />
              <strong>~40% moins cher</strong> qu'une fiduciaire traditionnelle.
            </p>
            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary">
                Demander un devis gratuit →
              </a>
              <a href="#tarifs" className="btn btn-secondary">
                Voir les tarifs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="container">
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-value">25+</div>
            <div className="stat-label">Années d'expérience</div>
          </div>
          <div className="stat">
            <div className="stat-value">~40%</div>
            <div className="stat-label">Moins cher</div>
          </div>
          <div className="stat">
            <div className="stat-value">125k</div>
            <div className="stat-label">Frontaliers FR→LU</div>
          </div>
          <div className="stat">
            <div className="stat-value">24h</div>
            <div className="stat-label">Réponse garantie</div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <section className="problem">
        <div className="container">
          <h2>Vous en avez marre ?</h2>
          <p className="section-subtitle">
            Les frontaliers et petites entreprises méritent mieux que des tarifs prohibitifs.
          </p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">💸</div>
              <h3>Tarifs exorbitants</h3>
              <p>Les fiduciaires facturent 400-600€ pour une simple déclaration d'impôts. C'est trop.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">😵</div>
              <h3>Complexité administrative</h3>
              <p>Double fiscalité, CCSS, MyGuichet... Vous ne savez plus où donner de la tête.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🤷</div>
              <h3>Manque d'accompagnement</h3>
              <p>Personne pour expliquer, répondre à vos questions, vous rassurer.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">⏰</div>
              <h3>Temps perdu</h3>
              <p>Des heures à chercher comment remplir un formulaire que vous ne comprenez pas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="tarifs">
        <div className="container">
          <h2>Tarifs transparents</h2>
          <p className="section-subtitle">
            Pas de devis opaque. Vous savez exactement ce que vous payez.
          </p>
          <div className="pricing-grid">
            <div className="price-card">
              <h3>Déclaration TVA mensuelle</h3>
              <div className="price-compare">
                <span className="price-old">250-300€</span>
                <span className="price-new">150€ <span>/ mois</span></span>
              </div>
              <div className="price-savings">Économie : ~100€/mois</div>
              <ul className="price-features">
                <li>Préparation complète</li>
                <li>Dépôt sur MyGuichet</li>
                <li>Suivi et rappels</li>
                <li>Support WhatsApp</li>
              </ul>
              <a href="#contact" className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                Demander un devis
              </a>
            </div>

            <div className="price-card featured">
              <div className="price-badge">⭐ POPULAIRE</div>
              <h3>Déclaration d'impôts (IR)</h3>
              <div className="price-compare">
                <span className="price-old">400-600€</span>
                <span className="price-new">280€</span>
              </div>
              <div className="price-savings">Économie : ~40%</div>
              <ul className="price-features">
                <li>Analyse de votre situation</li>
                <li>Optimisation fiscale légale</li>
                <li>Déclaration complète</li>
                <li>Accompagnement personnalisé</li>
                <li>Révision avant envoi</li>
              </ul>
              <a href="#contact" className="btn btn-primary" style={{width: '100%', justifyContent: 'center', background: 'white', color: '#1d4ed8'}}>
                Demander un devis
              </a>
            </div>

            <div className="price-card">
              <h3>Pack Entreprise (annuel)</h3>
              <div className="price-compare">
                <span className="price-old">3-6k€</span>
                <span className="price-new">1 800€ <span>/ an</span></span>
              </div>
              <div className="price-savings">Économie : ~40%</div>
              <ul className="price-features">
                <li>TVA mensuelle incluse</li>
                <li>Clôture annuelle</li>
                <li>Dépôt RCS</li>
                <li>Support prioritaire</li>
                <li>Conseils illimités</li>
              </ul>
              <a href="#contact" className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                Demander un devis
              </a>
            </div>
          </div>

          <p style={{textAlign: 'center', marginTop: '40px', color: 'var(--text-light)', fontSize: '14px'}}>
            💡 <strong>Fidélité récompensée :</strong> -15% dès la 2ème année si votre situation reste stable
          </p>
        </div>
      </section>

      {/* About / Trust Section */}
      <section style={{background: 'var(--bg-alt)'}}>
        <div className="container">
          <h2>Pourquoi me faire confiance ?</h2>
          <p className="section-subtitle">
            25 ans d'expérience en finance internationale, pas une fiduciaire de plus.
          </p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">🎓</div>
              <h3>Expertise reconnue</h3>
              <p>DESS Finance (Paris-Sorbonne), Master Économie (Paris-Dauphine). Expérience chez Mars, Guardian, Koch.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🌍</div>
              <h3>Vision internationale</h3>
              <p>Maîtrise des normes US GAAP, françaises, luxembourgeoises et européennes.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🤝</div>
              <h3>Accompagnement humain</h3>
              <p>Pas de robot. Je prends le temps d'expliquer et de répondre à vos questions.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📍</div>
              <h3>Basée au Luxembourg</h3>
              <p>Connaissance parfaite du système luxembourgeois et des problématiques frontalières.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section>
        <div className="container">
          <h2>Services proposés</h2>
          <p className="section-subtitle">
            Tout ce dont vous avez besoin pour vos démarches fiscales et comptables.
          </p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">📊</div>
              <h3>Déclarations TVA</h3>
              <p>Mensuelle, trimestrielle ou annuelle. Dépôt sur MyGuichet inclus.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📝</div>
              <h3>Impôts sur le revenu</h3>
              <p>Personnes physiques, frontaliers, optimisation fiscale légale.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🏢</div>
              <h3>Impôts des sociétés</h3>
              <p>IS, ICC, IF pour SARL et SARL-S sous seuils.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📒</div>
              <h3>Comptabilité</h3>
              <p>Tenue comptable, clôture annuelle, dépôt RCS.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">👷</div>
              <h3>Social & CCSS</h3>
              <p>Déclarations CCSS, bulletins de salaire, gestion paie.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🔄</div>
              <h3>Coordination FR-LU</h3>
              <p>Spécialiste des problématiques transfrontalières.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section className="cta" id="contact">
        <div className="container">
          <h2>Prêt à économiser ?</h2>
          <p>
            Demandez votre devis gratuit en 2 minutes.<br />
            Réponse garantie sous 24h.
          </p>

          <div className="contact-form">
            {submitted ? (
              <div style={{textAlign: 'center', padding: '40px 0'}}>
                <div style={{fontSize: '4rem', marginBottom: '20px'}}>✅</div>
                <h3 style={{marginBottom: '15px'}}>Merci !</h3>
                <p>Votre demande a été envoyée. Je vous recontacte sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="jean@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+352 691 123 456"
                  />
                </div>
                <div className="form-group">
                  <label>Type de prestation *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="tva-mensuelle">Déclaration TVA mensuelle</option>
                    <option value="tva-annuelle">Déclaration TVA annuelle</option>
                    <option value="ir">Déclaration d'impôts (IR)</option>
                    <option value="is">Déclaration société (IS)</option>
                    <option value="pack">Pack entreprise annuel</option>
                    <option value="autre">Autre / Je ne sais pas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Décrivez votre situation ou posez vos questions..."
                  />
                </div>
                <button type="submit" className="form-submit">
                  Envoyer ma demande →
                </button>
                <p style={{textAlign: 'center', marginTop: '15px', fontSize: '13px', color: 'var(--text-light)'}}>
                  🔒 Vos données sont confidentielles et ne seront jamais partagées.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Caro-Services</h3>
              <p>Déclarations fiscales et comptabilité au Luxembourg. Spécialiste frontaliers FR→LU.</p>
              <p style={{marginTop: '15px'}}>
                📍 Luxembourg<br />
                📧 contact@caro-services.lu<br />
                📱 WhatsApp disponible
              </p>
            </div>
            <div className="footer-links">
              <h4>Services</h4>
              <ul>
                <li><a href="#tarifs">Déclaration TVA</a></li>
                <li><a href="#tarifs">Impôts sur le revenu</a></li>
                <li><a href="#tarifs">Comptabilité entreprise</a></li>
                <li><a href="#tarifs">Pack annuel</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Ressources</h4>
              <ul>
                <li><a href="https://guichet.public.lu" target="_blank" rel="noopener">MyGuichet.lu</a></li>
                <li><a href="https://impotsdirects.public.lu" target="_blank" rel="noopener">Impôts directs LU</a></li>
                <li><a href="https://ccss.lu" target="_blank" rel="noopener">CCSS</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Légal</h4>
              <ul>
                <li><a href="#">Mentions légales</a></li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">CGV</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Caro-Services. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
