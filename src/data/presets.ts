import { ThemeConfig, PromptTemplate, GlossaryItem, Ao3WorkMeta } from '../types/document';

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic_crimson',
    name: '绯红书斋',
    tag: '经典绯红',
    appBg: 'bg-[#F7F4EE]',
    cardBg: 'bg-[#FFFDF9]',
    textPrimary: 'text-[#282522]',
    textSecondary: 'text-[#6E675F]',
    border: 'border-[#E5DDD0]',
    activeRowBg: 'bg-[#FCEEE9]',
    accent: '#990000',
    sourceBadge: 'bg-[#F3EBE1] text-[#7A2E2E]',
    targetBadge: 'bg-[#990000] text-[#FFFFFF]',
  },
  {
    id: 'midnight_reader',
    name: '深夜伴读',
    tag: '深色护眼',
    appBg: 'bg-[#141416]',
    cardBg: 'bg-[#1E1E22]',
    textPrimary: 'text-[#E8E6E3]',
    textSecondary: 'text-[#9A9690]',
    border: 'border-[#2D2D33]',
    activeRowBg: 'bg-[#2A262D]',
    accent: '#E06C75',
    sourceBadge: 'bg-[#2B2B32] text-[#B8B4AE]',
    targetBadge: 'bg-[#5C2B29] text-[#FFA8A8]',
  },
  {
    id: 'parchment',
    name: '古典暖羊皮纸',
    tag: '典雅纸感',
    appBg: 'bg-[#FAF5E9]',
    cardBg: 'bg-[#FFFDF7]',
    textPrimary: 'text-[#2D2A26]',
    textSecondary: 'text-[#7A7369]',
    border: 'border-[#EAE1D2]',
    activeRowBg: 'bg-[#F4ECE1]',
    accent: '#8C5E32',
    sourceBadge: 'bg-[#EFE6D7] text-[#695034]',
    targetBadge: 'bg-[#E3D4BF] text-[#4A321E]',
  },
  {
    id: 'eyecare',
    name: '柔和豆沙绿',
    tag: '长阅舒缓',
    appBg: 'bg-[#EDF5ED]',
    cardBg: 'bg-[#F7FAF7]',
    textPrimary: 'text-[#1F3323]',
    textSecondary: 'text-[#56735C]',
    border: 'border-[#D4E6D6]',
    activeRowBg: 'bg-[#E1EDE3]',
    accent: '#2E7D32',
    sourceBadge: 'bg-[#E2EFE3] text-[#295930]',
    targetBadge: 'bg-[#C8E6C9] text-[#1B5E20]',
  },
  {
    id: 'ivory',
    name: '极简象牙白',
    tag: '高对比度',
    appBg: 'bg-[#F8FAFC]',
    cardBg: 'bg-[#FFFFFF]',
    textPrimary: 'text-[#0F172A]',
    textSecondary: 'text-[#64748B]',
    border: 'border-[#E2E8F0]',
    activeRowBg: 'bg-[#F1F5F9]',
    accent: '#990000',
    sourceBadge: 'bg-[#F1F5F9] text-[#475569]',
    targetBadge: 'bg-[#FEE2E2] text-[#990000]',
  },
  {
    id: 'romance_blush',
    name: '温柔浪漫樱粉',
    tag: '温润雅致',
    appBg: 'bg-[#FAF3F3]',
    cardBg: 'bg-[#FFFBFB]',
    textPrimary: 'text-[#3D292B]',
    textSecondary: 'text-[#8C6B6E]',
    border: 'border-[#F2DEDE]',
    activeRowBg: 'bg-[#FCE8EB]',
    accent: '#C25975',
    sourceBadge: 'bg-[#F5DFE3] text-[#7A3648]',
    targetBadge: 'bg-[#EBBAC5] text-[#541B28]',
  },
];

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'literary_elegance',
    name: '文学叙事与情感张力 (首选推荐)',
    badge: '文学小说/经典故事',
    description: '针对文学故事细腻情感、心理暗涌、场景意境优化，彻底去除生硬机械翻译腔，文笔温润动人。',
    stylePreference: 'faithfulness_elegance',
    systemDirective: `【文学故事与叙事高质量翻译准则】：
1. 情感与氛围渲染：注重心理描写与潜台词（subtext），捕捉人物之间的眼神流转、呼吸频率、触碰温度与微妙的情感波动，杜绝生硬直译。
2. 句式与文气：打破繁杂的英式从句与被动句，多用富有节奏感的中文短句与凝练四字修辞，营造身临其境的文学美感。
3. 角色声线（Voice）：保持角色对话生动自然，体现不同角色的性格特质。
4. 意象还原：准确传递古典文学、童话与现代小说中的象征意象（如玫瑰、月光、眼泪）。`,
  },
  {
    id: 'dialogue_banter',
    name: '角色灵动机锋与对白交锋 (Dialogue & Banter)',
    badge: '生动对白/口语',
    description: '擅长处理幽默调侃、言语试探、机敏推拉的对白交锋，台词鲜活接地气且张力十足。',
    stylePreference: 'colloquial',
    systemDirective: `【角色生动对白与机锋交错准则】：
1. 语言自然生动：对话完全脱离翻译腔，如同优秀的影视舞台台词般自然流畅，富有幽默感与节奏。
2. 心理距离与张力：在言语试探与轻描淡写的调侃中，保留暗潮涌动的张力。
3. 语气词与节奏把控：合理使用中文语气助词，精准还原作者字里行间的留白与戏谑。`,
  },
  {
    id: 'worldbuilding_fantasy',
    name: '西方奇幻与古典史诗世界观 (Fantasy & Lore)',
    badge: '奇幻设定/史诗',
    description: '针对古老传说、骑士魔法、史诗寓言题材，文辞典雅庄重，意境悠远。',
    stylePreference: 'faithfulness_elegance',
    systemDirective: `【古典奇幻与传说故事准则】：
1. 典雅庄重：用词考究古雅，富有叙事史诗感与文学厚度。
2. 景物与心境交融：重现月光、古老雕像、风雪、誓言等意象的文学感染力。`,
  },
  {
    id: 'preserve_names',
    name: '保留英文人名 / 原汁原味模式',
    badge: '英文名保留',
    description: '行文中保留角色英文原名，只翻译叙事和对话，符合许多英文读者的阅读习惯。',
    stylePreference: 'faithfulness_elegance',
    systemDirective: `【保留英文角色原名模式】：
1. 专有名词策略：所有核心角色的英文名字、地名与称呼保留英文字符，不强行音译成中文长字。
2. 正文叙事与人物对话翻译为优雅流畅、富有感染力的高质感中文。`,
  },
];

export const INITIAL_GLOSSARY: GlossaryItem[] = [
  { id: 'g_slowburn', term: 'Slow Burn', translation: '细水长流 / 慢热', enabled: true },
  { id: 'g_pining', term: 'Mutual Pining', translation: '心意相通 / 双向深情', enabled: true },
  { id: 'g_hurtcomfort', term: 'Hurt/Comfort', translation: '救赎抚慰 / 患难相依', enabled: true },
  { id: 'g_banter', term: 'Banter', translation: '机锋交锋 / 谐趣打趣', enabled: true },
  { id: 'g_mindscape', term: 'Mindscape', translation: '精神图景 / 意识界', enabled: true },
  { id: 'g_subtext', term: 'Subtext', translation: '弦外之音 / 潜台词', enabled: true },
];

export const SAMPLE_DOCUMENTS = [
  {
    id: 'sample-nightingale-rose',
    title: 'The Nightingale and the Rose (夜莺与玫瑰)',
    type: 'html' as const,
    sourceLang: 'English',
    targetLang: 'Chinese (Simplified)',
    ao3Meta: {
      author: 'Oscar Wilde (奥斯卡·王尔德 · 1888 公版经典)',
      fandoms: ['世界经典文学 / 唯美童话'],
      rating: 'General Audiences (全年龄)',
      warnings: ['公版无版权争议作品 (Public Domain)'],
      categories: ['Gen', 'F/M'],
      relationships: ['The Student & His Love', 'The Nightingale & The Rose'],
      characters: ['The Nightingale (夜莺)', 'The Student (年轻学生)', 'The Professor’s Daughter', 'Little Lizard'],
      additionalTags: [
        'Public Domain Classic',
        'Poetic Prose',
        'Romanticism',
        'Love and Sacrifice',
        'Classic Fairy Tale',
      ],
      series: 'Oscar Wilde Fairy Tales #1',
      summary:
        '一位年轻学者苦恼于因无法送出一朵红玫瑰而不能与教授的女儿共舞。橡树上的小夜莺听到了他的悲鸣，深信自己终于遇见了一位世间罕有的真正痴情之人，决定不惜一切代价为他觅得一朵绯红玫瑰。',
      notes:
        '背景导读：奥斯卡·王尔德于1888年出版的唯美主义传世之作，现已进入全世界公共版权保护领域（Public Domain）。全篇语言精美绝伦，对话与景物描写极富音乐韵律。',
      stats: { words: '2,150', chapters: '1/1' },
    },
    htmlContent: `
<h1>The Nightingale and the Rose</h1>
<p class="byline">by Oscar Wilde (1888 · Public Domain)</p>
<div class="preface">
  <p><strong>Summary:</strong> A young Student laments that he cannot dance with the Professor's daughter because he has no red rose. Hearing his grief from her oak tree, a little Nightingale believes she has finally found a true lover, and determines to bring him a red rose at the greatest price of all.</p>
  <p><strong>Themes:</strong> Love and Sacrifice, Poetic Prose, Oscar Wilde Classics</p>
</div>
<h2>Chapter 1: The Rose of Desire</h2>
<p>"She said that she would dance with me if I brought her red roses," cried the young Student; "but in all my garden there is no red rose."</p>
<p>From her nest in the holm-oak tree the Nightingale heard him, and she looked out through the leaves, and wondered.</p>
<p>"No red rose in all my garden!" he cried, and his beautiful eyes filled with tears. "Ah, on what little things does happiness depend! I have read all that the wise men have written, and all the secrets of philosophy are mine, yet for want of a red rose is my life made wretched."</p>
<p>"Here at last is a true lover," said the Nightingale. "Night after night have I sung of him, though I knew him not: night after night have I told his story to the stars, and now I see him. His hair is dark as the hyacinth-blossom, and his lips are red as the rose of his desire; but passion has made his face like pale ivory, and sorrow has set her seal upon his brow."</p>
<p>"The Prince gives a ball to-morrow night," murmured the young Student, "and my love will be of the company. If I bring her a red rose she will dance with me till dawn. If I bring her a red rose, I shall hold her in my arms, and she will lean her head upon my shoulder, and her hand will be clasped in mine. But there is no red rose in my garden, so I must sit lonely, and she will pass me by. She will have no heed of me, and my heart will break."</p>
<p>"Here indeed is the true lover," said the Nightingale. "What I sing of, he suffers; what is joy to me, to him is pain. Surely Love is a wonderful thing. It is more precious than emeralds, and dearer than fine opals. Pearls and pomegranates cannot buy it, nor is it set forth in the marketplace. It may not be purchased of the merchants, nor can it be weighed out in the balance for gold."</p>
<blockquote>"The musicians will sit in their gallery," said the young Student, "and play upon their stringed instruments, and my love will dance to the sound of the harp and the violin. She will dance so lightly that her feet will not touch the floor, and the courtiers in their gay dresses will throng round her. But with me she will not dance, for I have no red rose to give her."</blockquote>
<p>He flung himself down on the grass, and buried his face in his hands, and wept.</p>
<p>"Why is he weeping?" asked a little Green Lizard, as he ran past him with his tail in the air.</p>
<p>"Why, indeed?" said a Butterfly, who was fluttering after a sunbeam.</p>
<p>"Why, indeed?" whispered a Daisy to his neighbour, in a soft, low voice.</p>
<p>"He is weeping for a red rose," said the Nightingale.</p>
<p>"For a red rose!" they cried; "how very ridiculous!" and the little Lizard laughed outright.</p>
<p>But the Nightingale understood the secret of the Student's sorrow, and she sat silent in the oak-tree, and thought on the mystery of Love.</p>
    `,
  },
  {
    id: 'sample-happy-prince',
    title: 'The Happy Prince (快乐王子)',
    type: 'html' as const,
    sourceLang: 'English',
    targetLang: 'Chinese (Simplified)',
    ao3Meta: {
      author: 'Oscar Wilde (奥斯卡·王尔德 · 1888 公版经典)',
      fandoms: ['世界经典童话 / 英国文学名篇'],
      rating: 'General Audiences (全年龄)',
      warnings: ['公版无版权争议作品 (Public Domain)'],
      categories: ['Gen'],
      relationships: ['The Happy Prince & The Swallow'],
      characters: ['The Happy Prince (快乐王子)', 'The Little Swallow (小燕子)', 'Town Councillors'],
      additionalTags: [
        'Public Domain Classic',
        'Fable',
        'Compassion',
        'Unconditional Friendship',
        'Tears of Gold',
      ],
      series: 'Oscar Wilde Fairy Tales #2',
      summary:
        '高高耸立在城市圆柱顶端的快乐王子雕像，通体贴满纯金金箔，双眼嵌着璀璨蓝宝石，剑柄上红宝石熠熠生辉。当一只南飞落单的小燕子歇宿在他脚边时，王子却流下了金色的泪水……',
      notes:
        '背景导读：王尔德代表作之一，纯真而深邃的童话。通过王子与燕子的对话，展现了奉献、同情心与超越世俗的纯洁之美。',
      stats: { words: '3,100', chapters: '1/1' },
    },
    htmlContent: `
<h1>The Happy Prince</h1>
<p class="byline">by Oscar Wilde (1888 · Public Domain)</p>
<div class="preface">
  <p><strong>Summary:</strong> High above the city stands the splendid statue of the Happy Prince, covered in gold and gemstones. When a migrating little Swallow takes shelter between his feet, the Prince reveals that behind his shining exterior, he weeps for the poverty and suffering of the people below.</p>
  <p><strong>Themes:</strong> Compassion, Loyalty, True Beauty, Fairy Tale Classics</p>
</div>
<h2>Chapter 1: The Statue and the Swallow</h2>
<p>High above the city, on a tall column, stood the statue of the Happy Prince. He was gilded all over with thin leaves of fine gold, for eyes he had two bright sapphires, and a large red ruby glowed on his sword-hilt.</p>
<p>He was very much admired indeed. "He is as beautiful as a weathercock," remarked one of the Town Councillors who wished to gain a reputation for having artistic tastes; "only not quite so useful," he added, fearing lest people should think him unpractical.</p>
<p>One night there flew over the city a little Swallow. His friends had gone away to Egypt six weeks before, but he had stayed behind, for he was in love with the most beautiful Reed. He had met her early in the spring as he was flying down the river after a big yellow moth.</p>
<p>"Shall I love you?" said the Swallow, who liked to come to the point at once, and the Reed made him a low bow. So he flew round and round her, touching the water with his wings, and making silver ripples. This was his courtship, and it lasted all through the summer.</p>
<p>"It is a ridiculous attachment," twittered the other Swallows; "she has no money, and far too many relations." Then, when the autumn came they all flew away.</p>
<p>All day long he flew, and at night-time he arrived at the city. "Where shall I put up?" he said; "I hope the town has made preparations."</p>
<p>Then he saw the statue on the tall column. "I will put up there," he cried; "it is a fine position, with plenty of fresh air." So he alighted just between the feet of the Happy Prince.</p>
<blockquote>"I have a golden bedroom," he whispered softly to himself as he looked round, and he prepared to go to sleep; but just as he was putting his head under his wing a large drop of water fell on him.</blockquote>
<p>"What a curious thing!" cried the Swallow; "there is not a single cloud in the sky, the stars are quite clear and bright, and yet it is raining."</p>
<p>Then another drop fell.</p>
<p>"What is the use of a statue if it cannot keep the rain off?" he said; "I must look for a good chimney-pot," and he determined to fly away.</p>
<p>But before he had opened his wings, a third drop fell, and he looked up, and saw—Ah! what did he see?</p>
<p>The eyes of the Happy Prince were filled with tears, and tears were running down his golden cheeks. His face was so beautiful in the moonlight that the little Swallow was filled with pity.</p>
<p>"Who are you?" he asked.</p>
<p>"I am the Happy Prince."</p>
<p>"Why are you weeping then?" asked the Swallow; "you have quite drenched me."</p>
    `,
  },
  {
    id: 'sample-gift-of-magi',
    title: 'The Gift of the Magi (麦琪的礼物)',
    type: 'html' as const,
    sourceLang: 'English',
    targetLang: 'Chinese (Simplified)',
    ao3Meta: {
      author: 'O. Henry (欧·亨利 · 1905 公版经典)',
      fandoms: ['世界文学杰作 / 经典都市故事'],
      rating: 'General Audiences (全年龄)',
      warnings: ['公版无版权争议作品 (Public Domain)'],
      categories: ['F/M'],
      relationships: ['Jim Young & Della Young'],
      characters: ['Della Young', 'Jim Young', 'Madame Sofronie'],
      additionalTags: [
        'Public Domain Classic',
        'Christmas Story',
        'Unconditional Love',
        'Gentle Humor',
        'Sacrifice and Heart',
      ],
      series: 'O. Henry Masterpieces #1',
      summary:
        '圣诞前夜，贫困但深爱着彼此的年轻夫妇德拉与吉姆，各自为了送给对方一件珍贵的圣诞礼物，在暗中作出了最令对方意想不到的牺牲与成全。',
      notes:
        '背景导读：欧·亨利最具代表性的短篇小说之一，公版经典名篇。以风趣幽默又饱含温情的笔调，刻画了平凡生活里最真挚动人的深情。',
      stats: { words: '2,080', chapters: '1/1' },
    },
    htmlContent: `
<h1>The Gift of the Magi</h1>
<p class="byline">by O. Henry (1905 · Public Domain)</p>
<div class="preface">
  <p><strong>Summary:</strong> Della and Jim are a young married couple deeply in love but desperately poor on Christmas Eve. In secret, each decides to sacrifice their most treasured possession to buy a precious Christmas gift for the other.</p>
  <p><strong>Themes:</strong> Unconditional Love, Irony, Warmth of Home, Short Story Classics</p>
</div>
<h2>Chapter 1: Pennies and Pride</h2>
<p>One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied.</p>
<p>Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.</p>
<p>There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.</p>
<p>While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home. A furnished flat at eight dollars a week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad.</p>
<p>Now, there were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim's gold watch that had been his father's and his grandfather's. The other was Della's hair.</p>
<blockquote>Had the Queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty's jewels and gifts. Had King Solomon been the janitor, with all his treasures piled up in the basement, Jim would have pulled out his watch every time he passed, just to see him pluck at his beard from envy.</blockquote>
<p>So now Della's beautiful hair fell about her, rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her.</p>
<p>And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.</p>
    `,
  },
];
