// netlify/functions/dataFunctions.js

let submissions = []; 
// NOTE: This is in-memory, so data goes away if the function restarts.
// Real apps use a DB or other persistent storage.

async function storeSubmission(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, issue } = JSON.parse(event.body);
    if (!name || !issue) {
      return { statusCode: 400, body: 'Missing name or issue.' };
    }

    submissions.push({
      id: Date.now(),
      name,
      issue,
      date: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Submission saved.',
        total: submissions.length
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error.' };
  }
}

async function aiInsights(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { question } = JSON.parse(event.body);

    // Summarize the submissions for the AI prompt
    const submissionTexts = submissions.map(
      (s) => `Name: ${s.name}, Issue: ${s.issue}`
    ).join('\n');

    const prompt = `
      We have the following user submissions:\n${submissionTexts}\n
      Here's the admin's question: "${question}"
      Please give a concise AI reply.
    `;

    // Use the API key from Netlify environment variables
    const apiKey = process.env.OPENAI_API_KEY; 
    if (!apiKey) {
      return { statusCode: 500, body: 'Missing OpenAI API key.' };
    }

    // Make the request to OpenAI
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    const aiText = data.choices?.[0]?.text || 'No AI response found.';

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: aiText.trim() }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error.' };
  }
}

// Export them for separate Netlify functions
module.exports = { storeSubmission, aiInsights };
