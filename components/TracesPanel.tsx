'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';

interface Span {
  id: string;
  spanId: string;
  name: string;
  kind: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  attributes?: any;
  parentId?: string;
}

interface Trace {
  id: string;
  traceId: string;
  requestId: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  spans: Span[];
}

export function TracesPanel() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchTraces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/traces');
      const data = await response.json();
      setTraces(data.traces || []);
    } catch (error) {
      console.error('Error fetching traces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, []);

  const toggleTrace = (traceId: string) => {
    const newExpanded = new Set(expandedTraces);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedTraces(newExpanded);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Distributed Traces</h2>
        <button
          onClick={fetchTraces}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {traces.map((trace) => (
          <div
            key={trace.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => toggleTrace(trace.traceId)}
            >
              <div className="flex items-center gap-3">
                {expandedTraces.has(trace.traceId) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-medium">{trace.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trace.status === 'ok'
                          ? 'bg-green-600 text-green-100'
                          : 'bg-red-600 text-red-100'
                      }`}
                    >
                      {trace.status}
                    </span>
                    {trace.duration !== null && (
                      <span className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock className="w-3 h-3" />
                        {trace.duration}ms
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="font-mono">Trace: {trace.traceId.slice(0, 16)}</span>
                    <span>Request: {trace.requestId}</span>
                    <span>{format(new Date(trace.startTime), 'MMM dd, HH:mm:ss')}</span>
                    <span>{trace.spans.length} spans</span>
                  </div>
                </div>
              </div>
            </div>

            {expandedTraces.has(trace.traceId) && (
              <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Span Waterfall</h3>
                <div className="space-y-1">
                  {trace.spans
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((span, idx) => {
                      const traceStart = new Date(trace.startTime).getTime();
                      const spanStart = new Date(span.startTime).getTime();
                      const spanDuration = span.duration || 0;
                      const totalDuration = trace.duration || 1000;
                      const offsetPercent = ((spanStart - traceStart) / totalDuration) * 100;
                      const widthPercent = (spanDuration / totalDuration) * 100;

                      return (
                        <div key={span.id} className="relative">
                          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                            <span>{span.name}</span>
                            <span className="text-slate-500">{spanDuration}ms</span>
                          </div>
                          <div className="relative h-6 bg-slate-800 rounded">
                            <div
                              className="absolute h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded flex items-center px-2"
                              style={{
                                left: `${offsetPercent}%`,
                                width: `${Math.max(widthPercent, 2)}%`,
                              }}
                            >
                              <span className="text-xs text-white truncate">{span.kind}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {traces.length === 0 && !loading && (
        <div className="text-center text-slate-400 py-12">No traces found</div>
      )}
    </div>
  );
}

