import Link from 'next/link';
import { Activity, LineChart, AlertCircle, Shield, Database, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Observability <span className="text-purple-400">Starter</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Production-ready monitoring, tracing, and alerting for Next.js applications
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Open Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="Real-time Logging"
            description="Correlate client and server logs with request IDs for complete visibility"
          />
          <FeatureCard
            icon={<LineChart className="w-8 h-8" />}
            title="Distributed Tracing"
            description="OpenTelemetry-powered traces with waterfall visualizations and span analysis"
          />
          <FeatureCard
            icon={<AlertCircle className="w-8 h-8" />}
            title="Smart Alerts"
            description="Configure alert rules with thresholds and severity levels"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="RBAC Security"
            description="Role-based access control for admin, developer, and viewer roles"
          />
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Error Budgets"
            description="Track SLOs with error budget consumption and remaining capacity"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="P95 Latency"
            description="Monitor performance with percentile metrics and histograms"
          />
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Tech Stack</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TechBadge text="Next.js 15" />
            <TechBadge text="TypeScript" />
            <TechBadge text="PostgreSQL" />
            <TechBadge text="Prisma" />
            <TechBadge text="OpenTelemetry" />
            <TechBadge text="Tailwind CSS" />
            <TechBadge text="Recharts" />
            <TechBadge text="Vercel" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-colors">
      <div className="text-purple-400 mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function TechBadge({ text }: { text: string }) {
  return (
    <div className="bg-purple-600/20 border border-purple-500/30 rounded-md px-4 py-2 text-purple-300 font-medium text-center">
      {text}
    </div>
  );
}
