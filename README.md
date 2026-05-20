# DeckTrain

Plateforme de formation interactive pensée pour les équipes tech africaines — alternative moderne à PowerPoint, avec slides animés, exercices en temps réel, sondages live et exports PPTX/PDF.

## Stack

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Styles | Tailwind CSS v3 + dark mode |
| Animations | Framer Motion |
| Auth | NextAuth.js v4 (credentials + JWT) |
| Base de données | Prisma + SQLite (dev) / PostgreSQL (prod) |
| Éditeur | Tiptap |
| État global | Zustand |
| Graphiques | Recharts |
| Syntaxe | Shiki |
| Export | pptxgenjs + print CSS |
| Icônes | Lucide React |
| Toasts | Sonner |

## Fonctionnalités

- **7 types de slides** : titre-texte, titre-image, titre-code, liste, citation, comparaison, libre
- **10 transitions animées** par slide (Framer Motion)
- **Exercices** : QCM interactifs + ateliers pratiques avec correction
- **Sondages live** (style Mentimeter) : 5 types de questions, QR code, polling 2s
- **Agenda** : planning visuel des sessions
- **Gestion d'équipe** : 5 niveaux de rôles (SUPER/SENIOR/JUNIOR/DÉBUTANT/CUSTOM)
- **Sécurité** : rate limiting, blocage compte, logs, session timeout 30 min
- **Export PDF** (print optimisé) et **PPTX** (pptxgenjs)

## Installation

```bash
# 1. Cloner
git clone <url> decktrain && cd decktrain

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir NEXTAUTH_SECRET, DATABASE_URL, NEXTAUTH_URL

# 4. Initialiser la base de données
npx prisma db push
npx prisma db seed    # Crée l'admin par défaut

# 5. Démarrer
npm run dev
```

## Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-ici"
```

## Accès admin par défaut

```
Email    : admin@decktrain.io
Password : Admin@2026!
```

> Changer le mot de passe immédiatement après la première connexion via `/admin/settings`.

## Structure des dossiers

```
app/
  admin/          # Back-office (modules, slides, exercices, agenda, équipe, sécurité)
  api/            # Routes API (REST)
  present/        # Mode présentation plein écran
  surveys/        # Pages réponse participant
  print/          # Export PDF (print view)
  login/          # Authentification

components/
  admin/          # Composants back-office
  present/        # Viewer de slides
  surveys/        # Résultats live, word cloud
  ui/             # Design system (Button, Card, Badge, Input…)

lib/              # Utilitaires (auth, prisma, export, sécurité)
types/            # Types TypeScript partagés
prisma/           # Schéma + seed
```

## Déploiement Vercel

```bash
# Variables à créer dans Vercel Dashboard (Settings > Environment Variables)
# NEXTAUTH_SECRET  → chaîne aléatoire 32 chars
# NEXTAUTH_URL     → https://votre-domaine.vercel.app
# DATABASE_URL     → connexion PostgreSQL (ex: PlanetScale, Neon, Supabase)
```

1. Remplacer SQLite par PostgreSQL dans `prisma/schema.prisma` (`provider = "postgresql"`)
2. Pousser le schéma : `npx prisma db push`
3. Déployer : `vercel --prod`

## Routes principales

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Connexion admin |
| `/present` | Sélecteur de modules |
| `/present/[id]` | Présentation plein écran |
| `/present/survey/[code]` | Résultats sondage live |
| `/surveys/[code]` | Réponse participant |
| `/admin/overview` | Tableau de bord |
| `/admin/modules` | Gestion modules & slides |
| `/admin/surveys` | Gestion sondages |
| `/admin/team` | Gestion équipe admin |
| `/admin/security` | Logs & sécurité |
| `/print/[moduleId]` | Export PDF |

## Licence

© CHRIST J. — Tous droits réservés.  
Charte graphique DeckTrain — Police display : Cormorant Garamond · Corps : DM Sans · Code : JetBrains Mono  
Or institutionnel `#C8B89A` · Cyan interactif `#00D4FF` · Fond `#111111`
