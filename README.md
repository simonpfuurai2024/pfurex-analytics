# Pfurex Analytics

**AI-Powered Investment Analysis for Zimbabwean SMEs**

Pfurex Analytics automates the entire investment analysis pipeline for early-stage Zimbabwean businesses. Business owners submit a funding application and upload supporting documents (PDF, Excel, mobile money statements). The system instantly extracts financial data using a local LLM (Mistral 7B), runs three valuation models calibrated for Zimbabwean sectors, generates a five‑factor risk score covering local realities, and projects cash flow, runway, and investor returns — including Monte Carlo simulations.

---

## 🚀 Key Features

### For Business Owners
- **Funding Application Wizard** — multi‑step form that captures your business story, team, traction, and funding ask.
- **Document Upload** — upload pitch decks (PDF), financials (Excel), EcoCash/OneMoney statements, and tax returns.
- **Instant AI Analysis** — automatically extracts financial metrics, rates growth factors, and generates valuations.
- **Financial Simulation** — project cash flow, runway, and break‑even with realistic Zimbabwe‑specific assumptions (currency mix, ZESA costs, inflation, forex premium).

### For Investors
- **Multi‑Method Valuation** — Scorecard, Venture Capital, and Risk‑Adjusted models with sector‑specific baselines.
- **Zimbabwe Risk Scoring** — five‑factor model covering policy/regulatory, currency/macro, management/governance, operational infrastructure, and market competition.
- **Editable Ratings** — override AI scores with your own expertise and justifications; recalculate valuations instantly.
- **Scenario Comparison** — save multiple simulation runs and compare them side‑by‑side with overlaid charts.
- **Audit Trail** — every valuation, edit, and document processed is logged for full transparency.
- **Export to Excel** — download a multi‑sheet investment memo with one click.

### For Admins
- **User Management** — create, activate, and deactivate users (business owners, investors, admins).
- **Reference Data** — configure sector baselines, exit multiples, and risk adjustment curves.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | PostgreSQL (async SQLAlchemy, Alembic migrations) |
| **LLM** | Mistral 7B (llama‑cpp‑python, CPU‑only inference) or DeepSeek/Gemini API |
| **Message Queue** | Redpanda (Kafka‑compatible) |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **Charts** | Recharts |
| **Infrastructure** | k3s (lightweight Kubernetes), Docker Compose |
| **Auth** | JWT with RBAC (business owner, investor, admin) |

---

## 📂 Project Structure

pfurex-analytics/
├── backend/
│ ├── app/
│ │ ├── api/ # FastAPI routers (companies, documents, dashboard, simulation, etc.)
│ │ ├── engines/ # Valuation, risk scoring, and simulation engines
│ │ ├── events/ # Redpanda producer/consumer
│ │ ├── models/ # SQLAlchemy ORM models
│ │ ├── parsers/ # Document text extraction
│ │ └── auth/ # Authentication & RBAC
│ ├── alembic/ # Database migrations
│ ├── scripts/ # Seed data, admin setup
│ ├── requirements.txt
│ └── Dockerfile
├── frontend/
│ ├── src/
│ │ ├── pages/ # React page components
│ │ ├── components/ # Reusable components
│ │ ├── context/ # Auth context
│ │ └── services/ # API client (Axios)
│ └── Dockerfile
├── k3s/manifests/ # Kubernetes manifests (PostgreSQL, Redpanda)
├── models/ # LLM model files (not tracked in Git)
├── docker-compose.yml
└── README.md
text


---

## ⚙️ Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for k3s or Docker Compose)
- k3s (lightweight Kubernetes)
- ~8 GB free RAM (for Mistral 7B CPU inference)

### 1. Clone the Repository
```bash
git clone https://github.com/simonpfuurai2024/pfurex-analytics.git
cd pfurex-analytics

2. Download the LLM Model

Place the Mistral 7B Q4 quantised GGUF file in models/:
bash

mkdir -p models
cd models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
cd ..

3. Start Infrastructure (PostgreSQL + Redpanda)
bash

# Start k3s
sudo systemctl start k3s

# Apply manifests
kubectl apply -f k3s/manifests/00-namespace.yaml
kubectl apply -f k3s/manifests/01-postgres.yaml
kubectl apply -f k3s/manifests/04-redpanda.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n zivc --timeout=120s

# Port‑forward PostgreSQL
kubectl port-forward -n zivc svc/postgres 5432:5432 &

4. Start the Backend
bash

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Seed reference data
python scripts/seed_reference_data.py

# Seed admin user
python scripts/seed_admin.py

# Start the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

5. Start the Frontend
bash

cd frontend
npm install
npm run dev

Open http://localhost:5173 in your browser.
Default Login

    Email: admin@pfurex.co.zw

    Password: Admin123!

🐳 Docker Compose
bash

docker compose up -d --build

The frontend will be available at http://localhost, backend at http://localhost:8000.
🌐 Demo via Cloudflare Tunnel

Expose your local instance to the internet for demos:
bash

cloudflared tunnel --url http://localhost:8000

Share the generated trycloudflare.com URL.
🔑 Environment Variables
Variable	Description	Default
DATABASE_URL	PostgreSQL connection string	postgresql+asyncpg://...
LLM_MODEL_PATH	Path to Mistral GGUF file	models/mistral-7b...
JWT_SECRET_KEY	Secret for JWT signing	dev-secret-...
DEEPSEEK_API_KEY	DeepSeek API key (optional)	—
GEMINI_API_KEY	Gemini API key (optional)	—
📄 License

MIT License — see LICENSE file.
👤 Author

Simon Pfuurai — Computer Systems Engineering graduate passionate about helping businesses scale and reach their potential.

    GitHub: @simonpfuurai2024

    LinkedIn: Simon Pfuurai

🙏 Acknowledgments

    Mistral AI for the open‑weight model

    llama‑cpp‑python for CPU‑optimised inference

    The Zimbabwean startup ecosystem for inspiring this tool

Built with ❤️ in Harare, Zimbabwe 🇿🇼
