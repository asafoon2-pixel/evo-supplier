import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { runDbAgent } from '../lib/dbAgent'

export default function DbAgent() {
  const { navigate } = useSupplier()
  const [running,  setRunning]  = useState(false)
  const [logs,     setLogs]     = useState([])
  const [report,   setReport]   = useState(null)
  const [done,     setDone]     = useState(false)

  const addLog = (msg) => setLogs(prev => [...prev, { msg, time: new Date().toLocaleTimeString('he-IL') }])

  const run = async () => {
    setRunning(true)
    setLogs([])
    setReport(null)
    setDone(false)

    const result = await runDbAgent(addLog)
    setReport(result)
    setDone(true)
    setRunning(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 bg-white border-b border-evo-border">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
            <ArrowLeft size={18} className="text-evo-text" />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold text-evo-text">Database Agent</h1>
            <p className="text-xs font-semibold text-evo-muted">מסדר ומשדרג את כל הנתונים</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-4 pb-32">

        {/* Info card */}
        <div className="bg-white rounded-[18px] border-[1.5px] border-evo-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-evo-accent" />
            <p className="text-sm font-bold text-evo-text">מה הסוכן עושה?</p>
          </div>
          <ul className="text-xs text-evo-muted font-medium space-y-1 leading-relaxed">
            <li>• מחשב ומעדכן טווח מחירים (_minPrice/_maxPrice) לכל ספק</li>
            <li>• מתקן שדה badge על חבילות (is_popular → most_popular)</li>
            <li>• מוסיף is_available = true לחבילות חסרות</li>
            <li>• מחזיר דוח מפורט</li>
          </ul>
        </div>

        {/* Run button */}
        {!running && !done && (
          <motion.button
            onClick={run}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-[16px] text-white text-base font-extrabold flex items-center justify-center gap-2"
            style={{ background: '#2D1B8A', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}
          >
            <Zap size={16} />
            הרץ את הסוכן
          </motion.button>
        )}

        {running && (
          <div className="flex items-center justify-center gap-2 py-3">
            <RefreshCw size={16} className="text-evo-purple animate-spin" />
            <p className="text-sm font-semibold text-evo-muted">הסוכן רץ...</p>
          </div>
        )}

        {/* Logs */}
        <AnimatePresence>
          {logs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-black rounded-[16px] p-4 space-y-1 max-h-64 overflow-y-auto"
            >
              {logs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="text-[10px] text-gray-500 font-mono">{log.time} </span>
                  <span className="text-[12px] text-green-300 font-mono">{log.msg}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report */}
        <AnimatePresence>
          {done && report && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[18px] border-[1.5px] border-evo-green p-4 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-evo-green" />
                <p className="text-sm font-bold text-evo-text">הסוכן סיים!</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ספקים נסרקו', value: report.vendors },
                  { label: 'חבילות נסרקו', value: report.packages },
                  { label: 'מחירים עודכנו', value: report.priceUpdates },
                  { label: 'Badge תוקנו', value: report.badgeFixes },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-evo-elevated rounded-xl px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-evo-purple">{value}</p>
                    <p className="text-[10px] text-evo-muted font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {report.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertCircle size={12} className="text-red-500" />
                    <p className="text-xs font-bold text-red-500">{report.errors.length} שגיאות</p>
                  </div>
                  {report.errors.map((e, i) => (
                    <p key={i} className="text-[11px] text-red-400">{e}</p>
                  ))}
                </div>
              )}

              <button
                onClick={run}
                className="w-full py-3 rounded-xl border-[1.5px] border-evo-purple-mid text-evo-purple text-sm font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={13} /> הרץ שוב
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
