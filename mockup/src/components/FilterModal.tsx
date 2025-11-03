import React, { useState } from 'react';
import { XIcon, MapPinIcon } from 'lucide-react';
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}
export interface FilterState {
  address: string;
  distance: number;
  transmission: 'All' | 'Automatic' | 'Manual';
}
export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [filters, setFilters] = useState<FilterState>({
    address: '',
    distance: 10,
    transmission: 'All'
  });
  if (!isOpen) return null;
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Filter Instructors</h2>
          <button onClick={onClose} className="p-2">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Address
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" value={filters.address} onChange={e => setFilters({
              ...filters,
              address: e.target.value
            })} placeholder="Enter your address" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Distance Radius: {filters.distance} miles
            </label>
            <input type="range" min="1" max="50" value={filters.distance} onChange={e => setFilters({
            ...filters,
            distance: Number(e.target.value)
          })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Transmission Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['All', 'Automatic', 'Manual'] as const).map(type => <button key={type} onClick={() => setFilters({
              ...filters,
              transmission: type
            })} className={`py-3 px-4 rounded-lg font-medium transition-colors ${filters.transmission === type ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {type}
                </button>)}
            </div>
          </div>
        </div>
        <button onClick={handleApply} className="w-full mt-8 bg-primary text-white py-4 rounded-lg font-semibold shadow-lg hover:bg-primary-dark transition-colors">
          Apply Filters
        </button>
      </div>
    </div>;
};