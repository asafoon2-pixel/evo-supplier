import { Award } from 'lucide-react'

export default function Insights() {
  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>תובנות</h1>
        <p className="text-evo-muted text-sm mt-1">הביצועים שלך במבט על</p>
      </div>

      {/* Empty state */}
      <div className="px-6 mt-10 flex flex-col items-center text-center">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-evo-text text-base font-semibold mb-2">עדיין אין נתונים</p>
        <p className="text-evo-muted text-sm leading-relaxed max-w-xs">
          נתוני הביצועים שלך יופיעו כאן לאחר שתתחיל לקבל לידים ואירועים
        </p>
      </div>

      {/* EVO ranking note */}
      <div className="px-6 mt-10">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">דירוג EVO</p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed">
            ספקים עם פרופיל מלא ומוכן מקבלים התאמות איכותיות יותר. השלם את הפרופיל שלך כדי להתחיל לקבל לידים.
          </p>
        </div>
      </div>
    </div>
  )
}
