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
        // Clear all auth-related items
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('adminLoggedIn');
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
    
    function openModal() {
        if (articleModal) {
            articleModal.classList.add('active');
            document.getElementById('modalTitle').textContent = 'הוסף מאמר חדש';
            document.getElementById('articleForm').reset();
            delete document.getElementById('articleForm').dataset.articleId;
        }
    }
    
    function closeModal() {
        if (articleModal) {
            articleModal.classList.remove('active');
        }
    }
    
    if (addArticleBtn) addArticleBtn.addEventListener('click', openModal);
    if (newArticleBtn) newArticleBtn.addEventListener('click', openModal);
    
    // Set up modal close buttons for all modals
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        }
        
        if (e.target.classList.contains('modal-cancel')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        }
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
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
            const tags = formData.get('articleTags') ? formData.get('articleTags').split(',').map(tag => tag.trim()) : [];
            
            const articleData = {
                title: formData.get('articleTitle'),
                author: formData.get('articleAuthor'),
                category: formData.get('articleCategory'),
                content: formData.get('articleContent'),
                excerpt: formData.get('articleExcerpt'),
                image: formData.get('articleImage'),
                tags: tags,
                status: formData.get('articleStatus'),
                date: new Date().toISOString()
            };
            
            // Check if editing or creating
            const articleId = this.dataset.articleId;
            if (articleId) {
                updateArticle(articleId, articleData);
            } else {
                saveArticle(articleData);
            }
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
        
        // Reset button and form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        document.getElementById('articleForm').reset();
        delete document.getElementById('articleForm').dataset.articleId;
        
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

// Update article function
function updateArticle(id, articleData) {
    // Show loading state
    const submitBtn = document.querySelector('#articleForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מעדכן...';
    
    const token = localStorage.getItem('adminToken');
    
    fetch(`/api/articles/${id}`, {
        method: 'PUT',
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
        showNotification('המאמר עודכן בהצלחה!', 'success');
        
        // Reset button and form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        document.getElementById('articleForm').reset();
        delete document.getElementById('articleForm').dataset.articleId;
        
        // Reload articles
        loadDashboardData();
    })
    .catch(error => {
        console.error('Error updating article:', error);
        showNotification('שגיאה בעדכון המאמר', 'error');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Edit article function
window.editArticle = function(id) {
    const token = localStorage.getItem('adminToken');
    
    // Fetch article data
    fetch(`/api/articles/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(article => {
        openEditArticleModal(article);
    })
    .catch(error => {
        console.error('Error fetching article:', error);
        showNotification('שגיאה בטעינת פרטי המאמר', 'error');
    });
};

// Open edit article modal
function openEditArticleModal(article) {
    const modal = document.getElementById('articleModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'ערוך מאמר';
    modal.classList.add('active');
    
    // Populate form with article data
    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleAuthor').value = article.author;
    document.getElementById('articleCategory').value = article.category || '';
    document.getElementById('articleImage').value = article.image || '';
    document.getElementById('articleContent').value = article.content;
    document.getElementById('articleExcerpt').value = article.excerpt || '';
    document.getElementById('articleTags').value = article.tags ? article.tags.join(', ') : '';
    document.getElementById('articleStatus').value = article.status;
    
    // Store article ID for form submission
    document.getElementById('articleForm').dataset.articleId = article._id;
}

// Delete article function
window.deleteArticle = function(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק מאמר זה?')) {
        const token = localStorage.getItem('adminToken');
        
        fetch(`/api/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            showNotification('המאמר נמחק בהצלחה!', 'success');
            loadDashboardData(); // Reload data
        })
        .catch(error => {
            console.error('Error deleting article:', error);
            showNotification('שגיאה במחיקת המאמר', 'error');
        });
    }
};

// View submission function
function viewSubmission(id) {
    const token = localStorage.getItem('adminToken');
    
    // Fetch full submission details
    fetch(`/api/contact/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(contact => {
        showSubmissionModal(contact);
    })
    .catch(error => {
        console.error('Error fetching submission details:', error);
        showNotification('שגיאה בטעינת פרטי הפנייה', 'error');
    });
}

// Respond to submission function
function respondToSubmission(id) {
    const token = localStorage.getItem('adminToken');
    
    // Fetch submission details first
    fetch(`/api/contact/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(contact => {
        showResponseModal(contact);
    })
    .catch(error => {
        console.error('Error fetching submission details:', error);
        showNotification('שגיאה בטעינת פרטי הפנייה', 'error');
    });
}

// Show submission details modal
function showSubmissionModal(contact) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('submissionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'submissionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>פרטי פנייה</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="submission-details">
                        <div class="detail-row">
                            <span class="detail-label">שם חברה:</span>
                            <span class="detail-value" id="modalCompanyName"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">איש קשר:</span>
                            <span class="detail-value" id="modalContactPerson"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">דוא"ל:</span>
                            <span class="detail-value" id="modalEmail"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">טלפון:</span>
                            <span class="detail-value" id="modalPhone"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">סיבת פנייה:</span>
                            <span class="detail-value" id="modalReason"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">מספר מפתחים דרוש:</span>
                            <span class="detail-value" id="modalDevelopersNeeded"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">טכנולוגיות:</span>
                            <span class="detail-value" id="modalTechStack"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">הודעה:</span>
                            <span class="detail-value" id="modalMessage"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">תאריך:</span>
                            <span class="detail-value" id="modalDate"></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">סטטוס:</span>
                            <span class="detail-value" id="modalStatus"></span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="respondBtn">הגב</button>
                        <button class="btn btn-secondary modal-cancel">סגור</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate modal with contact data
    document.getElementById('modalCompanyName').textContent = contact.companyName;
    document.getElementById('modalContactPerson').textContent = contact.contactPerson;
    document.getElementById('modalEmail').textContent = contact.email;
    document.getElementById('modalPhone').textContent = contact.phone || 'לא צוין';
    document.getElementById('modalReason').textContent = getReasonText(contact.reason);
    document.getElementById('modalDevelopersNeeded').textContent = contact.developersNeeded || 'לא צוין';
    document.getElementById('modalTechStack').textContent = contact.techStack ? contact.techStack.join(', ') : 'לא צוין';
    document.getElementById('modalMessage').textContent = contact.message || 'לא צוינה';
    document.getElementById('modalDate').textContent = new Date(contact.date).toLocaleDateString('he-IL');
    document.getElementById('modalStatus').textContent = getStatusText(contact.status);
    
    // Show modal
    modal.classList.add('active');
    
    // Set up event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const respondBtn = modal.querySelector('#respondBtn');
    
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    respondBtn.onclick = () => {
        closeModal();
        showResponseModal(contact);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// Show response modal
function showResponseModal(contact) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('responseModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'responseModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>הגב לפנייה</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="contact-summary">
                        <h4>פרטי הפונה:</h4>
                        <p><strong>חברה:</strong> <span id="responseCompanyName"></span></p>
                        <p><strong>איש קשר:</strong> <span id="responseContactPerson"></span></p>
                        <p><strong>דוא"ל:</strong> <span id="responseEmail"></span></p>
                    </div>
                    <form id="responseForm">
                        <div class="form-group">
                            <label for="responseSubject">נושא</label>
                            <input type="text" id="responseSubject" name="subject" required>
                        </div>
                        <div class="form-group">
                            <label for="responseMessage">תוכן התגובה</label>
                            <textarea id="responseMessage" name="message" rows="8" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="updateStatus">עדכן סטטוס</label>
                            <select id="updateStatus" name="status">
                                <option value="new">חדש</option>
                                <option value="in-progress">בטיפול</option>
                                <option value="completed">הושלם</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn btn-primary">שלח תגובה</button>
                            <button type="button" class="btn btn-secondary modal-cancel">ביטול</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate modal with contact data
    document.getElementById('responseCompanyName').textContent = contact.companyName;
    document.getElementById('responseContactPerson').textContent = contact.contactPerson;
    document.getElementById('responseEmail').textContent = contact.email;
    document.getElementById('responseSubject').value = `תגובה לפנייה מ-${contact.companyName}`;
    document.getElementById('updateStatus').value = contact.status;
    
    // Show modal
    modal.classList.add('active');
    
    // Set up form submission
    const responseForm = document.getElementById('responseForm');
    responseForm.onsubmit = (e) => {
        e.preventDefault();
        submitResponse(contact._id);
    };
    
    // Set up event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// Submit response
function submitResponse(contactId) {
    const token = localStorage.getItem('adminToken');
    const responseForm = document.getElementById('responseForm');
    const formData = new FormData(responseForm);
    
    const responseData = {
        contactId: contactId,
        subject: formData.get('subject'),
        message: formData.get('message'),
        status: formData.get('status')
    };
    
    // Show loading state
    const submitBtn = responseForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
    
    fetch('/api/contact/respond', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(responseData)
    })
    .then(response => response.json())
    .then(data => {
        showNotification('התגובה נשלחה בהצלחה!', 'success');
        document.getElementById('responseModal').classList.remove('active');
        loadDashboardData(); // Reload data to update status
    })
    .catch(error => {
        console.error('Error sending response:', error);
        showNotification('שגיאה בשליחת התגובה', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

// Get reason text in Hebrew
function getReasonText(reason) {
    const reasonMap = {
        'recruitment': 'גיוס מפתחים',
        'partnership': 'שיתוף פעולה',
        'events': 'אירועים והרצאות',
        'education': 'תוכניות הכשרה',
        'other': 'אחר'
    };
    return reasonMap[reason] || reason;
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
        // Clear all auth-related items
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Clear all auth-related items
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('adminLoggedIn');
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
        updateRecentArticles(data.articles);
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
        updateRecentContacts(data.contacts);
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
    const tbody = document.querySelector('#articlesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = articles.map(article => `
        <tr data-id="${article._id}">
            <td>${article.title}</td>
            <td>${article.author}</td>
            <td>${getCategoryText(article.category)}</td>
            <td>${new Date(article.date).toLocaleDateString('he-IL')}</td>
            <td><span class="status ${article.status}">${article.status === 'published' ? 'פורסם' : 'טיוטה'}</span></td>
            <td>
                <button class="btn-icon edit" onclick="editArticle('${article._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteArticle('${article._id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Update recent articles in dashboard
function updateRecentArticles(articles) {
    const recentArticles = document.getElementById('recentArticles');
    if (!recentArticles) return;
    
    const recentItems = articles.slice(0, 3).map(article => `
        <div class="recent-item">
            <div class="item-info">
                <h4>${article.title}</h4>
                <p>פורסם לפני ${Math.floor((new Date() - new Date(article.date)) / (1000 * 60 * 60 * 24))} ימים</p>
            </div>
            <div class="item-actions">
                <button class="btn-icon edit" onclick="editArticle('${article._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteArticle('${article._id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    recentArticles.innerHTML = recentItems || '<div class="no-items">אין מאמרים זמינים</div>';
}

// Update contacts table
function updateContactsTable(contacts) {
    const tbody = document.querySelector('#contactsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = contacts.map(contact => `
        <tr data-id="${contact._id}">
            <td>${contact.companyName}</td>
            <td>${contact.contactPerson}</td>
            <td>${getReasonText(contact.reason)}</td>
            <td>${new Date(contact.date).toLocaleDateString('he-IL')}</td>
            <td><span class="status ${contact.status}">${getStatusText(contact.status)}</span></td>
            <td>
                <button class="btn-icon view" onclick="viewSubmission('${contact._id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-icon respond" onclick="respondToSubmission('${contact._id}')"><i class="fas fa-reply"></i></button>
            </td>
        </tr>
    `).join('');
}

// Update recent contacts in dashboard
function updateRecentContacts(contacts) {
    const recentContacts = document.getElementById('recentContacts');
    if (!recentContacts) return;
    
    const recentItems = contacts.slice(0, 3).map(contact => {
        const statusClass = contact.status === 'new' ? 'new' :
                          contact.status === 'in-progress' ? 'pending' : 'responded';
        const statusText = contact.status === 'new' ? 'חדש' :
                         contact.status === 'in-progress' ? 'ממתין' : 'טופל';
        
        return `
            <div class="recent-item">
                <div class="item-info">
                    <h4>${contact.companyName}</h4>
                    <p>${getReasonText(contact.reason)}</p>
                    <span class="item-status ${statusClass}">${statusText}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon view" onclick="viewSubmission('${contact._id}')"><i class="fas fa-eye"></i></button>
                </div>
            </div>
        `;
    }).join('');
    
    recentContacts.innerHTML = recentItems || '<div class="no-items">אין פניות זמינות</div>';
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

// Get category text in Hebrew
function getCategoryText(category) {
    const categoryMap = {
        'startups': 'סטארטאפים',
        'education': 'הכשרות',
        'events': 'אירועים',
        'success': 'הצלחות',
        'technology': 'טכנולוגיה'
    };
    return categoryMap[category] || category;
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