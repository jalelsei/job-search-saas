#!/bin/bash

echo "🚀 Configuration de votre application Job Search SaaS"
echo "=================================================="
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env existe déjà"
fi

echo ""
echo "📋 ÉTAPE 1 : Configuration de la base de données"
echo "--------------------------------------------------"
echo ""
echo "Vous avez 2 options :"
echo ""
echo "1️⃣  SUPABASE (Recommandé - Gratuit et simple)"
echo "   → Allez sur https://supabase.com"
echo "   → Créez un compte et un nouveau projet"
echo "   → Dans Settings > Database, copiez la Connection string (URI)"
echo "   → Remplacez [YOUR-PASSWORD] par votre mot de passe"
echo ""
echo "2️⃣  BASE DE DONNÉES LOCALE (si vous avez Docker)"
echo "   → Exécutez : docker run --name postgres-jobsearch -e POSTGRES_PASSWORD=monmotdepasse -e POSTGRES_DB=job_search -p 5432:5432 -d postgres"
echo "   → Utilisez : postgresql://postgres:monmotdepasse@localhost:5432/job_search"
echo ""
read -p "Avez-vous déjà configuré Supabase ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo ""
    echo "⏸️  Configurez d'abord Supabase, puis relancez ce script"
    echo "   Consultez GUIDE_DEMARRAGE.md pour les instructions détaillées"
    exit 0
fi

echo ""
echo "📝 Entrez votre DATABASE_URL (collez la connection string) :"
read DATABASE_URL

# Générer AUTH_SECRET si pas déjà présent
if ! grep -q "AUTH_SECRET=" .env || grep -q "your-secret-key-here" .env; then
    echo ""
    echo "🔐 Génération de AUTH_SECRET..."
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo "✅ AUTH_SECRET généré"
else
    echo "✅ AUTH_SECRET déjà configuré"
    AUTH_SECRET=$(grep "AUTH_SECRET=" .env | cut -d '=' -f2 | tr -d '"')
fi

# Mettre à jour le fichier .env
echo ""
echo "📝 Mise à jour du fichier .env..."

cat > .env << EOF
# Database
DATABASE_URL="${DATABASE_URL}"

# NextAuth
AUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (optionnel pour le stockage de fichiers)
# BLOB_READ_WRITE_TOKEN=""
EOF

echo "✅ Fichier .env mis à jour"
echo ""

echo "📋 ÉTAPE 2 : Génération du client Prisma"
echo "--------------------------------------------------"
npx prisma generate

echo ""
echo "📋 ÉTAPE 3 : Création des tables dans la base de données"
echo "--------------------------------------------------"
echo "⚠️  Cette étape va créer les tables dans votre base de données"
read -p "Continuer ? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[OoYy]$ ]]; then
    npx prisma migrate dev --name init
    echo ""
    echo "✅ Tables créées avec succès !"
else
    echo "⏸️  Étape annulée. Vous pouvez la faire plus tard avec : npx prisma migrate dev --name init"
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "--------------------------------------------------"
echo "1. Lancez l'application : npm run dev"
echo "2. Ouvrez http://localhost:3000 dans votre navigateur"
echo "3. Créez votre compte"
echo ""
echo "💡 Astuce : Consultez GUIDE_DEMARRAGE.md pour plus de détails"
