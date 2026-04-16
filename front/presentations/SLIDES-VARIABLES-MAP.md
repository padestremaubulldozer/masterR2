# Carte des variables — Template R2 Growth Plan

> **Deterministe** = code HTML/CSS/JS fige, INTERDIT de modifier
> **Probabiliste** = texte a trous que le LLM complete par client

---

## Legende

| Symbole | Type | Description |
|---------|------|-------------|
| `DET` | Deterministe | Slide entierement figee, aucune variable |
| `IMG` | Image seule | Seul le screenshot change (capture headless Chrome) |
| `VAR` | Variables texte | Le LLM remplit les XXX et/ou les donnees chiffrees |
| `$$` | Pricing | Montants specifiques au devis client |

---

## Vue d'ensemble (52 slides)

```
S01  COVER ................ VAR   client_name
S02  DISCLAIMER ........... VAR   client_name (x3)
S03  Bulldozer divider .... DET
S04  Mission .............. DET
S05  Equipe Bulldozer ..... DET
S06  Services ............. DET
S07  Secteurs ............. DET
S08  Contexte divider ..... DET
S09  Contexte detail ...... VAR   client_name, entreprise, enjeux, challenges, screenshot_client
S10  Approche Bulldozer ... VAR   client_name, approche_text
S11  Pre-audit DC divider . DET
S12  DC Intro ............. VAR   client_name (x4), perimetre_text
S13  GEO Audit ............ VAR   geo_note, geo_scores (x6), geo_summary
S14  SEO Audit ............ VAR   seo_note, seo_scores (x5), seo_summary
S15  SEA Audit ............ VAR   sea_note, sea_scores (x5), sea_summary
S16  CRO Audit ............ VAR   cro_note, cro_scores (x4), cro_summary + screenshot_client_cro
S17  Quick-wins CRO ....... VAR   quickwins[] (3 items: title + text) + screenshot_client_cro
S18  Pre-audit DG divider . DET
S19  DG Intro ............. VAR   client_name (x5), leviers[] (4 items)
S20  SMA Meta ............. VAR   sma_meta_note, sma_meta_scores (x5), sma_meta_limites
S21  SMA LinkedIn ......... VAR   sma_linkedin_note, sma_linkedin_scores (x5), sma_linkedin_limites
S22  TDT DG divider ....... DET
S23  TDT Detail ........... VAR   client_name (x2), tdt_budget, tdt_duree, tdt_equipe
S24  Methodo divider ...... DET
S25  Regles du test ....... DET
S26  Glossaire ............ DET
S27  CTVP ................. DET
S28  Resultats divider .... DET
S29  TDT Meta resultats ... VAR   meta_budget, meta_leads, meta_leads_q, meta_cpl, meta_cpl_q,
                                  meta_best_pdv, meta_cout_global, meta_cout_best, meta_insights[]
S30  TDT LinkedIn result. . VAR   linkedin_budget, linkedin_leads, linkedin_leads_q, linkedin_cpl,
                                  linkedin_cpl_q, linkedin_best_pdv, linkedin_cout_best, linkedin_insights[]
S31  Principaux res. LI ... VAR   li_duree, li_budget_media, li_leads, li_cpl, li_mql, li_cout_mql, li_best_pdv
S32  Principaux res. FB ... VAR   fb_duree, fb_budget_media, fb_leads, fb_cpl, fb_mql, fb_cout_mql, fb_best_pdv
S33  Bilan divider ........ DET
S34  Bilan contenu ........ VAR   dc_positifs[], dc_negatifs[], dg_positifs[], dg_negatifs[], limites[]
S35  SS divider ........... DET
S36  SS Adecco ............ DET   (contenu fige, screenshot fige)
S37  SS Addingwell ........ DET
S38  SS Alma .............. DET
S39  SS Dotfile ........... DET
S40  SS Vertuoza .......... DET
S41  SS Velux ............. DET
S42  Plan Strategique ..... VAR   client_name, phases[] (3x: titre, periode, objectif, priorites[], livrables)
S43  Equipe ............... VAR   bp_name, bp_photo, hog_photo, members[] (role, subtitle, photo)
S44  Suivi de mission ..... DET   (contenu generique Bulldozer)
S45  Offre Growth Plan .... $$    offer_title, roles[] (name, setup, monthly, subtotal), total
S46  Ventilation couts .... $$    mois_labels[], phases[].items[] (statut, element, mois[], subtotal), totaux
S47  Projection financiere  $$    3 scenarios (pessimiste/realiste/optimiste) x 8 variables
S48  Pourquoi BZ divider .. DET
S49  Notre Modele ......... DET
S50  Etapes divider ....... DET
S51  Lancement ............ VAR   client_name (x2)
S52  Closing .............. VAR   client_name
```

---

## Detail des variables par categorie

### A. IDENTITE (simple find-replace "XXX")
| Variable | Slides | Description |
|----------|--------|-------------|
| `client_name` | 1,2,9,10,12,19,23,42,51,52 | Nom commercial du client. 32 occurrences de "XXX" |
| `client_slug` | - | URL-safe (underscores). Utilise pour chemins assets |
| `bp_name` | 43 | Nom du Business Partner Bulldozer |

### B. CONTEXTE (LLM redige a partir du brief client)
| Variable | Slide | Type | Exemple |
|----------|-------|------|---------|
| `entreprise` | 9 | string HTML | "cabinet de gestion de patrimoine (~40 pers.)" |
| `enjeux` | 9 | string HTML | "Reduire la dependance couteuse aux leads..." |
| `challenges[]` | 9 | array x3 | [{num, title, text}] |
| `approche_text` | 10 | string HTML | "BULLDOZER accompagne XXX dans..." |

### C. PRE-AUDIT (LLM analyse les donnees client)
| Variable | Slide | Sous-variables |
|----------|-------|---------------|
| `geo` | 13 | note, summary, scores.{visibilite,trafic,contenu,technique,autorite,opportunites} |
| `seo` | 14 | note, summary, scores.{visibilite,trafic,contenu,technique,autorite} |
| `sea` | 15 | note, summary, scores.{structure,mots_cles,annonces,landing_pages,performance} |
| `cro` | 16 | note, summary, scores.{ergonomie,message,cta,reassurance} |
| `quick_wins_cro[]` | 17 | array x3 [{title, text}] |
| `sma_meta` | 20 | note, scores (x5), limites |
| `sma_linkedin` | 21 | note, scores (x5), limites |

### D. TDT CONFIG + RESULTATS (donnees factuelles du test)
| Variable | Slide | Type |
|----------|-------|------|
| `tdt_budget` | 23 | string "500 € / media" |
| `tdt_duree` | 23 | string "3 a 5 jours" |
| `tdt_equipe` | 23 | string "1 Growth Manager + 1 Designer" |
| `meta_*` | 29 | budget, leads, leads_q, cpl, cpl_q, best_pdv, cout_global, cout_best, insights[] |
| `linkedin_*` | 30 | idem |
| `li_*` | 31 | duree, budget_media, leads, cpl, mql, cout_mql, best_pdv |
| `fb_*` | 32 | idem |

### E. BILAN (LLM synthetise les audits)
| Variable | Slide | Type |
|----------|-------|------|
| `dc_positifs[]` | 34 | array of strings |
| `dc_negatifs[]` | 34 | array of strings |
| `dg_positifs[]` | 34 | array of strings |
| `dg_negatifs[]` | 34 | array of strings |
| `limites[]` | 34 | array of strings |

### F. PLAN STRATEGIQUE (LLM construit le plan)
| Variable | Slide | Type |
|----------|-------|------|
| `phases[]` | 42 | array x3 [{titre, periode, objectif, priorites[], livrables}] |

### G. EQUIPE (donnees Bulldozer)
| Variable | Slide | Type |
|----------|-------|------|
| `bp_name` | 43 | string |
| `bp_photo` | 43 | URL |
| `hog_photo` | 43 | URL |
| `members[]` | 43 | array [{role, subtitle, photo}] |

### H. PRICING (donnees devis — saisie manuelle)
| Variable | Slide | Type |
|----------|-------|------|
| `offer_title` | 45 | string "Growth Plan — 3 mois" |
| `roles[]` | 45 | array [{name, setup, monthly, subtotal}] |
| `total` | 45 | string montant HT |
| `ventilation.*` | 46 | mois_labels[], phases[].items[], totaux |
| `projections.*` | 47 | 3 scenarios x {cout_mql, conversion, panier, duree, budget, mql, clients, arr} |

### I. SCREENSHOTS (captures automatiques)
| Variable | Slides | Source |
|----------|--------|--------|
| `screenshot_client` | 9 | Headless Chrome → site client |
| `screenshot_client_cro` | 16, 17 | Headless Chrome → pages client |
| `graph_tdt_meta` | 29 | A produire par client |
| `graph_tdt_linkedin` | 30 | A produire par client |
| `linkedin_profiles` | 29, 30 | Screenshots profils LinkedIn |

---

## Slides 100% DETERMINISTES (ne changent JAMAIS)

```
S03, S04, S05, S06, S07, S08, S11, S18, S22, S24, S25, S26, S27, S28,
S33, S35, S36, S37, S38, S39, S40, S41, S44, S48, S49, S50
```
= **26 slides figees** sur 52 (50%)

## Slides PROBABILISTES (LLM + donnees)

```
S01, S02, S09, S10, S12, S13, S14, S15, S16, S17, S19, S20, S21, S23,
S29, S30, S31, S32, S34, S42, S43, S45, S46, S47, S51, S52
```
= **26 slides variables** sur 52 (50%)

---

## Workflow de generation

```
1. INPUT: brief client (PDF, notes, call)
     ↓
2. DETERMINISTE: copier template.html → <slug>.html
     ↓
3. SIMPLE REPLACE: XXX → client_name (32 occurrences)
     ↓
4. SCREENSHOTS: headless Chrome → assets/clients/<slug>/
     ↓
5. PROBABILISTE (LLM): remplir les variables B, C, D, E, F
     ↓
6. PRICING (manuel): saisir les montants G, H
     ↓
7. EQUIPE (manuel): photos + noms de l'equipe assignee
     ↓
8. OUTPUT: <slug>.html pret a presenter
```
