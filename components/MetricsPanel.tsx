'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricData {
  timestamp: string;
  value: number;
}

export function MetricsPanel() {
  const [latencyData, setLatencyData] = useState<MetricData[]>([]);
  const [errorRateData, setErrorRateData] = useState<MetricData[]>([]);
  const [p95Latency, setP95Latency] = useState<number>(0);
  const [p99Latency, setP99Latency] = useState<number>(0);
  const [avgLatency, setAvgLatency] = useState<number>(0);

  const fetchMetrics = async () => {
    try {
      // Fetch P95 latency
      const p95Response = await fetch('/api/metrics?name=request_duration&aggregation=p95');
      const p95Data = await p95Response.json();
      setP95Latency(p95Data.value || 0);

      // Fetch P99 latency
      const p99Response = await fetch('/api/metrics?name=request_duration&aggregation=p99');
      const p99Data = await p99Response.json();
      setP99Latency(p99Data.value || 0);

      // Fetch average latency
      const avgResponse = await fetch('/api/metrics?name=request_duration&aggregation=avg');
      const avgData = await avgResponse.json();
      setAvgLatency(avgData.value || 0);

      // Fetch latency time series (mocked for demo)
      const mockLatency = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
        value: Math.random() * 200 + 50,
      }));
      setLatencyData(mockLatency);

      // Fetch error rate time series (mocked for demo)
      const mockErrorRate = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
        value: Math.random() * 5,
      }));
      setErrorRateData(mockErrorRate);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="P95 Latency"
          value={`${p95Latency.toFixed(2)}ms`}
          color="text-blue-400"
        />
        <MetricCard
          title="P99 Latency"
          value={`${p99Latency.toFixed(2)}ms`}
          color="text-purple-400"
        />
        <MetricCard
          title="Avg Latency"
          value={`${avgLatency.toFixed(2)}ms`}
          color="text-green-400"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Request Latency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorLatency)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Error Rate (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="text-sm text-slate-400 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

