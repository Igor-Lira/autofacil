import React from 'react';
import { StarIcon, CarIcon, CalendarIcon } from 'lucide-react';
import { Instructor } from '../data/mockInstructors';
interface InstructorCardProps {
  instructor: Instructor;
  onClick: () => void;
}
export const InstructorCard: React.FC<InstructorCardProps> = ({
  instructor,
  onClick
}) => {
  return <div onClick={onClick} className="bg-white rounded-xl shadow-md p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex gap-3">
        <img src={instructor.photo} alt={instructor.name} className="w-20 h-20 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{instructor.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <StarIcon className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-primary">
              {instructor.rating}
            </span>
            <span className="text-sm text-gray-500">
              ({instructor.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <CarIcon className="w-4 h-4" />
            <span>{instructor.carModel}</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {instructor.transmission}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <CalendarIcon className="w-4 h-4" />
          <span>{instructor.nextAvailable}</span>
        </div>
      </div>
    </div>;
};