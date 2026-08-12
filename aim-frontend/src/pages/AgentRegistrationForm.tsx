import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bot,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Lock
} from 'lucide-react';

import { useRegisterAgent } from '../hooks/useAgents';
import { useClockStore } from '../stores/clockStore';
import { useToastStore } from '../stores/toastStore';
import { SCOPE_CATALOG } from '../lib/scopeCatalog';
import { formatDate } from '../lib/utils';
import ScopeChip from '../components/agents/ScopeChip';
import CredentialRevealModal from '../components/credentials/CredentialRevealModal';
import ErrorBanner from '../components/shared/ErrorBanner';
import type { AgentIdentity } from '../types/agent';
import type { CredentialWithToken } from '../types/credential';

const TEAMS = [
  'Platform',
  'Data Eng',
  'Growth',
  'Security',
  'Support-Bot Ops',
  'Finance-Automation',
] as const;

const schema = z.object({
  name: z
    .string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  purpose: z
    .string()
    .min(10, 'Minimum 10 characters required')
    .max(500, 'Maximum 500 characters'),
  owningTeam: z.enum(TEAMS, { message: 'Please select an owning team' }),
  requestedScopes: z.array(z.string()).min(1, 'Select at least one scope'),
  requestedLifetimeDays: z.union([z.literal(7), z.literal(30), z.literal(90)]),
});

type FormValues = z.infer<typeof schema>;

export const AgentRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const simNow = useClockStore((s) => s.simNow);
  const pushToast = useToastStore((s) => s.push);

  const registerMutation = useRegisterAgent();

  const [pendingSensitiveScopes, setPendingSensitiveScopes] = useState<Set<string>>(new Set());
  const [createdResult, setCreatedResult] = useState<{
    agent: AgentIdentity;
    credential: CredentialWithToken;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      purpose: '',
      owningTeam: 'Data Eng',
      requestedScopes: [],
      requestedLifetimeDays: 30,
    },
  });

  const watchName = watch('name');
  const watchOwningTeam = watch('owningTeam');
  const watchPurpose = watch('purpose') || '';
  const watchScopes = watch('requestedScopes') || [];
  const watchLifetime = watch('requestedLifetimeDays') || 30;

  // Group scopes by category
  const groupedScopes = useMemo(() => {
    const groups: Record<string, typeof SCOPE_CATALOG> = {};
    for (const scope of SCOPE_CATALOG) {
      if (!groups[scope.category]) groups[scope.category] = [];
      groups[scope.category].push(scope);
    }
    return groups;
  }, []);

  // Compute expiration date for preview
  const previewExpiry = useMemo(() => {
    const nowMs = new Date(simNow).getTime();
    const expiryMs = nowMs + watchLifetime * 86400000;
    return formatDate(new Date(expiryMs).toISOString());
  }, [simNow, watchLifetime]);

  // Check if sensitive scopes selected
  const hasSensitiveScopes = useMemo(() => {
    return watchScopes.some((id) =>
      SCOPE_CATALOG.find((s) => s.id === id)?.sensitive
    );
  }, [watchScopes]);

  const handleScopeToggle = (scopeId: string, sensitive: boolean) => {
    const isChecked = watchScopes.includes(scopeId);

    if (isChecked) {
      // Uncheck directly
      setValue(
        'requestedScopes',
        watchScopes.filter((id) => id !== scopeId),
        { shouldValidate: true }
      );
      return;
    }

    if (sensitive) {
      // Delay sensitive check by 2s and show toast
      setPendingSensitiveScopes((prev) => new Set(prev).add(scopeId));
      pushToast({
        title: 'Approval Required',
        description: 'requires approval — auto-approved in demo mode',
        variant: 'default',
      });

      setTimeout(() => {
        setPendingSensitiveScopes((prev) => {
          const next = new Set(prev);
          next.delete(scopeId);
          return next;
        });
        setValue('requestedScopes', [...watchScopes, scopeId], {
          shouldValidate: true,
        });
      }, 2000);
    } else {
      setValue('requestedScopes', [...watchScopes, scopeId], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await registerMutation.mutateAsync(values);
      setCreatedResult(res.data);
    } catch (err: any) {
      // Error handled by registerMutation error state
    }
  };

  const handleModalClose = () => {
    if (createdResult) {
      navigate(`/agents/${createdResult.agent.agentId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Register Agent Identity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue machine-to-machine credentials with scoped permissions and strict lifetimes.
          </p>
        </div>
      </div>

      {registerMutation.error && (
        <ErrorBanner
          message={
            (registerMutation.error as any)?.response?.data?.error?.message ||
            (registerMutation.error as Error).message ||
            'Failed to register agent identity.'
          }
        />
      )}

      {/* Main 2-Column Grid */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (60% -> 7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {/* Agent Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. billing-reconciler-bot"
              {...register('name')}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Unique identifier slug. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Purpose */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Purpose & Scope Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-mono text-slate-400">
                {watchPurpose.length} / 500
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Describe what automated workflow this agent executes and why it requires access..."
              {...register('purpose')}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.purpose
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.purpose && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.purpose.message}</p>
            )}
          </div>

          {/* Owning Team */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Owning Team <span className="text-red-500">*</span>
            </label>
            <Controller
              name="owningTeam"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.owningTeam && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.owningTeam.message}</p>
            )}
          </div>

          {/* Credential Lifetime */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Credential Lifetime <span className="text-red-500">*</span>
            </label>
            <Controller
              name="requestedLifetimeDays"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {[7, 30, 90].map((days) => {
                    const isSelected = field.value === days;
                    return (
                      <label
                        key={days}
                        onClick={() => field.onChange(days)}
                        className={`cursor-pointer bg-slate-50 border rounded-lg p-3 flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="lifetime"
                          checked={isSelected}
                          onChange={() => field.onChange(days)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{days} Days</div>
                          <div className="text-[11px] text-slate-500">
                            {days === 7 ? 'Short-lived' : days === 30 ? 'Standard' : 'Extended'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.requestedLifetimeDays && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.requestedLifetimeDays.message}
              </p>
            )}
          </div>

          {/* Requested Scopes (Grouped) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Requested Scopes <span className="text-red-500">*</span>
              </label>
              {errors.requestedScopes && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.requestedScopes.message}
                </span>
              )}
            </div>

            <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              {Object.entries(groupedScopes).map(([category, scopes]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wide pt-1">
                    {category}
                  </h4>
                  <div className="space-y-1.5">
                    {scopes.map((scope) => {
                      const isChecked = watchScopes.includes(scope.id);
                      const isPending = pendingSensitiveScopes.has(scope.id);

                      return (
                        <label
                          key={scope.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50/60 border-blue-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          } ${isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className="pt-0.5">
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isPending}
                                onChange={() => handleScopeToggle(scope.id, scope.sensitive)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{scope.id}</span>
                              {scope.sensitive && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded border border-amber-200 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Sensitive
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 mt-0.5">{scope.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/agents')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register Agent</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (40% -> 5 cols) Live Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-lg sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" /> Identity Preview
              </h3>
              <span className="px-2 py-0.5 bg-blue-900/60 text-blue-300 text-[10px] font-mono rounded border border-blue-700/50">
                LIVE
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Name</span>
                <span className="font-mono font-bold text-white">
                  {watchName || 'doc-summarizer-bot'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Owning Team</span>
                <span className="font-semibold text-blue-300">{watchOwningTeam}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Expires</span>
                <span className="font-mono text-amber-300">{previewExpiry}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Lifetime</span>
                <span className="font-semibold text-slate-200">{watchLifetime} days</span>
              </div>
            </div>

            {/* Scopes Section */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-semibold text-slate-400">
                Scopes granted ({watchScopes.length})
              </div>
              {watchScopes.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  No scopes selected yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {watchScopes.map((scope) => (
                    <ScopeChip key={scope} scope={scope} />
                  ))}
                </div>
              )}
            </div>

            {/* Sensitive Scope Warning Callout */}
            {hasSensitiveScopes && (
              <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-200 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-300">Contains sensitive scopes</div>
                  <div className="text-[11px] text-amber-200/80 mt-0.5">
                    This identity requests high-privilege access. Automatic audit logging will be enforced.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Credential Reveal Modal on Success */}
      {createdResult && (
        <CredentialRevealModal
          open={!!createdResult}
          credential={createdResult.credential}
          agentName={createdResult.agent.name}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AgentRegistrationForm;
