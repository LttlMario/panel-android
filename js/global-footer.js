(() => {
  "use strict";

  const CONFIG = Object.freeze({
    revolutUrl: "https://revolut.me/mariomihail",
    changelogUrl: "changelog.html",
    thankYouUrl: "thank-you.html"
  });

  function getReleaseVersion() {
    return window.PANEL_RELEASE?.version || "3.0.0";
  }

  function removeLegacySupportElements() {
    [
      "#support-project-btn",
      "#support-modal",
      "#support-confirm-modal",
      ".support-project-floating",
      ".support-project-footer",
      "[data-old-support-widget]"
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!element.closest("#panel-global-footer") && !element.closest("#panel-support-overlay")) {
          element.remove();
        }
      });
    });
  }

  function findFooterHost() {
    const explicit = document.querySelector("[data-panel-footer-host]");
    if (explicit) return explicit;

    const main = document.querySelector("main");
    if (main) {
      const style = getComputedStyle(main);
      if (style.display !== "flex") {
        main.style.display = "flex";
        main.style.flexDirection = "column";
      }
      if (!main.style.minHeight && style.minHeight === "0px") {
        main.style.minHeight = "100%";
      }
      return main;
    }

    document.documentElement.style.minHeight = "100%";
    document.body.style.minHeight = "100vh";
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    return document.body;
  }

  function createFooter() {
    if (document.getElementById("panel-global-footer")) return;

    const footer = document.createElement("footer");
    footer.id = "panel-global-footer";
    footer.setAttribute("aria-label", "Informații proiect și donații");
    footer.innerHTML = `
      <div class="pgf-inner">
        <p class="pgf-meta">
          © 2026 <span class="pgf-brand">Panel by Little Mario</span>
          <span aria-hidden="true"> • </span>
          <a class="pgf-version" href="${CONFIG.changelogUrl}" title="Vezi noutățile și actualizările">v${getReleaseVersion()}</a>
        </p>
        <p class="pgf-support">❤️ Susține dezvoltarea proiectului</p>
        <button class="pgf-donate" type="button" id="panel-donate-button">
          💳 Donează prin Revolut
        </button>
      </div>
    `;

    findFooterHost().appendChild(footer);
  }

  function createDialog() {
    if (document.getElementById("panel-support-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "panel-support-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section id="panel-support-dialog" role="dialog" aria-modal="true" aria-labelledby="panel-support-title">
        <div class="psd-head">
          <h2 id="panel-support-title">❤️ Susține dezvoltarea proiectului</h2>
          <button class="psd-close" type="button" aria-label="Închide">×</button>
        </div>
        <div class="psd-body" id="panel-support-content"></div>
        <div class="psd-actions" id="panel-support-actions"></div>
      </section>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDialog();
    });
    overlay.querySelector(".psd-close").addEventListener("click", closeDialog);
  }

  function setDialog(bodyHtml, actionsHtml) {
    const overlay = document.getElementById("panel-support-overlay");
    overlay.querySelector("#panel-support-content").innerHTML = bodyHtml;
    overlay.querySelector("#panel-support-actions").innerHTML = actionsHtml;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.querySelector(".psd-button")?.focus();
  }

  function closeDialog() {
    const overlay = document.getElementById("panel-support-overlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function openInitialDialog() {
    setDialog(
      `<p>Panelul este dezvoltat și întreținut în timpul liber. Donațiile sunt complet opționale, iar orice contribuție ajută la continuarea dezvoltării.</p>
       <p class="psd-note">Plata se deschide pe pagina oficială Revolut într-un tab nou.</p>`,
      `<button class="psd-button psd-secondary" type="button" data-action="cancel">Mai târziu</button>
       <button class="psd-button psd-primary" type="button" data-action="open-revolut">💳 Continuă către Revolut</button>`
    );
  }

  function openConfirmationDialog() {
    setDialog(
      `<p>Pagina Revolut a fost deschisă într-un tab nou.</p>
       <p class="psd-note">Revolut.me nu transmite automat confirmarea plății către panel. Apasă „Da, am donat” numai după ce ai finalizat contribuția.</p>`,
      `<button class="psd-button psd-secondary" type="button" data-action="not-yet">Nu încă</button>
       <button class="psd-button psd-primary" type="button" data-action="confirmed">❤️ Da, am donat</button>`
    );
  }

  function openRevolut() {
      const revolutLink = document.createElement("a");

      revolutLink.href = CONFIG.revolutUrl;
      revolutLink.target = "_blank";
      revolutLink.rel = "noopener noreferrer";

      document.body.appendChild(revolutLink);
      revolutLink.click();
      revolutLink.remove();

      openConfirmationDialog();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const donate = event.target.closest("#panel-donate-button");
      if (donate) {
        event.preventDefault();
        openInitialDialog();
        return;
      }

      const action = event.target.closest("[data-action]")?.dataset.action;
      if (!action) return;

      if (action === "cancel" || action === "not-yet") closeDialog();
      if (action === "open-revolut") openRevolut();
      if (action === "confirmed") {
        const returnTo = encodeURIComponent(location.pathname.split("/").pop() || "index.html");
        location.href = `${CONFIG.thankYouUrl}?from=${returnTo}`;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDialog();
    });
  }

  function init() {
    removeLegacySupportElements();
    createFooter();
    createDialog();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
