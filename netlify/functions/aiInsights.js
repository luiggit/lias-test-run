console.log("🚀 Forcing Netlify to recognize this update");

const fetch = require("node-fetch");

exports.handler = async (event) => {
    // ✅ Ensure it only allows POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed. Use POST instead." }),
        };
    }

    try {
        // ✅ Parse request body and extract message
        const requestBody = JSON.parse(event.body);
        const userMessage = requestBody.message || "No message provided.";

        console.log("✅ Received User Message:", userMessage);

        // ✅ Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "You are an AI assistant that provides concise summaries of user issues." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.2
            }),
        });

        const data = await response.json();
        console.log("✅ OpenAI Response:", data);

        // ✅ Return OpenAI response
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("❌ Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
