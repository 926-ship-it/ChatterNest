import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  FileText,
  Sparkles,
  Clipboard,
  Check,
  Heart,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { DocumentBlock, DocumentMeta } from '../types/document';
import { SAMPLE_DOCUMENTS } from '../data/presets';
import {
  parseHTMLToBlocks,
  parsePDFToBlocks,
  parsePlainTextToBlocks,
  parseAO3Document,
} from '../utils/importer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (blocks: DocumentBlock[], meta: DocumentMeta) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'paste'>('samples');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      let blocks: DocumentBlock[] = [];
      let parsedMeta: Partial<DocumentMeta> = {};
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'pdf') {
        blocks = await parsePDFToBlocks(file);
      } else if (extension === 'html' || extension === 'htm') {
        const text = await file.text();
        if (text.includes('workskin') || text.includes('userstuff') || text.includes('byline')) {
          const ao3Data = parseAO3Document(text);
          blocks = ao3Data.blocks;
          parsedMeta = ao3Data.meta;
        } else {
          blocks = parseHTMLToBlocks(text);
        }
      } else {
        const text = await file.text();
        blocks = parsePlainTextToBlocks(text);
      }

      const meta: DocumentMeta = {
        id: `doc-${Date.now()}`,
        title: parsedMeta.title || file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileType: (parsedMeta.fileType || (extension === 'pdf' ? 'pdf' : 'html')) as any,
        sourceLang: 'English',
        targetLang: 'Chinese (Simplified)',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ao3Meta: parsedMeta.ao3Meta,
      };

      onImportDocument(blocks, meta);
      onClose();
    } catch (err) {
      console.error('File parsing error:', err);
      alert('解析文件遇到异常，请检查文件格式是否有效。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    const blocks = parseHTMLToBlocks(sample.htmlContent);

    const sampleTranslations: [RegExp, string][] = [
      // 1. The Nightingale and the Rose
      [/The Nightingale and the Rose/i, '夜莺与玫瑰 (The Nightingale and the Rose)'],
      [/by Oscar Wilde/i, '原作者：奥斯卡·王尔德 (1888 · 公版经典)'],
      [/Chapter 1: The Rose of Desire/i, '第一章：愿望中的红玫瑰'],
      [/She said that she would dance with me if I brought her red roses/i, '“她说，只要我带给她一朵红玫瑰，她便愿与我共舞，”年轻的学生悲呼道，“可是在我的整座花园里，竟然连一朵红玫瑰也寻不见。”'],
      [/From her nest in the holm-oak tree/i, '冬青栎树巢中的夜莺听见了他的哀叹，她探身透过枝叶凝望，心中满是惊奇。'],
      [/No red rose in all my garden/i, '“我整座花园里竟然没有一朵红玫瑰！”他痛声哭诉，美丽的双眸盈满了泪水。“唉，幸福所系之物竟是如此微小！我读遍了先贤智者写下的鸿篇巨制，洞悉了世间哲学的奥秘真理，然而仅仅为了一朵小小的红玫瑰，我的一生便陷入这般凄凉绝望。”'],
      [/Here at last is a true lover/i, '“世间终于有了一位真正懂爱的人，”夜莺感叹道，“无数个夜晚，我虽未曾谋面，却一直在为他吟唱；无数个夜晚，我向星辰倾诉他的故事；如今，我终于亲眼见到了他。他的青丝黑如风信子花瓣，他的嘴唇红如他渴望的那朵玫瑰；然而狂热的情思已令他的面容宛如苍白的象牙，悲伤亦在他眉间烙下了深深的印记。”'],
      [/The Prince gives a ball to-morrow night/i, '“明晚王子将举办一场盛大舞会，”年轻的学生喃喃自语，“我心爱的人也将应邀出席。如果我能奉上一朵红玫瑰，她便会伴我翩翩起舞直到拂晓。如果我能奉上一朵红玫瑰，我就能将她拥入怀中，她会把臻首依偎在我的肩头，纤手与我十指相扣。可是我的园中没有红玫瑰，所以我只能孤零零地坐在一隅，任凭她从我身旁悄然掠过。她连一眼都不会看我，我的心也将碎成齑粉。”'],
      [/Here indeed is the true lover/i, '“这的确是一位真正的痴情之人，”夜莺轻叹道，“我所歌唱的，正是他所饱受的折磨；对我而言是欢愉之歌，于他却是椎心之痛。爱当真是世间最神奇莫测的造物。它比祖母绿更加珍贵，比晶莹的欧泊更显娇贵。珍珠与石榴换不来它，市集之上亦难觅其踪。它不可在商贾手中采买，亦无法在天平上用黄金称量。”'],
      [/The musicians will sit in their gallery/i, '“乐师们将端坐于挑台上，”年轻的学生低语道，“奏响手中的弦乐，我心爱的人将随着竖琴与小提琴的旋律翩跹起舞。她的舞步轻盈得仿佛双足未曾沾染尘埃，身着华服的廷臣侍卫们都会簇拥在她身旁。然而她却不会与我共舞，因为我没有红玫瑰可以赠她。”'],
      [/He flung himself down on the grass/i, '他猛地扑倒在草丛中，双手掩面，失声痛哭起来。'],
      [/Why is he weeping/i, '“他究竟在哭什么呀？”一只小巧的绿蜥蜴竖着尾巴从他身旁飞快掠过时好奇地问道。'],
      [/fluttering after a sunbeam/i, '“是啊，究竟因何而哭呢？”一只追逐着阳光翩翩起舞的蝴蝶也附和道。'],
      [/whispered a Daisy to his neighbour/i, '“到底为了什么呢？”一朵雏菊用轻柔温婉的低语问向身旁的伙伴。'],
      [/He is weeping for a red rose/i, '“他正在为了一朵红玫瑰而痛哭，”夜莺答道。'],
      [/how very ridiculous/i, '“为了一朵红玫瑰！”他们异口同声地惊呼，“真是太荒唐可笑了！”小蜥蜴甚至忍不住径直大笑出声。'],
      [/mystery of Love/i, '然而唯独夜莺懂得这位青年学者悲伤深处的秘密；她静静地栖息在栎树枝头，沉浸在关于爱的玄妙谜题之中。'],

      // 2. The Happy Prince
      [/The Happy Prince/i, '快乐王子 (The Happy Prince)'],
      [/Chapter 1: The Statue and the Swallow/i, '第一章：雕像与小燕子'],
      [/High above the city, on a tall column/i, '高高耸立在城市之巅的圆柱顶端，挺立着快乐王子的雕像。他通体贴满了纯金箔片，双眸镶嵌着两颗璀璨夺目的蓝宝石，佩剑的剑柄上还闪耀着一颗硕大如火的红宝石。'],
      [/He was very much admired indeed/i, '人们对他赞不绝口。“他美得就宛如一只风向标，”一位急于博得艺术鉴赏家美名的镇议员评论道，“只是没有风向标那么实用，”他连忙补充道，唯恐旁人认为他是个不讲实际的人。'],
      [/One night there flew over the city a little Swallow/i, '某天夜晚，一只小燕子孤身掠过这座城市。他的同伴早在六周前便飞往了温暖的埃及，唯独他留了下来，因为他爱上了芦苇河畔最美丽的一株芦苇。那是初春时节，当他正追逐一只硕大的黄飞蛾掠过水面时，与她一见钟情。'],
      [/Shall I love you/i, '“我能爱你吗？”向来直截了当的燕子问道，芦苇轻轻向他弯腰致意。于是他绕着她飞舞，双翼轻拂水面，荡开层层银白色的涟漪。这是他对她长达一整个夏天的求爱。'],
      [/It is a ridiculous attachment/i, '“这段爱恋真是荒谬透顶，”其他燕子叽叽喳喳地嘲笑道，“她既无分文积蓄，亲眷又多得数不清。”确实，整条河里长满了芦苇。待到深秋来临，群燕便纷纷振翅远飞了。'],
      [/All day long he flew/i, '他飞了一整天，直到夜幕降临才飞抵这座城市。“今晚我该落脚在何处呢？”他自言自语道，“但愿这座市镇已经为我备好了住所。”'],
      [/I will put up there/i, '这时他看见了高柱上的雕像。“我就落在那里歇息吧，”他欢呼道，“那里视野极佳，而且空气新鲜清新。”于是他轻盈地降落在快乐王子的双足之间。'],
      [/I have a golden bedroom/i, '“我拥有一间黄金卧室，”他环顾四周，心中轻声呢喃，随即便准备将头埋进翅膀沉沉睡去；可就在此时，一大滴水珠啪嗒落在了他的头上。'],
      [/What a curious thing/i, '“真是怪事！”燕子惊诧地叫道，“夜空晴朗无云，繁星璀璨明亮，怎会平白无故下起雨来？”'],
      [/Then another drop fell/i, '紧接着，又有一滴水珠落了下来。'],
      [/What is the use of a statue/i, '“如果一座雕像连遮风避雨都做不到，那它还有何用处？”燕子懊恼道，“我必须去找个好烟囱避雨，”说着他便决意振翅飞走。'],
      [/before he had opened his wings/i, '然而，还未等他张开双翼，第三滴水珠又落了下来。他抬头望去——啊！他看见了什么？'],
      [/The eyes of the Happy Prince were filled with tears/i, '快乐王子的眼中盈满了泪水，晶莹的泪珠正顺着他金色的双颊不断滑落。在清冷的月光下，他的面庞是如此圣洁美丽，令小燕子的心头瞬间涌起无尽的怜惜。'],
      [/Who are you/i, '“你是谁？”燕子轻声问道。'],
      [/I am the Happy Prince/i, '“我是快乐王子。”'],
      [/Why are you weeping then/i, '“那你为何要哭泣呢？”燕子问道，“你的泪水把我的羽毛都浸湿透了。”'],

      // 3. The Gift of the Magi
      [/The Gift of the Magi/i, '麦琪的礼物 (The Gift of the Magi)'],
      [/Chapter 1: Pennies and Pride/i, '第一章：硬币与引以为傲之物'],
      [/One dollar and eighty-seven cents/i, '一美元八十七美分。全部家当只有这么多了。其中六十美分还是面值一分钱的硬币。这些硬币是一分一分地从杂货铺老板、菜贩和屠户手里死磨硬泡省下来的，每一次算计都让脸颊因那种无言的吝啬指责而火辣辣地发烫。'],
      [/Three times Della counted it/i, '德拉反反复复数了三遍。一美元八十七美分。而明天，就是一年一度的圣诞节了。'],
      [/flop down on the shabby little couch/i, '此时此刻，除了扑倒在那张破旧的小沙发上号啕大哭之外，显然别无他法。于是德拉便痛哭了一场。这一举动不禁令人感叹：生活大体就是由抽泣、擤鼻涕和破涕为笑交织而成的，其中尤以擤鼻涕占据了大部分光阴。'],
      [/furnished flat at eight dollars a week/i, '趁着这位家中的女主人正由号啕大哭逐渐转入抽泣之际，不妨看一眼这个家。这是一套每周租金八美元的带家具公寓。虽不至于寒酸到无可名状，但确实也足以引起流浪汉管制稽查队的警惕注意。'],
      [/two possessions of the James Dillingham Youngs/i, '在这个詹姆斯·迪林厄姆·杨的小家庭里，有两样东西让他们夫妇二人深感无比骄傲与自豪。一样是吉姆的金表，那是他祖父传给父亲，又由父亲传给他的传家宝；另一样，便是德拉那一头美丽的秀发。'],
      [/Had the Queen of Sheba lived/i, '倘若示巴女王就住在天井对面的公寓里，德拉总有一天会把长发悬垂在窗外晾晒，好教女王陛下的珠宝与贡品顿时黯然失色；倘若所罗门王屈尊做了大楼看门人，将所有财宝堆在地下室里，吉姆每次经过时也定会掏出金表瞥上一眼，只为看他嫉妒得直吹胡子。'],
      [/Della's beautiful hair fell about her/i, '此时此刻，德拉那瀑布般美丽的秀发披散在肩头，宛如一泓褐色的清泉波光粼粼、流光溢彩。长发一直垂过了她的膝弯，简直如同一件用发丝织就的华丽长袍。'],
      [/faltered for a minute/i, '随后，她神色紧张而利落地下手将头发重新挽起。中途她恍惚停顿了片刻，静静伫立在那里，一两滴泪珠无声地落在了破旧的红色地毯上。'],
    ];

    blocks.forEach((block) => {
      for (const [regex, zh] of sampleTranslations) {
        if (regex.test(block.sourceText)) {
          block.targetText = zh;
          break;
        }
      }
    });

    const meta: DocumentMeta = {
      id: `sample-${Date.now()}`,
      title: sample.title,
      fileName: `${sample.id}.html`,
      fileType: 'html',
      sourceLang: sample.sourceLang,
      targetLang: sample.targetLang,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ao3Meta: sample.ao3Meta,
    };
    onImportDocument(blocks, meta);
    onClose();
  };

  const handleImportPaste = () => {
    if (!pasteContent.trim()) return;
    let blocks: DocumentBlock[];
    let metaResult: any;

    const isHtml = /<\/?[a-z][\s\S]*>/i.test(pasteContent);
    if (isHtml) {
      if (pasteContent.includes('workskin') || pasteContent.includes('userstuff') || pasteContent.includes('byline')) {
        const res = parseAO3Document(pasteContent);
        blocks = res.blocks;
        metaResult = res.meta;
      } else {
        blocks = parseHTMLToBlocks(pasteContent);
      }
    } else {
      blocks = parsePlainTextToBlocks(pasteContent);
    }

    const meta: DocumentMeta = {
      id: `pasted-${Date.now()}`,
      title: pasteTitle.trim() || metaResult?.title || '导入的故事文档',
      fileName: 'imported_story.html',
      fileType: 'html',
      sourceLang: 'English',
      targetLang: 'Chinese (Simplified)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ao3Meta: metaResult?.ao3Meta,
    };

    onImportDocument(blocks, meta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#990000]/10 text-[#990000]">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  导入故事文档 / 文学篇章
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#990000] text-white">
                  双语排版解析
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                支持智能识别作品分类、人物关系、分级与章节，逐段对齐双语排版
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

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-[#990000] text-[#990000]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            公版经典范例 ({SAMPLE_DOCUMENTS.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#990000] text-[#990000]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Upload className="h-4 w-4" />
            上传 HTML / PDF 文件
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-[#990000] text-[#990000]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Clipboard className="h-4 w-4" />
            直接粘贴章节内容
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Preset Samples */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <div>
                  <strong>公版经典体验：</strong>
                  以下精选了世界文学经典与唯美童话名篇（《夜莺与玫瑰》、《快乐王子》、《麦琪的礼物》），均属全世界公共版权保护领域（Public Domain），无任何版权纠纷，点击即可体验高雅的双语对照排版。
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SAMPLE_DOCUMENTS.map((sample) => (
                  <div
                    key={sample.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#990000]/50 hover:bg-[#990000]/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {sample.ao3Meta?.fandoms?.[0] || '经典文学'}
                        </span>
                        {sample.ao3Meta?.relationships?.[0] && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-0.5">
                            <Heart className="h-2.5 w-2.5 fill-current" />
                            {sample.ao3Meta.relationships[0]}
                          </span>
                        )}
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {sample.ao3Meta?.rating}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {sample.title}
                      </div>

                      <div className="flex flex-wrap gap-1 text-[10px] text-zinc-500">
                        {sample.ao3Meta?.additionalTags?.slice(0, 4).map((t, idx) => (
                          <span key={idx}>#{t}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSample(sample)}
                      className="px-4 py-2 rounded-xl bg-[#990000] hover:bg-[#800000] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition active:scale-95"
                    >
                      <span>载入故事</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Upload file */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.pdf,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-[#990000] bg-red-50 dark:bg-red-950/20'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-[#990000] bg-zinc-50/50 dark:bg-zinc-800/30'
                }`}
              >
                <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-md text-[#990000]">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    点击选择文件，或将本地 HTML / PDF 故事拖入此处
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    支持网页导出的整本 HTML 文档、小说电子书或英文 PDF 排版
                  </div>
                </div>
                <div className="flex gap-2 text-[11px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">提取故事元信息</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">章节结构对齐</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">原格式无损保留</span>
                </div>
              </div>

              {isProcessing && (
                <div className="text-center p-3 text-xs font-semibold text-[#990000] animate-pulse">
                  正在解析故事结构与段落排版，请稍候...
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  作品标题 (可选，若粘贴完整 HTML 将自动提取)
                </label>
                <input
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="例如：The Nightingale and the Rose"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#990000]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  粘贴页面 HTML 源代码或章节正文
                </label>
                <textarea
                  rows={8}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="可直接粘贴网页源码或英文故事正文段落..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#990000]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleImportPaste}
                  disabled={!pasteContent.trim()}
                  className="px-5 py-2 rounded-xl bg-[#990000] hover:bg-[#800000] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition"
                >
                  导入并解析为双语对照工作区
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
