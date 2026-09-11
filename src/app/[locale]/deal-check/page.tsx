/* eslint-disable i18next/no-literal-string -- per-locale copy lives in the CONTENT maps below, matching the /valuation page pattern */
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { Link } from "@/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCheckClient from "@/components/deal-check/DealCheckClient";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { waHref, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = "/deal-check";

/** Display form of the company number; waHref/tel: use the digits-only const. */
const PHONE_DISPLAY = "+971 55 509 9157";

const titles: Record<string, string> = {
  en: "Deal Check — Is That Dubai Property Priced Right? | Binayah",
  ru: "Deal Check — Справедлива ли цена на эту недвижимость в Дубае? | Binayah",
  ar: "فحص الصفقة — هل سعر هذا العقار في دبي مناسب؟ | بناية",
  zh: "Deal Check — 迪拜这套房产定价合理吗？| Binayah",
  fr: "Deal Check — Ce bien à Dubaï est-il au bon prix ? | Binayah",
  vi: "Deal Check — Bất động sản Dubai này có đúng giá? | Binayah",
  he: "Deal Check — האם הנכס הזה בדובאי מתומחר נכון? | Binayah",
};

const descriptions: Record<string, string> = {
  en: "Send any Dubai property — a link, screenshot or brochure, from any agency. We'll check the price against what similar homes nearby actually sold for, work out what you really need in cash, and tell you what to ask. Free.",
  ru: "Отправьте любой объект в Дубае — ссылку, скриншот или брошюру от любого агентства. Сравним цену с тем, за сколько недавно продавались похожие квартиры рядом, посчитаем реальные расходы и подскажем, о чём спросить. Бесплатно.",
  ar: "أرسل أي عقار في دبي — رابط أو لقطة شاشة أو كتيب من أي وكالة. نقارن السعر بما بيعت به فعلاً منازل مشابهة قريبة، ونحسب ما تحتاجه نقداً بالضبط، ونخبرك بما يجب أن تسأل عنه. مجاناً.",
  zh: "发送任何迪拜房产——链接、截图或任何中介的宣传册。我们会把价格和附近同类房子最近的真实成交价作比较，算出你实际需要准备多少现金，并告诉你该问些什么。免费。",
  fr: "Envoyez n'importe quel bien à Dubaï — lien, capture ou brochure, de n'importe quelle agence. On compare le prix à ce que des logements similaires se sont réellement vendus juste à côté, on calcule ce qu'il vous faut vraiment en liquide, et on vous dit quoi demander. Gratuit.",
  vi: "Gửi bất kỳ bất động sản Dubai nào — liên kết, ảnh chụp hoặc tài liệu từ bất kỳ đại lý nào. Chúng tôi so giá với mức mà những căn tương tự gần đó đã thực sự bán được, tính ra số tiền mặt bạn thật sự cần, và mách bạn nên hỏi gì. Miễn phí.",
  he: "שלחו כל נכס בדובאי — קישור, צילום מסך או חוברת מכל סוכנות. נשווה את המחיר למה שדירות דומות באזור באמת נמכרו בו לאחרונה, נחשב כמה מזומן תצטרכו בפועל, ונגיד לכם מה לשאול. חינם.",
};

/**
 * Supporting guides — slugs only. Titles and blurbs come from the message
 * catalogue so they translate; hardcoding English here left the Arabic and
 * Chinese pages showing English cards.
 */
const RELATED_GUIDE_SLUGS = [
  "true-cost-buying-property-dubai",
  "how-to-tell-if-dubai-property-overpriced",
  "questions-to-ask-before-buying-dubai-property",
] as const;

const FAQS: Record<string, { question: string; answer: string }[]> = {
  en: [
    {
      question: "Does the property have to be a Binayah listing?",
      answer:
        "No. Send us anything — another agency's listing, a portal link, a developer's brochure, even a screenshot someone forwarded you on WhatsApp. That's rather the point: you should be able to get a straight answer about a place no matter who happens to be selling it.",
    },
    {
      question: "Where do the price comparisons come from?",
      answer:
        "From what homes actually sold for — real recorded sale prices, not what other sellers are asking. Asking prices drift upward together and tell you very little. We line your property up against ones in the same area, the same type and the same number of bedrooms, and tell you how many sales we found. If it's only a handful, we say so instead of dressing a guess up as a verdict.",
    },
    {
      question: "Can I check a rental listing too?",
      answer:
        "Yes. Send a rental and we'll compare what they're asking against what people nearby are actually paying — from real signed tenancy contracts, worked out per square foot so size doesn't skew it. We'll also show roughly what it would cost to buy the same place, in case you're weighing renting against buying.",
    },
    {
      question: "How accurate are the service charge estimates?",
      answer:
        "They're estimates, and we say so on the page. Service charges are set building by building, not area by area, so there's no way for us to look up your exact tower. We use a sensible figure for the area and point you at the official index to check yours. It's worth doing — the service charge is the single biggest thing eating into what you actually keep from rent.",
    },
    {
      question: "What does it cost, and what do you need from me?",
      answer:
        "The check is free. You get the verdict, how the price compares, and the total cash figure without giving us anything at all. For the rest — the full cost breakdown, what it earns as a rental, the questions to ask and places worth comparing — we ask for a name and a number, because one of our agents may call you about it.",
    },
    {
      question: "How do I know if a Dubai asking price is fair, and is there room to negotiate?",
      answer:
        "Work out the price per square foot and compare it with what similar homes in the same area actually sold for — not with what other sellers are asking, since those drift upward together. We do that for you. If a place is more than 10% above what comparable homes went for, there should be a concrete reason: a high floor, a proper view, a recent renovation. If nobody can point to one, that gap is your room to negotiate.",
    },
    {
      question: "What rental yield should I expect in Dubai?",
      answer:
        "Rents in Dubai tend to work out at roughly 4% of a property's value a year in the prime waterfront spots, and 7-8% in cheaper areas like Jumeirah Village Circle. But that's before costs. What you actually keep is a good deal less once the service charge, empty months, management and the municipality fee come out — and that's the number worth caring about. We show you both, and every deduction in between.",
    },
    {
      question: "Can I use this instead of a valuation?",
      answer:
        "No — and we'd rather be straight about that. This is here to help you ask sharper questions and notice things worth checking. It isn't a formal valuation and it isn't financial advice. If you need one for a mortgage or anything legal, banks will want a certified valuer.",
    },
    {
      question: "What's actually included in the cash figure?",
      answer:
        "The price or your deposit, the 4% government transfer fee, the registration and title paperwork, the trustee office fee, the agent's commission where it applies, the developer's clearance certificate, and if you're borrowing, the bank's arrangement fee, its valuation and the mortgage registration. One thing worth knowing: since February 2025 the transfer fee and commission can't be added to your loan, so you need them in cash. On a finished home it usually comes to about 7% on top of the price.",
    },
  ],
  ru: [
    {
      question: "Объект обязательно должен быть из каталога Binayah?",
      answer:
        "Нет. Присылайте что угодно — объявление другого агентства, ссылку с портала, брошюру застройщика, даже скриншот, который вам переслали в WhatsApp. В этом, собственно, и смысл: вы должны получить прямой ответ о квартире независимо от того, кто её продаёт.",
    },
    {
      question: "Откуда берутся цены для сравнения?",
      answer:
        "Из того, за сколько жильё реально продавалось, — из реальных зарегистрированных цен сделок, а не из того, сколько просят другие продавцы. Цены в объявлениях дружно ползут вверх и говорят очень мало. Мы сравниваем ваш объект с такими же — тот же район, тот же тип, то же количество спален — и говорим, сколько сделок нашли. Если их всего несколько, мы так и пишем, а не выдаём догадку за приговор.",
    },
    {
      question: "А арендное объявление можно проверить?",
      answer:
        "Да. Пришлите объявление об аренде, и мы сравним запрашиваемую цену с тем, сколько на самом деле платят по соседству, — по реальным подписанным договорам аренды, в пересчёте на квадратный фут, чтобы разница в площади не путала картину. Ещё покажем, примерно во сколько обошлось бы купить то же самое, если вы выбираете между арендой и покупкой.",
    },
    {
      question: "Насколько точны оценки сервисного сбора?",
      answer:
        "Это именно оценки, и мы прямо пишем об этом на странице. Сервисный сбор устанавливается по каждому зданию отдельно, а не по району, так что узнать цифру именно по вашей башне мы не можем. Мы берём разумную величину для района и показываем, где свериться с официальным реестром. Сделать это стоит: сервисный сбор — самая крупная статья, которая съедает то, что вы реально оставляете себе от аренды.",
    },
    {
      question: "Сколько это стоит и что нужно от меня?",
      answer:
        "Проверка бесплатная. Вердикт, сравнение цены и итоговую сумму наличными вы получаете, вообще ничего нам не отдавая. Для остального — полной раскладки расходов, доходности в аренду, вопросов, которые стоит задать, и вариантов для сравнения — мы просим имя и номер, потому что кто-то из наших агентов может вам по этому поводу позвонить.",
    },
    {
      question: "Как понять, справедлива ли запрашиваемая цена в Дубае, и есть ли место для торга?",
      answer:
        "Посчитайте цену за квадратный фут и сравните с тем, за сколько реально продавалось похожее жильё в том же районе, — а не с тем, сколько просят другие продавцы, потому что эти цифры дружно ползут вверх. Мы делаем это за вас. Если объект стоит больше чем на 10% дороже сопоставимых сделок, для этого должна быть понятная причина: высокий этаж, настоящий вид, свежий ремонт. Если никто не может её назвать — вот эта разница и есть ваше пространство для торга.",
    },
    {
      question: "На какую доходность от аренды рассчитывать в Дубае?",
      answer:
        "Аренда в Дубае обычно выходит примерно в 4% от стоимости жилья в год в престижных районах у воды и 7-8% в местах подешевле вроде Jumeirah Village Circle. Но это до расходов. На руках остаётся заметно меньше, когда вычтешь сервисный сбор, месяцы простоя, управление и муниципальный сбор, — и вот эта цифра и важна. Мы показываем обе и каждый вычет между ними.",
    },
    {
      question: "Можно использовать это вместо оценки?",
      answer:
        "Нет — и мы лучше скажем честно. Это нужно, чтобы вы задавали более острые вопросы и замечали то, что стоит проверить. Это не официальная оценка и не финансовая консультация. Если оценка нужна для ипотеки или чего-то юридического, банк потребует сертифицированного оценщика.",
    },
    {
      question: "Что именно входит в сумму наличными?",
      answer:
        "Цена или ваш первоначальный взнос, государственный сбор за переоформление 4%, регистрация и оформление права собственности, сбор офиса-доверителя, комиссия агента там, где она есть, справка застройщика об отсутствии задолженности, а если берёте кредит — банковская комиссия за оформление, его оценка и регистрация ипотеки. Что важно знать: с февраля 2025 года сбор за переоформление и комиссию нельзя включить в кредит, так что они нужны наличными. По готовому жилью обычно получается около 7% сверх цены.",
    },
  ],
  fr: [
    {
      question: "Le bien doit-il forcément être une annonce Binayah ?",
      answer:
        "Non. Envoyez-nous n'importe quoi — l'annonce d'une autre agence, un lien de portail, la brochure d'un promoteur, même une capture d'écran que quelqu'un vous a transférée sur WhatsApp. C'est justement l'idée : vous devriez pouvoir obtenir une réponse franche sur un bien, peu importe qui le vend.",
    },
    {
      question: "D'où viennent les comparaisons de prix ?",
      answer:
        "Des prix auxquels les logements se sont réellement vendus — de vrais prix de vente enregistrés, et non ce que demandent les autres vendeurs. Les prix affichés montent tous ensemble et ne vous apprennent pas grand-chose. Nous comparons votre bien à d'autres du même quartier, du même type et avec le même nombre de chambres, et nous vous disons combien de ventes nous avons trouvées. S'il n'y en a qu'une poignée, nous le disons au lieu de déguiser une supposition en verdict.",
    },
    {
      question: "Puis-je aussi vérifier une annonce de location ?",
      answer:
        "Oui. Envoyez-nous une location et nous comparerons le loyer demandé à ce que les gens paient réellement dans le voisinage — d'après de vrais contrats de location signés, ramenés au pied carré pour que la surface ne fausse pas la comparaison. Nous vous montrerons aussi, en gros, ce que coûterait l'achat du même bien, au cas où vous hésiteriez entre louer et acheter.",
    },
    {
      question: "Quelle est la fiabilité des estimations de charges ?",
      answer:
        "Ce sont des estimations, et nous le disons sur la page. Les charges sont fixées immeuble par immeuble, pas quartier par quartier : nous n'avons aucun moyen de retrouver le chiffre exact de votre tour. Nous prenons un montant raisonnable pour le secteur et nous vous indiquons l'index officiel où vérifier le vôtre. Ça vaut la peine de le faire — les charges sont de loin le poste qui rogne le plus ce qui vous reste vraiment du loyer.",
    },
    {
      question: "Combien ça coûte, et qu'attendez-vous de moi ?",
      answer:
        "L'analyse est gratuite. Vous obtenez le verdict, la comparaison de prix et le montant total à sortir en liquide sans rien nous donner du tout. Pour le reste — le détail complet des coûts, ce que ça rapporte en location, les questions à poser et les biens qui méritent d'être comparés — nous demandons un nom et un numéro, parce qu'un de nos agents pourrait vous appeler à ce sujet.",
    },
    {
      question: "Comment savoir si un prix demandé à Dubaï est juste, et y a-t-il de la marge pour négocier ?",
      answer:
        "Calculez le prix au pied carré et comparez-le à ce que des logements similaires du même quartier se sont réellement vendus — pas à ce que demandent les autres vendeurs, puisque ces prix-là montent tous ensemble. Nous le faisons pour vous. Si un bien dépasse de plus de 10% ce qu'ont donné des logements comparables, il doit y avoir une raison concrète : un étage élevé, une vraie vue, une rénovation récente. Si personne n'est capable d'en citer une, cet écart, c'est votre marge de négociation.",
    },
    {
      question: "Quel rendement locatif espérer à Dubaï ?",
      answer:
        "À Dubaï, les loyers tournent autour de 4% de la valeur du bien par an dans les quartiers prisés en bord de mer, et 7-8% dans les secteurs moins chers comme Jumeirah Village Circle. Mais c'est avant les frais. Ce qui vous reste vraiment est nettement moindre une fois retirés les charges, les mois de vacance, la gestion et la taxe municipale — et c'est ce chiffre-là qui compte. Nous vous montrons les deux, et chaque déduction entre les deux.",
    },
    {
      question: "Puis-je m'en servir à la place d'une expertise ?",
      answer:
        "Non — et autant être direct là-dessus. C'est fait pour vous aider à poser des questions plus pointues et à repérer ce qui mérite vérification. Ce n'est pas une expertise officielle et ce n'est pas un conseil financier. S'il vous en faut une pour un crédit immobilier ou quoi que ce soit de juridique, les banques exigeront un expert certifié.",
    },
    {
      question: "Qu'est-ce qui est vraiment compris dans le montant en liquide ?",
      answer:
        "Le prix ou votre apport, les 4% de frais de transfert versés à l'État, l'enregistrement et les papiers du titre de propriété, les frais du bureau de confiance, la commission de l'agent quand elle s'applique, l'attestation de solde du promoteur, et si vous empruntez, les frais de dossier de la banque, son expertise et l'enregistrement de l'hypothèque. Une chose à savoir : depuis février 2025, les frais de transfert et la commission ne peuvent plus être intégrés à votre prêt, il vous les faut donc en liquide. Sur un bien achevé, on arrive en général à environ 7% en plus du prix.",
    },
  ],
  ar: [
    {
      question: "هل يجب أن يكون العقار مدرجاً لدى Binayah؟",
      answer:
        "لا. أرسل لنا أي شيء — إعلان وكالة أخرى، رابطاً من موقع عقاري، كتيّب مطوّر، حتى لقطة شاشة أرسلها لك أحدهم على WhatsApp. هذا هو المقصود أصلاً: من حقك أن تحصل على إجابة صريحة عن أي عقار، أياً كان من يبيعه.",
    },
    {
      question: "من أين تأتي مقارنات الأسعار؟",
      answer:
        "من الأسعار التي بيعت بها البيوت فعلاً — أسعار بيع حقيقية مسجّلة، لا ما يطلبه البائعون الآخرون. الأسعار المطلوبة ترتفع معاً ولا تخبرك بالكثير. نضع عقارك بجانب عقارات في المنطقة نفسها، من النوع نفسه وبعدد الغرف نفسه، ونخبرك بعدد عمليات البيع التي وجدناها. وإن كانت قليلة، نقولها كما هي بدل أن نُلبس التخمين ثوب الحكم القاطع.",
    },
    {
      question: "هل يمكنني فحص إعلان إيجار أيضاً؟",
      answer:
        "نعم. أرسل لنا إعلان إيجار وسنقارن المبلغ المطلوب بما يدفعه الناس فعلاً في الجوار — من عقود إيجار حقيقية موقّعة، محسوبة على أساس القدم المربع حتى لا يشوّش فرق المساحة الصورة. وسنعرض لك أيضاً كم سيكلّف شراء المكان نفسه تقريباً، إن كنت تقارن بين الإيجار والشراء.",
    },
    {
      question: "ما مدى دقة تقديرات رسوم الخدمات؟",
      answer:
        "هي تقديرات، ونقول ذلك صراحةً في الصفحة. رسوم الخدمات تُحدَّد لكل مبنى على حدة لا لكل منطقة، فلا سبيل لدينا للوصول إلى رقم برجك بالتحديد. نأخذ رقماً معقولاً للمنطقة ونرشدك إلى السجل الرسمي لتتحقق من رقمك أنت. والأمر يستحق العناء — رسوم الخدمات هي أكبر بند يقتطع مما يبقى لك فعلاً من الإيجار.",
    },
    {
      question: "كم تكلفة ذلك، وماذا تحتاجون مني؟",
      answer:
        "الفحص مجاني. تحصل على الخلاصة، وكيف يقارَن السعر، وإجمالي المبلغ النقدي، من دون أن تعطينا أي شيء إطلاقاً. أما الباقي — التفصيل الكامل للتكاليف، وما يدرّه العقار كإيجار، والأسئلة التي يجدر طرحها والأماكن التي تستحق المقارنة — فنطلب اسماً ورقم هاتف، لأن أحد وكلائنا قد يتصل بك بشأنه.",
    },
    {
      question: "كيف أعرف إن كان السعر المطلوب في دبي منصفاً، وهل هناك مجال للتفاوض؟",
      answer:
        "احسب سعر القدم المربع وقارنه بما بيعت به بيوت مشابهة في المنطقة نفسها فعلاً — لا بما يطلبه البائعون الآخرون، فتلك الأسعار ترتفع معاً. نحن نفعل ذلك نيابة عنك. إذا كان عقار ما أعلى بأكثر من 10% مما حصلت عليه العقارات المماثلة، فلا بد من سبب ملموس: طابق مرتفع، إطلالة حقيقية، تجديد حديث. وإن لم يستطع أحد أن يشير إلى سبب، فهذا الفارق هو مجالك للتفاوض.",
    },
    {
      question: "ما العائد الإيجاري الذي ينبغي أن أتوقعه في دبي؟",
      answer:
        "الإيجارات في دبي تعادل عادةً نحو 4% من قيمة العقار سنوياً في المناطق المميزة على الواجهة البحرية، و7-8% في المناطق الأرخص مثل Jumeirah Village Circle. لكن هذا قبل التكاليف. ما يبقى في يدك أقل من ذلك بكثير بعد خصم رسوم الخدمات وأشهر الشغور والإدارة ورسوم البلدية — وهذا هو الرقم الذي يستحق الاهتمام. نعرض لك الرقمين معاً، وكل خصم بينهما.",
    },
    {
      question: "هل يمكنني استخدام هذا بدل التقييم؟",
      answer:
        "لا — ونفضّل أن نكون صريحين في ذلك. هذا موجود ليساعدك على طرح أسئلة أذكى والانتباه إلى ما يستحق التدقيق. إنه ليس تقييماً رسمياً وليس استشارة مالية. وإن احتجت تقييماً لقرض عقاري أو لأي أمر قانوني، فالبنوك ستطلب مُقيِّماً معتمداً.",
    },
    {
      question: "ما الذي يشمله المبلغ النقدي فعلاً؟",
      answer:
        "السعر أو دفعتك الأولى، ورسوم نقل الملكية الحكومية البالغة 4%، والتسجيل وأوراق سند الملكية، ورسوم مكتب الأمانة، وعمولة الوكيل حيثما تنطبق، وشهادة براءة الذمة من المطوّر، وإن كنت تقترض، فرسوم ترتيب القرض من البنك وتقييمه وتسجيل الرهن. أمر يستحق أن تعرفه: منذ فبراير 2025 لم يعد بالإمكان إضافة رسوم نقل الملكية والعمولة إلى قرضك، فأنت بحاجة إليهما نقداً. وفي العقار الجاهز يصل المجموع عادةً إلى نحو 7% فوق السعر.",
    },
  ],
  zh: [
    {
      question: "房源必须是 Binayah 的吗？",
      answer:
        "不用。什么都可以发给我们——别家中介的房源、门户网站的链接、开发商的宣传册，哪怕是别人用 WhatsApp 转给你的一张截图都行。这本来就是重点：不管这套房子是谁在卖，你都应该能得到一个实话实说的答案。",
    },
    {
      question: "价格对比的数据是哪来的？",
      answer:
        "来自房子实际的成交价——真实记录在案的成交价，而不是别的卖家在要的价。挂牌价会一起往上飘，说明不了什么。我们拿你这套房子去比同一片区、同一类型、同样卧室数量的房子，并且告诉你我们找到了多少笔成交。如果只有寥寥几笔，我们会直说，而不是把一个猜测包装成结论。",
    },
    {
      question: "租房的房源也能查吗？",
      answer:
        "可以。发一个租盘过来，我们会把对方开的价，和附近的人实际在付的租金做对比——数据来自真实签过的租赁合同，而且按每平方英尺折算，这样面积大小就不会把结果带偏。我们还会顺带告诉你，买下同样一套房大概要多少钱，万一你正在纠结是租还是买。",
    },
    {
      question: "物业费的估算有多准？",
      answer:
        "那就是估算，我们在页面上也是这么写的。物业费是一栋楼一栋楼定的，不是一个片区一个价，所以我们没办法查到你那栋楼的具体数字。我们用的是这个片区一个比较合理的数，并且会指给你官方的查询表，让你去核对自己那栋。这件事值得做——在你从租金里真正能留下多少这件事上，物业费是啃掉最多的那一项。",
    },
    {
      question: "这要花多少钱？你们需要我提供什么？",
      answer:
        "查一次是免费的。结论、价格比得怎么样、以及总共要准备多少现金，这些你什么都不用给就能拿到。剩下的部分——完整的费用明细、拿来出租能有多少收益、该问哪些问题、还有哪些地方值得比一比——我们会要一个名字和一个电话号码，因为我们的顾问可能会就这套房子给你打个电话。",
    },
    {
      question: "怎么判断迪拜的一个报价合不合理？还有没有砍价的空间？",
      answer:
        "算出每平方英尺的单价，然后拿它去比同一片区里类似的房子实际卖了多少钱——不要去比别的卖家在要的价，因为那些价会一起往上飘。这件事我们替你做。如果一套房比可比房源的成交价高出 10% 以上，那背后应该有个说得出口的理由：楼层高、景观是真的好、刚翻新过。如果谁也说不出一个来，那这个差价就是你砍价的空间。",
    },
    {
      question: "在迪拜该预期多少租金回报率？",
      answer:
        "在临海的高端地段，迪拜的租金一年下来大致相当于房价的 4% 左右；在像 Jumeirah Village Circle 这样便宜些的片区，能到 7-8%。但这是还没扣成本的数。等物业费、空置的那几个月、托管费和市政费都出去之后，你真正能留下的要少不少——而那个数才是值得在意的。两个数我们都给你看，中间每一项扣除也都列出来。",
    },
    {
      question: "我能拿这个代替估值报告吗？",
      answer:
        "不能——这点我们宁愿跟你说清楚。它的作用是帮你把问题问得更到位，帮你注意到哪些地方值得去查。它不是一份正式的估值，也不是理财建议。如果你是要办房贷或者办什么法律上的事，银行会要一份有资质的估价师出的报告。",
    },
    {
      question: "那个现金数字里到底包含什么？",
      answer:
        "房价或者你的首付、4% 的政府过户费、登记和产权文件的费用、受托办事处的手续费、该付中介佣金的时候那笔佣金、开发商开的无欠款证明，如果你要贷款的话，还有银行的手续费、银行的估值费和抵押登记费。有一点值得知道：从 2025 年 2 月起，过户费和佣金不能再算进贷款里了，所以这两笔你得拿现金出来。一套现房算下来，通常是在房价之上再加大约 7%。",
    },
  ],
  vi: [
    {
      question: "Bất động sản có bắt buộc phải là tin đăng của Binayah không?",
      answer:
        "Không. Gửi cho chúng tôi bất cứ thứ gì — tin đăng của một sàn khác, một đường link trên trang rao vặt, tờ brochure của chủ đầu tư, thậm chí một ảnh chụp màn hình ai đó chuyển cho bạn qua WhatsApp. Đó mới đúng là ý nghĩa của nó: bạn nên có được một câu trả lời thẳng thắn về một căn nhà, bất kể ai đang bán nó.",
    },
    {
      question: "Số liệu so sánh giá lấy từ đâu?",
      answer:
        "Từ giá những căn nhà thật sự đã bán được — giá bán thật đã được ghi nhận, chứ không phải giá mà những người bán khác đang hỏi. Giá rao thường cùng nhau trôi lên và chẳng nói lên được mấy điều. Chúng tôi đặt bất động sản của bạn cạnh những căn cùng khu, cùng loại và cùng số phòng ngủ, rồi cho bạn biết chúng tôi tìm được bao nhiêu giao dịch. Nếu chỉ có vài ba cái, chúng tôi nói thẳng như vậy thay vì khoác cho một phỏng đoán cái vẻ của một kết luận.",
    },
    {
      question: "Tôi kiểm tra một tin cho thuê được không?",
      answer:
        "Được. Gửi một tin cho thuê và chúng tôi sẽ so giá họ đang hỏi với mức người ta ở quanh đó thật sự đang trả — lấy từ những hợp đồng thuê nhà đã ký thật, tính ra theo mỗi foot vuông để diện tích không làm lệch kết quả. Chúng tôi cũng cho bạn thấy mua đứt căn đó thì tốn khoảng bao nhiêu, phòng khi bạn đang cân nhắc giữa thuê và mua.",
    },
    {
      question: "Ước tính phí dịch vụ chính xác đến đâu?",
      answer:
        "Đó là ước tính, và chúng tôi ghi rõ như vậy ngay trên trang. Phí dịch vụ được ấn định theo từng toà nhà, không phải theo từng khu, nên chúng tôi không có cách nào tra ra đúng toà của bạn. Chúng tôi dùng một con số hợp lý cho khu đó và chỉ cho bạn bảng tra chính thức để tự kiểm tra toà mình. Việc này đáng làm — phí dịch vụ là thứ ngốn nhiều nhất vào phần tiền thuê bạn thật sự giữ lại được.",
    },
    {
      question: "Chi phí là bao nhiêu, và các bạn cần gì ở tôi?",
      answer:
        "Kiểm tra thì miễn phí. Bạn nhận được kết luận, giá so ra thế nào, và tổng số tiền mặt cần có mà không phải đưa chúng tôi bất cứ thứ gì. Phần còn lại — bảng chi phí đầy đủ, cho thuê thì thu về được bao nhiêu, những câu nên hỏi và những nơi đáng đem ra so — chúng tôi xin một cái tên và một số điện thoại, vì có thể một bạn tư vấn của chúng tôi sẽ gọi cho bạn về căn đó.",
    },
    {
      question: "Làm sao biết một mức giá rao ở Dubai có hợp lý không, và còn chỗ để thương lượng không?",
      answer:
        "Tính ra giá mỗi foot vuông rồi so với mức những căn tương tự trong cùng khu đã thật sự bán được — đừng so với giá những người bán khác đang hỏi, vì mấy mức đó cùng nhau trôi lên. Việc đó chúng tôi làm giúp bạn. Nếu một căn cao hơn 10% so với mức các căn tương đương đã bán, thì phải có một lý do cụ thể: tầng cao, view thật sự đẹp, mới sửa lại gần đây. Nếu không ai chỉ ra được lý do nào, thì khoảng chênh đó chính là chỗ để bạn thương lượng.",
    },
    {
      question: "Ở Dubai nên kỳ vọng lợi suất cho thuê bao nhiêu?",
      answer:
        "Tiền thuê ở Dubai thường ra khoảng 4% giá trị bất động sản mỗi năm ở những vị trí ven biển đắt đỏ, và 7-8% ở những khu rẻ hơn như Jumeirah Village Circle. Nhưng đó là trước chi phí. Số bạn thật sự giữ lại được thấp hơn kha khá một khi trừ đi phí dịch vụ, những tháng bỏ trống, phí quản lý và phí đô thị — và đó mới là con số đáng quan tâm. Chúng tôi cho bạn thấy cả hai, cùng từng khoản trừ ở giữa.",
    },
    {
      question: "Tôi dùng cái này thay cho một bản thẩm định giá được không?",
      answer:
        "Không — và chúng tôi thà nói thẳng chuyện đó. Cái này có ở đây để giúp bạn đặt những câu hỏi sắc hơn và để ý những điều đáng đi kiểm tra. Nó không phải một bản thẩm định giá chính thức và cũng không phải lời khuyên tài chính. Nếu bạn cần một bản để vay ngân hàng hay cho việc gì đó về pháp lý, ngân hàng sẽ đòi một người thẩm định giá có chứng chỉ.",
    },
    {
      question: "Con số tiền mặt đó thật ra gồm những gì?",
      answer:
        "Giá nhà hoặc tiền đặt cọc của bạn, phí sang tên 4% nộp cho nhà nước, tiền làm hồ sơ đăng ký và sổ, phí văn phòng uỷ thác, hoa hồng môi giới nếu có, giấy xác nhận hết nghĩa vụ của chủ đầu tư, và nếu bạn vay thì thêm phí thu xếp của ngân hàng, phí thẩm định giá của ngân hàng và phí đăng ký thế chấp. Một điều đáng biết: từ tháng 2 năm 2025, phí sang tên và hoa hồng không được cộng vào khoản vay nữa, nên hai khoản đó bạn phải có sẵn bằng tiền mặt. Với một căn đã hoàn thiện, tổng thường rơi vào khoảng 7% cộng thêm trên giá nhà.",
    },
  ],
  he: [
    {
      question: "הנכס חייב להיות מודעה של Binayah?",
      answer:
        "לא. שלחו לנו כל דבר — מודעה של סוכנות אחרת, קישור מאתר נדל\"ן, חוברת של יזם, אפילו צילום מסך שמישהו העביר לכם ב-WhatsApp. זה בעצם כל הרעיון: מגיעה לכם תשובה ישרה על נכס, לא משנה מי במקרה מוכר אותו.",
    },
    {
      question: "מאיפה מגיעות ההשוואות של המחירים?",
      answer:
        "ממה שדירות באמת נמכרו בו — מחירי מכירה אמיתיים שנרשמו, ולא ממה שמוכרים אחרים מבקשים. מחירי בקשה נוטים לטפס יחד כלפי מעלה ולא מלמדים כמעט כלום. אנחנו מעמידים את הנכס שלכם מול נכסים באותו אזור, מאותו סוג ועם אותו מספר חדרי שינה, ואומרים לכם כמה עסקאות מצאנו. אם מדובר רק בכמה בודדות, נגיד את זה במפורש במקום להלביש על ניחוש מראה של פסק דין.",
    },
    {
      question: "אפשר לבדוק גם מודעת השכרה?",
      answer:
        "כן. שלחו מודעת השכרה ונשווה את מה שמבקשים מול מה שאנשים בסביבה באמת משלמים — מתוך חוזי שכירות חתומים אמיתיים, מחושב לפי רגל מרובעת כדי שהגודל לא יעוות את התמונה. נראה לכם גם בערך כמה היה עולה לקנות את אותו מקום, למקרה ששוקלים שכירות מול קנייה.",
    },
    {
      question: "כמה מדויקות הערכות דמי הניהול?",
      answer:
        "אלו הערכות, ואנחנו כותבים את זה על הדף. דמי הניהול נקבעים בניין בניין, לא אזור אזור, ולכן אין לנו דרך לשלוף את המגדל המדויק שלכם. אנחנו לוקחים מספר הגיוני לאזור ומפנים אתכם למדד הרשמי כדי שתבדקו את שלכם. שווה לעשות את זה — דמי הניהול הם הדבר הכי גדול שאוכל ממה שבאמת נשאר לכם מהשכירות.",
    },
    {
      question: "כמה זה עולה, ומה אתם צריכים ממני?",
      answer:
        "הבדיקה בחינם. אתם מקבלים את המסקנה, איך המחיר מתייחס להשוואה, ואת סכום המזומן הכולל — בלי לתת לנו שום דבר. בשביל כל השאר — פירוט העלויות המלא, כמה זה מכניס בהשכרה, אילו שאלות לשאול ואילו מקומות שווה להשוות מולם — אנחנו מבקשים שם ומספר טלפון, כי ייתכן שאחד הסוכנים שלנו יתקשר אליכם בעניין.",
    },
    {
      question: "איך אדע אם מחיר מבוקש בדובאי הוגן, ויש מקום להתמקח?",
      answer:
        "חשבו את המחיר לרגל מרובעת והשוו אותו למה שדירות דומות באותו אזור באמת נמכרו בו — לא למה שמוכרים אחרים מבקשים, כי אלה מטפסים יחד כלפי מעלה. אנחנו עושים את זה בשבילכם. אם נכס יקר ביותר מ-10% ממה שדירות דומות נמכרו בו, צריכה להיות לזה סיבה קונקרטית: קומה גבוהה, נוף אמיתי, שיפוץ שנעשה לאחרונה. אם אף אחד לא מצליח להצביע על סיבה כזו, הפער הזה הוא מרחב ההתמקחות שלכם.",
    },
    {
      question: "איזו תשואה משכירות כדאי לצפות לה בדובאי?",
      answer:
        "שכר הדירה בדובאי יוצא בדרך כלל בערך 4% משווי הנכס בשנה באזורי החוף היקרים, ו-7-8% באזורים זולים יותר כמו Jumeirah Village Circle. אבל זה לפני ההוצאות. מה שבאמת נשאר לכם נמוך בהרבה אחרי שיורדים דמי הניהול, החודשים שהדירה עומדת ריקה, הניהול ואגרת העירייה — וזה המספר ששווה להתייחס אליו. אנחנו מראים לכם את שניהם, וכל ניכוי שביניהם.",
    },
    {
      question: "אפשר להשתמש בזה במקום הערכת שווי?",
      answer:
        "לא — ועדיף שנהיה ישרים בעניין. זה נועד לעזור לכם לשאול שאלות חדות יותר ולשים לב לדברים ששווה לבדוק. זו לא הערכת שווי רשמית וזה לא ייעוץ פיננסי. אם אתם צריכים כזו למשכנתא או לכל עניין משפטי, הבנקים ידרשו שמאי מוסמך.",
    },
    {
      question: "מה בעצם נכלל בסכום המזומן?",
      answer:
        "המחיר או המקדמה שלכם, אגרת ההעברה הממשלתית בגובה 4%, הרישום והניירת של הבעלות, עמלת משרד הנאמן, עמלת הסוכן היכן שהיא חלה, אישור הסילוק מהיזם, ואם אתם לוקחים הלוואה — עמלת הטיפול של הבנק, הערכת השווי מטעמו ורישום המשכנתא. דבר אחד ששווה לדעת: מאז פברואר 2025 אי אפשר להוסיף את אגרת ההעברה ואת העמלה להלוואה, אז אתם צריכים אותן במזומן. על דירה מוגמרת זה מגיע בדרך כלל לכ-7% מעל המחיר.",
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.en;
  const description = descriptions[locale] ?? descriptions.en;

  return {
    title,
    description,
    keywords: [
      "Dubai property price check",
      "is this Dubai property overpriced",
      "Dubai property sold prices",
      "Dubai property purchase costs",
      "Dubai rental yield calculator",
      "Dubai service charges",
    ],
    alternates: { canonical: canonical(locale, PATH), languages: altLangs(PATH) },
    openGraph: {
      title,
      description,
      url: canonical(locale, PATH),
      siteName: "Binayah",
      locale: OG_LOCALE[locale] ?? "en_AE",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Binayah Deal Check" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function DealCheckPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dealCheck");

  const faqs = FAQS[locale] ?? FAQS.en;
  const lp = locale === "en" ? "" : `/${locale}`;

  // SoftwareApplication schema: this is a tool, not an article, and marking it
  // as one is what earns the richer result for "dubai property price check".
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Binayah Deal Check",
    url: `${SITE_URL}${lp}${PATH}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    description: descriptions[locale] ?? descriptions.en,
    offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
    provider: { "@type": "RealEstateAgent", name: "Binayah Properties", url: SITE_URL },
    featureList: [
      "Price compared with what similar homes actually sold for",
      "Total cash required including all purchase costs",
      "Rental economics with assumptions shown",
      "Diligence questions specific to the property",
      "Comparable alternatives",
    ],
  };

  return (
    <>
      <Navbar />

      <main className="bg-background">
        {/* ── Hero ──────────────────────────────────────────────────────────
            The hero sits on the house gradient (#0B3D2E → #1A7A5A) and carries
            a real check as a white card, so the page opens by demonstrating
            the product rather than describing it. The tool card below overlaps
            the gradient's bottom edge, pulling the form into the hero instead
            of stranding it on the page beneath. */}
        <section className="relative">
          <div
            className="relative overflow-hidden pt-20 pb-44 sm:pt-32 sm:pb-72"
            style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #14543D 55%, #1A7A5A 100%)" }}
          >
            {/* Ambient warmth, top-right — keeps the flat gradient from reading
                as a solid block without competing with the card. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(46% 58% at 82% 8%, rgba(212,168,71,0.16) 0%, rgba(212,168,71,0) 68%)",
              }}
            />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-[1fr_1.02fr] gap-8 lg:gap-16 items-center">
                {/* Left — the claim */}
                <div>
                  <div aria-hidden className="h-px w-10 bg-[#D4A847] mb-6" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4A847]">
                    {t("eyebrow")}
                  </p>
                  <h1 className="mt-4 sm:mt-5 text-[32px] leading-[1.1] sm:text-[46px] lg:text-[56px] font-bold text-white text-balance">
                    {t("heroTitle")} {t("heroTitleLight")}
                  </h1>
                  <p className="mt-4 sm:mt-6 text-[15px] sm:text-base leading-relaxed text-white/70 max-w-xl">
                    {t("heroSubtitle")}
                  </p>

                  <ul className="mt-6 sm:mt-8 flex flex-wrap gap-2">
                    {[t("trustFree"), t("trustNoSignup"), t("trustDld"), t("trustAnyAgency")].map((label) => (
                      <li
                        key={label}
                        className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[13px] font-medium text-white/80 sm:py-1.5 sm:text-xs"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — a real check, as a white card on the gradient.
                    Desktop only: stacked on a phone this card sat between the
                    headline and the tool, pushing the actual product to ~1100px
                    — a screen and a half of scrolling before you could do
                    anything. The mobile copy renders after the tool instead. */}
                <figure className="relative hidden lg:block">
                  <div className="rounded-[20px] bg-white p-5 sm:p-7 shadow-2xl shadow-black/25">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                        {t("sampleLabel")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {t("vBelow")}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-medium text-foreground">{t("sampleProperty")}</p>

                    <div className="my-5 h-px bg-border/60" />

                    {/* Stacked bars on one shared scale — two lengths you can
                        compare at a glance, which two side-by-side numbers
                        never let you do. */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-end justify-between gap-3">
                          <span className="text-sm text-muted-foreground">{t("priceThis")}</span>
                          <span className="text-2xl sm:text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
                            2,298
                            <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">
                              {t("perSqft")}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-[#1A7A5A]" style={{ width: "95%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-end justify-between gap-3">
                          <span className="text-sm text-muted-foreground">{t("priceComparable")}</span>
                          <span className="text-2xl sm:text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
                            2,419
                            <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">
                              {t("perSqft")}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-[#D4A847]" style={{ width: "100%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 px-4 py-3.5">
                      <span className="text-sm text-emerald-900">{t("sampleCheaper")}</span>
                      <span className="text-lg font-semibold tabular-nums text-emerald-700">−5.0%</span>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-[11px]">
                      {t("sampleBasis")}
                    </p>
                    <figcaption className="mt-1.5 text-xs italic leading-relaxed text-muted-foreground/70 sm:text-[11px]">
                      {t("sampleCaption")}
                    </figcaption>
                  </div>
                </figure>
              </div>
            </div>
          </div>

          {/* Tool — lifted over the gradient's edge. The id is the target of
              the closing band's CTA; scroll-mt keeps it clear of the navbar. */}
          <div id="dc-tool" className="relative -mt-32 sm:-mt-60 pb-14 sm:pb-16 scroll-mt-20 sm:scroll-mt-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <DealCheckClient />
              {/* Same example, below the tool on mobile. */}
              <figure className="relative mt-8 lg:hidden">
                <div className="rounded-[20px] bg-white p-5 sm:p-7 shadow-2xl shadow-black/25">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                      {t("sampleLabel")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t("vBelow")}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-medium text-foreground">{t("sampleProperty")}</p>

                  <div className="my-5 h-px bg-border/60" />

                  {/* Stacked bars on one shared scale — two lengths you can
                      compare at a glance, which two side-by-side numbers
                      never let you do. */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-sm text-muted-foreground">{t("priceThis")}</span>
                        <span className="text-2xl sm:text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
                          2,298
                          <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">
                            {t("perSqft")}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-[#1A7A5A]" style={{ width: "95%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-sm text-muted-foreground">{t("priceComparable")}</span>
                        <span className="text-2xl sm:text-[28px] font-semibold tabular-nums tracking-tight text-foreground">
                          2,419
                          <span className="ms-1.5 text-[11px] font-normal text-muted-foreground">
                            {t("perSqft")}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-[#D4A847]" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 px-4 py-3.5">
                    <span className="text-sm text-emerald-900">{t("sampleCheaper")}</span>
                    <span className="text-lg font-semibold tabular-nums text-emerald-700">−5.0%</span>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-[11px]">
                    {t("sampleBasis")}
                  </p>
                  <figcaption className="mt-1.5 text-xs italic leading-relaxed text-muted-foreground/70 sm:text-[11px]">
                    {t("sampleCaption")}
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* ── What you get back ─────────────────────────────────────────────
            Asymmetric: the heading holds its own column so the four cards read
            as one set rather than a centred grid under a banner. The 01-04
            numerals are real sequence — these are the report's four sections
            in the order they appear — set in mono so they read as indices, not
            decoration. */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] gap-10 lg:gap-16">
              <div className="lg:pt-2">
                <div aria-hidden className="h-px w-10 bg-[#D4A847] mb-5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#D4A847]">
                  {t("wygEyebrow")}
                </p>
                <h2 className="mt-4 text-[28px] sm:text-[34px] leading-[1.12] font-bold text-foreground text-balance">
                  {t("whatYouGet")}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xs">
                  {t("wygIntro")}
                </p>
              </div>

              <ol className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  { t: t("wyg1Title"), d: t("wyg1Desc") },
                  { t: t("wyg2Title"), d: t("wyg2Desc") },
                  { t: t("wyg3Title"), d: t("wyg3Desc") },
                  { t: t("wyg4Title"), d: t("wyg4Desc") },
                ].map((f, i) => (
                  <li
                    key={f.t}
                    className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-sm transition-colors hover:border-accent/40"
                  >
                    <span className="block font-mono text-xs tabular-nums text-[#D4A847]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3.5 text-[17px] font-semibold text-foreground text-balance">{f.t}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Read next ─────────────────────────────────────────────────────
            Near-black ink rather than a green tint: the guides are a different
            destination from the tool, and the deeper ground says so while
            letting the gold do the only talking. Surfaces are hairline-bordered
            translucent white over the ink, so the cards read as panels lit from
            within rather than boxes drawn on top. */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-[#0A0E0D]">
          {/* Ambient cast — keeps a large flat black from reading as dead space. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(58% 46% at 76% 6%, rgba(26,122,90,0.20) 0%, rgba(26,122,90,0) 66%), radial-gradient(42% 40% at 10% 96%, rgba(212,168,71,0.09) 0%, rgba(212,168,71,0) 70%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div aria-hidden className="h-px w-10 bg-[#D4A847] mb-5" />
            <h2 className="text-[28px] sm:text-[34px] font-bold text-white text-balance">
              {t("relatedTitle")}
            </h2>

            <ul className="mt-8 sm:mt-10 grid sm:grid-cols-3 gap-4 sm:gap-5">
              {RELATED_GUIDE_SLUGS.map((slug, i) => (
                <li key={slug}>
                  <Link
                    href={`/pulse/guides/${slug}`}
                    className="group relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 transition-all duration-300 hover:border-[#D4A847]/35 hover:bg-white/[0.05]"
                  >
                    {/* Index — the guides are a reading order, not a ranking,
                        but the numeral still tells you how many there are. */}
                    <span className="font-mono text-[11px] tabular-nums tracking-wider text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <h3 className="mt-4 text-[17px] font-semibold leading-snug text-white text-balance">
                      {t(`guide${i + 1}Title`)}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
                      {t(`guide${i + 1}Blurb`)}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A847]">
                      {t("readLink")}
                      <ArrowRight
                        className="w-3 h-3 rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────
            Asymmetric, like the section above it: the heading holds its own
            column with the escape hatch for anyone the answers don't cover,
            and the accordion is a single bordered panel rather than nine
            floating cards. First item open so the section shows its shape at
            rest instead of reading as a stack of closed bars. */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,2fr)] gap-10 lg:gap-14">
              <div className="lg:pt-1">
                <div aria-hidden className="h-px w-10 bg-[#D4A847] mb-5" />
                <h2 className="text-[28px] sm:text-[34px] leading-[1.12] font-bold text-foreground text-balance">
                  {t("faqTitle")}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xs">
                  {t("faqIntro")}
                </p>

                {/* Escape hatch — a generic FAQ can't answer "is THIS one a
                    good deal", which is the question people actually arrive
                    with. */}
                <div className="mt-8 rounded-2xl border border-[#D4A847]/25 bg-[#D4A847]/[0.07] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8922F]">
                    {t("faqStillUnsure")}
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-foreground/80">{t("faqAskUs")}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={waHref(t("waPrefill"), `${lp}${PATH}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0B3D2E] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#14543D]"
                    >
                      {t("whatsappUs")}
                    </a>
                    <a
                      href={`tel:+${WHATSAPP_NUMBER}`}
                      className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-xl border border-[#0B3D2E]/25 px-4 py-2.5 text-[13px] font-semibold text-[#0B3D2E] transition-colors hover:bg-[#0B3D2E]/5"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                {faqs.map((f, i) => (
                  <details key={f.question} className="group" open={i === 0}>
                    <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-4 p-5 sm:px-6 text-[15px] font-semibold text-foreground transition-colors hover:text-[#0B3D2E]">
                      {f.question}
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4A847] text-base leading-none text-white transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 sm:px-6 -mt-1 pe-12 text-sm leading-relaxed text-muted-foreground">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing band ──────────────────────────────────────────────────
            One last ask, on the brand gradient. The page has spent its length
            explaining the method; this is the sentence that says what to do. */}
        <section className="pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div
              className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14"
              style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #14543D 60%, #1A7A5A 100%)" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(50% 70% at 88% 20%, rgba(212,168,71,0.18) 0%, rgba(212,168,71,0) 70%)",
                }}
              />
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
                <div>
                  <p className="text-[26px] sm:text-[32px] font-bold leading-[1.15] text-white text-balance">
                    {t("ctaBandTitle")}
                    <br className="hidden sm:block" /> {t("ctaBandTitle2")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65 max-w-sm">
                    {t("formFooter")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <a
                    href="#dc-tool"
                    className="inline-flex items-center rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                    style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}
                  >
                    {t("submit")}
                  </a>
                  <a
                    href={waHref(t("waPrefill"), `${lp}${PATH}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.18]"
                  >
                    {t("whatsappUs")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <FAQJsonLd faqs={faqs} inLanguage={locale} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: locale === "en" ? "/" : `/${locale}` },
          { name: "Deal Check", href: `${lp}${PATH}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(appSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
