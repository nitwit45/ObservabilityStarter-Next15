'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  threshold: number;
  metric: string;
  enabled: boolean;
  severity: string;
  alerts: Alert[];
}

interface Alert {
  id: string;
  triggeredAt: string;
  resolvedAt?: string;
  status: string;
  value: number;
  message: string;
}

export function AlertsPanel() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: '',
    threshold: '',
    metric: '',
    severity: 'MEDIUM',
  });

  const fetchAlertRules = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      setAlertRules(data.alertRules || []);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  useEffect(() => {
    fetchAlertRules();
  }, []);

  const createAlertRule = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          condition: '',
          threshold: '',
          metric: '',
          severity: 'MEDIUM',
        });
        fetchAlertRules();
      }
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Alert Rules</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Alert Rule</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Rule Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Metric (e.g., error_rate)"
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Condition (e.g., >)"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Threshold"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 md:col-span-2"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createAlertRule}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {alertRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{rule.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                    {rule.severity}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.enabled
                        ? 'bg-green-600 text-green-100'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-slate-400 text-sm mb-2">{rule.description}</p>
                )}
                <div className="text-sm text-slate-400">
                  <span className="font-mono">
                    {rule.metric} {rule.condition} {rule.threshold}
                  </span>
                </div>
              </div>
            </div>

            {rule.alerts.length > 0 && (
              <div className="border-t border-slate-700 pt-3 mt-3">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Recent Alerts</h4>
                <div className="space-y-2">
                  {rule.alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {alert.status === 'FIRING' ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : alert.status === 'RESOLVED' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-slate-400">
                        {format(new Date(alert.triggeredAt), 'MMM dd, HH:mm:ss')}
                      </span>
                      <span className="text-slate-300">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {alertRules.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          No alert rules configured. Create one to get started.
        </div>
      )}
    </div>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'LOW':
      return 'bg-blue-600 text-blue-100';
    case 'MEDIUM':
      return 'bg-yellow-600 text-yellow-100';
    case 'HIGH':
      return 'bg-orange-600 text-orange-100';
    case 'CRITICAL':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-slate-600 text-slate-300';
  }
}

