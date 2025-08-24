// Admin Dashboard JavaScript
// Handles all interactive functionality for the admin dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!checkUserSession()) {
        return;
    }
    
    // Initialize all dashboard functionality
    initializeProfileDropdown();
    initializeSearchAndFilter();
    initializeSidebarNavigation();
    initializeModalFunctionality();
    updateUserGreeting();
});

// Check user session and redirect if not logged in
function checkUserSession() {
    const userSession = localStorage.getItem('userSession');
    
    if (!userSession) {
        window.location.href = 'index.html';
        return false;
    }
    
    try {
        const userData = JSON.parse(userSession);
        
        // Check if session is expired (8 hours)
        const loginTime = new Date(userData.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 8) {
            localStorage.removeItem('userSession');
            window.location.href = 'index.html';
            return false;
        }
        
        // Check if user is an admin
        if (userData.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    } catch (error) {
        localStorage.removeItem('userSession');
        window.location.href = 'index.html';
        return false;
    }
}

// Update user greeting with actual user name
function updateUserGreeting() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            const greetingElement = document.querySelector('.user-greeting');
            if (greetingElement) {
                greetingElement.textContent = `Welcome, ${userData.name}!`;
            }
        } catch (error) {
            console.error('Error updating user greeting:', error);
        }
    }
}

// ========================================
// PROFILE DROPDOWN FUNCTIONALITY
// ========================================

function initializeProfileDropdown() {
    const profileIcon = document.getElementById('profileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (profileIcon && dropdownMenu) {
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Add logout functionality
        const logoutLink = dropdownMenu.querySelector('.dropdown-item:last-child');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
}

// Logout function
function logout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'index.html';
    }
}

// ========================================
// SEARCH AND FILTER FUNCTIONALITY
// ========================================

function initializeSearchAndFilter() {
    const searchInput = document.getElementById('searchComplaints');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const tableRows = document.querySelectorAll('.complaints-table tbody tr');

    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTable);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterTable);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTable);
    }

    function filterTable() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusValue = statusFilter ? statusFilter.value.toLowerCase() : '';
        const priorityValue = priorityFilter ? priorityFilter.value.toLowerCase() : '';
        const categoryValue = categoryFilter ? categoryFilter.value.toLowerCase() : '';

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.querySelector('td:nth-child(6)') ? row.querySelector('td:nth-child(6)').textContent.toLowerCase() : '';
            const priority = row.querySelector('td:nth-child(4)') ? row.querySelector('td:nth-child(4)').textContent.toLowerCase() : '';
            const category = row.querySelector('td:nth-child(3)') ? row.querySelector('td:nth-child(3)').textContent.toLowerCase() : '';
            
            const matchesSearch = text.includes(searchTerm);
            const matchesStatus = !statusValue || status.includes(statusValue);
            const matchesPriority = !priorityValue || priority.includes(priorityValue);
            const matchesCategory = !categoryValue || category.includes(categoryValue);
            
            if (matchesSearch && matchesStatus && matchesPriority && matchesCategory) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// ========================================
// SIDEBAR NAVIGATION FUNCTIONALITY
// ========================================

function initializeSidebarNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const statsSection = document.querySelector('.stats-section');
    const complaintsSection = document.querySelector('.complaints-section');
    const announcementsSection = document.querySelector('.announcements-section');
    const archiveSection = document.querySelector('.archive-section');
    const supportSection = document.querySelector('.support-section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked menu item
            this.parentElement.classList.add('active');
            
            // Hide all sections first
            if (statsSection) statsSection.style.display = 'none';
            if (complaintsSection) complaintsSection.style.display = 'none';
            if (announcementsSection) announcementsSection.style.display = 'none';
            if (archiveSection) archiveSection.style.display = 'none';
            if (supportSection) supportSection.style.display = 'none';
            
            // Show the selected section
            const target = this.getAttribute('href').substring(1);
            
            if (target === 'dashboard') {
                if (statsSection) statsSection.style.display = 'block';
                if (complaintsSection) complaintsSection.style.display = 'block';
            } else if (target === 'announcements') {
                if (announcementsSection) announcementsSection.style.display = 'block';
            } else if (target === 'archive') {
                if (archiveSection) archiveSection.style.display = 'block';
            } else if (target === 'support') {
                if (supportSection) supportSection.style.display = 'block';
            }
        });
    });
}

// ========================================
// MODAL FUNCTIONALITY
// ========================================

function initializeModalFunctionality() {
    const modal = document.getElementById('complaintModal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');

    // Use event delegation for view buttons (works with dynamically added content)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-action') && e.target.textContent === 'View') {
            const row = e.target.closest('tr');
            if (row) {
                const complaintId = row.cells[0].textContent;
                const studentName = row.cells[1].textContent;
                const category = row.cells[2].querySelector('.category-badge') ? row.cells[2].querySelector('.category-badge').textContent : '';
                const priority = row.cells[3].querySelector('.priority-badge') ? row.cells[3].querySelector('.priority-badge').textContent : '';
                const submittedDate = row.cells[4].textContent;
                const status = row.cells[5].textContent;

                // Populate modal with complaint data
                populateModal(complaintId, studentName, category, priority, submittedDate, status);
                
                // Show modal
                if (modal) modal.style.display = 'flex';
            }
        }
    });

    // Close modal functionality
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            if (modal) modal.style.display = 'none';
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            // Only close if clicking on the overlay, not on modal content
            if (e.target === modalOverlay) {
                if (modal) modal.style.display = 'none';
            }
        });
    }

    // Mark as resolved functionality
    const markResolvedBtn = document.getElementById('markResolvedBtn');
    if (markResolvedBtn) {
        markResolvedBtn.addEventListener('click', function() {
            const statusElement = document.getElementById('modalStatus');
            if (statusElement) {
                statusElement.textContent = 'Resolved';
                statusElement.className = 'status-resolved';
                
                // Update the table row status
                const complaintId = document.getElementById('modalComplaintId') ? document.getElementById('modalComplaintId').textContent : '';
                updateTableRowStatus(complaintId, 'Resolved');
                
                // Close modal
                if (modal) modal.style.display = 'none';
            }
        });
    }

    // Update category functionality
    const updateCategoryBtn = document.getElementById('updateCategoryBtn');
    if (updateCategoryBtn) {
        updateCategoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const categorySelect = document.getElementById('categorySelect');
            const newCategory = categorySelect ? categorySelect.value : '';
            
            if (newCategory) {
                const categoryElement = document.getElementById('modalCategory');
                if (categoryElement) {
                    const categoryBadge = getCategoryBadge(newCategory);
                    categoryElement.innerHTML = categoryBadge;
                    
                    // Update the table row category
                    const complaintId = document.getElementById('modalComplaintId') ? document.getElementById('modalComplaintId').textContent : '';
                    updateTableRowCategory(complaintId, categoryBadge);
                    
                    // Show success message
                    showNotification('Category updated successfully!', 'success');
                }
            } else {
                showNotification('Please select a category first!', 'error');
            }
        });
    }

    // Prevent modal from closing when clicking inside modal content
    if (modal) {
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function populateModal(complaintId, studentName, category, priority, submittedDate, status) {
    const elements = {
        'modalComplaintId': complaintId,
        'modalStudentName': studentName,
        'modalCategory': category,
        'modalPriority': priority,
        'modalSubmittedDate': submittedDate,
        'modalStatus': status
    };

    // Update modal elements
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });

    // Set complaint details
    const complaintDetails = document.getElementById('modalComplaintDetails');
    if (complaintDetails) {
        complaintDetails.textContent = 
            `This is the detailed complaint description for ${complaintId}. The student has reported issues that require immediate attention. This complaint was submitted on ${submittedDate} and is currently marked as ${status.toLowerCase()}.`;
    }

    // Reset category dropdown
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.value = '';
    }
}

function updateTableRowStatus(complaintId, newStatus) {
    const tableRows = document.querySelectorAll('.complaints-table tbody tr');
    tableRows.forEach(row => {
        if (row.cells[0] && row.cells[0].textContent === complaintId) {
            const statusCell = row.cells[5];
            if (statusCell) {
                statusCell.textContent = newStatus;
                statusCell.className = 'status-resolved';
            }
        }
    });
}

function updateTableRowCategory(complaintId, categoryBadge) {
    const tableRows = document.querySelectorAll('.complaints-table tbody tr');
    tableRows.forEach(row => {
        if (row.cells[0] && row.cells[0].textContent === complaintId) {
            const categoryCell = row.cells[2];
            if (categoryCell) {
                categoryCell.innerHTML = categoryBadge;
            }
        }
    });
}

function getCategoryBadge(category) {
    const badges = {
        'academic': '<span class="category-badge">📚 Academic</span>',
        'hostel': '<span class="category-badge">🏠 Hostel</span>',
        'mess': '<span class="category-badge">🍽️ Mess</span>',
        'wifi': '<span class="category-badge">📶 WiFi</span>',
        'infrastructure': '<span class="category-badge">🏗️ Infrastructure</span>',
        'transport': '<span class="category-badge">🚌 Transport</span>',
        'other': '<span class="category-badge">📋 Other</span>'
    };
    return badges[category] || '<span class="category-badge">📋 Other</span>';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#28a745';
    } else {
        notification.style.background = '#dc3545';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

 