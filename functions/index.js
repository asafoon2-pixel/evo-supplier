const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineString }      = require('firebase-functions/params')
const { initializeApp }     = require('firebase-admin/app')
const { getAuth }           = require('firebase-admin/auth')
const { getFirestore }      = require('firebase-admin/firestore')
const nodemailer            = require('nodemailer')

initializeApp()

const GMAIL_USER = defineString('GMAIL_USER')
const GMAIL_PASS = defineString('GMAIL_PASS')

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER.value(),
      pass: GMAIL_PASS.value(),
    },
  })
}

// ── Send email to supplier when a new lead arrives ──────────────────────────
exports.onLeadCreated = onDocumentCreated('leads/{leadId}', async (event) => {
  const lead = event.data.data()
  if (!lead) return

  const vendorEmail = lead.vendor_email
  if (!vendorEmail) {
    // Fallback: look up vendor doc for email
    try {
      const vendorDoc = await getFirestore().collection('vendors').doc(lead.vendor_id).get()
      if (!vendorDoc.exists) return
      const vendorData = vendorDoc.data()
      const email = vendorData.email || vendorData.contact_email
      if (!email) { console.log('No vendor email found for', lead.vendor_id); return }
      lead.vendor_email = email
    } catch (err) {
      console.error('Failed to fetch vendor email:', err)
      return
    }
  }

  const eventTypeMap = {
    birthday: 'יום הולדת', wedding: 'חתונה', corporate: 'אירוע חברה',
    social: 'מסיבה', private: 'אירוע פרטי', other: 'אירוע',
  }
  const eventType = eventTypeMap[lead.eventType] || lead.eventType || 'אירוע'
  const guestCount = lead.guestCount || 'לא צוין'
  const date = lead.date || 'לא צוין'
  const budget = lead.budgetRange || 'לא צוין'

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; direction: rtl; }
  .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #6B5FE4; padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 100px; padding: 4px 14px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
  .body { padding: 32px; }
  .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .row:last-child { border-bottom: none; }
  .label { color: #888; font-size: 13px; }
  .value { color: #1a1a1a; font-size: 14px; font-weight: 600; }
  .cta { margin: 24px 0 0; text-align: center; }
  .cta a { background: #6B5FE4; color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 100px; font-size: 15px; font-weight: 700; display: inline-block; }
  .footer { padding: 20px 32px; background: #fafafa; text-align: center; color: #bbb; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <div class="badge">ליד חדש</div>
    <h1>🎉 בקשה חדשה!</h1>
    <p>לקוח מעוניין בשירותיך דרך EVO</p>
  </div>
  <div class="body">
    <p style="color:#444;font-size:15px;margin:0 0 20px">שלום <strong>${lead.vendor_name}</strong>,<br>קיבלת בקשה חדשה מ-EVO. הנה הפרטים:</p>
    <div class="row"><span class="label">לקוח</span><span class="value">${lead.client_name || 'לא צוין'}</span></div>
    <div class="row"><span class="label">סוג אירוע</span><span class="value">${eventType}</span></div>
    <div class="row"><span class="label">תאריך</span><span class="value">${date}</span></div>
    <div class="row"><span class="label">אורחים</span><span class="value">${guestCount}</span></div>
    <div class="row"><span class="label">תקציב</span><span class="value">${budget}</span></div>
    <div class="cta">
      <a href="https://evo-supplier.web.app">פתח את לוח הספקים →</a>
    </div>
  </div>
  <div class="footer">EVO Events · כל הזכויות שמורות</div>
</div>
</body>
</html>
  `

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"EVO Events" <${GMAIL_USER.value()}>`,
      to: lead.vendor_email,
      subject: `🎉 בקשה חדשה מ-${lead.client_name || 'לקוח'} — EVO`,
      html,
    })
    console.log(`Email sent to ${lead.vendor_email} for lead ${event.params.leadId}`)
  } catch (err) {
    console.error('Failed to send lead email:', err)
  }
})

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
