import { Globe } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'no', name: 'Norsk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'cs', name: 'Čeština' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ro', name: 'Română' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'fa', name: 'فارسی' },
  { code: 'ur', name: 'اردو' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'my', name: 'မြန်မာ' },
  { code: 'km', name: 'ខ្មែរ' },
  { code: 'lo', name: 'ລາວ' },
  { code: 'si', name: 'සිංහල' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Shqip' },
  { code: 'hy', name: 'Հայերեն' },
  { code: 'az', name: 'Azərbaycanca' },
  { code: 'be', name: 'Беларусь' },
  { code: 'bg', name: 'Български' },
  { code: 'ca', name: 'Català' },
  { code: 'et', name: 'Eesti' },
  { code: 'gl', name: 'Galego' },
  { code: 'ka', name: 'ქართული' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'ht', name: 'Kreyòl Ayisyen' },
  { code: 'is', name: 'Íslenska' },
  { code: 'jv', name: 'Basa Jawa' },
  { code: 'kk', name: 'Қазақ' },
  { code: 'ky', name: 'Кыргызча' },
  { code: 'lb', name: 'Lëtzebuergesch' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'mk', name: 'Македонски' },
  { code: 'mt', name: 'Malti' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'so', name: 'Soomaali' },
  { code: 'sr', name: 'Српски' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'tg', name: 'Тоҷикӣ' },
  { code: 'tk', name: 'Türkmençe' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'ff', name: 'Fulfulde' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ig', name: 'Igbo' },
  { code: 'yo', name: 'Yorùbá' },
];

const SUPPORTED_LANGUAGES = new Set(['en', 'es', 'fr', 'zh', 'hi', 'ar', 'bn', 'pt', 'ru', 'ur', 'ja', 'af', 'zu', 'xh']);

export default function LanguageDialog({ open, onOpenChange, language, onLanguageChange }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const aSupported = SUPPORTED_LANGUAGES.has(a.code);
    const bSupported = SUPPORTED_LANGUAGES.has(b.code);
    if (aSupported === bSupported) return 0;
    return aSupported ? -1 : 1;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t('settingsDialogs.languageTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('settingsDialogs.languageDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Input
            placeholder={t('settingsDialogs.searchLanguages')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="h-[300px] border rounded-lg overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="p-2 space-y-1">
              {filtered.map((lang) => {
                const isSelected = language === lang.code;
                const isSupported = SUPPORTED_LANGUAGES.has(lang.code);
                return (
                  <button
                    key={lang.code}
                    disabled={!isSupported}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      onOpenChange(false);
                    }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : isSupported
                          ? 'hover:bg-muted text-foreground'
                          : 'opacity-40 cursor-not-allowed text-muted-foreground'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}