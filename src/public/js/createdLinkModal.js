import { openModal } from "./modal.js";
import { shareLink } from "./share.js";

const createdShortId = document.body.dataset.createdShortId;

if (createdShortId) {
  const modal = document.getElementById("createdLinkModal");
  const row = document.querySelector(`tr[data-shortid="${createdShortId}"]`);

  if (modal && row) {
    const shortLinkEl = row.querySelector(".short-link");
    const destinationEl = row.querySelector(".redirect-link");

    const shortUrl = shortLinkEl ? shortLinkEl.href : "";
    const destination = destinationEl ? destinationEl.href : "";

    document.getElementById("createdLinkUrl").textContent = shortUrl;
    document.getElementById("createdLinkDestination").textContent = destination;

    document.getElementById("copyCreatedLinkBtn").dataset.url = shortUrl;
    document.getElementById("shareCreatedLink").dataset.url = shortUrl;

    openModal(modal);

    // clean the ?id= param so refresh/back doesn't reopen it, matching dashboard-filter.js's existing pattern
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.replaceState({}, "", url.toString());
  }
}

document.getElementById("shareCreatedLink")?.addEventListener("click", () => {
  const url = document.getElementById("shareCreatedLink").dataset.url;
  if (url) shareLink(url);
});