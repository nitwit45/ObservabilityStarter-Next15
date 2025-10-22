'use client';

import { useState } from 'react';
import { LogsPanel } from '@/components/LogsPanel';
import { TracesPanel } from '@/components/TracesPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { ErrorBudgetPanel } from '@/components/ErrorBudgetPanel';
import { Activity, LineChart, BarChart3, AlertCircle, Target } from 'lucide-react';

type Tab = 'logs' | 'traces' | 'metrics' | 'alerts' | 'error-budget';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('logs');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Observability Dashboard</h1>
          <p className="text-slate-400">Monitor, trace, and analyze your application</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton
            active={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
            icon={<Activity className="w-4 h-4" />}
            label="Logs"
          />
          <TabButton
            active={activeTab === 'traces'}
            onClick={() => setActiveTab('traces')}
            icon={<LineChart className="w-4 h-4" />}
            label="Traces"
          />
          <TabButton
            active={activeTab === 'metrics'}
            onClick={() => setActiveTab('metrics')}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Metrics"
          />
          <TabButton
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
            icon={<AlertCircle className="w-4 h-4" />}
            label="Alerts"
          />
          <TabButton
            active={activeTab === 'error-budget'}
            onClick={() => setActiveTab('error-budget')}
            icon={<Target className="w-4 h-4" />}
            label="Error Budget"
          />
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800">
          {activeTab === 'logs' && <LogsPanel />}
          {activeTab === 'traces' && <TracesPanel />}
          {activeTab === 'metrics' && <MetricsPanel />}
          {activeTab === 'alerts' && <AlertsPanel />}
          {activeTab === 'error-budget' && <ErrorBudgetPanel />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
        ${
          active
            ? 'bg-purple-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

