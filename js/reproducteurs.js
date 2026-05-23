// 1. Gestion de la Galerie d'images
function changeImage(element) {
    // Remplacer la source principale
    document.getElementById('main-product-img').src = element.src;
    
    // Mettre à jour l'état actif des miniatures
    document.querySelectorAll('.thumb-item').forEach(thumb => {
        thumb.classList.remove('active');
    });
    element.classList.add('active');
}

// 2. Gestionnaire de Quantités (+ / -)
function updateQty(change) {
    const qtyInput = document.getElementById('product-quantity');
    let currentQty = parseInt(qtyInput.value) || 0;
    const min = parseInt(qtyInput.min) || 1;
    const step = parseInt(qtyInput.step) || 1;

    currentQty += (change * step);

    if (currentQty < min) {
        currentQty = min;
    }
    qtyInput.value = currentQty;
}

// 3. Gestionnaire des Onglets (Tabs)
function openTab(evt, tabId) {
    // Cacher tous les contenus d'onglets
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Désactiver toutes les classes actives des boutons
    document.querySelectorAll('.tab-link').forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
    });

    // Afficher le contenu de l'onglet ciblé et marquer le bouton actif
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
    evt.currentTarget.setAttribute('aria-selected', 'true');
}