(function ($) {
    let signin_form = document.getElementById("signin-form");
    signin_form.addEventListener("submit", (event) => {
        event.preventDefault();

        let username = document.getElementById("username");
        let password = document.getElementById("password");

        let errors = document.getElementById("errors");
        let errors_count = 0;

        errors.innerHTML = "";
        $(errors).hide();

        // username checking 

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
            error_message.append("Error: username cannot be an empty string or string of spaces!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (username.value.length < 2) {
            let error_message = document.createElement("dd");
            error_message.append("Error: username must be at least 2 characters long!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (username.value.length > 20) {
            let error_message = document.createElement("dd");
            error_message.append("Error: username must be at most 20 characters long!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }

        // password checking

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
            error_message.append("Error: password cannot be an empty string or string of spaces!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (password.value.length < 8) {
            let error_message = document.createElement("dd");
            error_message.append("Error: password must be at least 8 characters long!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }


        let capital_regex = /[A-Z]/;
        let num_regex = /[0-9]/;
        let special_regex = /[!@#$%^&*]/;

        if (!capital_regex.test(password.value)) {
            let error_message = document.createElement("dd");
            error_message.append("Error: password must contain at least 1 capital letter!");
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
            error_message.append("Error: password must contain at least 1 special character!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }

        if (errors_count === 0) {
            signin_form.submit();
        }
    });
})(jQuery);
