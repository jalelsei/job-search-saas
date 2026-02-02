# 🚀 COMMENCEZ ICI - Guide Simple

## Étape 1 : Créer une base de données gratuite (5 minutes)

### Option Supabase (Recommandé)

1. **Allez sur** https://supabase.com
2. **Cliquez sur** "Start your project" (en haut à droite)
3. **Connectez-vous** avec GitHub (plus rapide) ou créez un compte email
4. **Créez un nouveau projet** :
   - Cliquez sur "New Project"
   - **Name** : `job-search` (ou ce que vous voulez)
   - **Database Password** : Créez un mot de passe (⚠️ NOTEZ-LE !)
   - **Region** : Choisissez la plus proche (ex: West US)
   - Cliquez sur "Create new project"
   - ⏳ Attendez 2-3 minutes

5. **Récupérez la connection string** :
   - Dans votre projet, cliquez sur l'icône ⚙️ **Settings** (en bas à gauche)
   - Cliquez sur **Database** dans le menu
   - Descendez jusqu'à **Connection string**
   - Cliquez sur l'onglet **URI**
   - Vous verrez quelque chose comme :
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
     ```
   - **IMPORTANT** : Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé
   - **Copiez toute la ligne** (elle commence par `postgresql://`)

---

## Étape 2 : Configurer le fichier .env

1. **Ouvrez le fichier .env** dans le dossier du projet

2. **Remplacez la ligne DATABASE_URL** par celle que vous avez copiée de Supabase

3. **Générez une clé secrète** en exécutant dans le terminal :
   ```bash
   node scripts/generate-secret.js
   ```
   Copiez la clé générée et remplacez `dev-secret-key-change-in-production` dans le fichier .env

Votre fichier .env devrait ressembler à ça :
```env
DATABASE_URL="postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
AUTH_SECRET="O6tulcEX0R0fzR1ITxBtQohtxe1hqDjqp5JCi/O+K3A="
NEXTAUTH_URL="http://localhost:3000"
```

---

## Étape 3 : Créer les tables dans la base de données

Dans le terminal, exécutez ces commandes une par une :

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer les tables
npx prisma migrate dev --name init
```

Si tout va bien, vous verrez : `✅ The migration has been applied`

---

## Étape 4 : Lancer l'application

```bash
npm run dev
```

Puis ouvrez votre navigateur sur : **http://localhost:3000**

🎉 **C'est fait !** Créez votre compte et commencez à utiliser l'application.

---

## Besoin d'aide ?

- Consultez `GUIDE_DEMARRAGE.md` pour plus de détails
- Vérifiez que votre DATABASE_URL est correcte
- Assurez-vous d'avoir remplacé `[YOUR-PASSWORD]` dans la connection string
