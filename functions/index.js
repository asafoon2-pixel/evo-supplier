const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp }     = require('firebase-admin/app')
const { getAuth }           = require('firebase-admin/auth')

initializeApp()

// When a vendor doc is created → set role: 'vendor'
exports.onVendorCreated = onDocumentCreated('vendors/{uid}', async (event) => {
  const uid = event.params.uid
  try {
    await getAuth().setCustomUserClaims(uid, { role: 'vendor' })
    console.log(`Set role=vendor for ${uid}`)
  } catch (err) {
    console.error('onVendorCreated error:', err)
  }
})

// When a client user doc is created → set role: 'client'
exports.onClientCreated = onDocumentCreated('users/{uid}', async (event) => {
  const uid = event.params.uid
  try {
    await getAuth().setCustomUserClaims(uid, { role: 'client' })
    console.log(`Set role=client for ${uid}`)
  } catch (err) {
    console.error('onClientCreated error:', err)
  }
})
