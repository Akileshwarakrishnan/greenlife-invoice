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
    <div className="space-y-6 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={t('nav.automation', 'Automation & n8n Workflows')}
        subtitle="Manage asynchronous business processes, test webhook hooks, and review execution latencies."
        badge="n8n Orchestration Layer"
        actions={
          <button
            onClick={loadStatus}
            className="flex items-center space-x-1.5 px-3.5 py-2 border font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            style={{ background: 'white', borderColor: '#EEEAE0', color: '#4A4740' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: '#8C8880' }} />
            <span>{t('action.refresh', 'Refresh Telemetry')}</span>
          </button>
        }
      />

      {statusMessage && (
        <div className="p-3.5 border text-xs rounded-2xl flex items-center space-x-2" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Workflows Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1C1A15' }}>Registered Automation Pipelines</h2>
          <span className="text-xs font-medium" style={{ color: '#8C8880' }}>5 active workflows</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registeredWorkflows.map((w) => (
            <div
              key={w.name}
              className="p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all"
              style={{ background: 'white', borderColor: '#EEEAE0' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2D6A4F'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EEEAE0'}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2D6A4F' }}></span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
                      Live
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                    {w.webhook}
                  </span>
                </div>
                <h3 className="font-bold text-sm transition-colors" style={{ color: '#1C1A15' }}>
                  {w.name}
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#8C8880' }}>{w.description}</p>
              </div>

              <button
                onClick={() => handleTrigger(w.name)}
                disabled={triggering === w.name}
                className="w-full py-2 border rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                <span>{triggering === w.name ? 'Dispatched...' : 'Trigger Webhook'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Logs Table */}
      <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Workflow Execution Telemetry</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>Real-time trace logs of dispatch events, status, and latency.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
            {logs.length} executions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
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
            <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#8C8880' }}>
                    Loading telemetry logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#8C8880' }}>
                    No workflow executions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-[11px]" style={{ color: '#8C8880' }}>
                      {log.execution_id || `#${log.id}`}
                    </td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: '#1C1A15' }}>{log.workflow_name}</td>
                    <td className="px-5 py-3.5" style={{ color: '#8C8880' }}>{log.trigger_source}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge status={log.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium" style={{ color: '#4A4740' }}>
                      {log.duration_ms.toFixed(1)} ms
                    </td>
                    <td className="px-5 py-3.5" style={{ color: '#8C8880' }}>
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
                          className="px-2.5 py-1 rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                          style={{ background: '#FDF3E3', color: '#C68B3A' }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span style={{ color: '#EEEAE0' }}>—</span>
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
