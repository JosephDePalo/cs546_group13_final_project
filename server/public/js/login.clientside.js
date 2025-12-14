/* global $, jQuery */

(function ($) {
  let signin_form = document.getElementById("signin-form");
  signin_form.addEventListener("submit", (event) => {
    event.preventDefault();

    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let errors = document.getElementById("errors");
    let errors_count = 0;

    const put_error = (msg) => {
      let error_message = document.createElement("dd");
      error_message.append(msg);
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    };

    errors.innerHTML = "";
    $(errors).hide();

    // username checking
    username.value = username.value.trim();

    if (username.value === undefined) {
      put_error("Error: username must be defined!");
    }
    if (typeof username.value !== "string") {
      put_error("Error: username must be a string!");
    }
    if (username.value.length === 0) {
      put_error(
        "Error: username cannot be an empty string or string of spaces!",
      );
    }
    if (username.value.length < 2) {
      put_error("Error: username must be at least 2 characters long!");
    }
    if (username.value.length > 20) {
      put_error("Error: username must be at most 20 characters long!");
    }

    // password checking
    if (password.value === undefined) {
      put_error("Error: password must be defined!");
    }
    if (typeof password.value !== "string") {
      put_error("Error: password must be a string!");
    }
    if (password.value.length === 0) {
      put_error(
        "Error: password cannot be an empty string or string of spaces!",
      );
    }
    if (password.value.length < 8) {
      put_error("Error: password must be at least 8 characters long!");
    }

    let capital_regex = /[A-Z]/;
    let num_regex = /[0-9]/;
    let special_regex = /[!@#$%^&*]/;

    if (!capital_regex.test(password.value)) {
      put_error("Error: password must contain at least 1 capital letter!");
    }
    if (!num_regex.test(password.value)) {
      put_error("Error: password must contain at least 1 number!");
    }
    if (!special_regex.test(password.value)) {
      put_error("Error: password must contain at least 1 special character!");
    }

    if (errors_count === 0) {
      signin_form.submit();
    }
  });
})(jQuery);
