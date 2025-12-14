import xss from "xss"

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

    const reason_value = form.reason.value.trim();
    const description_value = form.description.value.trim();
    const severity_value = form.severity.value;
    const targetType_value = form.target_type.value;
    const targetId_value = form.target_id.value;

    // Client-side validation
    if (!reason_value) putError("Reason is required.");
    if (!description_value) putError("Description is required.");
    if (!["High", "Medium", "Low"].includes(severity_value))
      putError("Invalid severity selected.");
    if (!targetType_value || !targetId_value) putError("Invalid report target.");

    if (errorCount > 0) return;

    // XSS validation

    let reason = xss(reason_value);
    let description = xss(description_value);
    let severity = xss(severity_value);
    let targetType = xss(targetType_value);
    let targetId = xss(targetId_value);

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
        window.location.href = data.redirectTo;
      }
    } catch (err) {
      console.error(err);
      putError("Something went wrong while submitting the report.");
    }
  });
})();
