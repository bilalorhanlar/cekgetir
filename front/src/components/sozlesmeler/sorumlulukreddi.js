import React from 'react';

const SorumlulukReddiModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white">Sorumluluk Reddi Beyanı</h2>
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
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Hizmet Tanımı ve Platform Rolü</h3>
              <p>Cekgetir.com ("Platform"), şehir içi ve şehirler arası araç transferi ile yol yardım hizmetlerinin dijital ortamda organize edilmesini sağlayan bir aracılık hizmeti sağlayıcısıdır. Söz konusu hizmetler, Cekgetir.com'un doğrudan sahibi veya işletmecisi olmadığı, bağımsız ve üçüncü taraf olan taşıma firmaları ve çekici operatörleri tarafından sunulmaktadır.</p>
              <p className="mt-2">Cekgetir.com, kullanıcılar ile hizmet sağlayıcı firmalar arasında iletişim kurulmasına ve hizmetin planlanmasına aracılık eder. Cekgetir.com, bu hizmetleri doğrudan sağlamaz, yalnızca iş ortaklığı ağı üzerinden operasyonel koordinasyonu üstlenir.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Hizmet Sağlayıcıların Sorumluluğu</h3>
              <p>Kullanıcı tarafından talep edilen taşıma veya yol yardım hizmetinin tüm operasyonel süreçleri (araç gönderimi, yükleme, taşıma, indirme vb.) ilgili hizmet sağlayıcı firmanın sorumluluğundadır.</p>
              <p className="mt-2">Cekgetir.com, bu süreçlerde doğabilecek herhangi bir zarar, gecikme, hizmet aksaması, iletişim eksikliği, araçta oluşabilecek maddi zararlar veya benzeri durumlarda doğrudan sorumlu değildir.</p>
              <p className="mt-2">Hizmet sağlayıcı firmalar, taşıma hizmetlerini kendi adlarına, kendi ekipmanlarıyla ve kendi riskleri altında yürütmektedir. Cekgetir.com, yalnızca hizmetin sağlıklı şekilde organize edilmesini amaçlar.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Sigorta ve Taşıma Güvenceleri</h3>
              <p>Transfer sırasında meydana gelebilecek herhangi bir kaza, hasar veya kayıp durumunda, hizmet sağlayıcı firmanın taşıma sigortası devreye girer. Cekgetir.com'un bu gibi zararlar nedeniyle doğrudan ya da dolaylı şekilde sorumlu tutulması mümkün değildir. Kullanıcı, hizmeti talep etmeden önce bu koşulları kabul etmiş sayılır.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Bilgi Doğruluğu ve Kullanıcı Beyanı</h3>
              <p>Cekgetir.com üzerinde verilen bilgiler, kullanıcıların beyanına dayalı olarak iletilmekte olup, taşıma sırasında kullanılacak bilgilerin (araç türü, konum, taşıma adresi vb.) eksik veya hatalı olması halinde doğabilecek sorunlardan Cekgetir.com sorumlu değildir.</p>
              <p className="mt-2">Kullanıcı, hizmet talebinde bulunurken doğru, eksiksiz ve güncel bilgi verdiğini taahhüt eder.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">5. Platform Üzerinden Erişilen Üçüncü Taraflar</h3>
              <p>Cekgetir.com'da yer alan hizmet sağlayıcılar, kendi faaliyetlerinden ve sundukları hizmetlerin niteliğinden bizzat sorumludur. Cekgetir.com, bu hizmet sağlayıcıların verdikleri hizmetler, sundukları fiyatlar veya uygulamaları üzerinde sürekli denetim yapmaz. Ancak güvenlik ve kalite kontrolleri açısından gerekli inceleme ve iletişim süreçlerini yürütür.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">6. Mücbir Sebepler</h3>
              <p>Doğal afetler, trafik kazaları, yasal engellemeler, grev, pandemi, yol kapanmaları, hava koşulları gibi Cekgetir.com'un kontrolü dışındaki gelişmeler nedeniyle hizmetin sağlanamaması, gecikmesi veya iptal edilmesi durumlarında Cekgetir.com'un herhangi bir sorumluluğu bulunmamaktadır.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">7. Yasal Dayanak ve Kabul</h3>
              <p>İşbu sorumluluk reddi beyanı, Türk Borçlar Kanunu ve ilgili mevzuat uyarınca hazırlanmıştır. Cekgetir.com'u kullanan tüm kullanıcılar, bu beyanın içeriğini okumuş, anlamış ve kabul etmiş sayılırlar.</p>
              <p className="mt-2">Cekgetir.com, işbu metni önceden bildirimde bulunmaksızın güncelleme hakkını saklı tutar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SorumlulukReddiModal;
