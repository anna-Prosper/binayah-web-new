/* eslint-disable i18next/no-literal-string */
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Bookmark, Calendar, CalendarCheck, ChevronRight, Clock, Facebook, Linkedin, Link as LinkIcon, MessageCircle, TrendingUp, Twitter, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";

interface Faq { question?: string; answer?: string; q?: string; a?: string }

interface ProjectArticle {
  slug: string;
  h1: string;
  body?: string;
  excerpt?: string;
  heroImage?: { url: string; alt?: string; caption?: string };
  faq?: Faq[];
  projectSlug?: string;
  langs?: string[];
  readingTimeMin?: number;
  publishedAt?: string | null;
  keywords?: string[];
  dir?: string;
}

const FALLBACK_IMAGE = "/assets/dubai-hero.webp";
const WHATSAPP_NUMBER = "971549988811";


const LABELS: Record<string, Record<string, string>> = {
  en: { back: "Project Guides", faq: "Frequently Asked Questions", viewProject: "View Project", langs: "Available in", topics: "Topics", author: "Binayah Editorial", bookConsultation: "Book a Consultation", investmentTitle: "Get Investment Advice", investmentDesc: "Our experts are ready to guide you through this project's payment plan and ROI potential.", ctaTitle: "Ready to Invest?", ctaDesc: "Speak to our team about this project and get exclusive pricing and payment plans.", ctaWhatsApp: "Chat on WhatsApp", newsletter: "Weekly Market Report", newsletterDesc: "Get Dubai property insights every week.", subscribe: "Subscribe", subscribed: "Subscribed!", subError: "Something went wrong. Please try again.", emailPlaceholder: "your@email.com", home: "Home", thisProject: "This Project", authorRole: "Dubai Property Expert", authorBio: "Binayah's editorial team covers Dubai's off-plan property market with data-driven analysis and on-the-ground insights." },
  ru: { back: "Гайды по проектам", faq: "Частые вопросы", viewProject: "Смотреть проект", langs: "Читать на", topics: "Темы", author: "Редакция Binayah", bookConsultation: "Записаться на консультацию", investmentTitle: "Получите инвестиционный совет", investmentDesc: "Наши эксперты готовы провести вас через план оплаты и потенциал ROI этого проекта.", ctaTitle: "Готовы инвестировать?", ctaDesc: "Обратитесь к нашей команде и получите эксклюзивные цены и планы оплаты.", ctaWhatsApp: "Написать в WhatsApp", newsletter: "Еженедельный отчёт", newsletterDesc: "Получайте аналитику рынка недвижимости Дубая каждую неделю.", subscribe: "Подписаться", subscribed: "Вы подписаны!", subError: "Что-то пошло не так. Попробуйте снова.", emailPlaceholder: "your@email.com", home: "Главная", thisProject: "Этот проект", authorRole: "Эксперт по недвижимости Дубая", authorBio: "Редакция Binayah освещает рынок офф-план недвижимости Дубая с аналитикой на основе данных и знанием ситуации на местах." },
  ar: { back: "أدلة المشاريع", faq: "الأسئلة الشائعة", viewProject: "عرض المشروع", langs: "متوفر بـ", topics: "مواضيع", author: "تحرير بنايه", bookConsultation: "احجز استشارة", investmentTitle: "احصل على نصيحة استثمارية", investmentDesc: "خبراؤنا مستعدون لإرشادك.", ctaTitle: "هل أنت مستعد للاستثمار؟", ctaDesc: "تحدث مع فريقنا للحصول على أسعار حصرية.", ctaWhatsApp: "تواصل عبر واتساب", newsletter: "تقرير أسبوعي", newsletterDesc: "احصل على رؤى سوق العقارات أسبوعياً.", subscribe: "اشترك", subscribed: "تم الاشتراك!", subError: "حدث خطأ ما. حاول مرة أخرى.", emailPlaceholder: "your@email.com", home: "الرئيسية", thisProject: "هذا المشروع", authorRole: "خبير عقارات دبي", authorBio: "يغطي فريق تحرير بناية سوق العقارات على الخارطة في دبي بتحليلات قائمة على البيانات ومعرفة ميدانية." },
  zh: { back: "项目指南", faq: "常见问题", viewProject: "查看项目", langs: "可用语言", topics: "主题", author: "Binayah编辑", bookConsultation: "预约咨询", investmentTitle: "获取投资建议", investmentDesc: "我们的专家准备好指导您了解付款计划和投资回报率。", ctaTitle: "准备好投资了吗？", ctaDesc: "与我们的团队联系，获取独家定价和付款计划。", ctaWhatsApp: "WhatsApp咨询", newsletter: "每周市场报告", newsletterDesc: "每周获取迪拜房产见解。", subscribe: "订阅", subscribed: "已订阅！", subError: "出了点问题，请重试。", emailPlaceholder: "your@email.com", home: "首页", thisProject: "本项目", authorRole: "迪拜房产专家", authorBio: "Binayah编辑团队以数据驱动的分析和实地洞察报道迪拜期房市场。" },
  vi: { back: "Hướng dẫn dự án", faq: "FAQ", viewProject: "Xem dự án", langs: "Có sẵn bằng", topics: "Chủ đề", author: "Biên tập Binayah", bookConsultation: "Đặt lịch tư vấn", investmentTitle: "Nhận tư vấn đầu tư", investmentDesc: "Chuyên gia của chúng tôi sẵn sàng hướng dẫn bạn.", ctaTitle: "Sẵn sàng đầu tư?", ctaDesc: "Liên hệ đội ngũ của chúng tôi để nhận báo giá độc quyền.", ctaWhatsApp: "Chat trên WhatsApp", newsletter: "Báo cáo thị trường hàng tuần", newsletterDesc: "Nhận thông tin thị trường bất động sản Dubai mỗi tuần.", subscribe: "Đăng ký", subscribed: "Đã đăng ký!", subError: "Đã xảy ra lỗi. Vui lòng thử lại.", emailPlaceholder: "your@email.com", home: "Trang chủ", thisProject: "Dự án này", authorRole: "Chuyên gia bất động sản Dubai", authorBio: "Đội ngũ biên tập của Binayah đưa tin về thị trường bất động sản off-plan Dubai với phân tích dựa trên dữ liệu và hiểu biết thực tế." },
  he: { back: "מדריכי פרויקטים", faq: "שאלות נפוצות", viewProject: "צפה בפרויקט", langs: "זמין ב", topics: "נושאים", author: "מערכת Binayah", bookConsultation: "קביעת ייעוץ", investmentTitle: "קבלו ייעוץ השקעות", investmentDesc: "המומחים שלנו מוכנים ללוות אתכם בתוכנית התשלומים ובפוטנציאל התשואה של הפרויקט.", ctaTitle: "מוכנים להשקיע?", ctaDesc: "דברו עם הצוות שלנו וקבלו תמחור ותוכניות תשלום בלעדיות.", ctaWhatsApp: "שיחה ב-WhatsApp", newsletter: "דוח שוק שבועי", newsletterDesc: "קבלו תובנות נדל\"ן בדובאי מדי שבוע.", subscribe: "הרשמה", subscribed: "נרשמת!", subError: "משהו השתבש. נסו שוב.", emailPlaceholder: "your@email.com", home: "דף הבית", thisProject: "הפרויקט הזה", authorRole: "מומחה נדל\"ן בדובאי", authorBio: "צוות המערכת של Binayah מסקר את שוק הנדל\"ן על הנייר בדובאי עם ניתוח מבוסס נתונים ותובנות מהשטח." },
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

export default function ProjectArticleDetailClient({ article, locale }: { article: ProjectArticle; locale: string }) {
  const lp = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar" || locale === "he" || article.dir === "rtl";
  const l = LABELS[locale] ?? LABELS.en;
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [subState, setSubState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://www.binayah.ae${lp}/construction-updates/${article.slug}`;
  const shareText = encodeURIComponent(article.h1);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };
  const shareLabel = ({ en: "Share", ru: "Поделиться", ar: "مشاركة", zh: "分享", vi: "Chia sẻ", he: "שיתוף" } as Record<string, string>)[locale] ?? "Share";
  const copiedLabel = ({ en: "Copied!", ru: "Скопировано!", ar: "تم النسخ!", zh: "已复制!", vi: "Đã sao chép!", he: "הועתק!" } as Record<string, string>)[locale] ?? "Copied!";

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const read = Math.min(1, Math.max(0, (vh - top) / (height + vh)));
      setProgress(read * 100);
      setShowTop(window.scrollY > vh * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-[3px] bg-accent transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />

      <Navbar />

      {/* Full-bleed hero — identical to NewsDetailClient default */}
      <section className="relative w-full h-[480px] md:h-[620px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <Image src={article.heroImage?.url || FALLBACK_IMAGE} alt={article.heroImage?.alt ?? article.h1} fill className="object-cover" priority />
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        {/* Breadcrumb at top */}
        <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 flex items-center px-4 sm:px-6 z-10">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70">
            <Link href={`${lp}/`} className="hover:text-white transition-colors whitespace-nowrap">{l.home}</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-white/40" />
            <Link href={`${lp}/construction-updates`} className="hover:text-white transition-colors whitespace-nowrap">{l.back}</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-white/40" />
            <span className="text-white/90 truncate">{article.h1}</span>
          </nav>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 relative w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} dir={isRtl ? "rtl" : "ltr"}>
            <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-lg bg-accent text-accent-foreground uppercase tracking-wider mb-4">
              Project Guide
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">{article.h1}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/60 text-xs sm:text-sm">
              {article.publishedAt && <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /> {formatDate(article.publishedAt)}</span>}
              {article.readingTimeMin && <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="h-3.5 w-3.5 flex-shrink-0" /> {article.readingTimeMin} min read</span>}
              <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="h-3.5 w-3.5 flex-shrink-0" /> {l.author}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section ref={articleRef} className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12">

            {/* Article body */}
            <div className="min-w-0">
              {/* Share strip — identical to NewsDetailClient */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">{shareLabel}</span>
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Facebook className="h-4 w-4" /></a>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
                  <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
                </div>
                <button type="button" onClick={handleCopy} aria-label="Copy link" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
                  <LinkIcon className="h-4 w-4" />
                  {copied && <span className="absolute -top-8 right-0 text-[10px] font-semibold bg-foreground text-background px-2 py-1 rounded whitespace-nowrap">{copiedLabel}</span>}
                </button>
              </div>

              {/* Body */}
              {article.body && (
                <div dir={isRtl ? "rtl" : "ltr"} className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full prose-img:h-auto">
                  <ReactMarkdown>{article.body}</ReactMarkdown>
                </div>
              )}

              {/* FAQ */}
              {article.faq && article.faq.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h2 className="text-xl font-bold text-foreground mb-5">{l.faq}</h2>
                  <div className="space-y-2">
                    {article.faq.map((item, i) => {
                      const question = item.question ?? item.q ?? "";
                      const answer = item.answer ?? item.a ?? "";
                      if (!question) return null;
                      return (
                        <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
                          <summary className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 cursor-pointer list-none font-semibold text-sm text-foreground hover:text-primary transition-colors">
                            <span>{question}</span>
                            <span className="text-accent text-lg font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                          </summary>
                          <div className="px-4 sm:px-6 pb-4 pt-3 text-sm text-muted-foreground leading-relaxed border-t border-border/30">{answer}</div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Keywords as tags */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{l.topics}</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.slice(0, 10).map((kw) => (
                      <span key={kw} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author bio */}
              <div className="mt-10 p-5 rounded-2xl border border-border bg-card flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">BE</div>
                <div>
                  <p className="font-bold text-foreground">{l.author}</p>
                  <p className="text-xs text-muted-foreground mb-1">{l.authorRole}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{l.authorBio}</p>
                </div>
              </div>
            </div>

            {/* Sidebar — identical structure to NewsDetailClient */}
            <aside className="lg:sticky lg:top-24 self-start space-y-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              {/* Investment CTA */}
              <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                <div className="w-10 h-10 rounded-xl bg-accent/90 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1.5">{l.investmentTitle}</h3>
                <p className="text-sm text-primary-foreground/75 leading-relaxed mb-4">{l.investmentDesc}</p>
                <Link href={`${lp}/contact`} className="block w-full text-center px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors">
                  {l.bookConsultation}
                </Link>
              </div>

              {/* View Project link */}
              {article.projectSlug && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground mb-4">{l.thisProject}</p>
                  <Link href={`${lp}/project/${article.projectSlug}`} className="group flex items-start gap-3 rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
                    {article.heroImage?.url && (
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={article.heroImage.url} alt={article.h1} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{article.h1.split(" by ")[0]}</p>
                      <p className="text-xs text-primary mt-1 font-medium">{l.viewProject} →</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Bookmark className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-bold text-foreground">{l.newsletter}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{l.newsletterDesc}</p>
                {subState === "done" ? (
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {l.subscribed}
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const email = fd.get("email");
                    if (!email) return;
                    setSubState("loading");
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/market-report/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: String(email), source: "project-article" }) });
                      setSubState(res.ok ? "done" : "error");
                    } catch { setSubState("error"); }
                  }} className="space-y-2.5">
                    <input type="email" name="email" required placeholder={l.emailPlaceholder} className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all" />
                    <button type="submit" disabled={subState === "loading"} className="w-full px-4 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                      {subState === "loading" ? "..." : l.subscribe}
                    </button>
                    {subState === "error" && <p className="text-xs text-red-500">{l.subError}</p>}
                  </form>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom CTA banner — identical to NewsDetailClient */}
      <section className="py-10 sm:py-14" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex items-start gap-4 lg:flex-1">
              <div className="w-12 h-12 rounded-xl bg-accent/90 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-primary-foreground mb-1.5">{l.ctaTitle}</h3>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">{l.ctaDesc}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(article.h1)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1fbf58] transition-colors">
                <MessageCircle className="h-4 w-4" /> {l.ctaWhatsApp}
              </a>
              <Link href={`${lp}/contact`} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors">
                <CalendarCheck className="h-4 w-4" /> {l.bookConsultation}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />

      {showTop && (
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-5 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all" aria-label="Back to top">
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
