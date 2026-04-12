import { supabase } from '../supabase'

export async function saveReply(reviewId, replyText) {
  const { error } = await supabase
    .from('reviews')
    .update({ replied: true, reply_text: replyText })
    .eq('id', reviewId)
  if (error) throw error
  return true
}
