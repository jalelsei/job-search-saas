#!/usr/bin/env node

const crypto = require('crypto')
const secret = crypto.randomBytes(32).toString('base64')
console.log('AUTH_SECRET généré:')
console.log(secret)
console.log('\nCopiez cette valeur dans votre fichier .env')
