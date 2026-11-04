// Religion/Faith data: religions, their referenced sacred books, and translations
// Covers the most popular faiths practiced in the 10 priority language regions

export const RELIGIONS = [
  {
    code: 'christianity',
    label: 'Christianity',
    books: [
      {
        code: 'holy_bible',
        label: 'The Holy Bible',
        translations: [
          { code: 'NIV', label: 'New International Version (NIV)' },
          { code: 'KJV', label: 'King James Version (KJV)' },
          { code: 'ESV', label: 'English Standard Version (ESV)' },
          { code: 'NLT', label: 'New Living Translation (NLT)' },
          { code: 'NASB', label: 'New American Standard Bible (NASB)' },
          { code: 'AMP', label: 'Amplified Bible (AMP)' },
          { code: 'NKJV', label: 'New King James Version (NKJV)' },
          { code: 'MSG', label: 'The Message (MSG)' },
          { code: 'CSB', label: 'Christian Standard Bible (CSB)' },
          { code: 'TPT', label: 'The Passion Translation (TPT)' },
          { code: 'RSV', label: 'Revised Standard Version (RSV)' },
          { code: 'NRSV', label: 'New Revised Standard Version (NRSV)' },
          { code: 'GNT', label: 'Good News Translation (GNT)' },
          { code: 'CEV', label: 'Contemporary English Version (CEV)' },
        ],
      },
    ],
  },
  {
    code: 'islam',
    label: 'Islam',
    books: [
      {
        code: 'holy_quran',
        label: 'The Holy Quran',
        translations: [
          { code: 'sahih_international', label: 'Sahih International' },
          { code: 'abdel_haleem', label: 'Abdel Haleem Translation' },
          { code: 'yusuf_ali', label: 'Yusuf Ali Translation' },
          { code: 'pickthall', label: 'Pickthall Translation' },
          { code: 'shakir', label: 'Shakir Translation' },
          { code: 'muhammad_asad', label: 'Muhammad Asad Translation' },
          { code: 'muhammad_sarwar', label: 'Muhammad Sarwar Translation' },
          { code: 'daryabadi', label: 'Abdul Majid Daryabadi Translation' },
          { code: 'jalalayn', label: 'Tafsir al-Jalalayn' },
        ],
      },
    ],
  },
  {
    code: 'hinduism',
    label: 'Hinduism',
    books: [
      {
        code: 'bhagavad_gita',
        label: 'The Bhagavad Gita',
        translations: [
          { code: 'sivananda', label: 'Swami Sivananda Translation' },
          { code: 'prabhupada', label: 'A.C. Bhaktivedanta Swami Prabhupada' },
          { code: 'vivekananda', label: 'Swami Vivekananda Translation' },
          { code: 'easwaran_gita', label: 'Eknath Easwaran Translation' },
          { code: 'purohit', label: 'Shri Purohit Swami Translation' },
          { code: 'gandhi', label: 'Mahatma Gandhi Translation' },
        ],
      },
      {
        code: 'vedas',
        label: 'The Vedas',
        translations: [
          { code: 'griffith', label: 'Ralph T.H. Griffith Translation' },
          { code: 'doniger', label: 'Wendy Doniger Translation' },
          { code: 'bloomfield', label: 'Maurice Bloomfield Translation' },
        ],
      },
      {
        code: 'upanishads',
        label: 'The Upanishads',
        translations: [
          { code: 'nikhilananda', label: 'Swami Nikhilananda Translation' },
          { code: 'easwaran_upan', label: 'Eknath Easwaran Translation' },
          { code: 'max_muller', label: 'Max Müller Translation' },
          { code: 'prabhavananda', label: 'Swami Prabhavananda Translation' },
        ],
      },
    ],
  },
  {
    code: 'buddhism',
    label: 'Buddhism',
    books: [
      {
        code: 'dhammapada',
        label: 'The Dhammapada',
        translations: [
          { code: 'buddharakkhita', label: 'Acharya Buddharakkhita Translation' },
          { code: 'thanissaro', label: 'Thanissaro Bhikkhu Translation' },
          { code: 'easwaran_dhamma', label: 'Eknath Easwaran Translation' },
          { code: 'mascaro', label: 'Juan Mascaró Translation' },
        ],
      },
      {
        code: 'tripitaka',
        label: 'The Tripitaka (Pali Canon)',
        translations: [
          { code: 'horner', label: 'I.B. Horner Translation' },
          { code: 'bodhi', label: 'Bhikkhu Bodhi Translation' },
        ],
      },
    ],
  },
  {
    code: 'judaism',
    label: 'Judaism',
    books: [
      {
        code: 'torah',
        label: 'The Torah / Tanakh',
        translations: [
          { code: 'jps', label: 'Jewish Publication Society (JPS)' },
          { code: 'artscroll', label: 'ArtScroll Translation' },
          { code: 'alter', label: 'Robert Alter Translation' },
          { code: 'fox', label: 'Everett Fox Translation' },
        ],
      },
    ],
  },
  {
    code: 'sikhism',
    label: 'Sikhism',
    books: [
      {
        code: 'guru_granth_sahib',
        label: 'The Guru Granth Sahib',
        translations: [
          { code: 'talib', label: 'Gurbachan Singh Talib Translation' },
          { code: 'makin', label: 'G.S. Makin Translation' },
          { code: 'khalsa', label: 'Khalsa Consensus Translation' },
        ],
      },
    ],
  },
  {
    code: 'taoism',
    label: 'Taoism',
    books: [
      {
        code: 'tao_te_ching',
        label: 'The Tao Te Ching',
        translations: [
          { code: 'mitchell', label: 'Stephen Mitchell Translation' },
          { code: 'english_feng', label: 'Jane English & Gia-Fu Feng' },
          { code: 'waley', label: 'Arthur Waley Translation' },
          { code: 'dclau', label: 'D.C. Lau Translation' },
          { code: 'star', label: 'Jonathan Star Translation' },
        ],
      },
    ],
  },
  {
    code: 'shinto',
    label: 'Shinto',
    books: [
      {
        code: 'kojiki',
        label: 'The Kojiki (Record of Ancient Matters)',
        translations: [
          { code: 'chamberlain', label: 'Basil Hall Chamberlain Translation (1882)' },
          { code: 'philippi', label: 'Donald L. Philippi Translation (1968)' },
          { code: 'heldt', label: 'Gustav Heldt Translation (2014)' },
        ],
      },
      {
        code: 'nihon_shoki',
        label: 'The Nihon Shoki (Chronicles of Japan)',
        translations: [
          { code: 'aston', label: 'W.G. Aston Translation (1896)' },
          { code: 'florenz', label: 'Karl Florenz Translation' },
        ],
      },
    ],
  },
];

// Default selections
export const DEFAULT_RELIGION = 'christianity';
export const DEFAULT_BOOK = 'holy_bible';
export const DEFAULT_TRANSLATION = 'NIV';

// Helper: get religion by code
export const getReligion = (code) => RELIGIONS.find(r => r.code === code) || RELIGIONS[0];

// Helper: get book by code within a religion
export const getBook = (religionCode, bookCode) => {
  const religion = getReligion(religionCode);
  return religion.books.find(b => b.code === bookCode) || religion.books[0];
};

// Helper: get translation label
export const getTranslationLabel = (religionCode, bookCode, translationCode) => {
  const book = getBook(religionCode, bookCode);
  return book.translations.find(t => t.code === translationCode)?.label || translationCode;
};

// Helper: get religion label
export const getReligionLabel = (code) => getReligion(code).label;

// Helper: get book label
export const getBookLabel = (religionCode, bookCode) => getBook(religionCode, bookCode).label;