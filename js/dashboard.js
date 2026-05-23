/* ==========================================================================
   ELEVA-BIO & ESTAM MYADMIN - DASHBOARD CORE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Moteur du Dashboard initialisé avec succès.");

  // Variable globale temporaire pour mémoriser la ligne du tableau client en cours de modification
  let clientRowToEdit = null;

  /* ==========================================================================
     1. SYSTÈME DE NAVIGATION ROUTING INTERNE (SINGLE PAGE)
     ========================================================================== */
  const menuLinks = document.querySelectorAll(".eb-menu-link");
  const sections = document.querySelectorAll(".dashboard-section");

  if (menuLinks && sections) {
    menuLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        // Supprimer la classe active de tous les liens de navigation
        menuLinks.forEach((item) => item.classList.remove("active"));
        
        // Activer le lien cliqué
        this.classList.add("active");

        // Cacher toutes les sections de contenu
        sections.forEach((section) => section.classList.remove("active"));

        // Récupérer et afficher la section cible
        const targetId = this.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.classList.add("active");
        }
      });
    });
  }

  /* ==========================================================================
     2. SYSTÈME DE FENÊTRES MODALES GLOBAL
     ========================================================================== */
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  };

  /* ==========================================================================
     3. INITIALISATION DES GRAPHIQUES INTERACTIFS (CHART.JS)
     ========================================================================== */
  
  // Graphique Évolution des revenus (Line Chart)
  const ctxRevenue = document.getElementById("revenueChart");
  if (ctxRevenue) {
    new Chart(ctxRevenue, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Chiffre d\'Affaires (FCFA)',
          data: [1200000, 1450000, 1100000, 1850000, 2200000, 2450000],
          borderColor: '#308225', // Vert officiel ElevaBio
          backgroundColor: 'rgba(48, 130, 37, 0.05)',
          borderWidth: 3,
          tension: 0.3, 
          fill: true,
          pointBackgroundColor: '#308225'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: '#f3f4f6' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // Graphique Répartition de l'Activité (Doughnut Chart)
  const ctxCategory = document.getElementById("categoryChart");
  if (ctxCategory) {
    new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: ['Œufs Goliath', 'Poussins', 'Formations'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: ['#308225', '#5CB82C', '#f9932f'],
          borderWidth: 4,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 500 }
            }
          }
        },
        cutout: '75%'
      }
    });
  }

  /* ==========================================================================
     4. CONTRÔLE D'ACCÈS INTERNE : AJOUT COLLABORATEUR
     ========================================================================== */
  const btnAddUser = document.getElementById("btn-add-user");
  if (btnAddUser) {
    btnAddUser.onclick = function () {
      openModal("modal-user");
    };
  }

  const formUser = document.getElementById("form-nouveau-user");
  if (formUser) {
    function handleUserSubmit(e) {
      e.preventDefault();

      const nom = document.getElementById("add-user-nom").value.trim();
      const matricule = document.getElementById("add-user-matricule").value.trim();
      const role = document.getElementById("add-user-role").value;

      const initiales = nom.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

      let roleBadgeHTML = "";
      if (role === "Admin") {
        roleBadgeHTML = `<span class="eb-role-badge badge-admin"><i class="fa-solid fa-user-shield"></i> Super Admin</span>`;
      } else if (role === "Vétérinaire Conseil") {
        roleBadgeHTML = `<span class="eb-role-badge badge-veto"><i class="fa-solid fa-stethoscope"></i> Vétérinaire Conseil</span>`;
      } else {
        roleBadgeHTML = `<span class="eb-role-badge badge-manager"><i class="fa-solid fa-warehouse"></i> Gestionnaire Couvoir</span>`;
      }

      const tbody = document.querySelector("#table-users tbody");
      if (tbody) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>
            <div class="eb-client-cell">
              <div class="eb-client-avatar user-av-color-1">${initiales}</div>
              <div>
                <div class="eb-client-name">${nom}</div>
                <div class="eb-client-location">Matricule: ${matricule}</div>
              </div>
            </div>
          </td>
          <td>${roleBadgeHTML}</td>
          <td><span class="eb-status-badge success">Actif</span></td>
          <td>Jamais connecté</td>
          <td class="eb-text-right">
            <button class="eb-btn-edit btn-trigger-user-edit"><i class="fa-solid fa-sliders"></i> Droits</button>
          </td>
        `;
        tbody.appendChild(newRow);
      }

      formUser.reset();
      closeModal("modal-user");
      attachUserEditEvents(); // Relance sécurisée des écouteurs de droits
    }

    formUser.removeEventListener("submit", handleUserSubmit);
    formUser.addEventListener("submit", handleUserSubmit);
  }

  /* ==========================================================================
     5. CONTRÔLE D'ACCÈS INTERNE : GESTION DES PRIVILÈGES (DROITS)
     ========================================================================== */
  function attachUserEditEvents() {
    const userEditButtons = document.querySelectorAll(".btn-trigger-user-edit");
    if (!userEditButtons) return;
    userEditButtons.forEach((btn) => {
      btn.onclick = handleUserEditClick;
    });
  }

  function handleUserEditClick() {
    const row = this.closest("tr");
    if (!row) return;

    const nameEl = row.querySelector(".eb-client-name");
    const locEl = row.querySelector(".eb-client-location");
    const badgeEl = row.querySelector(".eb-role-badge");

    if (nameEl && locEl && badgeEl) {
      const name = nameEl.textContent;
      const matricule = locEl.textContent.replace("Matricule: ", "").trim();

      const subTitle = document.getElementById("edit-droits-subtitle");
      const inputMatricule = document.getElementById("edit-droits-matricule");
      
      if (subTitle) subTitle.textContent = `Collaborateur : ${name} (${matricule})`;
      if (inputMatricule) inputMatricule.value = matricule;

      const roleBadge = badgeEl.textContent.toLowerCase();
      const pRead = document.getElementById("perm-read");
      const pWrite = document.getElementById("perm-write");
      const pDelete = document.getElementById("perm-delete");

      if (pRead && pWrite && pDelete) {
        if (roleBadge.includes("admin")) {
          pRead.checked = true; pWrite.checked = true; pDelete.checked = true;
        } else if (roleBadge.includes("gestionnaire")) {
          pRead.checked = true; pWrite.checked = true; pDelete.checked = false;
        } else {
          pRead.checked = true; pWrite.checked = false; pDelete.checked = false;
        }
      }
      openModal("modal-droits");
    }
  }

  const formDroits = document.getElementById("form-gestion-droits");
  if (formDroits) {
    formDroits.onsubmit = function (e) {
      e.preventDefault();
      const matriculeTarget = document.getElementById("edit-droits-matricule").value;
      alert(`Les privilèges d'accès pour le matricule ${matriculeTarget} ont été mis à jour.`);
      closeModal("modal-droits");
    };
  }

  /* ==========================================================================
     6. BASE DE DONNÉES CLIENTS : CRUD (AJOUT & MODIFICATION SÉCURISÉS)
     ========================================================================== */
  
  const btnTriggerClient = document.getElementById("btn-trigger-modal-client");
  if (btnTriggerClient) {
    btnTriggerClient.onclick = function () {
      openModal("modal-client-pro");
    };
  }

  function attachClientEditEvents() {
    const editClientButtons = document.querySelectorAll(".btn-trigger-edit-client");
    if (!editClientButtons) return;

    editClientButtons.forEach((btn) => {
      btn.onclick = function () {
        clientRowToEdit = this.closest("tr");
        if (!clientRowToEdit) return;

        const nameEl = clientRowToEdit.querySelector(".eb-client-name");
        const locEl = clientRowToEdit.querySelector(".eb-client-location");
        const badgeEl = clientRowToEdit.querySelector(".eb-breed-badge");

        if (nameEl && locEl && badgeEl && clientRowToEdit.cells.length >= 4) {
          const nomActuel = nameEl.textContent.trim();
          const telActuel = locEl.textContent.trim();
          const villeActuelle = clientRowToEdit.cells[1].textContent.trim();
          const raceActuelle = badgeEl.textContent.trim();
          const cheptelActuel = clientRowToEdit.cells[3].textContent.replace(" sujets", "").trim();

          const inputNom = document.getElementById("edit-cli-nom");
          const inputTel = document.getElementById("edit-cli-tel");
          const inputVille = document.getElementById("edit-cli-ville");
          const selectRace = document.getElementById("edit-cli-race");
          const inputCheptel = document.getElementById("edit-cli-cheptel");

          if (inputNom) inputNom.value = nomActuel;
          if (inputTel) inputTel.value = telActuel;
          if (inputVille) inputVille.value = villeActuelle;
          if (inputCheptel) inputCheptel.value = cheptelActuel;

          if (selectRace) {
            selectRace.value = (raceActuelle === "Goliath" || raceActuelle === "Brahma") ? raceActuelle : "Mixte";
          }

          openModal("modal-client-edit");
        }
      };
    });
  }

  const formClientEdit = document.getElementById("form-client-edit");
  if (formClientEdit) {
    formClientEdit.onsubmit = function (e) {
      e.preventDefault();
      if (clientRowToEdit) {
        const nouveauNom = document.getElementById("edit-cli-nom").value.trim();
        const nouveauTel = document.getElementById("edit-cli-tel").value.trim();
        const nouvelleVille = document.getElementById("edit-cli-ville").value.trim();
        const nouvelleRace = document.getElementById("edit-cli-race").value;
        const nouveauCheptel = document.getElementById("edit-cli-cheptel").value.trim();

        const nouvellesInitiales = nouveauNom.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
        let raceClass = nouvelleRace === "Goliath" ? "goliath" : (nouvelleRace === "Brahma" ? "brahma" : "mixte");

        const avatarEl = clientRowToEdit.querySelector(".eb-client-avatar");
        const nameEl = clientRowToEdit.querySelector(".eb-client-name");
        const locEl = clientRowToEdit.querySelector(".eb-client-location");

        if (avatarEl) avatarEl.textContent = nouvellesInitiales;
        if (nameEl) nameEl.textContent = nouveauNom;
        if (locEl) locEl.textContent = nouveauTel;
        
        if (clientRowToEdit.cells.length >= 4) {
          clientRowToEdit.cells[1].textContent = nouvelleVille;
          clientRowToEdit.cells[2].innerHTML = `<span class="eb-breed-badge ${raceClass}">${nouvelleRace}</span>`;
          clientRowToEdit.cells[3].innerHTML = `<span class="eb-weight-600">${nouveauCheptel} sujets</span>`;
        }

        closeModal("modal-client-edit");
        clientRowToEdit = null;
      }
    };
  }

  const formClientPro = document.getElementById("form-client-pro");
  if (formClientPro) {
    formClientPro.onsubmit = function (e) {
      e.preventDefault();

      const nom = document.getElementById("cli-nom").value.trim();
      const tel = document.getElementById("cli-tel").value.trim();
      const ville = document.getElementById("cli-ville").value.trim();
      const race = document.getElementById("cli-race").value;
      const cheptel = document.getElementById("cli-cheptel").value.trim();

      const initiales = nom.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
      let raceClass = race === "Goliath" ? "goliath" : (race === "Brahma" ? "brahma" : "mixte");

      const tbody = document.querySelector("#table-clients-formal tbody");
      if (tbody) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>
            <div class="eb-client-cell">
              <div class="eb-client-avatar client-av-1">${initiales}</div>
              <div>
                <div class="eb-client-name">${nom}</div>
                <div class="eb-client-location">${tel}</div>
              </div>
            </div>
          </td>
          <td>${ville}</td>
          <td><span class="eb-breed-badge ${raceClass}">${race}</span></td>
          <td><span class="eb-weight-600">${cheptel} sujets</span></td>
          <td class="eb-text-right">
            <button class="eb-btn-edit btn-trigger-edit-client" style="margin-right: 8px;"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="eb-btn-delete-row" onclick="deleteClientRow(this)"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        `;
        tbody.appendChild(newRow);
      }

      formClientPro.reset();
      closeModal("modal-client-pro");
      attachClientEditEvents(); // Relance pour rendre la nouvelle ligne éditable
    };
  }

  // --- AMORÇAGE INITIAL DES ÉCOUTEURS COMPOSANTS ---
  attachUserEditEvents();
  attachClientEditEvents();
});

/* ==========================================================================
   7. FONCTIONS DE SUPPRESSION COMPOSANTS (ACCESSIBLES VIA ONCLICK HTML)
   ========================================================================== */
window.deleteClientRow = function (button) {
  if (confirm("Voulez-vous vraiment supprimer cet éleveur de la base ElevaBio ?")) {
    const row = button.closest("tr");
    if (row) row.remove();
  }
};
/* ==========================================================================
   ELEVA-BIO ENGINE CORE - UNIFIED LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Système centralisé ElevaBio opérationnel.");

  /* ==========================================================================
     1. NAVIGATION SINGLE PAGE (ROUTING INTERNE)
     ========================================================================== */
  const menuLinks = document.querySelectorAll(".eb-menu-link");
  const sections = document.querySelectorAll(".dashboard-section");

  if (menuLinks && sections) {
    menuLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        // Nettoyage des états actifs
        menuLinks.forEach((item) => item.classList.remove("active"));
        sections.forEach((section) => section.classList.remove("active"));

        // Activation de la cible sélectionnée
        this.classList.add("active");
        const targetId = this.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.classList.add("active");
        }
      });
    });
  }

  /* ==========================================================================
     2. SYSTÈME DES FENÊTRES MODALES
     ========================================================================== */
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  };

  /* ==========================================================================
     3. INITIALISATION COMPOSANTE INITIALE DES COMPTES ET CLIENTS
     ========================================================================== */
  const btnAddUser = document.getElementById("btn-add-user");
  if (btnAddUser) {
    btnAddUser.onclick = function () { openModal("modal-user"); };
  }

  /* ==========================================================================
     4. GESTION DYNAMIQUE DU CARNET DES COMMANDES
     ========================================================================== */
  const btnTriggerCmd = document.getElementById("btn-trigger-modal-commande");
  if (btnTriggerCmd) {
    btnTriggerCmd.onclick = function () {
      openModal("modal-commande-add");
    };
  }

  const formCmdAdd = document.getElementById("form-commande-add");
  if (formCmdAdd) {
    formCmdAdd.onsubmit = function (e) {
      e.preventDefault();

      const client = document.getElementById("cmd-client").value.trim();
      const type = document.getElementById("cmd-type").value;
      const qty = document.getElementById("cmd-qty").value.trim();

      let breedClass = type.includes("Goliath") ? "goliath" : (type.includes("Brahma") ? "brahma" : "mixte");

      const tbody = document.querySelector("#table-commandes-formal tbody");
      if (tbody) {
        const newRow = document.createElement("tr");
        newRow.style.borderBottom = "1px solid #f3f4f6";
        newRow.style.fontSize = "14px";
        newRow.innerHTML = `
          <td style="padding: 12px;"><span class="eb-weight-600">${client}</span></td>
          <td style="padding: 12px;"><span class="eb-breed-badge ${breedClass}">${type}</span></td>
          <td style="padding: 12px;"><span class="eb-weight-600">${qty} sujets</span></td>
          <td style="padding: 12px;"><span style="color:#308225; font-weight:600;">À préciser</span></td>
          <td style="padding: 12px;"><span class="eb-status-badge warning">Réservé</span></td>
          <td style="padding: 12px; text-align: right;">
            <button class="eb-btn-delete-row" onclick="deleteRowDirect(this)" style="background: none; border: none; color: #ef4444; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        `;
        tbody.appendChild(newRow);
      }

      formCmdAdd.reset();
      closeModal("modal-commande-add");
    };
  }
});

/* ==========================================================================
   5. INTERFACES GLOBAL DU SYSTÈME (HORS DOMContentLoaded)
   ========================================================================== */
window.deleteRowDirect = function (button) {
  if (confirm("Voulez-vous supprimer cette ligne de données ?")) {
    const row = button.closest("tr");
    if (row) row.remove();
  }
};

  /* ==========================================================================
     9. GESTION DES DEVIS & FACTURES MULTI-LIGNES
     ========================================================================== */
  const btnTriggerFac = document.getElementById("btn-trigger-modal-facture");
  if (btnTriggerFac) {
    btnTriggerFac.onclick = function () { 
      openModal("modal-facture-add"); 
    };
  }

  const btnAddItemRow = document.getElementById("btn-add-item-row");
  if (btnAddItemRow) {
    btnAddItemRow.onclick = function () {
      const container = document.getElementById("invoice-items-container");
      if (container) {
        const newRow = document.createElement("div");
        newRow.className = "invoice-item-row";
        newRow.style = "display: grid; grid-template-columns: 2fr 1fr 1.2fr auto; gap: 10px; margin-bottom: 8px; align-items: center;";
        newRow.innerHTML = `
          <input type="text" class="item-desc" required placeholder="Désignation">
          <input type="number" class="item-qty" required min="1" value="1" placeholder="Qté">
          <input type="number" class="item-price" required min="0" placeholder="P.U (FCFA)">
          <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px;"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(newRow);
      }
    };
  }

  const formFacAdd = document.getElementById("form-facture-add");
  if (formFacAdd) {
    formFacAdd.onsubmit = function (e) {
      e.preventDefault();

      const client = document.getElementById("fac-client").value.trim();
      const typeDoc = document.getElementById("fac-type").value;
      
      const itemRows = document.querySelectorAll(".invoice-item-row");
      let itemsArray = [];
      let totalCalculer = 0;

      itemRows.forEach(row => {
        const desc = row.querySelector(".item-desc").value.trim();
        const qty = parseInt(row.querySelector(".item-qty").value) || 0;
        const price = parseFloat(row.querySelector(".item-price").value) || 0;
        const subtotal = qty * price;
        
        if (desc !== "") {
          totalCalculer += subtotal;
          itemsArray.push({ desc, qty, price, subtotal });
        }
      });

      if (itemsArray.length === 0) {
        alert("Veuillez saisir au moins un article.");
        return;
      }

      const totalFormate = totalCalculer.toLocaleString('fr-FR') + " FCFA";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const prefixe = (typeDoc === "Facture") ? "FAC-2026-" : "DEV-2026-";
      const referenceComplete = prefixe + randomNum;
      const itemsDataString = encodeURIComponent(JSON.stringify(itemsArray));

      const tbody = document.querySelector("#table-factures-formal tbody");
      if (tbody) {
        const newRow = document.createElement("tr");
        newRow.style.borderBottom = "1px solid #f3f4f6";
        newRow.style.fontSize = "14px";
        newRow.innerHTML = `
          <td style="padding: 12px; font-weight: 600;">${referenceComplete}</td>
          <td style="padding: 12px;">${typeDoc}</td>
          <td style="padding: 12px;">${client}</td>
          <td style="padding: 12px; font-weight: 600;">${totalFormate}</td>
        `;
        tbody.appendChild(newRow);
      }
    };
  }

  /* ==========================================================================
     10. GESTION DES PARAMÈTRES GÉNÉRAUX (PERSISTANCE)
     ========================================================================== */
  
  // Sauvegarde automatique des paramètres au clic
  const saveSettingsBtn = document.querySelectorAll('.eb-btn-submit');
  
  saveSettingsBtn.forEach(btn => {
    btn.addEventListener('click', function() {
      const parentForm = this.closest('form');
      const inputs = parentForm.querySelectorAll('input, select');
      
      // On sauvegarde chaque champ dans le stockage du navigateur
      inputs.forEach(input => {
        localStorage.setItem('eb_setting_' + input.id, input.value);
      });
      
      alert("Paramètres enregistrés avec succès !");
    });
  });

  // Chargement des paramètres au démarrage
  window.addEventListener('load', () => {
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
      const savedValue = localStorage.getItem('eb_setting_' + input.id);
      if (savedValue) {
        input.value = savedValue;
      }
    });
  });

  // Forcer l'activation de la première section au chargement si aucune n'est active
  const firstLink = document.querySelector(".eb-menu-link");
  const firstSection = document.querySelector(".dashboard-section");
  
  if (!document.querySelector(".dashboard-section.active")) {
      if(firstLink && firstSection) {
          firstLink.classList.add("active");
          firstSection.classList.add("active");
      }
  }