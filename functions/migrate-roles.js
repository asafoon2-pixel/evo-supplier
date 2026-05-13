// One-time migration: set custom claims for existing users
// Run with: node functions/migrate-roles.js
const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth }             = require('firebase-admin/auth')
const { getFirestore }        = require('firebase-admin/firestore')

// Uses Application Default Credentials (gcloud auth or GOOGLE_APPLICATION_CREDENTIALS)
initializeApp({ projectId: 'evo-supplier' })

const auth = getAuth()
const db   = getFirestore()

async function run() {
  let vendorCount = 0, clientCount = 0

  // Set vendor claims
  const vendors = await db.collection('vendors').get()
  for (const doc of vendors.docs) {
    try {
      await auth.setCustomUserClaims(doc.id, { role: 'vendor' })
      console.log(`✓ vendor: ${doc.id}`)
      vendorCount++
    } catch (e) { console.error(`✗ vendor ${doc.id}:`, e.message) }
  }

  // Set client claims
  const users = await db.collection('users').get()
  for (const doc of users.docs) {
    try {
      await auth.setCustomUserClaims(doc.id, { role: 'client' })
      console.log(`✓ client: ${doc.id}`)
      clientCount++
    } catch (e) { console.error(`✗ client ${doc.id}:`, e.message) }
  }

  console.log(`\nDone: ${vendorCount} vendors, ${clientCount} clients`)
}

run().catch(console.error)
