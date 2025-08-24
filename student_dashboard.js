// Student Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (!checkUserSession()) {
    return;
  }
  
  // Initialize all functionality
  initializeProfileDropdown();
  initializeSidebarNavigation();
  initializeSearchAndFilter();
  initializeQuickTemplates();
  initializeComplaintForm();
  initializeRateButtons();
  initializeFlagButtons();
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
    
    // Check if user is a student
    if (userData.role !== 'student') {
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

// Profile Dropdown Functionality
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

// Sidebar Navigation Functionality
function initializeSidebarNavigation() {
  const menuLinks = document.querySelectorAll('.menu-link');
  const panels = document.querySelectorAll('.panel');
  
  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links and panels
      menuLinks.forEach(l => l.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Show corresponding panel
      const targetPanel = this.getAttribute('data-panel');
      const panel = document.getElementById(targetPanel);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });
}

// Search and Filter Functionality
function initializeSearchAndFilter() {
  const searchInput = document.getElementById('searchComplaints');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const tableRows = document.querySelectorAll('.complaints-table tbody tr');

  function filterTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    const priorityValue = priorityFilter.value.toLowerCase();

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const status = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
      const priority = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      
      const matchesSearch = text.includes(searchTerm);
      const matchesStatus = !statusValue || status.includes(statusValue);
      const matchesPriority = !priorityValue || priority.includes(priorityValue);
      
      if (matchesSearch && matchesStatus && matchesPriority) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterTable);
  }
  
  if (priorityFilter) {
    priorityFilter.addEventListener('change', filterTable);
  }
}

// Quick Templates Functionality
function initializeQuickTemplates() {
  const templateSelect = document.getElementById('quick-templates');
  
  if (templateSelect) {
    templateSelect.addEventListener('change', fillTemplate);
  }
}

// Quick templates functionality (global function for HTML onchange)
function fillTemplate() {
  const templateSelect = document.getElementById('quick-templates');
  const detailTextarea = document.getElementById('complaint-detail');
  const prioritySelect = document.getElementById('complaint-priority');

  const templates = {
    'wifi-issue': {
      text: 'I am experiencing WiFi connectivity issues in my room. The connection is very slow and frequently disconnects. This is affecting my online classes and assignments. Please help resolve this issue.',
      priority: 'high'
    },
    'mess-food': {
      text: 'I have concerns about the mess food quality and hygiene. The food often tastes stale and I have noticed some hygiene issues. Please look into improving the food quality and cleanliness standards.',
      priority: 'medium'
    },
    'hostel-maintenance': {
      text: 'My hostel room requires maintenance. There are issues with the electrical fittings and some furniture needs repair. Please arrange for maintenance work.',
      priority: 'medium'
    },
    'academic-support': {
      text: 'I need academic support and clarification regarding my course requirements. I would like to discuss my academic progress and get guidance on my studies.',
      priority: 'low'
    },
    'transport-issue': {
      text: 'I am facing problems with the transport service. The buses are often late and overcrowded. This is causing inconvenience for daily commute.',
      priority: 'medium'
    }
  };

  const selectedTemplate = templateSelect.value;
  if (selectedTemplate && templates[selectedTemplate]) {
    const template = templates[selectedTemplate];
    detailTextarea.value = template.text;
    prioritySelect.value = template.priority;
  }
}

// Complaint Form Submission
function initializeComplaintForm() {
  const complaintForm = document.getElementById('complaintForm');
  
  if (complaintForm) {
    complaintForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const priority = document.getElementById('complaint-priority').value;
      const details = document.getElementById('complaint-detail').value;
      
      if (!priority || !details.trim()) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }
      
      // Simulate form submission (replace with actual backend call)
      showNotification('Complaint submitted successfully!', 'success');
      
      // Reset form
      complaintForm.reset();
      
      // Show category result message (simulated)
      const categoryResultMessage = document.getElementById('categoryResultMessage');
      const predictedCategory = document.getElementById('predictedCategory');
      
      if (categoryResultMessage && predictedCategory) {
        // Simulate ML prediction (replace with actual ML model call)
        const categories = ['🍽️ Mess', '📶 WiFi', '🏠 Hostel Maintenance', '📚 Academic Support', '🚌 Transport'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        predictedCategory.textContent = randomCategory;
        categoryResultMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
          categoryResultMessage.style.display = 'none';
        }, 5000);
      }
    });
  }
}

// Notification System
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

function getNotificationColor(type) {
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };
  return colors[type] || colors.info;
}

// Rate Resolution Functionality
function initializeRateButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rate-btn')) {
      e.preventDefault();
      
      // Get complaint ID from the row
      const row = e.target.closest('tr');
      const complaintId = row.querySelector('td:first-child').textContent;
      
      // Show rating modal or prompt
      showRatingPrompt(complaintId);
    }
  });
}

function showRatingPrompt(complaintId) {
  const rating = prompt(`Rate the resolution for complaint ${complaintId} (1-5 stars):`);
  
  if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
    showNotification(`Thank you for rating complaint ${complaintId} with ${rating} stars!`, 'success');
  } else if (rating !== null) {
    showNotification('Please enter a valid rating between 1 and 5.', 'error');
  }
}

// Flag Wrong Category Functionality
function initializeFlagButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('flag-btn')) {
      e.preventDefault();
      
      // Get complaint ID from the row
      const row = e.target.closest('tr');
      const complaintId = row.querySelector('td:first-child').textContent;
      
      // Show flag modal or prompt
      showFlagPrompt(complaintId);
    }
  });
}

function showFlagPrompt(complaintId) {
  const reason = prompt(`Please provide a reason for flagging complaint ${complaintId} as wrong category:`);
  
  if (reason && reason.trim()) {
    showNotification(`Thank you for reporting. We will review complaint ${complaintId}.`, 'info');
  } else if (reason !== null) {
    showNotification('Please provide a reason for flagging.', 'error');
  }
}

// Add CSS for notifications
const notificationStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: auto;
  }
  
  .notification-close:hover {
    opacity: 0.8;
  }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
