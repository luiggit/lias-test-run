require('dotenv').config();
const fetch = require("node-fetch");
require("dotenv").config();  // Ensure .env file is loaded

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("❌ OpenAI API Key is missing. Check your .env file.");
    process.exit(1);
}

async function testOpenAI() {
    try {
        console.log("🚀 Sending test request to OpenAI...");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "Confirm which GPT model is being used. Just reply with the model name." },
                    { role: "user", content: "What model are you?" }
                ],
                temperature: 0
            }),
        });

        const data = await response.json();
        console.log("✅ OpenAI Response:", data);

        if (data.choices && data.choices[0]) {
            console.log("🔍 Model Used:", data.model);
        } else {
            console.error("❌ Unexpected OpenAI response format:", data);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testOpenAI();
