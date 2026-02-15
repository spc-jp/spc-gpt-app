const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  return {
    statusCode: 500,
    body: JSON.stringify({ text: "エラー：OPENAI_API_KEYが未設定です" }),
  };
}

const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: userText,
  }),
});

const data = await res.json();

let text =
  data.output_text ||
  (Array.isArray(data.output) &&
    data.output[0] &&
    Array.isArray(data.output[0].content) &&
    data.output[0].content[0] &&
    data.output[0].content[0].text) ||
  "";

if (!res.ok) {
  const msg = data.error && data.error.message ? data.error.message : "APIエラー";
  return {
    statusCode: res.status,
    body: JSON.stringify({ text: `エラー：${msg}` }),
  };
}

if (!text) text = "（返答が空でした）";

return {
  statusCode: 200,
  body: JSON.stringify({ text }),
};
