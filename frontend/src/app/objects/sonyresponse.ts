export class SonyResponse {
    username?: string;
    count: number = 0;
    imperial_units: boolean = false;
    strokes: SonyStroke[] = [];
}

export class SonyStroke{
    name: string;
    count: number;
    stats?:{
        heatmap: string;
        swing_speed: {
            x: number[];
            y: number[];
        }
        ball_speed: {
            x: number[];
            y: number[];
        }
        ball_spin: {
            x: number[];
            y: number[];
        }
    }
}
