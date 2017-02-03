import { Label } from './label';

export class Period {
    //name: string;
    pk: number;
    timestamp: Date;
    shot_count: number;
    video_count: number;
    labels: Label[] = [];
}

export class UserPeriodsList {
  sessions: Period[] = [];
  weeks: Period[] = [];
  months: Period[] = [];
  years: Period[] = [];
}
