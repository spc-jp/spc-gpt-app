exports.handler = async (event) => {
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Headers": "Content-Type, Authorization",
"Access-Control-Allow-Methods": "POST, OPTIONS",
"Content-Type": "application/json; charset=utf-8",
};

if (event.httpMethod === "OPTIONS") {
return {
statusCode: 204,
headers: corsHeaders,
body: "",
};
}

try {
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
return {
statusCode: 500,
headers: corsHeaders,
body: JSON.stringify({ text: "エラー：OPENAI_API_KEYが未設定です" }),
};
}

const body = event.body ? JSON.parse(event.body) : {};
const userText = (body.text || "").toString().trim();

if (!userText) {
return {
statusCode: 400,
headers: corsHeaders,
body: JSON.stringify({ text: "入力が空です" }),
};
}

const res = await fetch("https://api.openai.com/v1/responses
", {
method: "POST",
headers: {
"Authorization": Bearer ${apiKey},
"Content-Type": "application/json",
},
body: JSON.stringify({
model: "gpt-4.1-mini",
input: userText,
}),
});

const data = await res.json();

if (!res.ok) {
const msg =
(data && data.error && data.error.message) ? data.error.message : "APIエラー";
return {
statusCode: res.status,
headers: corsHeaders,
body: JSON.stringify({ text: エラー：${msg} }),
};
}

const text =
data.output_text ||
(Array.isArray(data.output) &&
data.output[0] &&
Array.isArray(data.output[0].content) &&
data.output[0].content[0] &&
(data.output[0].content[0].text || data.output[0].content[0].value)) ||
"";

return {
statusCode: 200,
headers: corsHeaders,
body: JSON.stringify({ text: text || "返答が空でした" }),
};

} catch (e) {
return {
statusCode: 500,
headers: corsHeaders,
body: JSON.stringify({ text: サーバーエラー：${e.message || e} }),
};
}
};
