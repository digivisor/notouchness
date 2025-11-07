# Yandex Mail Kurulum Rehberi

Mail servisi Resend'den Yandex SMTP'ye geçirildi. Aşağıdaki adımları takip ederek mail servisini yapılandırın.

## 1. Yandex Mail Ayarları

Yandex Mail hesabınızda (info@notouchness.com) SMTP erişimini etkinleştirmeniz gerekiyor:

1. **Yandex Mail'e giriş yapın**: https://mail.yandex.com
2. **Ayarlar** > **Tüm ayarlar** > **Posta programları** bölümüne gidin
3. **IMAP ayarlarını kontrol edin** (görüntüde görünen):
   - ✅ "imap.yandex.com.tr sunucusundan IMAP protokolüne göre" işaretli olmalı
   - ✅ "Uygulama şifreleri ve OAuth-token'ları" işaretli olmalı
4. **SMTP ayarları için** (mail göndermek için):
   - Aynı sayfada veya "Güvenlik" bölümünde **"Posta programlarından göndermeye izin ver"** seçeneğini **AÇIK** yapın
   - **"Uygulama şifreleri"** bölümüne gidin (genellikle "Güvenlik" > "Uygulama şifreleri")
   - Yeni bir uygulama şifresi oluşturun:
     - Uygulama adı: "Notouchness Website" (veya istediğiniz bir isim)
     - Oluşturulan şifreyi kopyalayın (bu şifreyi `.env.local` dosyasına ekleyeceksiniz)

**NOT**: Görüntüde IMAP/POP3 ayarları görünüyor. SMTP ayarları genellikle aynı sayfada veya "Güvenlik" bölümünde bulunur. "Posta programlarından göndermeye izin ver" seçeneğini mutlaka açmanız gerekiyor.

## 2. Environment Variables

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# Yandex Mail SMTP Ayarları
YANDEX_EMAIL=info@notouchness.com
YANDEX_PASSWORD=your-yandex-app-password-here

```

**ÖNEMLİ**: 
- `YANDEX_PASSWORD` için normal mail şifrenizi DEĞİL, Yandex'ten oluşturduğunuz **uygulama şifresini** kullanın
- Uygulama şifresi genellikle 16 karakterlik bir string'dir

## 3. Test Etme

Mail servisini test etmek için:

1. Bir sipariş oluşturun
2. Sipariş tamamlandığında otomatik olarak mail gönderilecektir
3. Mail gönderim durumunu kontrol etmek için server loglarına bakın

## 4. Sorun Giderme

### Mail gönderilemiyor

1. **Yandex Mail ayarlarını kontrol edin**:
   - "Posta programlarından göndermeye izin ver" açık mı?
   - Uygulama şifresi doğru mu?

2. **Environment variables kontrol edin**:
   - `YANDEX_EMAIL` doğru mu? (info@notouchness.com)
   - `YANDEX_PASSWORD` uygulama şifresi mi? (normal şifre değil!)

3. **Port ve SSL ayarları**:
   - Port: 465 (SSL)
   - Host: smtp.yandex.com
   - Bu ayarlar kodda zaten yapılandırılmış durumda

### "Authentication failed" hatası

- Yandex uygulama şifresini kullandığınızdan emin olun
- Normal mail şifresi çalışmaz, mutlaka uygulama şifresi gereklidir

## 5. Resend Kaldırma (Opsiyonel)

Artık Resend kullanılmadığı için `package.json`'dan kaldırabilirsiniz:

```bash
npm uninstall resend
```

Ancak bu zorunlu değildir, kodda kullanılmıyor.

