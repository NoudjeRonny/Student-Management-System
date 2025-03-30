// Function to hide messages after a set timeout
window.onload = function() {
    setTimeout(function() {
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        if (successMessage) {
            successMessage.style.display = 'none';  // Hide success message
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';  // Hide error message
        }
    }, 5000);  // 5000ms (5 seconds) delay
};
