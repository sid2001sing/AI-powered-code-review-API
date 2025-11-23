require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CONFIGURATION ---
const API_KEY = process.env.GROQ_API_KEY;

const groq = new Groq({
    apiKey: API_KEY
});

console.log("----------------------------------------");
console.log(`SERVER STARTED`);
console.log(`Model: llama-3.3-70b-versatile`);
console.log("----------------------------------------");

app.post('/api/review', async (req, res) => {
    console.log("\n--- NEW REQUEST ---");
    
    try {
        const { code, language } = req.body;
        if (!code) return res.status(400).json({ error: "No code provided" });

        console.log(`1. Processing ${code.length} chars of ${language || 'unknown'} code...`);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert Senior Software Engineer proficient in ${language || "all programming languages"}.
                    
                    Your task:
                    1. Analyze the provided code for Security, Bugs, and Performance/Style issues.
                    2. REFACTOR the code to fix these issues while maintaining the original functionality.
                    3. Return the response in the following strict JSON format:
                    {
                        "summary": "A concise summary of the code quality and changes made.",
                        "issues": [
                            {
                                "type": "security" | "bug" | "style",
                                "severity": "Critical" | "Medium" | "Low",
                                "title": "Short title",
                                "description": "Detailed explanation"
                            }
                        ],
                        "refactored_code": "The complete, fixed code string here"
                    }
                    
                    Constraints:
                    - Keep the refactored code in the same language as the input (${language}).
                    - Ensure the JSON is valid.
                    - Do not include markdown code blocks in the JSON string values.`
                },
                {
                    role: "user",
                    content: code
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.1, // Low temp for precise code generation
            max_tokens: 8000  // Allow larger outputs for long code
        });

        console.log("2. Response received from Groq.");
        
        const content = completion.choices[0]?.message?.content || "{}";
        
        // Robust Parsing
        try {
            const reviewData = JSON.parse(content);
            res.json(reviewData);
        } catch (parseError) {
            console.error("JSON Parse Failed on output:", content.substring(0, 100) + "...");
            // Attempt to recover specific fields if JSON is broken (basic recovery)
            res.json({
                summary: "Analysis completed, but the response format was complex.",
                issues: [{
                    type: "style", 
                    severity: "Medium", 
                    title: "Parsing Error", 
                    description: "The AI response was too large or malformed to parse strictly as JSON, but the analysis logic ran."
                }],
                refactored_code: "// Code generation failed due to length or formatting limits."
            });
        }

    } catch (error) {
        console.error("❌ SERVER ERROR:", error.message);
        res.status(500).json({ 
            error: "Processing Failed", 
            details: error.message 
        });
    }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
