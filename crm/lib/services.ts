import { getSetting, setSetting } from "./settings";
export type { ServiceItem } from "./services-types";
import type { ServiceItem } from "./services-types";

const SETTING_KEY = "service_catalog";

// Default catalog — used as fallback if DB has nothing
export const DEFAULT_CATALOG: ServiceItem[] = [
  { id: "s1", category: "Consultations", description: "Appel découverte (15-30 min)", unitPrice: 0, badge: "Gratuit", detail: "Premier contact, évaluation de la situation" },
  { id: "s2", category: "Consultations", description: "Consultation conseil (1h)", unitPrice: 60, detail: "Conseil fiscal ou comptable personnalisé" },
  { id: "s3", category: "Consultations", description: "Assistance horaire", unitPrice: 30, detail: "Classement, appels, formulaires" },
  { id: "s4", category: "Particuliers & Frontaliers", description: "Déclaration IR", unitPrice: 280, badge: "Populaire", detail: "Analyse, optimisation, déclaration complète" },
  { id: "s5", category: "Particuliers & Frontaliers", description: "Déclaration IR — situation complexe", unitPrice: 400, detail: "Multi-revenus, immobilier, international" },
  { id: "s6", category: "Particuliers & Frontaliers", description: "Pack frontalier — premier setup FR-LU", unitPrice: 350, detail: "Configuration initiale, CCSS, MyGuichet, coordination" },
  { id: "s7", category: "Particuliers & Frontaliers", description: "Vérification déductions fiscales", unitPrice: 120, detail: "Audit des déductions possibles" },
  { id: "s8", category: "Particuliers & Frontaliers", description: "Assistance administrative frontalier", unitPrice: 150, detail: "CCSS, MyGuichet, coordination FR-LU" },
  { id: "s9", category: "TVA & Déclarations périodiques", description: "Déclaration TVA mensuelle", unitPrice: 150, badge: "Récurrent", detail: "Préparation + dépôt MyGuichet" },
  { id: "s10", category: "TVA & Déclarations périodiques", description: "Déclaration TVA trimestrielle", unitPrice: 200, detail: "Préparation + dépôt MyGuichet" },
  { id: "s11", category: "TVA & Déclarations périodiques", description: "Déclaration TVA annuelle", unitPrice: 350, detail: "Récapitulatif + dépôt" },
  { id: "s12", category: "Entreprises & Sociétés", description: "Pack Entreprise annuel", unitPrice: 1800, badge: "Meilleure offre", detail: "TVA + clôture + RCS + support illimité" },
  { id: "s13", category: "Entreprises & Sociétés", description: "Déclaration société (IS/ICC/IF)", unitPrice: 400, detail: "Impôts des sociétés sous seuils" },
  { id: "s14", category: "Entreprises & Sociétés", description: "Comptabilité annuelle", unitPrice: 1200, detail: "Tenue comptable + clôture" },
  { id: "s15", category: "Entreprises & Sociétés", description: "Clôture annuelle + dépôt RCS", unitPrice: 800, detail: "Bilan + compte de résultat + dépôt" },
  { id: "s16", category: "Entreprises & Sociétés", description: "Création SARL-S — accompagnement", unitPrice: 500, detail: "Statuts, immatriculation, setup" },
  { id: "s17", category: "Social & Paie", description: "Déclarations CCSS mensuelle", unitPrice: 200, detail: "Centre Commun Sécurité Sociale" },
  { id: "s18", category: "Social & Paie", description: "Bulletins de salaire (par salarié/mois)", unitPrice: 50, detail: "Établissement + envoi" },
  { id: "s19", category: "Social & Paie", description: "Coordination FR-LU", unitPrice: 350, detail: "Problématiques transfrontalières" },
];

export async function getCatalog(): Promise<ServiceItem[]> {
  const raw = await getSetting(SETTING_KEY);
  if (!raw) return DEFAULT_CATALOG;
  try {
    const parsed = JSON.parse(raw) as ServiceItem[];
    return parsed.length > 0 ? parsed : DEFAULT_CATALOG;
  } catch {
    return DEFAULT_CATALOG;
  }
}

export async function saveCatalog(items: ServiceItem[]): Promise<void> {
  await setSetting(SETTING_KEY, JSON.stringify(items));
}

export { groupByCategory } from "./services-types";
