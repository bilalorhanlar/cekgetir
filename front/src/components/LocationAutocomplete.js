import React, { useState, useEffect } from "react";

const LocationAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Adres girin veya haritadan seçin",
  isMapSelected = false,
  inputClassName = "w-full px-4 py-2.5 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500 placeholder-[#404040]",
  suggestionClassName = "absolute top-full left-0 right-0 bg-[#141414] border border-[#404040] rounded-b-lg shadow-lg z-10 max-h-60 overflow-y-auto",
  suggestionItemClassName = "px-4 py-2 cursor-pointer hover:bg-[#202020] border-b border-[#404040] last:border-b-0 text-white",
  onInputChange
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controlled input desteği
  const inputValue = typeof value === "string" ? value : internalValue;

  useEffect(() => {
    // Eğer haritadan seçildiyse veya input boşsa arama yapma
    if (isMapSelected || inputValue.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      // Nominatim API'si için Türkiye sınırları
      const params = new URLSearchParams({
        q: inputValue,
        countrycodes: 'tr',
        limit: 5,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'tr'
      });

      fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          'Accept-Language': 'tr'
        }
      })
        .then(res => res.json())
        .then(data => {
          const formattedResults = data.map(item => ({
            properties: {
              // Sokak adı (yoksa mahalle)
              street: item.address.road || item.address.pedestrian || item.address.footway || 
                     item.address.neighbourhood || item.address.suburb || '',
              // İlçe
              district: item.address.county || item.address.city_district || item.address.district || '',
              // İl
              city: item.address.state || item.address.province || '',
              // Tam adres (gösterim için)
              fullAddress: [
                item.address.road || item.address.pedestrian || item.address.footway || 
                item.address.neighbourhood || item.address.suburb || '',
                item.address.county || item.address.city_district || item.address.district || '',
                item.address.state || item.address.province || ''
              ].filter(Boolean).join(', ')
            },
            geometry: {
              coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
            }
          }));
          setResults(formattedResults);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [inputValue, isMapSelected]);

  const handleInputChange = e => {
    // Input değiştiğinde sonuçları temizle
    setResults([]);
    setLoading(false);
    if (onInputChange) onInputChange(e.target.value); // parent'a bildir
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  // inputa tıklama ile öneri kutusu açılmasın (isMapSelected true ise)
  const handleInputClick = e => {
    if (isMapSelected) {
      e.target.blur(); // inputa tıklayınca focus olmasın, öneri açılmasın
    }
  };

  const handleSelect = ({ lat, lng, label, cityData }) => {
    // Önce sonuçları temizle
    setResults([]);
    setLoading(false);
    // Sonra input değerini güncelle
    if (onChange) {
      onChange({ target: { value: label } });
    } else {
      setInternalValue(label);
    }
    // En son seçim callback'ini çağır
    if (onSelect) {
      onSelect({ lat, lng, address: label, cityData });
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        className={inputClassName}
        style={{ fontSize: '0.875rem' }}
      />

      {/* isMapSelected true ise öneri ve loading hiç gösterme */}
      {!isMapSelected && loading && (
        <div className="absolute top-full left-0 right-0 p-2 bg-[#141414] border border-[#404040] rounded-b-lg shadow-lg text-white text-sm">
          Yükleniyor...
        </div>
      )}

      {!isMapSelected && results.length > 0 && (
        <ul className={suggestionClassName}>
          {results.map((item, idx) => {
            const { fullAddress } = item.properties;
            const [lng, lat] = item.geometry.coordinates;
            return (
              <li
                key={idx}
                onClick={() => handleSelect({ 
                  lat, 
                  lng, 
                  label: fullAddress,
                  cityData: item 
                })}
                className={suggestionItemClassName}
                style={{ fontSize: '0.875rem' }}
              >
                <div className="truncate overflow-hidden whitespace-nowrap w-full">{fullAddress}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete; 