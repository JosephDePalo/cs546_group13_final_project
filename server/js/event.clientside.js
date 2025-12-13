
(function ($) {
    let edit_form = document.getElementById("overview-edit-form");
    edit_form.addEventListener('submit', (event) => {
        event.preventDefault();

        let title = document.getElementById("title");
        let description = document.getElementById("description");
        let start_time = document.getElementById("start_time");
        let end_time = document.getElementById("end_time");
        let max_cap = document.getElementById("max_capacity");
        let address = document.getElementById("address");
        let city = document.getElementById("city");
        let state = document.getElementById("state");
        let location_url = document.getElementById("location_url");
        let errors = document.getElementById("errors");
        let errors_count = 0;

        errors.innerHTML = "";
        $(errors).hide();

        // Checks for title

        title.value = title.value.trim();
        if (title.value === undefined) {
            let error_message = document.createElement("dd");
            error_message.append("Error: title must be defined!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (typeof title.value !== "string") {
            let error_message = document.createElement("dd");
            error_message.append("Error: title must be a string!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (title.value.length === 0) {
            let error_message = document.createElement("dd");
            error_message.append("Error: title cannot be an empty string or string of spaces!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (title.value.length < 5) {
            let error_message = document.createElement("dd");
            error_message.append("Error: title must be at least 5 characters long!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (title.value.length > 100) {
            let error_message = document.createElement("dd");
            error_message.append("Error: title must be at most 100 characters long!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }

        // Checks for description

        if (description.value.length !== 0) {
            if (typeof description.value !== "string") {
                let error_message = document.createElement("dd");
                error_message.append("Error: description must be a string!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
            if (description.value.length < 5) {
                let error_message = document.createElement("dd");
                error_message.append("Error: description must be at least 5 characters long!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
            if (description.value.length > 500) {
                let error_message = document.createElement("dd");
                error_message.append("Error: description must be at most 500 characters long!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
        }

        // Checks for start_time

        if (!isNaN(start_time.value)) {
            let error_message = document.createElement("dd");
            error_message.append("Error: start_time must be defined!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        
        // checks for end_time

        if (!isNaN(end_time.value)) {
            let error_message = document.createElement("dd");
            error_message.append("Error: end_time must be defined!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }

        // checks for max_cap

        if (max_cap.value === undefined) {
            let error_message = document.createElement("dd");
            error_message.append("Error: max_capacity must be defined!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (typeof Number(max_cap.value) !== "number") {
            let error_message = document.createElement("dd");
            error_message.append("Error: max_capacity must be a number!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        }
        if (Number(max_cap.value) < 4) {
            let error_message = document.createElement("dd");
            error_message.append("Error: max_capacity must be at least 4!");
            errors.appendChild(error_message);
            $(errors).show();
            errors_count++;
        } 

        
        // checks for address

        if (address.value.trim().length !== 0) {
            if (typeof address.value !== "string") {
                let error_message = document.createElement("dd");
                error_message.append("Error: address must be a string!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
        }
        // checks for city

        if (city.value.trim().length !== 0) {
            if (typeof city.value !== "string") {
                let error_message = document.createElement("dd");
                error_message.append("Error: city must be a string!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
        }

        // checks for state

        if (state.value.trim().length !== 0) {
            if (typeof state.value !== "string") {
                let error_message = document.createElement("dd");
                error_message.append("Error: state must be a string!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
        }
        

        // checks for location_url

        if (location_url.value.trim().length !== 0) {
            if (typeof location_url.value !== "string") {
                let error_message = document.createElement("dd");
                error_message.append("Error: location_url must be a string!");
                errors.appendChild(error_message);
                $(errors).show();
                errors_count++;
            }
        }

        if (errors_count === 0) {
            edit_form.submit();
        }

    });
})(jQuery);

