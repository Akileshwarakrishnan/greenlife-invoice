import React, { useEffect, useState } from 'react';
import { automationApi } from '../services/api';
import { WorkflowLog } from '../types';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Workflow,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Layers,
  Activity,
  Zap
} from 'lucide-react';

export const Automation: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await automationApi.getStatus();
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load workflow logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async (workflowName: string) => {
    setTriggering(workflowName);
    try {
      await automationApi.trigger(workflowName, {
        custom_payload: { manual_trigger_at: new Date().toISOString() },
      });
      setStatusMessage(`Workflow '${workflowName}' dispatched to n8n webhook successfully.`);
      setTimeout(() => setStatusMessage(null), 4000);
      loadStatus();
    } catch (err: any) {
      alert('Trigger failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTriggering(null);
    }
  };

  const handleRetry = async (logId: number) => {
    try {
      await automationApi.retry(logId);
      setStatusMessage(`Retry initiated for execution #${logId}.`);
      setTimeout(() => setStatusMessage(null), 4000);
      loadStatus();
    } catch (err: any) {
      alert('Retry failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const registeredWorkflows = [
    {
      name: 'Order Processing',
      description: 'Triggered when orders are placed; orchestrates invoice calculation, inventory deduction, and notifications.',
      webhook: '/webhook/order-processing',
    },
    {
      name: 'Email Invoice Notification',
      description: 'Generates branded GreenLife email and transmits PDF invoice attachment via SMTP layer.',
      webhook: '/webhook/email-invoice',
    },
    {
      name: 'WhatsApp Notification',
      description: 'Formats customer greeting, invoice totals, UPI payment instructions, and sends via WhatsApp Cloud API.',
      webhook: '/webhook/whatsapp-notification',
    },
    {
      name: 'AI Invoice Extraction',
      description: 'Runs OCR and multimodal entity parsing on uploaded invoice vouchers and receipts.',
      webhook: '/webhook/ai-extraction',
    },
    {
      name: 'Error Handler & Admin DLQ',
      description: 'Catches system exceptions, logs tracebacks, and alerts administration without disrupting transactional queues.',
      webhook: '/webhook/workflow-error',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t('nav.automation', 'Automation & n8n Workflows')}
        subtitle="Manage asynchronous business processes, test webhook hooks, and review execution latencies."
        badge="n8n Orchestration Layer"
        actions={
          <button
            onClick={loadStatus}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#082216] hover:bg-slate-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-emerald-200 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('action.refresh', 'Refresh Telemetry')}</span>
          </button>
        }
      />

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Workflows Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-300">Registered Automation Pipelines</h2>
          <span className="text-xs text-slate-500 dark:text-emerald-400 font-medium">5 active workflows</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registeredWorkflows.map((w) => (
            <div
              key={w.name}
              className="bg-white dark:bg-[#082216] p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                      Live
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-emerald-400/70 bg-slate-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-emerald-800/40">
                    {w.webhook}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {w.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-1.5 leading-relaxed">{w.description}</p>
              </div>

              <button
                onClick={() => handleTrigger(w.name)}
                disabled={triggering === w.name}
                className="w-full py-2 bg-emerald-50/60 hover:bg-emerald-100/70 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{triggering === w.name ? 'Dispatched...' : 'Trigger Webhook'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Logs Table */}
      <div className="bg-white dark:bg-[#082216] rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-50">Workflow Execution Telemetry</h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">Real-time trace logs of dispatch events, status, and latency.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300 bg-slate-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-emerald-800/40">
            {logs.length} executions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Execution ID</th>
                <th className="px-5 py-3.5">Workflow Name</th>
                <th className="px-5 py-3.5">Trigger Source</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Duration</th>
                <th className="px-5 py-3.5">Time (IST)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading telemetry logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No workflow executions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-500 text-[11px]">
                      {log.execution_id || `#${log.id}`}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{log.workflow_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{log.trigger_source}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-600 font-medium">
                      {log.duration_ms.toFixed(1)} ms
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(log.started_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.status === 'failed' ? (
                        <button
                          onClick={() => handleRetry(log.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
