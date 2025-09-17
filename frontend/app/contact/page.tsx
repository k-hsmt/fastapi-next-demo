"use client";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

type FormState = { name: string; email: string; message: string };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""; // 例: https://fastapi-next-demo.onrender.com

// タイムアウト付き fetch ヘルパー
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export default function ContactPage() {
  // ★ ここは“元のまま”維持
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(
    null
  );

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValid =
    form.name.trim().length > 0 &&
    validEmail(form.email) &&
    form.message.trim().length > 0;

  // ★ onSubmit に “toast を組み込む” だけ（isValid/result を活かす）
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);

    if (!API_BASE) {
      const msg =
        "APIベースURLが未設定です（.env.local の NEXT_PUBLIC_API_BASE を確認）。";
      setResult({ ok: false, msg });
      toast.error(msg);
      return;
    }
    if (!isValid) {
      const msg = "未入力またはメール形式が正しくありません。";
      setResult({ ok: false, msg });
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      await toast.promise(
        (async () => {
          const res = await fetchWithTimeout(
            `${API_BASE}/contact`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            },
            15000
          );
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}${body ? `: ${body}` : ""}`);
          }
          return res.json() as Promise<{ ok: boolean; received: FormState }>;
        })(),
        {
          loading: "送信中…",
          success: "送信しました。ありがとうございます！",
          error: "送信できませんでした。10秒後に再送してください。",
        }
      );

      setResult({
        ok: true,
        msg: `送信完了：${form.name} さん、ありがとうございました。`,
      });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
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
