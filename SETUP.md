# Guide de Configuration

## Étapes de configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/job_search?schema=public"
AUTH_SECRET="votre-clé-secrète-ici"
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="votre-token-vercel-blob" # Optionnel
```

**Générer AUTH_SECRET :**
```bash
node scripts/generate-secret.js
# ou
openssl rand -base64 32
```

### 2. Base de données

#### Option A : Supabase (Recommandé - Gratuit)

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Copiez la connection string depuis Settings > Database
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

#### Option B : Vercel Postgres

1. Dans votre projet Vercel, allez dans Storage
2. Créez une base de données Postgres
3. Copiez la connection string

#### Option C : Base de données locale

```bash
# Avec Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=job_search -p 5432:5432 -d postgres
```

### 3. Initialiser Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio
npx prisma studio
```

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement dans les paramètres du projet
4. Vercel détectera automatiquement Next.js et déploiera

**Variables d'environnement à configurer sur Vercel :**
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (votre domaine Vercel)
- `BLOB_READ_WRITE_TOKEN` (optionnel)

## Fonctionnalités implémentées

✅ Authentification (inscription/connexion)
✅ Dashboard avec statistiques
✅ Gestion complète des candidatures (CRUD)
✅ Gestion des entreprises et contacts
✅ Upload et gestion de documents
✅ Calendrier pour entretiens et deadlines
✅ Analytics avec graphiques

## Structure de l'application

- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/dashboard` - Vue d'ensemble
- `/applications` - Liste des candidatures
- `/applications/new` - Créer une candidature
- `/applications/[id]` - Détails d'une candidature
- `/companies` - Liste des entreprises
- `/companies/new` - Créer une entreprise
- `/companies/[id]` - Détails d'une entreprise
- `/documents` - Gestion des documents
- `/calendar` - Calendrier
- `/analytics` - Statistiques

## Notes importantes

- Tous les mots de passe sont hashés avec bcrypt
- Les routes du dashboard sont protégées par authentification
- Les données sont isolées par utilisateur
- Le stockage de fichiers utilise Vercel Blob (configurable)
