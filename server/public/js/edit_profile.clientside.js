/* global jQuery, $ */

(function ($) {
  let user_edit_form = document.getElementById("user-edit-form");

  if (!user_edit_form) return;

  user_edit_form.addEventListener("submit", (event) => {
    event.preventDefault();

    let first_name = document.getElementById("first_name");
    let last_name = document.getElementById("last_name");
    let email = document.getElementById("email");
    let phone = document.getElementById("phone");
    let gender = document.getElementById("gender");
    let age = document.getElementById("age");
    let city = document.getElementById("city");
    let state = document.getElementById("state");
    let errors = document.getElementById("errors");
    let errors_count = 0;

    const put_error = (msg) => {
      let error_message = document.createElement("dd");
      error_message.textContent = msg;
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    };

    errors.innerHTML = "";
    $(errors).hide();

    // first_name checks
    if (first_name.value.trim().length !== 0) {
      if (first_name.value.trim().length > 50) {
        put_error("Error: first_name can be at most 50 characters!");
      }
    }

    // last_name checks
    if (last_name.value.trim().length !== 0) {
      if (last_name.value.trim().length > 50) {
        put_error("Error: last_name can be at most 50 characters!");
      }
    }

    // email checks
    if (!email.value || typeof email.value !== "string") {
      put_error("Error: email must be defined!");
    } else {
      let email_address_regex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!email_address_regex.test(email.value)) {
        put_error("Error: email_address must be in email address format!");
      }
    }

    // phone checks
    if (phone.value.trim().length !== 0) {
      let phone_regex = /^(1\s?)?(\d{3}|\(\d{3}\))[\s-]?\d{3}[\s-]?\d{4}$/;

      if (!phone_regex.test(phone.value)) {
        put_error("Error: phone number must be in phone number format!");
      }
    }

    // gender checks
    if (gender.value.trim().length !== 0) {
      if (!["Male", "Female", "Other"].includes(gender.value)) {
        put_error("Error: invalid gender selected.");
      }
    }

    // age checks
    if (age.value.trim().length !== 0) {
      let age_num = Number(age.value);

      if (Number.isNaN(age_num)) {
        put_error("Error: age must be a number!");
      } else if (age_num < 13) {
        put_error("Error: age must be at least 13!");
      } else if (age_num > 120) {
        put_error("Error: age must at most 120!");
      }
    }

    // city checks
    if (city.value.trim().length !== 0) {
      if (city.value.length > 40) {
        put_error("Error: city must be less than 41 characters long!");
      }
    }

    // state checks
    if (state.value.trim().length !== 0) {
      if (state.value.length > 40) {
        put_error("Error: state must be less than 41 characters long!");
      }
    }

    if (errors_count === 0) {
      user_edit_form.submit();
    }
  });
})(jQuery);
