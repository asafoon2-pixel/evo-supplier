import { Home, Inbox, Briefcase, Grid, User } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const TABS = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'leads',   label: 'Leads',   Icon: Inbox },
  { id: 'events',  label: 'Events',  Icon: Briefcase },
  { id: 'catalog', label: 'Catalog', Icon: Grid },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function TabBar() {
  const { activeTab, goTab, newLeadCount } = useSupplier()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-evo-black/95 backdrop-blur-md border-t border-evo-border">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          const badge  = id === 'leads' && newLeadCount > 0
          return (
            <button
              key={id}
              onClick={() => goTab(id)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all active:scale-95"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-evo-accent' : 'text-evo-dim'}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                {badge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {newLeadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${active ? 'text-evo-accent' : 'text-evo-dim'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
