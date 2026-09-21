export const serviceValues = [
    { value: "strengthTraining", text: "Strength Training", duration: 60, durationText: "60 minutes", price: "£45" },
    { value: "cardiovascularFitness", text: "Cardiovasuclar Fitness", duration: 45, durationText: "45 minutes", price: "£38" },
    { value: "muscularEndurance", text: "Muscular Endurance", duration: 60, durationText: "60 minutes", price: "£45" },
    { value: "weightLossCoaching", text: "Weight Loss Coaching", duration: 45, durationText: "45 minutes", price: "£40" },
    { value: "mobilityFlexibility", text: "Mobility & Flexibility", duration: 30, durationText: "30 minutes", price: "£30" },
    { value: "generalFitness", text: "General Fitness", duration: 60, durationText: "60 minutes", price: "£42" }
]

export const trainers = [
    {
        value: "alex",
        text: "Alex",

        services: [
            "strengthTraining",
            "weightLossCoaching",
            "generalFitness"
        ],

        schedule: {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: null,
            thursday: { start: "12:00", end: "20:00" },
            friday: { start: "09:00", end: "17:00" },
            saturday: { start: "09:00", end: "14:00" },
            sunday: null
        }
    },

    {
        value: "maya",
        text: "Maya",

        services: [
            "cardiovascularFitness",
            "mobilityFlexibility",
            "generalFitness"
        ],

        schedule: {
            monday: { start: "12:00", end: "20:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: null,
            friday: { start: "12:00", end: "20:00" },
            saturday: { start: "09:00", end: "14:00" },
            sunday: null
        }
    },

    {
        value: "jordan",
        text: "Jordan",

        services: [
            "strengthTraining",
            "muscularEndurance",
            "generalFitness"
        ],

        schedule: {
            monday: { start: "09:00", end: "17:00" },
            tuesday: null,
            wednesday: { start: "12:00", end: "20:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" },
            saturday: { start: "10:00", end: "15:00" },
            sunday: null
        }
    }
];

