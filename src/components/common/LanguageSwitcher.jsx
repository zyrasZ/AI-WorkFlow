import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', nextLang);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
        className ||
        'border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
      }`}
      title={currentLang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
      style={{
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      <Globe size={13} className="text-orange-400" />
      <span className={currentLang === 'en' ? 'font-bold text-orange-400' : 'text-white/50'}>
        EN
      </span>
      <span className="text-white/30">|</span>
      <span className={currentLang === 'vi' ? 'font-bold text-orange-400' : 'text-white/50'}>
        VI
      </span>
    </button>
  );
}
