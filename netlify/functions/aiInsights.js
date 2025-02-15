const fetch = require("node-fetch");

exports.handler = async (event) => {
    console.log("🔍 Received request:", event.body); // Log the incoming request

    try {
        // Ensure event.body is not empty or undefined
        if (!event.body) {
            console.error("🚨 No request body received.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No request body received." })
            };
        }

        const requestBody = JSON.parse(event.body);
        console.log("📨 Parsed request body:", requestBody);

        // Ensure request body contains a prompt
        if (!requestBody.prompt) {
            console.error("🚨 Missing 'prompt' in request body.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing 'prompt' in request body." })
            };
        }

        // Ensure API Key is available
        if (!process.env.OPENAI_API_KEY) {
            console.error("🚨 Missing OpenAI API key in environment variables.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing OpenAI API key." })
            };
        }

        console.log("🛠 Sending request to OpenAI API...");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4", // Ensure this is a valid model in your OpenAI account
                messages: [{ role: "user", content: requestBody.prompt }],
                temperature: 0.7
            })
        });

        console.log("🛠 Awaiting OpenAI response...");
        const responseData = await response.json();

        if (!response.ok) {
            console.error("🚨 OpenAI API Error:", responseData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "OpenAI API error", details: responseData })
            };
        }

        console.log("🧠 AI Response:", responseData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                answer: responseData.choices[0]?.message?.content || "No response from AI"
            })
        };
    } catch (error) {
        console.error("🚨 Error in AI function:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "AI request failed", details: error.message })
        };
    }
};
