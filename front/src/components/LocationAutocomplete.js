import React, { useState, useEffect } from "react";

const LocationAutocomplete = ({ onSelect, placeholder = "Bir yer yaz (örneğin İstanbul)" }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setResults(data.features || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative max-w-md">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500"
      />

      {loading && (
        <div className="absolute top-full left-0 right-0 p-2 bg-white border rounded-b-lg shadow-lg">
          Yükleniyor...
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-b-lg shadow-lg z-10">
          {results.map((item, idx) => {
            const name = item.properties.name;
            const city = item.properties.city || "";
            const country = item.properties.country || "";
            const label = `${name}${city ? ', ' + city : ''}${country ? ', ' + country : ''}`;
            const [lng, lat] = item.geometry.coordinates;
            console.log(item);
            return (
              <li
                key={idx}
                onClick={() => {
                  setQuery(label);
                  setResults([]);
                  onSelect({ lat, lng });
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
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