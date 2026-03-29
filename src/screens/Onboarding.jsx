import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { supplierCategories } from '../data/index'
//dana
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js"; 
//end
const STEPS = ['category', 'info', 'pricing']

export default function Onboarding() {
  const {navigate, setSupplierName} = useSupplier()
  const [step, setStep]         = useState(0)
  const [category, setCategory] = useState('')
  const [name, setName]         = useState('')
  const [city, setCity]         = useState('')
  const [phone, setPhone]       = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const canNext = () => {
    if (step === 0) return !!category
    if (step === 1) return name.length > 2 && city.length > 1
    return true
  }

const next = async () => {
  if (step < STEPS.length - 1) {
      setStep(s => s + 1)
  } 
    else {
      try {
        await addDoc(collection(db, "suppliers"), {
          category: category,
          businessName: name,
          city: city,
          phone: phone,
          priceRange: { min: minPrice, max: maxPrice},
          status: 'pending_review', // סטטוס ראשוני שהמצאנו
          dateAdded: new Date()
        });
        
        console.log("ספק אמיתי נשמר בהצלחה!");
        setSupplierName(name);
        navigate('home');
        
      } catch (error) {
        console.error("שגיאה בשמירת הספק: ", error);
        alert("קרתה שגיאה בשמירת הנתונים. נסי שוב.");
      }
    }
  }

  return (
    <div className="w-full min-h-screen bg-evo-black flex flex-col">
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <button onClick={() => step === 0 ? navigate('entry') : setStep(s => s - 1)}
          className="text-evo-muted hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 h-1.5 ${i <= step ? 'w-6 bg-evo-accent' : 'w-1.5 bg-evo-border'}`} />
          ))}
        </div>
        <div className="w-5" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="cat" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-evo-accent mb-3">Step 1 of 3</p>
            <h2 className="text-3xl font-light text-white mb-2">What do you do?</h2>
            <p className="text-evo-muted text-sm mb-7 font-light">Select your primary category.</p>
            <div className="flex flex-wrap gap-2 overflow-y-auto flex-1">
              {supplierCategories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2.5 rounded-full border text-sm font-light transition-all ${category === cat ? 'border-evo-accent bg-evo-accent/10 text-evo-accent' : 'border-evo-border text-evo-muted hover:text-white hover:border-evo-dim'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-evo-accent mb-3">Step 2 of 3</p>
            <h2 className="text-3xl font-light text-white mb-7">About your business</h2>
            <div className="space-y-4">
              {[
                { label: 'Business name', value: name, set: setName, placeholder: 'e.g. Studio Bloom', type: 'text' },
                { label: 'City', value: city, set: setCity, placeholder: 'e.g. Tel Aviv', type: 'text' },
                { label: 'Phone', value: phone, set: setPhone, placeholder: '+972 50 000 0000', type: 'tel' },
              ].map(({ label, value, set, placeholder, type }) => (
                <div key={label}>
                  <label className="text-xs tracking-widest uppercase text-evo-muted block mb-2">{label}</label>
                  <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                    className="w-full bg-evo-card border border-evo-border rounded-xl px-4 py-3.5 text-white text-sm placeholder-evo-dim focus:outline-none focus:border-evo-accent transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="price" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-evo-accent mb-3">Step 3 of 3</p>
            <h2 className="text-3xl font-light text-white mb-2">Your pricing range</h2>
            <p className="text-evo-muted text-sm mb-7 font-light">EVO uses this to match you with the right events. You can update it anytime.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[['From', minPrice, setMinPrice, '₪5,000'], ['To', maxPrice, setMaxPrice, '₪20,000']].map(([lbl, val, setter, ph]) => (
                <div key={lbl}>
                  <label className="text-xs tracking-widest uppercase text-evo-muted block mb-2">{lbl}</label>
                  <input type="text" value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                    className="w-full bg-evo-card border border-evo-border rounded-xl px-4 py-3.5 text-white text-sm placeholder-evo-dim focus:outline-none focus:border-evo-accent transition-colors" />
                </div>
              ))}
            </div>
            <div className="bg-evo-card border border-evo-border rounded-2xl p-5">
              <p className="text-xs tracking-widest uppercase text-evo-accent mb-3">You're all set</p>
              <p className="text-evo-muted text-sm font-light leading-relaxed">
                EVO will review your application and activate your account within 24 hours. In the meantime, explore your dashboard.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-8">
        <button onClick={next} disabled={!canNext()}
          className="w-full py-4 rounded-full border border-evo-accent text-evo-accent text-sm font-medium tracking-[0.12em] uppercase hover:bg-evo-accent hover:text-black transition-all disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {step < 2 ? 'Continue' : 'Enter Dashboard'}
          {step < 2 ? <ChevronRight size={16} /> : <Check size={16} />}
        </button>
      </div>
    </div>
  )
}
