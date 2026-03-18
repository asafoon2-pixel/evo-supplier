import { AnimatePresence } from 'framer-motion'
import { SupplierProvider, useSupplier } from './context/SupplierContext'
import PageTransition from './components/PageTransition'
import TabBar from './components/TabBar'

import Entry         from './screens/Entry'
import Onboarding    from './screens/Onboarding'
import Home          from './screens/Home'
import Leads         from './screens/Leads'
import LeadDetail    from './screens/LeadDetail'
import Events        from './screens/Events'
import EventDetail   from './screens/EventDetail'
import Catalog       from './screens/Catalog'
import Profile       from './screens/Profile'
import CalendarScreen from './screens/CalendarScreen'
import Payments      from './screens/Payments'
import Insights      from './screens/Insights'

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

const tabScreens = ['home', 'leads', 'leadDetail', 'events', 'eventDetail', 'catalog', 'profile', 'calendar', 'payments', 'insights']

function AppContent() {
  const { screen } = useSupplier()
  const Screen = screenMap[screen] || Entry
  const showTabs = tabScreens.includes(screen)

  return (
    <div className="w-full min-h-screen bg-evo-black text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        <PageTransition key={screen}>
          <Screen />
        </PageTransition>
      </AnimatePresence>
      {showTabs && <TabBar />}
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
