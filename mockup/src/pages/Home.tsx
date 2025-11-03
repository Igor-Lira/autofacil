import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPinIcon, FilterIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockInstructors } from '../data/mockInstructors.ts';
import { FilterModal, FilterState } from '../components/FilterModal.tsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097132.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    address: 'New York, NY',
    distance: 10,
    transmission: 'All'
  });
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  return <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">AutoFacil</h1>
          <button onClick={() => setFilterOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FilterIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPinIcon className="w-5 h-5 text-primary" />
          <span className="text-sm">{filters.address}</span>
        </div>
      </div>
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[40.7128, -74.006]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
          {mockInstructors.map(instructor => <Marker key={instructor.id} position={[instructor.location.lat, instructor.location.lng]} icon={carIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{instructor.name}</p>
                  <p className="text-sm text-gray-600">{instructor.carModel}</p>
                  <button onClick={() => navigate('/search')} className="mt-2 text-primary text-sm font-medium">
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>)}
        </MapContainer>
      </div>
      {/* CTA Button */}
      <div className="p-4 bg-white shadow-lg">
        <button onClick={() => navigate('/search')} className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-dark transition-colors">
          Book a Class
        </button>
      </div>
      <FilterModal isOpen={filterOpen} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} />
    </div>;
};
