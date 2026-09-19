const serviceSelectionForm = document.getElementById("service-selection-form")
const trainerSelectionForm = document.getElementById("trainer-selection-form")
const dateTimeSelectionForm = document.getElementById("date-time-selection-form")

const serviceStepSection = document.getElementById("service-step")
const trainerStepSection = document.getElementById("trainer-step")
const dateTimeStepSection = document.getElementById("date-time-step")
const customerDetailsStepSection = document.getElementById("customer-details-step")

const progressBar = document.getElementById("progress-bar")

const progressStep1 = document.querySelector('[data-step="1"]')
const progressStep2 = document.querySelector('[data-step="2"]')
const progressStep3 = document.querySelector('[data-step="3"]')
const progressStep4 = document.querySelector('[data-step="4"]')
const progressStep5 = document.querySelector('[data-step="5"]')

const summaryService = document.getElementById("summary-service")
const summaryTrainer = document.getElementById("summary-trainer")
const summaryDate = document.getElementById("summary-date")
const summaryTime = document.getElementById("summary-time")

const trainerCards = document.querySelectorAll(".trainer-card")

const appointmentSlots = document.getElementById("appointment-slots")

let booking = {}

import {serviceValues, trainers} from './bookingData.js';

// data booking step 1 service //

serviceSelectionForm.addEventListener("change", function(event) {
    event.preventDefault();

    const serviceInput = serviceSelectionForm.querySelector('input[name="service"]:checked')
    const serviceContinueButton = serviceSelectionForm.querySelector(".button-primary")

    if (serviceInput !== null) {
        serviceContinueButton.removeAttribute("disabled");  
    }
})

serviceSelectionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const serviceData = new FormData(serviceSelectionForm);
    const serviceValue = serviceData.get("service")

    booking.service = (serviceValue);

    serviceStepSection.setAttribute("hidden", "true");
    trainerStepSection.removeAttribute("hidden");

    progressStep1.classList.remove("is-active");
    progressStep1.classList.add("is-complete")  ;

    progressStep2.classList.add("is-active");

    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

        summaryService.textContent = matchingService.text;

    const availableTrainers = trainers.filter(function(trainer) {
        return trainer.services.includes(booking.service);
    })

    trainerCards.forEach(function(card) {
        const isAvailable = availableTrainers.some(function(trainer){
            return trainer.value === card.dataset.trainer;
        })

        if (card.dataset.trainer === "noPreference") {
            card.removeAttribute("hidden");
        } else if (isAvailable) {
            card.removeAttribute("hidden");
        } else {
            card.setAttribute("hidden", "");
        }
    })
})

// data booking step 2 trainer //

const trainerBackButton = trainerSelectionForm.querySelector(".button-secondary");

    trainerBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    delete booking.service;

    serviceStepSection.removeAttribute("hidden");
    trainerStepSection.setAttribute("hidden", "true");

    progressStep1.classList.add("is-active");
    progressStep1.classList.remove("is-complete");

    progressStep2.classList.remove("is-active");

    summaryService.textContent = "Not selected";
})

trainerSelectionForm.addEventListener("change", function(event) {
    event.preventDefault();

    const trainerInput = trainerSelectionForm.querySelector('input[name="trainer"]:checked');
    const trainerContinueButton = trainerSelectionForm.querySelector(".button-primary");

    if (trainerInput !== null) {
        trainerContinueButton.removeAttribute("disabled");
    }
})

trainerSelectionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const trainerData = new FormData(trainerSelectionForm);
    const trainerValue = trainerData.get("trainer");

    booking.trainer = (trainerValue);

    trainerStepSection.setAttribute("hidden", "");
    dateTimeStepSection.removeAttribute("hidden");

    progressStep2.classList.remove("is-active");
    progressStep2.classList.add("is-complete");

    progressStep3.classList.add("is-active");


    const matchingTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
    }); 

    summaryTrainer.textContent = matchingTrainer.text;
})

// data booking step 3 date & time //

const dateTimeBackButton = dateTimeSelectionForm.querySelector(".button-secondary");

    dateTimeBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    delete booking.trainer;

    trainerStepSection.removeAttribute("hidden");
    dateTimeStepSection.setAttribute("hidden", "");

    progressStep2.classList.add("is-active");
    progressStep2.classList.remove("is-complete");

    progressStep3.classList.remove("is-active");

    summaryTrainer.textContent = "Not Selected";

    bookingDateInput.value = "";
    appointmentSlots.innerHTML = "";

    summaryDate.textContent = "Not selected"

    progressBar.scrollTo({
            left: 0,
            behavior: "smooth"
        });
})

const bookingDateInput = document.getElementById("booking-date-input");

function renderTimeSlot(timeSlot, trainer) {
            const timeSlotButton = document.createElement("button")
            timeSlotButton.className = ("appointment-slot")
            timeSlotButton.type = ("button")
            timeSlotButton.dataset.trainer = (trainer.value)
            timeSlotButton.dataset.time = (timeSlot)

        const slotTime = document.createElement("span");
        slotTime.className = ("slot-time");
        slotTime.textContent = (timeSlot);

        const slotTrainer = document.createElement("span");
        slotTrainer.className = ("slot-trainer");
        slotTrainer.textContent = trainer.text;

        timeSlotButton.appendChild(slotTime);
        timeSlotButton.appendChild(slotTrainer);

        appointmentSlots.appendChild(timeSlotButton);
    }

function generateTrainerSlots(selectedTrainer, selectedDay) {
    const trainerSchedule = selectedTrainer.schedule[selectedDay]

    if (trainerSchedule === null) {
        return;
    }

    const [startHour, startMinute] = trainerSchedule.start.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = trainerSchedule.end.split(":").map(Number);

    const endMinutes = endHour * 60 + endMinute;
    
    const matchingService = serviceValues.find(function(service){
        return service.value === booking.service
    });

    const serviceDuration = Number(matchingService.duration);

    const availableTimes = [];

    for (
        let currentTime = startMinutes;
        currentTime + serviceDuration <= endMinutes;
        currentTime += 15
    ) {
        availableTimes.push(currentTime)
    }

    const formattdTimes = availableTimes.map(function(time) {
        const availableTimeHour = Math.trunc(time / 60);
        const availableTimeMinutes = time % 60;

        const hour = String(availableTimeHour).padStart(2, "0");
        const minutes = String(availableTimeMinutes).padStart(2, "0");

        return `${hour}:${minutes}`;
    });

    formattdTimes.forEach(function(formattedTime) {
        renderTimeSlot(formattedTime, selectedTrainer);
    });

}

bookingDateInput.addEventListener("change", function(event){
    event.preventDefault();

    appointmentSlots.innerHTML = "";

    const loadingMessage = document.getElementById("availability-loading-message");

    loadingMessage.removeAttribute("hidden");

    const selectedDateInput = bookingDateInput.value;

    const bookingDate = new Date(selectedDateInput);

    const bookingDayNumber = bookingDate.getDay();

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const selectedDay = days[bookingDayNumber];

    if (booking.trainer === "noPreference") {
        const eligibleTrainers = trainers.filter(function(trainer) {
            return trainer.services.includes(booking.service);
        });

        eligibleTrainers.forEach(function(trainer) {
            generateTrainerSlots(trainer, selectedDay)
        });

        loadingMessage.setAttribute("hidden", "");
    } else {
        const selectedTrainer = trainers.find(function(trainer) {
            return trainer.value === booking.trainer;
        });

        generateTrainerSlots(selectedTrainer, selectedDay)
        loadingMessage.setAttribute("hidden", "");
    }

    booking.date = selectedDateInput;

    summaryDate.textContent = booking.date;
    })

appointmentSlots.addEventListener("click", function(event) {
    event.preventDefault();

    const clickedSlot = event.target.closest("button")

    const dateTimeFormContinueButton = dateTimeSelectionForm.querySelector(".button-primary");

    booking.time = clickedSlot.dataset.time;

    if (!clickedSlot !== null) {
        dateTimeFormContinueButton.removeAttribute("disabled")
    }
})

dateTimeSelectionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    dateTimeStepSection.setAttribute("hidden", "");

    customerDetailsStepSection.removeAttribute("hidden");

    progressStep3.classList.remove("is-active");
    progressStep3.classList.add("is-complete");

    progressStep4.classList.add("is-active");

    summaryTime.textContent = booking.time;

    progressBar.scrollTo({
        left: progressBar.scrollWidth,
        behavior: "smooth"
    });

    console.log(booking)
})

// booking step 4 customer details // 

const customerDetailsBackButton = customerDetailsStepSection.querySelector(".button-secondary")
customerDetailsBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    delete booking.date;
    delete booking.time;

    dateTimeStepSection.removeAttribute("hidden");

    customerDetailsStepSection.setAttribute("hidden", "")

    progressStep3.classList.add("is-active");
    progressStep3.classList.remove("is-complete");

    progressStep4.classList.remove("is-active");

    summaryDate.textContent = "Not Selected";
    summaryTime.textContent = "Not selected"

    bookingDateInput.value = "";
    appointmentSlots.innerHTML = "";

    summaryDate.textContent = "Not selected"

    console.log(booking)
})


