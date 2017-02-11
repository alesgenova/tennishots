export class UserProfile{
    "first_name": string = "";
    "last_name": string = "";
    "arm": string = "";
    "units": string = "";
    "backhand": string = "";
    "privacy": string = "";
    "friends": Friend[] = []
    "avatar"?: string = "";
}

export class Friend{
    "first_name": "";
    "last_name": "";
    "user": "";
    "email": ""
}

export class FriendRequest{
    "from_user": "";
    "to_user": "";
    "action"?: ""
}

export class RegistrationForm{
    user: UserForm = new UserForm();
    profile: ProfileForm = new ProfileForm();
}

export class UserForm{
    "username": string = "";
    "email": string = "";
    "password1": string = "";
    "password2": string = ""
}

export class ProfileForm{
    "first_name": string = "";
    "last_name": string = "";
    "arm": string = "";
    "units": string = "";
    "backhand": string = "";
    "privacy": string = ""
}

export const ARM_CHOICES =[
    {
        value: "R",
        label: "Right"
    },
    {
        value: "L",
        label: "Left"
    }
]

export const UNIT_CHOICES =[
    {
        value: "M",
        label: "Imperial Units"
    },
    {
        value: "K",
        label: "Metric Units"
    }
]

export const BACKHAND_CHOICES =[
    {
        value: 2,
        label: "Two-handed"
    },
    {
        value: 1,
        label: "One-Handed"
    }
]

export const PRIVACY_CHOICES =[
    {
        value: "VF",
        label: "Visible to friends"
    },
    {
        value: "PR",
        label: "Private"
    }
]
/*
arm_choices = (('L','Left-handed'),
               ('R', 'Right-handed'),)
unit_choices = (('M','Imperial Units'),
               ('K', 'Metric Units'),)
backhand_choices = ((1,'One-handed'),
               (2, 'Two-handed'),)

privacy_choices = (('VF', 'Visible to friends'),
                   ('PR', 'Private'),
                   ('VR', 'Visible to registered users'),
                   ('PU', 'Public'),
                  )
*/
