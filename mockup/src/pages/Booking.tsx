import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import { mockInstructors } from '../data/mockInstructors.ts';
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const availableDates = [{
  date: '2024-01-15',
  available: true
}, {
  date: '2024-01-16',
  available: true
}, {
  date: '2024-01-17',
  available: false
}, {
  date: '2024-01-18',
  available: true
}, {
  date: '2024-01-19',
  available: true
}, {
  date: '2024-01-20',
  available: false
}, {
  date: '2024-01-21',
  available: true
}];
export const Booking: React.FC = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const instructor = mockInstructors.find(i => i.id === id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  if (!instructor) {
    return <div>Instructor not found</div>;
  }
  const handleConfirm = () => {
    setConfirmed(true);
  };
  if (confirmed) {
    return <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your lesson with {instructor.name} is scheduled for {selectedDate}{' '}
            at {selectedTime}
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            Back to Home
          </button>
        </div>
      </div>;
  }
  return <div className="min-h-screen w-full bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-4">
        <button onClick={() => navigate(`/instructor/${id}`)} className="p-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Book a Lesson</h1>
          <p className="text-sm text-gray-600">with {instructor.name}</p>
        </div>
      </div>
      <div className="p-4">
        {/* Date Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Select Date
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', {
              weekday: 'short'
            });
            const dayNum = date.getDate();
            return <button key={day.date} onClick={() => day.available && setSelectedDate(day.date)} disabled={!day.available} className={`p-3 rounded-lg text-center transition-colors ${!day.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : selectedDate === day.date ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="text-xs">{dayName}</div>
                  <div className="text-lg font-semibold">{dayNum}</div>
                </button>;
          })}
          </div>
        </div>
        {/* Time Selection */}
        {selectedDate && <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-primary" />
              Select Time
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map(time => <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 px-4 rounded-lg font-medium transition-colors ${selectedTime === time ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {time}
                </button>)}
            </div>
          </div>}
        {/* Booking Summary */}
        {selectedDate && selectedTime && <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Instructor</span>
                <span className="font-medium">{instructor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-primary text-xl">
                  ${instructor.hourlyRate}
                </span>
              </div>
            </div>
          </div>}
      </div>
      {/* Fixed Confirm Button */}
      {selectedDate && selectedTime && <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
          <button onClick={handleConfirm} className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-dark transition-colors">
            Confirm Booking
          </button>
        </div>}
    </div>;
};
