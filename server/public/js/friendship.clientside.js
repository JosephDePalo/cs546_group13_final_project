(() => {
  const fetchWithAuth = async (url, options = {}) => {
    return fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  };

  // add friend
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".add-friend-btn");
    if (!btn) return;

    const friendId = btn.dataset.userId;
    if (!friendId) return;

    btn.disabled = true;

    try {
      const res = await fetchWithAuth("/api/v1/friendships/requests", {
        method: "POST",
        body: JSON.stringify({ friend_id: friendId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send friend request.");
        btn.disabled = false;
        return;
      }

      btn.replaceWith(createTextNode("Friend request sent!"));
    } catch (err) {
      console.error(err);
      alert("Network error.");
      btn.disabled = false;
    }
  });

  // accept friend request
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".accept-btn");
    if (!btn) return;

    const friendshipId = btn.dataset.friendshipId;
    if (!friendshipId) return;

    btn.disabled = true;

    try {
      const res = await fetchWithAuth(
        `/api/v1/friendships/requests/${friendshipId}/accept`,
        { method: "PATCH" },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to accept request.");
        btn.disabled = false;
        return;
      }

      btn.closest(".pending-item")?.remove();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Network error.");
      btn.disabled = false;
    }
  });

  // reject friend
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".reject-btn");
    if (!btn) return;

    const friendshipId = btn.dataset.friendshipId;
    if (!friendshipId) return;

    btn.disabled = true;

    try {
      const res = await fetchWithAuth(
        `/api/v1/friendships/requests/${friendshipId}/reject`,
        { method: "PATCH" },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to reject request.");
        btn.disabled = false;
        return;
      }

      btn.closest(".pending-item")?.remove();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Network error.");
      btn.disabled = false;
    }
  });

  // remove friend
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-friend-btn");
    if (!btn) return;

    const friendshipId = btn.dataset.friendshipId;
    if (!friendshipId) return;

    if (!confirm("Are you sure you want to remove this friend?")) return;

    btn.disabled = true;

    try {
      const res = await fetchWithAuth(`/api/v1/friendships/${friendshipId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to remove friend.");
        btn.disabled = false;
        return;
      }

      btn.closest(".friend-item")?.remove();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Network error.");
      btn.disabled = false;
    }
  });

  function createTextNode(text) {
    const p = document.createElement("p");
    p.className = "pending-text";
    p.textContent = text;
    return p;
  }
})();
