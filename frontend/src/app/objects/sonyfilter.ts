export class SonyFilter {
    username: string;
    sensor: string = 'SO';
    filters: SOFilters = new SOFilters();
}

export class SOFilters{
    periods?: PeriodsPicker = new PeriodsPicker();
    date_range: DateRange = new DateRange();
    swing_speed?: number[] = [0,240];
    ball_speed?: number[] = [0,240];
    ball_spin?: number[] = [-10,10];
    //swing_speed?: NumberRange = new NumberRange();
    //ball_speed?: NumberRange = new NumberRange();
    //ball_spin?: NumberRange = new NumberRange();
    swing_type?: string[] = [];
}

export class DateRange {
    min?: Date;
    max?: Date;
}

export class NumberRange{
    min?: number;
    max?: number;
}

export class PeriodsPicker{
    name: string = 'session';
    pks?: number[] = [];
}
