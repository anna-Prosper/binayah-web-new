// ── Golden Visa × nationality pages ───────────────────────────────────────
// Powers /golden-visa/[nationality]. The generic /golden-visa page already
// covers thresholds, the five-step process and the general FAQ, so these pages
// deliberately do NOT restate it. They answer only what is nationality-
// specific: what the visa is worth to that particular passport, what it is
// explicitly not, and which documents that country's applicants are asked for.

import type { LocalizedText } from "./foreign-buyers";

export interface GoldenVisaNationality {
  slug: string;
  /** Matching ForeignBuyerProfile slug, for the cross-link. */
  citizenSlug: string;
  country: string;
  demonym: string;
  flag: string;
  metaTitle: LocalizedText;
  metaDesc: LocalizedText;
  h1: LocalizedText;
  /** The threshold and what it grants. */
  whatItIs: LocalizedText;
  /** The honest limits — residence not citizenship, and passport-specific caveats. */
  whatItIsNot: LocalizedText;
  /** Documents and the country-specific attestation / funding reality. */
  documents: LocalizedText;
  areas: string[];
}

export const GOLDEN_VISA_NATIONALITIES: GoldenVisaNationality[] = [
  {
    slug: "singaporean",
    citizenSlug: "singaporean-citizen",
    country: "Singapore",
    demonym: "Singaporean",
    flag: "🇸🇬",
    metaTitle: {
      en: "UAE Golden Visa for Singaporeans | Property Route 2026",
      fr: "Golden Visa des Émirats pour les Singapouriens | Voie immobilière 2026",
      ru: "Golden Visa ОАЭ для граждан Сингапура | Через недвижимость 2026",
      ar: "الإقامة الذهبية الإماراتية للسنغافوريين | عبر العقار 2026",
      zh: "新加坡人的阿联酋黄金签证 | 房产路径 2026",
      vi: "Golden Visa UAE cho người Singapore | Lộ trình bất động sản 2026",
      he: "ויזת זהב לאיחוד האמירויות לסינגפורים | מסלול הנכס 2026"
    },
    metaDesc: {
      en: "What the AED 2M UAE Golden Visa gives a Singapore passport holder, what it does not, the documents Singaporeans are asked for, and how it interacts with Singapore residence.",
      fr: "Ce que le Golden Visa émirien à 2 M AED apporte à un passeport singapourien, ce qu'il n'apporte pas, les documents demandés et son articulation avec la résidence singapourienne.",
      ru: "Что даёт Golden Visa ОАЭ от AED 2M владельцу сингапурского паспорта, чего не даёт, какие документы запрашивают и как это соотносится с резидентством Сингапура.",
      ar: "ما الذي تمنحه الإقامة الذهبية الإماراتية بقيمة AED 2M لحامل جواز سنغافوري، وما لا تمنحه، والمستندات المطلوبة، وعلاقتها بالإقامة في سنغافورة.",
      zh: "AED 2M 的阿联酋黄金签证能给新加坡护照持有人什么、不能给什么、通常需要哪些文件，以及它与新加坡居留身份的关系。",
      vi: "Golden Visa UAE mức AED 2M mang lại gì cho người giữ hộ chiếu Singapore, không mang lại gì, cần giấy tờ nào và liên hệ thế nào với cư trú Singapore.",
      he: "מה ויזת הזהב של האיחוד בסך AED 2M מעניקה לבעל דרכון סינגפורי, מה לא, אילו מסמכים נדרשים, וכיצד היא מתיישבת עם תושבות בסינגפור."
    },
    h1: {
      en: "The UAE Golden Visa for Singaporeans",
      fr: "Le Golden Visa émirien pour les Singapouriens",
      ru: "Golden Visa ОАЭ для граждан Сингапура",
      ar: "الإقامة الذهبية الإماراتية للسنغافوريين",
      zh: "面向新加坡人的阿联酋黄金签证",
      vi: "Golden Visa UAE cho người Singapore",
      he: "ויזת הזהב של האיחוד לסינגפורים"
    },
    whatItIs: {
      en: "A property purchase of AED 2,000,000 or more qualifies the owner for a ten-year renewable UAE residence visa, and that is the same threshold for a Singapore passport as for any other. The visa is self-sponsored rather than employer-tied, covers a spouse and children, and carries no minimum stay requirement, so you can hold it without relocating. Off-plan qualifies where at least AED 2M has been paid to the developer, and where a property is mortgaged only the equity counts towards the threshold.",
      fr: "Un achat immobilier de 2 000 000 AED ou plus ouvre droit à un visa de résidence émirien de dix ans renouvelable, et ce seuil est le même pour un passeport singapourien que pour tout autre. Le visa est auto-parrainé et non lié à un employeur, couvre conjoint et enfants, et n'impose aucune durée de séjour minimale : vous pouvez donc le détenir sans vous expatrier. Un bien sur plan est éligible dès lors qu'au moins 2 M AED ont été versés au promoteur, et si le bien est hypothéqué, seule la quote-part en fonds propres compte pour le seuil.",
      ru: "Покупка недвижимости на AED 2 000 000 и более даёт право на десятилетнюю возобновляемую резидентскую визу ОАЭ, и порог для сингапурского паспорта такой же, как для любого другого. Виза самоспонсируемая, а не привязанная к работодателю, охватывает супруга и детей и не требует минимального срока пребывания, поэтому её можно держать без переезда. Строящийся объект подходит, если застройщику уплачено не менее AED 2M, а при ипотеке в порог засчитывается только собственный капитал.",
      ar: "شراء عقار بقيمة AED 2,000,000 أو أكثر يؤهل المالك لتأشيرة إقامة إماراتية لعشر سنوات قابلة للتجديد، وهو الحد نفسه لجواز السفر السنغافوري كما لأي جواز آخر. والتأشيرة ذاتية الكفالة لا مرتبطة بصاحب عمل، وتشمل الزوج والأبناء، ولا تشترط حداً أدنى للإقامة، فيمكنك الاحتفاظ بها دون الانتقال. وتُقبل الوحدات على الخارطة متى دُفع للمطوّر ما لا يقل عن AED 2M، وفي حال رهن العقار تُحتسب حصة الملكية الصافية فقط ضمن الحد.",
      zh: "购买价值 AED 2,000,000 或以上的房产，业主即符合十年可续期阿联酋居留签证的条件，新加坡护照与其他护照适用同一门槛。该签证为自我担保而非绑定雇主，覆盖配偶与子女，且无最低居留天数要求，因此无需迁居即可持有。期房在已向开发商支付至少 AED 2M 时符合条件；若房产设有按揭，仅净权益部分计入门槛。",
      vi: "Một giao dịch mua bất động sản từ AED 2.000.000 trở lên giúp chủ sở hữu đủ điều kiện nhận thị thực cư trú UAE mười năm có thể gia hạn, và ngưỡng này với hộ chiếu Singapore cũng như mọi hộ chiếu khác. Thị thực này tự bảo lãnh chứ không gắn với chủ lao động, bao gồm vợ/chồng và con cái, và không yêu cầu thời gian lưu trú tối thiểu, nên bạn có thể giữ nó mà không cần chuyển đến. Căn hình thành trong tương lai đủ điều kiện khi đã trả cho chủ đầu tư ít nhất AED 2M, và nếu bất động sản đang thế chấp thì chỉ phần vốn chủ sở hữu được tính vào ngưỡng.",
      he: "רכישת נכס בסך AED 2,000,000 ומעלה מזכה את הבעלים באשרת תושבות אמירתית לעשר שנים הניתנת לחידוש, וזהו אותו סף לדרכון סינגפורי כמו לכל דרכון אחר. האשרה היא בחסות עצמית ולא קשורה למעסיק, כוללת בן/בת זוג וילדים, ואינה דורשת שהייה מינימלית, כך שאפשר להחזיק בה בלי לעבור. יחידה על הנייר כשירה כאשר שולמו ליזם לפחות AED 2M, וכאשר הנכס ממושכן רק ההון העצמי נספר לצורך הסף."
    },
    whatItIsNot: {
      en: "It is a residence permit, not a passport. The UAE does not offer naturalisation by investment, so no amount of property converts into Emirati citizenship, and the visa lasts only while you continue to hold the qualifying property. It also does not change your Singapore status: Singapore permits dual residence in the practical sense, but your Singapore tax residence turns on your own circumstances rather than on holding a foreign visa. A Golden Visa does not by itself make you non-resident in Singapore, and it does not by itself make you UAE tax resident either — that has its own tests. If you are holding the visa purely as an option rather than relocating, treat it as travel and residence convenience, not as a tax plan.",
      fr: "C'est un titre de séjour, pas un passeport. Les Émirats n'offrent pas de naturalisation par investissement : aucun volume immobilier ne se convertit en nationalité émirienne, et le visa ne dure que tant que vous conservez le bien éligible. Il ne modifie pas non plus votre statut singapourien : Singapour admet en pratique une double résidence, mais votre résidence fiscale singapourienne dépend de votre situation propre et non de la détention d'un visa étranger. Un Golden Visa ne fait pas de vous, à lui seul, un non-résident singapourien, ni davantage un résident fiscal émirien — cela obéit à ses propres critères. Si vous détenez le visa comme une option plutôt qu'en vous expatriant, traitez-le comme une commodité de voyage et de résidence, pas comme un montage fiscal.",
      ru: "Это вид на жительство, а не паспорт. ОАЭ не предоставляют натурализацию за инвестиции, поэтому никакой объём недвижимости не превращается в эмиратское гражданство, а виза действует лишь пока вы сохраняете квалифицирующий объект. Она также не меняет ваш сингапурский статус: Сингапур практически допускает двойное резидентство, но ваше налоговое резидентство определяется вашими обстоятельствами, а не наличием иностранной визы. Golden Visa сама по себе не делает вас нерезидентом Сингапура и сама по себе не делает вас налоговым резидентом ОАЭ — у этого свои критерии. Если вы держите визу как опцию, а не переезжаете, воспринимайте её как удобство для поездок и проживания, а не как налоговый план.",
      ar: "إنها تصريح إقامة لا جواز سفر. فالإمارات لا تمنح التجنيس مقابل الاستثمار، ولذا لا يتحول أي قدر من العقارات إلى جنسية إماراتية، وتستمر التأشيرة فقط ما دمت محتفظاً بالعقار المؤهِّل. كما أنها لا تغيّر وضعك السنغافوري: فسنغافورة تسمح عملياً بالإقامة المزدوجة، لكن إقامتك الضريبية السنغافورية تتحدد بظروفك لا بحيازة تأشيرة أجنبية. والإقامة الذهبية وحدها لا تجعلك غير مقيم في سنغافورة، ولا تجعلك وحدها مقيماً ضريبياً في الإمارات — فلذلك اختباراته الخاصة. وإن كنت تحتفظ بالتأشيرة كخيار لا كانتقال فعلي، فاعتبرها تسهيلاً للسفر والإقامة لا خطة ضريبية.",
      zh: "它是居留许可，而非护照。阿联酋不提供投资入籍，因此再多房产也无法转化为阿联酋国籍，且该签证仅在您持续持有符合条件的房产期间有效。它同样不改变您的新加坡身份：新加坡在实务上允许双重居留，但您的新加坡税务居民身份取决于您自身情况，而非是否持有外国签证。黄金签证本身既不会使您成为新加坡非居民，也不会使您成为阿联酋税务居民——后者有其自身的认定标准。若您只是把签证作为一种选择权而非真正迁居，请将其视为出行与居留的便利，而不是税务规划。",
      vi: "Đó là giấy phép cư trú, không phải hộ chiếu. UAE không cấp quốc tịch theo diện đầu tư, nên không có lượng bất động sản nào biến thành quốc tịch Emirati, và thị thực chỉ tồn tại chừng nào bạn còn giữ bất động sản đủ điều kiện. Nó cũng không thay đổi tình trạng Singapore của bạn: Singapore trên thực tế cho phép cư trú kép, nhưng cư trú thuế Singapore của bạn phụ thuộc vào hoàn cảnh riêng chứ không phải việc giữ một thị thực nước ngoài. Golden Visa tự nó không khiến bạn thành người không cư trú tại Singapore, và cũng không tự nó khiến bạn thành cư trú thuế UAE — điều đó có tiêu chí riêng. Nếu bạn giữ thị thực thuần túy như một lựa chọn chứ không chuyển đi, hãy xem nó là tiện lợi đi lại và cư trú, không phải một kế hoạch thuế.",
      he: "זו אשרת תושבות ולא דרכון. האיחוד אינו מציע התאזרחות בתמורה להשקעה, ולכן שום היקף נכסים אינו הופך לאזרחות אמירתית, והאשרה נמשכת רק כל עוד אתם מחזיקים בנכס המזכה. היא גם אינה משנה את מעמדכם בסינגפור: סינגפור מתירה תושבות כפולה במובן המעשי, אך תושבות המס שלכם בסינגפור נקבעת לפי הנסיבות שלכם ולא לפי החזקת אשרה זרה. ויזת זהב כשלעצמה אינה הופכת אתכם לתושבי חוץ בסינגפור, וגם אינה הופכת אתכם לתושבי מס באיחוד — לכך יש מבחנים משלו. אם אתם מחזיקים באשרה כאופציה ולא עוברים בפועל, התייחסו אליה כאל נוחות נסיעה ומגורים ולא כאל תכנון מס."
    },
    documents: {
      en: "Singaporeans are asked for the ordinary pack: passport with adequate validity, passport photographs to UAE specification, the DLD title deed showing AED 2M or more in your name, a UAE medical fitness test and Emirates ID biometrics, both done in the UAE, and UAE medical insurance. Where documents are issued in Singapore — a marriage certificate to sponsor a spouse, birth certificates for children — expect them to need notarisation and attestation for UAE use, which is the step that most often adds time. Because Singapore's own documents are well recognised and there is no exchange-control paperwork to produce, Singaporean applications are typically among the more straightforward files.",
      fr: "On demande aux Singapouriens le dossier ordinaire : passeport suffisamment valide, photographies aux normes émiriennes, titre de propriété DLD faisant apparaître 2 M AED ou plus à votre nom, visite médicale d'aptitude aux Émirats et biométrie Emirates ID — l'une et l'autre effectuées sur place — ainsi qu'une assurance santé émirienne. Lorsque les documents sont émis à Singapour — acte de mariage pour parrainer un conjoint, actes de naissance des enfants — attendez-vous à devoir les faire notarier et légaliser pour usage aux Émirats, étape qui allonge le plus souvent les délais. Les documents singapouriens étant bien reconnus et aucune pièce de contrôle des changes n'étant à produire, les dossiers singapouriens comptent généralement parmi les plus simples.",
      ru: "У сингапурцев запрашивают стандартный пакет: паспорт с достаточным сроком действия, фотографии по требованиям ОАЭ, title deed от DLD на сумму от AED 2M на ваше имя, медицинскую проверку в ОАЭ и биометрию Emirates ID (обе процедуры — в ОАЭ), а также медицинскую страховку ОАЭ. Документы, выданные в Сингапуре — свидетельство о браке для спонсирования супруга, свидетельства о рождении детей, — как правило требуют нотариального удостоверения и легализации для ОАЭ, и именно этот шаг чаще всего добавляет время. Поскольку сингапурские документы хорошо признаются, а бумаг по валютному контролю предоставлять не нужно, заявления из Сингапура обычно одни из самых простых.",
      ar: "يُطلب من السنغافوريين الملف الاعتيادي: جواز سفر بصلاحية كافية، وصور فوتوغرافية وفق المواصفات الإماراتية، وسند ملكية من دائرة الأراضي يُظهر AED 2M أو أكثر باسمك، وفحص لياقة طبية إماراتي وبصمات الهوية الإماراتية — وكلاهما يتمّ داخل الإمارات — وتأمين صحي إماراتي. وحيثما صدرت المستندات في سنغافورة — عقد زواج لكفالة الزوج، أو شهادات ميلاد للأبناء — توقّع حاجتها إلى التوثيق والتصديق للاستخدام في الإمارات، وهي الخطوة التي تضيف وقتاً في الغالب. ولأن المستندات السنغافورية معترف بها جيداً ولا توجد أوراق رقابة صرف يجب تقديمها، تكون الطلبات السنغافورية عادةً من أيسر الملفات.",
      zh: "新加坡申请人需要提交常规材料：有效期充足的护照、符合阿联酋规格的照片、显示您名下 AED 2M 或以上的迪拜土地局产权证、在阿联酋完成的健康体检与阿联酋身份证生物信息采集，以及阿联酋医疗保险。凡在新加坡签发的文件——为配偶担保所需的结婚证、子女的出生证明——请预期需要经过公证与认证方可在阿联酋使用，这一步通常最耗时间。由于新加坡的文件认可度高，且无需提供外汇管制方面的材料，新加坡人的申请通常属于较为顺畅的一类。",
      vi: "Người Singapore được yêu cầu bộ hồ sơ thông thường: hộ chiếu còn đủ hiệu lực, ảnh theo quy cách UAE, sổ đỏ DLD thể hiện từ AED 2M trở lên đứng tên bạn, khám sức khỏe tại UAE và lấy sinh trắc học Emirates ID — cả hai đều thực hiện tại UAE — cùng bảo hiểm y tế UAE. Với giấy tờ cấp tại Singapore — giấy đăng ký kết hôn để bảo lãnh vợ/chồng, giấy khai sinh của con — hãy chuẩn bị việc phải công chứng và hợp pháp hóa để dùng tại UAE, đây là khâu thường làm kéo dài thời gian nhất. Vì giấy tờ Singapore được công nhận rộng rãi và không phải xuất trình hồ sơ kiểm soát ngoại hối, hồ sơ của người Singapore thường thuộc nhóm suôn sẻ hơn cả.",
      he: "מסינגפורים מבקשים את התיק הרגיל: דרכון בתוקף מספק, תצלומים לפי מפרט אמירתי, שטר בעלות מ-DLD המראה AED 2M ומעלה על שמכם, בדיקת כשירות רפואית באיחוד וביומטריה ל-Emirates ID — שתיהן מתבצעות באיחוד — וביטוח רפואי אמירתי. כאשר מסמכים הונפקו בסינגפור — תעודת נישואין לחסות בן/בת זוג, תעודות לידה לילדים — צפו שיידרשו אימות נוטריוני ואישור לשימוש באיחוד, וזה השלב שמוסיף זמן לרוב. מכיוון שמסמכים סינגפורים מוכרים היטב ואין ניירת פיקוח על מטבע חוץ להציג, בקשות סינגפוריות הן בדרך כלל מהתיקים הפשוטים יותר."
    },
    areas: ["Downtown Dubai", "Business Bay", "Dubai Marina", "DIFC", "Palm Jumeirah"],
  },
  {
    slug: "zimbabwean",
    citizenSlug: "zimbabwean-citizen",
    country: "Zimbabwe",
    demonym: "Zimbabwean",
    flag: "🇿🇼",
    metaTitle: {
      en: "UAE Golden Visa for Zimbabweans | Property Route 2026",
      fr: "Golden Visa des Émirats pour les Zimbabwéens | Voie immobilière 2026",
      ru: "Golden Visa ОАЭ для граждан Зимбабве | Через недвижимость 2026",
      ar: "الإقامة الذهبية الإماراتية للزيمبابويين | عبر العقار 2026",
      zh: "津巴布韦人的阿联酋黄金签证 | 房产路径 2026",
      vi: "Golden Visa UAE cho người Zimbabwe | Lộ trình bất động sản 2026",
      he: "ויזת זהב לאיחוד האמירויות לזימבבואים | מסלול הנכס 2026"
    },
    metaDesc: {
      en: "What the AED 2M UAE Golden Visa gives a Zimbabwean passport holder, the mobility it actually buys, the documents required, and the funding reality behind reaching the threshold.",
      fr: "Ce que le Golden Visa émirien à 2 M AED apporte à un passeport zimbabwéen, la mobilité qu'il procure réellement, les documents requis et la réalité du financement du seuil.",
      ru: "Что даёт Golden Visa ОАЭ от AED 2M владельцу зимбабвийского паспорта, какую мобильность она реально даёт, какие нужны документы и какова реальность финансирования порога.",
      ar: "ما الذي تمنحه الإقامة الذهبية الإماراتية بقيمة AED 2M لحامل جواز زيمبابوي، وما الحركية التي توفّرها فعلاً، والمستندات المطلوبة، وواقع تمويل بلوغ الحد.",
      zh: "AED 2M 的阿联酋黄金签证能给津巴布韦护照持有人什么、实际带来多少流动性、需要哪些文件，以及达到门槛背后的资金现实。",
      vi: "Golden Visa UAE mức AED 2M mang lại gì cho người giữ hộ chiếu Zimbabwe, khả năng dịch chuyển thực tế, giấy tờ cần thiết và thực tế tài chính để đạt ngưỡng.",
      he: "מה ויזת הזהב של האיחוד בסך AED 2M מעניקה לבעל דרכון זימבבואי, איזו ניידות היא באמת קונה, אילו מסמכים נדרשים, ומהי מציאות המימון להגעה לסף."
    },
    h1: {
      en: "The UAE Golden Visa for Zimbabweans",
      fr: "Le Golden Visa émirien pour les Zimbabwéens",
      ru: "Golden Visa ОАЭ для граждан Зимбабве",
      ar: "الإقامة الذهبية الإماراتية للزيمبابويين",
      zh: "面向津巴布韦人的阿联酋黄金签证",
      vi: "Golden Visa UAE cho người Zimbabwe",
      he: "ויזת הזהב של האיחוד לזימבבואים"
    },
    whatItIs: {
      en: "A property purchase of AED 2,000,000 or more qualifies the owner for a ten-year renewable UAE residence visa, on the same threshold that applies to every other nationality — there is no restriction and no separate tier for a Zimbabwean passport. The visa is self-sponsored rather than employer-tied, covers a spouse and children, and carries no minimum stay requirement. Off-plan qualifies where at least AED 2M has been paid to the developer, which matters here: a payment plan can reach the threshold in stages rather than demanding the full sum at once.",
      fr: "Un achat immobilier de 2 000 000 AED ou plus ouvre droit à un visa de résidence émirien de dix ans renouvelable, au même seuil que pour toute autre nationalité — aucune restriction ni palier distinct pour un passeport zimbabwéen. Le visa est auto-parrainé et non lié à un employeur, couvre conjoint et enfants, et n'impose aucune durée de séjour minimale. Un bien sur plan est éligible dès lors qu'au moins 2 M AED ont été versés au promoteur, ce qui compte ici : un échéancier permet d'atteindre le seuil par étapes plutôt que d'exiger la somme entière d'un coup.",
      ru: "Покупка недвижимости на AED 2 000 000 и более даёт право на десятилетнюю возобновляемую резидентскую визу ОАЭ по тому же порогу, что и для любой другой национальности, — ограничений и отдельной ступени для зимбабвийского паспорта нет. Виза самоспонсируемая, а не привязанная к работодателю, охватывает супруга и детей и не требует минимального срока пребывания. Строящийся объект подходит, если застройщику уплачено не менее AED 2M, и здесь это важно: рассрочка позволяет достичь порога поэтапно, а не требовать всю сумму сразу.",
      ar: "شراء عقار بقيمة AED 2,000,000 أو أكثر يؤهل المالك لتأشيرة إقامة إماراتية لعشر سنوات قابلة للتجديد، بالحد نفسه المطبّق على كل الجنسيات — فلا قيود ولا شريحة منفصلة لجواز السفر الزيمبابوي. والتأشيرة ذاتية الكفالة لا مرتبطة بصاحب عمل، وتشمل الزوج والأبناء، ولا تشترط حداً أدنى للإقامة. وتُقبل الوحدات على الخارطة متى دُفع للمطوّر ما لا يقل عن AED 2M، وهذا مهم هنا: إذ تتيح خطة السداد بلوغ الحد على مراحل بدل طلب المبلغ كاملاً دفعة واحدة.",
      zh: "购买价值 AED 2,000,000 或以上的房产，业主即符合十年可续期阿联酋居留签证的条件，其门槛与所有其他国籍相同——对津巴布韦护照没有任何限制，也没有单独的档次。该签证为自我担保而非绑定雇主，覆盖配偶与子女，且无最低居留天数要求。期房在已向开发商支付至少 AED 2M 时符合条件，这一点在此尤为重要：付款计划可以分阶段达到门槛，而不必一次性支付全款。",
      vi: "Một giao dịch mua bất động sản từ AED 2.000.000 trở lên giúp chủ sở hữu đủ điều kiện nhận thị thực cư trú UAE mười năm có thể gia hạn, với cùng ngưỡng áp dụng cho mọi quốc tịch — không có hạn chế và không có bậc riêng cho hộ chiếu Zimbabwe. Thị thực tự bảo lãnh chứ không gắn với chủ lao động, bao gồm vợ/chồng và con cái, và không yêu cầu thời gian lưu trú tối thiểu. Căn hình thành trong tương lai đủ điều kiện khi đã trả cho chủ đầu tư ít nhất AED 2M, điều này quan trọng ở đây: một kế hoạch thanh toán có thể đạt ngưỡng theo từng đợt thay vì đòi hỏi toàn bộ số tiền cùng lúc.",
      he: "רכישת נכס בסך AED 2,000,000 ומעלה מזכה את הבעלים באשרת תושבות אמירתית לעשר שנים הניתנת לחידוש, באותו סף שחל על כל לאום אחר — אין הגבלה ואין מדרגה נפרדת לדרכון זימבבואי. האשרה בחסות עצמית ולא קשורה למעסיק, כוללת בן/בת זוג וילדים, ואינה דורשת שהייה מינימלית. יחידה על הנייר כשירה כאשר שולמו ליזם לפחות AED 2M, וזה משנה כאן: תוכנית תשלומים יכולה להגיע לסף בשלבים במקום לדרוש את מלוא הסכום בבת אחת."
    },
    whatItIsNot: {
      en: "It is a residence permit, not a passport, and that distinction matters more for a Zimbabwean holder than for most. The UAE does not offer naturalisation by investment, so the visa never becomes citizenship, and it lapses if you stop holding the qualifying property. What it does buy is genuine: UAE residence, the ability to sponsor immediate family, a regional banking and schooling base, and travel that starts from Dubai rather than from a passport queue. What it does not do is confer visa-free access to third countries — your travel rights elsewhere still follow your Zimbabwean passport, and any claim otherwise should be treated as a warning sign about whoever is making it.",
      fr: "C'est un titre de séjour, pas un passeport, et cette distinction compte davantage pour un titulaire zimbabwéen que pour la plupart. Les Émirats n'offrent pas de naturalisation par investissement : le visa ne devient jamais une citoyenneté, et il tombe si vous cessez de détenir le bien éligible. Ce qu'il procure réellement est tangible : une résidence émirienne, la possibilité de parrainer la famille proche, une base bancaire et scolaire régionale, et des voyages qui partent de Dubaï plutôt que d'une file d'attente consulaire. Ce qu'il ne fait pas, c'est ouvrir un accès sans visa à des pays tiers — vos droits de circulation ailleurs restent attachés à votre passeport zimbabwéen, et toute affirmation contraire doit être vue comme un signal d'alarme sur son auteur.",
      ru: "Это вид на жительство, а не паспорт, и для владельца зимбабвийского паспорта это различие важнее, чем для большинства. ОАЭ не предоставляют натурализацию за инвестиции, поэтому виза никогда не станет гражданством и прекращается, если вы перестаёте владеть квалифицирующим объектом. То, что она действительно даёт, реально: резидентство ОАЭ, возможность спонсировать ближайших родственников, региональную базу для банков и школ и поездки, начинающиеся из Дубая, а не из визовой очереди. Чего она не даёт — безвизового доступа в третьи страны: ваши права на поездки по-прежнему следуют за зимбабвийским паспортом, и любое утверждение об обратном стоит воспринимать как тревожный сигнал о том, кто его делает.",
      ar: "إنها تصريح إقامة لا جواز سفر، وهذا التمييز أهمّ لحامل الجواز الزيمبابوي منه لمعظم غيره. فالإمارات لا تمنح التجنيس مقابل الاستثمار، ولذا لا تتحول التأشيرة إلى جنسية أبداً، وتسقط إن توقفت عن حيازة العقار المؤهِّل. أما ما تمنحه فعلاً فحقيقي: إقامة إماراتية، وإمكانية كفالة الأسرة المباشرة، وقاعدة إقليمية للخدمات المصرفية والتعليم، وسفر يبدأ من دبي لا من طابور تأشيرات. وما لا تفعله هو منح دخول بدون تأشيرة إلى دول ثالثة — فحقوق سفرك في أماكن أخرى تظل تابعة لجواز سفرك الزيمبابوي، وأي ادّعاء بخلاف ذلك ينبغي التعامل معه كإشارة تحذير بشأن قائله.",
      zh: "它是居留许可而非护照，这一区别对津巴布韦持照人比对多数人更为重要。阿联酋不提供投资入籍，因此该签证永远不会变成国籍，且一旦您不再持有符合条件的房产便会失效。它真正带来的东西是实实在在的：阿联酋居留身份、为直系亲属担保的能力、区域性的银行与教育基地，以及从迪拜出发而非从签证队伍出发的出行。它不会做的，是给予第三国免签待遇——您在其他国家的通行权利仍取决于津巴布韦护照，任何相反的说法都应被视为对说这话的人的警示信号。",
      vi: "Đó là giấy phép cư trú, không phải hộ chiếu, và sự phân biệt này quan trọng với người giữ hộ chiếu Zimbabwe hơn phần lớn trường hợp khác. UAE không cấp quốc tịch theo diện đầu tư, nên thị thực không bao giờ trở thành quốc tịch, và nó mất hiệu lực nếu bạn ngừng nắm giữ bất động sản đủ điều kiện. Điều nó thực sự mang lại là có thật: quyền cư trú UAE, khả năng bảo lãnh người thân trực hệ, một cơ sở ngân hàng và học hành trong khu vực, và những chuyến đi khởi hành từ Dubai thay vì từ hàng chờ xin thị thực. Điều nó không làm là trao quyền miễn thị thực vào nước thứ ba — quyền đi lại của bạn ở nơi khác vẫn theo hộ chiếu Zimbabwe, và bất kỳ tuyên bố ngược lại nào cũng nên được xem là dấu hiệu cảnh báo về người đưa ra nó.",
      he: "זו אשרת תושבות ולא דרכון, וההבחנה הזו חשובה למחזיק דרכון זימבבואי יותר מאשר לרובם. האיחוד אינו מציע התאזרחות בתמורה להשקעה, ולכן האשרה לעולם אינה הופכת לאזרחות, והיא פוקעת אם תפסיקו להחזיק בנכס המזכה. מה שהיא כן קונה הוא אמיתי: תושבות באיחוד, יכולת לחסות בני משפחה קרובים, בסיס אזורי לבנקאות וללימודים, ונסיעות שמתחילות מדובאי ולא מתור לוויזה. מה שהיא אינה עושה הוא להעניק כניסה ללא ויזה למדינות שלישיות — זכויות הנסיעה שלכם במקומות אחרים עדיין נגזרות מהדרכון הזימבבואי, וכל טענה אחרת ראוי להתייחס אליה כאל נורת אזהרה לגבי מי שמשמיע אותה."
    },
    documents: {
      en: "The visa pack itself is standard: passport with adequate validity, photographs to UAE specification, the DLD title deed showing AED 2M or more in your name, a UAE medical fitness test and Emirates ID biometrics, both done in the UAE, and UAE medical insurance. Documents issued in Zimbabwe — marriage and birth certificates used to sponsor family — will need notarisation and attestation for UAE use, and that is normally the slowest step, so start it early. The part that needs more planning than the paperwork is reaching the threshold at all: remitting capital out of Zimbabwe requires Reserve Bank approval under exchange control, most purchases are funded from income already held offshore, and UAE anti-money-laundering rules require documented source of funds before completion. Assemble that evidence at the start rather than when a payment is queried.",
      fr: "Le dossier de visa lui-même est standard : passeport suffisamment valide, photographies aux normes émiriennes, titre DLD faisant apparaître 2 M AED ou plus à votre nom, visite médicale d'aptitude aux Émirats et biométrie Emirates ID — l'une et l'autre sur place — ainsi qu'une assurance santé émirienne. Les documents émis au Zimbabwe — actes de mariage et de naissance servant à parrainer la famille — devront être notariés et légalisés pour usage aux Émirats, étape habituellement la plus lente : lancez-la tôt. Ce qui demande plus de préparation que la paperasse, c'est d'atteindre le seuil : sortir des capitaux du Zimbabwe requiert l'accord de la Banque de réserve au titre du contrôle des changes, la plupart des acquisitions sont financées par des revenus déjà détenus à l'étranger, et les règles émiriennes anti-blanchiment exigent une origine des fonds documentée avant la finalisation. Réunissez ces justificatifs dès le départ, et non quand un paiement est questionné.",
      ru: "Сам пакет для визы стандартный: паспорт с достаточным сроком действия, фотографии по требованиям ОАЭ, title deed от DLD на сумму от AED 2M на ваше имя, медицинская проверка в ОАЭ и биометрия Emirates ID (обе процедуры — в ОАЭ), а также медицинская страховка ОАЭ. Документы, выданные в Зимбабве, — свидетельства о браке и рождении для спонсирования семьи — потребуют нотариального удостоверения и легализации для ОАЭ, и это обычно самый медленный шаг, поэтому начинайте его заранее. Больше планирования, чем бумаги, требует само достижение порога: вывод капитала из Зимбабве требует одобрения Резервного банка в рамках валютного контроля, большинство покупок финансируется из дохода, уже находящегося за рубежом, а правила ОАЭ по противодействию отмыванию требуют подтверждения происхождения средств до завершения. Собирайте эти доказательства в начале, а не когда платёж поставят под вопрос.",
      ar: "ملف التأشيرة نفسه قياسي: جواز سفر بصلاحية كافية، وصور وفق المواصفات الإماراتية، وسند ملكية من دائرة الأراضي يُظهر AED 2M أو أكثر باسمك، وفحص لياقة طبية إماراتي وبصمات الهوية الإماراتية — وكلاهما داخل الإمارات — وتأمين صحي إماراتي. أما المستندات الصادرة في زيمبابوي — عقود الزواج وشهادات الميلاد المستخدمة لكفالة الأسرة — فستحتاج إلى توثيق وتصديق للاستخدام في الإمارات، وهي عادةً الخطوة الأبطأ، فابدأها مبكراً. والجزء الذي يحتاج تخطيطاً أكثر من الأوراق هو بلوغ الحد أصلاً: فتحويل رأس المال خارج زيمبابوي يتطلب موافقة المصرف المركزي بموجب رقابة الصرف، ومعظم المشتريات تُموَّل من دخل محتفظ به خارجياً أصلاً، وتشترط قواعد مكافحة غسل الأموال الإماراتية إثبات مصدر الأموال قبل الإتمام. فاجمع تلك الأدلة في البداية لا حين يُستفسَر عن دفعة.",
      zh: "签证材料本身是标准的：有效期充足的护照、符合阿联酋规格的照片、显示您名下 AED 2M 或以上的迪拜土地局产权证、在阿联酋完成的健康体检与阿联酋身份证生物信息采集，以及阿联酋医疗保险。在津巴布韦签发的文件——用于担保家属的结婚证与出生证明——需要经过公证与认证方可在阿联酋使用，这通常是最慢的一环，请尽早启动。比文书更需要规划的，是如何达到门槛本身：根据外汇管制，将资本汇出津巴布韦需要储备银行批准，多数购房资金来自本已存放在境外的收入，且阿联酋反洗钱规则要求在成交前提供资金来源证明。请在一开始就备齐这些证据，而不是等到某笔付款被质询之时。",
      vi: "Bộ hồ sơ thị thực bản thân nó là tiêu chuẩn: hộ chiếu còn đủ hiệu lực, ảnh theo quy cách UAE, sổ đỏ DLD thể hiện từ AED 2M trở lên đứng tên bạn, khám sức khỏe tại UAE và lấy sinh trắc học Emirates ID — cả hai đều tại UAE — cùng bảo hiểm y tế UAE. Giấy tờ cấp tại Zimbabwe — giấy kết hôn và khai sinh dùng để bảo lãnh gia đình — sẽ cần công chứng và hợp pháp hóa để dùng tại UAE, và đó thường là khâu chậm nhất, nên hãy bắt đầu sớm. Phần cần hoạch định nhiều hơn cả giấy tờ là làm sao đạt được ngưỡng: chuyển vốn ra khỏi Zimbabwe cần Ngân hàng Dự trữ phê duyệt theo kiểm soát ngoại hối, phần lớn giao dịch được tài trợ từ thu nhập đã có ở nước ngoài, và quy định phòng chống rửa tiền của UAE yêu cầu chứng minh nguồn tiền trước khi hoàn tất. Hãy tập hợp bằng chứng đó ngay từ đầu chứ không phải khi một khoản thanh toán bị chất vấn.",
      he: "תיק האשרה עצמו סטנדרטי: דרכון בתוקף מספק, תצלומים לפי מפרט אמירתי, שטר בעלות מ-DLD המראה AED 2M ומעלה על שמכם, בדיקת כשירות רפואית באיחוד וביומטריה ל-Emirates ID — שתיהן באיחוד — וביטוח רפואי אמירתי. מסמכים שהונפקו בזימבבואה — תעודות נישואין ולידה לחסות בני משפחה — יידרשו אימות נוטריוני ואישור לשימוש באיחוד, וזה בדרך כלל השלב האיטי ביותר, אז התחילו אותו מוקדם. החלק שדורש יותר תכנון מהניירת הוא עצם ההגעה לסף: הוצאת הון מזימבבואה מחייבת אישור הבנק המרכזי במסגרת הפיקוח על מטבע חוץ, רוב הרכישות ממומנות מהכנסה המוחזקת כבר בחו\"ל, וכללי איסור הלבנת ההון באיחוד דורשים הוכחת מקור כספים לפני ההשלמה. אספו את הראיות האלה בהתחלה ולא כשתשלום כבר מתויג לבירור."
    },
    areas: ["Jumeirah Village Circle", "Business Bay", "Dubai Marina", "Downtown Dubai", "Dubai Hills Estate"],
  },
];

export function findGoldenVisaNationality(slug: string): GoldenVisaNationality | undefined {
  return GOLDEN_VISA_NATIONALITIES.find((g) => g.slug === slug);
}
