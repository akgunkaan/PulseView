import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ImageOverlay } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import FilterControl from './FilterControl';
import { createCategoryIcon } from './icons';
import ChangeAnalysisPanel from './ChangeAnalysisPanel';
import AnalysisResultPanel from './AnalysisResultPanel';

// Fix for default marker icon issue with webpack
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function AddSpotForm({ position, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !category) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    onAdd({ name, category, latitude: position.lat, longitude: position.lng });
  };

  return (
    <Popup>
      <form onSubmit={handleSubmit} className="add-spot-form">
        <h4>Yeni Nokta Ekle</h4>
        <label>
          İsim:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Kategori:
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>
        <button type="submit">Ekle</button>
      </form>
    </Popup>
  );
}

function AddSpotMarker() {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  // Bu bileşen, yeni nokta ekleme formunu içeren geçici bir Marker döndürür.
  // Form gönderildiğinde veya başka bir yere tıklandığında kaybolacaktır.
  return position === null ? null : <Marker position={position} />;
}

function App() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mapRef = React.useRef();

  // Define fixed bounds for the image overlay, centered around Berlin
  const imageBounds = [
    [52.50, 13.35], // Southwest corner
    [52.54, 13.45], // Northeast corner
  ];
  const [newSpotPosition, setNewSpotPosition] = useState(null);
  const position = [52.52, 13.40]; // Berlin coordinates

  useEffect(() => {
    setLoading(true);
    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/v1/spots`;
    axios.get(apiUrl)
      .then(response => {
        const fetchedSpots = response.data;
        // Veriden benzersiz kategorileri çıkar
        const uniqueCategories = [...new Set(fetchedSpots.map(spot => spot.category))];
        setCategories(uniqueCategories);
        // Başlangıçta tüm kategorileri seçili yap
        setSelectedCategories(uniqueCategories);
        setSpots(response.data);
        setError(null);
      })
      .catch(error => {
        console.error("Veri çekilirken hata oluştu: ", error);
        setError("Veri yüklenirken bir hata oluştu.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddSpot = (spotData) => {
    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/v1/spots`;
    axios.post(apiUrl, spotData)
      .then(response => {
        const newSpot = response.data;
        setSpots(prevSpots => [...prevSpots, newSpot]);
        // Yeni kategori varsa filtre listesine ekle
        if (!categories.includes(newSpot.category)) {
          setCategories(prev => [...prev, newSpot.category]);
          setSelectedCategories(prev => [...prev, newSpot.category]);
        }
        setNewSpotPosition(null); // Formu kapat
      })
      .catch(err => {
        console.error("Yeni nokta eklenirken hata oluştu:", err);
        setError("Yeni nokta eklenemedi. Lütfen tekrar deneyin.");
      });
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => setNewSpotPosition(e.latlng),
    });
    return null;
  };
  const filteredSpots = spots.filter(spot =>
    selectedCategories.includes(spot.category) || selectedCategories.length === 0
  );

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalysisComplete = (data) => {
    const { caption, change_mask } = data;
    if (data.error) {
      setError(data.error);
      return;
    }
    
    // Create a data URL from the change mask to display as an overlay
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 256; // Assuming mask is 256x256
    canvas.width = size;
    canvas.height = size;
    const imageData = ctx.createImageData(size, size);

    // The change_mask is a flattened 1D array from a 2D tensor (e.g., 256x256)
    // We need to reconstruct the 2D structure.
    const maskSize = Math.sqrt(change_mask.length);
    for (let i = 0; i < change_mask.length; i++) {
        const pixelIndex = i * 4;
        if (change_mask[i] > 0) {
          imageData.data[pixelIndex] = 255; // Red
          imageData.data[pixelIndex + 3] = 150; // Alpha
        }
    }
    ctx.putImageData(imageData, 0, 0);

    setAnalysisResult({ caption, maskUrl: canvas.toDataURL() });
  };

  const handleClearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  if (loading && spots.length === 0) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <>
      <ChangeAnalysisPanel
        onAnalysisStart={handleAnalysisStart}
        onAnalysisComplete={handleAnalysisComplete}
        onError={setError}
      />
      <MapContainer ref={mapRef} center={position} zoom={12} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        {filteredSpots.map(spot => (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={createCategoryIcon(spot.category)}>
            <Popup><b>{spot.name}</b><br />{spot.category}</Popup>
          </Marker>
        ))}
        {newSpotPosition && (
          <Marker position={newSpotPosition}>
            <AddSpotForm position={newSpotPosition} onAdd={handleAddSpot} />
          </Marker>
        )}
        {analysisResult && analysisResult.maskUrl && (
          <ImageOverlay
            url={analysisResult.maskUrl}
            bounds={imageBounds} // Use fixed geographical bounds
            opacity={0.7}
          />
        )}
      </MapContainer>
      <FilterControl
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />
      <AnalysisResultPanel
        caption={analysisResult?.caption}
        onClear={handleClearAnalysis}
      />
    </>
  );
}

export default App;