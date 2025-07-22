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

export const mockDeviceInfo: DeviceInfo = {
  battery: '36%',
  network: 'MTN 4G',
  lockStatus: 'Locked',
  location: {
    city: 'Abidjan, CI',
    coordinates: [5.36, -4.01]
  }
};
