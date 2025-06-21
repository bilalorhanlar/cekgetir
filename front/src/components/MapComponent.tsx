"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface MapComponentProps {
  // Mevcut tek rota modu (backward compatibility için)
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  
  // Yeni çoklu durak modu
  waypoints?: { 
    lat: number; 
    lng: number; 
    name?: string; // "Durak 1", "Merkez", vs.
  }[];
  
  shouldCalculate: boolean;
  onValuesChange: (distance: number, duration: number, wayPointsKm: number[], detectedBridges?: string[], bridgeFees?: number ) => void;
  mapStyles?: {
    width: string;
    height: string;
    borderRadius: string;
    border: string;
  };
}

// İstanbul'daki önemli köprüler ve koordinatları
const BRIDGES = [
  { 
    name: "15 Temmuz Şehitler Köprüsü (Boğaziçi Köprüsü)", 
    bounds: {
      north: 41.0480, 
      south: 41.0430, 
      east: 29.0420,
      west: 29.0320
    },
    fee: 0 // Standart ücret
  },
  { 
    name: "Fatih Sultan Mehmet Köprüsü", 
    bounds: {
      north: 41.0940, 
      south: 41.0890, 
      east: 29.0610,
      west: 29.0530
    },
    fee: 200 // FSM Köprüsü için 200 TL ücret
  },
  { 
    name: "Yavuz Sultan Selim Köprüsü", 
    bounds: {
      north: 41.1950, 
      south: 41.1850, 
      east: 29.1300,
      west: 29.1100
    },
    fee: 0 // Standart ücret
  },
  { 
    name: "Avrasya Tüneli", 
    bounds: {
      north: 40.9990, 
      south: 40.9990, 
      east: 29.0000,
      west: 28.9700
    },
    fee: 0 // Standart ücret
  },
  { 
    name: "Osmangazi Köprüsü", 
    bounds: {
      north: 40.7600, 
      south: 40.7500, 
      east: 29.5200,
      west: 29.5100
    },
    fee: 1500 // Osmangazi Köprüsü için 1500 TL ücret
  }
];

// Özel marker özellikleri için tip tanımı
interface CustomLayer extends L.Layer {
  _bridgeMarker?: boolean;
}


// Nokta tipi (çizgi kesişimleri için)
interface Point {
  x: number;
  lng: number;
  y: number;
  lat: number;
}

const MapComponent = ({ startLocation, endLocation, waypoints, shouldCalculate, mapStyles, onValuesChange }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [detectedBridges, setDetectedBridges] = useState<string[]>([]);
  const controlRef = useRef<L.Control | null>(null);
  
  // Props validation ve mode belirleme
  const isWaypointMode = waypoints && waypoints.length >= 2;
  const isSingleRouteMode = startLocation && endLocation;
  
  // Mode validation
  if (!isWaypointMode && !isSingleRouteMode) {
    console.error("❌ MapComponent: Ya waypoints (min 2) ya da startLocation+endLocation sağlanmalı!");
    return <div className="text-red-500 p-4">Harita için geçerli koordinatlar sağlanmadı.</div>;
  }
  
  // Aktif koordinatları belirle (waypoints öncelikli)
  const activeCoordinates = isWaypointMode 
    ? waypoints! 
    : [
        { lat: startLocation!.lat, lng: startLocation!.lng, name: "Başlangıç" },
        { lat: endLocation!.lat, lng: endLocation!.lng, name: "Bitiş" }
      ];
  
  // Koordinatları x, y (lng, lat) noktasına dönüştür
  const coordToPoint = (lng: number, lat: number): Point => ({
    x: lng,
    lng,
    y: lat,
    lat
  });
  
  // İki çizgi parçasının kesişimini kontrol et
  const doLinesIntersect = (
    p1: Point, p2: Point, // İlk çizgi
    p3: Point, p4: Point  // İkinci çizgi
  ): boolean => {
    // Çizginin eğimi ve y-kesişimi
    const denominator = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
    
    // Çizgiler paralelsa kesişmez
    if (denominator === 0) {
      return false;
    }
    
    const ua = (((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x))) / denominator;
    const ub = (((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x))) / denominator;
    
    // Kesişim noktası her iki çizgi segmentinde de bulunuyorsa
    return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
  }
  
  // Bir çizginin dikdörtgenle kesişimini kontrol et
  const doesLineIntersectRectangle = (
    line: [number, number][],  // [lng, lat] formatında koordinatlar
    bounds: typeof BRIDGES[0]["bounds"] // Köprü sınırları
  ): boolean => {
    // Noktalar dikdörtgenin içindeyse kesişim vardır
    const isPointInRect = (lng: number, lat: number) => {
      return (
        lat <= bounds.north &&
        lat >= bounds.south &&
        lng <= bounds.east &&
        lng >= bounds.west
      );
    };
    
    // Dikdörtgenin kenarları
    const rectEdges = [
      // Sol kenar
      [coordToPoint(bounds.west, bounds.south), coordToPoint(bounds.west, bounds.north)],
      // Üst kenar
      [coordToPoint(bounds.west, bounds.north), coordToPoint(bounds.east, bounds.north)],
      // Sağ kenar
      [coordToPoint(bounds.east, bounds.north), coordToPoint(bounds.east, bounds.south)],
      // Alt kenar
      [coordToPoint(bounds.east, bounds.south), coordToPoint(bounds.west, bounds.south)]
    ];
    
    // Çizgi parçaları
    for (let i = 0; i < line.length - 1; i++) {
      const [lng1, lat1] = line[i];
      const [lng2, lat2] = line[i + 1];
      
      // Çizgi parçasının bir ucu dikdörtgenin içindeyse
      if (isPointInRect(lng1, lat1) || isPointInRect(lng2, lat2)) {
        return true;
      }
      
      const lineSegment = [coordToPoint(lng1, lat1), coordToPoint(lng2, lat2)];
      
      // Çizgi dikdörtgenin herhangi bir kenarını kesiyor mu?
      for (const [rectP1, rectP2] of rectEdges) {
        if (doLinesIntersect(
          lineSegment[0], lineSegment[1], 
          rectP1, rectP2
        )) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Bir çizginin köprüden geçip geçmediğini kontrol et
  const doesLineIntersectBridge = (
    line: [number, number][],  // [lng, lat] formatında koordinatlar
    bridge: typeof BRIDGES[0]
  ) => {
    // Çizgi köprü sınırlarını kesiyor mu?
    if (doesLineIntersectRectangle(line, bridge.bounds)) {
      //console.log(`✅ Köprü tespit edildi: ${bridge.name} - Köprüyü kesen çizgi bulundu!`);
      return true;
    }
    return false;
  };
  
  // GeoJSON rotasındaki koordinatları kontrol ederek köprüleri tespit eder
  const detectBridgesOnRoute = (routeData: any) => {
    //console.log("🔄 Rota verileri alındı, köprü tespiti başlatılıyor...");
    
    if (!routeData || !routeData.features || routeData.features.length === 0) {
      console.warn("⚠️ Rota verisi bulunamadı veya boş!");
      return [];
    }
    
    const foundBridges = new Set<string>();
    
    // Rota verilerindeki tüm çizgileri kontrol et
    routeData.features.forEach((feature: any, featureIndex: number) => {
      if (feature.geometry && feature.geometry.type === 'LineString') {
        const coordinates = feature.geometry.coordinates;
        //console.log(`🔄 LineString bulundu, ${coordinates.length} koordinat içeriyor`);
        
        // Her köprü için çizginin kesişimini kontrol et
        BRIDGES.forEach(bridge => {
          if (doesLineIntersectBridge(coordinates, bridge)) {
            foundBridges.add(bridge.name);
            //console.log(`💡 Rota üzerinde köprü bulundu: ${bridge.name}`);
          }
        });
      }
    });
    
    const bridges = Array.from(foundBridges);
    //console.log(`📊 Tespit edilen köprüler (${bridges.length}):`, bridges);
    
    // Köprü tespit edilemediyse, boğaz geçişi olan rotalar için uyarı göster
    if (bridges.length === 0) {
      //console.warn("⚠️ Rota üzerinde köprü tespit edilemedi!");
      
      // Rota İstanbul'un iki yakası arasında mı kontrol et
      const isEuropeanSide = (lng: number) => lng < 29.00; // Yaklaşık olarak boğazın batısı
      
      const firstCoord = activeCoordinates[0];
      const lastCoord = activeCoordinates[activeCoordinates.length - 1];
      
      const startIsEuropean = isEuropeanSide(firstCoord.lng);
      const endIsEuropean = isEuropeanSide(lastCoord.lng);
      
      if (startIsEuropean !== endIsEuropean) {
        console.warn("🌉 Rota, boğazın iki yakası arasında geçiş içeriyor ama köprü tespit edilemedi!");
        
        // Boğaz geçişi olan rotalar için manuel köprü tespiti
        const possibleBridge = determinePossibleBridge(firstCoord, lastCoord);
        if (possibleBridge) {
          //console.log(`🌉 Manuel tespit: Muhtemelen ${possibleBridge} kullanılıyor`);
          bridges.push(`${possibleBridge} (tahmini)`);
        }
      }
    }
    
    // Rotada kullanılan köprüleri boğaz geçişine göre görselleştir
    if (mapRef.current) {
      drawBridgesOnMap(bridges);
    }
    
    return bridges;
  };
  
  // Köprüleri haritada görselleştir
  const drawBridgesOnMap = (bridgeNames: string[]) => {
    if (!mapRef.current) return;
    
    // Eski köprü katmanlarını temizle
    mapRef.current.eachLayer((layer: CustomLayer) => {
      if (layer._bridgeMarker && mapRef.current) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    // Tespit edilen köprüleri haritada göster
    bridgeNames.forEach(bridgeName => {
      const bridge = BRIDGES.find(b => b.name === bridgeName || bridgeName.includes(b.name));
      if (bridge && mapRef.current) {
        const center = {
          lat: (bridge.bounds.north + bridge.bounds.south) / 2,
          lng: (bridge.bounds.east + bridge.bounds.west) / 2
        };
        
        // Köprü alanını dikdörtgen olarak göstermeyi kaldır
        
        // Köprü ikonunu göster
        const bridgeIcon = L.divIcon({
          html: '🌉',
          className: 'bridge-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        const marker = L.marker([center.lat, center.lng], {
          icon: bridgeIcon
        }).addTo(mapRef.current);
        
        marker.bindPopup(`<b>${bridge.name}</b>`);
        (marker as CustomLayer)._bridgeMarker = true;
      }
    });
  };
  
  // Başlangıç ve bitiş noktalarına göre hangi köprünün kullanılabileceğini tahmin eder
  const determinePossibleBridge = (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    // Başlangıç ve bitiş noktalarının kuzey-güney konumlarına göre hangi köprünün daha uygun olduğunu belirliyoruz
    const northernMost = Math.max(start.lat, end.lat);
    
    // Kuzeyde ise Yavuz Sultan Selim veya FSM Köprüsü
    if (northernMost > 41.08) {
      if (northernMost > 41.15) {
        return "Yavuz Sultan Selim Köprüsü";
      }
      return "Fatih Sultan Mehmet Köprüsü";
    }
    
    // Orta bölgede ise 15 Temmuz Şehitler (Boğaziçi) Köprüsü
    if (northernMost > 40.99) {
      return "15 Temmuz Şehitler Köprüsü (Boğaziçi Köprüsü)";
    }
    
    // Güneyde ise Avrasya Tüneli veya Marmaray
    return "Avrasya Tüneli veya Marmaray";
  };
  
  // İki noktanın aynı yakada olup olmadığını kontrol et
  const isOnSameSide = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): boolean => {
    const isEuropeanSide = (lng: number) => lng < 29.00; // Yaklaşık olarak boğazın batısı
    return isEuropeanSide(point1.lng) === isEuropeanSide(point2.lng);
  };

  // Bir noktanın İstanbul sınırları içinde olup olmadığını kontrol et
  const isWithinIstanbul = (point: { lat: number; lng: number }): boolean => {
    // Geniş bir İstanbul sınırlayıcı kutusu
    const istanbulBounds = {
      north: 41.5,
      south: 40.8,
      east: 29.9,
      west: 28.0,
    };
    return (
      point.lat <= istanbulBounds.north &&
      point.lat >= istanbulBounds.south &&
      point.lng <= istanbulBounds.east &&
      point.lng >= istanbulBounds.west
    );
  };

  const calculateMultiSegmentRoute = async (coordinates: typeof activeCoordinates) => {
    if (!mapRef.current) {
      console.error("❌ Harita referansı bulunamadı!");
      return;
    }
    
    // Önceki rotayı temizle
    if (route) {
      mapRef.current.removeLayer(route);
    }
    
    // Önceki kontrolü kaldır
    if (controlRef.current) {
      mapRef.current.removeControl(controlRef.current);
      controlRef.current = null;
    }

    // Tüm markerleri temizle (köprü markerleri hariç)
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const markerLayer = layer as CustomLayer;
        if (!markerLayer._bridgeMarker && mapRef.current) {
          mapRef.current.removeLayer(layer);
        }
      }
    });

    coordinates.forEach((coord, index) => {
      if (mapRef.current) {
        const markerIcon = L.divIcon({
          html: `<div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">${index + 1}</div>`,
          className: 'waypoint-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        
        const marker = L.marker([coord.lat, coord.lng], { icon: markerIcon }).addTo(mapRef.current);
        marker.bindPopup(`<b>${coord.name || `Durak ${index + 1}`}</b>`);
        
        // Popup'ları otomatik açma - sadece tıklayınca açılsın
        // if (index === 0) marker.openPopup();
      }
    });
    
    // FSM Köprüsü koordinatları
    const fsmBridge = BRIDGES[1]; // Fatih Sultan Mehmet Köprüsü
    const bridgeCenter = {
      lat: (fsmBridge.bounds.north + fsmBridge.bounds.south) / 2,
      lng: (fsmBridge.bounds.east + fsmBridge.bounds.west) / 2
    };
    
    // Segmentleri oluştur
    const segments = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      // Sadece İstanbul içi ve iki yaka arası geçişlerde FSM'yi zorunlu kıl
      if (isWithinIstanbul(start) && isWithinIstanbul(end) && !isOnSameSide(start, end)) {
        // Farklı yakadaysa FSM Köprüsü üzerinden geçir
        segments.push([
          [start.lng, start.lat],
          [bridgeCenter.lng, bridgeCenter.lat]
        ]);
        segments.push([
          [bridgeCenter.lng, bridgeCenter.lat],
          [end.lng, end.lat]
        ]);
      } else {
        // Diğer tüm durumlar için direkt bağla
        segments.push([
          [start.lng, start.lat],
          [end.lng, end.lat]
        ]);
      }
    }
    
    let totalDistance = 0;
    let totalDuration = 0;
    const allRouteData = [];
    const allBridges = new Set<string>();
    let wayPointsKm2: number[] = [];
    
    try {
      // Her segment için rota hesapla
      for (let i = 0; i < segments.length; i++) {
        const routeRequest = {
          coordinates: segments[i],
          format: "geojson",
        };
        
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
          method: "POST",
          headers: {
            Authorization: "5b3ce3597851110001cf62484f7095854058404ead4a446b369ac2bc",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(routeRequest),
        });
        
        if (!response.ok) {
          throw new Error(`Segment ${i + 1} için API hatası: ${response.status}`);
        }
        
        const segmentData = await response.json();
        
        // Segment bilgilerini topla
        const segmentDistance = segmentData.features[0].properties.segments[0].distance;
        const segmentDuration = segmentData.features[0].properties.segments[0].duration;
        
        const segmentKm = Math.round(segmentDistance / 1000);
        wayPointsKm2.push(segmentKm);
        
        totalDistance += segmentDistance;
        totalDuration += segmentDuration;
        allRouteData.push(segmentData);
        
        // Bu segment için köprüleri tespit et
        const segmentBridges = detectBridgesOnRoute(segmentData);
        
        // Eğer 1., 3. köprü veya Avrasya tespit edilirse, rotayı FSM'den geçir
        // Bu mantık sadece İstanbul içi rotalar için geçerli olmalı
        const startPoint = { lat: segments[i][0][1], lng: segments[i][0][0] };
        const endPoint = { lat: segments[i][segments[i].length - 1][1], lng: segments[i][segments[i].length - 1][0] };

        const hasUnwantedBridge = segmentBridges.some(bridge => 
          bridge.includes("Boğaziçi") || 
          bridge.includes("Yavuz Sultan Selim") || 
          bridge.includes("Avrasya")
        );
        
        if (isWithinIstanbul(startPoint) && isWithinIstanbul(endPoint) && hasUnwantedBridge) {
          // Mevcut segmenti temizle
          allRouteData.pop();
          wayPointsKm2.pop();
          totalDistance -= segmentDistance;
          totalDuration -= segmentDuration;
          
          // FSM üzerinden yeni rota hesapla
          const fsmRouteRequest = {
            coordinates: [
              [segments[i][0][0], segments[i][0][1]],
              [bridgeCenter.lng, bridgeCenter.lat],
              [segments[i][1][0], segments[i][1][1]]
            ],
            format: "geojson",
          };
          
          const fsmResponse = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
            method: "POST",
            headers: {
              Authorization: "5b3ce3597851110001cf62484f7095854058404ead4a446b369ac2bc",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fsmRouteRequest),
          });
          
          if (!fsmResponse.ok) {
            throw new Error(`FSM Rota için API hatası: ${fsmResponse.status}`);
          }
          
          const fsmData = await fsmResponse.json();
          allRouteData.push(fsmData);
          
          const fsmDistance = fsmData.features[0].properties.segments.reduce((acc: number, seg: any) => acc + seg.distance, 0);
          const fsmDuration = fsmData.features[0].properties.segments.reduce((acc: number, seg: any) => acc + seg.duration, 0);
          
          wayPointsKm2.push(Math.round(fsmDistance / 1000));
          totalDistance += fsmDistance;
          totalDuration += fsmDuration;
          
          // FSM'yi köprü listesine ekle
          allBridges.add("Fatih Sultan Mehmet Köprüsü");
        } else {
          segmentBridges.forEach(bridge => allBridges.add(bridge));
        }
      }
      
      // Parent component'e toplam değerleri bildir
      const totalBridgeFees = Array.from(allBridges).reduce((total, bridgeName) => {
        const bridge = BRIDGES.find(b => b.name === bridgeName);
        return total + (bridge?.fee || 0);
      }, 0);
      
      onValuesChange(Math.round(totalDistance / 1000), Math.round(totalDuration / 60), wayPointsKm2, Array.from(allBridges), totalBridgeFees);
      
      // Tüm köprüleri güncelle
      const bridgeList = Array.from(allBridges);
      setDetectedBridges(bridgeList);
      
      // Tüm segment rotalarını haritaya ekle
      const combinedRoute = L.layerGroup();
      
      allRouteData.forEach((segmentData) => {
        const segmentRoute = L.geoJSON(segmentData, {
          style: {
            color: "#2563eb", // Tek renk - mavi
            weight: 6,
            opacity: 0.8,
            lineJoin: "round",
            lineCap: "round"
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.segments) {
              const totalDistance = Math.round(feature.properties.segments.reduce((acc: number, seg: any) => acc + seg.distance, 0) / 1000);
              const totalDuration = Math.round(feature.properties.segments.reduce((acc: number, seg: any) => acc + seg.duration, 0) / 60);
              layer.bindPopup(`<b>Toplam Mesafe:</b> ${totalDistance}km<br/><b>Toplam Süre:</b> ${totalDuration}dk`);
            }
          }
        });
        combinedRoute.addLayer(segmentRoute);
      });
      
      combinedRoute.addTo(mapRef.current);
      setRoute(combinedRoute);
      
      // Tüm rotayı haritada göstermek için sınırlara yakınlaştır
      const allPoints = coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
      const bounds = L.latLngBounds(allPoints);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      
    } catch (error) {
      console.error("❌ Rota hesaplanırken bir hata oluştu:", error);
      alert("Rota hesaplanırken bir hata oluştu. Lütfen koordinatları kontrol edin.");
    }
  };
  
  // Yeni rota hesaplamak için
  const calculateRoute = () => {
    if(isSingleRouteMode) {
      while(activeCoordinates.length > 0) {
        activeCoordinates.pop();
      }
      activeCoordinates.push({lat: startLocation!.lat, lng: startLocation!.lng, name: "Başlangıç"});
      activeCoordinates.push({lat: endLocation!.lat, lng: endLocation!.lng, name: "Bitiş"});
    } 
    //console.log("🔄 activeCoordinates:", activeCoordinates);
    return calculateMultiSegmentRoute(activeCoordinates);
  };
  
  // Her shouldCalculate değişiminde rotayı hesapla
  useEffect(() => {
    if (mapRef.current) {
      //console.log("🔄 shouldCalculate değişti, rota yeniden hesaplanıyor...");
      calculateRoute();
    }
  }, [shouldCalculate, JSON.stringify(activeCoordinates)]);
  
  useEffect(() => {
    if (mapRef.current !== null) return;
    
    // Başlangıçta haritayı oluştur
    //console.log("🗺️ Harita başlatılıyor...");
    const firstCoord = activeCoordinates[0];
    const map = L.map("map").setView([firstCoord.lat, firstCoord.lng], 13);
    mapRef.current = map;
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //console.log("✅ Harita başlatıldı, ilk rota hesaplanıyor...");
    // İlk rotayı hesapla
    calculateRoute();
      
    // Temizleme işlevi
    return () => {
      //console.log("🧹 Harita temizleniyor...");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div 
        id="map" 
        className="w-full h-full rounded-lg shadow-md"
        style={{
          width: mapStyles?.width || '100%',
          height: mapStyles?.height || '100%',
          borderRadius: mapStyles?.borderRadius || '',
          border: mapStyles?.border || '',
        }}
      ></div>
    
    </div>
  );
};

export default MapComponent; 