'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ErrorBudget {
  id: string;
  service: string;
  period: string;
  targetSlo: number;
  consumed: number;
  remaining: number;
  totalRequests: number;
  errorRequests: number;
  lastCalculated: string;
}

export function ErrorBudgetPanel() {
  const [errorBudgets, setErrorBudgets] = useState<ErrorBudget[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    period: '30d',
    targetSlo: '99.9',
  });

  const fetchErrorBudgets = async () => {
    try {
      const response = await fetch('/api/error-budget');
      const data = await response.json();
      setErrorBudgets(data.errorBudgets || []);
    } catch (error) {
      console.error('Error fetching error budgets:', error);
    }
  };

  useEffect(() => {
    fetchErrorBudgets();
  }, []);

  const createErrorBudget = async () => {
    try {
      const response = await fetch('/api/error-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ service: '', period: '30d', targetSlo: '99.9' });
        fetchErrorBudgets();
      }
    } catch (error) {
      console.error('Error creating error budget:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Error Budgets & SLOs</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Budget
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Error Budget</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Service Name"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
            <input
              type="number"
              step="0.1"
              placeholder="Target SLO (%)"
              value={formData.targetSlo}
              onChange={(e) => setFormData({ ...formData, targetSlo: e.target.value })}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
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
              onClick={createErrorBudget}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {errorBudgets.map((budget) => {
          const errorRate = budget.totalRequests > 0
            ? ((budget.errorRequests / budget.totalRequests) * 100).toFixed(3)
            : '0.000';
          const currentSlo = budget.totalRequests > 0
            ? (((budget.totalRequests - budget.errorRequests) / budget.totalRequests) * 100).toFixed(3)
            : '100.000';
          const isHealthy = budget.remaining > 20;
          const isCritical = budget.remaining < 10;

          return (
            <div
              key={budget.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{budget.service}</h3>
                  <p className="text-slate-400 text-sm">Period: {budget.period}</p>
                </div>
                {isHealthy ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : isCritical ? (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-yellow-400" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Target SLO</span>
                    <span className="text-white font-semibold">{budget.targetSlo}%</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Current SLO</span>
                    <span className={`font-semibold ${parseFloat(currentSlo) >= budget.targetSlo ? 'text-green-400' : 'text-red-400'}`}>
                      {currentSlo}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Error Rate</span>
                    <span className="text-slate-300">{errorRate}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Budget Remaining</span>
                    <span className={`font-semibold ${isCritical ? 'text-red-400' : isHealthy ? 'text-green-400' : 'text-yellow-400'}`}>
                      {budget.remaining.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isCritical
                          ? 'bg-red-500'
                          : isHealthy
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.max(budget.remaining, 0)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Total Requests</div>
                    <div className="text-white font-semibold">{budget.totalRequests.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Error Requests</div>
                    <div className="text-red-400 font-semibold">{budget.errorRequests.toLocaleString()}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Last updated: {format(new Date(budget.lastCalculated), 'MMM dd, HH:mm:ss')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errorBudgets.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          No error budgets configured. Create one to track your SLOs.
        </div>
      )}
    </div>
  );
}

