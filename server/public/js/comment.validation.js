import xss from "xss"

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

    const event_id_value = String(eventIdInput?.value || "").trim();
    const parent_comment_id_value = String(parentIdInput?.value || "").trim();
    const content_value = String(contentInput?.value || "").trim();

    if (!event_id_value) {
      return { ok: false, message: "EventId is required." };
    }

    if (!isValidObjectId(event_id_value)) {
      return { ok: false, message: "Invalid EventId format." };
    }

    if (!content_value) {
      return { ok: false, message: "Comment content is required." };
    }

    if (content_value.length > 1000) {
      return {
        ok: false,
        message: `Comment too long (max 1000, now ${content.length}).`,
      };
    }

    if (parent_comment_id_value && !isValidObjectId(parent_comment_id_value)) {
      return {
        ok: false,
        message: "Invalid parent comment id.",
      };
    }
    
    // XSS validating 
    
    let event_id = xss(event_id_value);
    let parent_comment_id = xss(parent_comment_id_value);
    let content = xss(content_value);

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

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const commentId = btn.dataset.commentId;
    if (!commentId) return;

    const confirmed = confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    try {
      const headers = {};

      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const resp = await fetch(`/api/v1/comments/${commentId}`, {
        method: "DELETE",
        headers,
      });

      if (resp.status === 401) {
        alert("Please log in to delete your comment.");
        return;
      }

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        alert(data.message || "Failed to delete comment.");
        return;
      }

      location.reload();
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  });
})();
