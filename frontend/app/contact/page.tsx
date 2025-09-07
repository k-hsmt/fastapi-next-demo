"use client";
import { useState } from "react";

type FormState = { name: string; email: string; message: string };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""; // 例: https://fastapi-next-demo.onrender.com

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(null);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
    };

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValid =
    form.name.trim().length > 0 &&
    validEmail(form.email) &&
    form.message.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      console.log("[contact] submit clicked", { API_BASE, form });
    setResult(null);

    if (!API_BASE) {
      setResult({ ok: false, msg: "APIベースURLが未設定です（.env.local の NEXT_PUBLIC_API_BASE を確認）。" });
      return;
    }
    if (!isValid) {
      setResult({ ok: false, msg: "未入力またはメール形式が正しくありません。" });
      return;
    }

    try {
      setSubmitting(true);
      console.log("[contact] fetch start");
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("[contact] fetch start");
      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${bodyText}`);
      }

      const data: { ok: boolean; received: FormState } = await res.json();
      setResult({ ok: true, msg: `送信完了：${data.received.name} さん、ありがとうございました。` });
      setForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setResult({ ok: false, msg: `送信に失敗しました：${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>お問い合わせフォーム</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          お名前
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange("name")}
            placeholder="山田 太郎"
            required
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          メールアドレス
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="you@example.com"
            required
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          メッセージ
          <textarea
            name="message"
            rows={6}
            value={form.message}
            onChange={onChange("message")}
            placeholder="お問い合わせ内容を入力してください。"
            required
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="submit"
            disabled={!isValid || submitting}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #222",
              background: submitting || !isValid ? "#eee" : "#111",
              color: submitting || !isValid ? "#888" : "#fff",
              cursor: submitting || !isValid ? "not-allowed" : "pointer",
            }}
            aria-busy={submitting}
          >
            {submitting ? "送信中…" : "送信"}
          </button>
          {!isValid && (
            <span style={{ fontSize: 12, color: "#666" }}>
              必須項目の入力＆正しいメール形式が必要です
            </span>
          )}
        </div>
      </form>

      {result && (
        <p
          role="status"
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: result.ok ? "#f0fff4" : "#fff5f5",
            border: `1px solid ${result.ok ? "#16a34a" : "#dc2626"}`,
            color: result.ok ? "#166534" : "#991b1b",
          }}
        >
          {result.msg}
        </p>
      )}
    </main>
  );
}
