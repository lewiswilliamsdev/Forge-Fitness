const mainPage = document.getElementById("main-booking-page")

const bookingLayout = document.getElementById("booking-layout")

const serviceSelectionForm = document.getElementById("service-selection-form")
const trainerSelectionForm = document.getElementById("trainer-selection-form")
const dateTimeSelectionForm = document.getElementById("date-time-selection-form")
const customerDetailsForm = document.getElementById("customer-details-form")

const serviceStepSection = document.getElementById("service-step")
const trainerStepSection = document.getElementById("trainer-step")
const dateTimeStepSection = document.getElementById("date-time-step")
const customerDetailsStepSection = document.getElementById("customer-details-step")
const reviewStepSection = document.getElementById("review-step")
const bookingConfirmation = document.getElementById("confirmation-step")
const manageBookingSection = document.getElementById("manage-booking-section")

const bookingUnavailableSection = document.getElementById("booking-unavailable-step")

const headerManageBookingButton = document.getElementById("manage-booking-button")


const confirmBookingButton = document.getElementById("confirm-booking-button")

const reviewCard = document.getElementById("review-card")

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
const summaryTotal = document.getElementById("summary-total")

const trainerCards = document.querySelectorAll(".trainer-card")

const appointmentSlots = document.getElementById("appointment-slots")

const bookingStatus = document.getElementById("manage-booking-status");

let bookings = []

let booking = {}

import {serviceValues, trainers, cancellationPolicy} from './bookingData.js';

const savedBookings = localStorage.getItem("bookings")

if (savedBookings) {
    bookings = JSON.parse(savedBookings)
}

function saveBookings() {
    localStorage.setItem("bookings", JSON.stringify(bookings))
}

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

    booking.service = serviceValue;

    serviceStepSection.setAttribute("hidden", "");
    trainerStepSection.removeAttribute("hidden");

    progressStep1.classList.remove("is-active");
    progressStep1.classList.add("is-complete")  ;

    progressStep2.classList.add("is-active");

    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

    booking.durationInMinutes = matchingService.duration;

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

    progressBar.scrollIntoView({behavior: "smooth"})
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
    summaryTrainer.textContent = "Not selected";
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

    if (matchingTrainer !== undefined) {
        summaryTrainer.textContent = matchingTrainer.text;
    }

    const today = new Date().toISOString().split('T')[0];

    bookingDateInput.setAttribute('min', today)

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const max = maxDate.toISOString().split('T')[0];

    bookingDateInput.setAttribute('max', max);

    progressBar.scrollIntoView({behavior: "smooth"})
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

    bookingDateInput.value = "";
    appointmentSlots.innerHTML = "";

    summaryTrainer.textContent = "Not selected"
    summaryDate.textContent = "Not selected"

    progressBar.scrollTo({
            left: 0,
            behavior: "smooth"
        });
})

const bookingDateInput = document.getElementById("booking-date-input");

function isSlotAvailable(trainer, date, startTime, duration, bookingIdToIgnore) {
    const [timeHours, timeMinutes] = startTime.split(":").map(Number);

    const candidateStart = timeHours * 60 + timeMinutes;

    const candidateEnd = candidateStart + duration;

    const trainerBookingsForDate = bookings.filter(function(existingBooking) {
        return existingBooking.trainer === trainer &&
        existingBooking.date === date &&
        existingBooking.status === "confirmed" &&
        existingBooking.id !== bookingIdToIgnore;
    });

    const hasConflict = trainerBookingsForDate.some(function(existingBooking) {
            const time = existingBooking.time;

            const [timeHours,timeMinutes] = time.split(":").map(Number);

            const startMinutes = timeHours * 60 + timeMinutes;

            const endMinutes = startMinutes + existingBooking.durationInMinutes;

            return candidateStart < endMinutes &&
            candidateEnd > startMinutes;
        })

        return !hasConflict;
}

function renderTimeSlot(timeSlot, trainer, container) {
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

        container.appendChild(timeSlotButton);
    }

function generateTrainerSlots(selectedTrainer, selectedDay, container, chosenDate) {
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

    const trainerBookingsForDate = bookings.filter(function(existingBooking) {
        return existingBooking.trainer === selectedTrainer.value &&
        existingBooking.date === chosenDate &&
        existingBooking.status === "confirmed";
    })

    const date = new Date();

    const cuttOffTime = new Date(date.getTime() + 12 * 60 * 60 * 1000)

    const availableTimes = [];

    for (
        let currentTime = startMinutes;
        currentTime + serviceDuration <= endMinutes;
        currentTime += 15
    ) {
        const candidateStart = currentTime;
        const candidateEnd = candidateStart + serviceDuration;

        const candidateHour = Math.trunc(candidateStart / 60);
        const candidateMinutes = candidateStart % 60;
        
        const [chosenYear, chosenMonth, chosenDay] = chosenDate.split("-").map(Number)

        const candidateDateTime = new Date(
            chosenYear, chosenMonth - 1, chosenDay,
            candidateHour, candidateMinutes
        )

        const hasConflict = trainerBookingsForDate.some(function(existingBooking) {
            const time = existingBooking.time;

            const [timeHours,timeMinutes] = time.split(":").map(Number);

            const startMinutes = timeHours * 60 + timeMinutes;

            const endMinutes = startMinutes + existingBooking.durationInMinutes;

            return candidateStart < endMinutes &&
            candidateEnd > startMinutes;
        })
        if(hasConflict === false && candidateDateTime >= cuttOffTime) {
            availableTimes.push(currentTime)
        }

    }

    const formattdTimes = availableTimes.map(function(time) {
        const availableTimeHour = Math.trunc(time / 60);
        const availableTimeMinutes = time % 60;

        const hour = String(availableTimeHour).padStart(2, "0");
        const minutes = String(availableTimeMinutes).padStart(2, "0");

        return `${hour}:${minutes}`;
    });

    formattdTimes.forEach(function(formattedTime) {
        renderTimeSlot(formattedTime, selectedTrainer, container);
    });
}

let selectedDate = null
let selectedTime = null

const dateTimeFormContinueButton = dateTimeSelectionForm.querySelector(".button-primary");

bookingDateInput.addEventListener("change", function(event){
    event.preventDefault();

    appointmentSlots.innerHTML = "";

    selectedTime = null;

    dateTimeFormContinueButton.setAttribute("disabled", "")

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
            generateTrainerSlots(trainer, selectedDay, appointmentSlots, selectedDateInput)
        });

        loadingMessage.setAttribute("hidden", "");
    } else {
        const selectedTrainer = trainers.find(function(trainer) {
            return trainer.value === booking.trainer;
        });

        generateTrainerSlots(selectedTrainer, selectedDay, appointmentSlots, selectedDateInput)
        loadingMessage.setAttribute("hidden", "");
    }

    selectedDate = selectedDateInput;

    const noAvailabilityMessage = document.getElementById("no-availability-message");

    if (appointmentSlots.children.length === 0) {
    noAvailabilityMessage.removeAttribute("hidden");
    } else {
    noAvailabilityMessage.setAttribute("hidden", "");
    }
})

appointmentSlots.addEventListener("click", function(event) {
    event.preventDefault();

    const selectedSlot = appointmentSlots.querySelector(".appointment-slot.is-selected");

    if (selectedSlot !== null) {
        selectedSlot.classList.remove("is-selected")
    }

    const clickedSlot = event.target.closest("button");

    if (clickedSlot === null) {
        return;
    }

    selectedTime = clickedSlot.dataset.time;

    booking.trainer = clickedSlot.dataset.trainer;

    clickedSlot.classList.add("is-selected");

    dateTimeFormContinueButton.removeAttribute("disabled")
})

dateTimeSelectionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    booking.date = selectedDate;
    booking.time = selectedTime;

    selectedDate = null;
    selectedTime = null;

    dateTimeStepSection.setAttribute("hidden", "");

    customerDetailsStepSection.removeAttribute("hidden");

    progressStep3.classList.remove("is-active");
    progressStep3.classList.add("is-complete");

    progressStep4.classList.add("is-active");

    summaryDate.textContent = booking.date;
    summaryTime.textContent = booking.time;

    const matchingTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
    });

    summaryTrainer.textContent = matchingTrainer.text;

    progressBar.scrollTo({
        left: progressBar.scrollWidth,
        behavior: "smooth"
    });

    const reviewBookingButton = customerDetailsForm.querySelector('button[type="submit"]');

    reviewBookingButton.removeAttribute("disabled");

    progressBar.scrollIntoView({behavior: "smooth"})
})

// booking step 4 customer details // 

const customerDetailsBackButton = document.getElementById("customer-details-back-button")
customerDetailsBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    delete booking.date;
    delete booking.time;

    dateTimeStepSection.removeAttribute("hidden");

    const dateTimeFormContinueButton = dateTimeSelectionForm.querySelector(".button-primary");

    dateTimeFormContinueButton.setAttribute("disabled", "");

    customerDetailsStepSection.setAttribute("hidden", "")

    progressStep3.classList.add("is-active");
    progressStep3.classList.remove("is-complete");

    progressStep4.classList.remove("is-active");

    summaryDate.textContent = "Not Selected";
    summaryTime.textContent = "Not selected"

    bookingDateInput.value = "";
    appointmentSlots.innerHTML = "";

    summaryDate.textContent = "Not selected"
})

function validateCustomerDetails(
    firstNameInput,
    lastNameInput,
    emailInput,
    phoneInput,
    firstNameError,
    lastNameError,
    emailError,
    phoneError
) {
    let formIsValid = true

    const firstName = firstNameInput.value;
    const firstNameTrim = firstName.trim();

    const lastName = lastNameInput.value
    const lastNameTrim = lastName.trim();

    const email = emailInput.value
    const emailTrim = email.trim();

    const validEmailCheck = emailInput.validity.valid;

    const phone = phoneInput.value;
    const phoneTrim = phone.replace(/[\s-]/g, "");

    const digitsOnly = /^\d+$/;

    const digitCheck = digitsOnly.test(phoneTrim);

    const startsWithZero = phoneTrim.startsWith("0");

    if (firstNameTrim.length <= 1 || firstNameTrim.length > 50) {
        firstNameInput.setAttribute("aria-invalid", "true");

        firstNameError.removeAttribute("hidden", "");
        firstNameError.classList.add("field-error");

        formIsValid = false
    } else {
        firstNameInput.setAttribute("aria-invalid", "false");

        firstNameError.setAttribute("hidden", "");
        firstNameError.classList.remove("field-error");
    }

    if (lastNameTrim.length <= 1 || lastNameTrim.length > 50) {
        lastNameInput.setAttribute("aria-invalid", "true");

        lastNameError.removeAttribute("hidden");
        lastNameError.classList.add("field-error");

        formIsValid = false
    } else {
        lastNameInput.setAttribute("aria-invalid", "false");

        lastNameError.setAttribute("hidden", "");
        lastNameError.classList.remove("field-error");
    }

    if (validEmailCheck === false) {
        emailInput.setAttribute("aria-invalid", "true");

        emailError.removeAttribute("hidden");
        emailError.classList.add("field-error");

        formIsValid = false
    } else {
        emailInput.setAttribute("aria-invalid", "false");

        emailError.setAttribute("hidden", "");
        emailError.classList.remove("field-error");
    }

    if (digitCheck === false || startsWithZero === false || phoneTrim.length !== 11) {
        phoneInput.setAttribute("aria-invalid", "true");

        phoneError.removeAttribute("hidden");
        phoneError.classList.add("field-error");

        formIsValid = false;
    } else {
        phoneInput.setAttribute("aria-invalid", "false");

        phoneError.setAttribute("hidden", "");
        phoneError.classList.remove("field-error");
    }

    return {
        isValid: formIsValid,
        firstName: firstNameTrim,
        lastName: lastNameTrim,
        email: emailTrim,
        phone: phoneTrim
    };
}

function renderSummary() {
    const reviewPrimary = document.createElement("div");
    reviewPrimary.className = ("review-primary")

    const primaryDiv1 = document.createElement("div");

    const reviewLabel = document.createElement("p");
    reviewLabel.textContent = ("Session");

    const sessionType = document.createElement("h3");

    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

    sessionType.textContent = matchingService.text;

    const duration = document.createElement("p");
    duration.textContent =  matchingService.durationText;

    const reviewPrice = document.createElement("reviewPrice");
    reviewPrice.className = ("review-price");
    reviewPrice.textContent = matchingService.priceText;

    primaryDiv1.appendChild(reviewLabel);
    primaryDiv1.appendChild(sessionType);
    primaryDiv1.appendChild(duration);

    reviewPrimary.appendChild(primaryDiv1);
    reviewPrimary.appendChild(reviewPrice);

    const reviewDetails = document.createElement("dl");

    const labels = ["trainer", "date", "time", "customer", "email", "phone"];

    const fullName = `${booking.form.firstName} ${booking.form.lastName}`

    const matchingTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
    })

    const values = {
        trainer: matchingTrainer.text,
        date: booking.date,
        time: booking.time,
        customer: fullName,
        email: booking.form.email,
        phone: booking.form.phone
    }

    labels.forEach(label => {
        const reviewDetail = document.createElement("div");
        reviewDetail.className = "review-detail";
    
        const dt = document.createElement("dt");
        dt.textContent = label;

        const dd = document.createElement("dd");

        dd.textContent = values[label] || "";

        reviewDetail.appendChild(dt);
        reviewDetail.appendChild(dd);
        
        reviewDetails.appendChild(reviewDetail)
    })

    reviewCard.appendChild(reviewPrimary);
    reviewCard.appendChild(reviewDetails);

    booking.price = matchingService.price;
    summaryTotal.textContent = matchingService.priceText;

    confirmBookingButton.removeAttribute("disabled");
}

customerDetailsForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    const firstNameError = document.getElementById("first-name-error");
    const lastNameError = document.getElementById("last-name-error");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");

    const validationResult = validateCustomerDetails(
        firstNameInput,
        lastNameInput,
        emailInput,
        phoneInput,
        firstNameError,
        lastNameError,
        emailError,
        phoneError
    );

    if (validationResult.isValid === false) {
        return;
    }

    const form = {
        firstName: validationResult.firstName,
        lastName: validationResult.lastName,
        email: validationResult.email,
        phone: validationResult.phone
    };

    booking.form = form;

    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";

    customerDetailsStepSection.setAttribute("hidden", "");
    reviewStepSection.removeAttribute("hidden");

    progressStep4.classList.remove("is-active");
    progressStep4.classList.add("is-complete");

    progressStep5.classList.add("is-active")

    renderSummary();

    progressBar.scrollIntoView({behavior: "smooth"})
})

// booking step 5 review  //

const reviewBackButton = reviewStepSection.querySelector(".button-secondary") 

reviewBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    event.stopPropagation();

    delete booking.form;

    customerDetailsForm.reset();

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";

    customerDetailsStepSection.removeAttribute("hidden");

    reviewStepSection.setAttribute("hidden", "")

    progressStep4.classList.add("is-active");
    progressStep4.classList.remove("is-complete");

    progressStep5.classList.remove("is-active");

    summaryTotal.textContent = "—";

    reviewCard.innerHTML = "";

    console.log("END BACK:", booking);

setTimeout(function () {
    console.log("AFTER BACK:", booking);
}, 0);
})

// booking confirmation //

const confirmationMessage = document.getElementById("confirmation-message")

const bookingReferenceValue = document.getElementById("booking-reference-value")

const confirmationService = document.getElementById("confirmation-summary-service")
const confirmationTrainer = document.getElementById("confirmation-summary-trainer")
const confirmationDate = document.getElementById("confirmation-summary-date")
const confirmationTime = document.getElementById("confirmation-summary-time")



function generateBookingReference() {
    let bookingReference;
    let referenceAlreadyExists;

    do {
    const generatedNumber = Math.random();

    const selectedNumber = generatedNumber * 1000000;

    const bookingNumber = Math.trunc(selectedNumber);

    bookingReference = "FF-" + bookingNumber;

    referenceAlreadyExists = bookings.some(function(existingBooking){
        return existingBooking.id === bookingReference;
    });
    } while (referenceAlreadyExists === true);

    bookingReferenceValue.textContent = bookingReference;

    booking.id = bookingReference;
}

confirmBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    const slotIsAvailable = isSlotAvailable(booking.trainer, booking.date, booking.time, booking.durationInMinutes);

    if (slotIsAvailable === false) {
        bookingUnavailableSection.removeAttribute("hidden");
        return;
    }

    bookingUnavailableSection.setAttribute("hidden", "");

    reviewStepSection.setAttribute("hidden", "");
    bookingConfirmation.removeAttribute("hidden");

    progressStep5.classList.remove("is-active");
    progressStep5.classList.add("is-complete");

    const matchingTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
    }); 

    const bookingDate = new Date(booking.date);

    const bookingWeekDayNumber = bookingDate.getDay();

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const selectedDay = days[bookingWeekDayNumber];

    const dayOfMonth = bookingDate.getDate();

    const monthsOfTheYear = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ]

    const monthName = monthsOfTheYear[bookingDate.getMonth()];

    const bookingTime = booking.time;

    confirmationMessage.textContent = "Your appointment with" + " " + matchingTrainer.text + " " +
    "is confirmed for" + " " + selectedDay + " " + dayOfMonth + " " + monthName + " " +
    "at" + " " + bookingTime;

    generateBookingReference();

    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

    confirmationService.textContent = matchingService.text;
    confirmationTrainer.textContent = matchingTrainer.text;
    confirmationDate.textContent = booking.date;
    confirmationTime.textContent = booking.time;

    booking.status = "confirmed"

    bookings.push(booking);

    saveBookings();

    booking = {};

    mainPage.scrollIntoView({behavior: "smooth"})
})

function resetBookingFlow() {
    booking = {};

    serviceSelectionForm.reset();
    trainerSelectionForm.reset();
    dateTimeSelectionForm.reset();
    customerDetailsForm.reset();
    bookingLookUpForm.reset();

    appointmentSlots.innerHTML = "";

    const submitButtons = document.querySelectorAll('button[type="submit"]');

    submitButtons.forEach(button => {
        button.setAttribute("disabled", "")
    });

    summaryService.textContent = "Not selected";
    summaryTrainer.textContent = "Not selected";
    summaryDate.textContent = "Not selected";
    summaryTime.textContent = "Not selected";
    summaryTotal.textContent = "—";

    bookingDateInput.value = "";

    const bookingReferenceInput = document.getElementById("booking-reference-input")
    const bookingEmailInput = document.getElementById("booking-email-input")

    bookingReferenceInput.value = "";
    bookingEmailInput.value = "";

    reviewCard.innerHTML = "";

    confirmationService.textContent = "";
    confirmationTrainer.textContent = "";
    confirmationDate.textContent = "";
    confirmationTime.textContent = "";


    serviceStepSection.removeAttribute("hidden")
    bookingConfirmation.setAttribute("hidden", "")

    progressStep1.classList.remove("is-complete");
    progressStep2.classList.remove("is-complete");
    progressStep3.classList.remove("is-complete");
    progressStep4.classList.remove("is-complete");
    progressStep5.classList.remove("is-complete");

    progressStep2.classList.remove("is-active");
    progressStep3.classList.remove("is-active");
    progressStep4.classList.remove("is-active");
    progressStep5.classList.remove("is-active");

    progressStep1.classList.add("is-active");

    manageBookingSection.setAttribute("hidden", "");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    progressBar.scrollTo({
            left: 0,
            behavior: "smooth"
        });
}


const newBookingButton = bookingConfirmation.querySelector(".button-secondary")

newBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    resetBookingFlow();
})



// manage booking //

headerManageBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    resetBookingFlow();

    manageBookingSection.removeAttribute("hidden");
    bookingLookUpView.removeAttribute("hidden");

    bookingDetailsView.setAttribute("hidden", "");
    bookingLayout.setAttribute("hidden", "");

    const findBookingButton = document.getElementById("find-booking-button")

    findBookingButton.removeAttribute("disabled");

    progressStep1.classList.remove("is-active");

    manageBookingSection.scrollIntoView({behavior: "smooth"});
})

// book a new session buttons // 

const newSessionButtons = document.querySelectorAll(".book-new-session-button")

newSessionButtons.forEach(button => {
    button.addEventListener("click", function(event) {
        event.preventDefault();

        resetBookingFlow();
        bookingLayout.removeAttribute("hidden");
        serviceStepSection.removeAttribute("hidden");

        bookingLookUpView.setAttribute("hidden", "");
        bookingDetailsView.setAttribute("hidden", "");
        updateDetailsView.setAttribute("hidden", "");
    });
});

// find another booking button //

const findAnotherBookingButton = document.getElementById("find-another-booking-button")

findAnotherBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    resetBookingFlow();

    manageBookingSection.removeAttribute("hidden");
    bookingLookUpView.removeAttribute("hidden");

    bookingDetailsView.setAttribute("hidden", "");
    bookingLayout.setAttribute("hidden", "");

    const findBookingButton = document.getElementById("find-booking-button")

    findBookingButton.removeAttribute("disabled");

    manageBookingSection.scrollIntoView({behavior: "smooth"})
})



// booking lookup process //

function renderMatchingBooking() {

    const bookingReference = document.getElementById("manage-booking-reference");
    bookingReference.textContent = booking.id;

    bookingStatus.textContent = booking.status;

    bookingStatus.classList.add(booking.status);

    const service = document.getElementById("manage-service");

    const matchingService = serviceValues.find(function(service) {
    return service.value === booking.service;
    });

    service.textContent = matchingService.text;

    const trainer = document.getElementById("manage-trainer");

    const matchingTrainer = trainers.find(function(trainer) {
    return trainer.value === booking.trainer;
    }); 

    trainer.textContent = matchingTrainer.text;

    const date = document.getElementById("manage-date");
    date.textContent = booking.date;

    const time = document.getElementById("manage-time");
    time.textContent = booking.time;

    const duration = document.getElementById("manage-duration");
    duration.textContent = booking.durationInMinutes + "" + " minutes";

    const price = document.getElementById("manage-price");
    price.textContent = booking.price;

    const customerFullName = document.getElementById("manage-customer-name");
    customerFullName.textContent = `${booking.form.firstName} ${booking.form.lastName}`

    const customerEmail = document.getElementById("manage-customer-email");
    customerEmail.textContent = booking.form.email;

    const customerPhone = document.getElementById("manage-customer-phone");
    customerPhone.textContent = booking.form.phone;
    }

const bookingLookUpView = document.getElementById("booking-lookup-view")
const bookingLookUpForm = document.getElementById("booking-lookup-form")

const bookingNotFoundMessage = document.getElementById("booking-not-found-message")

const bookingDetailsView = document.getElementById("booking-details-view")
bookingLookUpForm.addEventListener("submit", function(event){
    event.preventDefault();

    let formIsValid = true;

    const bookingReferenceInput = document.getElementById("booking-reference-input")
    const bookingReference =  bookingReferenceInput.value

    const referenceError = document.getElementById("look-up-reference-error")

    if (bookingReference.startsWith("FF-")) {
        bookingReferenceInput.setAttribute("aria-invalid", "false")

        referenceError.setAttribute("hidden", "")
        referenceError.classList.remove("field-error")
    } else {
        bookingReferenceInput.setAttribute("aria-invalid", "true")

        referenceError.removeAttribute("hidden");
        referenceError.classList.add("field-error")

        formIsValid = false;
    }

    const bookingEmailInput = document.getElementById("booking-email-input")
    const bookingEmail = bookingEmailInput.value

    const emailError = document.getElementById("look-up-email-error")

    const bookingEmailTrim = bookingEmail.trim();

    const validEmailCheck = bookingEmailInput.validity.valid;

    if (validEmailCheck === false) {
        bookingEmailInput.setAttribute("aria-invalid", "true");

        emailError.removeAttribute("hidden");
        emailError.classList.add("field-error");

        formIsValid = false;
    } else {
        bookingEmailInput.setAttribute("aria-invalid", "false");

        emailError.setAttribute("hidden", "");
        emailError.classList.remove("field-error");
    }

    if (formIsValid === false) {
        return;
    }


    const matchingBooking = bookings.find(function(booking) {
        if (booking.id === bookingReference && booking.form.email === bookingEmailTrim) {
            return booking
        }
    })

    booking = matchingBooking;

if (booking !== undefined) {
        bookingDetailsView.removeAttribute("hidden");
        bookingLookUpView.setAttribute("hidden", "");

        bookingStatus.textContent = booking.status;

        bookingStatus.classList.remove("confirmed");
        bookingStatus.classList.remove("rescheduled");
        bookingStatus.classList.remove("cancelled");
        bookingStatus.classList.add(booking.status);
        renderMatchingBooking();
    } else {
        bookingNotFoundMessage.removeAttribute("hidden");
    }
})

// manage current current booking //

const manageCurrentBookingButton = bookingConfirmation.querySelector(".button-primary")

manageCurrentBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    bookingLayout.setAttribute("hidden" ,"");
    bookingLookUpView.setAttribute("hidden", "");

    manageBookingSection.removeAttribute("hidden", "");
    bookingDetailsView.removeAttribute("hidden")

    booking = bookings.at(-1);

    renderMatchingBooking();

    manageBookingSection.scrollIntoView({behavior: "smooth"});
})

// update customer details process //

const updateDetailsButton = document.getElementById("update-booking-details-button")
const updateDetailsView = document.getElementById("update-details-view")
const updateDetailsForm = document.getElementById("update-booking-details-form") 

updateDetailsButton.addEventListener("click", function(event) {
    event.preventDefault();

    if (booking.status === "cancelled" || booking.rescheduledTo !== undefined) {
        return;
    }
    updateDetailsView.removeAttribute("hidden");
    bookingDetailsView.setAttribute("hidden", "");

    const saveChangesButton = updateDetailsForm.querySelector(".button-primary")

    saveChangesButton.removeAttribute("disabled")
})

const cancelDetailsUpdateButton = document.getElementById("cancel-details-update-button")

cancelDetailsUpdateButton.addEventListener("click", function(event) {
    event.preventDefault();

    bookingDetailsView.removeAttribute("hidden");
    updateDetailsView.setAttribute("hidden", "");
})

updateDetailsForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newfirstNameInput = document.getElementById("update-customer-first-name");
    const newLastNameInput = document.getElementById("update-customer-last-name");
    const newEmailInput = document.getElementById("update-customer-email");
    const newPhoneInput = document.getElementById("update-customer-phone");

    const newFirstNameError = document.getElementById("new-first-name-error");
    const newLastNameError = document.getElementById("new-last-name-error");
    const newEmailError = document.getElementById("new-email-error");
    const newPhoneError = document.getElementById("new-phone-error");

    const validationResult = validateCustomerDetails(
        newfirstNameInput,
        newLastNameInput,
        newEmailInput,
        newPhoneInput,
        newFirstNameError,
        newLastNameError,
        newEmailError,
        newPhoneError
    )

    if (validationResult.isValid === false) {
        return;
    }


    const form = {
        firstName: validationResult.firstName,
        lastName: validationResult.lastName,
        email: validationResult.email,
        phone: validationResult.phone
    }

    booking.form = form;

    saveBookings();
    renderMatchingBooking();

    bookingDetailsView.removeAttribute("hidden");
    updateDetailsView.setAttribute("hidden", "");
})

// reschedule booking process // 

const rescheduleButton = document.getElementById("reschedule-booking-button");
const rescheduleBookingView = document.getElementById("reschedule-booking-view");
const rescheduleBookingForm = document.getElementById("reschedule-booking-form");
const rescheduleDateInput = document.getElementById("reschedule-date-input");
const rescheduleAppointmenSlots = document.getElementById("reschedule-appointment-slots")
const rescheduleUnavailable = document.getElementById("reschedule-unavailable-view")

const priceChangeNotice = document.getElementById("price-change-notice")

rescheduleButton.addEventListener("click", function(event) {
    event.preventDefault();

    if (booking.status === "cancelled" || booking.rescheduledTo !== undefined) {
        return;
    }

    const bookingDate = booking.date

    const [year, month, day] = bookingDate.split("-").map(Number)

    const bookingTime = booking.time

    const [hour, minutes] = bookingTime.split(":").map(Number);

    const dateTime = new Date(
        year, month - 1, day,
        hour, minutes
    )

    const date = new Date();

    const cuttOffTime = new Date(date.getTime() + 12 * 60 * 60 * 1000)

    if (dateTime < cuttOffTime) {
        rescheduleBookingView.setAttribute("hidden", "")

        rescheduleUnavailable.removeAttribute("hidden")
        return;
    }

    rescheduleUnavailable.setAttribute("hidden", "")

    const today = new Date().toISOString().split('T')[0];

    rescheduleDateInput.setAttribute('min', today)

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const max = maxDate.toISOString().split('T')[0];

    rescheduleDateInput.setAttribute('max', max);

    rescheduleDateInput.value = "";

    rescheduleAppointmenSlots.innerHTML = "";

    rescheduleBookingView.removeAttribute("hidden");
    bookingDetailsView.setAttribute("hidden", "");

    const service = document.getElementById("reschedule-service");

    const matchingService = serviceValues.find(function(service) {
    return service.value === booking.service;
    });

    service.textContent = matchingService.text;

    const trainer = document.getElementById("reschedule-trainer");

    const matchingTrainer = trainers.find(function(trainer) {
    return trainer.value === booking.trainer;
    }); 

    trainer.textContent = matchingTrainer.text;
}) 

const confirmRescheduleButton = document.getElementById("reschedule-continue-button")

const rescheduleUnavailableBackButton = document.getElementById("reschedule-unavailable-back-button")

rescheduleUnavailableBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    rescheduleBookingView.setAttribute("hidden", "");
    bookingDetailsView.removeAttribute("hidden");
})

const cancelRescheduleButton = document.getElementById("cancel-reschedule-button")

let selectedRescheduleDate = null;
let selectedRescheduleTime = null;

rescheduleDateInput.addEventListener("change", function(event) {
    event.preventDefault();

    rescheduleAppointmenSlots.innerHTML = "";

    selectedRescheduleTime = null;

    confirmRescheduleButton.setAttribute("disabled", "");

    const selectedDateInput = rescheduleDateInput.value;

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

    const selectedTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
        }); 

        generateTrainerSlots(selectedTrainer, selectedDay, rescheduleAppointmenSlots, selectedDateInput);

    const rescheduleNoAvailability = document.getElementById("reschedule-no-availability-message");

    if (rescheduleAppointmenSlots.children.length === 0) {
    rescheduleNoAvailability.removeAttribute("hidden");
    } else {
    rescheduleNoAvailability.setAttribute("hidden", "");
    }
})



rescheduleAppointmenSlots.addEventListener("click", function(event) {
    event.preventDefault();

    const selectedSlot = rescheduleAppointmenSlots.querySelector(".appointment-slot.is-selected");

    if (selectedSlot !== null) {
        selectedSlot.classList.remove("is-selected")
    }

    const clickedSlot = event.target.closest("button");

    if (clickedSlot === null) {
        return;
    }

    clickedSlot.classList.add("is-selected");

    selectedRescheduleDate = rescheduleDateInput.value;
    selectedRescheduleTime = clickedSlot.dataset.time;

    confirmRescheduleButton.removeAttribute("disabled")
})

let oldBooking;

function generateRescheduledBooking() {
    booking.service = oldBooking.service;
    booking.trainer = oldBooking.trainer;
    booking.form = oldBooking.form;
    booking.date = selectedRescheduleDate;
    booking.time = selectedRescheduleTime;
    booking.status = "confirmed";

    booking.rescheduledFrom = oldBooking.id;

    generateBookingReference();

    oldBooking.rescheduledTo = booking.id;
    oldBooking.status = "rescheduled";

    bookings.push(booking);

    saveBookings();
    renderMatchingBooking();

    bookingDetailsView.removeAttribute("hidden");
    rescheduleBookingView.setAttribute("hidden", "");

    selectedRescheduleDate = null;
    selectedRescheduleTime = null;
}


rescheduleBookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // We are already in the price-change confirmation stage
    if (oldBooking !== undefined && oldBooking !== null) {

        if (acceptPriceChange.checked === false) {
            return;
        }

        const slotIsAvailable = isSlotAvailable(
            oldBooking.trainer,
            selectedRescheduleDate,
            selectedRescheduleTime,
            booking.durationInMinutes,
            oldBooking.id
        );

        if (slotIsAvailable === false) {
            bookingUnavailableSection.removeAttribute("hidden");
            return;
        }

        generateRescheduledBooking();

        oldBooking = null;
        acceptPriceChange.checked = false;
        priceChangeNotice.setAttribute("hidden", "");

        return;
    }


    // First Continue click
    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

    const slotIsAvailable = isSlotAvailable(
        booking.trainer,
        selectedRescheduleDate,
        selectedRescheduleTime,
        matchingService.duration,
        booking.id
    );

    if (slotIsAvailable === false) {
        bookingUnavailableSection.removeAttribute("hidden");
        return;
    }

    bookingUnavailableSection.setAttribute("hidden", "");

    oldBooking = booking;

    booking = {};

    booking.price = matchingService.price;
    booking.durationInMinutes = matchingService.duration;

    // Price changed
    if (booking.price !== oldBooking.price) {
        const newBookingPrice =
            document.getElementById("new-booking-price");

        newBookingPrice.textContent = "£" + booking.price;

        priceChangeNotice.removeAttribute("hidden");

        acceptPriceChange.checked = false;

        // THIS is the part you were missing
        confirmRescheduleButton.setAttribute("disabled", "");

        return;
    }

    // No price change
    generateRescheduledBooking();
    oldBooking = null;
});

const acceptPriceChange = document.getElementById("accept-price-change");

acceptPriceChange.addEventListener("change", function(event) {
    if (event.target.checked) {
        confirmRescheduleButton.removeAttribute("disabled");
    } else {
        confirmRescheduleButton.setAttribute("disabled", "");
    }
});

cancelRescheduleButton.addEventListener("click", function(event) {
    event.preventDefault();

    if (oldBooking !== undefined && oldBooking !== null) {
        booking = oldBooking;
        oldBooking = null;
    }

    acceptPriceChange.checked = false;

    priceChangeNotice.setAttribute("hidden", "");
    rescheduleBookingView.setAttribute("hidden", "");
    bookingDetailsView.removeAttribute("hidden");
});

// cancel booking process //

const cancelBookingButton = document.getElementById("cancel-booking-button")
const cancelBookingView = document.getElementById("cancel-booking-view")

const freeCancellationMessage = document.getElementById("free-cancellation-message")
const lateCancellationMessage = document.getElementById("late-cancellation-message")

let bookingCancellationFee;

cancelBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    if (booking.status === "cancelled" || booking.rescheduledTo !== undefined) {
        return;
    }

    cancelBookingView.removeAttribute("hidden");
    bookingDetailsView.setAttribute("hidden", "");

    const appointmentDate = booking.date;
    const appointmentTime = booking.time;

    const appointmentDateTimeCombined = `${appointmentDate} ${appointmentTime}`;

    const appointmentObject = new Date(appointmentDateTimeCombined);

    const currentDateTime = new Date();

    const differenceInMs = appointmentObject - currentDateTime;

    const differenceInHours = (differenceInMs / 1000 / 60 / 60);

    freeCancellationMessage.setAttribute("hidden", "");
    lateCancellationMessage.setAttribute("hidden", "");

    if (differenceInHours >= cancellationPolicy.noticePeriodValue) {
        bookingCancellationFee = null;
        freeCancellationMessage.removeAttribute("hidden");
    
        const noticePeriod = document.getElementById("notice-period-text");
        noticePeriod.textContent = cancellationPolicy.noticePeriodText;
    } else {
        lateCancellationMessage.removeAttribute("hidden");

        const cancellationFee = document.getElementById("cancellation-fee-text");
        cancellationFee.textContent = cancellationPolicy.cancellationFeeText;

        const cancellationFeeAmount = document.getElementById("cancellation-fee-amount");

        const bookingPrice = booking.price

        const totalFee = Number(bookingPrice * cancellationPolicy.cancellationFee).toFixed(2);

        cancellationFeeAmount.textContent = "£"+totalFee;

        bookingCancellationFee = totalFee;
    }

    manageBookingSection.scrollIntoView({behavior: "smooth"})
})

const keepBookingButton = document.getElementById("keep-booking-button")

keepBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    bookingDetailsView.removeAttribute("hidden");
    cancelBookingView.setAttribute("hidden", "");
})

// confirm cancel booking //

const confirmCancellationButton = document.getElementById("confirm-cancellation-button")

confirmCancellationButton.addEventListener("click", function(event) {
    event.preventDefault();

    booking.status = "cancelled";

    booking.cancellationFee = bookingCancellationFee;

    saveBookings();

    resetBookingFlow();

    cancelBookingView.setAttribute("hidden", "");
    manageBookingSection.removeAttribute("hidden");
    bookingLookUpView.removeAttribute("hidden");
})