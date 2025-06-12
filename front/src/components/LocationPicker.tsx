"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";

// Leaflet marker ikonlarını düzelt
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  isStartPicker: boolean; // başlangıç mı bitiş mi picker'ı
  onLocationChange: (lat: number, lng: number, address: string) => void;
  onCalculateRoute: () => void;
  onCityChange: (city: string) => void;
  mapStyles?: {
    width: string;
    height: string;
    borderRadius: string;
    border: string;
  };
}

const LocationPicker = ({ isStartPicker, onLocationChange, onCalculateRoute, onCityChange, mapStyles }: LocationPickerProps) => {
  // İstanbul'daki popüler konumlar
  const popularLocations = [
    { name: "Taksim", lat: 41.0370, lng: 28.9850 },
    { name: "Sultanahmet", lat: 41.0054, lng: 28.9768 },
    { name: "Kadıköy", lat: 40.9927, lng: 29.0277 },
    { name: "Beşiktaş", lat: 41.0430, lng: 29.0061 },
    { name: "Üsküdar", lat: 41.0233, lng: 29.0151 },
    { name: "Atatürk Havalimanı", lat: 40.9767, lng: 28.8242 },
    { name: "Sabiha Gökçen Havalimanı", lat: 40.8982, lng: 29.3092 },
    { name: "Eyüp", lat: 41.0480, lng: 28.9341 },
  ];

  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name?: string}>({
    lat: isStartPicker ? 41.0082 : 41.0351,
    lng: isStartPicker ? 28.9784 : 28.9895,
  });
  
  const miniMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerId = isStartPicker ? "mini-map-start" : "mini-map-end";

  // Mini haritayı oluştur
  useEffect(() => {
    if (miniMapRef.current) return;
    
    // Mini haritayı oluştur
    const map = L.map(mapContainerId).setView([selectedLocation.lat, selectedLocation.lng], 11);
    miniMapRef.current = map;
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    // İlk marker'ı ekle
    markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
      draggable: true
    }).addTo(map);
    
    // Haritaya tıklandığında marker'ı güncelle
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng);
    });
    
    // Marker sürüklendiğinde konum bilgisini güncelle
    markerRef.current.on('dragend', () => {
      if (markerRef.current) {
        const position = markerRef.current.getLatLng();
        updateMarkerPosition(position.lat, position.lng);
      }
    });
    
    return () => {
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);
  
  // Marker pozisyonunu güncelle ve dışarıya bildir
  const updateMarkerPosition = async (lat: number, lng: number) => {
    if (!markerRef.current || !miniMapRef.current) return;
    
    // Marker'ı yeni konuma taşı
    markerRef.current.setLatLng([lat, lng]);
    
    // Yeni konumu state'e kaydet
    setSelectedLocation({ lat, lng });
    const city = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const cityData =  await city.json(); 
    // seçilen şehir isömi buylma
    onCityChange(cityData.address.province || "");
    // addresi apiden çek lat ve lng kullan tam adresi al
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=85e92bcb025e4243b2ad8ccaef8c3593`);
    const data = await response.json();
    const address = data.results[0].formatted;
    console.log(address);
    // Dışarıya bildir
    onLocationChange(lat, lng, address);
    // Arama metnini temizle
    setSearchText("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchText(query);
    

  };

  const selectLocation = async (location: { name: string; lat: number; lng: number }) => {
    
    updateMarkerPosition(location.lat, location.lng);
    setSearchText(location.name);

    // Haritayı seçilen konuma odakla
    if (miniMapRef.current) {
      miniMapRef.current.setView([location.lat, location.lng], 13);
    }
  };

  return (
      <div 
        id={mapContainerId} 
        className="w-24 h-24 rounded border mb-3"
        style={{
          width: mapStyles?.width || '100%',
          height: mapStyles?.height || '16rem', // 16rem = h-64 in Tailwind
          borderRadius: mapStyles?.borderRadius || '',
          border: mapStyles?.border || '1px solid #d1d5db', // default border color
        }}
      ></div>
      
  );
};

export default LocationPicker; 