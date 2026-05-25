let cart = JSON.parse(localStorage.getItem('agriCart')) || [];
updateCartUI();

/* Ajouter au panier */
document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {

        const card = button.closest('.card');

        if (!card) return;

        const name = card.getAttribute('data-name');
        const price = card.getAttribute('data-price');

        addToCart(name, price);
    });
});

function addToCart(name, price) {
    cart.push({ name, price });

    localStorage.setItem('agriCart', JSON.stringify(cart));

    updateCartUI();

    alert(`${name} a été ajouté au panier !`);
}

/* Mise à jour du compteur */
function updateCartUI() {
    const count = document.getElementById('cart-count');

    if (count) {
        count.innerText = cart.length;
    }
}

/* Panier (sécurisé) */
const cartBtn = document.querySelector('.cart-nav');

if (cartBtn) {
    cartBtn.addEventListener('click', () => {

        if (cart.length === 0) {
            alert("Panier vide !");
            return;
        }

        console.table(cart);

        alert(
            "Contenu du panier : " +
            cart.map(item => item.name).join(", ")
        );
    });
}