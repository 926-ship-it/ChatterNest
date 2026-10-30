import React from 'react';
import { X, Check, Type, Sliders, Eye, Sun, Moon } from 'lucide-react';
import { ThemeConfig, TypographyConfig } from '../types/document';
import { THEMES } from '../data/presets';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  typography: TypographyConfig;
  onChangeTypography: (updater: (prev: TypographyConfig) => TypographyConfig) => void;
}

export const StyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  typography,
  onChangeTypography,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Sliders className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                排版外观与排版样式自定义
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                个性化配置双语对照文档的阅读底色、字体族系、字号间距与视觉焦点
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

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Theme selection */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              阅读底色与背景主题 (Background Themes)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const isSelected = currentTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all relative ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    {/* Visual miniature */}
                    <div
                      className={`h-10 w-full rounded-lg ${theme.appBg} ${theme.border} border p-1.5 flex flex-col justify-center gap-1`}
                    >
                      <div className="h-1.5 w-3/4 rounded-full bg-zinc-400/40" />
                      <div className="h-1.5 w-1/2 rounded-full bg-amber-600/40" />
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                      {theme.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font family */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              排版字体家族 (Typography Fonts)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'serif', name: '思源宋体', desc: '典雅学术 / 期刊风骨', fontClass: 'font-reading-serif' },
                { id: 'sans', name: '现代无衬线', desc: '清晰通透 / 现代阅读', fontClass: 'font-reading-sans' },
                { id: 'kaiti', name: '风雅楷体', desc: '笔触温润 / 人文质感', fontClass: 'font-reading-kaiti' },
                { id: 'mono', name: '科技等宽', desc: '规范严谨 / 极客质感', fontClass: 'font-reading-mono' },
              ].map((f) => {
                const isSelected = typography.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() =>
                      onChangeTypography((prev) => ({
                        ...prev,
                        fontFamily: f.id as any,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className={`text-base font-bold ${f.fontClass} text-zinc-900 dark:text-zinc-100`}>
                      {f.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {f.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Slider controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            {/* Font size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>正文字号</span>
                <span className="font-semibold text-amber-600">{typography.fontSize}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={22}
                step={1}
                value={typography.fontSize}
                onChange={(e) =>
                  onChangeTypography((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>紧凑 13px</span>
                <span>标准 16px</span>
                <span>大字 22px</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>文本行高</span>
                <span className="font-semibold text-amber-600">{typography.lineHeight}x</span>
              </div>
              <input
                type="range"
                min={1.4}
                max={2.2}
                step={0.1}
                value={typography.lineHeight}
                onChange={(e) =>
                  onChangeTypography((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>紧凑 1.4</span>
                <span>舒适 1.7</span>
                <span>宽松 2.2</span>
              </div>
            </div>

            {/* Paragraph Spacing */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>段落间距</span>
                <span className="font-semibold text-amber-600">{typography.paragraphSpacing}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={32}
                step={2}
                value={typography.paragraphSpacing}
                onChange={(e) =>
                  onChangeTypography((prev) => ({ ...prev, paragraphSpacing: Number(e.target.value) }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>致密 8px</span>
                <span>标准 16px</span>
                <span>开阔 32px</span>
              </div>
            </div>
          </div>

          {/* 4. Column ratio & visual preferences */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  双栏宽度比例 (左右分栏模式)
                </span>
                <p className="text-xs text-zinc-500">调整原文与中文译文的分配比例</p>
              </div>
              <div className="flex gap-2">
                {[
                  { id: '50-50', label: '1 : 1 均等' },
                  { id: '45-55', label: '45% : 55% 突出中文' },
                  { id: '55-45', label: '55% : 45% 突出原文' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() =>
                      onChangeTypography((prev) => ({ ...prev, columnRatio: ratio.id as any }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      typography.columnRatio === ratio.id
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <input
                  type="checkbox"
                  checked={typography.highlightActive}
                  onChange={(e) =>
                    onChangeTypography((prev) => ({ ...prev, highlightActive: e.target.checked }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <div className="text-xs">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">悬停高亮对照行</div>
                  <div className="text-zinc-500 text-[11px]">鼠标掠过时同步高亮左右对应段落</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <input
                  type="checkbox"
                  checked={typography.sourceDimming}
                  onChange={(e) =>
                    onChangeTypography((prev) => ({ ...prev, sourceDimming: e.target.checked }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <div className="text-xs">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">原文视觉降噪</div>
                  <div className="text-zinc-500 text-[11px]">微弱降低原文色度，使视线聚焦于中文译文</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 cursor-pointer hover:bg-red-50/40">
                <input
                  type="checkbox"
                  checked={typography.keepEnglishNames}
                  onChange={(e) =>
                    onChangeTypography((prev) => ({ ...prev, keepEnglishNames: e.target.checked }))
                  }
                  className="rounded text-[#990000] focus:ring-[#990000] h-4 w-4"
                />
                <div className="text-xs">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>保留角色英文原名</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-red-100 dark:bg-red-950 text-[#990000]">阅读优选</span>
                  </div>
                  <div className="text-zinc-500 text-[11px]">翻译时保留人物英文原名不强行音译</div>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Live Preview snippet */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
              当前排版实时预览
            </span>
            <div
              className={`p-4 rounded-xl border ${currentTheme.cardBg} ${currentTheme.border} ${currentTheme.textPrimary} transition-all`}
              style={{
                fontSize: `${typography.fontSize}px`,
                lineHeight: typography.lineHeight,
              }}
            >
              <div
                className={
                  typography.fontFamily === 'serif'
                    ? 'font-reading-serif'
                    : typography.fontFamily === 'kaiti'
                    ? 'font-reading-kaiti'
                    : typography.fontFamily === 'mono'
                    ? 'font-reading-mono'
                    : 'font-reading-sans'
                }
              >
                <div className="font-bold mb-1">
                  人工智能安全对齐：基于宪法AI的研究
                </div>
                <div className="text-sm opacity-90">
                  现代大语言模型具备极高创造力，但通过显式制定的伦理准则引导模型进行自我批判与迭代修订，能够显著消除机器翻译生硬感与偏见。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition"
          >
            完成并应用
          </button>
        </div>
      </div>
    </div>
  );
};
