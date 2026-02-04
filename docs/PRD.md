# caro-services - Product Requirements Document

**Author:** Tom
**Date:** 2026-01-28
**Version:** 1.0

---

## Executive Summary

Caro-Services est une **SARL-S luxembourgeoise** d'assistance administrative pour particuliers, fondée par Tom (basé à Nancy, opérant au Luxembourg). Elle propose une prise en charge complète des démarches administratives qui "empoisonnent la vie" des gens : fiscalité luxembourgeoise et française, coordination transfrontalière, successions, renouvellements de documents et création d'entreprise. Marché principal : Luxembourg. Marchés secondaires : France et pays voisins.

Le service fonctionne en mode léger (téléphone, email, WhatsApp, TikTok) avec une tarification hybride transparente : horaire (20-40€/h) + forfaits fixes par type de démarche. Cible prioritaire : les particuliers, un segment sous-servi par les concurrents qui visent principalement les entreprises. Stratégie d'acquisition : exploitation de TikTok (contenu organique, TikTok Shop, ads, sondages interactifs) pour toucher une audience large à faible coût.

### Forme juridique : SARL-S (recommandée)

| Critère | Détail |
|---------|--------|
| **Statut** | Société à Responsabilité Limitée Simplifiée (SARL-S) |
| **Capital** | 1€ minimum (max 11 999€) |
| **Responsabilité** | Limitée aux apports (patrimoine personnel protégé) |
| **Acte notarié** | Non requis (acte sous seing privé) |
| **Fiscalité** | IRC ~23,87% effectif à Luxembourg-Ville |
| **TVA** | Seuil d'exonération : 50 000€ CA/an (depuis 01/2025) |
| **Idéal pour** | Vente d'expertise sans stock ni matériel |

> Alternative envisageable : entreprise individuelle (indépendant / personne physique) — plus simple mais responsabilité illimitée sur le patrimoine personnel, risque réel pour un service qui gère les démarches admin/fiscales de clients.

### What Makes This Special

**"Rendre l'administratif humain et accessible"**

L'essence de Caro-Services tient en trois points :
1. **Spécialisation particuliers** dans un marché qui les ignore — les concurrents (Officéo, Aadprox, HBC Group) ciblent les entreprises
2. **Expertise transfrontalière France-Luxembourg** pour les 220 000+ frontaliers français — une niche à forte valeur que personne ne sert aux particuliers
3. **Transparence radicale** — grille tarifaire publique (horaire + forfaits) là où les concurrents fonctionnent sur devis opaque à 25-60€/h

Le moment magique : un frontalier Nancy→Luxembourg qui galère depuis des mois avec sa double déclaration d'impôts reçoit un WhatsApp : *"C'est fait, voici le récapitulatif. Vous avez récupéré 800€ de trop-payé."*

---

## Project Classification

**Technical Type:** Service Business (SARL-S luxembourgeoise de services, pas de produit logiciel)
**Domain:** Services administratifs aux particuliers (Luxembourg principal, France et pays voisins)
**Complexity:** Low (opération solo, mode léger, pas de développement technique au MVP)

Caro-Services est un **service business**, pas un produit tech pur. Le PRD documente les prestations de service, les processus opérationnels et la stratégie commerciale. Au MVP, l'outillage repose sur des outils existants (Google Workspace, WhatsApp Business, Calendly, TikTok Business). L'IA et l'automatisation des processus sont envisagées à terme pour gagner en efficacité, mais représentent un coût — elles ne sont pas prioritaires au lancement.

### Contexte de marché

- **Marché en tension** post-COVID : offre en augmentation, demande en baisse
- **Digitalisation forcée** : "Administration Zéro Papier" 2025 exclut les moins à l'aise
- **13 millions** de Français en difficulté avec le numérique (illectronisme)
- **220 000+** frontaliers français au Luxembourg avec des problématiques bi-pays

### Documents de référence chargés

- Product Brief : `docs/product-brief-caro-services-2026-01-28.md`
- Analyse concurrentielle : `docs/analyse-concurrence-caro-services.md`
- Fiches sociétés : `docs/societes-assistance-administrative.md`
- Sondages marché : `docs/sondage-besoins-marche-*.md` (France, Luxembourg, Belgique, multi-pays)

---

## Success Criteria

{{success_criteria}}

---

## Product Scope

### MVP - Minimum Viable Product

{{mvp_scope}}

### Growth Features (Post-MVP)

{{growth_features}}

### Vision (Future)

{{vision_features}}

---

## Functional Requirements

{{functional_requirements_complete}}

---

## Non-Functional Requirements

{{nfr_sections}}

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow epics-stories` to create the implementation breakdown.

---

## References

{{references}}

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow epics-stories`
2. **UX Design** (if UI) - Run: `workflow ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of caro-services - {{product_magic_summary}}_

_Created through collaborative discovery between Tom and AI facilitator._
