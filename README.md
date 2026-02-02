# SaaS de Gestion de Recherche d'Emploi

Application web complète pour gérer votre recherche d'emploi avec suivi des candidatures, gestion des entreprises, documents, calendrier et analytics.

## Fonctionnalités

- ✅ Authentification sécurisée (inscription/connexion)
- ✅ Gestion des candidatures (CRUD complet)
- ✅ Gestion des entreprises et contacts
- ✅ Upload et gestion de documents (CV, lettres de motivation)
- ✅ Calendrier pour les entretiens et deadlines
- ✅ Analytics et statistiques de votre recherche

## Technologies

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données
- **NextAuth.js v5** - Authentification
- **Tailwind CSS** - Styling
- **Vercel Blob** - Stockage de fichiers
- **Recharts** - Graphiques
- **React Big Calendar** - Calendrier

## Prérequis

- Node.js 18+ installé
- Compte PostgreSQL (Supabase, Vercel Postgres, ou local)
- Compte Vercel (optionnel, pour le stockage de fichiers)

## Installation

1. Cloner le projet et installer les dépendances :

```bash
npm install
```

2. Configurer les variables d'environnement :

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

Variables requises :
- `DATABASE_URL` - URL de connexion PostgreSQL
- `AUTH_SECRET` - Clé secrète pour NextAuth (générez-en une avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL de votre application (http://localhost:3000 en développement)

Variables optionnelles :
- `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob pour le stockage de fichiers

3. Configurer la base de données :

```bash
# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

4. Lancer l'application :

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
job-search-saas/
├── app/                    # Pages et routes Next.js
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Pages du dashboard (protégées)
│   └── api/               # API routes
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires (Prisma, auth, etc.)
├── prisma/                # Schéma Prisma
└── types/                 # Types TypeScript
```

## Déploiement

### Sur Vercel

1. Poussez votre code sur GitHub
2. Importez le projet sur Vercel
3. Configurez les variables d'environnement dans les paramètres Vercel
4. Vercel détectera automatiquement Next.js et déploiera l'application

### Base de données

Pour la production, utilisez :
- **Vercel Postgres** (intégré avec Vercel)
- **Supabase** (gratuit jusqu'à 500MB)
- **Neon** (gratuit avec limites)

## Utilisation

1. Créez un compte sur la page d'inscription
2. Connectez-vous
3. Commencez par créer une entreprise
4. Créez votre première candidature
5. Uploadez vos documents (CV, lettres de motivation)
6. Consultez le calendrier pour vos entretiens
7. Analysez vos statistiques dans la section Analytics

## Notes importantes

- Les mots de passe sont hashés avec bcrypt
- Toutes les routes du dashboard sont protégées
- Les données sont isolées par utilisateur
- Le stockage de fichiers utilise Vercel Blob (configurable)

## Support

Pour toute question ou problème, consultez la documentation de :
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
