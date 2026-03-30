document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('form');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const successMessage = document.getElementById('successMessage');

    // Initialize password toggle icon
    if (passwordToggle) {
        const toggleIcon = passwordToggle.querySelector('.toggle-icon');
        toggleIcon.textContent = '🙈'; // Monkey closing eyes when password is hidden
    }

    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const toggleIcon = passwordToggle.querySelector('.toggle-icon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.textContent = '🙊';
            } else {
                passwordInput.type = 'password';
                toggleIcon.textContent = '🙈';
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        successMessage.classList.add('show');

        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    });

});