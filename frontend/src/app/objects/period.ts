import { Label } from './label';

export class Period {
    //name: string;
    pk: number;
    timestamp: Date;
    shot_count: number;
    video_count: number;
    labels?: Label[];
}
