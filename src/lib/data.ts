export type Property = {
  id: string;
  name: string;
  location: string;
  value: number;
};

export type CommercialProperty = Property & {
  occupancyRate: number;
};

export type ResidentialProperty = Property & {
  units: number;
};

export type HotelProperty = Property & {
  starRating: number;
  rooms: number;
};

export type BankBranch = Property & {
  transactionVolume: number; // monthly
  employees: number;
};

export const commercialData: CommercialProperty[] = [
  { id: 'C001', name: 'Alpha Tower', location: 'Metropolis', value: 15000000, occupancyRate: 0.95 },
  { id: 'C002', name: 'Beta Plaza', location: 'Metropolis', value: 12500000, occupancyRate: 0.88 },
  { id: 'C003', name: 'Gamma Complex', location: 'Star City', value: 25000000, occupancyRate: 0.98 },
];

export const residentialData: ResidentialProperty[] = [
  { id: 'R001', name: 'The Grand Apartments', location: 'Metropolis', value: 20000000, units: 250 },
  { id: 'R002', name: 'Sunset Villas', location: 'Star City', value: 35000000, units: 50 },
  { id: 'R003', name: 'Lakeside Homes', location: 'Metropolis', value: 18000000, units: 120 },
];

export const hotelData: HotelProperty[] = [
  { id: 'H001', name: 'The Royal Hotel', location: 'Metropolis', value: 50000000, starRating: 5, rooms: 500 },
  { id: 'H002', name: 'City Inn', location: 'Star City', value: 22000000, starRating: 4, rooms: 300 },
];

export const bankBranchData: BankBranch[] = [
  { id: 'B001', name: 'Central Bank - Downtown', location: 'Metropolis', value: 5000000, transactionVolume: 120000, employees: 50 },
  { id: 'B002', name: 'First National - Uptown', location: 'Star City', value: 3500000, transactionVolume: 85000, employees: 35 },
  { id: 'B003', name: 'People\'s Bank - Westside', location: 'Metropolis', value: 4200000, transactionVolume: 95000, employees: 42 },
];

export const allData = {
  commercial: commercialData,
  residential: residentialData,
  hotel: hotelData,
  bank: bankBranchData,
};
