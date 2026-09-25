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

let bookings = []

let booking = {}

import {serviceValues, trainers} from './bookingData.js';

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

    booking.service = (serviceValue);

    serviceStepSection.setAttribute("hidden", "");
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

    trainerStepSection.scrollIntoView({behavior: "smooth"})
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

    dateTimeStepSection.scrollIntoView({behavior: "smooth"})
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

function generateTrainerSlots(selectedTrainer, selectedDay, container) {
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
        renderTimeSlot(formattedTime, selectedTrainer, container);
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

        generateTrainerSlots(selectedTrainer, selectedDay, appointmentSlots)
        loadingMessage.setAttribute("hidden", "");
    }

    booking.date = selectedDateInput;

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

    clickedSlot.classList.add("is-selected");

    const dateTimeFormContinueButton = dateTimeSelectionForm.querySelector(".button-primary");

    dateTimeFormContinueButton.removeAttribute("disabled")

    dateTimeSelectionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    booking.time = clickedSlot.dataset.time;
    booking.trainer = clickedSlot.dataset.trainer;

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

    customerDetailsStepSection.scrollIntoView({behavior: "smooth"});
})
})

// booking step 4 customer details // 

const customerDetailsBackButton = customerDetailsStepSection.querySelector(".button-secondary")
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

customerDetailsForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    const form = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email:  emailInput.value,
        phone: phoneInput.value
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
})

// booking step 5 review  //

const reviewBackButton = reviewStepSection.querySelector(".button-secondary") 

reviewBackButton.addEventListener("click", function(event) {
    event.preventDefault();

    delete booking.form;

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
})

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
    reviewPrice.textContent = matchingService.price

    primaryDiv1.appendChild(reviewLabel);
    primaryDiv1.appendChild(sessionType);
    primaryDiv1.appendChild(duration);

    reviewPrimary.appendChild(primaryDiv1);
    reviewPrimary.appendChild(reviewPrice);

    const reviewDetails = document.createElement("dl");

    const labels = ["trainer", "date", "time", "customer", "email", "phone"];

    const fullName = `${booking.form.firstName} ${booking.form.lastName}`

    const values = {
        trainer: matchingService.text,
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

    summaryTotal.textContent = (matchingService.price)
}

// booking confirmation //

const confirmationMessage = document.getElementById("confirmation-message")

const bookingReferenceValue = document.getElementById("booking-reference-value")

const confirmationService = document.getElementById("confirmation-summary-service")
const confirmationTrainer = document.getElementById("confirmation-summary-trainer")
const confirmationDate = document.getElementById("confirmation-summary-date")
const confirmationTime = document.getElementById("confirmation-summary-time")


function generateBookingReference() {
    const generatedNumber = Math.random();

    const selectedNumber = generatedNumber * 1000000;

    const bookingNumber = Math.trunc(selectedNumber);

    const bookingReference = "FF-" + bookingNumber;

    bookingReferenceValue.textContent = bookingReference;

    booking.id = bookingReference;
}

confirmBookingButton.addEventListener("click", function(event) {
    event.preventDefault();

    reviewStepSection.setAttribute("hidden", "");
    bookingConfirmation.removeAttribute("hidden");

    progressStep5.classList.remove("is-active");
    progressStep5.classList.add("is-complete");

    const matchingTrainer = trainers.find(function(trainer) {
        return trainer.value === booking.trainer;
    }); 

    const bookingDate = new Date(booking.date);

    const bookingDayNumber = bookingDate.getDay();

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const selectedDay = days[bookingDayNumber];

    const monthsOfTheYear = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ]

    const monthName = monthsOfTheYear[bookingDate.getMonth()];

    const bookingTime = booking.time;

    confirmationMessage.textContent = "Your appointment with" + " " + matchingTrainer.text + " " +
    "is confirmed for" + " " + selectedDay + " " + bookingDayNumber + " " + monthName + " " +
    "at" + " " + bookingTime;

    generateBookingReference();

    const matchingService = serviceValues.find(function(service) {
        return service.value === booking.service;
    });

    confirmationService.textContent = matchingService.text;
    confirmationTrainer.textContent = matchingTrainer.text;
    confirmationDate.textContent = booking.date;
    confirmationTime.textContent = booking.time;

    bookings.push(booking);

    saveBookings();

    booking = {};
})

function resetBookingFlow() {
    booking = null;

    serviceSelectionForm.reset();
    trainerSelectionForm.reset();
    dateTimeSelectionForm.reset();
    customerDetailsForm.reset();

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

    progressStep1.classList.add("is-active");

    window.scrollTo({
        top: 0,
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
    bookingLayout.setAttribute("hidden", "");

    const findBookingButton = document.getElementById("find-booking-button")

    findBookingButton.removeAttribute("disabled");
})

// booking lookup process //

function renderMatchingBooking() {
    const bookingReference = document.getElementById("manage-booking-reference");
    bookingReference.textContent = booking.id;

    // here put booking status once established

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
    duration.textContent = matchingService.durationText;

    const price = document.getElementById("manage-price");
    price.textContent = matchingService.price;

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

const newSessionButton = document.querySelectorAll(".book-new-session-button")
// isnt working its not identifying newSessionButton //

newSessionButton.addEventListener("click", function(event) {
    event.preventDefault();

    resetBookingFlow()
    serviceStepSection.removeAttribute("hidden");

    bookingDetailsView.setAttribute("hidden", "");
    updateDetailsView.setAttribute("hidden", "");
})

bookingLookUpForm.addEventListener("submit", function(event){
    event.preventDefault();

    const bookingReferenceInput = document.getElementById("booking-reference-input")
    const bookingReference =  bookingReferenceInput.value

    const bookingEmailInput = document.getElementById("booking-email-input")
    const bookingEmail = bookingEmailInput.value


    const matchingBooking = bookings.find(function(booking) {
        if (booking.id === bookingReference && booking.form.email === bookingEmail) {
            return booking
        }
    })

    booking = matchingBooking;

if (booking !== undefined) {
        bookingDetailsView.removeAttribute("hidden");
        bookingLookUpView.setAttribute("hidden", "");

        renderMatchingBooking();
    } else {
        bookingNotFoundMessage.removeAttribute("hidden");
    }
})

// update customer details process //

const updateDetailsButton = document.getElementById("update-booking-details-button")
const updateDetailsView = document.getElementById("update-details-view")
const updateDetailsForm = document.getElementById("update-booking-details-form") 

updateDetailsButton.addEventListener("click", function(event) {
    event.preventDefault();

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

    const customerNewNameInput = document.getElementById("update-customer-name");
    const customerNewEmailInput = document.getElementById("update-customer-email");
    const customerNewPhoneInput = document.getElementById("update-customer-phone");

    const updatedCustomerName =  customerNewNameInput.value;
    const updatedCustomerEmail = customerNewEmailInput.value;
    const updatedCustomerPhone = customerNewPhoneInput.value;

    const nameParts = updatedCustomerName.split(" ")

    const updatedFirstName = nameParts[0];

    const lastNames = nameParts.slice(1);

    const updatedLastName = lastNames.join(" ");

    booking.form.firstName = updatedFirstName;
    booking.form.lastName = updatedLastName;
    booking.form.email = updatedCustomerEmail;
    booking.form.phone = updatedCustomerPhone;

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

rescheduleButton.addEventListener("click", function(event) {
    event.preventDefault();

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

const cancelRescheduleButton = document.getElementById("cancel-reschedule-button")

cancelRescheduleButton.addEventListener("click", function(event) {
    event.preventDefault();

    bookingDetailsView.removeAttribute("hidden");
    rescheduleBookingView.setAttribute("hidden", "");
})

rescheduleDateInput.addEventListener("change", function(event) {
    event.preventDefault();

    rescheduleAppointmenSlots.innerHTML = "";

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

        generateTrainerSlots(selectedTrainer, selectedDay, rescheduleAppointmenSlots);

    const rescheduleNoAvailability = document.getElementById("reschedule-no-availability-message");

    if (rescheduleAppointmenSlots.children.length === 0) {
    rescheduleNoAvailability.removeAttribute("hidden");
    } else {
    rescheduleNoAvailability.setAttribute("hidden", "");
    }
})

const confirmRescheduleButton = document.getElementById("confirm-reschedule-button")

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

    console.log(clickedSlot);

    console.log(booking);

    confirmRescheduleButton.removeAttribute("disabled")

    rescheduleBookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    booking.date = rescheduleDateInput.value;
    booking.time = clickedSlot.dataset.time;

    saveBookings();
    renderMatchingBooking();

    bookingDetailsView.removeAttribute("hidden");
    rescheduleBookingView.setAttribute("hidden", "");

    booking = null;
    })
})

// cancel booking process //





