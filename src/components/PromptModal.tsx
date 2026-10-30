import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Play,
  Bookmark,
  Layers,
  HelpCircle,
  FileCode,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import { PromptTemplate, GlossaryItem } from '../types/document';
import { DEFAULT_PROMPT_TEMPLATES } from '../data/presets';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (template: PromptTemplate) => void;
  customTemplates: PromptTemplate[];
  onSaveCustomTemplate: (template: PromptTemplate) => void;
  onDeleteCustomTemplate: (id: string) => void;
  glossary: GlossaryItem[];
  onUpdateGlossary: (glossary: GlossaryItem[]) => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  customTemplates,
  onSaveCustomTemplate,
  onDeleteCustomTemplate,
  glossary,
  onUpdateGlossary,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'glossary' | 'tester'>('templates');

  // New/Editing template state
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<PromptTemplate>({
    id: '',
    name: '',
    badge: '自定义偏好',
    description: '',
    systemDirective: '',
    stylePreference: 'faithfulness_elegance',
    isCustom: true,
  });

  // Glossary form state
  const [newTerm, setNewTerm] = useState('');
  const [newTranslation, setNewTranslation] = useState('');

  // Tester state
  const [testSampleText, setTestSampleText] = useState(
    'The autonomous pipeline fine-tunes large language models without zero-shot hallucination.'
  );
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');

  if (!isOpen) return null;

  const allTemplates = [...DEFAULT_PROMPT_TEMPLATES, ...customTemplates];
  const activeTemplate = allTemplates.find((t) => t.id === selectedTemplateId) || allTemplates[0];

  const handleStartCreateTemplate = () => {
    setTemplateForm({
      id: `custom-tmpl-${Date.now()}`,
      name: '我的定制提示词模板',
      badge: '用户偏好',
      description: '针对特定行业与语气定制的系统提示词',
      systemDirective: `【自定义翻译偏好准则】：\n1. 语言风格：地道流利，符合中国读者习惯。\n2. 格式保持：保留全部代码、公式、标签。\n3. 专业领域：强化本行业特定语料表述。`,
      stylePreference: 'faithfulness_elegance',
      isCustom: true,
    });
    setIsEditingTemplate(true);
  };

  const handleSaveFormTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.systemDirective.trim()) return;
    onSaveCustomTemplate(templateForm);
    onSelectTemplate(templateForm);
    setIsEditingTemplate(false);
  };

  const handleAddGlossaryItem = () => {
    if (!newTerm.trim() || !newTranslation.trim()) return;
    const newItem: GlossaryItem = {
      id: `term-${Date.now()}`,
      term: newTerm.trim(),
      translation: newTranslation.trim(),
      enabled: true,
    };
    onUpdateGlossary([...glossary, newItem]);
    setNewTerm('');
    setNewTranslation('');
  };

  const handleToggleGlossaryItem = (id: string) => {
    onUpdateGlossary(
      glossary.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const handleDeleteGlossaryItem = (id: string) => {
    onUpdateGlossary(glossary.filter((g) => g.id !== id));
  };

  const handleRunTestPrompt = async () => {
    if (!testSampleText.trim()) return;
    setIsTesting(true);
    setTestError('');
    setTestResult('');

    try {
      const res = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: activeTemplate.systemDirective,
          sampleText: testSampleText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '测试请求失败');
      }
      setTestResult(data.result);
    } catch (err: any) {
      setTestError(err.message || '网络连接或模型调用异常');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                提示词模板与API翻译偏好配置
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                自定义系统Prompt指令、行业专属术语表以及在线测试API翻译偏好
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            提示词模板库 ({allTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'glossary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="h-4 w-4" />
            专业术语表与强制翻译 ({glossary.filter((g) => g.enabled).length}/{glossary.length})
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tester'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Play className="h-4 w-4" />
            在线效果测试器 (Live API)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Templates Library */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {!isEditingTemplate ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      选择当前生效的提示词模板
                    </span>
                    <button
                      onClick={handleStartCreateTemplate}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      新建自定义提示词模板
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {allTemplates.map((template) => {
                      const isSelected = template.id === activeTemplate.id;
                      return (
                        <div
                          key={template.id}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {template.name}
                                </span>
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {template.badge}
                                </span>
                                {template.isCustom && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                    用户创建
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {template.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {template.isCustom && (
                                <button
                                  onClick={() => {
                                    setTemplateForm(template);
                                    setIsEditingTemplate(true);
                                  }}
                                  className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg dark:hover:bg-zinc-800"
                                  title="编辑模板"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {template.isCustom && (
                                <button
                                  onClick={() => onDeleteCustomTemplate(template.id)}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/40"
                                  title="删除模板"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onSelectTemplate(template)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="h-3 w-3" /> 当前使用中
                                  </>
                                ) : (
                                  '设为默认'
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Directive preview */}
                          <div className="mt-3 p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 font-mono text-[11px] text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                            {template.systemDirective}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Edit/Create Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      编辑自定义提示词模板
                    </span>
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      取消
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      模板名称
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="例如：医药生物文献精准翻译"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      模板简介 / 应用场景
                    </label>
                    <input
                      type="text"
                      value={templateForm.description}
                      onChange={(e) =>
                        setTemplateForm({ ...templateForm, description: e.target.value })
                      }
                      placeholder="简述该模板的适用领域与目标特点"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      系统Prompt指令 (System Directives)
                    </label>
                    <textarea
                      rows={6}
                      value={templateForm.systemDirective}
                      onChange={(e) =>
                        setTemplateForm({ ...templateForm, systemDirective: e.target.value })
                      }
                      placeholder="输入发送给Gemini模型的系统提示词，支持定义语气、翻译准则、专业词汇习惯等..."
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      提示：系统将在翻译时将此指令与文档段落结构合并，确保翻译结果完全契合您的要求。
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleSaveFormTemplate}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      保存模板并设为当前生效
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Glossary (术语库) */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <span className="font-semibold">专业术语一致性保障：</span>
                  术语表会在翻译每个段落时作为强制约束输入给AI模型，确保诸如专业概念、产品名称、专有名词在全篇文档中始终保持统一定义。
                </div>
              </div>

              {/* Add new term bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="原文专有名词 (如: Large Language Model)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="指定中文译名 (如: 大语言模型)"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddGlossaryItem}
                  disabled={!newTerm.trim() || !newTranslation.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> 添加术语
                </button>
              </div>

              {/* Term List */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {glossary.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={g.enabled}
                        onChange={() => handleToggleGlossaryItem(g.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        title={g.enabled ? '已启用该术语' : '已停用'}
                      />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                          {g.term}
                        </span>
                        <span className="mx-2 text-zinc-400">➔</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {g.translation}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGlossaryItem(g.id)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-md transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Prompt Tester (在线测试器) */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>正在测试的模板：<strong className="text-indigo-600">{activeTemplate.name}</strong></span>
                <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  Gemini 3.8 Flash
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  测试样本输入 (Source Text):
                </label>
                <textarea
                  rows={3}
                  value={testSampleText}
                  onChange={(e) => setTestSampleText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTestPrompt}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? '正在调用 Gemini API 测试中...' : '运行提示词测试'}
                </button>
              </div>

              {testError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                  {testError}
                </div>
              )}

              {testResult && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    API实时生成译文结果：
                  </span>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                    {testResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
          <span className="text-xs text-zinc-500">
            已生效模板: <strong>{activeTemplate.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
