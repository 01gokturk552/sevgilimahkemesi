# Sevgili Mahkemesi

Mobil öncelikli, Türkçe ve koyu tema odaklı bir ilişki mahkemesi MVP oyunudur.

## Özellikler

- İki oyuncu adı girişi
- Dava zorluk seçimi
- Rastgele ilişki senaryosu
- Savcı suçlaması ve sanık savunması
- Çapraz sorgu ve hâkim kararı
- Kusur yüzdesi
- Dava geçmişi
- Çift modu / birbirini savunma modu
- İlişki skoru ekranı

## Çalıştırma

Sabit bir web sunucusu ile açabilirsiniz:

```bash
cd "c:\Users\egese\OneDrive\Masaüstü\İlişki Mahkemesi"
python -m http.server 8000
```

Sonra tarayıcıda:

http://localhost:8000

## Mobil uygulama

Android ve iOS uygulama kaynakları [`mobile/`](mobile/README.md) klasöründedir. Expo Go ile geliştirme için `cd mobile` ardından `npm install` ve `npx expo start` çalıştırın. Test APK'sı ve mağaza derlemeleri için EAS Build komutları mobil README'de açıklanmıştır.

## Not

Bu, tasarım ve oyun akışı odaklı çalışan bir MVP'dir. Veriler tarayıcıda localStorage içinde saklanır.
