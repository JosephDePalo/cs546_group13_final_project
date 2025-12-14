(function () {
  const form = document.getElementById("reports-form");
  const errors = document.getElementById("errors");

  if (!form || !errors) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errors.innerHTML = "";
    errors.style.display = "none";

    let errorCount = 0;

    const putError = (msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      errors.appendChild(li);
      errors.style.display = "block";
      errorCount++;
    };

    const reason = form.reason.value.trim();
    const description = form.description.value.trim();
    const severity = form.severity.value;
    const targetType = form.target_type.value;
    const targetId = form.target_id.value;

    // Client-side validation
    if (!reason) putError("Reason is required.");
    if (!description) putError("Description is required.");
    if (!["High", "Medium", "Low"].includes(severity))
      putError("Invalid severity selected.");
    if (!targetType || !targetId) putError("Invalid report target.");

    if (errorCount > 0) return;

    try {
      const payload = {
        target_type: targetType,
        target_id: targetId,
        reason,
        description,
        severity,
      };

      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        putError(data.message || "Failed to submit report.");
        return;
      }

      // Handling redirect
      if (data.redirectTo) {
        window.location.href = "/api/v1" + data.redirectTo;
      }
    } catch (err) {
      console.error(err);
      putError("Something went wrong while submitting the report.");
    }
  });
})();
