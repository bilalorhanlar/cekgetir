import React from 'react';

const KvkkModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white">ÇekGetir Kişisel Verilerin Korunması ve Gizlilik Politikası</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-gray-300 space-y-6">
            <p className="text-sm text-gray-400">Yürürlük Tarihi: 01.06.2025</p>
            
            <p>Çekgetir olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili diğer mevzuata tam uyumlu biçimde kişisel verilerinizi korumayı taahhüt ediyoruz. Bu Politika, web sitemiz, mobil uygulamalarımız ve diğer iletişim kanallarımız aracılığıyla Çekgetir tarafından işlenen tüm kişisel verilerin hangi amaçlarla toplandığını, nasıl kullanıldığını, kimlerle paylaşıldığını ve hangi güvenlik önlemleriyle korunduğunu açıklamaktadır. Ayrıca ilgili kişilerin hakları ve onay süreçleri hakkında bilgi vermektedir.</p>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Kapsam</h3>
              <p>Bu Politika, Çekgetir'in hizmetlerinden yararlanan gerçek veya tüzel kişilere ait verileri kapsar. Politikamız, web sitemiz ve mobil uygulamalarımız üzerinden gerçekleştirilen tüm işlemlerde, sözleşmelerde ve taleplerde müşteri, ziyaretçi, çalışan, iş ortağı gibi veri sahipleri tarafından paylaşılan kişisel verileri içerir.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Tanımlar</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Çekgetir: Veri sorumlusu sıfatıyla kişisel verileri işleyen platformu ifade eder.</li>
                <li>Veri Sorumlusu: Kişisel verilerin işleme amaçlarını ve araçlarını belirleyen, kayıt sistemini yöneten Çekgetir'i belirtir.</li>
                <li>Veri İşleyen: Çekgetir adına kişisel verileri işleyen üçüncü kişi veya kuruluşlardır (ör. IT hizmet sağlayıcılar, çağrı merkezi, ödeme kuruluşları).</li>
                <li>İlgili Kişi: Kişisel verisi işlenen gerçek kişiyi ifade eder (ör. müşteri, çalışan, ziyaretçi).</li>
                <li>Kişisel Veri: Kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi (ör. ad-soyad, T.C. kimlik no, iletişim bilgileri).</li>
                <li>Özel Nitelikli Kişisel Veri: Kişinin sağlık, din, cinsel hayat, biyometrik/genetik veri gibi daha hassas bilgileri. Özel nitelikli veriler, ancak kanunda izin verilen hallerde veya açık rızanızla işlenir.</li>
                <li>Açık Rıza: Belirli bir konuda, bilgilendirilmeye dayalı olarak özgür iradenizle verdiğiniz onayı ifade eder.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Veri Sorumlusu ve İrtibat Bilgileri</h3>
              <p>Bu Politika kapsamında veri sorumlusu Çekgetir'dir. Çekgetir'in unvanı, adresi ve iletişim bilgileri aşağıdaki gibidir:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Unvan: Çekgetir (Platform)</li>
                <li>Adres: Ferhatpaşa, Anadolu Cad. No:74, 34888 Ataşehir / İstanbul</li>
                <li>Telefon: +90 540 490 10 00</li>
                <li>E-posta: info@cekgetir.com (veya destek portalı)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepler</h3>
              <p>Çekgetir, kişisel verilerinizi aşağıdaki amaçlar doğrultusunda ve KVKK'da sayılan yasal sebeplere dayanarak işler:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Hizmet Sunumu: Talep ettiğiniz çekici ve yol yardım hizmetlerini sağlamak amacıyla kişisel verileriniz işlenir (ör. ad-soyad, iletişim, araç ve konum bilgileri).</li>
                <li>İletişim ve Talep Takibi: Destek taleplerinizi karşılamak ve bildirimlerde bulunmak için iletişim bilgileriniz kullanılır.</li>
                <li>Üyelik ve Kayıt İşlemleri: Web sitemize üyelik veya hesap oluşturma sürecinde verdiğiniz bilgiler, hizmet sunumu ve kullanıcı hesabınızın yönetimi için işlenir.</li>
                <li>Pazarlama ve Tanıtım: Açık rızanıza istinaden size kampanya, bilgilendirme veya reklam amaçlı iletişimler yapılabilir.</li>
                <li>Hukuki Yükümlülüklerin Yerine Getirilmesi: Vergi, ticaret ve muhasebe mevzuatı kapsamında gerekli kişisel veriler saklanır.</li>
                <li>Güvenlik ve Önleyici Tedbirler: Sistem güvenliğini sağlamak, yetkisiz erişimleri önlemek için gerekli veriler işlenir.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">5. Kişisel Verilerin Toplanma Yöntemleri</h3>
              <p>Kişisel verileriniz farklı yollarla toplanabilir:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Doğrudan Bildirme: Web sitesi formları, mobil uygulama kayıt ekranları, yazılı veya elektronik başvurular, telefon görüşmeleri, müşteri talepleri sırasında doğrudan tarafınızdan sağlanan bilgiler.</li>
                <li>Web ve Mobil Uygulama Verileri: İnternet site ve uygulama kullanımınız sırasında oluşan veriler (IP adresi, çerezler, tarayıcı ve cihaz bilgileri, konum verisi vb.) otomatik olarak elde edilebilir.</li>
                <li>Üçüncü Taraf Kaynaklar: Mevzuat gereği veya hizmetin gerektirdiği durumlarda yetkili kurum/kuruluşlardan ve iş ortaklarımızdan alınan veriler.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">6. Kişisel Verilerin Paylaşılması ve Aktarımı</h3>
              <p>Çekgetir, kişisel verilerinizi kanunda öngörülen şartlar çerçevesinde paylaşabilir. Verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Hizmet Sağlayıcılar ve İş Ortakları: Çekici firmaları, lojistik iş ortakları, bilgi teknolojileri hizmet sağlayıcıları, çağrı merkezi operatörleri, ödeme kuruluşları gibi Çekgetir'e hizmet veren şirketler.</li>
                <li>Yetkili Kurum ve Kuruluşlar: Kanunen yetkili resmi merciler veya mahkemeler talep ettiğinde kişisel verileriniz yasal zorunluluk kapsamında paylaşılabilir.</li>
                <li>Yurt İçi ve Yurt Dışı Aktarımlar: Hizmetlerin yürütülmesi amacıyla gerekli veri aktarımları KVKK'ya uygun olarak gerçekleştirilir.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">7. Kişisel Verilerin Saklama Süresi</h3>
              <p>Çekgetir, kişisel verilerinizi yalnızca işleme amaçları için gerekli süre kadar ve yasal düzenlemelerin gerektirdiği asgari süre boyunca saklar. Saklama sürelerimiz genel olarak aşağıdaki esaslara göre belirlenir:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Hizmet ve Sözleşme Süreci: Hizmet talebinin yerine getirilmesi ve sözleşme yükümlülüklerinin devamı süresince veriler saklanır.</li>
                <li>Fatura ve Mali Kayıtlar: Yasal düzenlemelere göre fatura, irsaliye, banka dekontu gibi evraklar 10 yıl saklanır.</li>
                <li>Müşteri İletişim Kayıtları: Sözleşme ve müşteri ilişkileriyle ilgili iletişim kayıtları en az 2 yıl süreyle saklanır.</li>
                <li>Çerezler ve Takip Teknolojileri: Kullanılan çerezlerin saklama süreleri tarayıcı ayarlarınıza ve çerezin türüne bağlıdır.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">8. Kişisel Verilerin Korunmasına Yönelik Güvenlik Önlemleri</h3>
              <p>Çekgetir, kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve idari tedbirleri uygular. Alınan güvenlik önlemlerinden bazıları şunlardır:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Erişim Kontrolleri: Kişisel verilere sadece yetkili personel erişim izni vardır.</li>
                <li>Şifreleme ve Güvenli İletim: Kişisel verilerinizin internet üzerinden iletiminde SSL/TLS gibi güvenli bağlantılar kullanılır.</li>
                <li>Altyapı Güvenliği: Sunucularımız ve veri tabanlarımız güvenlik duvarları, antivirüs yazılımları ve düzenli güvenlik taramaları ile korunur.</li>
                <li>Düzenli Denetim ve İyileştirme: Veri işleme süreçlerimiz bağımsız denetimlere tabidir.</li>
                <li>Yedekleme: Kişisel veriler düzenli olarak yedeklenir.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">9. İlgili Kişinin Hakları</h3>
              <p>KVKK'nın 11. maddesi uyarınca, Çekgetir tarafından işlenen kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme.</li>
                <li>Kişisel verileriniz işlenmişse amaçlarını öğrenme, işlendikleri süreyi öğrenme ve aktarıldığı üçüncü kişileri öğrenme.</li>
                <li>Eksik veya yanlış işlenmiş kişisel verilerinizin düzeltilmesini isteme.</li>
                <li>Kanuna aykırı olarak işlenmiş veya aktarılmış kişisel verilerinizin silinmesini veya yok edilmesini isteme.</li>
                <li>İşlenmesine itiraz etme; özellikle açık rızaya dayalı veri işleme faaliyetlerine onayınızı geri çekme.</li>
                <li>Kanun'un öngördüğü diğer haklar; hukuka aykırı veri işleme nedeniyle zarara uğramanız halinde tazminat talep etme.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">10. Çerez Politikası</h3>
              <p>Çekgetir web sitesinde hizmetleri geliştirmek, site kullanımını analiz etmek ve kullanıcı deneyimini iyileştirmek amacıyla çerez (cookie) ve benzeri teknolojiler kullanılmaktadır. Çerezler, tarayıcınızdan gelen verileri depolayan küçük metin dosyalarıdır. Kullanıcı olarak, tarayıcı ayarlarınızı değiştirerek çerezleri silebilir veya engelleyebilirsiniz.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">11. Kullanıcı Onayı ve Yürürlük</h3>
              <p>Bu Politika, Çekgetir hizmetlerini kullandığınız süre boyunca yürürlükte kalır ve gerekli görüldüğünde güncellenebilir. Güncel politika metni web sitemizde yayımlandığı tarihte yürürlüğe girer.</p>
              <p className="mt-2">Çekgetir hizmetlerinden yararlanmak ve sipariş vermek isteyen kullanıcılar, sipariş onayı aşamasında sunulan "Siparişi Onayla" butonuna tıklayarak bu Politika'yı okuduklarını, anladıklarını ve tüm hükümlerini kabul ettiklerini beyan ederler.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KvkkModal; 