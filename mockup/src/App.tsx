import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home.tsx';
import { SearchResults } from './pages/SearchResults.tsx';
import { InstructorProfile } from './pages/InstructorProfile.tsx';
import { Booking } from './pages/Booking.tsx';
export function App() {
  return <div className="w-full min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/instructor/:id" element={<InstructorProfile />} />
        <Route path="/booking/:id" element={<Booking />} />
      </Routes>
    </div>;
}
