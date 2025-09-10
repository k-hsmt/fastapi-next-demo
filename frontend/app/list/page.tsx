// frontend/app/contact/list/page.tsx
type Row = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string; // ISO文字列で飛んできます
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

async function fetchRows(): Promise<Row[]> {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}/contact/list?limit=20`, {
    cache: "no-store",
    // CORS はバックエンド側設定済み。サーバー側fetchでもOK。
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function ContactListPage() {
  const rows = await fetchRows();

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>お問い合わせ一覧</h1>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
        API_BASE: {API_BASE || "(empty)"} / 件数: {rows.length}
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID","名前","メール","メッセージ","作成日時"].map((h) => (
                <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{r.id}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{r.name}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{r.email}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, whiteSpace: "pre-wrap" }}>{r.message}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 16, color: "#666" }}>データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
