import React from 'react';

const AcikRizaModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-white">ÇekGetir 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Uyarınca Açık Rıza Beyanı</h2>
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
              <h3 className="font-semibold mb-3 text-white">1. Genel Bilgilendirme</h3>
              <p className="text-gray-300">
                Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, çekgetir.com ("Platform") üzerinden sunulan hizmetler kapsamında kişisel verilerinizin işlenmesi, paylaşılması ve yurt dışına aktarılması konularında açık rızanızı almak amacıyla hazırlanmıştır.
              </p>
              <p className="text-gray-300 mt-3">
                Platform üzerinden hizmet talebinde bulunan kullanıcılar, "Siparişi Onayla" butonuna tıklamak suretiyle işbu Açık Rıza Metni'ni okuyup anladıklarını ve onayladıklarını kabul ederler.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">2. Kapsam Dahilindeki Kişisel Veriler</h3>
              <p className="text-gray-300 mb-3">Aşağıda belirtilen kişisel verileriniz, açık rızanız dâhilinde işlenebilir:</p>
              
              <div className="ml-4">
                <h4 className="font-medium mb-2 text-white">Bireysel Kullanıcılar İçin:</h4>
                <ul className="list-disc ml-6 text-gray-300 space-y-1">
                  <li>Ad, soyad</li>
                  <li>Telefon numarası</li>
                  <li>E-posta adresi</li>
                  <li>Araç bilgileri (plaka, marka, model vb.)</li>
                  <li>Alım ve teslimat adresleri</li>
                  <li>Konum bilgisi (GPS koordinatları)</li>
                  <li>IP adresi</li>
                  <li>T.C. Kimlik Numarası</li>
                </ul>

                <h4 className="font-medium mt-6 mb-2 text-white">Kurumsal Kullanıcılar İçin (Ek Olarak):</h4>
                <ul className="list-disc ml-6 text-gray-300 space-y-1">
                  <li>Firma unvanı</li>
                  <li>Vergi numarası</li>
                  <li>Vergi dairesi</li>
                  <li>Yetkili kişi bilgileri (ad-soyad, iletişim)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">3. Açık Rıza Verdiğiniz İşleme Faaliyetleri</h3>
              <p className="text-gray-300 mb-3">Açık rızanız, aşağıdaki faaliyetleri kapsamaktadır:</p>
              <ol className="list-decimal ml-6 text-gray-300 space-y-1">
                <li>Hizmet Sunumu ve Süreç Yönetimi</li>
                <li>Konum Bilgisinin Kullanımı</li>
                <li>Hizmet Sağlayıcı Firmalar ile Paylaşım</li>
                <li>Sunucu Sağlayıcıların Lokasyonuna Göre Yurt İçi veya Yurt Dışına Veri Aktarımı</li>
                <li>Tanıtım, Kampanya ve Pazarlama Faaliyetleri</li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">4. Verilerin Saklanma Süresi</h3>
              <p className="text-gray-300">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerektirdiği süre boyunca ve ayrıca ilgili yasal mevzuatlarda öngörülen süre kadar saklanacak, sonrasında silinecek, yok edilecek veya anonim hale getirilecektir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">5. Haklarınız</h3>
              <p className="text-gray-300 mb-3">
                KVKK'nın 11. maddesi uyarınca, kişisel verilerinizle ilgili olarak veri sorumlusu olan çekgetir.com'a başvurarak;
              </p>
              <ul className="list-disc ml-6 text-gray-300 space-y-1">
                <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>Hangi amaçla işlendiğini öğrenme</li>
                <li>Aktarıldığı 3. kişileri öğrenme</li>
                <li>Eksik ya da yanlış işlenmişse düzeltilmesini isteme</li>
                <li>Silinmesini veya yok edilmesini isteme</li>
                <li>Bu işlemlerin aktarıldığı kişilere bildirilmesini talep etme</li>
                <li>Otomatik sistemlerde analiz sonucuna itiraz etme</li>
                <li>Zarara uğrarsanız tazminat talep etme</li>
              </ul>
              <p className="text-gray-300 mt-3">
                haklarına sahipsiniz.
              </p>
              <p className="text-gray-300 mt-3">
                Detaylı bilgi için Aydınlatma Metni'ni inceleyebilirsiniz.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3 text-white">6. Onay ve Kabul</h3>
              <p className="text-gray-300">
                Kullanıcı olarak çekgetir.com üzerinde yer alan formlar aracılığıyla bilgi göndermeniz ve "Siparişi Onayla" butonuna tıklamanız, bu Açık Rıza Metni'ni okuduğunuzu, anladığınızı ve burada belirtilen tüm işleme, paylaşım ve yurt dışına aktarım faaliyetlerine açık rıza verdiğinizi gösterir.
              </p>
              <p className="text-gray-300 mt-3">
                Bu metne verdiğiniz rızayı, dilediğiniz zaman geri çekme hakkına sahipsiniz. Geri çekme taleplerinizi info@cekgetir.com adresi üzerinden iletebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcikRizaModal;
