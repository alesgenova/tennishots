export class CustomerProfile{
    "user": string = "";
    "amount_due": number = 0.00;
    "trial_end": Date = new Date("1980-01-01T00:00:00Z");
    "shot_rate": number = 0.000;
    "videoshot_rate": number = 0.000;
    "outstanding_shots": number = 0;
    "outstanding_videoshots": number = 0;
}

export class Order{
    "user": string = "";
    "amount": number = 0.00;
    "pk" : number = -1;
}
