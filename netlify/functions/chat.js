exports.handler = async (event) => {
const headers = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Headers": "Content-Type, Authorization",
"Access-Control-Allow-Methods": "POST, OPTIONS",
"Content-Type": "application/json; charset=utf-8"
};

if (event.httpMethod === "OPTIONS") {
return { statusCode: 204, headers: headers, body: "" };
}

try {
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
return {
statusCode: 500,
headers: headers,
body: JSON.stringify({ text: "ERROR: OPENAI_API_KEY is missing" })
};
}

const reqBody = event.body ? JSON.parse(event.body) : {};
const userText = (reqBody.text || "").toString().trim();

if (!userText) {
  return {
    statusCode: 400,
    headers: headers,
    body: JSON.stringify({ text: "入力が空です" })
  };
}

const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + apiKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: userText
  })
});

const data = await res.json();

if (!res.ok) {
  const msg =
    (data && data.error && data.error.message) ? data.error.message : "API error";
  return {
    statusCode: res.status,
    headers: headers,
    body: JSON.stringify({ text: "エラー：" + msg })
  };
}

let text = "";
if (data && data.output_text) {
  text = data.output_text;
} else if (data && data.output && Array.isArray(data.output) && data.output[0] && data.output[0].content && Array.isArray(data.output[0].content) && data.output[0].content[0]) {
  text = data.output[0].content[0].text || data.output[0].content[0].value || "";
}

return {
  statusCode: 200,
  headers: headers,
  body: JSON.stringify({ text: text || "返答が空でした" })
};


} catch (e) {
return {
statusCode: 500,
headers: headers,
body: JSON.stringify({ text: "サーバーエラー：" + (e && e.message ? e.message : String(e)) })
};
}
};
