# InvestOre Analytics

**Mining & Exploration Valuation Analytics Platform**

A comprehensive web platform that enables users to define peer groups of mining/exploration companies and analyze valuations, resources, and geological prospectivity.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │         Next.js (TypeScript) + Plotly.js + Mapbox GL           │   │
│  │    • Peer Group Builder    • Valuation Dashboard               │   │
│  │    • Resource Charts       • Spatial Map View                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                 HTTPS
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FastAPI (Python)                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │   Auth   │ │Analytics │ │  Peers   │ │  Export/Lineage  │   │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │     Service      │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
┌───────────────────▼───┐ ┌────────▼───────┐ ┌─────▼─────────────────────┐
│   ETL/Orchestration   │ │   Redis Cache  │ │     Data Storage Layer    │
│  ┌─────────────────┐  │ │                │ │  ┌─────────────────────┐  │
│  │ Prefect Workers │  │ │  • Session     │ │  │PostgreSQL+TimescaleDB│ │
│  │  • Market Data  │  │ │  • Rate Limit  │ │  │  • Relational Data   │ │
│  │  • FX Rates     │  │ │  • Analytics   │ │  │  • Time-Series       │ │
│  │  • Resources    │  │ │    Cache       │ │  │  • JSONB Metadata    │ │
│  └─────────────────┘  │ │                │ │  └─────────────────────┘  │
└───────────────────────┘ └────────────────┘ │  ┌─────────────────────┐  │
                                             │  │  Parquet (Optional) │  │
                                             │  │  • Historical Snaps │  │
                                             │  └─────────────────────┘  │
                                             └───────────────────────────┘
```

## 📁 Project Structure

```
InvestOre_Analytics/
├── backend/                    # FastAPI Python Backend
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   ├── core/              # Config, security, dependencies
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers, commodity equivalence
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Unit & integration tests
│   └── requirements.txt
├── frontend/                   # Next.js TypeScript Frontend
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # API client, utilities
│   │   └── types/             # TypeScript types
│   └── package.json
├── etl/                        # ETL Pipelines
│   ├── flows/                 # Prefect flows
│   ├── tasks/                 # Reusable tasks
│   └── config/                # Source configurations
├── infra/                      # Infrastructure
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ with TimescaleDB
- Docker & Docker Compose

### Development Setup

```bash
# Clone and setup
cd InvestOre_Analytics

# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

## 📊 Key Features

- **Peer Group Builder**: Multi-filter creation, save, share, export
- **Valuation Dashboard**: EV vs resources, EV/unit, jurisdiction risk
- **Resource Normalization**: AuEq, CuEq, Li2CO3 equivalents
- **Spatial Visualization**: Mapbox-powered project maps
- **Data Lineage**: Full provenance tracking

## 🌐 Company Coverage

The platform tracks **1,000+ mining companies** across major global exchanges:

| Exchange | Companies | Coverage |
|----------|-----------|----------|
| ASX (Australia) | 890+ | Mining & exploration focused |
| TSX/TSXV (Canada) | 66+ | Major & junior miners |
| CSE (Canada) | 40+ | Junior explorers |
| JSE (South Africa) | 29+ | African mining majors |
| NYSE/NASDAQ (US) | 25+ | Large cap producers |
| LSE (UK) | 15+ | Global diversified |

### Company Universe ETL

The ASX company universe is automatically discovered via the ASX Research API:

```bash
# Run discovery script
cd backend/scripts
python discover_asx_universe.py

# Or use Make target
make etl-asx-universe
```

## 🔐 User Roles

| Feature | Viewer (Free) | Analyst (Paid) | Admin |
|---------|---------------|----------------|-------|
| View public analytics | ✓ | ✓ | ✓ |
| Create peer groups | 3 max | Unlimited | Unlimited |
| Save peer groups | ✗ | ✓ | ✓ |
| Bulk export (CSV) | ✗ | ✓ | ✓ |
| API access | ✗ | ✓ | ✓ |
| Custom formulas | ✗ | ✓ | ✓ |
| Alerts | ✗ | ✓ | ✓ |
| Admin panel | ✗ | ✗ | ✓ |

## 📜 License

Proprietary - InvestOre Analytics © 2025
