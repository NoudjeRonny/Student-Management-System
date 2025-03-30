// Function to toggle the dropdown menu visibility when the username is clicked
function toggleDropdown(event) {
    var dropdownMenu = document.querySelector('.dropdown-menu');
    var nameSpan = document.querySelector('.name1');

    // Prevent the event from propagating to the document click listener
    event.stopPropagation();

    // Toggle visibility of the dropdown
    dropdownMenu.classList.toggle('show');
    
    // Toggle the 'open' class to rotate the caret
    nameSpan.classList.toggle('open');
}

// Close the dropdown when clicking anywhere else on the page
document.addEventListener('click', function (event) {
    var dropdownMenu = document.querySelector('.dropdown-menu');
    var userSpan = document.querySelector('.name1');
    
    if (!userSpan.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show'); // Close the dropdown if click is outside
        userSpan.classList.remove('open'); // Reset the caret rotation
    }
});
// Select all navbar links
const navLinks = document.querySelectorAll('.nav-link');

// Function to add 'active' class
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
    });
});

//test



