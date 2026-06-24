import type { GeoLocation } from "../types/user";

const cities = [
  { city: "Shanghai", latitude: 31.2304, longitude: 121.4737 },
  { city: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { city: "Seoul", latitude: 37.5665, longitude: 126.978 },
  { city: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { city: "Paris", latitude: 48.8566, longitude: 2.3522 },
  { city: "Berlin", latitude: 52.52, longitude: 13.405 },
  { city: "London", latitude: 51.5072, longitude: -0.1276 },
  { city: "New York", latitude: 40.7128, longitude: -74.006 },
  { city: "San Francisco", latitude: 37.7749, longitude: -122.4194 },
  { city: "Sao Paulo", latitude: -23.5558, longitude: -46.6396 },
  { city: "Sydney", latitude: -33.8688, longitude: 151.2093 },
  { city: "Cape Town", latitude: -33.9249, longitude: 18.4241 },
];

export const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const randomGeo = (seed: number): GeoLocation => {
  const base = cities[Math.floor(seededRandom(seed) * cities.length)];
  return {
    city: base.city,
    latitude: Number((base.latitude + (seededRandom(seed + 11) - 0.5) * 12).toFixed(4)),
    longitude: Number((base.longitude + (seededRandom(seed + 23) - 0.5) * 18).toFixed(4)),
  };
};
