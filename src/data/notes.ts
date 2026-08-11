// 泰語旅遊手帳 —— 內容資料檔
//
// 怎麼新增一天的內容？
// 1. 複製下面任何一筆物件，貼到 `notes` 陣列最前面
// 2. day 數字 +1，date 改成今天日期（格式 "YYYY.MM.DD"）
// 3. 換成你新學的泰文單字／短句
// 4. category 只能是 CATEGORIES 裡的其中一個（想加新類別就去改 CATEGORIES）
// 5. examples 至少放 1 句、建議 2-3 句，每句都要拆 tokens（逐詞對照拼音＋中文）
// 6. note 是選填的補充小提醒，沒有就刪掉這個欄位
//
// 存檔後畫面會自動更新，不用改任何其他檔案。

export const CATEGORIES = [
  "閒聊",
  "機場／交通",
  "住宿",
  "餐廳點餐",
  "購物殺價",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Token {
  thai: string;
  roman: string;
  zh: string;
}

export interface Example {
  zh: string;
  thai: string;
  roman: string;
  tokens: Token[];
}

export interface Note {
  day: number;
  date: string;
  thai: string;
  roman: string;
  zh: string;
  category: Category;
  pattern?: string;
  examples: Example[];
  note?: string;
}

export const notes: Note[] = [
  {
    day: 40,
    date: "2026.08.30",
    thai: "สวัสดีตอนค่ำ",
    roman: "sà-wàt-dii dtaawn khâm",
    zh: "晚上好（入夜問候）",
    category: "閒聊",
    pattern: "สวัสดี + ตอน（時段）+ [เช้า／บ่าย／เย็น／ค่ำ]",
    examples: [
      {
        zh: "晚上好",
        thai: "สวัสดีตอนค่ำค่ะ",
        roman: "sà-wàt-dii dtaawn khâm khâ",
        tokens: [
          { thai: "สวัสดี", roman: "sà-wàt-dii", zh: "你好" },
          { thai: "ตอน", roman: "dtaawn", zh: "階段、時段、期間" },
          { thai: "ค่ำ", roman: "khâm", zh: "天黑、入夜" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "要去逛夜市嗎？",
        thai: "จะไปเดินตลาดกลางคืนไหมคะ",
        roman: "jà bpai dəən dtà-làat glaang-khʉʉn mǎi khá",
        tokens: [
          { thai: "จะ", roman: "jà", zh: "將要" },
          { thai: "ไปเดิน", roman: "bpai dəən", zh: "去逛、去走" },
          { thai: "ตลาดกลางคืน", roman: "dtà-làat glaang-khʉʉn", zh: "夜市" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "跟前面幾個時段問候是同一組句型，但 ตอนค่ำ 比 Day 39 的 ตอนเย็น 更晚一點、天完全黑之後才用，去逛夜市、吃消夜的時間點說這句剛好。",
  },
  {
    day: 39,
    date: "2026.08.29",
    thai: "สวัสดีตอนเย็น",
    roman: "sà-wàt-dii dtaawn yen",
    zh: "晚上好",
    category: "閒聊",
    pattern: "สวัสดี + ตอน（時段）+ [เช้า／บ่าย／เย็น／ค่ำ]",
    examples: [
      {
        zh: "晚上好",
        thai: "สวัสดีตอนเย็นค่ะ",
        roman: "sà-wàt-dii dtaawn yen khâ",
        tokens: [
          { thai: "สวัสดี", roman: "sà-wàt-dii", zh: "你好" },
          { thai: "ตอน", roman: "dtaawn", zh: "階段、時段、期間" },
          { thai: "เย็น", roman: "yen", zh: "傍晚（原意是「涼、冷」）" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "晚上好，吃晚餐了嗎？",
        thai: "ทานข้าวเย็นหรือยังคะ",
        roman: "thaan khâao yen rʉ̌ʉ yang khá",
        tokens: [
          { thai: "ทานข้าวเย็น", roman: "thaan khâao yen", zh: "吃晚餐" },
          { thai: "หรือยัง", roman: "rʉ̌ʉ yang", zh: "了沒" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "跟 สวัสดีตอนเช้า／สวัสดีตอนบ่าย 是同一組句型，是「見面問候」用的，跟 Day 38 的 ราตรีสวัสดิ์／ฝันดี（睡前道別用）意思不一樣——中文的「晚安」常常兩種情境都用，但泰文分得很清楚，別搞混了。",
  },
  {
    day: 38,
    date: "2026.08.28",
    thai: "ฝันดี",
    roman: "fǎn-dii",
    zh: "晚安（睡前道別）",
    category: "閒聊",
    pattern: "ฝันดี（固定用語，睡前道別用）",
    examples: [
      {
        zh: "晚安，祝你有個好夢",
        thai: "ฝันดีนะคะ",
        roman: "fǎn-dii ná khá",
        tokens: [
          { thai: "ฝันดี", roman: "fǎn-dii", zh: "祝你有個好夢、晚安" },
          { thai: "นะคะ", roman: "ná khá", zh: "（女性語氣詞＋禮貌詞尾）" },
        ],
      },
      {
        zh: "我要去睡了",
        thai: "จะไปนอนแล้วค่ะ",
        roman: "jà bpai naawn láaeo khâ",
        tokens: [
          { thai: "จะไป", roman: "jà bpai", zh: "要去" },
          { thai: "นอนแล้ว", roman: "naawn láaeo", zh: "睡了、要睡了" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ฝันดี 是朋友、家人之間睡前最常說的道別語，語氣親近。正式一點還有 ราตรีสวัสดิ์ 這個說法，但日常生活很少有人真的這樣說，比較常出現在賀卡、正式書信裡，聽得懂就好。",
  },
  {
    day: 37,
    date: "2026.08.27",
    thai: "สวัสดีตอนบ่าย",
    roman: "sà-wàt-dii dtaawn bàai",
    zh: "午安",
    category: "閒聊",
    pattern: "สวัสดี + ตอน（時段）+ [เช้า／บ่าย／เย็น／ค่ำ]",
    examples: [
      {
        zh: "午安",
        thai: "สวัสดีตอนบ่ายค่ะ",
        roman: "sà-wàt-dii dtaawn bàai khâ",
        tokens: [
          { thai: "สวัสดี", roman: "sà-wàt-dii", zh: "你好" },
          { thai: "ตอน", roman: "dtaawn", zh: "階段、時段、期間" },
          { thai: "บ่าย", roman: "bàai", zh: "下午" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "午安，吃午餐了嗎？",
        thai: "ทานข้าวเที่ยงหรือยังคะ",
        roman: "thaan khâao thîiang rʉ̌ʉ yang khá",
        tokens: [
          { thai: "ทานข้าวเที่ยง", roman: "thaan khâao thîiang", zh: "吃午餐" },
          { thai: "หรือยัง", roman: "rʉ̌ʉ yang", zh: "了沒" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "跟 สวัสดีตอนเช้า 是同一組句型，只換時段字——晚上想打招呼則是 สวัสดีตอนเย็น，三個換著用就能涵蓋一天。正式一點還有 ทิวาสวัสดิ์ 這個說法（呼應 Day 38 的 ราตรีสวัสดิ์），但日常生活很少有人真的這樣說，聽得懂就好，實際旅行還是 สวัสดีตอนบ่าย 比較實用。",
  },
  {
    day: 36,
    date: "2026.08.26",
    thai: "สวัสดีตอนเช้า",
    roman: "sà-wàt-dii dtaawn cháo",
    zh: "早安",
    category: "閒聊",
    pattern: "สวัสดี + ตอน（時段）+ [เช้า／บ่าย／เย็น／ค่ำ]",
    examples: [
      {
        zh: "早安",
        thai: "สวัสดีตอนเช้าค่ะ",
        roman: "sà-wàt-dii dtaawn cháo khâ",
        tokens: [
          { thai: "สวัสดี", roman: "sà-wàt-dii", zh: "你好" },
          { thai: "ตอน", roman: "dtaawn", zh: "階段、時段、期間" },
          { thai: "เช้า", roman: "cháo", zh: "早上" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "早安，吃早餐了嗎？",
        thai: "ทานข้าวเช้าหรือยังคะ",
        roman: "thaan khâao cháo rʉ̌ʉ yang khá",
        tokens: [
          { thai: "ทานข้าวเช้า", roman: "thaan khâao cháo", zh: "吃早餐" },
          { thai: "หรือยัง", roman: "rʉ̌ʉ yang", zh: "了沒" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "泰國人日常打招呼其實常常就直接說 สวัสดี，不特別分時段；但 ตอนเช้า／ตอนบ่าย／ตอนเย็น 這幾個時段字加上去，對方也完全聽得懂，遇到想特別強調的場合（卡片、正式問候）很好用。",
  },
  {
    day: 35,
    date: "2026.08.25",
    thai: "แล้วเจอกัน",
    roman: "láaeo jəə gan",
    zh: "那就再見、待會見",
    category: "閒聊",
    pattern: "แล้วเจอกัน（固定用語，道別用）",
    examples: [
      {
        zh: "那就待會見",
        thai: "แล้วเจอกันค่ะ",
        roman: "láaeo jəə gan khâ",
        tokens: [
          { thai: "แล้วเจอกัน", roman: "láaeo jəə gan", zh: "那就再見、待會見" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "明天見",
        thai: "เจอกันพรุ่งนี้ค่ะ",
        roman: "jəə gan phrûng-níi khâ",
        tokens: [
          { thai: "เจอกัน", roman: "jəə gan", zh: "見面、碰面" },
          { thai: "พรุ่งนี้", roman: "phrûng-níi", zh: "明天" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "เจอกัน 單獨用是「見面」，前面加 แล้ว（那就）變成 แล้วเจอกัน 就是最常用的道別語，後面還能接時間（像 พรุ่งนี้ 明天）指定下次見面的時候。",
  },
  {
    day: 34,
    date: "2026.08.24",
    thai: "พูดได้แค่พื้นฐาน",
    roman: "phûut dâai khɛ̂ɛ pʉ́ʉn-thǎan",
    zh: "只會說一點基礎的",
    category: "閒聊",
    pattern: "พูดได้แค่ + [程度]",
    examples: [
      {
        zh: "我泰文只會說一點基礎的",
        thai: "พูดไทยได้แค่พื้นฐานค่ะ",
        roman: "phûut thai dâai khɛ̂ɛ pʉ́ʉn-thǎan khâ",
        tokens: [
          { thai: "พูดไทย", roman: "phûut thai", zh: "說泰文" },
          { thai: "ได้แค่", roman: "dâai khɛ̂ɛ", zh: "只能、只會" },
          { thai: "พื้นฐาน", roman: "pʉ́ʉn-thǎan", zh: "基礎、基本" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "但聽懂一點點",
        thai: "แต่ฟังเข้าใจนิดหน่อยค่ะ",
        roman: "tɛ̀ɛ fang khâo-jai nít-nòi khâ",
        tokens: [
          { thai: "แต่", roman: "tɛ̀ɛ", zh: "但是" },
          { thai: "ฟัง", roman: "fang", zh: "聽" },
          { thai: "เข้าใจ", roman: "khâo-jai", zh: "懂、明白" },
          { thai: "นิดหน่อย", roman: "nít-nòi", zh: "一點點" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "跟 พูดไทยได้นิดหน่อย 意思相近，這句更強調「只到基礎程度」；先說清楚自己的程度，對方通常會放慢速度配合你。",
  },
  {
    day: 33,
    date: "2026.08.23",
    thai: "ฟังไม่รู้เรื่อง",
    roman: "fang mâi rúu-rʉ̂ang",
    zh: "聽不懂（聽了但抓不到意思）",
    category: "閒聊",
    pattern: "ฟังไม่รู้เรื่อง（固定用語）",
    examples: [
      {
        zh: "你說太快了，我聽不懂",
        thai: "พูดเร็วไป ฟังไม่รู้เรื่องค่ะ",
        roman: "phûut reo bpai, fang mâi rúu-rʉ̂ang khâ",
        tokens: [
          { thai: "พูดเร็วไป", roman: "phûut reo bpai", zh: "說太快了" },
          { thai: "ฟัง", roman: "fang", zh: "聽" },
          { thai: "ไม่", roman: "mâi", zh: "不" },
          { thai: "รู้เรื่อง", roman: "rúu-rʉ̂ang", zh: "懂、明白事情" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "可以說慢一點嗎？",
        thai: "พูดช้าๆได้ไหมคะ",
        roman: "phûut cháa-cháa dâai mǎi khá",
        tokens: [
          { thai: "พูดช้าๆ", roman: "phûut cháa-cháa", zh: "說慢一點" },
          { thai: "ได้ไหม", roman: "dâai mǎi", zh: "可以嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "ไม่เข้าใจ 是「這件事我不懂」，ฟังไม่รู้เรื่อง 更強調「聽了但完全抓不到意思」，兩句常常一起用。",
  },
  {
    day: 32,
    date: "2026.08.22",
    thai: "ไม่เข้าใจ",
    roman: "mâi khâo-jai",
    zh: "不懂、不明白",
    category: "閒聊",
    pattern: "ไม่เข้าใจ（固定用語）",
    examples: [
      {
        zh: "不好意思，我不懂",
        thai: "ขอโทษค่ะ ไม่เข้าใจ",
        roman: "khǎaw-thôot khâ, mâi khâo-jai",
        tokens: [
          { thai: "ขอโทษ", roman: "khǎaw-thôot", zh: "對不起、不好意思" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
          { thai: "ไม่เข้าใจ", roman: "mâi khâo-jai", zh: "不懂" },
        ],
      },
      {
        zh: "可以再說一次嗎？",
        thai: "พูดอีกครั้งได้ไหมคะ",
        roman: "phûut ìik khráng dâai mǎi khá",
        tokens: [
          { thai: "พูดอีกครั้ง", roman: "phûut ìik khráng", zh: "再說一次" },
          { thai: "ได้ไหม", roman: "dâai mǎi", zh: "可以嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "聽不懂時，先說 ไม่เข้าใจ 讓對方知道，再搭配「可以再說一次嗎」通常就能順利溝通。",
  },
  {
    day: 31,
    date: "2026.08.21",
    thai: "พูดไทยได้นิดหน่อย",
    roman: "phûut thai dâai nít nòi",
    zh: "會說一點點泰文",
    category: "閒聊",
    pattern: "พูด + [語言] + ได้ + [程度]",
    examples: [
      {
        zh: "我會說一點點泰文",
        thai: "พูดไทยได้นิดหน่อยค่ะ",
        roman: "phûut thai dâai nít nòi khâ",
        tokens: [
          { thai: "พูดไทย", roman: "phûut thai", zh: "說泰文" },
          { thai: "ได้", roman: "dâai", zh: "會、能" },
          { thai: "นิดหน่อย", roman: "nít nòi", zh: "一點點" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "你會說英文嗎？",
        thai: "พูดอังกฤษได้ไหมคะ",
        roman: "phûut ang-krìt dâai mǎi khá",
        tokens: [
          { thai: "พูดอังกฤษ", roman: "phûut ang-krìt", zh: "說英文" },
          { thai: "ได้ไหม", roman: "dâai mǎi", zh: "會不會、可以嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "พูด + 語言 + ได้ + 程度 是描述語言能力最基本的句型，換掉語言或程度就能套用在各種場合，也很適合鋪陳接下來要說 ไม่เข้าใจ／ฟังไม่รู้เรื่อง。",
  },
  {
    day: 30,
    date: "2026.08.20",
    thai: "ซื้อเยอะลดได้ไหม",
    roman: "súue yə́ə lót dâai mǎi",
    zh: "買多可以便宜嗎",
    category: "購物殺價",
    pattern: "ซื้อเยอะ + ลดได้ไหม",
    examples: [
      {
        zh: "買多可以便宜一點嗎？",
        thai: "ซื้อเยอะลดได้ไหมคะ",
        roman: "súue yə́ə lót dâai mǎi khá",
        tokens: [
          { thai: "ซื้อเยอะ", roman: "súue yə́ə", zh: "買很多" },
          { thai: "ลดได้ไหม", roman: "lót dâai mǎi", zh: "可以降價嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "買三件多少錢？",
        thai: "ซื้อสามชิ้นเท่าไหร่คะ",
        roman: "súue sǎam chín thâo-rài khá",
        tokens: [
          { thai: "ซื้อสามชิ้น", roman: "súue sǎam chín", zh: "買三件" },
          { thai: "เท่าไหร่", roman: "thâo-rài", zh: "多少（錢）" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "市場、批發店很吃這句，買越多通常越好談價錢，比單件殺價更有效。",
  },
  {
    day: 29,
    date: "2026.08.19",
    thai: "กินที่นี่หรือกลับบ้าน",
    roman: "gin thîi-nîi rʉ̌ʉ glàp bâan",
    zh: "內用還是外帶",
    category: "餐廳點餐",
    pattern: "กินที่นี่／กลับบ้าน（內用／外帶）；กี่ท่าน／กี่คน（詢問人數）",
    examples: [
      {
        zh: "內用還是外帶？",
        thai: "กินที่นี่หรือกลับบ้านคะ",
        roman: "gin thîi-nîi rʉ̌ʉ glàp bâan khá",
        tokens: [
          { thai: "กิน", roman: "gin", zh: "吃" },
          { thai: "ที่นี่", roman: "thîi-nîi", zh: "這裡" },
          { thai: "หรือ", roman: "rʉ̌ʉ", zh: "還是、或者" },
          { thai: "กลับบ้าน", roman: "glàp bâan", zh: "回家（帶走）" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "內用，謝謝",
        thai: "กินที่นี่ค่ะ",
        roman: "gin thîi-nîi khâ",
        tokens: [
          { thai: "กินที่นี่", roman: "gin thîi-nîi", zh: "在這裡吃、內用" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "請問幾位？（正式）",
        thai: "กี่ท่านคะ",
        roman: "gìi thâan khá",
        tokens: [
          { thai: "กี่ท่าน", roman: "gìi thâan", zh: "幾位（正式）" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "幾個人？（普通）",
        thai: "กี่คนคะ",
        roman: "gìi khon khá",
        tokens: [
          { thai: "กี่คน", roman: "gìi khon", zh: "幾個人（普通）" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "兩位",
        thai: "สองคนค่ะ",
        roman: "sǎawng khon khâ",
        tokens: [
          { thai: "สองคน", roman: "sǎawng khon", zh: "兩個人" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "กี่ท่าน 比 กี่คน 更正式有禮貌，高級一點的餐廳服務生會用 ท่าน；一般路邊攤、小吃店講 กี่คน 就很自然。回答人數直接說「數字＋คน」，兩位就是 สองคน。",
  },
  {
    day: 28,
    date: "2026.08.18",
    thai: "ขอเปลี่ยนห้อง",
    roman: "khǎaw bplìian hâwng",
    zh: "我要換房間",
    category: "住宿",
    pattern: "ขอเปลี่ยน + [名詞]",
    examples: [
      {
        zh: "我要換房間",
        thai: "ขอเปลี่ยนห้องค่ะ",
        roman: "khǎaw bplìian hâwng khâ",
        tokens: [
          { thai: "ขอเปลี่ยน", roman: "khǎaw bplìian", zh: "我要換" },
          { thai: "ห้อง", roman: "hâwng", zh: "房間" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "房間有點吵",
        thai: "ห้องเสียงดังไปหน่อยค่ะ",
        roman: "hâwng sǐiang-dang bpai nòi khâ",
        tokens: [
          { thai: "ห้อง", roman: "hâwng", zh: "房間" },
          { thai: "เสียงดังไปหน่อย", roman: "sǐiang-dang bpai nòi", zh: "有點吵" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "先說明原因（吵、壞掉等）再提出 ขอเปลี่ยนห้อง，飯店櫃檯通常會更願意配合。",
  },
  {
    day: 27,
    date: "2026.08.17",
    thai: "ลงตรงนี้",
    roman: "long dtrong-níi",
    zh: "在這裡下車",
    category: "機場／交通",
    pattern: "ลง + [地點]",
    examples: [
      {
        zh: "我要在這裡下車",
        thai: "ลงตรงนี้ค่ะ",
        roman: "long dtrong-níi khâ",
        tokens: [
          { thai: "ลง", roman: "long", zh: "下（車）" },
          { thai: "ตรงนี้", roman: "dtrong-níi", zh: "這裡" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "到了要提醒我一下",
        thai: "ถึงแล้วช่วยบอกด้วยนะคะ",
        roman: "thʉ̌ng láaeo chûai bàawk dûai ná khá",
        tokens: [
          { thai: "ถึงแล้ว", roman: "thʉ̌ng láaeo", zh: "到了" },
          { thai: "ช่วยบอกด้วย", roman: "chûai bàawk dûai", zh: "請提醒一下" },
          { thai: "นะคะ", roman: "ná khá", zh: "（女性語氣詞＋禮貌詞尾）" },
        ],
      },
    ],
    note: "ลง 是「下（交通工具）」的意思，跟之前學過的 จอด（停車）搭配使用，下車前先說一次更保險。",
  },
  {
    day: 26,
    date: "2026.08.16",
    thai: "แน่นอน",
    roman: "nɛ̂ɛ-nɔɔn",
    zh: "當然、一定",
    category: "閒聊",
    pattern: "แน่นอน（固定用語，回應用）",
    examples: [
      {
        zh: "當然！",
        thai: "แน่นอนค่ะ",
        roman: "nɛ̂ɛ-nɔɔn khâ",
        tokens: [
          { thai: "แน่นอน", roman: "nɛ̂ɛ-nɔɔn", zh: "當然、一定" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "你確定嗎？",
        thai: "แน่ใจไหมคะ",
        roman: "nɛ̂ɛ-jai mǎi khá",
        tokens: [
          { thai: "แน่ใจ", roman: "nɛ̂ɛ-jai", zh: "確定" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "แน่นอน 用來肯定回答，แน่ใจไหม 則是反過來問對方確不確定，兩個字都有「แน่」（肯定）這個字根。",
  },
  {
    day: 25,
    date: "2026.08.15",
    thai: "ขอถุง",
    roman: "khǎaw thǔng",
    zh: "請給我袋子",
    category: "購物殺價",
    pattern: "ขอ + [物品]",
    examples: [
      {
        zh: "請給我袋子",
        thai: "ขอถุงค่ะ",
        roman: "khǎaw thǔng khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我" },
          { thai: "ถุง", roman: "thǔng", zh: "袋子" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "不用袋子，謝謝",
        thai: "ไม่ต้องใช้ถุงค่ะ",
        roman: "mâi dtâwng chái thǔng khâ",
        tokens: [
          { thai: "ไม่ต้องใช้", roman: "mâi dtâwng chái", zh: "不需要用" },
          { thai: "ถุง", roman: "thǔng", zh: "袋子" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "泰國很多店家袋子要另外收費，會自備環保袋的話學會說 ไม่ต้องใช้ถุง 也很實用。",
  },
  {
    day: 24,
    date: "2026.08.14",
    thai: "ไม่ใส่ผงชูรส",
    roman: "mâi sài phǒng-chuu-rót",
    zh: "不要加味精",
    category: "餐廳點餐",
    pattern: "ไม่ใส่ + [食材]",
    examples: [
      {
        zh: "不要加味精",
        thai: "ไม่ใส่ผงชูรสค่ะ",
        roman: "mâi sài phǒng-chuu-rót khâ",
        tokens: [
          { thai: "ไม่ใส่", roman: "mâi sài", zh: "不要加" },
          { thai: "ผงชูรส", roman: "phǒng-chuu-rót", zh: "味精" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "不要加香菜",
        thai: "ไม่ใส่ผักชีค่ะ",
        roman: "mâi sài phàk-chii khâ",
        tokens: [
          { thai: "ไม่ใส่", roman: "mâi sài", zh: "不要加" },
          { thai: "ผักชี", roman: "phàk-chii", zh: "香菜" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ไม่ใส่ + 食材 是點餐排除特定食材的萬用句型，怕香菜、味精、辣都可以套用這個句型。",
  },
  {
    day: 23,
    date: "2026.08.13",
    thai: "มีวายฟายไหม",
    roman: "mii wai-fai mǎi",
    zh: "有WiFi嗎",
    category: "住宿",
    pattern: "มี + [名詞] + ไหม",
    examples: [
      {
        zh: "有WiFi嗎？",
        thai: "มีวายฟายไหมคะ",
        roman: "mii wai-fai mǎi khá",
        tokens: [
          { thai: "มี", roman: "mii", zh: "有" },
          { thai: "วายฟาย", roman: "wai-fai", zh: "WiFi" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "WiFi密碼是什麼？",
        thai: "รหัสวายฟายอะไรคะ",
        roman: "rá-hàt wai-fai à-rai khá",
        tokens: [
          { thai: "รหัส", roman: "rá-hàt", zh: "密碼" },
          { thai: "วายฟาย", roman: "wai-fai", zh: "WiFi" },
          { thai: "อะไร", roman: "à-rai", zh: "什麼" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "วายฟาย 就是英文 WiFi 的音譯，幾乎每間住宿都聽得懂，問密碼直接接 รหัส + อะไร 就好。",
  },
  {
    day: 22,
    date: "2026.08.12",
    thai: "หลงทาง",
    roman: "lǒng thaang",
    zh: "迷路了",
    category: "機場／交通",
    pattern: "หลงทาง（固定用語）",
    examples: [
      {
        zh: "我迷路了",
        thai: "หลงทางค่ะ",
        roman: "lǒng thaang khâ",
        tokens: [
          { thai: "หลงทาง", roman: "lǒng thaang", zh: "迷路" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "可以幫我看地圖嗎？",
        thai: "ช่วยดูแผนที่ให้หน่อยได้ไหมคะ",
        roman: "chûai duu phɛ̌n-thîi hâi nòi dâai-mǎi khá",
        tokens: [
          { thai: "ช่วย", roman: "chûai", zh: "幫忙" },
          { thai: "ดูแผนที่", roman: "duu phɛ̌n-thîi", zh: "看地圖" },
          { thai: "ให้หน่อย", roman: "hâi nòi", zh: "給……一下" },
          { thai: "ได้ไหม", roman: "dâai-mǎi", zh: "可以嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "迷路時先說 หลงทาง 讓對方知道狀況，再搭配問路句型會更有效率。",
  },
  {
    day: 21,
    date: "2026.08.11",
    thai: "ไม่รู้",
    roman: "mâi rúu",
    zh: "不知道",
    category: "閒聊",
    pattern: "ไม่รู้（固定用語）",
    examples: [
      {
        zh: "不知道",
        thai: "ไม่รู้ค่ะ",
        roman: "mâi rúu khâ",
        tokens: [
          { thai: "ไม่รู้", roman: "mâi rúu", zh: "不知道" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "我不知道怎麼走",
        thai: "ไม่รู้ทางค่ะ",
        roman: "mâi rúu thaang khâ",
        tokens: [
          { thai: "ไม่รู้", roman: "mâi rúu", zh: "不知道" },
          { thai: "ทาง", roman: "thaang", zh: "路、方向" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ไม่รู้ 是最直接的「不知道」，被問路但不清楚時，加上 ทาง（路）說 ไม่รู้ทาง 更完整。",
  },
  {
    day: 20,
    date: "2026.08.10",
    thai: "ขอลองใส่",
    roman: "khǎaw laawng sài",
    zh: "我要試穿",
    category: "購物殺價",
    pattern: "ขอลอง + [動詞／穿戴]",
    examples: [
      {
        zh: "我要試穿",
        thai: "ขอลองใส่ค่ะ",
        roman: "khǎaw laawng sài khâ",
        tokens: [
          { thai: "ขอลอง", roman: "khǎaw laawng", zh: "我要試" },
          { thai: "ใส่", roman: "sài", zh: "穿、戴" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "試衣間在哪裡？",
        thai: "ห้องลองเสื้ออยู่ที่ไหนคะ",
        roman: "hâwng laawng sʉ̂ʉa yùu thîi-nǎi khá",
        tokens: [
          { thai: "ห้องลองเสื้อ", roman: "hâwng laawng sʉ̂ʉa", zh: "試衣間" },
          { thai: "อยู่ที่ไหน", roman: "yùu thîi-nǎi", zh: "在哪裡" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "ขอลอง 後面接動詞就能表達「我要試試看」，買衣服、鞋子、化妝品都通用。問句結尾用高音的 คะ，不是降音的 ค่ะ。",
  },
  {
    day: 19,
    date: "2026.08.09",
    thai: "อร่อยมาก",
    roman: "àròi mâak",
    zh: "很好吃",
    category: "餐廳點餐",
    pattern: "อร่อย + มาก",
    examples: [
      {
        zh: "很好吃",
        thai: "อร่อยมากค่ะ",
        roman: "àròi mâak khâ",
        tokens: [
          { thai: "อร่อย", roman: "àròi", zh: "好吃" },
          { thai: "มาก", roman: "mâak", zh: "很、非常" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "這道菜叫什麼名字？",
        thai: "เมนูนี้ชื่ออะไรคะ",
        roman: "mee-nuu níi chʉ̂ʉ à-rai khá",
        tokens: [
          { thai: "เมนูนี้", roman: "mee-nuu níi", zh: "這道菜" },
          { thai: "ชื่ออะไร", roman: "chʉ̂ʉ à-rai", zh: "叫什麼名字" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "稱讚老闆的菜好吃，常常會換來多送一點配菜或折扣，泰國人很吃這一套。",
  },
  {
    day: 18,
    date: "2026.08.08",
    thai: "แอร์เสีย",
    roman: "aae sǐia",
    zh: "冷氣壞了",
    category: "住宿",
    pattern: "[設施] + เสีย",
    examples: [
      {
        zh: "冷氣壞了",
        thai: "แอร์เสียค่ะ",
        roman: "aae sǐia khâ",
        tokens: [
          { thai: "แอร์", roman: "aae", zh: "冷氣" },
          { thai: "เสีย", roman: "sǐia", zh: "壞了" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "熱水出不來",
        thai: "น้ำร้อนไม่ไหลค่ะ",
        roman: "náam ráawn mâi lǎi khâ",
        tokens: [
          { thai: "น้ำร้อน", roman: "náam ráawn", zh: "熱水" },
          { thai: "ไม่ไหล", roman: "mâi lǎi", zh: "不流出來" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "เสีย 泛指「壞掉、故障」，任何設備壞掉都能用「[設施] + เสีย」跟櫃檯反應。",
  },
  {
    day: 17,
    date: "2026.08.07",
    thai: "จอดตรงนี้",
    roman: "jàawt dtrong-níi",
    zh: "停在這裡",
    category: "機場／交通",
    pattern: "จอด + [地點]",
    examples: [
      {
        zh: "請停在這裡",
        thai: "จอดตรงนี้ค่ะ",
        roman: "jàawt dtrong-níi khâ",
        tokens: [
          { thai: "จอด", roman: "jàawt", zh: "停（車）" },
          { thai: "ตรงนี้", roman: "dtrong-níi", zh: "這裡" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "可以停在前面嗎？",
        thai: "จอดข้างหน้าได้ไหมคะ",
        roman: "jàawt khâang-nâa dâai-mǎi khá",
        tokens: [
          { thai: "จอด", roman: "jàawt", zh: "停（車）" },
          { thai: "ข้างหน้า", roman: "khâang-nâa", zh: "前面" },
          { thai: "ได้ไหม", roman: "dâai-mǎi", zh: "可以嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "搭嘟嘟車、計程車時很實用，快到目的地了直接說這句，比手忙腳亂比手勢清楚。",
  },
  {
    day: 16,
    date: "2026.08.06",
    thai: "ขอโทษ",
    roman: "khǎaw-thôot",
    zh: "對不起、不好意思",
    category: "閒聊",
    pattern: "ขอโทษ（固定用語，也可用來引起注意）",
    examples: [
      {
        zh: "不好意思（叫住店員或路人）",
        thai: "ขอโทษค่ะ",
        roman: "khǎaw-thôot khâ",
        tokens: [
          { thai: "ขอโทษ", roman: "khǎaw-thôot", zh: "對不起、不好意思" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "對不起，我遲到了",
        thai: "ขอโทษที่มาสายค่ะ",
        roman: "khǎaw-thôot thîi maa sǎai khâ",
        tokens: [
          { thai: "ขอโทษ", roman: "khǎaw-thôot", zh: "對不起" },
          { thai: "ที่มาสาย", roman: "thîi maa sǎai", zh: "遲到（這件事）" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ขอโทษ 用途很廣：真的道歉、想引起別人注意（像叫服務生）、甚至借過都可以用這句開頭。",
  },
  {
    day: 15,
    date: "2026.08.05",
    thai: "มีสีอื่นไหม",
    roman: "mii sǐi ʉ̀ʉn mǎi",
    zh: "有其他顏色嗎",
    category: "購物殺價",
    pattern: "มี + [名詞] + อื่นไหม",
    examples: [
      {
        zh: "有其他顏色嗎？",
        thai: "มีสีอื่นไหมคะ",
        roman: "mii sǐi ʉ̀ʉn mǎi khá",
        tokens: [
          { thai: "มี", roman: "mii", zh: "有" },
          { thai: "สีอื่น", roman: "sǐi ʉ̀ʉn", zh: "其他顏色" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "有大一點的尺寸嗎？",
        thai: "มีไซส์ใหญ่กว่านี้ไหมคะ",
        roman: "mii sái yài gwàa níi mǎi khá",
        tokens: [
          { thai: "มี", roman: "mii", zh: "有" },
          { thai: "ไซส์", roman: "sái", zh: "尺寸" },
          { thai: "ใหญ่กว่านี้", roman: "yài gwàa níi", zh: "比這個大、更大" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "มี...ไหม 是問「有沒有」最基本的句型，殺價前先確認有沒有想要的款式、尺寸再開口。",
  },
  {
    day: 14,
    date: "2026.08.04",
    thai: "ขอน้ำเปล่า",
    roman: "khǎaw náam bplàao",
    zh: "請給我白開水",
    category: "餐廳點餐",
    pattern: "ขอ + [飲料／食物]",
    examples: [
      {
        zh: "請給我白開水",
        thai: "ขอน้ำเปล่าค่ะ",
        roman: "khǎaw náam bplàao khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我" },
          { thai: "น้ำเปล่า", roman: "náam bplàao", zh: "白開水" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "請給我一杯冰咖啡",
        thai: "ขอกาแฟเย็นแก้วนึงค่ะ",
        roman: "khǎaw gaa-fɛɛ yen gɛ̂ɛo nʉng khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我" },
          { thai: "กาแฟเย็น", roman: "gaa-fɛɛ yen", zh: "冰咖啡" },
          { thai: "แก้วนึง", roman: "gɛ̂ɛo nʉng", zh: "一杯" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ขอ 是點餐萬用開頭，泰國餐廳幾乎不用「我要」，直接 ขอ + 想要的東西 就好。",
  },
  {
    day: 13,
    date: "2026.08.03",
    thai: "ขอผ้าเช็ดตัวเพิ่ม",
    roman: "khǎaw phâa-chét-dtua phêəm",
    zh: "請多給我一條毛巾",
    category: "住宿",
    pattern: "ขอ + [物品] + เพิ่ม",
    examples: [
      {
        zh: "請多給我一條毛巾",
        thai: "ขอผ้าเช็ดตัวเพิ่มค่ะ",
        roman: "khǎaw phâa-chét-dtua phêəm khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我" },
          { thai: "ผ้าเช็ดตัว", roman: "phâa-chét-dtua", zh: "毛巾" },
          { thai: "เพิ่ม", roman: "phêəm", zh: "多、加" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "請再給一顆枕頭",
        thai: "ขอหมอนเพิ่มอีกใบค่ะ",
        roman: "khǎaw mǎawn phêəm ìik bai khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我" },
          { thai: "หมอน", roman: "mǎawn", zh: "枕頭" },
          { thai: "เพิ่มอีกใบ", roman: "phêəm ìik bai", zh: "再多一個" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ขอ + 物品 + เพิ่ม 是跟飯店要額外備品的萬用句型，換掉中間的名詞就能要任何東西。",
  },
  {
    day: 12,
    date: "2026.08.02",
    thai: "ไปยังไง",
    roman: "bpai yang-ngai",
    zh: "怎麼去",
    category: "機場／交通",
    pattern: "[地點] + ไปยังไง",
    examples: [
      {
        zh: "怎麼去車站？",
        thai: "สถานีไปยังไงคะ",
        roman: "sà-thǎa-nii bpai yang-ngai khá",
        tokens: [
          { thai: "สถานี", roman: "sà-thǎa-nii", zh: "車站" },
          { thai: "ไปยังไง", roman: "bpai yang-ngai", zh: "怎麼去" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
      {
        zh: "從這裡怎麼去機場？",
        thai: "จากที่นี่ไปสนามบินยังไงคะ",
        roman: "jàak thîi-nîi bpai sà-nǎam-bin yang-ngai khá",
        tokens: [
          { thai: "จากที่นี่", roman: "jàak thîi-nîi", zh: "從這裡" },
          { thai: "ไปสนามบิน", roman: "bpai sà-nǎam-bin", zh: "去機場" },
          { thai: "ยังไง", roman: "yang-ngai", zh: "怎麼" },
          { thai: "คะ", roman: "khá", zh: "（女性疑問句禮貌詞尾）" },
        ],
      },
    ],
    note: "問路句尾用高音的 คะ，不是降音的 ค่ะ——女生問問題結尾都用 คะ，回答／敘述才用 ค่ะ。",
  },
  {
    day: 11,
    date: "2026.08.01",
    thai: "ยินดีที่ได้รู้จัก",
    roman: "yin-dii thîi dâai rúu-jàk",
    zh: "很高興認識你",
    category: "閒聊",
    pattern: "ยินดีที่ได้รู้จัก（固定用語，初次見面用）",
    examples: [
      {
        zh: "很高興認識你",
        thai: "ยินดีที่ได้รู้จักค่ะ",
        roman: "yin-dii thîi dâai rúu-jàk khâ",
        tokens: [
          { thai: "ยินดีที่ได้รู้จัก", roman: "yin-dii thîi dâai rúu-jàk", zh: "很高興認識你" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "我也是（回應對方）",
        thai: "ยินดีเช่นกันค่ะ",
        roman: "yin-dii chên-gan khâ",
        tokens: [
          { thai: "ยินดีเช่นกัน", roman: "yin-dii chên-gan", zh: "我也是（很高興）" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "這句通常在自我介紹後說，對方也會回你這句或 ยินดีเช่นกัน，是社交場合的標準開場白。",
  },
  {
    day: 6,
    date: "2026.07.27",
    thai: "อยู่ที่ไหน",
    roman: "yùu thîi-nǎi",
    zh: "在哪裡",
    category: "機場／交通",
    pattern: "[地點／東西] + อยู่ที่ไหน",
    examples: [
      {
        zh: "廁所在哪裡？",
        thai: "ห้องน้ำอยู่ที่ไหน",
        roman: "hâwng-náam yùu thîi-nǎi",
        tokens: [
          { thai: "ห้องน้ำ", roman: "hâwng-náam", zh: "廁所" },
          { thai: "อยู่ที่ไหน", roman: "yùu thîi-nǎi", zh: "在哪裡" },
        ],
      },
      {
        zh: "車站在哪裡？",
        thai: "สถานีอยู่ที่ไหน",
        roman: "sà-thǎa-nii yùu thîi-nǎi",
        tokens: [
          { thai: "สถานี", roman: "sà-thǎa-nii", zh: "車站" },
          { thai: "อยู่ที่ไหน", roman: "yùu thîi-nǎi", zh: "在哪裡" },
        ],
      },
    ],
    note: "อยู่ที่ไหน 幾乎能接在任何地點名詞後面問位置，是問路必背句型。",
  },
  {
    day: 10,
    date: "2026.07.31",
    thai: "รับบัตรไหม",
    roman: "ráp bàt mǎi",
    zh: "可以刷卡嗎",
    category: "購物殺價",
    pattern: "รับ + [付款方式] + ไหม",
    examples: [
      {
        zh: "可以刷卡嗎？",
        thai: "รับบัตรไหม",
        roman: "ráp bàt mǎi",
        tokens: [
          { thai: "รับ", roman: "ráp", zh: "收、接受" },
          { thai: "บัตร", roman: "bàt", zh: "卡（信用卡）" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
        ],
      },
      {
        zh: "可以用現金嗎？",
        thai: "รับเงินสดไหม",
        roman: "ráp ngən-sòt mǎi",
        tokens: [
          { thai: "รับ", roman: "ráp", zh: "收、接受" },
          { thai: "เงินสด", roman: "ngən-sòt", zh: "現金" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
        ],
      },
    ],
    note: "小店、市場常常不收卡，先問一句 รับบัตรไหม 確認付款方式，才不會結帳時尷尬。",
  },
  {
    day: 9,
    date: "2026.07.30",
    thai: "ไม่เป็นไร",
    roman: "mâi bpen rai",
    zh: "沒關係、不客氣",
    category: "閒聊",
    pattern: "ไม่เป็นไร（固定用語）",
    examples: [
      {
        zh: "沒關係（朋友間，輕鬆語氣）",
        thai: "ไม่เป็นไร",
        roman: "mâi bpen rai",
        tokens: [{ thai: "ไม่เป็นไร", roman: "mâi bpen rai", zh: "沒關係、不客氣" }],
      },
      {
        zh: "不客氣（禮貌回應）",
        thai: "ไม่เป็นไรค่ะ",
        roman: "mâi bpen rai khâ",
        tokens: [
          { thai: "ไม่เป็นไร", roman: "mâi bpen rai", zh: "沒關係" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ไม่เป็นไร 用途很廣：別人跟你說 ขอบคุณ 時可以回這句，不小心撞到人道歉時對方也常回這句。朋友間可以省略語尾詞，正式場合加 ค่ะ 更禮貌。",
  },
  {
    day: 8,
    date: "2026.07.29",
    thai: "ขอเช็คบิล",
    roman: "khǎaw chek-bin",
    zh: "請結帳、買單",
    category: "餐廳點餐",
    pattern: "ขอเช็คบิล／เช็คบิล／เก็บเงิน（結帳相關用語）",
    examples: [
      {
        zh: "請幫我結帳",
        thai: "ขอเช็คบิลค่ะ",
        roman: "khǎaw chek-bin khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我／要求" },
          { thai: "เช็คบิล", roman: "chek-bin", zh: "結帳、買單" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "一共多少錢？",
        thai: "ทั้งหมดเท่าไหร่",
        roman: "tháng-mòt thâo-rài",
        tokens: [
          { thai: "ทั้งหมด", roman: "tháng-mòt", zh: "總共、全部" },
          { thai: "เท่าไหร่", roman: "thâo-rài", zh: "多少（錢）" },
        ],
      },
      {
        zh: "（補充）麻煩結帳",
        thai: "เช็คบิลค่ะ",
        roman: "chek-bin khâ",
        tokens: [
          { thai: "เช็คบิล", roman: "chek-bin", zh: "結帳、買單" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "（補充）麻煩收一下錢",
        thai: "เก็บเงินด้วยค่ะ",
        roman: "gèp ngən dûai khâ",
        tokens: [
          { thai: "เก็บ", roman: "gèp", zh: "收、收集" },
          { thai: "เงิน", roman: "ngən", zh: "錢、銀子" },
          { thai: "ด้วย", roman: "dûai", zh: "麻煩、請…一下" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "（補充）請分開結帳",
        thai: "ขอแยกบิลค่ะ",
        roman: "khǎaw yɛ̂ɛk bin khâ",
        tokens: [
          { thai: "ขอแยก", roman: "khǎaw yɛ̂ɛk", zh: "請分開" },
          { thai: "บิล", roman: "bin", zh: "帳單" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "（補充）一起結帳就好",
        thai: "รวมบิลก็ได้ค่ะ",
        roman: "ruam bin gôr dâai khâ",
        tokens: [
          { thai: "รวมบิล", roman: "ruam bin", zh: "合併帳單" },
          { thai: "ก็ได้", roman: "gôr dâai", zh: "也可以、就好" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "เช็คบิล 是英文 check bill 的音譯，泰國餐廳結帳幾乎通用這句，比 คิดเงิน 更常聽到；正式一點會說 ขอเช็คบิล，小吃攤、路邊攤這種隨興場合則常直接說 เช็คบิล 或 เก็บเงิน（收錢），不一定要加 ขอ。跟朋友聚餐想指定付款方式的話，可以用 ขอแยกบิล（分開付）或 รวมบิลก็ได้（一起付），這兩句剛好是一組相反詞。",
  },
  {
    day: 7,
    date: "2026.07.28",
    thai: "ขอเช็คอิน",
    roman: "khǎaw chék-in",
    zh: "我要辦理入住",
    category: "住宿",
    pattern: "ขอ + เช็คอิน",
    examples: [
      {
        zh: "我要辦理入住",
        thai: "ขอเช็คอินค่ะ",
        roman: "khǎaw chék-in khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我／要求" },
          { thai: "เช็คอิน", roman: "chék-in", zh: "辦理入住" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "幾點退房？",
        thai: "เช็คเอาท์กี่โมง",
        roman: "chék-áo gìi moong",
        tokens: [
          { thai: "เช็คเอาท์", roman: "chék-áo", zh: "退房" },
          { thai: "กี่โมง", roman: "gìi moong", zh: "幾點" },
        ],
      },
    ],
    note: "เช็คอิน／เช็คเอาท์ 都是英文音譯，飯店櫃檯人員幾乎都聽得懂，比硬背泰文原生詞更實用。",
  },
  {
    day: 5,
    date: "2026.07.26",
    thai: "ลดหน่อยได้ไหม",
    roman: "lót nòi dâai mǎi",
    zh: "可以便宜一點嗎",
    category: "購物殺價",
    pattern: "ลด(ราคา) + หน่อย + ได้ไหม",
    examples: [
      {
        zh: "可以算便宜一點嗎？",
        thai: "ลดราคาหน่อยได้ไหม",
        roman: "lót raa-khaa nòi dâai mǎi",
        tokens: [
          { thai: "ลดราคา", roman: "lót raa-khaa", zh: "降價" },
          { thai: "หน่อย", roman: "nòi", zh: "一點" },
          { thai: "ได้ไหม", roman: "dâai mǎi", zh: "可以嗎" },
        ],
      },
      {
        zh: "有點貴，可以降價嗎？",
        thai: "แพงไปหน่อย ลดได้ไหม",
        roman: "phaaeng bpai nòi, lót dâai mǎi",
        tokens: [
          { thai: "แพงไปหน่อย", roman: "phaaeng bpai nòi", zh: "有點太貴" },
          { thai: "ลดได้ไหม", roman: "lót dâai mǎi", zh: "可以降價嗎" },
        ],
      },
    ],
    note: "殺價時先說 แพงไปหน่อย（有點貴）鋪陳語氣，再問 ลดได้ไหม 通常比較容易成功。",
  },
  {
    day: 4,
    date: "2026.07.25",
    thai: "ไม่เผ็ด",
    roman: "mâi phèt",
    zh: "不辣",
    category: "餐廳點餐",
    pattern: "ขอ + เผ็ด／ไม่ + [程度]；พริก + [數字] + เม็ด",
    examples: [
      {
        zh: "請不要辣",
        thai: "ขอไม่เผ็ดค่ะ",
        roman: "khǎaw mâi phèt khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我／要求" },
          { thai: "ไม่", roman: "mâi", zh: "不" },
          { thai: "เผ็ด", roman: "phèt", zh: "辣" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "不要太甜",
        thai: "ไม่หวานมาก",
        roman: "mâi wǎan mâak",
        tokens: [
          { thai: "ไม่", roman: "mâi", zh: "不" },
          { thai: "หวาน", roman: "wǎan", zh: "甜" },
          { thai: "มาก", roman: "mâak", zh: "很、非常" },
        ],
      },
      {
        zh: "我要一點點辣（微辣）",
        thai: "ขอเผ็ดนิดหน่อยค่ะ",
        roman: "khǎaw phèt nít-nòi khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我、我要" },
          { thai: "เผ็ด", roman: "phèt", zh: "辣" },
          { thai: "นิดหน่อย", roman: "nít-nòi", zh: "一點點" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "我要少辣",
        thai: "ขอเผ็ดน้อยค่ะ",
        roman: "khǎaw phèt nói khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我、我要" },
          { thai: "เผ็ด", roman: "phèt", zh: "辣" },
          { thai: "น้อย", roman: "nói", zh: "少、一點" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "我要中辣",
        thai: "ขอเผ็ดกลางค่ะ",
        roman: "khǎaw phèt glaang khâ",
        tokens: [
          { thai: "ขอ", roman: "khǎaw", zh: "請給我、我要" },
          { thai: "เผ็ด", roman: "phèt", zh: "辣" },
          { thai: "กลาง", roman: "glaang", zh: "中等、中間" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "麻煩放一顆辣椒就好",
        thai: "ขอใส่พริกนึงเม็ดค่ะ",
        roman: "khǎaw sài phrík nʉng mét khâ",
        tokens: [
          { thai: "ขอใส่", roman: "khǎaw sài", zh: "請放、麻煩加" },
          { thai: "พริก", roman: "phrík", zh: "辣椒" },
          { thai: "นึง", roman: "nʉng", zh: "一（數字，口語）" },
          { thai: "เม็ด", roman: "mét", zh: "顆（量詞）" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "給我泰國人吃的口味（辣度比照當地人）",
        thai: "เอาแบบคนไทยค่ะ",
        roman: "ao bɛ̀ɛp khon-thai khâ",
        tokens: [
          { thai: "เอาแบบ", roman: "ao bɛ̀ɛp", zh: "要…的樣子、比照" },
          { thai: "คนไทย", roman: "khon-thai", zh: "泰國人" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "點餐先說 ขอ（要／請給我）再接需求，是泰式點餐最常見的句型，換掉後面的形容詞就能表達各種要求。辣度可以用 ไม่เผ็ด（不辣）、เผ็ดนิดหน่อย（微辣）、เผ็ดน้อย（少辣）、เผ็ดกลาง（中辣）這幾級回答；想更精準，也可以直接指定辣椒顆數（พริก + 數字 + เม็ด）。想挑戰道地辣度可以說 เอาแบบคนไทย，但要有心理準備真的會很辣。",
  },
  {
    day: 3,
    date: "2026.07.24",
    thai: "มีห้องว่างไหม",
    roman: "mii hâwng wâang mǎi",
    zh: "有空房嗎",
    category: "住宿",
    pattern: "มี + [名詞] + ไหม",
    examples: [
      {
        zh: "今晚有空房嗎？",
        thai: "คืนนี้มีห้องว่างไหม",
        roman: "khʉʉn-níi mii hâwng wâang mǎi",
        tokens: [
          { thai: "คืนนี้", roman: "khʉʉn-níi", zh: "今晚" },
          { thai: "มี", roman: "mii", zh: "有" },
          { thai: "ห้องว่าง", roman: "hâwng wâang", zh: "空房" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎（疑問語氣詞）" },
        ],
      },
      {
        zh: "有雙人房嗎？",
        thai: "มีห้องเตียงคู่ไหม",
        roman: "mii hâwng dtiiang-khûu mǎi",
        tokens: [
          { thai: "มี", roman: "mii", zh: "有" },
          { thai: "ห้องเตียงคู่", roman: "hâwng dtiiang-khûu", zh: "雙人房" },
          { thai: "ไหม", roman: "mǎi", zh: "嗎" },
        ],
      },
    ],
    note: "ไหม 放句尾表示疑問，語氣像中文的『嗎』，訂房、問路、點餐都很常用。",
  },
  {
    day: 2,
    date: "2026.07.23",
    thai: "เท่าไหร่",
    roman: "thâo-rài",
    zh: "多少（錢）",
    category: "機場／交通",
    pattern: "[東西／地點] + เท่าไหร่",
    examples: [
      {
        zh: "到機場多少錢？",
        thai: "ไปสนามบินเท่าไหร่",
        roman: "bpai sà-nǎam-bin thâo-rài",
        tokens: [
          { thai: "ไป", roman: "bpai", zh: "去" },
          { thai: "สนามบิน", roman: "sà-nǎam-bin", zh: "機場" },
          { thai: "เท่าไหร่", roman: "thâo-rài", zh: "多少（錢）" },
        ],
      },
      {
        zh: "這個多少錢？",
        thai: "อันนี้เท่าไหร่",
        roman: "an-níi thâo-rài",
        tokens: [
          { thai: "อันนี้", roman: "an-níi", zh: "這個" },
          { thai: "เท่าไหร่", roman: "thâo-rài", zh: "多少（錢）" },
        ],
      },
    ],
    note: "เท่าไหร่ 是問價錢、問車資的萬用句尾，前面接地點或東西名稱就能問價。",
  },
  {
    day: 1,
    date: "2026.07.22",
    thai: "ขอบคุณ",
    roman: "khàawp-khun",
    zh: "謝謝",
    category: "閒聊",
    pattern: "ขอบคุณ + (ครับ／ค่ะ)",
    examples: [
      {
        zh: "謝謝你",
        thai: "ขอบคุณค่ะ",
        roman: "khàawp-khun khâ",
        tokens: [
          { thai: "ขอบคุณ", roman: "khàawp-khun", zh: "謝謝" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
      {
        zh: "非常感謝",
        thai: "ขอบคุณมากค่ะ",
        roman: "khàawp-khun mâak khâ",
        tokens: [
          { thai: "ขอบคุณ", roman: "khàawp-khun", zh: "謝謝" },
          { thai: "มาก", roman: "mâak", zh: "很、非常" },
          { thai: "ค่ะ", roman: "khâ", zh: "（女性禮貌詞尾）" },
        ],
      },
    ],
    note: "ขอบคุณ 是最基本也最常用的禮貌用語，句尾加 ครับ（男性）或 ค่ะ（女性）語氣更完整道地。",
  },
];

// 依 day 由新到舊排序後即為預設顯示順序
export const sortedNotes = [...notes].sort((a, b) => b.day - a.day);

// 複習測驗題庫：把所有例句攤平，每題自帶所屬的 day
export interface QuizExample extends Example {
  day: number;
}

export const quizPool: QuizExample[] = notes.flatMap((n) =>
  n.examples.map((ex) => ({ ...ex, day: n.day }))
);
