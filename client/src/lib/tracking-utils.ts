export function generateIMEI(): string {
  let imei = '358240';
  for (let i = 0; i < 9; i++) {
    imei += Math.floor(Math.random() * 10);
  }
  return imei;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export interface ActivityEntry {
  id: string;
  time: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function createActivityEntry(message: string, type: ActivityEntry['type'] = 'info'): ActivityEntry {
  return {
    id: Math.random().toString(36).substr(2, 9),
    time: getCurrentTime(),
    message,
    type
  };
}
