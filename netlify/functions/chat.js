const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ text: "OPENAI_API_KEY が設定されていません" })
  };
}

const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: userText
  })
});

const data = await res.json();

const text =
  data.output_text ||
  data.output?.[0]?.content?.[0]?.text ||
  "返答が空でした";

return {
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify({ text })
};
