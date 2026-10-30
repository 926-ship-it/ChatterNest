import React, { useState } from 'react';
import {
  X,
  Cpu,
  KeyRound,
  Check,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Server,
  Layers,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ApiProviderType, UserApiConfig } from '../types/document';
import { API_PROVIDER_PRESETS } from '../data/apiPresets';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: UserApiConfig;
  onSaveConfig: (newConfig: UserApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onSaveConfig,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<ApiProviderType>(apiConfig.provider);
  const [endpoint, setEndpoint] = useState(apiConfig.endpoint);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [model, setModel] = useState(apiConfig.model);
  const [customModelInput, setCustomModelInput] = useState('');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [autoFallbackToFree, setAutoFallbackToFree] = useState(
    apiConfig.autoFallbackToFree !== false
  );
  const [showKey, setShowKey] = useState(false);

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    translation?: string;
    latencyMs?: number;
    error?: string;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentPreset =
    API_PROVIDER_PRESETS.find((p) => p.id === selectedProvider) || API_PROVIDER_PRESETS[0];

  // Handle switching provider card
  const handleSelectProvider = (providerId: ApiProviderType) => {
    setSelectedProvider(providerId);
    const preset = API_PROVIDER_PRESETS.find((p) => p.id === providerId);
    if (preset) {
      setEndpoint(preset.defaultEndpoint);
      setModel(preset.defaultModel);
      setIsCustomModel(false);
      setCustomModelInput('');
      setTestResult(null);

      // If user had existing key for this provider or if switching back to current
      if (providerId === apiConfig.provider) {
        setApiKey(apiConfig.apiKey);
      } else if (!preset.requiresKey) {
        setApiKey('');
      }
    }
  };

  // Test the current configuration via backend proxy
  const handleTestConnection = async () => {
    // If the provider requires an API Key but user has not typed one yet
    if (currentPreset.requiresKey && !apiKey.trim()) {
      setTestResult({
        success: false,
        error: `您当前选择了【${currentPreset.name}】，该服务商需要先填入 API Key 才能调用。请在下方输入框填入您的密钥；若暂无密钥，请切换至【免Key免费公共翻译】或【系统默认】即可直接使用。`,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const effectiveModel = isCustomModel && customModelInput.trim() ? customModelInput.trim() : model;

    try {
      const res = await fetch('/api/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiConfig: {
            provider: selectedProvider,
            endpoint: endpoint.trim(),
            apiKey: apiKey.trim(),
            model: effectiveModel,
          },
          sampleText: 'The nightingale sang sweet songs of eternal devotion in the oak tree.',
          targetLang: 'Chinese (Simplified)',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setTestResult({
          success: false,
          error: data.error || '连接测试未成功，请检查 API 接口地址或 Key 是否有效。',
          latencyMs: data.latencyMs,
        });
        return;
      }

      setTestResult({
        success: true,
        translation: data.translation,
        latencyMs: data.latencyMs,
        message: data.message,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || '网络或接口通信异常，请重试。',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const effectiveModel = isCustomModel && customModelInput.trim() ? customModelInput.trim() : model;
    const newConfig: UserApiConfig = {
      provider: selectedProvider,
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim(),
      model: effectiveModel,
      autoFallbackToFree,
    };
    onSaveConfig(newConfig);
    onClose();
  };

  const handleResetToDefault = () => {
    handleSelectProvider('gemini_default');
    setApiKey('');
    setAutoFallbackToFree(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl bg-[#FAF8F5] dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-900/10 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-[#990000] text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  翻译 API 服务与免费备选设置
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  多引擎容灾
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                支持免Key公共翻译、DeepSeek、Groq、硅基流动、OpenRouter 及自定义接口
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Active Status Banner */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-100">
                    当前使用引擎:
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 truncate">
                    {currentPreset.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-300 border border-blue-200/60 dark:border-zinc-700">
                    {isCustomModel && customModelInput ? customModelInput : model}
                  </span>
                </div>
                <p className="text-[11px] text-blue-900/70 dark:text-blue-200/70 truncate mt-0.5">
                  {currentPreset.description}
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Zap className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? '正在测试...' : '测试当前连接'}</span>
            </button>
          </div>

          {/* Intelligent Auto-Fallback Feature (User requirement: handle Gemini quota exhaustion) */}
          <div className="rounded-xl border border-emerald-300/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 transition">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFallbackToFree}
                onChange={(e) => setAutoFallbackToFree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>启用智能自动容灾 (推荐开启：配额耗尽无感切换)</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                  当所选 AI 模型配额用尽（如 Gemini / DeepSeek 遇到 429 请求限流）或网络异常时，系统将<strong>自动无缝切换到免Key公共翻译备选引擎</strong>继续翻译剩余段落，确保您的阅读和同人追文绝不被突然打断。
                </p>
              </div>
            </label>
          </div>

          {/* Provider Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-zinc-400" />
                <span>选择翻译引擎服务商 (点击切换)</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                支持 8+ 款主流与公共 API
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {API_PROVIDER_PRESETS.map((preset) => {
                const isSelected = selectedProvider === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectProvider(preset.id)}
                    className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-white dark:bg-zinc-800 shadow-md ring-2 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/70 hover:border-blue-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {preset.id === 'mymemory_free' && (
                          <Globe className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {preset.id === 'deepseek' && (
                          <Flame className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        {preset.id === 'groq' && (
                          <Zap className="h-3.5 w-3.5 text-orange-600" />
                        )}
                        {preset.id === 'gemini_default' && (
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        )}
                        <span>{preset.name}</span>
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold border ${preset.badgeColor} shrink-0`}
                      >
                        {preset.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>默认模型: {preset.defaultModel}</span>
                      {isSelected ? (
                        <span className="text-blue-600 font-bold flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> 已选
                        </span>
                      ) : (
                        <span className="group-hover:text-zinc-600">点击配置</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuration Detail Form */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/90 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {currentPreset.name} 参数配置
                </h3>
              </div>

              {currentPreset.keyHelpUrl && (
                <a
                  href={currentPreset.keyHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  <span>{currentPreset.keyHelpText || '获取 API Key'}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* 1. API Base URL Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  API 接口服务地址 (Base URL)
                </label>
                {endpoint !== currentPreset.defaultEndpoint && (
                  <button
                    onClick={() => setEndpoint(currentPreset.defaultEndpoint)}
                    className="text-[11px] text-zinc-400 hover:text-blue-600 flex items-center gap-0.5"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> 恢复默认地址
                  </button>
                )}
              </div>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none transition"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                常见的兼容接口将自动代理请求至该地址的 <code className="font-mono text-zinc-600 dark:text-zinc-300">/chat/completions</code> 路径。
              </p>
            </div>

            {/* 2. API Key Input (if required) */}
            {currentPreset.requiresKey ? (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-amber-600" />
                    <span>API Key (密钥)</span>
                    <span className="text-[10px] text-amber-600 font-normal">（必填）</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    仅保存在本地设备，不上传云端
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentPreset.keyPlaceholder || 'sk-...'}
                    className="w-full pl-3 pr-20 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none transition"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      title={showKey ? '隐藏密钥' : '显示密钥'}
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => setApiKey('')}
                        className="text-[10px] text-zinc-400 hover:text-red-600 px-1"
                        title="清空"
                      >
                        清空
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  当前引擎<strong>无需填写任何 API Key</strong>，开箱即用，可直接用于阅读伴读或应对配额耗尽时的备选。
                </span>
              </div>
            )}

            {/* 3. Model Selector */}
            {currentPreset.availableModels.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  模型名称 (Model)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentPreset.availableModels.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModel(m);
                          setIsCustomModel(false);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                          !isCustomModel && model === m
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 text-zinc-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomModel(true)}
                      className={`px-2.5 py-1 rounded-md text-xs transition ${
                        isCustomModel
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 text-zinc-600'
                      }`}
                    >
                      手动指定模型...
                    </button>
                  </div>

                  {isCustomModel && (
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      placeholder="例如: deepseek-chat 或 qwen2.5-72b-instruct"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Test Connection Result Feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs animate-in fade-in ${
                  testResult.success
                    ? 'border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-red-300 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>{testResult.success ? 'API 连接与翻译测试成功！' : '连接测试失败'}</span>
                  </span>
                  {testResult.latencyMs !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/70 dark:bg-zinc-800 border">
                      响应耗时: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                {testResult.success && testResult.translation && (
                  <div className="mt-1 text-[11px] bg-white/60 dark:bg-zinc-900/60 p-2 rounded border border-emerald-200/60 dark:border-emerald-900/40 font-serif">
                    <span className="text-zinc-500 mr-1">测试句译文:</span>
                    <span>“{testResult.translation}”</span>
                  </div>
                )}
                {testResult.error && (
                  <div className="mt-1.5 space-y-2">
                    <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300">
                      {testResult.error}
                    </p>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-red-200/60 dark:border-red-900/40 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('mymemory_free')}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-2xs transition"
                      >
                        一键切换为免Key免费翻译 (零门槛)
                      </button>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-2.5 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-[11px] transition"
                      >
                        恢复默认 Gemini
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy & Storage Guarantee */}
          <div className="rounded-xl p-3 bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>安全与私密性保证</span>
            </div>
            <p>
              ChatterNest 严格恪守 100% 本地优先原则。您在此处填写的 API Key 与请求地址仅保存在您当前设备浏览器的 LocalStorage 中，通过本地安全服务中转，绝不会存储至任何云端第三方数据库。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-amber-900/10 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
          <button
            onClick={handleResetToDefault}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>恢复默认 (Gemini)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition"
            >
              {isTesting ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-[#990000] hover:bg-[#800000] text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              保存并应用配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
