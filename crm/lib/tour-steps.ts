import type { Step } from "react-joyride";

export const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    title: "Tableau de bord",
    content: "Vue d'ensemble de votre activité : statistiques, dossiers en attente, factures impayées.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: '[data-tour="leads"]',
    title: "Prospects",
    content: "Gérez vos prospects, suivez leur progression dans le pipeline commercial.",
    placement: "right",
  },
  {
    target: '[data-tour="contacts"]',
    title: "Clients",
    content: "Vos clients actifs avec leurs dossiers, devis et factures associés.",
    placement: "right",
  },
  {
    target: '[data-tour="quotes"]',
    title: "Devis",
    content: "Créez et envoyez des devis professionnels. Convertissez-les en factures en un clic.",
    placement: "right",
  },
  {
    target: '[data-tour="dossiers"]',
    title: "Dossiers",
    content: "Suivez les dossiers fiscaux de vos clients (TVA, IR, IS, CCSS...) avec une checklist détaillée.",
    placement: "right",
  },
  {
    target: '[data-tour="inbox"]',
    title: "Messagerie unifiée",
    content: "Tous vos messages WhatsApp et emails au même endroit. Répondez directement depuis le CRM.",
    placement: "right",
  },
  {
    target: '[data-tour="export"]',
    title: "Export",
    content: "Exportez n'importe quelle liste en CSV ou Excel avec les filtres actifs.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: '[data-tour="settings"]',
    title: "Paramètres",
    content: "Configurez votre connexion WhatsApp, email SMTP/IMAP, et personnalisez vos statuts.",
    placement: "right",
  },
];
