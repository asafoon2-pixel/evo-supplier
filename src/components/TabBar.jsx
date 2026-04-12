import { useSupplier } from '../context/SupplierContext'
import { IconHome, IconCalendar, IconEvents, IconCatalog, IconProfile } from './Icons'

const TABS = [
  { id: 'home',     labelHe: 'בית',      labelEn: 'Home',     Icon: IconHome },
  { id: 'calendar', labelHe: 'לוח שנה',  labelEn: 'Calendar', Icon: IconCalendar },
  { id: 'events',   labelHe: 'אירועים',  labelEn: 'Events',   Icon: IconEvents },
  { id: 'catalog',  labelHe: 'קטלוג',    labelEn: 'Catalog',  Icon: IconCatalog },
  { id: 'profile',  labelHe: 'פרופיל',   labelEn: 'Profile',  Icon: IconProfile },
]

export default function TabBar() {
  const { activeTab, goTab, newLeadCount } = useSupplier()

  return (
    <div
      className="w-full shrink-0"
      style={{
        background: '#FDFAF5',
        borderTop: '1.5px solid #E5DDD0',
        boxShadow: '0 -4px 20px rgba(44,32,22,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ id, labelHe, Icon }) => {
          const active = activeTab === id
          const badge  = id === 'events' && newLeadCount > 0

          return (
            <button
              key={id}
              onClick={() => goTab(id)}
              className="flex flex-col items-center gap-1 transition-all active:scale-90"
              style={{ minWidth: 52, minHeight: 52, justifyContent: 'center' }}
            >
              <div className="relative">
                {/* Active pill background */}
                {active && (
                  <div
                    className="absolute inset-0 -m-2 rounded-pill"
                    style={{ background: 'rgba(107,95,228,0.1)' }}
                  />
                )}
                <div className="relative">
                  <Icon active={active} size={22} />
                </div>
                {badge && (
                  <span
                    className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                    style={{ background: '#D4607A' }}
                  >
                    {newLeadCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-bold tracking-wide transition-colors"
                style={{ color: active ? '#6B5FE4' : '#7A6E5F' }}
              >
                {labelHe}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
