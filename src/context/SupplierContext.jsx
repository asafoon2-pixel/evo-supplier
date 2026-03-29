import React, { createContext, useContext, useState } from 'react'
import { leads as initialLeads, events as initialEvents, catalog as initialCatalog } from '../data/index'

const SupplierContext = createContext(null)

export function SupplierProvider({ children }) {
  const [screen, setScreen]           = useState('entry')
  const [activeTab, setActiveTab]     = useState('home')
  const [leads, setLeads]             = useState(initialLeads)
  const [events]                      = useState(initialEvents)
  const [catalog, setCatalog]         = useState(initialCatalog)
  const [activeLead, setActiveLead]   = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const [editPackage, setEditPackage] = useState(null)
//
  const [supplierName, setSupplierName] = useState('Maya')
//
  const TAB_SCREENS = ['home', 'leads', 'events', 'catalog', 'profile']
  const navigate = (s) => { setScreen(s); if (TAB_SCREENS.includes(s)) setActiveTab(s) }
  const goTab    = (tab) => { setActiveTab(tab); setScreen(tab) }

  const acceptLead = (id) => setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'booked' } : l))
  const declineLead = (id) => setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'declined' } : l))

  const newLeadCount = leads.filter(l => l.status === 'new').length

  const value = {
    screen, navigate,
    activeTab, goTab,
    leads, setLeads, acceptLead, declineLead,
    events,
    catalog, setCatalog,
    activeLead, setActiveLead,
    activeEvent, setActiveEvent,
    editPackage, setEditPackage,
    newLeadCount,
    //
    supplierName, setSupplierName
    //
  }

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>
}

export function useSupplier() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSupplier must be inside SupplierProvider')
  return ctx
}
