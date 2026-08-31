/* eslint-disable i18next/no-literal-string -- localized copy comes from the T map; the only inline literals are the "404" numeral and the phone number, which are not translatable strings */
import Link from "next/link";
import { Home, Search, Phone } from "lucide-react";
import { getLocale } from "next-intl/server";

// A locale-segment not-found boundary. Without this file, `notFound()` raised
// inside a /[locale]/… route (e.g. a delisted /property/<slug>) rendered the
// root app/not-found.tsx but returned HTTP 200 — a soft-404 that let Google
// park the URL as a homepage "alternate" instead of dropping it. Providing the
// boundary here makes next-intl return a proper 404 status for locale routes.
const T: Record<
  string,
  { title: string; body: string; home: string; search: string; help: string }
> = {
  en: { title: "Page Not Found", body: "The page you're looking for doesn't exist or may have been moved. Let us help you find what you need.", home: "Back to Home", search: "Search Properties", help: "Need help?" },
  fr: { title: "Page introuvable", body: "La page que vous recherchez n'existe pas ou a été déplacée. Laissez-nous vous aider à trouver ce qu'il vous faut.", home: "Retour à l'accueil", search: "Rechercher des biens", help: "Besoin d'aide ?" },
  ru: { title: "Страница не найдена", body: "Страница, которую вы ищете, не существует или была перемещена. Позвольте помочь вам найти нужное.", home: "На главную", search: "Поиск недвижимости", help: "Нужна помощь?" },
  ar: { title: "الصفحة غير موجودة", body: "الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها. دعنا نساعدك في العثور على ما تحتاجه.", home: "العودة إلى الرئيسية", search: "ابحث عن العقارات", help: "بحاجة إلى مساعدة؟" },
  zh: { title: "页面未找到", body: "您访问的页面不存在或已被移动。让我们帮您找到所需内容。", home: "返回首页", search: "搜索房源", help: "需要帮助？" },
  vi: { title: "Không tìm thấy trang", body: "Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy để chúng tôi giúp bạn tìm thứ cần thiết.", home: "Về trang chủ", search: "Tìm bất động sản", help: "Cần trợ giúp?" },
  he: { title: "הדף לא נמצא", body: "הדף שחיפשת אינו קיים או שהועבר. הרשו לנו לעזור לכם למצוא את מה שאתם צריכים.", home: "חזרה לדף הבית", search: "חיפוש נכסים", help: "צריכים עזרה?" },
};

export default async function LocaleNotFound() {
  let locale = "en";
  try {
    locale = await getLocale();
  } catch {
    locale = "en";
  }
  const t = T[locale] ?? T.en;
  const lp = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
          style={{ background: "linear-gradient(135deg, #1A7A5A20, #D4A84720)" }}
        >
          <span className="text-4xl font-bold text-[#1A7A5A]">404</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{t.body}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`${lp}/`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
          >
            <Home className="h-4 w-4" />
            {t.home}
          </Link>
          <Link
            href={`${lp}/search`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
            {t.search}
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t.help}{" "}
            <a
              href="tel:+971555099157"
              className="text-[#1A7A5A] hover:underline inline-flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              +971 55 509 9157
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
