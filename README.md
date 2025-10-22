# 🔭 Observability Starter

A production-ready **Next.js 15** observability platform demonstrating advanced systems thinking, distributed tracing, and SRE fundamentals. Perfect for CV/portfolio demonstrations.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Enabled-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Capabilities
- **📊 Real-time Logging**: Client/server log aggregation with request ID correlation
- **🔍 Distributed Tracing**: OpenTelemetry-powered traces with waterfall visualizations
- **📈 Metrics & Analytics**: P95/P99 latency tracking, histograms, and time-series data
- **⚠️ Smart Alerts**: Configurable alert rules with severity levels and thresholds
- **🎯 Error Budgets**: SLO tracking with error budget consumption monitoring
- **🔐 RBAC**: Role-based access control (Admin, Developer, Viewer)
- **📤 Data Export**: JSON/CSV export capabilities
- **⚡ Auto-refresh**: Real-time dashboard updates

### Technical Highlights
- **Request Correlation**: Every log/trace linked via unique request IDs
- **OpenTelemetry Integration**: Standard observability instrumentation
- **Modern UI**: Beautiful Tailwind CSS dashboard with Recharts visualizations
- **Type Safety**: Full TypeScript coverage
- **Database**: PostgreSQL with Prisma ORM
- **CI/CD**: GitHub Actions pipeline
- **Production Ready**: Vercel deployment configuration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 15 App                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │  API Routes  │  │  Middleware  │     │
│  │   (React)    │  │  (Handlers)  │  │ (Request ID) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenTelemetry Instrumentation                  │
│         (Automatic tracing & context propagation)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────┐  ┌────────┐  ┌─────────┐  ┌────────────────┐    │
│  │ Logs │  │ Traces │  │ Metrics │  │ Error Budgets  │    │
│  └──────┘  └────────┘  └─────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Installation

1. **Clone and install**
```bash
git clone <your-repo>
cd observability-starter
npm install
```

2. **Set up the database**
```bash
# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string
# Example: postgresql://user:password@localhost:5432/observability

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

3. **Run the development server**
```bash
npm run dev
```

4. **Generate demo data** (optional)
```bash
curl -X POST http://localhost:3000/api/demo-data \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'
```

5. **Open the dashboard**
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📁 Project Structure

```
observability-starter/
├── app/
│   ├── api/              # Route Handlers
│   │   ├── logs/         # Log ingestion endpoints
│   │   ├── traces/       # Trace ingestion endpoints
│   │   ├── metrics/      # Metrics endpoints with aggregations
│   │   ├── alerts/       # Alert rule management
│   │   ├── error-budget/ # SLO & error budget tracking
│   │   ├── users/        # User & RBAC management
│   │   └── demo-data/    # Demo data generator
│   ├── dashboard/        # Dashboard page
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── LogsPanel.tsx
│   ├── TracesPanel.tsx
│   ├── MetricsPanel.tsx
│   ├── AlertsPanel.tsx
│   └── ErrorBudgetPanel.tsx
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── telemetry.ts      # OpenTelemetry utilities
│   ├── logger.ts         # Structured logging
│   ├── rbac.ts           # Role-based access control
│   └── request-id.ts     # Request correlation
├── prisma/
│   └── schema.prisma     # Database schema
├── middleware.ts         # Request ID middleware
├── instrumentation.ts    # OpenTelemetry setup
└── .github/
    └── workflows/
        └── ci.yml        # CI/CD pipeline
```

## 🔌 API Endpoints

### Logs
- `POST /api/logs` - Ingest log event
- `GET /api/logs?level=ERROR&source=server` - Query logs with filters

### Traces
- `POST /api/traces` - Ingest distributed trace
- `GET /api/traces?traceId=abc123` - Query traces

### Metrics
- `POST /api/metrics` - Record metric
- `GET /api/metrics?name=request_duration&aggregation=p95` - Get aggregated metrics

### Alerts
- `POST /api/alerts` - Create alert rule
- `GET /api/alerts` - List alert rules

### Error Budgets
- `POST /api/error-budget` - Create/update error budget
- `GET /api/error-budget?service=api-service` - Get error budget status
- `PATCH /api/error-budget` - Update error budget metrics

### Users (RBAC)
- `POST /api/users` - Create user with role
- `GET /api/users` - List users

## 🎯 Key Demonstrations

This project showcases:

1. **Systems Thinking**: Request correlation across distributed components
2. **Observability Patterns**: Logs, metrics, traces (three pillars)
3. **SRE Fundamentals**: SLOs, error budgets, alert management
4. **Performance Engineering**: P95/P99 latency tracking
5. **Modern DX**: Type safety, CI/CD, preview deployments
6. **Security**: RBAC implementation
7. **Production Readiness**: Proper error handling, logging, monitoring

## 🚢 Deployment

### Vercel + Neon (Recommended)

1. **Create a Neon database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add DATABASE_URL
# Paste your Neon connection string

# Deploy to production
vercel --prod
```

3. **Run migrations**
```bash
# After deployment
vercel env pull
npx prisma migrate deploy
```

### Manual Deployment

1. Set `DATABASE_URL` environment variable
2. Run `npm run build`
3. Run `npx prisma migrate deploy`
4. Deploy the `.next` folder to your hosting provider

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run tests (if implemented)
npm test
```

## 📊 Database Schema

The schema includes:
- **Logs**: Structured log entries with levels and metadata
- **Traces & Spans**: Distributed tracing data
- **Metrics**: Time-series performance data
- **Alert Rules & Alerts**: Monitoring and alerting
- **Error Budgets**: SLO tracking
- **Users**: RBAC implementation

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Observability | OpenTelemetry |
| UI | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| CI/CD | GitHub Actions |
| Deployment | Vercel |
| DB Hosting | Neon |

## 🤝 Contributing

This is a portfolio/demo project, but feel free to:
- Report issues
- Suggest improvements
- Fork and customize for your needs

## 📝 License

MIT License - feel free to use this for your own portfolio/CV demos!

## 🌐 Live Demo

[Add your deployed Vercel URL here]

## 📧 Contact

[Your Name]
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

**Built with ❤️ to demonstrate advanced Next.js and observability patterns**
