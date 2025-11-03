import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FilterIcon } from 'lucide-react';
import { mockInstructors } from '../data/mockInstructors.ts';
import { InstructorCard } from '../components/InstructorCard.tsx';
import { FilterModal, FilterState } from '../components/FilterModal.tsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097132.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
export const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    address: 'New York, NY',
    distance: 10,
    transmission: 'All'
  });
  const filteredInstructors = mockInstructors.filter(instructor => {
    if (filters.transmission === 'All') return true;
    return instructor.transmission === filters.transmission;
  });
  return <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">
          {filteredInstructors.length} Instructors Found
        </h1>
        <button onClick={() => setFilterOpen(true)} className="p-2">
          <FilterIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      {/* Map (50%) */}
      <div className="h-1/2 relative">
        <MapContainer center={[40.7128, -74.006]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredInstructors.map(instructor => <Marker key={instructor.id} position={[instructor.location.lat, instructor.location.lng]} icon={carIcon} />)}
        </MapContainer>
      </div>
      {/* Instructor List (50%) */}
      <div className="h-1/2 overflow-y-auto p-4">
        {filteredInstructors.map(instructor => <InstructorCard key={instructor.id} instructor={instructor} onClick={() => navigate(`/instructor/${instructor.id}`)} />)}
      </div>
      <FilterModal isOpen={filterOpen} onClose={() => setFilterOpen(false)} onApply={setFilters} />
    </div>;
};
