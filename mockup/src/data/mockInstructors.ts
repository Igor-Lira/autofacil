export interface Instructor {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviewCount: number;
  carModel: string;
  transmission: 'Automatic' | 'Manual';
  nextAvailable: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  memberSince: string;
  qualifications: string[];
  hourlyRate: number;
  bio: string;
}
export const mockInstructors: Instructor[] = [{
  id: '1',
  name: 'Maria Santos',
  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  rating: 4.9,
  reviewCount: 127,
  carModel: 'Honda Civic 2022',
  transmission: 'Automatic',
  nextAvailable: 'Tomorrow at 2:00 PM',
  location: {
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY'
  },
  memberSince: '2021',
  qualifications: ['State Certified Instructor', '15 Years Experience', 'Defensive Driving Specialist'],
  hourlyRate: 65,
  bio: 'Patient and experienced instructor specializing in nervous beginners.'
}, {
  id: '2',
  name: 'John Miller',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  rating: 4.8,
  reviewCount: 89,
  carModel: 'Toyota Corolla 2023',
  transmission: 'Manual',
  nextAvailable: 'Today at 4:30 PM',
  location: {
    lat: 40.718,
    lng: -74.01,
    address: '456 Park Ave, New York, NY'
  },
  memberSince: '2019',
  qualifications: ['State Certified Instructor', '20 Years Experience', 'Manual Transmission Expert'],
  hourlyRate: 70,
  bio: 'Specializing in manual transmission and advanced driving techniques.'
}, {
  id: '3',
  name: 'Sarah Johnson',
  photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  rating: 5.0,
  reviewCount: 156,
  carModel: 'Mazda 3 2023',
  transmission: 'Automatic',
  nextAvailable: 'Friday at 10:00 AM',
  location: {
    lat: 40.708,
    lng: -74.002,
    address: '789 Broadway, New York, NY'
  },
  memberSince: '2020',
  qualifications: ['State Certified Instructor', '12 Years Experience', 'Teen Driving Specialist'],
  hourlyRate: 60,
  bio: 'Friendly instructor with a focus on building confidence in new drivers.'
}];