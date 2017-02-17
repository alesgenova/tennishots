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
  session: Period[] = [];
  week: Period[] = [];
  month: Period[] = [];
  year: Period[] = [];
}


export const PERIOD_CHOICES = [
    {key:"session", label:"Session"},
    {key:"week", label:"Week"},
    {key:"month", label:"Month"},
    {key:"year", label:"Year"}
]
