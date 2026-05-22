let cart = JSON.parse(localStorage.getItem('agriCart')) || [];
updateCartUI();

document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.parentElement;
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

function updateCartUI() {
    const count = document.getElementById('cart-count');
    if (count) {
        count.innerText = cart.length;
    }
}

document.querySelector('.cart-nav').addEventListener('click', () => {
    console.table(cart);
    alert("Contenu du panier : " + cart.map(item => item.name).join(", "));
});