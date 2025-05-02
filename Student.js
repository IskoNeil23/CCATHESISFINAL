// Store letters in local storage
let letters = JSON.parse(localStorage.getItem('excuseLetters')) || [];

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

// Page transition function
function loadPage(pageName) {
    // Get the content div
    const contentDiv = document.getElementById("pageContent");
    
    // Start fade out animation
    contentDiv.classList.add("fade-out");
    
    // After the fade out animation completes, load the new content
    setTimeout(function() {
        // In a real application, you would load the page content via AJAX
        let newContent = "";
        
        switch(pageName) {
            case "schedule.html":
                newContent = "<h2>Class Schedule</h2><p>Your class schedule for the current semester will appear here.</p>";
                document.querySelector(".topnav h3").innerText = "City College of Angeles City - Schedule";
                break;
            case "registration.html":
                newContent = "<h2>Certificate of Registration</h2><p>Your registration information and enrolled courses will appear here.</p>";
                document.querySelector(".topnav h3").innerText = "City College of Angeles City - Certificate of Registration";
                break;
            case "seatplan.html":
                newContent = "<h2>Seat Plan</h2><p>Your examination seat assignments will appear here.</p>";
                document.querySelector(".topnav h3").innerText = "City College of Angeles City - Seat Plan";
                break;
            case "excuse.html":
                // Generate the excuse letter content
                newContent = generateExcuseLetterContent();
                document.querySelector(".topnav h3").innerText = "City College of Angeles City - Excuse Letters";
                break;
            default:
                newContent = "<h2>Welcome</h2><p>Please select an option from the menu.</p>";
        }
        
        // Update the content
        contentDiv.innerHTML = newContent;
        
        // Add event listeners for the excuse letter functionality if that page is loaded
        if (pageName === "excuse.html") {
            setupExcuseLetterEventListeners();
        }
        
        // Start fade in animation
        contentDiv.classList.remove("fade-out");
        
        // Optional: Close the sidebar on mobile after selecting a page
        if (window.innerWidth < 768) {
            closeNav();
        }
        
        // Update the active link in the sidebar
        highlightActiveLink(pageName);
    }, 500); // Match this timing with the CSS transition duration
}

// Function to generate the HTML content for the excuse letter page
function generateExcuseLetterContent() {
    return `
        <h2>Excuse Letters</h2>
        <p>Submit your excuse letters for approval. You can upload documents and track their approval status.</p>
        
        <div class="letter-form">
            <h3>Submit New Excuse Letter</h3>
            <form id="letterForm">
                <div class="form-group">
                    <label for="absenceDate">Date of Absence:</label>
                    <input type="date" id="absenceDate" name="absenceDate" required>
                </div>
                
                <div class="form-group">
                    <label for="reason">Reason for Absence:</label>
                    <select id="reason" name="reason" required>
                        <option value="">Select a reason</option>
                        <option value="Medical">Medical</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="Personal Emergency">Personal Emergency</option>
                        <option value="Academic Conflict">Academic Conflict</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="details">Additional Details:</label>
                    <textarea id="details" name="details" placeholder="Please provide additional information about your absence..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="letterFile">Upload Supporting Document:</label>
                    <input type="file" id="letterFile" name="letterFile" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                    <div id="filePreview" class="file-preview"></div>
                </div>
                
                <button type="submit" class="submit-btn">Submit Letter</button>
            </form>
        </div>
        
        <div class="letter-list">
            <h3>Submitted Letters</h3>
            <div id="lettersList">
                <!-- Letters will be loaded here dynamically -->
            </div>
        </div>
    `;
}

// Function to set up the event listeners for the excuse letter functionality
function setupExcuseLetterEventListeners() {
    // Handle file preview
    document.getElementById('letterFile').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('filePreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (file.type.startsWith('image/')) {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;">`;
                } else {
                    preview.innerHTML = `<p>File selected: ${file.name}</p>`;
                }
            }
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });

    // Handle form submission
    document.getElementById('letterForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const absenceDate = document.getElementById('absenceDate').value;
        const reason = document.getElementById('reason').value;
        const details = document.getElementById('details').value;
        const file = document.getElementById('letterFile').files[0];
        
        let fileData = null;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            fileData = e.target.result;
            
            // Create new letter object
            const newLetter = {
                id: Date.now(),
                absenceDate,
                reason,
                details,
                fileName: file ? file.name : null,
                fileData: fileData,
                submissionDate: new Date().toISOString(),
                status: 'Pending',
                comments: []
            };
            
            // Add to letters array
            letters.push(newLetter);
            
            // Save to local storage
            localStorage.setItem('excuseLetters', JSON.stringify(letters));
            
            // Reset form
            document.getElementById('letterForm').reset();
            document.getElementById('filePreview').innerHTML = '';
            
            // Refresh display
            displayLetters();
            
            alert('Your excuse letter has been submitted successfully!');
        };
        
        if (file) {
            reader.readAsDataURL(file);
        } else {
            reader.onload();  // Call onload directly if no file
        }
    });

    // Display the existing letters
    displayLetters();
}

// Display letters in the list
function displayLetters() {
    const lettersList = document.getElementById('lettersList');
    if (!lettersList) return; // Safety check
    
    lettersList.innerHTML = '';
    
    if (letters.length === 0) {
        lettersList.innerHTML = '<p>No letters submitted yet.</p>';
        return;
    }
    
    // Sort letters by submission date (newest first)
    const sortedLetters = [...letters].sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    sortedLetters.forEach(letter => {
        const letterDate = new Date(letter.absenceDate).toLocaleDateString();
        const submissionDate = new Date(letter.submissionDate).toLocaleDateString();
        
        let statusClass = '';
        switch(letter.status) {
            case 'Approved':
                statusClass = 'status-approved';
                break;
            case 'Rejected':
                statusClass = 'status-rejected';
                break;
            default:
                statusClass = 'status-pending';
        }
        
        const letterItem = document.createElement('div');
        letterItem.className = 'letter-item';
        letterItem.innerHTML = `
            <h4>Excuse Letter - ${letterDate}</h4>
            <p><strong>Reason:</strong> ${letter.reason}</p>
            <p><strong>Submitted:</strong> ${submissionDate}</p>
            <p><strong>Status:</strong> <span class="letter-status ${statusClass}">${letter.status}</span></p>
            ${letter.fileName ? `<p><strong>Attached File:</strong> ${letter.fileName}</p>` : ''}
            ${letter.comments.length > 0 ? 
                `<div class="letter-comments">
                    <p><strong>Comments:</strong></p>
                    <ul>${letter.comments.map(comment => `<li>${comment}</li>`).join('')}</ul>
                </div>` : ''}
            <div class="letter-actions">
                <button onclick="viewLetter(${letter.id})">View Details</button>
                ${letter.status === 'Pending' ? `<button onclick="deleteLetter(${letter.id})">Delete</button>` : ''}
            </div>
        `;
        
        lettersList.appendChild(letterItem);
    });
}

// View letter details
function viewLetter(id) {
    const letter = letters.find(l => l.id === id);
    if (!letter) return;
    
    let filePreview = '';
    if (letter.fileData && letter.fileName) {
        if (letter.fileData.startsWith('data:image')) {
            filePreview = `<img src="${letter.fileData}" style="max-width: 100%;">`;
        } else {
            filePreview = `<p>File: ${letter.fileName}</p>
                          <a href="${letter.fileData}" download="${letter.fileName}" target="_blank">Download File</a>`;
        }
    }
    
    const letterDate = new Date(letter.absenceDate).toLocaleDateString();
    const details = `
        <h3>Excuse Letter Details</h3>
        <p><strong>Absence Date:</strong> ${letterDate}</p>
        <p><strong>Reason:</strong> ${letter.reason}</p>
        <p><strong>Details:</strong> ${letter.details || 'No additional details provided.'}</p>
        ${filePreview ? `<div class="file-preview">${filePreview}</div>` : ''}
    `;
    
    alert(details);
}

// Delete letter
function deleteLetter(id) {
    if (confirm('Are you sure you want to delete this letter?')) {
        letters = letters.filter(l => l.id !== id);
        localStorage.setItem('excuseLetters', JSON.stringify(letters));
        displayLetters();
    }
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
        // If we're on the seat plan page initially, load that content
        loadPage("seatplan.html");
    }
});