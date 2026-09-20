require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const sharp = require("sharp");
const { receiptSchema } = require("../validators/receiptValidator");

const aiClients = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2
]
    .filter(Boolean)
    .map(apiKey => new GoogleGenAI({ apiKey }));

async function generateReceiptWithFailover(contents) {
    const maxAttemptsPerKey = 2;
    const timeoutMs = 30000;

    let lastError;

    for (let keyIndex = 0; keyIndex < aiClients.length; keyIndex++) {

        const ai = aiClients[keyIndex];

        console.log(
            `🤖 Using Gemini API key ${keyIndex + 1}/${aiClients.length}`
        );

        for (let attempt = 1; attempt <= maxAttemptsPerKey; attempt++) {

            try {

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        const error = new Error(
                            "Gemini request timed out"
                        );

                        error.code = "ETIMEDOUT";

                        reject(error);
                    }, timeoutMs);
                });

                const geminiPromise = ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents
                });

                return await Promise.race([
                    geminiPromise,
                    timeoutPromise
                ]);

            } catch (error) {

                lastError = error;

                console.log(
                    `⚠️ Gemini key ${keyIndex + 1} failed`,
                    `status=${error.status || error.code || "unknown"}`
                );

                // Quota/rate limit → immediately try next key
                if (error.status === 429) {
                    console.log(
                        `🔄 Quota exhausted. Switching to Gemini key ${keyIndex + 2}...`
                    );

                    break;
                }

                // Temporary server error → retry same key once
                if (error.status === 503 && attempt < maxAttemptsPerKey) {
                    console.log(
                        `🔁 Gemini temporary error. Retrying key ${keyIndex + 1}...`
                    );

                    await new Promise(resolve =>
                        setTimeout(resolve, 2000)
                    );

                    continue;
                }

                // Timeout → try next key
                if (error.code === "ETIMEDOUT") {
                    console.log(
                        `🔄 Gemini timeout. Switching to next key...`
                    );

                    break;
                }

                // Other errors → don't hide them
                throw error;
            }
        }
    }

    throw lastError;
}

const extractReceiptController = async (req, res) => {

    const startTime = Date.now();

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Receipt image is required"
            });
        }

        console.log("📥 Receipt received");

        console.log(
            "📦 Original file size:",
            req.file.size,
            "bytes"
        );

        // Optimize image before sending to Gemini
        const optimizedImage = await sharp(req.file.buffer)
            .resize({
                width: 1000,
                withoutEnlargement: true
            })
            .jpeg({
                quality: 80
            })
            .toBuffer();

        const imagePreparedTime = Date.now();

        console.log(
            "🖼️ Image optimized in:",
            imagePreparedTime - startTime,
            "ms"
        );

        console.log(
            "📦 Optimized image size:",
            optimizedImage.length,
            "bytes"
        );

        const base64Image =
            optimizedImage.toString("base64");

        console.log("🤖 Sending request to Gemini...");

        const response = await generateReceiptWithFailover([
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            },
            {
                text: `
Extract the information from this receipt.

Return ONLY valid JSON in this structure:

{
  "merchant": "string or null",
  "date": "YYYY-MM-DD or null",
  "items": [
    {
      "name": "string",
      "amount": number
    }
  ],
  "subtotal": number or null,
  "tax": number or null,
  "total": number
}

Rules:
- Do not invent information.
- If something cannot be read, use null where allowed.
- Amounts must be numbers without currency symbols.
- Total is required.
`
            }
        ]);

        const geminiResponseTime = Date.now();

        console.log(
            "🤖 Gemini response received in:",
            geminiResponseTime - imagePreparedTime,
            "ms"
        );

        console.log(
            "⏱️ Total AI processing time:",
            geminiResponseTime - startTime,
            "ms"
        );

        const rawText = response.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsedData = JSON.parse(rawText);

        const validation =
            receiptSchema.safeParse(parsedData);

        if (!validation.success) {
            return res.status(422).json({
                message: "AI returned invalid receipt data",
                errors: validation.error.issues
            });
        }

        return res.status(200).json({
            message: "Receipt extracted successfully",
            receipt: validation.data
        });

    } catch (error) {

        console.error(
            "Gemini Receipt Error:",
            error
        );

        if (error.status === 503) {
            return res.status(503).json({
                message:
                    "Receipt scanner is temporarily busy. Please try again in a few seconds."
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                message:
                    "Receipt scanner is temporarily unavailable. Please try again shortly."
            });
        }

        if (error.code === "ETIMEDOUT") {
            return res.status(504).json({
                message:
                    "Receipt scanning took too long. Please try again."
            });
        }

        return res.status(500).json({
            message:
                "Unable to read this receipt. Please try again or enter the expense manually."
        });
    }
};

module.exports = {
    extractReceiptController
};