import { Label } from './label';
import { UserPeriodsList } from './period';

export class PlayerProfile {
    //name: string;
    user = "";
    lastchange = "";
    shot_count = -1;
    videoshot_count = -1;
    recording_count = -1;
    collection_count = -1
    video_count: number;
    labels: Label[] = [];
    collections: any[] = [];
    periods = new UserPeriodsList();
}
