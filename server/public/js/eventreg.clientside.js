const registerButton = document.getElementById("register-btn");

const showRegisterError = (message) => {
  const errorElement = document.getElementById("register-error");
  if (errorElement) errorElement.textContent = message;
};

registerButton.addEventListener("click", async () => {
  const eventId = registerButton.dataset.eventId;
  if (!eventId) {
    showRegisterError("Invalid event.");
    return;
  }

  const isUnregister =
    registerButton.textContent.trim().toLowerCase() === "unregister";

  registerButton.disabled = true;

  try {
    const res = await fetch(`/api/v1/events/register/${eventId}`, {
      method: isUnregister ? "DELETE" : "POST",
    });

    if (!res.ok) {
      registerButton.disabled = false;

      if (res.status === 409) {
        showRegisterError("You are already registered.");
        return;
      }

      if (res.status === 404) {
        showRegisterError("Registration not found.");
        return;
      }

      showRegisterError("Action failed.");
      return;
    }

    window.location.reload();
  } catch (err) {
    console.error("Event registration toggle error:", err);
    registerButton.disabled = false;
    showRegisterError("Something went wrong.");
  }
});
