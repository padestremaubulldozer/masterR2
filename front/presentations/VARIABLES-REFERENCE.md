# Dictionnaire des variables — Growth Plan Bulldozer

> Fichier de référence pour `client-variables.json`. Chaque variable est décrite avec son type, sa localisation dans la présentation, et un exemple tiré du dossier Lotchi.

---

## 1. IDENTITE CLIENT

| Variable | Type | Slide | Description | Exemple |
|---|---|---|---|---|
| `identity.client_name` | string | Cover, Disclaimer, Contexte, partout | Nom commercial du client | `Lotchi` |
| `identity.client_slug` | string | Fichier + chemins assets | Slug URL-safe, underscores | `lotchi` |
| `identity.client_url` | string | Screenshot alt text | URL du site web | `lotchi.live` |
| `identity.client_logo_url` | string | (non utilisé actuellement) | URL du logo du client | |
| `identity.client_screenshot` | string | P9 mockup | Chemin vers le screenshot du site | `assets/clients/lotchi/screen_lotchi.png` |

---

## 2. CONTEXTE (Slide P9)

| Variable | Type | Description | Exemple |
|---|---|---|---|
| `contexte.entreprise` | string (HTML) | Description complète : activité, taille, modèle, produits | `cabinet de gestion de patrimoine (~40 pers., dont ~20 conseillers), B2C, multi-produits (PER, assurance-vie, défiscalisation, SCPI, Private Equity)` |
| `contexte.enjeux` | string (HTML) | Enjeux principaux du client | `Réduire la dépendance coûteuse aux partenaires de leads (15-30 €/lead, ~2 000/mois, conversion ~3 %)...` |
| `contexte.challenges[]` | array | Liste de 3 challenges numérotés | |
| `.num` | int | Numéro du challenge | `1` |
| `.title` | string | Titre court | `Acquisition` |
| `.text` | string | Description du challenge | `tester de nouveaux leviers (paid, outbound), mieux cibler les audiences clés...` |

---

## 3. PRE-AUDIT DEMAND CAPTURE (Slides P12-P17)

### 3a. GEO (P13)
| Variable | Type | Exemple |
|---|---|---|
| `audit_demand_capture.geo.note` | string | `6,9 / 10` |
| `audit_demand_capture.geo.summary` | string | `Bonne visibilité globale (68 %) et base sémantique solide...` |
| `.scores.visibilite.note` | string | `6,5/10` |
| `.scores.visibilite.detail` | string | `Score correct, manque de top positions` |
| `.scores.trafic` | idem | |
| `.scores.contenu` | idem | |
| `.scores.technique` | idem | |
| `.scores.autorite` | idem | |
| `.scores.opportunites` | idem | |

### 3b. SEO (P14)
Même structure que GEO, sans `opportunites`. Note exemple : `5,1 / 10`

### 3c. SEA (P15)
| Variable | Scores disponibles |
|---|---|
| `audit_demand_capture.sea` | `structure`, `mots_cles`, `annonces`, `landing_pages`, `performance` |
Note exemple : `7,2 / 10`

### 3d. CRO (P16)
| Variable | Scores disponibles |
|---|---|
| `audit_demand_capture.cro` | `ergonomie`, `message`, `cta`, `reassurance` |
Note exemple : `7,5 / 10`

---

## 4. QUICK-WINS CRO (Slide P17)

| Variable | Type | Exemple |
|---|---|---|
| `quick_wins_cro[]` | array de 3 items | |
| `.title` | string | `CTA orientés métier` |
| `.text` | string (HTML) | `Remplacer « Buy / Book a demo » par : « Simuler mon PER »...` |

---

## 5. PRE-AUDIT DEMAND GEN (Slides P19-P21)

| Variable | Type | Description |
|---|---|---|
| `audit_demand_gen.intro` | string | Texte d'intro personnalisé |
| `audit_demand_gen.leviers[]` | array | 4 leviers avec nom + description |
| `audit_demand_gen.sma_meta.note` | string | Note globale Meta |
| `audit_demand_gen.sma_meta.scores.*` | object | 5 scores (visibilité, trafic, contenu, technique, autorité) |
| `audit_demand_gen.sma_meta.limites` | string | Limites de l'analyse |
| `audit_demand_gen.sma_linkedin.*` | idem | Même structure pour LinkedIn |

---

## 6. CONFIG TDT (Slide P23)

| Variable | Type | Exemple |
|---|---|---|
| `tdt_config.duree` | string | `3 à 5 jours` |
| `tdt_config.budget` | string | `1 500 à 2 500 €` |
| `tdt_config.equipe` | string | `1 Growth Manager + 1 Designer` |

---

## 7. RESULTATS META (Slide UC1)

| Variable | Type | Exemple |
|---|---|---|
| `resultats_meta.analyse_test.budget` | string | `225€` |
| `resultats_meta.analyse_test.leads` | string | `9` |
| `resultats_meta.analyse_test.leads_qualifies` | string | `9` |
| `resultats_meta.analyse_test.cpl` | string | `25€` |
| `resultats_meta.analyse_test.cpl_qualifie` | string | `25€` |
| `resultats_meta.analyse_campagne.best_pdv` | string | `Autour des SPU` |
| `resultats_meta.analyse_campagne.cout_global` | string | `28€` |
| `resultats_meta.analyse_campagne.cout_best_pdv` | string | `19,26 €` |
| `resultats_meta.insights[]` | array of strings | `["Base hautement décisionnelle...", "Couverture géographique large...", "Orientation B2B forte..."]` |

---

## 8. RESULTATS LINKEDIN (Slides UC2-UC3)

Même structure que Meta (section `analyse_test`, `analyse_campagne`, `insights`), plus :

| Variable | Type | Exemple |
|---|---|---|
| `resultats_linkedin.resultats_detailles.duree` | string | `3 jours` |
| `resultats_linkedin.resultats_detailles.budget_media` | string | `182€` |
| `resultats_linkedin.resultats_detailles.leads` | string | `10` |
| `resultats_linkedin.resultats_detailles.cpl` | string | `18,20€` |
| `resultats_linkedin.resultats_detailles.mql` | string | `5` |
| `resultats_linkedin.resultats_detailles.cout_mql` | string | `36,40€` |
| `resultats_linkedin.resultats_detailles.best_pdv` | string | `Top 5 méthodes suivi chantier` |

---

## 9. RESULTATS FACEBOOK (Slide UC5)

| Variable | Type | Exemple |
|---|---|---|
| `resultats_facebook.duree` | string | `3 jours` |
| `resultats_facebook.budget_media` | string | `101€` |
| `resultats_facebook.leads` | string | `15` |
| `resultats_facebook.cpl` | string | `6,66€` |
| `resultats_facebook.mql` | string | `8` |
| `resultats_facebook.cout_mql` | string | `12,63€` |
| `resultats_facebook.best_pdv` | string | `Top 5 méthodes suivi chantier` |

---

## 10. PLAN STRATEGIQUE (Slide P29)

| Variable | Type | Exemple |
|---|---|---|
| `plan_strategique.phases[]` | array de 3 | |
| `.num` | int | `1` |
| `.titre` | string | `Structuration & relance acquisition France` |
| `.periode` | string | `Mai → Juin` |
| `.objectif` | string | `Activer l'acquisition sur le marché français avec premiers leads qualifiés` |
| `.priorites[]` | array of strings | `["Restructurer Google Ads FR...", "Rebuild LinkedIn Ads FR...", ...]` |
| `.livrables` | string | `Premiers leads français qualifiés + base d'optimisation fiable` |

---

## 11. EQUIPE (Slide P30)

| Variable | Type | Exemple |
|---|---|---|
| `equipe.business_partner.name` | string | `Pierre-Arnaud Destremau` |
| `equipe.business_partner.photo_url` | string | URL de la photo |
| `equipe.head_of_growth.photo_url` | string | URL de la photo |
| `equipe.members[]` | array | |
| `.role` | string | `Paid Manager` |
| `.subtitle` | string | `Inbound & Outbound` |
| `.photo_url` | string | URL de la photo |

---

## 12. PRICING (Slides P34-P35)

### 12a. Offre globale (P34)
| Variable | Type | Exemple |
|---|---|---|
| `pricing.offer_title` | string | `Growth Plan — 3 mois` |
| `pricing.phase_title` | string | `Phase 1 : Build ABM (Durée : 6 mois)` |
| `pricing.roles[]` | array | `[{name, setup, monthly, subtotal}]` |
| `pricing.total` | string | Montant total HT |

### 12b. Ventilation des coûts (P35)
| Variable | Type | Exemple |
|---|---|---|
| `pricing.ventilation.mois_labels[]` | array 3 strings | `["Mai", "Juin", "Juillet"]` |
| `pricing.ventilation.lignes[]` | array | Phases avec items |
| `.phase` | string | `Expertise Paid — SMA Meta` |
| `.items[].statut` | string | `obligatoire` ou `recommande` |
| `.items[].element` | string | `Pack LP (123 Renov)` |
| `.items[].mois[]` | array 3 strings | `["1 500 € HT", "1 500 € HT", ""]` |
| `.items[].subtotal` | string | `4 500 € HT` |
| `pricing.ventilation.total_par_mois[]` | array 3 strings | `["4 150 € HT", "2 550 € HT", "2 550 € HT"]` |
| `pricing.ventilation.total_general` | string | `9 250 € HT` |

---

## 13. PROJECTIONS FINANCIERES (Slide P36)

3 scénarios identiques en structure : `projections.pessimiste`, `projections.realiste`, `projections.optimiste`

| Variable | Type | Exemple (réaliste) |
|---|---|---|
| `.cout_mql` | string | `40 → 25 €` |
| `.conversion` | string | `20 %` |
| `.panier_moyen` | string | `8 000 €` |
| `.duree` | string | `12 mois` |
| `.budget_media` | string | `35 000 €` |
| `.mql_generes` | string | `1 400` |
| `.clients_generes` | string | `219` |
| `.arr` | string | `2 240 000 €` |

---

## Notes

- Les valeurs de type `string (HTML)` peuvent contenir des entités HTML (`&eacute;`, `&mdash;`, etc.)
- Les montants sont toujours en format français avec espaces (`1 500 € HT`)
- Le screenshot client est auto-généré via headless Chrome dans `assets/clients/<slug>/`
- Les fichiers pricing sont disponibles dans le Drive : dossier partagé Bulldozer
