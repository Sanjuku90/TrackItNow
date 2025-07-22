export const deviceData = {
  android: [
    'Galaxy S23',
    'Galaxy S22', 
    'Galaxy Note 20',
    'Pixel 7 Pro',
    'Pixel 6',
    'Xiaomi Redmi Note 12',
    'OnePlus 11',
    'Huawei P50'
  ],
  ios: [
    'iPhone 14 Pro Max',
    'iPhone 14 Pro', 
    'iPhone 14',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone SE 2022',
    'iPhone 12'
  ]
};

export type Platform = 'android' | 'ios' | '';

export interface DeviceInfo {
  battery: string;
  network: string;
  lockStatus: string;
  location: {
    city: string;
    coordinates: [number, number];
  };
}

// Lomé coordinates range: Latitude 6.10-6.18, Longitude 1.20-1.25
export const generateLomeLocation = () => {
  const lat = 6.10 + Math.random() * 0.08; // Random between 6.10 and 6.18
  const lng = 1.20 + Math.random() * 0.05; // Random between 1.20 and 1.25
  return [lat, lng] as [number, number];
};

export const mockDeviceInfo: DeviceInfo = {
  battery: '36%',
  network: 'MTN 4G',
  lockStatus: 'Locked',
  location: {
    city: 'Lomé, TG',
    coordinates: generateLomeLocation()
  }
};
