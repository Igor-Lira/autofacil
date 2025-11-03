import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { InstructorProfile } from './pages/InstructorProfile';
import { Booking } from './pages/Booking';
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