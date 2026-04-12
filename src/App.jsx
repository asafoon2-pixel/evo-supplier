import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SupplierProvider, useSupplier } from './context/SupplierContext'
import { LanguageProvider } from './context/LanguageContext'
import PageTransition from './components/PageTransition'
import TabBar from './components/TabBar'
import SplashScreen from './components/SplashScreen'

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
import PackageForm    from './screens/PackageForm'
import ProductsForm   from './screens/ProductsForm'

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
  packageForm:  PackageForm,
  productsForm: ProductsForm,
}

const tabScreens = ['home', 'calendar', 'events', 'leadDetail', 'eventDetail',
                    'catalog', 'profile', 'payments', 'insights']

function AppContent() {
  const { screen, authLoading } = useSupplier()
  const [splashDone, setSplashDone] = useState(false)

  // Splash shows for at least 2 seconds and until auth is resolved
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const showSplash = !splashDone || authLoading
  const Screen = screenMap[screen] || Entry
  const showTabs = tabScreens.includes(screen)

  return (
    // Outer: cream background fills the whole viewport on desktop
    <div
      className="min-h-screen flex items-start justify-center"
      style={{ background: '#EDE8DF' }}
    >
      {/* Inner: mobile column, max 430px, no fake phone frame */}
      <div
        className="relative flex flex-col w-full min-h-screen"
        style={{
          maxWidth: 430,
          background: '#F5F0E8',
          paddingTop:    'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Splash screen overlay */}
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>

        {/* App content (always mounted, hidden under splash) */}
        <div className={`flex flex-col flex-1 ${showSplash ? 'invisible' : 'visible'}`}>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
              <PageTransition key={screen}>
                <Screen />
              </PageTransition>
            </AnimatePresence>
          </div>

          {showTabs && <TabBar />}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <SupplierProvider>
        <AppContent />
      </SupplierProvider>
    </LanguageProvider>
  )
}
