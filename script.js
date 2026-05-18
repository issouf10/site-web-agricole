document.addEventListener('DOMContentLoaded', () => {
    console.log("AgroConnect est prêt !");

    // Simulation d'inscription
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Félicitations ! Votre compte a été créé (Simulation).");
            window.location.href = "login.html"; // Redirige vers la page de connexion après inscription
        });
    }

    // Simulation de connexion
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Bienvenue ${email} ! Vous êtes connecté (Simulation).`);
            window.location.href = "dashboard.html"; // Redirige vers le tableau de bord
        });
    }

    // Simulation de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("Vous avez été déconnecté (Simulation).");
            window.location.href = "index.html"; // Redirige vers l'accueil
        });
    }

    // Simulation d'ajout au panier
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert("Produit ajouté au panier (Simulation) !");
        });
    }

    // Toggle Password Visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = 'Masquer';
            } else {
                input.type = 'password';
                this.textContent = 'Voir';
            }
        });
    });
});