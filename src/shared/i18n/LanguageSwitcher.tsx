import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "full" | "compact";
}

export function LanguageSwitcher({ variant = "full" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
        title={
          i18n.language === "vi"
            ? "Switch to English"
            : "Chuyển sang tiếng Việt"
        }
      >
        <Languages className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150"
      title={
        i18n.language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"
      }
    >
      <div className="flex items-center gap-3">
        <Languages className="w-4 h-4 text-[#2563EB] dark:text-[#22D3EE]" />
        <span
          className="text-slate-600 dark:text-slate-300"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          {i18n.language === "vi" ? "English" : "Tiếng Việt"}
        </span>
      </div>
      <div
        className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700"
        style={{ fontSize: "10px", fontWeight: 600 }}
      >
        <span
          className={
            i18n.language === "en"
              ? "text-[#2563EB] dark:text-[#22D3EE]"
              : "text-slate-400"
          }
        >
          EN
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span
          className={
            i18n.language === "vi"
              ? "text-[#2563EB] dark:text-[#22D3EE]"
              : "text-slate-400"
          }
        >
          VI
        </span>
      </div>
    </button>
  );
}
