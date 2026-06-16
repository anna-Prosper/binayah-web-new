/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

const CONTENT = {
  en: {
    title: "UAE Golden Visa Through Property Investment | 10-Year Residency | Binayah",
    desc: "Get a UAE 10-year Golden Visa by investing AED 2M+ in Dubai property. Full guide: eligibility, process, documents, and best properties to qualify. Free consultation.",
    h1: "UAE Golden Visa",
    h1sub: "10-Year Residency Through Property",
    intro: "The UAE Golden Visa grants a 10-year renewable residency to property investors who purchase AED 2,000,000 (approximately $545,000) or more in UAE real estate. Unlike employer-sponsored visas, the Golden Visa is self-sponsored, renewable indefinitely, and includes family members.",
    steps: [
      { n: "01", title: "Purchase AED 2M+ Property", body: "Buy one or more UAE properties with a combined value of AED 2,000,000+. The property can be off-plan (with at least 50% paid) or a completed ready unit." },
      { n: "02", title: "Obtain Title Deed / OQOOD", body: "For completed properties: DLD title deed. For off-plan: OQOOD registration (developer-registered pre-title deed). Both qualify for the visa." },
      { n: "03", title: "Apply via ICA or GDRFA", body: "Submit your Golden Visa application through the Federal Authority for Identity, Citizenship, Customs and Port Security (ICA) or GDRFA Dubai. Binayah assists with the full application." },
      { n: "04", title: "Medical Test & Emirates ID", body: "Complete a UAE medical fitness test. Receive your Emirates ID and 10-year residency visa stamp. Process typically takes 2–4 weeks from application." },
    ],
    benefits: [
      { title: "10-Year Renewable", body: "The Golden Visa is valid for 10 years and renewable as long as you maintain the qualifying property investment." },
      { title: "Self-Sponsored", body: "No employer required. No local sponsor needed. The visa is entirely tied to your property ownership." },
      { title: "Family Inclusion", body: "Spouse, children (any age), parents, and domestic workers can be sponsored under your Golden Visa." },
      { title: "Multiple Entry", body: "No minimum stay requirement. You can live anywhere and enter the UAE unlimited times with no visa restrictions." },
      { title: "Business Freedom", body: "Golden Visa holders can open UAE companies without a local partner in mainland (100% foreign ownership under new laws)." },
      { title: "Education Access", body: "Children of Golden Visa holders qualify for UAE school enrolment and can attend top international schools in Dubai." },
    ],
    faqs: [
      { question: "What is the minimum investment for a UAE Golden Visa through property?", answer: "AED 2,000,000 (approximately USD 545,000 or EUR 500,000). The property can be in Dubai, Abu Dhabi, or any other emirate. It can be residential or commercial. Off-plan properties qualify if at least AED 2M has been paid to the developer (minimum 50% of purchase price)." },
      { question: "Can I use a mortgaged property to qualify for the Golden Visa?", answer: "Yes, but only the equity portion counts toward the AED 2M threshold. If your property is worth AED 3M but you have an outstanding mortgage of AED 1.5M, only AED 1.5M equity qualifies. You would need additional property or equity to reach the AED 2M threshold." },
      { question: "Can foreigners from all nationalities get the UAE Golden Visa?", answer: "Yes. The UAE Golden Visa is open to all nationalities. There are no restrictions by citizenship. Russians, Europeans, Americans, Chinese, and all other nationalities are equally eligible as long as they meet the investment threshold." },
      { question: "Does the Golden Visa require me to live in the UAE?", answer: "No. There is no minimum stay requirement for the Golden Visa. You can live outside the UAE and the visa remains valid. The only requirement is to maintain the qualifying property investment. Previously, UAE visas were cancelled if you stayed outside the UAE for 6 months — the Golden Visa removed this restriction." },
      { question: "What is the difference between a Golden Visa and a regular UAE property visa?", answer: "A regular property visa (also called an investor visa) requires AED 750,000 in property and grants 2-year renewable residency. The Golden Visa requires AED 2,000,000 and grants 10-year residency with no stay requirements and expanded family sponsorship rights." },
      { question: "Which properties in Dubai qualify for the Golden Visa?", answer: "Any UAE freehold property worth AED 2M+. Completed apartments, villas, townhouses, penthouses, offices, or plots all qualify. The property must be registered with the Dubai Land Department (DLD). Multiple properties can be combined to reach the threshold." },
      { question: "How long does the Golden Visa application take?", answer: "The application process takes approximately 3–6 weeks from property purchase to visa issuance. Property registration: 1–3 days. ICA/GDRFA application processing: 5–10 business days. Medical and Emirates ID: 5–10 business days. Total: typically 4–6 weeks for straightforward applications." },
      { question: "Can my family members be sponsored on my Golden Visa?", answer: "Yes. Your spouse, children (all ages, including adult children), parents, and domestic workers can be included as dependants under your Golden Visa. Each dependant gets the same 10-year residency. Children included as dependants maintain their visa even after age 18 as long as they are full-time students." },
    ],
    ctaTitle: "Start Your Golden Visa Journey",
    ctaDesc: "Binayah Properties helps investors identify Golden Visa-qualifying properties and manage the full application process — from property selection to visa issuance.",
    ctaBtn: "Get Golden Visa Advice",
  },
  ru: {
    title: "Золотая виза ОАЭ через недвижимость | 10 лет | Binayah",
    desc: "Получите 10-летнюю Золотую визу ОАЭ, инвестировав от 2 млн AED в недвижимость Дубая. Полное руководство: условия, процесс, документы. Бесплатная консультация.",
    h1: "Золотая виза ОАЭ",
    h1sub: "10-летнее резидентство через недвижимость",
    intro: "Золотая виза ОАЭ предоставляет 10-летнее возобновляемое резидентство инвесторам в недвижимость, приобретающим объекты на сумму от 2 000 000 AED (около $545 000). В отличие от рабочей визы, Золотая виза самоспонсируемая, бессрочно возобновляемая и распространяется на членов семьи.",
    steps: [
      { n: "01", title: "Покупка недвижимости от 2 млн AED", body: "Купите один или несколько объектов в ОАЭ общей стоимостью от 2 000 000 AED. Объект может быть off-plan (при условии оплаты не менее 50%) или готовым." },
      { n: "02", title: "Получение правоустанавливающего документа", body: "Для готовых объектов: свидетельство DLD. Для новостроек: регистрация OQOOD. Оба варианта подходят для визы." },
      { n: "03", title: "Подача заявки через ICA или GDRFA", body: "Подайте заявление на Золотую визу через Федеральное управление по идентификации и гражданству (ICA) или GDRFA Дубай. Binayah полностью сопровождает процесс." },
      { n: "04", title: "Медицинское освидетельствование и Emirates ID", body: "Пройдите медицинский осмотр ОАЭ. Получите Emirates ID и визу на 10 лет. Процесс занимает 2–4 недели с момента подачи заявки." },
    ],
    benefits: [
      { title: "10 лет с возможностью продления", body: "Золотая виза действительна 10 лет и автоматически продлевается при сохранении права собственности на объект." },
      { title: "Самоспонсируемая", body: "Работодатель не нужен. Местный спонсор не требуется. Виза полностью привязана к вашей собственности." },
      { title: "Для всей семьи", body: "Супруг(а), дети, родители и домашний персонал спонсируются по вашей Золотой визе." },
      { title: "Неограниченный въезд", body: "Нет требований к минимальному сроку пребывания. Въезжайте в ОАЭ без ограничений." },
      { title: "Свобода бизнеса", body: "Владельцы Золотой визы могут открывать компании в ОАЭ без местного партнёра (100% иностранное владение)." },
      { title: "Образование для детей", body: "Дети владельцев Золотой визы имеют право на обучение в лучших международных школах Дубая." },
    ],
    faqs: [
      { question: "Какой минимальный порог инвестиций для Золотой визы ОАЭ через недвижимость?", answer: "2 000 000 AED (около $545 000 или €500 000). Объект может быть в любом эмирате. Новостройки подходят при оплате не менее 2 млн AED (минимум 50% от стоимости)." },
      { question: "Можно ли использовать ипотечный объект для Золотой визы?", answer: "Да, но учитывается только собственный капитал. Если объект стоит 3 млн AED, а ипотечный остаток — 1,5 млн, учитывается только 1,5 млн. Для достижения порога нужен дополнительный капитал." },
      { question: "Граждане России могут получить Золотую визу ОАЭ?", answer: "Да. Золотая виза ОАЭ открыта для всех национальностей без ограничений. Граждане России, Европы, США, Китая и других стран имеют равные права при соответствии инвестиционному порогу." },
      { question: "Нужно ли жить в ОАЭ для сохранения Золотой визы?", answer: "Нет. Нет требований к минимальному сроку пребывания. Вы можете жить за рубежом, и виза сохраняет силу. Единственное условие — сохранять право собственности на объект." },
      { question: "Сколько времени занимает оформление Золотой визы?", answer: "Весь процесс — от покупки до получения визы — занимает 3–6 недель. Регистрация объекта: 1–3 дня. Обработка заявки ICA/GDRFA: 5–10 рабочих дней. Медосмотр и Emirates ID: 5–10 рабочих дней." },
    ],
    ctaTitle: "Начните путь к Золотой визе",
    ctaDesc: "Binayah Properties помогает инвесторам выбрать объекты, дающие право на Золотую визу, и сопровождает весь процесс подачи документов.",
    ctaBtn: "Консультация по Золотой визе",
  },
  ar: {
    title: "تأشيرة ذهبية للإمارات عبر العقارات | إقامة 10 سنوات | بناية",
    desc: "احصل على تأشيرة ذهبية إماراتية لمدة 10 سنوات باستثمار 2 مليون درهم أو أكثر في عقارات دبي. دليل كامل: الشروط والإجراءات والمستندات.",
    h1: "التأشيرة الذهبية الإماراتية",
    h1sub: "إقامة 10 سنوات عبر الاستثمار العقاري",
    intro: "تمنح التأشيرة الذهبية الإماراتية إقامةً متجددة لمدة 10 سنوات للمستثمرين العقاريين الذين يستثمرون 2,000,000 درهم (نحو 545,000 دولار) أو أكثر في عقارات الإمارات.",
    steps: [
      { n: "١", title: "شراء عقار بـ 2 مليون درهم أو أكثر", body: "اشترِ عقارًا أو أكثر في الإمارات بقيمة إجمالية 2,000,000 درهم أو أكثر. يمكن أن يكون على الخارطة (بشرط سداد 50% على الأقل) أو جاهزًا." },
      { n: "٢", title: "الحصول على سند الملكية / عقود", body: "للعقارات الجاهزة: سند ملكية DLD. للعقارات على الخارطة: تسجيل عقود." },
      { n: "٣", title: "التقديم عبر ICA أو GDRFA", body: "تقديم طلب التأشيرة الذهبية عبر الهيئة الاتحادية للهوية والجنسية أو إدارة الإقامة في دبي." },
      { n: "٤", title: "الفحص الطبي والهوية الإماراتية", body: "إتمام الفحص الطبي وتلقّي الهوية الإماراتية وختم الإقامة لمدة 10 سنوات. تستغرق العملية عادةً 2-4 أسابيع." },
    ],
    benefits: [
      { title: "10 سنوات قابلة للتجديد", body: "التأشيرة صالحة 10 سنوات وتتجدد طالما حافظت على الاستثمار العقاري المؤهِّل." },
      { title: "مستقلة الكفالة", body: "لا يُشترط صاحب عمل أو كفيل محلي. التأشيرة مرتبطة بملكيتك العقارية كليًا." },
      { title: "تشمل العائلة", body: "الزوج/ة والأبناء (بكل الأعمار) والوالدان والعمالة المنزلية يُكفَلون ضمن تأشيرتك الذهبية." },
      { title: "دخول متعدد", body: "لا يوجد حد أدنى للإقامة. ادخل الإمارات دون قيود." },
      { title: "حرية الأعمال", body: "حاملو التأشيرة الذهبية يستطيعون تأسيس شركات في الإمارات بدون شريك محلي (ملكية أجنبية 100%)." },
      { title: "تعليم الأبناء", body: "أبناء حاملي التأشيرة الذهبية مؤهَّلون للالتحاق بأفضل المدارس الدولية في دبي." },
    ],
    faqs: [
      { question: "ما الحد الأدنى للاستثمار للحصول على التأشيرة الذهبية عبر العقارات؟", answer: "2,000,000 درهم (نحو 545,000 دولار). يمكن أن يكون العقار في أي إمارة. العقارات على الخارطة مؤهَّلة بشرط سداد 2 مليون درهم على الأقل (حد أدنى 50% من سعر الشراء)." },
      { question: "هل يمكن استخدام عقار ممرهَن للتأهل للتأشيرة الذهبية؟", answer: "نعم، لكن يُحتسب الجزء المدفوع (حقوق الملكية) فقط. إذا كانت قيمة العقار 3 ملايين درهم والرهن المتبقي 1.5 مليون، يُحتسب 1.5 مليون فقط." },
      { question: "هل التأشيرة الذهبية متاحة لجميع الجنسيات؟", answer: "نعم. التأشيرة الذهبية الإماراتية مفتوحة لجميع الجنسيات دون قيود." },
      { question: "هل يُشترط الإقامة في الإمارات للمحافظة على التأشيرة؟", answer: "لا. لا يوجد حد أدنى للإقامة. يمكنك العيش خارج الإمارات وتبقى التأشيرة سارية طالما حافظت على الملكية." },
      { question: "كم تستغرق عملية التأشيرة الذهبية؟", answer: "تستغرق العملية الكاملة من الشراء إلى إصدار التأشيرة 3-6 أسابيع. تسجيل العقار: 1-3 أيام. معالجة الطلب: 5-10 أيام عمل. الفحص الطبي والهوية: 5-10 أيام عمل." },
    ],
    ctaTitle: "ابدأ رحلتك نحو التأشيرة الذهبية",
    ctaDesc: "تساعد بناية المستثمرين في اختيار العقارات المؤهِّلة وإدارة عملية التقديم من الألف إلى الياء.",
    ctaBtn: "استشارة التأشيرة الذهبية",
  },
  zh: {
    title: "阿联酋黄金签证房产投资 | 10年居住权 | Binayah Properties",
    desc: "通过投资200万迪拉姆以上迪拜房产获得阿联酋10年黄金签证。完整指南：资格、流程、文件和最佳资质房产。免费咨询。",
    h1: "阿联酋黄金签证",
    h1sub: "通过房产获得10年居住权",
    intro: "阿联酋黄金签证为购买200万迪拉姆（约54.5万美元）以上阿联酋房产的投资者提供10年可续签居住权。与雇主担保签证不同，黄金签证是自我担保的，可无限续签，并包含家庭成员。",
    steps: [
      { n: "01", title: "购买200万迪拉姆以上房产", body: "购买一套或多套阿联酋房产，合计价值200万迪拉姆以上。可以是期房（需已支付至少50%）或现房。" },
      { n: "02", title: "获取产权证书/OQOOD", body: "现房：DLD产权证书。期房：OQOOD登记。两种情况均符合签证要求。" },
      { n: "03", title: "通过ICA或GDRFA申请", body: "通过联邦身份与公民权力局（ICA）或迪拜GDRFA提交黄金签证申请。Binayah协助完成全程申请。" },
      { n: "04", title: "体检与酋长国身份证", body: "完成阿联酋体检，领取酋长国身份证和10年居住签证。整个过程通常需要2-4周。" },
    ],
    benefits: [
      { title: "10年可续签", body: "黄金签证有效期10年，只要维持资质房产投资即可续签。" },
      { title: "自我担保", body: "无需雇主，无需本地担保人。签证完全与您的房产所有权挂钩。" },
      { title: "包含家庭成员", body: "配偶、子女（所有年龄）、父母和家庭工人均可包含在黄金签证下。" },
      { title: "多次入境", body: "无最低居住时间要求，可无限次进入阿联酋，无任何签证限制。" },
      { title: "商业自由", body: "黄金签证持有者可在阿联酋内地开设公司，无需本地合伙人（100%外资所有权）。" },
      { title: "子女教育", body: "黄金签证持有者的子女有资格入读迪拜顶级国际学校。" },
    ],
    faqs: [
      { question: "通过房产获得阿联酋黄金签证的最低投资额是多少？", answer: "200万迪拉姆（约54.5万美元或50万欧元）。房产可位于任何酋长国。期房在已支付200万迪拉姆（至少50%购买价格）的情况下符合条件。" },
      { question: "按揭房产可以申请黄金签证吗？", answer: "可以，但只有权益部分计入200万迪拉姆门槛。如果房产价值300万迪拉姆但按揭余额150万，只有150万权益算入。需要额外资产才能达到门槛。" },
      { question: "所有国籍都可以申请阿联酋黄金签证吗？", answer: "是的。阿联酋黄金签证对所有国籍开放，没有任何限制。俄罗斯人、欧洲人、中国人等均可申请，条件相同。" },
      { question: "持有黄金签证需要居住在阿联酋吗？", answer: "不需要。黄金签证没有最低居住时间要求。您可以居住在海外，签证依然有效。唯一要求是维持资质房产投资。" },
      { question: "黄金签证申请需要多长时间？", answer: "从购房到签证发放整个过程大约3-6周。房产登记：1-3天。ICA/GDRFA审核：5-10个工作日。体检和身份证：5-10个工作日。" },
    ],
    ctaTitle: "开启黄金签证之旅",
    ctaDesc: "Binayah Properties帮助投资者识别符合黄金签证资格的房产，并管理从房产选择到签证发放的全程申请。",
    ctaBtn: "获取黄金签证咨询",
  },
  vi: {
    title: "Golden Visa UAE qua đầu tư bất động sản | Cư trú 10 năm | Binayah",
    desc: "Nhận Golden Visa UAE 10 năm bằng cách đầu tư 2 triệu AED+ vào bất động sản Dubai. Hướng dẫn đầy đủ: điều kiện, quy trình, giấy tờ và bất động sản tốt nhất để đủ điều kiện. Tư vấn miễn phí.",
    h1: "Golden Visa UAE",
    h1sub: "Cư trú 10 năm qua bất động sản",
    intro: "Golden Visa UAE cấp quyền cư trú 10 năm có thể gia hạn cho các nhà đầu tư bất động sản mua từ 2.000.000 AED (khoảng 545.000 USD) trở lên vào bất động sản UAE. Khác với thị thực do chủ lao động bảo trợ, Golden Visa tự bảo trợ, gia hạn vô thời hạn và bao gồm thành viên gia đình.",
    steps: [
      { n: "01", title: "Mua bất động sản 2 triệu AED+", body: "Mua một hoặc nhiều bất động sản UAE với tổng giá trị từ 2.000.000 AED+. Bất động sản có thể là off-plan (đã trả ít nhất 50%) hoặc căn đã hoàn thiện sẵn sàng." },
      { n: "02", title: "Lấy sổ đỏ / OQOOD", body: "Với bất động sản đã hoàn thiện: sổ đỏ DLD. Với off-plan: đăng ký OQOOD (đăng ký tiền sổ đỏ do chủ đầu tư cấp). Cả hai đều đủ điều kiện cho thị thực." },
      { n: "03", title: "Nộp đơn qua ICA hoặc GDRFA", body: "Nộp đơn Golden Visa qua Cơ quan Liên bang về Bản sắc, Quyền công dân, Hải quan và An ninh Cảng (ICA) hoặc GDRFA Dubai. Binayah hỗ trợ toàn bộ đơn." },
      { n: "04", title: "Khám sức khỏe & Emirates ID", body: "Hoàn thành kiểm tra sức khỏe UAE. Nhận Emirates ID và dấu thị thực cư trú 10 năm. Quy trình thường mất 2–4 tuần từ khi nộp đơn." },
    ],
    benefits: [
      { title: "10 năm có thể gia hạn", body: "Golden Visa có hiệu lực 10 năm và có thể gia hạn miễn là bạn duy trì khoản đầu tư bất động sản đủ điều kiện." },
      { title: "Tự bảo trợ", body: "Không cần chủ lao động. Không cần người bảo trợ địa phương. Thị thực hoàn toàn gắn với quyền sở hữu bất động sản của bạn." },
      { title: "Bao gồm gia đình", body: "Vợ/chồng, con cái (mọi độ tuổi), cha mẹ và người giúp việc có thể được bảo trợ theo Golden Visa của bạn." },
      { title: "Nhập cảnh nhiều lần", body: "Không yêu cầu thời gian lưu trú tối thiểu. Bạn có thể sống ở bất cứ đâu và nhập cảnh UAE không giới hạn số lần mà không bị hạn chế thị thực." },
      { title: "Tự do kinh doanh", body: "Người sở hữu Golden Visa có thể mở công ty UAE mà không cần đối tác địa phương ở đất liền (sở hữu nước ngoài 100% theo luật mới)." },
      { title: "Tiếp cận giáo dục", body: "Con cái của người sở hữu Golden Visa đủ điều kiện nhập học trường UAE và có thể theo học các trường quốc tế hàng đầu ở Dubai." },
    ],
    faqs: [
      { question: "Khoản đầu tư tối thiểu cho Golden Visa UAE qua bất động sản là bao nhiêu?", answer: "2.000.000 AED (khoảng 545.000 USD hoặc 500.000 EUR). Bất động sản có thể ở Dubai, Abu Dhabi hoặc bất kỳ tiểu vương quốc nào khác. Có thể là nhà ở hoặc thương mại. Bất động sản off-plan đủ điều kiện nếu ít nhất 2 triệu AED đã được trả cho chủ đầu tư (tối thiểu 50% giá mua)." },
      { question: "Tôi có thể dùng bất động sản đang thế chấp để đủ điều kiện Golden Visa không?", answer: "Có, nhưng chỉ phần vốn chủ sở hữu được tính vào ngưỡng 2 triệu AED. Nếu bất động sản của bạn trị giá 3 triệu AED nhưng bạn còn khoản vay thế chấp 1,5 triệu AED, chỉ 1,5 triệu AED vốn chủ sở hữu đủ điều kiện. Bạn cần thêm bất động sản hoặc vốn để đạt ngưỡng 2 triệu AED." },
      { question: "Người nước ngoài từ mọi quốc tịch có thể nhận Golden Visa UAE không?", answer: "Có. Golden Visa UAE mở cho mọi quốc tịch. Không có hạn chế theo quốc tịch. Người Nga, châu Âu, Mỹ, Trung Quốc và mọi quốc tịch khác đều đủ điều kiện như nhau miễn là họ đáp ứng ngưỡng đầu tư." },
      { question: "Golden Visa có yêu cầu tôi phải sống ở UAE không?", answer: "Không. Không có yêu cầu thời gian lưu trú tối thiểu cho Golden Visa. Bạn có thể sống ngoài UAE và thị thực vẫn có hiệu lực. Yêu cầu duy nhất là duy trì khoản đầu tư bất động sản đủ điều kiện. Trước đây, thị thực UAE bị hủy nếu bạn ở ngoài UAE 6 tháng — Golden Visa đã bỏ hạn chế này." },
      { question: "Sự khác biệt giữa Golden Visa và thị thực bất động sản UAE thông thường là gì?", answer: "Thị thực bất động sản thông thường (còn gọi là thị thực nhà đầu tư) yêu cầu 750.000 AED bất động sản và cấp cư trú 2 năm có thể gia hạn. Golden Visa yêu cầu 2.000.000 AED và cấp cư trú 10 năm không có yêu cầu lưu trú và quyền bảo trợ gia đình mở rộng." },
      { question: "Bất động sản nào tại Dubai đủ điều kiện Golden Visa?", answer: "Bất kỳ bất động sản freehold UAE nào trị giá 2 triệu AED+. Căn hộ đã hoàn thiện, biệt thự, nhà phố, penthouse, văn phòng hoặc lô đất đều đủ điều kiện. Bất động sản phải được đăng ký với Sở Đất đai Dubai (DLD). Có thể kết hợp nhiều bất động sản để đạt ngưỡng." },
      { question: "Đơn Golden Visa mất bao lâu?", answer: "Quy trình nộp đơn mất khoảng 3–6 tuần từ khi mua bất động sản đến khi cấp thị thực. Đăng ký bất động sản: 1–3 ngày. Xử lý đơn ICA/GDRFA: 5–10 ngày làm việc. Khám sức khỏe và Emirates ID: 5–10 ngày làm việc. Tổng: thường 4–6 tuần cho đơn đơn giản." },
      { question: "Thành viên gia đình tôi có thể được bảo trợ theo Golden Visa của tôi không?", answer: "Có. Vợ/chồng, con cái (mọi độ tuổi, kể cả con đã trưởng thành), cha mẹ và người giúp việc có thể được đưa vào làm người phụ thuộc theo Golden Visa của bạn. Mỗi người phụ thuộc nhận cùng cư trú 10 năm. Con cái được đưa vào làm người phụ thuộc duy trì thị thực ngay cả sau 18 tuổi miễn là chúng là sinh viên toàn thời gian." },
    ],
    ctaTitle: "Bắt đầu hành trình Golden Visa của bạn",
    ctaDesc: "Binayah Properties giúp các nhà đầu tư xác định bất động sản đủ điều kiện Golden Visa và quản lý toàn bộ quy trình nộp đơn — từ chọn bất động sản đến cấp thị thực.",
    ctaBtn: "Nhận tư vấn Golden Visa",
  },
} as const;

type Locale = keyof typeof CONTENT;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const url = canonical(locale, "/golden-visa");
  return {
    title: c.title,
    description: c.desc,
    alternates: { canonical: url, languages: altLangs("/golden-visa", ["he"]) },
    openGraph: { title: c.title, description: c.desc, url, type: "website", locale: OG_LOCALE[locale] ?? "en_AE", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: c.title, description: c.desc },
    keywords: locale === "ru"
      ? ["золотая виза оаэ", "золотая виза дубай недвижимость", "резидентство оаэ через недвижимость"]
      : locale === "ar" // vi branch below
      ? ["التأشيرة الذهبية الإمارات", "تأشيرة ذهبية عقار دبي", "إقامة الإمارات عبر العقارات"]
      : locale === "zh"
      ? ["阿联酋黄金签证", "迪拜房产黄金签证", "阿联酋居住权房产"]
      : locale === "vi" ? ["golden visa uae bất động sản", "golden visa dubai", "golden visa 2 triệu aed", "cư trú uae qua bất động sản"] : locale === "he" ? ["נכס ויזה זהב איחוד האמירויות","ויזה זהב דובאי","ויזה זהב 2 מיליון AED","תושבות איחוד האמירויות דרך נכס"] : ["uae golden visa property", "dubai golden visa", "golden visa 2 million aed", "uae residency through property"],
  };
}

export default async function GoldenVisaPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[(locale as Locale)] || CONTENT.en;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: c.h1, href: `${lp}/golden-visa` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[...c.faqs]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <section className="relative overflow-hidden pt-20 sm:pt-32 pb-10 sm:pb-16 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">🏅 {locale === "ru" ? "ЗОЛОТАЯ ВИЗА ОАЭ" : locale === "ar" ? "التأشيرة الذهبية الإماراتية" : locale === "zh" ? "阿联酋黄金签证" : locale === "vi" ? "GOLDEN VISA UAE" : locale === "he" ? "ויזת זהב של איחוד האמירויות" : "UAE GOLDEN VISA"}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">{c.h1}</h1>
          <p className="text-2xl font-light text-primary-foreground/70 mb-6">{c.h1sub}</p>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-10">{c.intro}</p>
          <Link href={`${lp}/contact`} className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
            {c.ctaBtn} →
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

        {/* Steps */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Process</p>
            <h2 className="text-3xl font-bold text-foreground">{locale === "ru" ? "Как получить Золотую визу" : locale === "ar" ? "كيفية الحصول على التأشيرة الذهبية" : locale === "zh" ? "如何获取黄金签证" : locale === "vi" ? "Cách nhận Golden Visa" : locale === "he" ? "איך להשיג את ויזת הזהב" : "How to Get the Golden Visa"}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.steps.map((s) => (
              <div key={s.n} className="bg-card border border-border/50 rounded-2xl p-7">
                <div className="text-4xl font-black mb-4 leading-none" style={{ color: "rgba(26,122,90,0.2)" }}>{s.n}</div>
                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">Benefits</p>
            <h2 className="text-3xl font-bold text-foreground">{locale === "ru" ? "Преимущества Золотой визы" : locale === "ar" ? "مزايا التأشيرة الذهبية" : locale === "zh" ? "黄金签证的优势" : locale === "vi" ? "Lợi ích của Golden Visa" : locale === "he" ? "היתרונות של ויזת הזהב" : "Golden Visa Benefits"}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <p className="text-accent font-bold tracking-[0.35em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">{locale === "ru" ? "Частые вопросы" : locale === "ar" ? "الأسئلة الشائعة" : locale === "zh" ? "常见问题" : locale === "vi" ? "Câu hỏi thường gặp" : locale === "he" ? "שאלות נפוצות" : "Frequently Asked Questions"}</h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((f, i) => (
              <details key={i} className="group bg-card border border-border/50 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-foreground hover:text-primary text-sm sm:text-base">
                  <span>{f.question}</span>
                  <span className="text-accent text-xl font-light flex-shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground border-t border-border/30 pt-4">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-5xl mb-4">🏅</p>
            <h2 className="text-3xl font-bold mb-4">{c.ctaTitle}</h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-xl mx-auto">{c.ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`${lp}/contact`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
                {c.ctaBtn}
              </Link>
              <Link href={`${lp}/search?budgetMin=2000000`} className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                {locale === "ru" ? "Объекты от 2 млн AED" : locale === "ar" ? "عقارات بـ 2M+ درهم" : locale === "zh" ? "200万迪拉姆以上房产" : locale === "vi" ? "Xem bất động sản 2 triệu AED+" : locale === "he" ? "עיין בנכסים מעל 2 מיליון AED" : "Browse AED 2M+ Properties"}
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
