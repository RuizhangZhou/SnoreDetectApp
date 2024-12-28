import { DailySnoreRecord } from './index';

export type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Statistics: undefined;
  SnoreDetail: {
    record: DailySnoreRecord;
  };
};