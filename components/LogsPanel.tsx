'use client';

import { useState, useEffect } from 'react';
import { Download, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
  id: string;
  requestId: string;
  timestamp: string;
  level: string;
  message: string;
  source: string;
  metadata?: any;
  traceId?: string;
}

export function LogsPanel() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [timeRange, setTimeRange] = useState('1h');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.append('level', levelFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      
      const now = new Date();
      const ranges: Record<string, number> = {
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
      };
      const startTime = new Date(now.getTime() - ranges[timeRange]);
      params.append('startTime', startTime.toISOString());
      
      const response = await fetch(`/api/logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [levelFilter, sourceFilter, timeRange]);

  const filteredLogs = logs.filter((log) =>
    log.message.toLowerCase().includes(search.toLowerCase()) ||
    log.requestId.toLowerCase().includes(search.toLowerCase())
  );

  const exportLogs = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${Date.now()}.json`;
      a.click();
    } else {
      const headers = ['Timestamp', 'Level', 'Source', 'Request ID', 'Message'];
      const rows = filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.source,
        log.requestId,
        log.message.replace(/"/g, '""'),
      ]);
      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${Date.now()}.csv`;
      a.click();
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">All Levels</option>
          <option value="DEBUG">Debug</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
          <option value="FATAL">Fatal</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">All Sources</option>
          <option value="client">Client</option>
          <option value="server">Server</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="15m">Last 15 minutes</option>
          <option value="1h">Last hour</option>
          <option value="6h">Last 6 hours</option>
          <option value="24h">Last 24 hours</option>
        </select>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <div className="relative group">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              onClick={() => exportLogs('json')}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
            >
              JSON
            </button>
            <button
              onClick={() => exportLogs('csv')}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-400 mb-4">
        {filteredLogs.length} logs {search && `(filtered from ${logs.length})`}
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss.SSS')}
                  </span>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {log.source}
                  </span>
                  {log.traceId && (
                    <span className="text-purple-400 text-xs font-mono">
                      trace: {log.traceId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <div className="text-white mb-2">{log.message}</div>
                <div className="text-xs text-slate-400 font-mono">
                  Request ID: {log.requestId}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLevelColor(level: string) {
  switch (level) {
    case 'DEBUG':
      return 'bg-slate-600 text-slate-200';
    case 'INFO':
      return 'bg-blue-600 text-blue-100';
    case 'WARN':
      return 'bg-yellow-600 text-yellow-100';
    case 'ERROR':
      return 'bg-red-600 text-red-100';
    case 'FATAL':
      return 'bg-red-900 text-red-100';
    default:
      return 'bg-slate-600 text-slate-200';
  }
}

