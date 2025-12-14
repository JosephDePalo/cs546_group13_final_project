(() => {
  const form = document.getElementById("commentForm");
  if (!form) return;

  const eventIdInput = document.getElementById("event_id");
  const parentIdInput = document.getElementById("parent_comment_id");
  const contentInput = document.getElementById("content");
  const errorBox = document.getElementById("commentError");
  const submitBtn = document.getElementById("commentSubmit");

  // mongodb objcetId check
  const isValidObjectId = (v) =>
    /^[a-fA-F0-9]{24}$/.test(String(v || "").trim());

  const showError = (msg) => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  };

  const clearError = () => {
    if (!errorBox) return;
    errorBox.textContent = "";
    errorBox.style.display = "none";
  };

  const validate = () => {
    clearError();

    const event_id = String(eventIdInput?.value || "").trim();
    const parent_comment_id = String(parentIdInput?.value || "").trim();
    const content = String(contentInput?.value || "").trim();

    if (!event_id) {
      return { ok: false, message: "EventId is required." };
    }

    if (!isValidObjectId(event_id)) {
      return { ok: false, message: "Invalid EventId format." };
    }

    if (!content) {
      return { ok: false, message: "Comment content is required." };
    }

    if (content.length > 1000) {
      return {
        ok: false,
        message: `Comment too long (max 1000, now ${content.length}).`,
      };
    }

    if (parent_comment_id && !isValidObjectId(parent_comment_id)) {
      return {
        ok: false,
        message: "Invalid parent comment id.",
      };
    }

    return {
      ok: true,
      data: {
        event_id,
        content,
        ...(parent_comment_id ? { parent_comment_id } : {}),
      },
    };
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const result = validate();
    if (!result.ok) {
      showError(result.message);
      return;
    }

    try {
      submitBtn && (submitBtn.disabled = true);

      // Auth
      const headers = { "Content-Type": "application/json" };

      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resp = await fetch("/api/v1/comments/", {
        method: "POST",
        headers,
        body: JSON.stringify(result.data),
      });

      // Not log in
      if (resp.status === 401) {
        showError("Please log in to post a comment.");
        submitBtn && (submitBtn.disabled = false);
        return;
      }

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || data.success === false) {
        showError(data.message || "Failed to post comment.");
        submitBtn && (submitBtn.disabled = false);
        return;
      }

      // success
      contentInput.value = "";
      parentIdInput && (parentIdInput.value = "");
      clearError();
      location.reload();
    } catch (err) {
      console.error(err);
      showError("Network error. Please try again.");
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  });
})();
