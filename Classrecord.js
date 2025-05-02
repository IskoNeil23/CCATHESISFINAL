// Store attendance data
let sections = {};
let currentSection = "";

// Initialize the app
function init() {
    loadSections();
    setupEventListeners();
}

// Load sections from localStorage
function loadSections() {
    const savedSections = localStorage.getItem('classRecordSections');
    if (savedSections) {
        sections = JSON.parse(savedSections);
        populateSectionDropdown();
    }
}

// Save sections to localStorage
function saveSections() {
    localStorage.setItem('classRecordSections', JSON.stringify(sections));
    alert("Records saved successfully!");
}

// Populate section dropdown
function populateSectionDropdown() {
    const dropdown = document.getElementById('section-select');
    dropdown.innerHTML = '<option value="">Select Section</option>';
    
    Object.keys(sections).forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        dropdown.appendChild(option);
    });
}

// Display attendance table for selected section
function displayAttendanceTable(section) {
    const table = document.getElementById('attendance-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Clear existing table
    thead.innerHTML = '<th>Student Name</th>';
    tbody.innerHTML = '';
    
    if (!section || !sections[section]) return;
    
    currentSection = section;
    const sectionData = sections[section];
    
    // Add date headers
    sectionData.dates.forEach(date => {
        const th = document.createElement('th');
        th.className = 'date-header';
        th.textContent = formatDate(date);
        thead.appendChild(th);
    });
    
    // Add student rows
    sectionData.students.forEach(student => {
        const tr = document.createElement('tr');
        
        // Add student name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'student-name';
        nameCell.textContent = student;
        tr.appendChild(nameCell);
        
        // Add attendance cells for each date
        sectionData.dates.forEach(date => {
            const td = document.createElement('td');
            td.className = 'editable status-cell';
            td.dataset.student = student;
            td.dataset.date = date;
            
            // Set attendance status
            const status = sectionData.attendance[student] && 
                          sectionData.attendance[student][date];
            
            if (status === 'P') {
                td.textContent = 'P';
                td.classList.add('present');
            } else if (status === 'A') {
                td.textContent = 'A';
                td.classList.add('absent');
            } else {
                td.textContent = '';
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Set up event listeners
function setupEventListeners() {
    // Section dropdown change
    document.getElementById('section-select').addEventListener('change', function() {
        const section = this.value;
        displayAttendanceTable(section);
    });
    
    // New section button
    document.getElementById('new-section-btn').addEventListener('click', function() {
        document.getElementById('section-name').value = '';
        document.getElementById('student-names').value = '';
        document.getElementById('section-modal').style.display = 'block';
    });
    
    // Create section button
    document.getElementById('create-section-btn').addEventListener('click', function() {
        createNewSection();
    });
    
    // Cancel section button
    document.getElementById('cancel-section-btn').addEventListener('click', function() {
        document.getElementById('section-modal').style.display = 'none';
    });
    
    // Add date button
    document.getElementById('add-date-btn').addEventListener('click', function() {
        if (!currentSection) {
            alert("Please select a section first!");
            return;
        }
        
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('new-date').value = formattedDate;
        document.getElementById('date-modal').style.display = 'block';
    });
    
    // Add date confirm button
    document.getElementById('add-date-confirm-btn').addEventListener('click', function() {
        addNewDate();
    });
    
    // Cancel date button
    document.getElementById('cancel-date-btn').addEventListener('click', function() {
        document.getElementById('date-modal').style.display = 'none';
    });
    
    // Edit students button
    document.getElementById('edit-students-btn').addEventListener('click', function() {
        if (!currentSection) {
            alert("Please select a section first!");
            return;
        }
        
        const studentNames = sections[currentSection].students.join('\n');
        document.getElementById('edit-student-names').value = studentNames;
        document.getElementById('edit-students-modal').style.display = 'block';
    });
    
    // Save student list button
    document.getElementById('save-student-list-btn').addEventListener('click', function() {
        saveStudentList();
    });
    
    // Cancel edit students button
    document.getElementById('cancel-edit-students-btn').addEventListener('click', function() {
        document.getElementById('edit-students-modal').style.display = 'none';
    });
    
    // Delete section button
    document.getElementById('delete-section-btn').addEventListener('click', function() {
        if (!currentSection) {
            alert("Please select a section first!");
            return;
        }
        
        if (confirm(`Are you sure you want to delete the section "${currentSection}"?`)) {
            deleteSection();
        }
    });
    
    // Save button
    document.getElementById('save-btn').addEventListener('click', function() {
        saveSections();
    });
    
    // Cell click for attendance marking
    document.getElementById('attendance-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('editable')) {
            toggleAttendance(e.target);
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Create new section
function createNewSection() {
    const sectionName = document.getElementById('section-name').value.trim();
    const studentNamesText = document.getElementById('student-names').value.trim();
    
    if (!sectionName) {
        alert("Please enter a section name!");
        return;
    }
    
    if (sections[sectionName]) {
        alert("A section with this name already exists!");
        return;
    }
    
    const studentNames = studentNamesText.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (studentNames.length === 0) {
        alert("Please enter at least one student name!");
        return;
    }
    
    // Get today's date as the initial date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Create new section object
    sections[sectionName] = {
        students: studentNames,
        dates: [formattedDate],
        attendance: {}
    };
    
    // Initialize attendance object for each student
    studentNames.forEach(student => {
        sections[sectionName].attendance[student] = {};
    });
    
    // Save sections and update UI
    saveSections();
    populateSectionDropdown();
    
    // Select the new section
    document.getElementById('section-select').value = sectionName;
    displayAttendanceTable(sectionName);
    
    // Close the modal
    document.getElementById('section-modal').style.display = 'none';
}

// Add a new date to the current section
function addNewDate() {
    const newDate = document.getElementById('new-date').value;
    
    if (!newDate) {
        alert("Please select a date!");
        return;
    }
    
    if (sections[currentSection].dates.includes(newDate)) {
        alert("This date already exists in the attendance record!");
        return;
    }
    
    // Add the new date to the section
    sections[currentSection].dates.push(newDate);
    
    // Save and refresh
    saveSections();
    displayAttendanceTable(currentSection);
    
    // Close the modal
    document.getElementById('date-modal').style.display = 'none';
}

// Save edited student list
function saveStudentList() {
    const studentNamesText = document.getElementById('edit-student-names').value.trim();
    const studentNames = studentNamesText.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (studentNames.length === 0) {
        alert("Please enter at least one student name!");
        return;
    }
    
    const oldStudents = sections[currentSection].students;
    const oldAttendance = sections[currentSection].attendance;
    const newAttendance = {};
    
    // Preserve attendance data for existing students
    studentNames.forEach(student => {
        if (oldStudents.includes(student)) {
            newAttendance[student] = oldAttendance[student];
        } else {
            newAttendance[student] = {};
        }
    });
    
    // Update section data
    sections[currentSection].students = studentNames;
    sections[currentSection].attendance = newAttendance;
    
    // Save and refresh
    saveSections();
    displayAttendanceTable(currentSection);
    
    // Close the modal
    document.getElementById('edit-students-modal').style.display = 'none';
}

// Delete current section
function deleteSection() {
    delete sections[currentSection];
    saveSections();
    populateSectionDropdown();
    
    // Clear the table
    document.getElementById('attendance-table').querySelector('thead tr').innerHTML = '<th>Student Name</th>';
    document.getElementById('attendance-table').querySelector('tbody').innerHTML = '';
    
    currentSection = "";
    document.getElementById('section-select').value = "";
}

// Toggle attendance status
function toggleAttendance(cell) {
    const student = cell.dataset.student;
    const date = cell.dataset.date;
    
    if (!sections[currentSection].attendance[student]) {
        sections[currentSection].attendance[student] = {};
    }
    
    // Cycle through attendance states: unmarked -> present -> absent -> unmarked
    let currentStatus = sections[currentSection].attendance[student][date];
    
    if (!currentStatus) {
        // Set to present
        sections[currentSection].attendance[student][date] = 'P';
        cell.textContent = 'P';
        cell.classList.add('present');
        cell.classList.remove('absent');
    } else if (currentStatus === 'P') {
        // Set to absent
        sections[currentSection].attendance[student][date] = 'A';
        cell.textContent = 'A';
        cell.classList.add('absent');
        cell.classList.remove('present');
    } else {
        // Clear status
        delete sections[currentSection].attendance[student][date];
        cell.textContent = '';
        cell.classList.remove('present', 'absent');
    }
}

// Navigation functions
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("topNav").classList.add("shifted");
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
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

// Initialize the app when the page loads
window.onload = init;