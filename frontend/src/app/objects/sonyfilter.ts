export class SonyFilter {
    username: string;
    sensor: string;
    filters: SOFilters;
}

export class SOFilters{
    periods?: PeriodsPicker ;
    date_range: DateRange ;
    swing_speed?: NumberRange ;
    ball_speed?: NumberRange ;
    ball_spin?: NumberRange ;
    swing_type?: string[] ;
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
    name: string;
    pks?: number[];
}
