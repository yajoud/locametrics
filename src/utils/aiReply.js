export async function generateReply(review, businessName = 'nuestro negocio') {
  const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.anthropic.com/v1/messages'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Eres el dueño de ${businessName}. Responde reseñas de Google de forma profesional, cercana y auténtica. Máximo 3 frases. En español.`,
      messages: [{ role: 'user', content: `Reseña de ${review.author} (${review.stars} estrellas): "${review.text}". Escribe una respuesta.` }]
    })
  })
  const data = await res.json()
  return data.content[0].text
}
