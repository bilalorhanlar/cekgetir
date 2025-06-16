import React from 'react';

const AydinlatmaModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-white">Çekgetir 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Kapsamında Bilgilendirme (Aydınlatma) Metni</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mb-6">
            Yürürlük Tarihi: 01.06.2025
          </div>

          <div className="space-y-6 text-gray-300">
            <section>
              <h3 className="font-semibold mb-3 text-white">1. Veri Sorumlusu Bilgileri</h3>
              <p className="text-gray-300">
                Çekgetir.com (info@cekgetir.com, +90 540 490 10 00) veri sorumlusu olarak faaliyet göstermektedir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi gereği veri sorumlusu tarafından ilgili kişilerin bilgilendirilmesi amacıyla hazırlanmıştır. Çekgetir.com, sunduğu hizmetlerin yürütülmesi sırasında topladığı kişisel verileri bu metinde belirtildiği şekilde işlemekte ve korumaktadır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">2. İşlenen Kişisel Veriler</h3>
              <p className="text-gray-300">
                İşlenen kişisel veriler, kullanıcı türüne göre farklılık gösterir. Bireysel kullanıcılar için işlenen veriler arasında; ad-soyad, T.C. Kimlik Numarası, iletişim bilgileri (e-posta, telefon, adres vb.), araç bilgileri (plaka, marka, model vb.), IP adresi ve konum bilgileriniz yer alır. Kurumsal kullanıcılar için ise firma adı, vergi numarası ve vergi dairesi gibi ticari bilgiler işlenir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">3. İşlenme Amaçları</h3>
              <p className="text-gray-300">
                Toplanan kişisel verileriniz; taşıt çekici hizmetinin planlanması ve yürütülmesi, uygun taşıyıcı eşleştirmesi, servis takip kodu oluşturulması, siparişin yerine getirilmesi (hizmet ifası), faturalama, müşteri destek hizmetleri, güvenliğin sağlanması ve hizmet kalitesi ile performans analizlerinin yapılması gibi amaçlarla işlenir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">4. Toplama Yöntemi ve Hukuki Sebepler</h3>
              <p className="text-gray-300">
                Çekgetir.com kişisel verileri; web sitemizdeki veya mobil uygulamamızdaki formlar, e-posta, telefon görüşmeleri veya diğer iletişim kanalları aracılığıyla ve gerekmesi halinde internet üzerinden otomatik yollarla toplar. Verilerin işlenme hukuki gerekçesi hizmet sözleşmesinin ifası, kanundan doğan yasal zorunlulukların yerine getirilmesi veya Çekgetir.com'un meşru menfaatlerinin korunmasıdır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">5. Verilerin Aktarımı</h3>
              <p className="text-gray-300">
                Toplanan kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi için gerektiğinde üçüncü taraflarla paylaşılabilir. Örneğin, çekici hizmetini sunan taşıyıcı firmalar, teknik altyapı hizmetleri sağlayan altyapı ve bulut sağlayıcıları, danışmanlık hizmeti veren uzman kişiler/kuruluşlar ve hukuken gerekli hallerde yetkili kamu kurumları verilerinize erişebilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">6. Yurt Dışına Aktarım</h3>
              <p className="text-gray-300">
                Verilerinizin bir kısmı, kullandığımız bazı hizmetlerin yabancı sunucuları nedeniyle yurt dışına aktarılabilir. Örneğin, Google Workspace veya Google Maps hizmetleri ile Amazon Web Services (AWS) altyapısı üzerinden sağlanan çözümler kullanılması durumunda verileriniz bu sistemler üzerinden işlenebilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">7. Saklama Süresi</h3>
              <p className="text-gray-300">
                Kişisel verileriniz, toplanma amaçlarının gerektirdiği ve ilgili mevzuatta öngörülen süreler boyunca saklanır. Amacın gerçekleşmesi veya yasal sürenin sona ermesi durumunda verileriniz silinir, yok edilir veya anonim hale getirilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">8. KVKK'nın 11. Maddesi Kapsamındaki Haklarınız</h3>
              <p className="text-gray-300">
                6698 sayılı KVKK'nın 11. maddesi uyarınca veri sahipleri aşağıdaki haklara sahiptir: kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurtiçi/yurtdışı aktarım yerlerini öğrenme, eksik/yanlışsa düzeltilmesini isteme, silinmesini/yok edilmesini isteme, itiraz ve tazminat talep etme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">9. Başvuru Yolları</h3>
              <p className="text-gray-300">
                Bu haklarınızı kullanmak için info@cekgetir.com adresine e-posta gönderebilir veya +90 540 490 10 00 numaralı telefonu arayabilirsiniz. Ayrıca yazılı olarak başvuru yapmanız da mümkündür.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">10. Onay ve Kabul</h3>
              <p className="text-gray-300">
                Bu metni okuyup anladığınızı ve kişisel verilerinizin yukarıda açıklanan şekillerde işlenmesini kabul ettiğinizi bildiririz. 'Siparişi Onayla' butonuna tıklamanız, bu aydınlatma metnindeki bildirimleri kabul ettiğiniz anlamına gelir. Bu metin, www.cekgetir.com üzerinden kişisel/kamusal bilgi paylaşımı sırasında ve 'Siparişi Onayla' butonuna tıklanmasıyla birlikte kabul edilmiş sayılır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AydinlatmaModal;