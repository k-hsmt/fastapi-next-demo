"use client";
import { useState } from "react";

const API_BASE = "https://fastapi-next-demo.onrender.com";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string>("");

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/healthz`);
      // const data = await res.json();
      // setResult(JSON.stringify(data));
      const text = await res.text();
      setResult(`status=${res.status}, body=${text}`);
      
    } catch (e) {
      // setResult("error");
      setResult(`fetch error: ${String(e)}`);      
    }
  };

  const send = async() =>{
    try {
      const res = await fetch(`${API_BASE}/echo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
      const data = await res.json();
      setResult(JSON.stringify(data)) 
    } catch(e) {
      setResult(`error: ${String(e)}`);
    }
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>Echo テスト（Next.js → FastAPI）</h1>
      <textarea
        rows={4}
        placeholder="メッセージを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={send}>送信</button>
      <div>結果: {result}</div>
    </main>
  );
}