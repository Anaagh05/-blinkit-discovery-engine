const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { review } = req.body;

  if (!review) {
    return res.status(400).json({ error: 'Review text is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
    Analyze the following customer review for a quick-commerce app (like Blinkit, Instamart, Zepto).
    
    Review: "${review}"
    
    Please provide your analysis in JSON format with the following fields:
    - "theme": Which global theme this maps to (e.g., Trust & Expiration, UI Friction, Delivery Speed, Assortment). If none, pick a suitable one.
    - "sentiment": The overall sentiment (Positive, Negative, Neutral).
    - "friction": The specific underlying friction or pain point mentioned in the review.
    
    Respond only with valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting in response (e.g., ```json\n...\n```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in analyze API:', error);
    res.status(500).json({ error: 'Failed to analyze review' });
  }
}
