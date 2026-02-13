exports.handler = async (event) => {
try {
const body = JSON.parse(event.body || "{}");
const userText = body.text || "こんにちは。";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "OPENAI_API_KEY が未設定です" })
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

return {
  statusCode: 200,
  body: JSON.stringify({
    text: data.output_text || "(返答が取得できませんでした)"
  })
};


} catch (e) {
return {
statusCode: 500,
body: JSON.stringify({ error: String(e) })
};
}
};