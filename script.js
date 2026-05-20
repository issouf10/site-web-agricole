document.addEventListener('DOMContentLoaded', () => {
    console.log("AgroConnect est prêt !");

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