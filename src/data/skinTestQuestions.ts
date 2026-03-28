export interface SkinTestQuestion {
  id: number;
  text_tr: string;
  text_en: string;
  options: {
    label_tr: string;
    label_en: string;
    /** Score mapping: kuru, normal, karma, yagli, hassas */
    scores: { kuru: number; normal: number; karma: number; yagli: number; hassas: number };
  }[];
}

export const SKIN_TEST_QUESTIONS: SkinTestQuestion[] = [
  {
    id: 1,
    text_tr: "Yuzunuzu yikadiktan 2 saat sonra (hicbir urun surmeden) cildiniz nasil hissediyor?",
    text_en: "How does your skin feel 2 hours after washing your face (without applying any product)?",
    options: [
      {
        label_tr: "Gergin ve pul pul dokulmeye meyilli",
        label_en: "Tight and prone to flaking",
        scores: { kuru: 3, normal: 0, karma: 0, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Rahat, ne yagli ne kuru",
        label_en: "Comfortable, neither oily nor dry",
        scores: { kuru: 0, normal: 3, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Sadece T bolgesi (alin, burun, cene) parliyor",
        label_en: "Only the T-zone (forehead, nose, chin) is shiny",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Her yer parliyor ve yagli hissediliyor",
        label_en: "Everything is shiny and feels oily",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 0 },
      },
    ],
  },
  {
    id: 2,
    text_tr: "Gun ortasinda aynaya baktiginizda gozeneklerinizin durumu nedir?",
    text_en: "What do your pores look like when you look in the mirror at midday?",
    options: [
      {
        label_tr: "Neredeyse hic gorunmuyorlar",
        label_en: "Almost invisible",
        scores: { kuru: 3, normal: 1, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Sadece burun cevresinde hafif belli",
        label_en: "Slightly visible only around the nose",
        scores: { kuru: 0, normal: 3, karma: 1, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "T bolgesinde oldukca belirgin",
        label_en: "Quite visible in the T-zone",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Yuzumun her yerinde genis ve acik gozenekler var",
        label_en: "Large and open pores all over my face",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 0 },
      },
    ],
  },
  {
    id: 3,
    text_tr: "Cildinizde ne siklikla sivilce veya siyah nokta sorunu yasiyorsunuz?",
    text_en: "How often do you experience acne or blackhead issues?",
    options: [
      {
        label_tr: "Nadiren veya hic",
        label_en: "Rarely or never",
        scores: { kuru: 2, normal: 2, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Sadece regl donemi veya stresli zamanlarda",
        label_en: "Only during menstruation or stressful times",
        scores: { kuru: 0, normal: 2, karma: 1, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Ayda en az bir kez, genellikle T bolgesinde",
        label_en: "At least once a month, usually in the T-zone",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Surekli ve yuzun geneline yayilan bir sorun",
        label_en: "Constant and spread across the entire face",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 1 },
      },
    ],
  },
  {
    id: 4,
    text_tr: "Yeni bir cilt bakim urunu denediginizde cildiniz nasil tepki verir?",
    text_en: "How does your skin react when you try a new skincare product?",
    options: [
      {
        label_tr: "Genelde sorunsuz kabul eder",
        label_en: "Usually accepts it without problems",
        scores: { kuru: 0, normal: 3, karma: 1, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Bazen hafif bir karincilanma olur ama gecer",
        label_en: "Sometimes there's slight tingling but it passes",
        scores: { kuru: 1, normal: 1, karma: 1, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Siklikla kizarir, kasinir veya yanma hissi olur",
        label_en: "Often gets red, itchy, or burning sensation",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 0, hassas: 3 },
      },
      {
        label_tr: "Hemen hemen her yeni urun cildimi irite eder",
        label_en: "Almost every new product irritates my skin",
        scores: { kuru: 1, normal: 0, karma: 0, yagli: 0, hassas: 4 },
      },
    ],
  },
  {
    id: 5,
    text_tr: "Gunese ciktiginizda cildinizde ne olur?",
    text_en: "What happens to your skin when you go out in the sun?",
    options: [
      {
        label_tr: "Hemen kizaririm, neredeyse hic bronzlasmam",
        label_en: "I immediately turn red, almost never tan",
        scores: { kuru: 1, normal: 0, karma: 0, yagli: 0, hassas: 3 },
      },
      {
        label_tr: "Once kizaririm, sonra hafif bronzlasirim",
        label_en: "I first turn red, then tan slightly",
        scores: { kuru: 0, normal: 2, karma: 1, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Kolayca bronzlasirim, nadiren yanarim",
        label_en: "I tan easily, rarely burn",
        scores: { kuru: 0, normal: 1, karma: 1, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Hic yanmadan cok hizli kararirim",
        label_en: "I darken very quickly without burning",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 2, hassas: 0 },
      },
    ],
  },
  {
    id: 6,
    text_tr: "Cildinizde sivilce ciktiktan sonra izi ne kadar sure kaliyor?",
    text_en: "How long do acne marks last on your skin?",
    options: [
      {
        label_tr: "Cok hizli iyilesir, iz kalmaz",
        label_en: "Heals very quickly, no marks",
        scores: { kuru: 1, normal: 3, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Birkac hafta icinde gecer",
        label_en: "Fades within a few weeks",
        scores: { kuru: 0, normal: 1, karma: 2, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Koyu kahverengi veya kirmizi lekeler aylarca kalir",
        label_en: "Dark brown or red marks last for months",
        scores: { kuru: 0, normal: 0, karma: 1, yagli: 1, hassas: 2 },
      },
      {
        label_tr: "En ufak bir sivilce bile kalici leke yapmaya meyillidir",
        label_en: "Even the smallest pimple tends to leave permanent marks",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 0, hassas: 3 },
      },
    ],
  },
  {
    id: 7,
    text_tr: 'Gun icinde cildinizde "parlama" ne zaman basliyor?',
    text_en: 'When does "shine" start appearing on your skin during the day?',
    options: [
      {
        label_tr: "Hic parlama olmaz, hep mat hatta cansizdir",
        label_en: "No shine at all, always matte and even dull",
        scores: { kuru: 3, normal: 0, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Aksama dogru hafif bir parlama olur",
        label_en: "Slight shine appears towards the evening",
        scores: { kuru: 0, normal: 3, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Oglen saatlerinde T bolgem yaglanir",
        label_en: "T-zone gets oily around noon",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Sabah rutininden hemen 1-2 saat sonra cildim yaglanir",
        label_en: "Skin gets oily just 1-2 hours after morning routine",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 0 },
      },
    ],
  },
  {
    id: 8,
    text_tr: "Mevsim gecislerinde (ornegin kisa girerken) cildiniz nasil degisir?",
    text_en: "How does your skin change during seasonal transitions (e.g., entering winter)?",
    options: [
      {
        label_tr: "Asiri kurur, kasinir ve catlar",
        label_en: "Extremely dry, itchy, and cracked",
        scores: { kuru: 3, normal: 0, karma: 0, yagli: 0, hassas: 2 },
      },
      {
        label_tr: "Biraz daha nemsiz hissederim, rutinimi agirlaistiririm",
        label_en: "Feels a bit less hydrated, I make my routine heavier",
        scores: { kuru: 1, normal: 3, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Sadece yanaklarim kurur, T bolgem ayni kalir",
        label_en: "Only my cheeks get dry, T-zone stays the same",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Pek bir degisiklik hissetmem, hep yaglidir",
        label_en: "I don't feel much change, it's always oily",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 0 },
      },
    ],
  },
  {
    id: 9,
    text_tr: "Cildinizde kizariklik (kilcal damar belirginligi) ne kadar yaygin?",
    text_en: "How common is redness (visible capillaries) on your skin?",
    options: [
      {
        label_tr: "Hic yok",
        label_en: "None at all",
        scores: { kuru: 0, normal: 2, karma: 1, yagli: 1, hassas: 0 },
      },
      {
        label_tr: "Sadece burun kenarlarinda cok hafif",
        label_en: "Very slightly, only around the nose",
        scores: { kuru: 1, normal: 1, karma: 0, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Bazen yanaklarimda belirginlesiyor",
        label_en: "Sometimes becomes visible on my cheeks",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 0, hassas: 3 },
      },
      {
        label_tr: "Yuzum genel olarak hep kirmizimsi ve hassas gorunuyor",
        label_en: "My face generally looks reddish and sensitive",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 0, hassas: 4 },
      },
    ],
  },
  {
    id: 10,
    text_tr: "Cildinize dokundugunuzda dokusu nasil geliyor?",
    text_en: "How does your skin feel when you touch it?",
    options: [
      {
        label_tr: "Puruzlu ve nemsiz",
        label_en: "Rough and dehydrated",
        scores: { kuru: 3, normal: 0, karma: 0, yagli: 0, hassas: 1 },
      },
      {
        label_tr: "Yumusak ve puruzsuz",
        label_en: "Soft and smooth",
        scores: { kuru: 0, normal: 3, karma: 0, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Alin bolgem yagli, yanaklarim yumusak",
        label_en: "Forehead is oily, cheeks are soft",
        scores: { kuru: 0, normal: 0, karma: 3, yagli: 0, hassas: 0 },
      },
      {
        label_tr: "Kaygan ve kalin bir tabaka varmis gibi",
        label_en: "Slippery, as if there's a thick layer",
        scores: { kuru: 0, normal: 0, karma: 0, yagli: 3, hassas: 0 },
      },
    ],
  },
];

export type SkinTestResult = "kuru" | "normal" | "karma" | "yagli" | "hassas";

export function calculateSkinType(
  answers: number[] // index of selected option per question
): { skinType: SkinTestResult; scores: Record<string, number> } {
  const totals = { kuru: 0, normal: 0, karma: 0, yagli: 0, hassas: 0 };

  SKIN_TEST_QUESTIONS.forEach((q, i) => {
    const optionIndex = answers[i];
    if (optionIndex === undefined) return;
    const option = q.options[optionIndex];
    totals.kuru += option.scores.kuru;
    totals.normal += option.scores.normal;
    totals.karma += option.scores.karma;
    totals.yagli += option.scores.yagli;
    totals.hassas += option.scores.hassas;
  });

  // If hassas score is very high AND another type also scores high,
  // combine them: e.g. "hassas" takes priority as a modifier
  const entries = Object.entries(totals) as [SkinTestResult, number][];
  entries.sort((a, b) => b[1] - a[1]);

  return { skinType: entries[0][0], scores: totals };
}
