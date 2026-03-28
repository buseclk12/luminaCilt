# Lumina ✨

**Cildinle tanas, rutinini sadelestir.**

Lumina, cilt bakim rutinlerini takip eden ve yeni urunlerin cildine etkisini izleyen minimalist bir mobil uygulamadir.

## Ozellikler

- **Urun Gozlem Takibi** — Yeni urunu ekle, 7 gun boyunca cildindeki degisiklikleri kaydet
- **Gunluk Rutin Checklist** — Sabah & aksam rutinini adim adim takip et
- **Hizli Rutin** — Vaktim yok diyenler icin tek tikla temizlik + nemlendirme
- **Gozlem Skorlari** — Tahris, sivilce ve nem seviyesini emoji bazli puanla
- **Coklu Dil** — Turkce & Ingilizce destek
- **Profil Yonetimi** — Cilt tipi secimi, isim duzenleme

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React Native + Expo (Managed) |
| Styling | NativeWind (Tailwind CSS) |
| Navigation | Expo Router |
| State | Zustand |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| i18n | i18next + expo-localization |

## Kurulum

```bash
# Bagimliliklari kur
npm install

# .env dosyasi olustur
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY degerlerini gir

# Calistir
npx expo start
```

## Proje Yapisi

```
lumina/
├── app/
│   ├── (auth)/          # Login & Register ekranlari
│   ├── (tabs)/          # Ana sayfa, Rutin, Urunlerim, Profil
│   ├── _layout.tsx      # Root layout
│   └── index.tsx        # Auth redirect
├── src/
│   ├── components/      # ObservationModal vb.
│   ├── i18n/            # TR & EN ceviriler
│   ├── lib/             # Supabase client & API fonksiyonlari
│   ├── stores/          # Zustand auth store
│   └── types/           # TypeScript tipleri
└── docs/
    └── brainstorms/     # Tasarim & planlama dokumanlari
```

## Lisans

MIT
