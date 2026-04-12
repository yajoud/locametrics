import { supabase } from '../supabase'

export async function syncReviews(businessId, placeId) {
  const key = import.meta.env.VITE_GOOGLE_API_KEY
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${key}`

  const res = await fetch(url)
  const data = await res.json()
  const reviews = data.result?.reviews || []

  for (const r of reviews) {
    await supabase.from('reviews').upsert({
      business_id: businessId,
      author: r.author_name,
      stars: r.rating,
      text: r.text,
      google_time: r.relative_time_description,
    }, { onConflict: 'business_id,author,google_time' })
  }
  return reviews.length
}
