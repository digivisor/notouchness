# NFC Kartvizit Sistemi - Test Rehberi

## Sistem Nasıl Çalışır?

1. **Fiziksel NFC Kart** → Her kartta benzersiz hash ID var (örn: `dwferwqferver`)
2. **QR/NFC Okuma** → Kullanıcı kartı okutunca `notouchness.com/dwferwqferver` açılır
3. **İlk Kullanım** → Kart kayıtlı değilse kayıt sayfasına yönlendirilir
4. **Profil Oluşturma** → Kullanıcı mail/şifre ile kayıt olur, profil bilgilerini girer
5. **Paylaşım** → Profil tamamlandıktan sonra `notouchness.com/kullaniciadi` üzerinden erişilebilir
6. **Düzenleme** → Kart sahibi istediği zaman giriş yapıp profilini güncelleyebilir

---

## Test Senaryoları

### 🟢 Senaryo 1: YENİ KART AKTİVASYONU

**Demo Kart:** `abc123xyz` (Henüz kayıtlı değil)

**Adımlar:**
1. Tarayıcıda şu URL'yi aç: `http://localhost:3000/abc123xyz`
2. Otomatik olarak kayıt sayfasına yönlendirileceksin
3. Kayıt formunu doldur:
   - Ad: `Test`
   - Soyad: `Kullanıcı`
   - Email: `test@example.com`
   - Şifre: `test123`
   - Şifre Tekrar: `test123`
   - Koşulları kabul et ✓
4. "Kartı Aktif Et" butonuna tıkla
5. Profil düzenleme sayfasına yönlendirileceksin
6. Profil bilgilerini doldur:
   - **Kullanıcı Adı:** `testuserr` (küçük harf, rakam, benzersiz olmalı)
   - Ad Soyad: `Test Kullanıcı`
   - Ünvan: `QA Tester`
   - Şirket: `Digivisor`
   - Hakkında: `Test için oluşturulmuş profil`
   - Telefon: `+90 555 555 55 55`
   - Instagram: `testuser`
   - LinkedIn: `testuser`
7. Tema seç (Koyu, Açık, Gradient, Minimal)
8. Ana renk seç (renk seçici ile)
9. "Profili Kaydet" butonuna tıkla
10. Otomatik olarak `http://localhost:3000/testuserr` adresine yönlendirileceksin
11. Profilini görüntüle!

**Beklenen Sonuç:** ✅
- Profil kartı seçilen tema ile görüntülenir
- Sosyal medya butonları çalışır
- İletişim bilgileri tıklanabilir
- "Düzenle" butonu görünür (çünkü sen profil sahibisin)
- "Paylaş" butonu çalışır

---

### 🔵 Senaryo 2: MEVCUT KART GİRİŞİ VE DÜZENLEME

**Demo Kart:** `dwferwqferver` (Zaten kayıtlı, kullanıcı adı: `fazilcanakbas`)

**Adımlar:**
1. Önce profili görüntüle: `http://localhost:3000/fazilcanakbas`
2. Profilini gör (ama henüz düzenleyemezsin)
3. Giriş sayfasına git: `http://localhost:3000/card/login`
4. Demo hesap bilgilerini kullan:
   - Email: `fazilcanakbas5@gmail.com`
   - Şifre: `demo123`
5. "Giriş Yap" butonuna tıkla
6. Profil düzenleme sayfasına yönlendirileceksin
7. İstediğin alanları değiştir:
   - Bio güncelle
   - Yeni sosyal medya hesapları ekle
   - Tema değiştir
   - Renk değiştir
8. "Profili Kaydet" butonuna tıkla
9. Güncel profili görüntüle

**Beklenen Sonuç:** ✅
- Giriş başarılı
- Tüm mevcut bilgiler formda dolu gelir
- Değişiklikler kaydedilir
- Profil sayfasında güncellemeler görünür

---

### 🟡 Senaryo 3: HASH URL'DEN PROFİLE YÖNLENDİRME

**Demo Kart:** `dwferwqferver` (Aktif kart)

**Adımlar:**
1. Hash URL'yi aç: `http://localhost:3000/dwferwqferver`
2. Otomatik olarak kullanıcı adı URL'sine yönlendirileceksin
3. Şimdi URL: `http://localhost:3000/fazilcanakbas`

**Beklenen Sonuç:** ✅
- Hash URL'den username URL'e redirect olur
- QR/NFC okuma simülasyonu bu şekilde

---

### 🟣 Senaryo 4: PROFIL PAYLAŞIMI

**Adımlar:**
1. Herhangi bir profil sayfasını aç (örn: `http://localhost:3000/fazilcanakbas`)
2. Sağ üstteki "Paylaş" butonuna tıkla
3. Mobilde ise paylaşım menüsü açılır
4. Desktop'ta link kopyalanır

**Beklenen Sonuç:** ✅
- Mobil: Native share menüsü açılır
- Desktop: "Link kopyalandı!" mesajı görünür

---

### ⚫ Senaryo 5: TEMA FARKLILIKLARI

**Adımlar:**
1. Giriş yap (Senaryo 2'deki bilgilerle)
2. Profil düzenleme sayfasında farklı temalar dene:
   - **Koyu:** Siyah arka plan, beyaz yazı
   - **Açık:** Beyaz arka plan, siyah yazı
   - **Gradient:** Mor-pembe-kırmızı gradient
   - **Minimal:** Temiz beyaz, ince kenarlıklar
3. Her temada farklı ana renk seç
4. Kaydet ve önizle

**Beklenen Sonuç:** ✅
- Her tema kendine özgü görünür
- Ana renk seçimi avatar ve vurgularda görünür
- Okunabilirlik her temada korunur

---

## Hızlı Test URL'leri

```
# Ana Sayfa
http://localhost:3000

# Mağaza
http://localhost:3000/store

# Yeni Kart Kaydı (abc123xyz - henüz kayıtlı değil)
http://localhost:3000/abc123xyz

# Kayıt Sayfası (manuel)
http://localhost:3000/card/register?hash=abc123xyz

# Giriş Sayfası
http://localhost:3000/card/login

# Profil Düzenleme (giriş gerektirir)
http://localhost:3000/card/setup

# Demo Kullanıcı Hash
http://localhost:3000/dwferwqferver

# Demo Kullanıcı Profil
http://localhost:3000/fazilcanakbas
```

---

## Demo Hesap Bilgileri

### KART 1 (Aktif)
- **Kart ID (Hash):** `dwferwqferver`
- **Kullanıcı Adı:** `fazilcanakbas`
- **Email:** `fazilcanakbas5@gmail.com`
- **Şifre:** `demo123`
- **Profil URL:** `/fazilcanakbas`

### KART 2 (Henüz Kayıtlı Değil)
- **Kart ID (Hash):** `abc123xyz`
- **Durum:** İlk kayıt için hazır
- **Test için kullan:** Yeni kart aktivasyonu testi

---

## Hata Durumları Test Et

### ❌ Geçersiz Kullanıcı Adı
- `/test user` → 404 (boşluk var)
- `/TESTUSER` → 404 (büyük harf var)
- `/test_user` → 404 (alt çizgi var)

### ❌ Olmayan Kart
- `/randomhash12345` → Ana sayfaya yönlendirilir

### ❌ Giriş Yapmadan Düzenleme
- `/card/setup` açmayı dene → Login'e yönlendirilir

### ❌ Yanlış Şifre
- Login sayfasında yanlış şifre gir → Hata mesajı görünür

---

## localStorage Kontrol

Tarayıcı konsolunda şunları yaz:

```javascript
// Tüm kartları göster
JSON.parse(localStorage.getItem('notouchness_cards'))

// Aktif oturumu göster
localStorage.getItem('notouchness_current_card')

// Sahiplik durumunu göster
localStorage.getItem('notouchness_is_owner')

// Tüm verileri temizle (yeni başlangıç için)
localStorage.clear()
```

---

## Sorun Giderme

### Profil güncellenmiyor?
- Tarayıcı konsolunu kontrol et (F12)
- localStorage'ı temizle ve tekrar dene
- Sayfayı yenile (Ctrl + F5)

### Yönlendirme çalışmıyor?
- URL'yi kontrol et (büyük/küçük harf önemli)
- Development server çalışıyor mu kontrol et
- `npm run dev` ile yeniden başlat

### Temalar görünmüyor?
- Tailwind CSS derlenmiş mi kontrol et
- `npm run dev` çalışıyor mu?

---

## Geliştirme Notları

- **localStorage kullanılıyor** → Production'da database gerekir
- **Hash ID'ler sabit** → Production'da UUID kullan
- **Şifre hashlenmemiş** → Production'da bcrypt kullan
- **View counter pasif** → Backend'de implement edilecek
- **QR kod yok** → Ayrı component eklenecek

---

## Başarıyla Test Ettin! 🎉

Sorun mu var? Hata logu iste, beraber bakalım! 💪
