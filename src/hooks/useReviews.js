import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useReviews(businessId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    supabase.from('reviews').select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false) })

    const sub = supabase.channel('reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews', filter: `business_id=eq.${businessId}` },
        payload => setReviews(r => [payload.new, ...r]))
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [businessId])

  return { reviews, loading }
}
