/* global jQuery, $ */
import xss from "xss";

(function ($) {
  let signup_form = document.getElementById("signup-form");
  signup_form.addEventListener("submit", (event) => {
    event.preventDefault();

    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let confirm_password = document.getElementById("confirm_password");

    let errors = document.getElementById("errors");
    let errors_count = 0;

    errors.innerHTML = "";
    $(errors).hide();

    // Username checks

    username.value = username.value.trim();
    if (username.value === undefined) {
      let error_message = document.createElement("dd");
      error_message.append("Error: username must be defined!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (typeof username.value !== "string") {
      let error_message = document.createElement("dd");
      error_message.append("Error: username must be a string!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (username.value.length === 0) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: username cannot be an empty string or string of spaces!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (username.value.length < 2) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: username must be at least 2 characters long!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (username.value.length > 20) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: username must be at most 20 characters long!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    // Email checks

    if (email.value === undefined) {
      let error_message = document.createElement("dd");
      error_message.append("Error: email must be defined!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (typeof email.value !== "string") {
      let error_message = document.createElement("dd");
      error_message.append("Error: email must be a string!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (email.value.length === 0) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: email cannot be an empty string or string of spaces!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    let email_address_regex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email_address_regex.test(email.value)) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: email_address must be in email address format!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    // password checks

    if (password.value === undefined) {
      let error_message = document.createElement("dd");
      error_message.append("Error: password must be defined!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (typeof password.value !== "string") {
      let error_message = document.createElement("dd");
      error_message.append("Error: password must be a string!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (password.value.length === 0) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: password cannot be an empty string or string of spaces!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }
    if (password.value.length < 8) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: password must be at least 8 characters long!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    let capital_regex = /[A-Z]/;
    let num_regex = /[0-9]/;
    let special_regex = /[!@#$%^&*]/;

    if (!capital_regex.test(password.value)) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: password must contain at least 1 capital letter!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    if (!num_regex.test(password.value)) {
      let error_message = document.createElement("dd");
      error_message.append("Error: password must contain at least 1 number!");
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    if (!special_regex.test(password.value)) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: password must contain at least 1 special character!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    // confirm password checks

    console.log("confirm password reached!");
    if (confirm_password.value !== password.value) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: confirm_password must be the same as password!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    // confirm password checks

    console.log("confirm password reached!");
    if (confirm_password.value !== password.value) {
      let error_message = document.createElement("dd");
      error_message.append(
        "Error: confirm_password must be the same as password!",
      );
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    }

    // XSS validation

    let validated_username = xss(username.value.trim());
    let validated_email = xss(email.value.trim());

    if (errors_count === 0) {
      username.value = validated_username;
      email.value = validated_email;

      signup_form.submit();
    }
  });
})(jQuery);
