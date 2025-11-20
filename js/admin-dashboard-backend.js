// Admin Dashboard JavaScript with Backend Integration

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize dashboard
    initNavigation();
    initModals();
    initCharts();
    initFormHandlers();
    initArticleActions();
    initStatisticsForm();
    initSettingsForm();
    loadDashboardData();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verify token with server
    fetch('/api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token invalid');
        }
        return response.json();
    })
    .then(data => {
        // Token is valid, continue
        console.log('User authenticated:', data.user);
    })
    .catch(error => {
        console.error('Authentication error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetId}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Logout functionality
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Initialize modals
function initModals() {
    const addArticleBtn = document.getElementById('addArticleBtn');
    const newArticleBtn = document.getElementById('newArticleBtn');
    const articleModal = document.getElementById('articleModal');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    
    function openModal() {
        if (articleModal) {
            articleModal.classList.add('active');
            document.getElementById('modalTitle').textContent = 'הוסף מאמר חדש';
            document.getElementById('articleForm').reset();
        }
    }
    
    function closeModal() {
        if (articleModal) {
            articleModal.classList.remove('active');
        }
    }
    
    if (addArticleBtn) addArticleBtn.addEventListener('click', openModal);
    if (newArticleBtn) newArticleBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancel) modalCancel.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    if (articleModal) {
        articleModal.addEventListener('click', function(e) {
            if (e.target === articleModal) {
                closeModal();
            }
        });
    }
}

// Initialize charts
function initCharts() {
    // Traffic Chart
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
                datasets: [{
                    label: 'ביקורים',
                    data: [1200, 1900, 1500, 2500, 2200, 3000],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Submissions Chart
    const submissionsCtx = document.getElementById('submissionsChart');
    if (submissionsCtx) {
        new Chart(submissionsCtx, {
            type: 'bar',
            data: {
                labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
                datasets: [{
                    label: 'פניות',
                    data: [12, 19, 15, 25, 22, 30],
                    backgroundColor: '#0066cc'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Sources Chart
    const sourcesCtx = document.getElementById('sourcesChart');
    if (sourcesCtx) {
        new Chart(sourcesCtx, {
            type: 'doughnut',
            data: {
                labels: ['חיפוש אורגני', 'מדיה חברתית', 'הפניות ישירות', 'אימייל'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#0066cc',
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Initialize form handlers
function initFormHandlers() {
    // Article form
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const articleData = {
                title: formData.get('articleTitle'),
                author: formData.get('articleAuthor'),
                content: formData.get('articleContent'),
                status: formData.get('articleStatus'),
                date: new Date().toISOString()
            };
            
            // Simulate saving article
            saveArticle(articleData);
        });
    }
}

// Initialize article actions
function initArticleActions() {
    // Edit buttons
    document.querySelectorAll('.btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const title = row.querySelector('td:first-child').textContent;
            editArticle(title);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const title = row.querySelector('td:first-child').textContent;
            deleteArticle(title, row);
        });
    });
    
    // View buttons for submissions
    document.querySelectorAll('.btn-icon.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const company = row.querySelector('td:first-child').textContent;
            viewSubmission(company);
        });
    });
    
    // Respond buttons for submissions
    document.querySelectorAll('.btn-icon.respond').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const company = row.querySelector('td:first-child').textContent;
            respondToSubmission(company);
        });
    });
}

// Initialize statistics form
function initStatisticsForm() {
    const statisticsForm = document.getElementById('statisticsForm');
    if (statisticsForm) {
        statisticsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const stats = {
                devCount: formData.get('devCount'),
                companyCount: formData.get('companyCount'),
                bootcampCount: formData.get('bootcampCount'),
                successRate: formData.get('successRate')
            };
            
            // Simulate updating statistics
            updateStatistics(stats);
        });
    }
}

// Initialize settings form
function initSettingsForm() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const settings = {
                siteTitle: formData.get('siteTitle'),
                siteDescription: formData.get('siteDescription'),
                contactEmail: formData.get('contactEmail'),
                contactPhone: formData.get('contactPhone')
            };
            
            // Simulate saving settings
            saveSettings(settings);
        });
    }
}

// Save article function
function saveArticle(articleData) {
    // Show loading state
    const submitBtn = document.querySelector('#articleForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';
    
    const token = localStorage.getItem('adminToken');
    
    // Simulate API call
    fetch('/api/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
    })
    .then(response => response.json())
    .then(data => {
        // Close modal
        document.getElementById('articleModal').classList.remove('active');
        
        // Show success message
        showNotification('המאמר נשמר בהצלחה!', 'success');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Reload articles
        loadDashboardData();
    })
    .catch(error => {
        console.error('Error saving article:', error);
        showNotification('שגיאה בשמירת המאמר', 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Edit article function
function editArticle(title) {
    // Open modal with article data
    const modal = document.getElementById('articleModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'ערוך מאמר';
    modal.classList.add('active');
    
    // In a real app, you would load article data
    console.log('Editing article:', title);
}

// Delete article function
function deleteArticle(title, row) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המאמר "${title}"?`)) {
        // Show loading state
        row.style.opacity = '0.5';
        
        const token = localStorage.getItem('adminToken');
        
        // Simulate API call
        fetch(`/api/articles/${row.dataset.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Remove row
            row.remove();
            
            // Show success message
            showNotification('המאמר נמחק בהצלחה!', 'success');
        })
        .catch(error => {
            console.error('Error deleting article:', error);
            showNotification('שגיאה במחיקת המאמר', 'error');
        });
    }
}

// View submission function
function viewSubmission(company) {
    // In a real app, you would open a modal with submission details
    console.log('Viewing submission:', company);
    showNotification(`פרטי הפנייה מ-${company}`, 'info');
}

// Respond to submission function
function respondToSubmission(company) {
    // In a real app, you would open a modal to compose a response
    console.log('Responding to submission:', company);
    showNotification(`פתיחת חלון תגובה ל-${company}`, 'info');
}

// Update statistics function
function updateStatistics(stats) {
    // Show loading state
    const submitBtn = document.querySelector('#statisticsForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מעדכן...';
    
    const token = localStorage.getItem('adminToken');
    
    // Simulate API call
    fetch('/api/statistics', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stats)
    })
    .then(response => response.json())
    .then(data => {
        // Update statistics on dashboard
        document.querySelector('.stat-number[data-target="500"]').textContent = stats.devCount;
        document.querySelector('.stat-number[data-target="30"]').textContent = stats.companyCount;
        document.querySelector('.stat-number[data-target="15"]').textContent = stats.bootcampCount;
        document.querySelector('.stat-number[data-target="95"]').textContent = stats.successRate;
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Show success message
        showNotification('הסטטיסטיקות עודכנו בהצלחה!', 'success');
    })
    .catch(error => {
        console.error('Error updating statistics:', error);
        showNotification('שגיאה בעדכון הסטטיסטיקות', 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Save settings function
function saveSettings(settings) {
    // Show loading state
    const submitBtn = document.querySelector('#settingsForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';
    
    const token = localStorage.getItem('adminToken');
    
    // Simulate API call
    fetch('/api/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Show success message
        showNotification('ההגדרות נשמרו בהצלחה!', 'success');
        
        console.log('Settings saved:', settings);
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        showNotification('שגיאה בשמירת ההגדרות', 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Logout function
function logout() {
    const token = localStorage.getItem('adminToken');
    
    // Call server logout endpoint
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });
}

// Load dashboard data from server
function loadDashboardData() {
    const token = localStorage.getItem('adminToken');
    
    // Load articles
    fetch('/api/articles', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        updateArticlesTable(data.articles);
    })
    .catch(error => console.error('Error loading articles:', error));
    
    // Load contacts
    fetch('/api/contact', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        updateContactsTable(data.contacts);
    })
    .catch(error => console.error('Error loading contacts:', error));
    
    // Load statistics
    fetch('/api/statistics', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        updateStatisticsDisplay(data);
    })
    .catch(error => console.error('Error loading statistics:', error));
    
    // Load analytics
    fetch('/api/analytics?period=month', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        updateAnalyticsCharts(data);
    })
    .catch(error => console.error('Error loading analytics:', error));
}

// Update articles table
function updateArticlesTable(articles) {
    const tbody = document.querySelector('.admin-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = articles.map(article => `
        <tr data-id="${article._id}">
            <td>${article.title}</td>
            <td>${article.author}</td>
            <td>${new Date(article.date).toLocaleDateString('he-IL')}</td>
            <td><span class="status ${article.status}">${article.status === 'published' ? 'פורסם' : 'טיוטה'}</span></td>
            <td>
                <button class="btn-icon edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Update contacts table
function updateContactsTable(contacts) {
    const tbody = document.querySelector('#submissions-section .admin-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = contacts.map(contact => `
        <tr data-id="${contact._id}">
            <td>${contact.companyName}</td>
            <td>${contact.contactPerson}</td>
            <td>${contact.reason}</td>
            <td>${new Date(contact.date).toLocaleDateString('he-IL')}</td>
            <td><span class="status ${contact.status}">${getStatusText(contact.status)}</span></td>
            <td>
                <button class="btn-icon view"><i class="fas fa-eye"></i></button>
                <button class="btn-icon respond"><i class="fas fa-reply"></i></button>
            </td>
        </tr>
    `).join('');
}

// Update statistics display
function updateStatisticsDisplay(stats) {
    const statElements = {
        devCount: document.querySelector('.stat-card:nth-child(1) .stat-number'),
        companyCount: document.querySelector('.stat-card:nth-child(2) .stat-number'),
        submissionsCount: document.querySelector('.stat-card:nth-child(3) .stat-number'),
        viewsCount: document.querySelector('.stat-card:nth-child(4) .stat-number')
    };
    
    if (statElements.devCount) statElements.devCount.textContent = stats.developerCount;
    if (statElements.companyCount) statElements.companyCount.textContent = stats.companyCount;
    if (statElements.submissionsCount) statElements.submissionsCount.textContent = '156'; // This would come from analytics
    if (statElements.viewsCount) statElements.viewsCount.textContent = '8,432'; // This would come from analytics
}

// Update analytics charts
function updateAnalyticsCharts(data) {
    // Update traffic chart
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx && window.Chart) {
        new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: data.contactsByPeriod.map(item => item._id),
                datasets: [{
                    label: 'ביקורים',
                    data: data.contactsByPeriod.map(item => item.count),
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Get status text in Hebrew
function getStatusText(status) {
    const statusMap = {
        'new': 'חדש',
        'in-progress': 'בטיפול',
        'completed': 'הושלם'
    };
    return statusMap[status] || status;
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 25px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        default:
            notification.style.backgroundColor = '#0066cc';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}