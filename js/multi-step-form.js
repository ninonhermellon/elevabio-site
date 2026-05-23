document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("multi-step-form");
  const steps = Array.from(document.querySelectorAll(".form-step"));
  const indicators = Array.from(document.querySelectorAll(".step-indicator"));
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  let currentStep = 1;

  // Mettre à jour l'affichage de l'étape et de la barre de progression
  function updateFormProgress() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep - 1);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentStep - 1);
      indicator.classList.toggle("completed", index < currentStep - 1);
    });

    // Gestion de l'état des boutons navigation
    btnPrev.disabled = currentStep === 1;
    
    if (currentStep === steps.length) {
      btnNext.textContent = "Confirmer l'inscription";
      btnNext.style.backgroundColor = "var(--secondary-orange, #f9932f)";
      buildSummary();
    } else {
      btnNext.textContent = "Suivant";
      btnNext.style.backgroundColor = "var(--primary-green, #308225)";
    }
  }

  // Valider les champs requis de l'étape courante uniquement
  function validateCurrentStep() {
    const activeStepFields = steps[currentStep - 1].querySelectorAll("[required]");
    let allValid = true;

    activeStepFields.forEach(field => {
      if (!field.checkValidity()) {
        field.reportValidity();
        allValid = false;
      }
    });
    return allValid;
  }

  // Construire le résumé dynamique pour la dernière étape
  function buildSummary() {
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const niveau = form.querySelector('input[name="niveau"]:checked').value;
    const paiement = form.querySelector('input[name="paiement"]:checked').value;

    document.getElementById("summary-name").textContent = `${nom} ${prenom}`;
    document.getElementById("summary-level").textContent = `Module ${niveau.charAt(0).toUpperCase() + niveau.slice(1)}`;
    document.getElementById("summary-payment").textContent = paiement;
  }

  // Événement clic sur bouton Suivant / Soumettre
  btnNext.addEventListener("click", () => {
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length) {
      currentStep++;
      updateFormProgress();
    } else {
      // Soumission finale du formulaire
      alert("Félicitations ! Votre demande d'inscription a bien été prise en compte par ElevaBio. Nous vous contacterons sous peu.");
      form.reset();
      currentStep = 1;
      updateFormProgress();
    }
  });

  // Événement clic sur bouton Précédent
  btnPrev.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateFormProgress();
    }
  });
});