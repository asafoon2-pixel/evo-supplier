/**
 * Database Agent — מסדר ומשדרג את כל הנתונים ב-Firestore
 *
 * מה הסוכן עושה:
 * 1. קורא כל הספקים ב-vendors collection
 * 2. לכל ספק — קורא את החבילות שלו (packages sub-collection)
 * 3. מחשב ומעדכן _minPrice ו-_maxPrice על מסמך הספק
 * 4. מתקן badge על כל חבילה שיש לה is_popular=true אך אין badge
 * 5. מחזיר דוח של מה שתוקן
 */

import {
  collection, getDocs, doc, updateDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

export async function runDbAgent(onProgress) {
  const report = { vendors: 0, packages: 0, priceUpdates: 0, badgeFixes: 0, errors: [] }

  try {
    onProgress?.('🔍 קורא רשימת ספקים...')
    const vendorSnap = await getDocs(collection(db, 'vendors'))
    report.vendors = vendorSnap.size
    onProgress?.(`📋 נמצאו ${vendorSnap.size} ספקים`)

    for (const vendorDoc of vendorSnap.docs) {
      const uid = vendorDoc.id
      const vendorData = vendorDoc.data()

      try {
        // Load packages
        const pkgSnap = await getDocs(collection(db, 'vendors', uid, 'packages'))
        const packages = pkgSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        report.packages += packages.length

        // Calculate price aggregates
        const activePrices = packages
          .filter(p => p.is_available !== false && parseFloat(p.price) > 0)
          .map(p => parseFloat(p.price))

        const vendorUpdates = {}

        if (activePrices.length > 0) {
          const minPrice = Math.min(...activePrices)
          const maxPrice = Math.max(...activePrices)
          const currentMin = vendorData._minPrice
          const currentMax = vendorData._maxPrice

          if (currentMin !== minPrice || currentMax !== maxPrice) {
            vendorUpdates._minPrice = minPrice
            vendorUpdates._maxPrice = maxPrice
            report.priceUpdates++
            onProgress?.(`💰 ${vendorData.business_name || uid}: מחיר ₪${minPrice}–₪${maxPrice}`)
          }
        } else if (vendorData._minPrice || vendorData._maxPrice) {
          vendorUpdates._minPrice = null
          vendorUpdates._maxPrice = null
          report.priceUpdates++
        }

        if (Object.keys(vendorUpdates).length > 0) {
          await updateDoc(doc(db, 'vendors', uid), vendorUpdates)
        }

        // Fix badge on packages
        const batch = writeBatch(db)
        let batchHasWrites = false

        for (const pkg of packages) {
          const pkgUpdates = {}

          // Add badge field if missing
          if (pkg.badge === undefined) {
            pkgUpdates.badge = pkg.is_popular ? 'most_popular' : null
            report.badgeFixes++
          }

          // Add is_available if missing
          if (pkg.is_available === undefined) {
            pkgUpdates.is_available = true
          }

          if (Object.keys(pkgUpdates).length > 0) {
            batch.update(doc(db, 'vendors', uid, 'packages', pkg.id), pkgUpdates)
            batchHasWrites = true
          }
        }

        if (batchHasWrites) {
          await batch.commit()
        }

      } catch (err) {
        const msg = `שגיאה בספק ${uid}: ${err.message}`
        report.errors.push(msg)
        onProgress?.(`❌ ${msg}`)
      }
    }

    onProgress?.('✅ הסוכן סיים!')
    return report

  } catch (err) {
    report.errors.push(`שגיאה כללית: ${err.message}`)
    onProgress?.(`❌ שגיאה: ${err.message}`)
    return report
  }
}
