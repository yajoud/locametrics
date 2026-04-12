import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useAlerts(businessId) {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (!businessId) return
    supabase.from('alerts').select('*')
      .eq('business_id', businessId)
      .eq('seen', false)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setAlerts(data || []))

    const sub = supabase.channel('alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts', filter: `business_id=eq.${businessId}` },
        payload => setAlerts(a => [payload.new, ...a]))
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [businessId])

  return alerts
}
