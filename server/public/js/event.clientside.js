/* global $, jQuery */
import xss from "xss"

(function ($) {
  let edit_form = document.getElementById("overview-edit-form");
  edit_form.addEventListener("submit", (event) => {
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

    const put_error = (msg) => {
      let error_message = document.createElement("dd");
      error_message.append(msg);
      errors.appendChild(error_message);
      $(errors).show();
      errors_count++;
    };

    errors.innerHTML = "";
    $(errors).hide();

    title.value = title.value.trim();
    if (title.value === undefined) {
      put_error("Error: title must be defined!");
    }
    if (typeof title.value !== "string") {
      put_error("Error: title must be a string!");
    }
    if (title.value.length === 0) {
      put_error("Error: title cannot be an empty string or string of spaces!");
    }
    if (title.value.length < 5) {
      put_error("Error: title must be at least 5 characters long!");
    }
    if (title.value.length > 100) {
      put_error("Error: title must be less than 101 characters long!");
    }
    if (!title.value.trim().match(/^[a-zA-Z0-9_-\s]+$/)) {
      put_error(
        "Error: title must be only letters, numbers, spaces, _, and -!",
      );
    }

    if (description.value.length !== 0) {
      if (typeof description.value !== "string") {
        put_error("Error: description must be a string!");
      }
      if (description.value.length < 5) {
        put_error("Error: description must be at least 5 characters long!");
      }
      if (description.value.length > 500) {
        put_error("Error: description must be less than 501 characters long!");
      }
    }

    if (!isNaN(start_time.value)) {
      put_error("Error: start_time must be defined!");
    }

    if (!isNaN(end_time.value)) {
      put_error("Error: end_time must be defined!");
    }

    if (max_cap.value === undefined) {
      put_error("Error: max_capacity must be defined!");
    }
    if (typeof Number(max_cap.value) !== "number") {
      put_error("Error: max_capacity must be a number!");
    }
    if (Number(max_cap.value) < 1) {
      put_error("Error: max_capacity must be at least 1!");
    }
    if (Number(max_cap.value) > 200) {
      put_error("Error: max_capacity must be less than 201!");
    }

    if (address.value.trim().length !== 0) {
      if (typeof address.value !== "string") {
        put_error("Error: address must be a string!");
      }
      if (address.value.length > 40) {
        put_error("Error: address must be less than 41 characters long!");
      }
    }

    if (city.value.trim().length !== 0) {
      if (typeof city.value !== "string") {
        put_error("Error: city must be a string!");
      }
      if (city.value.length > 40) {
        put_error("Error: city must be less than 41 characters long!");
      }
    }

    if (state.value.trim().length !== 0) {
      if (typeof state.value !== "string") {
        put_error("Error: state must be a string!");
      }
      if (state.value.length > 40) {
        put_error("Error: state must be less than 41 characters long!");
      }
    }

    if (location_url.value.trim().length !== 0) {
      if (typeof location_url.value !== "string") {
        put_error("Error: location_url must be a string!");
      }
      if (location_url.value.length > 501) {
        put_error("Error: location url must be less than 501 characters long!");
      }
      if (!location_url.value.trim().match(/^https?:\/\//)) {
        put_error(
          "Error: location url must start with 'http://' or 'https://'!",
        );
      }
    }

    // XSS validation

    let validated_title = xss(title.value.trim());
    let validated_description = xss(description.value.trim());
    let validated_start_time = xss(start_time.value);
    let validated_end_time = xss(end_time.value);
    let validated_max_cap = xss(max_cap.value);
    let validated_address = xss(address.value.trim());
    let validated_city = xss(city.value.trim());
    let validated_state = xss(state.value.trim());
    let validated_url = xss(location_url.value.trim());

    if (errors_count === 0) {
      title.value = validated_title;
      description.value = validated_description;
      start_time.value = validated_start_time;
      end_time.value = validated_end_time;
      max_cap.value = validated_max_cap;
      address.value = validated_address;
      city.value = validated_city;
      state.value = validated_state;
      location_url.value = validated_url;
      
      edit_form.submit();
    }
  });

  const rewardBtn = document.getElementById("reward-users-btn");

  if (rewardBtn) {
    rewardBtn.addEventListener("click", async () => {
      const eventId = rewardBtn.dataset.eventId;
      try {
        const res = await fetch(
          `/api/v1/events/${eventId}/rewardRegisteredUsers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!res.ok) {
          throw new Error("Failed to reward users");
        }
        alert("Registered users rewarded successfully");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Error rewarding registered users");
      }
    });
  }
})(jQuery);
