# fastapi-next-demo

- backend: FastAPI (Renderにデプロイ)
- frontend: Next.js (Vercelにデプロイ)

## URLs
- Backend (Render): https://fastapi-next-demo.onrender.com/  （/healthz OK）
- Frontend (Vercel): https://fastapi-next-demo.vercel.app/
- Contact Form (Vercel): https://fastapi-next-demo.vercel.app/contact
- Contact API (Render): https://fastapi-next-demo.onrender.com/contact  (POST, JSON body: {"name","email","message"})

# Local Development
## Backend Run (local)
```
cd backend
python -m venv .venv
\# Windows:
.\.venv\Scripts\activate
\# macOS/Linux:
\# source .venv/bin/activate
python -m pip install -U pip
pip install -r requirements.txt
uvicorn main:app --reload
\# open http://127.0.0.1:8000/healthz
```
## Frontend Run (local)
```
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE を設定
npm ci
npm run dev
\# open http://localhost:3000
```

## Environment Variables
frontend: NEXT_PUBLIC_API_BASE … Render の API ベースURL（末尾スラッシュなし）

# Deploy Notes
## Render (Backend)
- Root Directory: backend/
- Build Command: pip install -r requirements.txt
- Start Command: uvicorn main:app --host=0.0.0.0 --port=$PORT
- Health Check Path: /healthz

## Vercel (Frontend)
- Root Directory: frontend/
- Install: npm ci
- Build: npm run build
- Env: NEXT_PUBLIC_API_BASE = Render の URL
- CORS: FastAPI の allow_origins に
- http://localhost:3000, http://127.0.0.1:3000
- https://fastapi-next-demo.vercel.app
- allow_origin_regex=r"https://.*\\.vercel\\.app" を追加（プレビューURL許可）

## Troubleshooting
- CORS: 末尾 / を付けない。Vercelプレビューは allow_origin_regex で許可。
- Hydration Error: 拡張の影響。シークレットウィンドウで再現確認。
- Cold Start: Render 直後は失敗することあり。数秒後に再送。
