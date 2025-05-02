function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    // Add the "shifted" class to adjust the top nav bar
    document.getElementById("topNav").classList.add("shifted");
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    // Remove the "shifted" class to restore the top nav bar
    document.getElementById("topNav").classList.remove("shifted");
}

// Logout function
function logout() {
    if(confirm("Are you sure you want to log out?")) {
        // In a real application, this would clear session data and redirect to login
        alert("You have been logged out successfully!");
        window.location.href = "index.html"; // Redirect to login page
    }
}

// Simple page transition function
function loadPage(pageName) {
    // Get the content div
    const contentDiv = document.getElementById("pageContent");
    
    // Start fade out animation
    contentDiv.classList.add("fade-out");
    
    // After the fade out animation completes, load the new content
    setTimeout(function() {
        // In a real application, you would load the page content via AJAX
        let newContent = `<h2>${pageName.replace('.html', '')}</h2><p>This is the ${pageName.replace('.html', '')} page.</p>`;
        document.querySelector(".topnav h3").innerText = `City College of Angeles City - ${pageName.replace('.html', '')}`;
        
        // Update the content
        contentDiv.innerHTML = newContent;
        
        // Start fade in animation
        contentDiv.classList.remove("fade-out");
        
        // Optional: Close the sidebar on mobile after selecting a page
        if (window.innerWidth < 768) {
            closeNav();
        }
        
        // Highlight active link
        highlightActiveLink(pageName);
    }, 500); // Match this timing with the CSS transition duration
}

// Highlight the current active link in the sidebar
function highlightActiveLink(pageName) {
    // Find all sidebar links
    const sidebarLinks = document.querySelectorAll(".sidebar a");
    
    // Loop through links and highlight the active one
    sidebarLinks.forEach(link => {
        if (link.getAttribute("onclick") && link.getAttribute("onclick").includes(pageName)) {
            link.style.backgroundColor = "wheat";
            link.style.color = "#000000";
        } else if (link.className !== "closebtn") {
            link.style.backgroundColor = "";
            link.style.color = "#ffffff";
        }
    });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    // Set initial state as Welcome page
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "studentseatplan.html") {
        // If we're on the seat plan page initially, update the title
        document.querySelector(".topnav h3").innerText = "City College of Angeles City - Seat Plan";
    }
});