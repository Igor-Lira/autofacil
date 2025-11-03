import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, CarIcon, MapPinIcon, CheckCircleIcon } from 'lucide-react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { mockInstructors } from '../data/mockInstructors';
import 'leaflet/dist/leaflet.css';
export const InstructorProfile: React.FC = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const instructor = mockInstructors.find(i => i.id === id);
  if (!instructor) {
    return <div>Instructor not found</div>;
  }
  return <div className="min-h-screen w-full bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64">
        <img src={instructor.photo} alt={instructor.name} className="w-full h-full object-cover" />
        <button onClick={() => navigate('/search')} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>
      {/* Content */}
      <div className="px-4 pb-24">
        {/* Name and Rating */}
        <div className="bg-white rounded-xl shadow-md p-6 -mt-8 relative z-10">
          <h1 className="text-2xl font-bold mb-2">{instructor.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.floor(instructor.rating) ? 'fill-primary text-primary' : 'text-gray-300'}`} />)}
            </div>
            <span className="text-lg font-semibold text-primary">
              {instructor.rating}
            </span>
            <span className="text-gray-500">
              ({instructor.reviewCount} reviews)
            </span>
          </div>
          <p className="text-gray-600 mb-4">{instructor.bio}</p>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">
              Member since {instructor.memberSince}
            </span>
          </div>
        </div>
        {/* Car Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-primary" />
            Vehicle Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Model</span>
              <span className="font-medium">{instructor.carModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transmission</span>
              <span className="font-medium">{instructor.transmission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hourly Rate</span>
              <span className="font-medium text-primary">
                ${instructor.hourlyRate}/hr
              </span>
            </div>
          </div>
        </div>
        {/* Qualifications */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4">Qualifications</h2>
          <div className="space-y-3">
            {instructor.qualifications.map((qual, index) => <div key={index} className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-700">{qual}</span>
              </div>)}
          </div>
        </div>
        {/* Location Map */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-primary" />
            Operating Area
          </h2>
          <div className="h-48 rounded-lg overflow-hidden">
            <MapContainer center={[instructor.location.lat, instructor.location.lng]} zoom={12} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle center={[instructor.location.lat, instructor.location.lng]} radius={3000} pathOptions={{
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }} />
            </MapContainer>
          </div>
        </div>
      </div>
      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
        <button onClick={() => navigate(`/booking/${instructor.id}`)} className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-dark transition-colors">
          Book with {instructor.name}
        </button>
      </div>
    </div>;
};