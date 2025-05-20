document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar .nav-item');
    const currentPath = window.location.pathname;

    // --- Set Active Link ---
    navLinks.forEach(link => {
        // Get the relative path from the href attribute
        const linkPathAttribute = link.getAttribute('href');
        // Construct the expected full path ending based on the link's href
        // Assumes links are relative like 'pages/dashboard.html' or 'dashboard.html'
        // and script is loaded relative to the HTML page.
        // A more robust solution might involve absolute paths or data attributes.
        const expectedPathEnd = linkPathAttribute.startsWith('../')
                             ? '/' + linkPathAttribute.substring(linkPathAttribute.lastIndexOf('/') + 1) // Handle '../pages/file.html' -> '/file.html'
                             : '/' + linkPathAttribute; // Handle 'file.html' -> '/file.html'


        // Check if the current browser path ends with the expected path segment
        if (currentPath.endsWith(expectedPathEnd)) {
             // Remove 'active' from any currently active link first
            document.querySelector('.sidebar .nav-item.active')?.classList.remove('active');
            // Add 'active' to the matched link
            link.classList.add('active');
        }

        // Optional: Add click listener to update active state immediately
        // (though full page reload usually handles this via the logic above)
        link.addEventListener('click', function(e) {
            // Basic immediate feedback, might be overwritten on load
            navLinks.forEach(innerLink => innerLink.classList.remove('active'));
            this.classList.add('active');
            // Allow default link navigation to proceed
        });
    });

    // --- File Uploader & Feedback Logic has been moved to js/dashboard-uploader.js ---
}); // End DOMContentLoaded 