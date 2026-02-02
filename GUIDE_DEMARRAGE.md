# Guide de Démarrage Pas à Pas

Ce guide vous accompagne étape par étape pour configurer et lancer votre application.

## Étape 1 : Configurer la base de données PostgreSQL (Supabase - GRATUIT)

### Option A : Utiliser Supabase (Recommandé - 5 minutes)

1. **Créer un compte Supabase**
   - Allez sur https://supabase.com
   - Cliquez sur "Start your project"
   - Connectez-vous avec GitHub (plus rapide) ou créez un compte

2. **Créer un nouveau projet**
   - Cliquez sur "New Project"
   - Choisissez une organisation (ou créez-en une)
   - Remplissez :
     - **Name** : `job-search-saas` (ou le nom que vous voulez)
     - **Database Password** : Créez un mot de passe fort (notez-le quelque part !)
     - **Region** : Choisissez la région la plus proche (ex: West US)
   - Cliquez sur "Create new project"
   - Attendez 2-3 minutes que le projet soit créé

3. **Récupérer la connection string**
   - Dans votre projet Supabase, allez dans **Settings** (icône d'engrenage en bas à gauche)
   - Cliquez sur **Database** dans le menu de gauche
   - Descendez jusqu'à la section **Connection string**
   - Cliquez sur l'onglet **URI**
   - Vous verrez quelque chose comme :
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - **Copiez cette chaîne** (remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé)

### Option B : Base de données locale (si vous avez Docker)

Si vous préférez utiliser une base de données locale :

```bash
docker run --name postgres-jobsearch \
  -e POSTGRES_PASSWORD=monmotdepasse \
  -e POSTGRES_DB=job_search \
  -p 5432:5432 \
  -d postgres
```

Puis utilisez cette connection string :
```
postgresql://postgres:monmotdepasse@localhost:5432/job_search
```

---

## Étape 2 : Créer le fichier .env

1. **Ouvrez le terminal** dans le dossier du projet (`/Users/user/job-search-saas`)

2. **Créez le fichier .env** :
   ```bash
   cp .env.example .env
   ```

3. **Ouvrez le fichier .env** avec un éditeur de texte :
   ```bash
   # Sur Mac, vous pouvez utiliser :
   open -a TextEdit .env
   # Ou utilisez votre éditeur préféré (VS Code, etc.)
   ```

4. **Remplissez le fichier .env** avec vos valeurs :

   ```env
   # Remplacez cette ligne par votre connection string Supabase
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres"
   
   # Générez une clé secrète (voir ci-dessous)
   AUTH_SECRET="votre-clé-secrète-ici"
   
   # Pour le développement local
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optionnel - pour le stockage de fichiers (on peut l'ajouter plus tard)
   # BLOB_READ_WRITE_TOKEN=""
   ```

5. **Générer AUTH_SECRET** :
   
   Dans le terminal, exécutez :
   ```bash
   node scripts/generate-secret.js
   ```
   
   Copiez la clé générée et collez-la dans le fichier .env à la place de `votre-clé-secrète-ici`

---

## Étape 3 : Créer les tables dans la base de données

1. **Générer le client Prisma** :
   ```bash
   npx prisma generate
   ```

2. **Créer les tables** :
   ```bash
   npx prisma migrate dev --name init
   ```
   
   Cette commande va :
   - Créer un dossier `prisma/migrations` avec les migrations
   - Appliquer les migrations à votre base de données
   - Créer toutes les tables nécessaires
   
   Si tout se passe bien, vous verrez :
   ```
   ✅ The migration has been applied
   ```

3. **(Optionnel) Vérifier les tables** :
   ```bash
   npx prisma studio
   ```
   
   Cela ouvre une interface web pour voir vos données. Fermez-la avec Ctrl+C quand vous avez fini.

---

## Étape 4 : Lancer l'application

1. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Ouvrir l'application** :
   - Le terminal affichera : `- Local: http://localhost:3000`
   - Ouvrez votre navigateur et allez sur **http://localhost:3000**

3. **Créer votre premier compte** :
   - Cliquez sur "Créer un compte" ou allez sur `/register`
   - Remplissez le formulaire avec :
     - Votre nom (optionnel)
     - Votre email
     - Un mot de passe (minimum 6 caractères)
   - Cliquez sur "Créer un compte"

4. **Vous êtes connecté !** 🎉
   - Vous serez redirigé vers le dashboard
   - Commencez par créer une entreprise
   - Puis créez votre première candidature

---

## Résolution de problèmes

### Erreur : "Can't reach database server"

- Vérifiez que votre `DATABASE_URL` est correcte
- Vérifiez que vous avez remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- Vérifiez que votre projet Supabase est bien actif

### Erreur : "AUTH_SECRET is missing"

- Assurez-vous d'avoir créé le fichier `.env`
- Vérifiez que `AUTH_SECRET` est bien défini dans le fichier `.env`

### Erreur lors de `prisma migrate dev`

- Vérifiez que votre base de données est accessible
- Vérifiez que la `DATABASE_URL` est correcte
- Essayez de vous connecter à Supabase pour vérifier que le projet est actif

### Le serveur ne démarre pas

- Vérifiez que le port 3000 n'est pas déjà utilisé
- Essayez de tuer le processus : `lsof -ti:3000 | xargs kill`
- Relancez `npm run dev`

---

## Commandes utiles

```bash
# Démarrer l'application
npm run dev

# Voir les données dans la base
npx prisma studio

# Créer une nouvelle migration (si vous modifiez le schéma)
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la base de données (ATTENTION : supprime toutes les données)
npx prisma migrate reset
```

---

## Prochaines étapes

Une fois l'application lancée :

1. ✅ Créez votre compte
2. ✅ Créez votre première entreprise
3. ✅ Créez votre première candidature
4. ✅ Uploadez votre CV
5. ✅ Explorez le calendrier et les analytics

Bon courage avec votre recherche d'emploi ! 🚀
