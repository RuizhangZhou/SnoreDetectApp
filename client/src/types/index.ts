export interface SnoreEvent {
    timestamp: number;
    duration: number;
    audioUri: string;
    date: string;
    startTime: string;
    endTime: string;
  }
  
  export interface DailySnoreRecord {
    date: string;
    snoreCount: number;
    events: SnoreEvent[];
  }