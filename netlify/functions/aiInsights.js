const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        console.log("Function aiInsights triggered.");

        // ✅ Debugging: Check if Netlify is reading the OpenAI API key correctly
        console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "MISSING");

        // If API key is missing, return an error response
        if (!process.env.OPENAI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "OpenAI API Key is missing from environment variables." })
            };
        }

        // Parse request body
        const requestBody = JSON.parse(event.body);
        const userMessage = requestBody.message || "Hello, how can I assist you?";

        console.log("User input:", userMessage);

        // Make request to OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // Ensure you're using the correct model
                messages: [{ role: "user", content: userMessage }],
                temperature: 0.7
            })
        });

        // Debugging: Log OpenAI response status
        console.log("OpenAI API Response Status:", response.status);

        // If OpenAI response is not OK, log error
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("OpenAI API Error:", errorResponse);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Error from OpenAI API", details: errorResponse })
            };
        }

        // Parse OpenAI response
        const data = await response.json();
        console.log("OpenAI API Response:", JSON.stringify(data, null, 2));

        // Extract and return AI-generated text
        const aiResponse = data.choices?.[0]?.message?.content || "No AI response found.";
        return {
            statusCode: 200,
            body: JSON.stringify({ answer: aiResponse })
        };

    } catch (error) {
        console.error("Error in aiInsights function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
