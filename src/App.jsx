import { AnimatePresence } from 'framer-motion'
import { SupplierProvider, useSupplier } from './context/SupplierContext'
import PageTransition from './components/PageTransition'
import TabBar from './components/TabBar'

import Entry          from './screens/Entry'
import Onboarding     from './screens/Onboarding'
import Home           from './screens/Home'
import Leads          from './screens/Leads'
import LeadDetail     from './screens/LeadDetail'
import Events         from './screens/Events'
import EventDetail    from './screens/EventDetail'
import Catalog        from './screens/Catalog'
import Profile        from './screens/Profile'
import CalendarScreen from './screens/CalendarScreen'
import Payments       from './screens/Payments'
import Insights       from './screens/Insights'

const screenMap = {
  entry:        Entry,
  onboarding:   Onboarding,
  home:         Home,
  leads:        Leads,
  leadDetail:   LeadDetail,
  events:       Events,
  eventDetail:  EventDetail,
  catalog:      Catalog,
  profile:      Profile,
  calendar:     CalendarScreen,
  payments:     Payments,
  insights:     Insights,
}

const tabScreens = ['home', 'leads', 'leadDetail', 'events', 'eventDetail',
                    'catalog', 'profile', 'calendar', 'payments', 'insights']

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-3 pb-1 bg-evo-bg shrink-0">
      <span className="text-[13px] font-bold text-evo-text">9:41</span>
      <div className="flex items-center gap-1">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0"  y="6" width="3" height="6" rx="1" fill="#1A1A2E"/>
          <rect x="4"  y="4" width="3" height="8" rx="1" fill="#1A1A2E"/>
          <rect x="8"  y="2" width="3" height="10" rx="1" fill="#1A1A2E"/>
          <rect x="12" y="0" width="3" height="12" rx="1" fill="#1A1A2E"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1 1 0 100 2 1 1 0 000-2z" fill="#1A1A2E"/>
          <path d="M5 7.2C5.9 6.4 6.9 6 8 6s2.1.4 3 1.2" stroke="#1A1A2E" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M2.5 4.8C4.1 3.2 5.9 2.4 8 2.4s3.9.8 5.5 2.4" stroke="#1A1A2E" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#1A1A2E" strokeOpacity=".35"/>
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#1A1A2E"/>
          <path d="M23 4v4a2 2 0 000-4z" fill="#1A1A2E" fillOpacity=".4"/>
        </svg>
      </div>
    </div>
  )
}

function HomeIndicator() {
  return (
    <div className="py-2 flex justify-center shrink-0 bg-evo-bg">
      <div className="w-32 h-1 rounded-full bg-evo-text/20" />
    </div>
  )
}

function AppContent() {
  const { screen } = useSupplier()
  const Screen = screenMap[screen] || Entry
  const showTabs = tabScreens.includes(screen)

  return (
    <div className="min-h-screen bg-evo-outer flex items-start justify-center sm:py-8 sm:px-4">
      <div
        className="relative bg-evo-bg flex flex-col w-full sm:max-w-[390px] min-h-screen sm:min-h-0 sm:rounded-[44px] sm:overflow-hidden"
        style={{
          height: 'auto',
          boxShadow: '0 24px 80px rgba(45,27,105,0.18)',
        }}
      >
        <StatusBar />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <PageTransition key={screen}>
              <Screen />
            </PageTransition>
          </AnimatePresence>
        </div>

        {showTabs && <TabBar />}
        <HomeIndicator />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SupplierProvider>
      <AppContent />
    </SupplierProvider>
  )
}
