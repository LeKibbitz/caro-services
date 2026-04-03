# SOP : Deploy & Maintenance

## Objectif

Gerer le deploiement et la maintenance de l'infrastructure caroline-finance.com — site statique + CRM sur VPS dedie.

## Prerequis

- Acces SSH : `ssh caro-root` / `ssh caro-user` (serveur 187.124.44.10)
- Docker et Docker Compose installes sur le VPS
- Fichiers source locaux : `caro-services/website/` (site) + `caro-services/crm/` (CRM)

## Architecture serveur

```
VPS Caro (187.124.44.10)
├── Traefik (reverse proxy)
│   ├── SSL Let's Encrypt (auto-renouvellement)
│   ├── caroline-finance.com → nginx:alpine
│   ├── crm.caroline-finance.com → CRM Next.js
│   └── Redirect www → non-www (308)
│
├── Container nginx:alpine "caroline-finance"
│   └── /var/www/caroline-finance/ (site statique, volume RO)
│
├── Container CRM (Next.js)
│   └── Port interne → Traefik
│
└── Container PostgreSQL 16 (base CRM)
    └── Volume persistant
```

**SSH aliases** (configures dans `~/.ssh/config` sur Kibbitz-Mac) :
- `caro-root` → root@187.124.44.10
- `caro-user` → user@187.124.44.10

## Deploy — Site statique

```bash
# 1. Deployer les fichiers
rsync -avz --exclude='.DS_Store' website/ caro-root:/var/www/caroline-finance/

# 2. Fixer les permissions
ssh caro-root "chown -R www-data:www-data /var/www/caroline-finance/"

# 3. Verifier
curl -s -o /dev/null -w "%{http_code}" https://caroline-finance.com
# Attendu : 200
```

**Si modification CSS** — mettre a jour le cache-busting :
```bash
BUST=$(date +%s)
ssh caro-root "find /var/www/caroline-finance -name 'index.html' \
  -exec sed -i 's|/css/style.css?v=[0-9]*|/css/style.css?v=${BUST}|g' {} \;"
```

## Deploy — CRM

```bash
# 1. Depuis le dossier crm/
cd crm/

# 2. Syncer les fichiers
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.env' \
  . caro-root:~/crm-caroline/

# 3. Build et deploy sur le VPS
ssh caro-root "cd ~/crm-caroline && docker compose up -d --build"

# 4. Verifier
curl -s -o /dev/null -w "%{http_code}" https://crm.caroline-finance.com
# Attendu : 200
```

**Migrations Prisma** (si schema modifie) :
```bash
ssh caro-root "cd ~/crm-caroline && docker compose exec crm npx prisma migrate deploy"
```

## Maintenance recurrente

### Quotidienne (automatique)

- SSL : Traefik renouvelle automatiquement les certificats Let's Encrypt
- Conteneurs : restart policy `unless-stopped` → redemarrent apres un crash

### Hebdomadaire (5 min)

1. Verifier que les services sont up :
   ```bash
   ssh caro-root "docker ps --format 'table {{.Names}}\t{{.Status}}'"
   ```
2. Verifier les logs d'erreur :
   ```bash
   ssh caro-root "docker logs --since 7d caroline-finance 2>&1 | grep -i error | tail -20"
   ssh caro-root "docker logs --since 7d crm 2>&1 | grep -i error | tail -20"
   ```

### Mensuelle (15 min)

1. **Espace disque** :
   ```bash
   ssh caro-root "df -h /"
   ```
   Si > 80% → nettoyer les images Docker non utilisees : `docker system prune -f`

2. **Mises a jour systeme** :
   ```bash
   ssh caro-root "apt update && apt list --upgradable"
   ```
   Appliquer les mises a jour de securite : `apt upgrade -y`

3. **Backup base de donnees CRM** :
   ```bash
   ssh caro-root "docker compose exec -T postgres pg_dump -U postgres crm > ~/backups/crm-$(date +%Y%m%d).sql"
   ```

4. **Backup site** :
   ```bash
   ssh caro-root "cp -r /var/www/caroline-finance/ ~/backups/website-$(date +%Y%m%d)/"
   ```

## Monitoring

### Checks rapides

```bash
# Site
curl -s -o /dev/null -w "%{http_code}" https://caroline-finance.com
# CRM
curl -s -o /dev/null -w "%{http_code}" https://crm.caroline-finance.com
# SSL
echo | openssl s_client -servername caroline-finance.com -connect 187.124.44.10:443 2>/dev/null | openssl x509 -noout -dates
```

### Depuis Voxia

Le dashboard Voxia (localhost:3009) peut monitorer le site caroline-finance via la route `/api/services` (caro-writer sur le VPS Hostinger, port 3102). Note : cela monitore l'ancien caro-writer, pas le site de production actuel.

## Gestion d'erreurs

| Probleme | Action |
|----------|--------|
| Site down (502/503) | `ssh caro-root "docker ps"` → verifier nginx. Si arrete : `docker compose up -d caroline-finance` |
| CRM down | `ssh caro-root "docker compose logs crm --tail 50"` → diagnostiquer. Souvent : OOM → augmenter la memoire |
| SSL expire | Verifier Traefik : `docker compose logs traefik --tail 20`. Forcer le renouvellement si necessaire |
| Espace disque plein | `docker system prune -f` + supprimer les vieux backups |
| Base de donnees CRM corrompue | Restaurer le dernier backup : `cat ~/backups/crm-YYYYMMDD.sql \| docker compose exec -T postgres psql -U postgres crm` |
| SSH inaccessible | Verifier via le panel hosting (console web). Verifier le firewall : `ufw status` |
| Rsync echoue | Verifier la connexion SSH : `ssh caro-root "echo ok"`. Verifier l'espace disque distant |

## Checklist rapide

- [ ] Services up (docker ps)
- [ ] Site accessible (HTTP 200)
- [ ] CRM accessible (HTTP 200)
- [ ] SSL valide (pas expire)
- [ ] Espace disque < 80%
- [ ] Backup BDD recent (< 1 semaine)
- [ ] Logs sans erreurs critiques
