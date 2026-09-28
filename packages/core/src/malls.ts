export interface Mall {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  image: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  address: string;
  phone: string;
  website: string;
  closedDates?: string[];
}

export const malls: Mall[] = [
  {
    id: "pmc-pune",
    name: "Phoenix Marketcity Pune",
    country: "India",
    city: "Pune",
    latitude: 18.5615,
    longitude: 73.9167,
    image:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=85",
    openingTime: "10:00",
    closingTime: "22:00",
    timezone: "Asia/Kolkata",
    address: "S No. 207, Viman Nagar, Pune, Maharashtra 411014",
    phone: "+91 20 6689 0000",
    website: "https://www.phoenixmarketcity.com/pune",
  },
  {
    id: "pmc-mumbai",
    name: "Phoenix Marketcity Mumbai",
    country: "India",
    city: "Mumbai",
    latitude: 19.086,
    longitude: 72.889,
    image:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=85",
    openingTime: "11:00",
    closingTime: "23:00",
    timezone: "Asia/Kolkata",
    address: "Lal Bahadur Shastri Marg, Kurla West, Mumbai, Maharashtra 400070",
    phone: "+91 22 6180 1111",
    website: "https://www.phoenixmarketcity.com/mumbai",
  },
  {
    id: "palladium-mumbai",
    name: "Phoenix Palladium Mumbai",
    country: "India",
    city: "Mumbai",
    latitude: 19.0048,
    longitude: 72.8258,
    image:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=85",
    openingTime: "11:00",
    closingTime: "22:00",
    timezone: "Asia/Kolkata",
    address: "462 Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013",
    phone: "+91 22 4333 3333",
    website: "https://www.phoenixpalladium.com/",
  },
];

export const countries = Array.from(new Set(malls.map((mall) => mall.country)));
