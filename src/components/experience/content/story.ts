export const expectedMeshes = [
  "TopShell", "UpperFilo1", "UpperFilo2", "UpperFilo3", "UpperFilo4", "UpperFilo5",
  "Pistachio", "LowerFilo1", "LowerFilo2", "LowerFilo3", "LowerFilo4", "LowerFilo5", "BaseShell",
] as const;
export type MeshName = typeof expectedMeshes[number];
export type StoryAlign = "right" | "left" | "center";
export type StoryMoment = { id: string; start: number; peak: number; end: number; align: StoryAlign; chapter: string; era?: string; title: string; body?: string };
export const storyMoments: StoryMoment[] = [
  { id: "before", start: .035, peak: .065, end: .098, align: "right", chapter: "البداية", title: "قبل أن تصبح حبةً على المائدة…", body: "كانت حكايةً تعبر الزمن." },
  { id: "origins", start: .078, peak: .108, end: .14, align: "left", chapter: "قبل الاسم", era: "جذور بعيدة", title: "فكرة أقدم من شكلها الحديث", body: "العجين الرقيق والمكسرات والحلاوة تنقّلت بين مطابخ وثقافات كثيرة." },
  { id: "debate", start: .118, peak: .147, end: .177, align: "right", chapter: "روايات متعددة", title: "لا ترويها بداية واحدة", body: "يختلف المؤرخون في أصلها الدقيق؛ أما الحرفة فتكشف أثر طرقٍ كثيرة التقت معًا." },
  { id: "layers-time", start: .155, peak: .184, end: .214, align: "left", chapter: "طبقات عبر الزمن", era: "عجين · دهن · حلوى", title: "تقنيات تتراكم مثل الطبقات", body: "رقائق تُمدّ، ودهون تفصل بينها، ومكسرات ومحليات تمنح البناء مذاقه." },
  { id: "ottoman-a", start: .194, peak: .224, end: .254, align: "right", chapter: "المطبخ العثماني", era: "حرفة مصقولة", title: "هنا اقتربت من صورتها المعروفة", body: "في المطابخ العثمانية تطورت البقلاوة إلى بناء أكثر دقةً وانتظامًا." },
  { id: "ottoman-b", start: .232, peak: .262, end: .292, align: "left", chapter: "مطابخ القصور", title: "الرقة أصبحت مقياسًا للمهارة", body: "صنّاع محترفون صقلوا فرد العجين، وترتيب الطبقات، وضبط الخَبز والقطر." },
  { id: "cities", start: .272, peak: .3, end: .329, align: "right", chapter: "من القصور إلى المدن", title: "خرجت الحرفة إلى موائد أوسع", body: "تحركت الوصفات مع الحرفيين والعائلات، وتبدلت بتبدل المدن والذائقة." },
  { id: "regions", start: .309, peak: .337, end: .366, align: "left", chapter: "الأناضول وبلاد الشام والمنطقة", title: "لكل مكان طريقته", body: "فستق أو جوز، قطر أخف أو أغنى، ورقائق وأشكال تتبع تقاليد كل مطبخ." },
  { id: "patience", start: .346, peak: .374, end: .403, align: "right", chapter: "حين أصبحت الرقة حرفة", title: "السر ليس في مكوّن واحد", body: "بل في الصبر بين طبقة وأخرى، وفي يد تعرف متى ترقّ ومتى تتوقف." },
  { id: "filo", start: .383, peak: .407, end: .432, align: "left", chapter: "طبقة فوق طبقة", title: "الرقائق لا تتصرف كعجين سميك", body: "تفصلها مساحات دقيقة؛ وعند الخَبز تتحول تلك المسافات إلى هشاشة مسموعة." },
  { id: "heat", start: .414, peak: .435, end: .456, align: "right", chapter: "السمن والحرارة", title: "الحرارة تثبّت البناء", body: "يمر السمن بين الرقائق، ثم تمنحها النار لونها الذهبي وحدودها الهشة." },
  { id: "pistachio", start: .44, peak: .458, end: .477, align: "left", chapter: "قلب الفستق", title: "في الوسط يتغير الإيقاع", body: "قوام كثيف ونكهة خضراء هادئة بين طبقات شديدة الرقة." },
  { id: "syrup", start: .463, peak: .479, end: .493, align: "right", chapter: "القطر", title: "حلاوة بين القرمشة والرطوبة", body: "لا يغمر الرقائق؛ بل يصل ما بين سطح مخبوز وقلب غني." },
  { id: "return", start: .482, peak: .495, end: .51, align: "center", chapter: "ومن الحكاية… إلى ماسة", title: "قرون من الحرفة تنتهي هنا", body: "في حبة واحدة. لكن ماذا يوجد داخلها؟" },
];
export const anatomyLabels: Array<{ key: MeshName; title: string; body: string }> = [
  { key: "TopShell", title: "القشرة العلوية", body: "أول تماسّ مقرمش؛ سطحٌ تحمّر ليحمي الرقائق الأدق تحته." },
  { key: "UpperFilo1", title: "الرقيقة العلوية الأولى", body: "تسند القشرة من الداخل وتبدأ الانتقال من السطح الصلب إلى البناء الهش." },
  { key: "UpperFilo2", title: "الرقيقة العلوية الثانية", body: "ورقة مستقلة؛ لأن جمع الرقائق في كتلة واحدة يفقدها خفتها." },
  { key: "UpperFilo3", title: "الرقيقة العلوية الثالثة", body: "تفصلها عن جارتها فسحة دقيقة يصنع فيها البخار هواءً وقرمشة." },
  { key: "UpperFilo4", title: "الرقيقة العلوية الرابعة", body: "تواصل توزيع الضغط وتحفظ انتظام الطبقات فوق القلب." },
  { key: "UpperFilo5", title: "الرقيقة العلوية الخامسة", body: "أقرب الرقائق العليا إلى الحشوة؛ حدّ رقيق بين الهشاشة والفستق." },
  { key: "Pistachio", title: "قلب الفستق", body: "الحشوة المركزية: قوام غني يقابل رقة الفيلو ويربط النصفين العلوي والسفلي." },
  { key: "LowerFilo1", title: "الرقيقة السفلية الأولى", body: "تستقبل القلب من أسفل وتبدأ تحويل وزنه إلى طبقات متتابعة." },
  { key: "LowerFilo2", title: "الرقيقة السفلية الثانية", body: "تفصل الرطوبة عن القاعدة وتبقي القوام متعدد المستويات." },
  { key: "LowerFilo3", title: "الرقيقة السفلية الثالثة", body: "طبقة وسطية في الهيكل السفلي توزع الحشوة وتحفظ التوازن." },
  { key: "LowerFilo4", title: "الرقيقة السفلية الرابعة", body: "تقترب من القاعدة وتزيد مقاومة البناء من دون أن تفقد هشاشتها." },
  { key: "LowerFilo5", title: "الرقيقة السفلية الخامسة", body: "آخر ورقة دقيقة قبل القاعدة؛ تمهّد للجزء الأكثر ثباتًا." },
  { key: "BaseShell", title: "القاعدة المخبوزة", body: "تحمل الحشوة والرقائق جميعًا، وتمنح اللقمة نهايتها المقرمشة." },
];
export const inspectionStart = .61;
export const inspectionEnd = .855;
export function getInspectionIndex(progress: number) { if (progress < inspectionStart || progress > inspectionEnd) return -1; return Math.min(12, Math.floor(((progress - inspectionStart) / (inspectionEnd - inspectionStart)) * 13)); }
