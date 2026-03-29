import { Home, CalendarDays, Briefcase, Grid, User } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const TABS = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'events',   label: 'Events',   Icon: Briefcase },
  { id: 'catalog',  label: 'Catalog',  Icon: Grid },
  { id: 'profile',  label: 'Profile',  Icon: User },
]

export default function TabBar() {
  const { activeTab, goTab, newLeadCount } = useSupplier()

  return (
    <div className="w-full bg-white border-t border-evo-border">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          const badge  = id === 'events' && newLeadCount > 0
          return (
            <button
              key={id}
              onClick={() => goTab(id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-evo-accent' : 'text-evo-muted'}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                {badge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-evo-red rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {newLeadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-colors ${active ? 'text-evo-accent' : 'text-evo-muted'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
