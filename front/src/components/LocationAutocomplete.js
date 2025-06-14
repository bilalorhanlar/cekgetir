import React, { useState, useEffect } from "react";

const LocationAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Adres girin veya haritadan seçin"
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controlled input desteği
  const inputValue = typeof value === "string" ? value : internalValue;

  useEffect(() => {
    if (inputValue.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(inputValue)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setResults(data.features || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [inputValue]);

  const handleInputChange = e => {
    if (onChange) onChange(e);
    else setInternalValue(e.target.value);
  };

  const handleSelect = ({ lat, lng, label }) => {
    if (onChange) onChange({ target: { value: label } });
    else setInternalValue(label);
    setResults([]);
    if (onSelect) onSelect({ lat, lng, address: label });
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500 placeholder-[#404040]"
        style={{ fontSize: '1rem' }}
      />

      {loading && (
        <div className="absolute top-full left-0 right-0 p-2 bg-[#141414] border border-[#404040] rounded-b-lg shadow-lg text-white">
          Yükleniyor...
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-[#141414] border border-[#404040] rounded-b-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {results.map((item, idx) => {
            const name = item.properties.name;
            const city = item.properties.city || "";
            const country = item.properties.country || "";
            const label = `${name}${city ? ', ' + city : ''}${country ? ', ' + country : ''}`;
            const [lng, lat] = item.geometry.coordinates;
            return (
              <li
                key={idx}
                onClick={() => handleSelect({ lat, lng, label })}
                className="px-4 py-3 cursor-pointer hover:bg-[#202020] border-b border-[#404040] last:border-b-0 text-white"
                style={{ fontSize: '1rem' }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete; 