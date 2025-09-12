import L from 'leaflet';
import './icons.css';

// Önceden tanımlanmış kategori renkleri
const categoryColorMap = {
  'Historic Site': '#c0392b', // Kırmızı
  'Government Building': '#2980b9', // Mavi
  'Park': '#27ae60', // Yeşil
  'Transport': '#f39c12', // Turuncu
  'Landmark': '#8e44ad', // Mor
};

const defaultColor = '#7f8c8d'; // Gri

// Kategoriye göre özel bir DivIcon oluşturan fonksiyon
export const createCategoryIcon = (category) => {
  const color = categoryColorMap[category] || defaultColor;

  // Leaflet'in DivIcon'unu kullanarak özel HTML tabanlı bir ikon oluşturuyoruz.
  // Bu ikon, rengi dinamik olarak ayarlanmış bir CSS sınıfı kullanır.
  const iconHtml = `<div class="marker-pin" style="background-color: ${color}"></div>`;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon', // CSS'te hedeflemek için genel bir sınıf
    iconSize: [30, 42], // İkonun boyutu [genişlik, yükseklik]
    iconAnchor: [15, 42], // İkonun "ucunun" haritadaki konuma denk geleceği nokta
    popupAnchor: [0, -35] // Popup'ın ikona göre nerede açılacağı
  });
};