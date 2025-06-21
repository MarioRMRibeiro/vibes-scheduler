export default async function handler(req, res) {
  const { session } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API Key' });
  }

  try {
    const prompt = `Based on this D&D session voting data, choose the best timeslot. Session data:\n\n${JSON.stringify(session, null, 2)}\n\nRespond only with the best date and time period.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content || 'No recommendation found.';

    res.status(200).json({ recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
}
