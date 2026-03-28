export default {
  // Common
  common: {
    save: "Kaydet",
    cancel: "Iptal",
    delete: "Sil",
    edit: "Duzenle",
    close: "Kapat",
    loading: "Yukleniyor...",
    error: "Hata",
    success: "Basarili",
    confirm: "Onayla",
    back: "Geri",
    next: "Ileri",
    done: "Tamam",
    or: "veya",
  },

  // Auth
  auth: {
    login: "Giris Yap",
    register: "Kayit Ol",
    logout: "Cikis Yap",
    email: "E-posta",
    password: "Sifre",
    name: "Isim",
    emailPlaceholder: "ornek@email.com",
    passwordPlaceholder: "En az 6 karakter",
    namePlaceholder: "Adiniz",
    loginButton: "Giris Yap",
    registerButton: "Hesap Olustur",
    loggingIn: "Giris yapiliyor...",
    registering: "Olusturuluyor...",
    noAccount: "Hesabin yok mu?",
    hasAccount: "Zaten hesabin var mi?",
    fillAll: "Lutfen tum alanlari doldurun.",
    loginError: "Giris Hatasi",
    registerError: "Kayit Hatasi",
    logoutConfirm: "Hesabindan cikmak istedigin emin misin?",
    skinJourney: "Cilt bakim yolculuguna basla",
    invalidEmail: "Gecerli bir e-posta adresi girin.",
    weakPassword: "Sifre en az 6 karakter olmali.",
  },

  // Skin Types
  skinType: {
    title: "Cilt Tipin",
    kuru: "Kuru",
    yagli: "Yagli",
    karma: "Karma",
    hassas: "Hassas",
    normal: "Normal",
    unknown: "Belirsiz",
  },

  // Home
  home: {
    greeting: "Merhaba",
    subtitle: "Cildine bakmaya hazir misin?",
    dailyRoutine: "Gunluk Rutin",
    eveningWaiting: "Aksam rutinin bekliyor",
    morningStart: "Sabah rutinine basla",
    allDone: "Bugunun rutini tamam!",
    observing: "Gozlem Altinda",
    productsObserving: "{{count}} urun gozlem surecinde",
    quickActions: "Hizli Islemler",
    addProduct: "Urun Ekle",
    quickRoutine: "Hizli Rutin",
    tipTitle: "Gunun Ipucu",
    tipText:
      "Yeni bir urunu test ederken, bir seferde sadece bir urun ekle. Boylece cildinle ilgili geri bildirimleri dogru urunle eslestirmen kolaylasir.",
  },

  // Routine
  routine: {
    title: "Gunluk Rutin",
    morning: "Sabah Rutini",
    evening: "Aksam Rutini",
    stepsCompleted: "{{completed}}/{{total}} adim tamamlandi",
    quickRoutine: "Hizli Rutin (Sadece Temizlik + Nem)",
    step: "Adim {{number}}",
    noRoutine: "Henuz rutin eklenmemis.",
    addRoutineHint: "Urunlerim sayfasindan urun ekleyerek rutinini olustur.",
    completedToday: "Bugunun rutini tamamlandi!",
    routineReset: "Yarin yeni bir gun!",
  },

  // Products
  products: {
    title: "Urunlerim",
    addProduct: "Yeni Urun Ekle",
    productName: "Urun Adi",
    productPlaceholder: "ornegin: CeraVe Nemlendirici",
    category: "Kategori",
    addButton: "Urunu Ekle & Gozleme Basla",
    observationInfo: "7 Gunluk Gozlem",
    observationDesc:
      "Yeni eklenen urunler otomatik olarak 7 gunluk gozlem surecine alinir. Her gun cildindeki degisiklikleri kaydet.",
    dayProgress: "Gun {{current}}/{{total}}",
    enterNote: "Bugunku notu gir",
    noProducts: "Bu kategoride urun yok.",
    searchPlaceholder: "Urun ara...",
    fillRequired: "Urun adi ve kategori secin.",
    deleteConfirm: "Bu urunu silmek istedigin emin misin?",
    deleteProduct: "Urunu Sil",
    markActive: "Aktif Olarak Isaretle",
    markDropped: "Birakildi Olarak Isaretle",
    // Filters
    all: "Tumu",
    observing: "Gozlemde",
    active: "Aktif",
    dropped: "Birakildi",
    // Categories
    temizleyici: "Temizleyici",
    tonik: "Tonik",
    serum: "Serum",
    nemlendirici: "Nemlendirici",
    gunes_kremi: "Gunes Kremi",
    diger: "Diger",
  },

  // Observation
  observation: {
    title: "Gunluk Gozlem",
    howIsYourSkin: "Bugün cildin nasıl?",
    irritation: "Tahris / Kizariklik",
    breakout: "Sivilce / Lekelenme",
    hydration: "Nem Seviyesi",
    note: "Not (opsiyonel)",
    notePlaceholder: "Bugün fark ettigin bir sey var mi?",
    submit: "Gozlemi Kaydet",
    day: "Gun {{number}}",
    scores: {
      1: "Cok iyi",
      2: "Iyi",
      3: "Normal",
      4: "Kotu",
      5: "Cok kotu",
    },
    hydrationScores: {
      1: "Cok kuru",
      2: "Kuru",
      3: "Normal",
      4: "Nemli",
      5: "Cok nemli",
    },
    summary: "Gozlem Ozeti",
    goodResult: "Bu urun cildine iyi geliyor!",
    badResult: "Bu urun tahrise neden olabilir. Dikkatli ol.",
    neutralResult: "Belirgin bir etki gozlenmedi.",
  },

  // Profile
  profile: {
    title: "Profil",
    editProfile: "Profili Duzenle",
    routineHours: "Rutin Saatleri",
    notifications: "Bildirimler",
    helpSupport: "Yardim & Destek",
    language: "Dil",
    skinTypeLabel: "Cilt Tipi: {{type}}",
    editName: "Isim",
    editSkinType: "Cilt Tipi",
    morningTime: "Sabah Rutini Saati",
    eveningTime: "Aksam Rutini Saati",
    saved: "Degisiklikler kaydedildi.",
    user: "Kullanici",
    notificationsOn: "Acik",
    notificationsOff: "Kapali",
    notificationsDisabled: "Bildirimler kapatildi.",
    notificationsEnabled: "Sabah 08:00 ve aksam 21:00 hatirlatici ayarlandi.",
    notificationsPermission: "Bildirim izni gerekli. Ayarlardan izin verin.",
    langTr: "Turkce",
    langEn: "English",
  },

  // Routine actions
  routineAction: {
    addToRoutine: "Rutine Ekle",
    whichRoutine: "Hangi rutine eklensin?",
    amDesc: "Temizlik, serum, nemlendirici, SPF",
    pmDesc: "Cift temizlik, serum, gece kremi",
  },

  // Product detail
  productDetail: {
    notFound: "Urun bulunamadi.",
    averageScores: "Ortalama Skorlar",
    days: "gun",
    dailyProgress: "Gunluk Degisim",
    noObservations: "Henuz gozlem verisi yok.",
    irritationLabel: "Tahris",
    breakoutLabel: "Sivilce",
    hydrationLabel: "Nem",
  },

  // Days
  days: {
    mon: "Pzt",
    tue: "Sal",
    wed: "Car",
    thu: "Per",
    fri: "Cum",
    sat: "Cmt",
    sun: "Paz",
  },

  // Onboarding
  onboarding: {
    welcomeTitle: "Hosgeldin!",
    welcomeDesc: "Cilt bakim yolculuguna baslamak icin once urunlerini ekle, sonra rutinini olustur.",
    step1: "1. Urunlerini ekle",
    step1Desc: "Kullandigin cilt bakim urunlerini sisteme ekle.",
    step2: "2. Rutinini olustur",
    step2Desc: "Sabah ve aksam rutinine urunlerini sirala.",
    step3: "3. Takip et",
    step3Desc: "Gunluk rutinini tamamla, yeni urunleri gozlemle.",
    getStarted: "Urun Eklemeye Basla",
  },

  // Brand
  brand: {
    name: "Lumina",
    motto: "Cildinle tanas, rutinini sadelestir.",
  },

  // Tabs
  tabs: {
    home: "Ana Sayfa",
    routine: "Rutin",
    products: "Urunlerim",
    profile: "Profil",
  },
};
