# SOP : Website Update

## Objectif

Modifier le contenu de caroline-finance.com de maniere securisee — edition locale, deploy rsync, verification post-deploy.

## Prerequis

- Fichiers source locaux : `caro-services/website/`
- Acces SSH : `ssh caro-root` (serveur 187.124.44.10)
- Navigateur pour verification post-deploy

## Architecture

```
Serveur caroline-finance (187.124.44.10)
├── Traefik (reverse proxy, SSL Let's Encrypt, www → non-www)
└── Container nginx:alpine "caroline-finance"
    └── /var/www/caroline-finance/ (volume monte read-only)
```

**IMPORTANT** : Le fichier `vps-root:/var/www/caro/index.html` (VPS Hostinger 148.230.117.35) est une ancienne copie NON servie par caroline-finance.com. Ne PAS deployer dessus.

## Deux systemes CSS

| Fichier | CSS |
|---------|-----|
| Homepage (`index.html`) | CSS inline (~1300 lignes), classes `header-*`, `hero-*`, `section`, `reveal` |
| Sous-pages (`*/index.html`) | CSS partage `css/style.css`, classes `hd`, `sc`, `rv`, `w` |

**Ne jamais fusionner les deux systemes** — 3 tentatives ont casse la page.

## Pipeline — Modification de contenu

### Etape 1 — Identifier la modification

1. Quelle page est concernee ?
   - Homepage → editer `website/index.html` (CSS inline)
   - Sous-page → editer `website/{page}/index.html` (CSS partage)
   - Blog → editer `website/blog/{article}/index.html`
   - CSS partage → editer `website/css/style.css`
2. Quel type de modification ?
   - Texte → modifier le contenu entre les balises (respecter data-fr/data-en)
   - Image → ajouter dans `website/` et mettre a jour le src
   - Nouvelle page → creer le dossier + `index.html` + mettre a jour sitemap

### Etape 2 — Edition locale

1. Ouvrir le fichier concerne dans l'editeur
2. Effectuer la modification
3. **Si modification bilingue** : mettre a jour les deux attributs `data-fr` ET `data-en`
4. **Si modification du CSS partage** :
   - Tester localement
   - Mettre a jour le cache-busting :
     ```bash
     # Generer un nouveau timestamp
     BUST=$(date +%s)
     # Mettre a jour toutes les references dans les sous-pages
     find website -name 'index.html' -exec sed -i '' "s|/css/style.css?v=[0-9]*|/css/style.css?v=${BUST}|g" {} \;
     ```
5. **Si nouvelle page** :
   - Ajouter l'URL dans `website/sitemap.xml` avec la date du jour
   - Ajouter le lien dans la navigation si pertinent

### Etape 3 — Verification locale

1. Ouvrir le fichier modifie dans un navigateur (localhost)
2. Verifier :
   - [ ] Le contenu s'affiche correctement en FR
   - [ ] Le contenu s'affiche correctement en EN (toggle langue)
   - [ ] Pas de layout casse (responsive mobile/desktop)
   - [ ] Dark mode fonctionne
   - [ ] Liens internes fonctionnent

### Etape 4 — Deploy

```bash
# Deployer les fichiers
rsync -avz --exclude='.DS_Store' website/ caro-root:/var/www/caroline-finance/

# Fixer les permissions
ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"
```

### Etape 5 — Verification post-deploy

1. Ouvrir https://caroline-finance.com dans le navigateur
2. Hard refresh (Cmd+Shift+R) pour vider le cache
3. Verifier la page modifiee :
   - [ ] Contenu correct en FR et EN
   - [ ] Pas de page blanche ou d'erreur
   - [ ] CSS charge correctement (pas de page sans style)
   - [ ] Formulaire de contact fonctionne
   - [ ] WhatsApp flottant fonctionne
4. Tester sur mobile (ou DevTools responsive)

## Methode alternative — CCServices WhatsApp (desactivee)

Le workflow LK-HQ Inbox (ID `K8hViG1lVtQqfJw6`) contenait une branche CCServices permettant a Caroline de modifier le site via WhatsApp + Claude Haiku.

**Statut : desactive** (node `CCS Handler` disabled)

**Raison** : Claude Haiku avait tronque le fichier HTML, causant une page blanche. Le systeme utilisait un approach find/replace via JSON mais restait fragile sur les gros fichiers HTML (>50KB).

**Pour reactiver** :
1. Resoudre le probleme de troncation (limiter la taille, utiliser des diffs plus granulaires)
2. Augmenter la validation HTML (taille minimum 30000 chars, DOCTYPE, `</html>`, `</script>`)
3. Passer les guardrails de `log` a `enforce` (voir lk-hq/tools/guardrails/config/policies.yaml)
4. Activer le node `CCS Handler` dans le workflow

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Page blanche apres deploy | Verifier le HTML (`curl -s https://caroline-finance.com/ | head -5`). Si vide ou tronque → rollback : `ssh caro-root "cp /var/www/caroline-finance/backups/index.html.bak /var/www/caroline-finance/index.html"` |
| CSS non charge | Verifier le cache-busting (query string ?v=). Hard refresh dans le navigateur |
| Permission denied sur le serveur | `ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"` |
| Rsync echoue (connexion refusee) | Verifier que `caro-root` est accessible : `ssh caro-root "echo ok"` |
| Modification accidentelle du CSS inline homepage | Restaurer depuis git : `git checkout website/index.html` |

## Checklist rapide

- [ ] Modification identifiee (page, type, contenu)
- [ ] Edition locale effectuee (FR + EN si bilingue)
- [ ] Verification locale OK (FR, EN, responsive, dark mode)
- [ ] Deploy rsync effectue
- [ ] Permissions fixees
- [ ] Verification post-deploy OK
- [ ] Sitemap mis a jour (si nouvelle page)
