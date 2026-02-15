export async function handler(event) {
  try {
    // CORS（ブラウザから叩くため）
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // プリフライト対応
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "ok",
      };
    }

    // 入力取得
    let userText = "";
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      userText = (body.text || "").toString().trim();
    } catch {
      userText = "";
    }

    if (!userText) userText = "こんにちは";

    // 環境変数
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ text: "エラー：OPENAI_API_KEY が未設定です" }),
      };
    }

    // OpenAI Responses API 呼び出し
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: userText,
        max_output_tokens: 200,
      }),
    });

    const data = await res.json().catch(() => ({}));

    // エラーなら理由を返す
    if (!res.ok) {
      const msg =
        (data && data.error && data.error.message) ? data.error.message : "APIエラー";
      return {
        statusCode: res.status,
        headers: corsHeaders,
        body: JSON.stringify({ text: `エラー：${msg}` }),
      };
    }

    // 返答テキスト抽出（いろいろな形を想定して安全に）
    const text =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.value ||
      "";

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ text: text || "（返答が空でした）" }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: `エラー：${String(e)}` }),
    };
  }
}
