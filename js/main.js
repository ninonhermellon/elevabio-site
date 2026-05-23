(function () {
  "use strict";

  const WA_NUMBER = "242068172503";
  const API_BASE = (window.__ELEVABIO__ && window.__ELEVABIO__.apiBase) || "";

  function apiUrl(path) {
    const base = API_BASE.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : "/" + path;
    return base ? base + p : p;
  }

  /* Menu hamburger */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const pageId = document.body.dataset.page;
  if (pageId) {
    document.querySelectorAll(".nav-main a[data-nav]").forEach((a) => {
      if (a.dataset.nav === pageId) a.classList.add("active");
    });
  }

  /* Accordéons (tous les blocs .accordion sur la page) */
  document.querySelectorAll(".accordion").forEach((accordion) => {
    accordion.querySelectorAll(".accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".accordion-item");
        const wasActive = item.classList.contains("active");
        accordion.querySelectorAll(".accordion-item").forEach((el) => {
          el.classList.remove("active");
        });
        if (!wasActive) item.classList.add("active");
      });
    });
  });

  /* Filtres FAQ */
  const faqFilters = document.getElementById("faq-filters");
  if (faqFilters) {
    const groups = document.querySelectorAll(".faq-group");
    faqFilters.querySelectorAll(".faq-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        faqFilters.querySelectorAll(".faq-filter").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        groups.forEach((group) => {
          const cat = group.dataset.category;
          const show = filter === "all" || cat === filter;
          group.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Formulaire commande — produits en stock uniquement */
  const orderForm = document.getElementById("order-form");
  if (orderForm) {
    const stockSelect = document.getElementById("stock_item_id");
    const descEl = document.getElementById("product-description");
    const produitHidden = document.getElementById("produit");
    const raceHidden = document.getElementById("race");
    let stockProducts = [];

    function updateProductDesc() {
      const id = stockSelect ? stockSelect.value : "";
      const p = stockProducts.find((x) => String(x.id) === id);
      if (!descEl) return;
      if (p) {
        descEl.hidden = false;
        descEl.textContent = p.description;
        if (produitHidden) produitHidden.value = p.nom;
        if (raceHidden) raceHidden.value = p.race || "";
      } else {
        descEl.hidden = true;
        descEl.textContent = "";
        if (produitHidden) produitHidden.value = "";
        if (raceHidden) raceHidden.value = "";
      }
    }

    async function loadStockProducts() {
      if (!stockSelect) return;
      try {
        const res = await fetch(apiUrl("api/stock-products.php"));
        const data = await res.json();
        stockSelect.innerHTML = "";
        if (!data.ok || !data.products.length) {
          stockSelect.innerHTML = '<option value="">Aucun produit en stock pour le moment</option>';
          stockSelect.disabled = true;
          if (descEl) {
            descEl.hidden = false;
            descEl.textContent =
              "Aucun article disponible. Contactez-nous par téléphone ou WhatsApp.";
          }
          return;
        }
        stockProducts = data.products;
        stockSelect.disabled = false;
        stockSelect.appendChild(new Option("Choisir un produit en stock", ""));
        data.products.forEach((p) => {
          const opt = new Option(p.label + " — " + p.quantite + " " + p.unite, String(p.id));
          stockSelect.appendChild(opt);
        });
        const params = new URLSearchParams(window.location.search);
        const sku = params.get("sku");
        if (sku) {
          const match = data.products.find((p) => p.sku === sku);
          if (match) stockSelect.value = String(match.id);
        }
        updateProductDesc();
      } catch (err) {
        stockSelect.innerHTML = '<option value="">Erreur de chargement</option>';
      }
    }

    if (stockSelect) {
      stockSelect.addEventListener("change", updateProductDesc);
      loadStockProducts();
    }

    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = document.getElementById("website");
      if (hp && hp.value) return;

      const nom = document.getElementById("nom").value.trim();
      const tel = document.getElementById("telephone").value.trim();
      const email = document.getElementById("email").value.trim();
      const stockId = stockSelect ? stockSelect.value : "";
      const produit = produitHidden ? produitHidden.value : "";
      const race = raceHidden ? raceHidden.value : "";
      const quantite = document.getElementById("quantite").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!nom || !tel || !stockId) {
        alert("Veuillez remplir les champs obligatoires et choisir un produit en stock.");
        return;
      }

      const fd = new FormData(orderForm);
      try {
        const res = await fetch(apiUrl("api/submit-lead.php"), { method: "POST", body: fd });
        const data = await res.json();
        if (!data.ok) {
          alert(data.error || "Impossible d'enregistrer la commande.");
          return;
        }
      } catch (err) {
        /* WhatsApp reste disponible */
      }

      let text = "Bonjour ElevaBio,\n\n";
      text += "Je souhaite passer commande :\n";
      text += "• Nom : " + nom + "\n";
      text += "• Téléphone : " + tel + "\n";
      if (email) text += "• Email : " + email + "\n";
      text += "• Produit : " + produit + "\n";
      if (race) text += "• Race : " + race + "\n";
      if (quantite) text += "• Quantité : " + quantite + "\n";
      if (message) text += "• Message : " + message + "\n";

      const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
    });
  }

  /* Carrousel produits (accueil) */
  const track = document.getElementById("products-track");
  const prodPrev = document.getElementById("prod-prev");
  const prodNext = document.getElementById("prod-next");
  let prodIndex = 0;

  function slideProducts(dir) {
    if (!track) return;
    const cards = track.querySelectorAll(".product-card");
    const visible = window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
    const maxIndex = Math.max(0, cards.length - visible);
    prodIndex = Math.min(maxIndex, Math.max(0, prodIndex + dir));
    const card = cards[0];
    if (!card) return;
    const gap = 20;
    track.style.transform = "translateX(-" + prodIndex * (card.offsetWidth + gap) + "px)";
  }

  if (prodPrev) prodPrev.addEventListener("click", () => slideProducts(-1));
  if (prodNext) prodNext.addEventListener("click", () => slideProducts(1));
  window.addEventListener("resize", () => {
    prodIndex = 0;
    if (track) track.style.transform = "";
  });

  /* Formulaire contact */
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = document.getElementById("website");
      if (hp && hp.value) return;

      const nom = document.getElementById("nom").value.trim();
      const tel = document.getElementById("telephone").value.trim();
      const produit = document.getElementById("produit").value;
      const message = document.getElementById("message").value.trim();

      if (!nom || !tel || !produit || !message) {
        alert("Veuillez remplir les champs obligatoires.");
        return;
      }

      const fd = new FormData(contactForm);
      fd.append("source", "contact");
      try {
        const res = await fetch(apiUrl("api/submit-lead.php"), { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok) {
          const ok = document.getElementById("contact-success");
          if (ok) ok.classList.add("visible");
          contactForm.reset();
        } else {
          alert(data.error || "Une erreur est survenue.");
        }
      } catch (err) {
        alert("Impossible d'envoyer le message. Réessayez ou contactez-nous par téléphone.");
      }
    });
  }

  const opsPrev = document.getElementById("ops-prev");
  const opsNext = document.getElementById("ops-next");
  const opsTrack = document.getElementById("ops-track");
  if (opsTrack && opsPrev && opsNext) {
    opsPrev.addEventListener("click", () => opsTrack.scrollBy({ left: -320, behavior: "smooth" }));
    opsNext.addEventListener("click", () => opsTrack.scrollBy({ left: 320, behavior: "smooth" }));
  }
})();
/* --- MODULE GESTION NEWSLETTER ELEVABIO --- */
const newsForm = document.getElementById('newsletter-form');
const newsModal = document.getElementById('news-modal');

if (newsForm && newsModal) {
    newsForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêche le rechargement de la page
        
        const emailInput = document.getElementById('news-email');
        const emailValue = emailInput.value.trim();
        
        if (emailValue === '') return;

        // Optionnel : Ici vous pourrez faire votre appel Fetch vers l'API d'abonnement
        // Exemple: fetch('api/subscribe.php', { method: 'POST', body: ... })

        // Déclencher l'affichage de la boîte de dialogue de confirmation
        openNewsModal();
        
        // Vider le champ de saisie
        newsForm.reset();
    });
}

function openNewsModal() {
    if (newsModal) {
        newsModal.classList.add('open');
        newsModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Bloque le défilement de l'arrière-plan
    }
}

function closeNewsModal() {
    if (newsModal) {
        newsModal.classList.remove('open');
        newsModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restaure le défilement
    }
}

// Exposer les fonctions au niveau global pour les attributs onclick
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;

// Fermeture au clic sur l'overlay
const modalOverlay = document.querySelector('.modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', closeNewsModal);
}

// Fermeture de la modal si clic sur la touche Échap
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && newsModal && newsModal.classList.contains('open')) {
        closeNewsModal();
    }
});

// Ce code doit être placé dans votre fichier JavaScript externe (ex: script.js)
document.addEventListener('DOMContentLoaded', function () {
  const newsletterForm = document.getElementById('newsletter-form');
  const modalBackdrop = document.getElementById('thankYouModal'); // Votre modal de remerciement
  const closeBtn = document.getElementById('closeModalBtn');
  const backHomeBtn = document.getElementById('backHomeBtn');

  if (newsletterForm && modalBackdrop) {
    // Utilisation d'un écouteur d'événement moderne (respecte le CSP)
    newsletterForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Bloque le rechargement
      
      // Affiche le modal
      modalBackdrop.style.display = 'flex';
      setTimeout(() => {
        modalBackdrop.classList.add('active');
      }, 10);

      newsletterForm.reset();
    });
  }

  const closeModal = () => {
    modalBackdrop.classList.remove('active');
    setTimeout(() => {
      modalBackdrop.style.display = 'none';
    }, 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backHomeBtn) backHomeBtn.addEventListener('click', closeModal);
});