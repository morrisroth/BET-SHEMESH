// Talent Overview Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initStatCounters();
    initTechStackAnimations();
    initProgramCards();
    initStartupCards();
    initStorySlider();
    initScrollAnimations();
});

// Initialize stat counters
function initStatCounters() {
    const counters = document.querySelectorAll('.talent-stat-card .stat-number');
    const speed = 200;
    
    const countObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const counter = entry.target;
                const target = parseInt(counter.innerText.replace(/\D/g, ''));
                const increment = target / speed;
                
                const updateCount = () => {
                    const count = parseInt(counter.innerText.replace(/\D/g, ''));
                    
                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 1);
                    } else {
                        counter.innerText = counter.innerText.replace(/\d+/, target);
                        counter.classList.add('counted');
                    }
                };
                
                updateCount();
                countObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        countObserver.observe(counter);
    });
}

// Initialize tech stack animations
function initTechStackAnimations() {
    const techItems = document.querySelectorAll('.tech-item');
    
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click interaction
        item.addEventListener('click', function() {
            const techName = this.querySelector('span').textContent;
            showTechDetails(techName);
        });
    });
}

// Initialize program cards
function initProgramCards() {
    const programCards = document.querySelectorAll('.program-card');
    
    programCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add click interaction
        card.addEventListener('click', function() {
            const programName = this.querySelector('h3').textContent;
            showProgramDetails(programName);
        });
    });
}

// Initialize startup cards
function initStartupCards() {
    const startupCards = document.querySelectorAll('.startup-card');
    
    startupCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateY(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateY(0)';
        });
        
        // Add click interaction
        card.addEventListener('click', function() {
            const startupName = this.querySelector('h3').textContent;
            showStartupDetails(startupName);
        });
    });
}

// Initialize story slider
function initStorySlider() {
    const stories = document.querySelectorAll('.story-card');
    const prevBtn = document.createElement('button');
    const nextBtn = document.createElement('button');
    let currentStory = 0;
    
    // Create navigation buttons
    prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    prevBtn.className = 'story-nav-btn story-prev';
    nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    nextBtn.className = 'story-nav-btn story-next';
    
    // Add styles to buttons
    [prevBtn, nextBtn].forEach(btn => {
        Object.assign(btn.style, {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 102, 204, 0.8)',
            color: 'white',
            border: 'none',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            zIndex: '10',
            transition: 'all 0.3s ease'
        });
    });
    
    prevBtn.style.right = '20px';
    nextBtn.style.left = '20px';
    
    // Add buttons to slider container
    const sliderContainer = document.querySelector('.stories-slider');
    if (sliderContainer && stories.length > 1) {
        sliderContainer.style.position = 'relative';
        sliderContainer.appendChild(prevBtn);
        sliderContainer.appendChild(nextBtn);
        
        // Show first story
        showStory(0);
        
        // Add event listeners
        prevBtn.addEventListener('click', () => {
            currentStory = (currentStory - 1 + stories.length) % stories.length;
            showStory(currentStory);
        });
        
        nextBtn.addEventListener('click', () => {
            currentStory = (currentStory + 1) % stories.length;
            showStory(currentStory);
        });
        
        // Auto-play slider
        setInterval(() => {
            currentStory = (currentStory + 1) % stories.length;
            showStory(currentStory);
        }, 5000);
    }
    
    function showStory(index) {
        stories.forEach((story, i) => {
            story.style.display = i === index ? 'block' : 'none';
        });
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.talent-stat-card, .program-card, .startup-card, .story-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Show tech details modal
function showTechDetails(techName) {
    const modal = document.createElement('div');
    modal.className = 'tech-modal';
    
    // Tech details data
    const techDetails = {
        'React': 'React היא ספריית JavaScript לבניית ממשקי משתמש, שפותחה על ידי פייסבוק.',
        'Vue.js': 'Vue.js היא פריימוורק פרוגרסיבי לבניית ממשקי משתמש.',
        'Angular': 'Angular היא פלטפורמה לבניית אפליקציות ווב מבית גוגל.',
        'JavaScript': 'JavaScript היא שפת תכנות ובה היא אחת השפות הפופולריות ביותר לפיתוח ווב.',
        'CSS3': 'CSS3 היא הגרסה העדכנית של CSS, המשמשת לעיצוב אתרים.',
        'Node.js': 'Node.js היא סביבת ריצה ל-JavaScript בצד השרת.',
        'Python': 'Python היא שפת תכנות רב-תכליתית, פופולרית מאוד בפיתוח ווב ומדעי הנתונים.',
        'Java': 'Java היא שפת תכנות מונחית-עצמים, הנפוצה מאוד בפיתוח ארגוני.',
        'SQL': 'SQL היא שפת שאילתות לניהול מסדרי נתונים רלציוניים.',
        'Docker': 'Docker היא פלטפורמה ליצירת וניהול קונטיינרים.',
        'React Native': 'React Native היא פריימוורק לפיתוח אפליקציות מובייל עבור iOS ו-Android.',
        'Android': 'Android היא פלטפורמת מובייל פופולרית מבית גוגל.',
        'iOS': 'iOS היא פלטפורמת מובייל מבית אפל, הפועלת על מכשירי אייפון.',
        'Flutter': 'Flutter היא פלטפורמת פיתוח אפליקציות מובייל מבית גוגל.',
        'AWS': 'AWS היא פלטפורמת מחשוב ענן מבית אמזון.',
        'Azure': 'Azure היא פלטפורמת מחשוב ענן מבית מיקרוסופט.',
        'Google Cloud': 'Google Cloud היא פלטפורמת מחשוב ענן מבית גוגל.',
        'Kubernetes': 'Kubernetes היא מערכת לאוטומציה של פריסה, סקלינג וניהול אפליקציות קונטיינריות.'
    };
    
    const description = techDetails[techName] || 'טכנולוגיה מתקדמת בתחום ההייטק.';
    
    modal.innerHTML = `
        <div class="tech-modal-content">
            <div class="tech-modal-header">
                <h3>${techName}</h3>
                <button class="tech-modal-close">&times;</button>
            </div>
            <div class="tech-modal-body">
                <p>${description}</p>
                <div class="tech-stats">
                    <div class="tech-stat">
                        <span class="stat-label">מפתחים בבית שמש</span>
                        <span class="stat-value">${Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div class="tech-stat">
                        <span class="stat-label">דרוש בשוק</span>
                        <span class="stat-value">גבוה</span>
                    </div>
                </div>
                <button class="btn btn-primary tech-modal-btn">למד עוד</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.tech-modal-close');
    const modalBtn = modal.querySelector('.tech-modal-btn');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Show program details modal
function showProgramDetails(programName) {
    const modal = document.createElement('div');
    modal.className = 'program-modal';
    
    modal.innerHTML = `
        <div class="program-modal-content">
            <div class="program-modal-header">
                <h3>${programName}</h3>
                <button class="program-modal-close">&times;</button>
            </div>
            <div class="program-modal-body">
                <p>תוכנית הכשרה מקיפה המכשירה מפתחים לתעשייה הטכנולוגית.</p>
                <ul class="program-features">
                    <li>למידה מעשית על פרויקטים אמיתיים</li>
                    <li>מדריכים מומחים מהתעשייה</li>
                    <li>הכשרה אינטנסיבית</li>
                    <li>סיוע במציאת עבודה</li>
                </ul>
                <button class="btn btn-primary program-modal-btn">הירשם עכשיו</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.program-modal-close');
    const modalBtn = modal.querySelector('.program-modal-btn');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', () => {
        closeModal();
        showNotification('תודה על ההתעניינות! נחזור אליך בהקדם.', 'success');
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Show startup details modal
function showStartupDetails(startupName) {
    const modal = document.createElement('div');
    modal.className = 'startup-modal';
    
    modal.innerHTML = `
        <div class="startup-modal-content">
            <div class="startup-modal-header">
                <h3>${startupName}</h3>
                <button class="startup-modal-close">&times;</button>
            </div>
            <div class="startup-modal-body">
                <p>סטארטאפ חדשני מבית שמש המתמחה בפיתוח פתרונות טכנולוגיים מתקדמים.</p>
                <div class="startup-info">
                    <div class="info-item">
                        <span class="info-label">הקמה:</span>
                        <span class="info-value">2022</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">עובדים:</span>
                        <span class="info-value">10-20</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">גיוס:</span>
                        <span class="info-value">פתוח</span>
                    </div>
                </div>
                <button class="btn btn-primary startup-modal-btn">צור קשר</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.startup-modal-close');
    const modalBtn = modal.querySelector('.startup-modal-btn');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', () => {
        closeModal();
        window.location.href = 'contact.html';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
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

// Add CSS for modals and animations
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .tech-modal,
    .program-modal,
    .startup-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .tech-modal.active,
    .program-modal.active,
    .startup-modal.active {
        display: flex;
    }
    
    .tech-modal-content,
    .program-modal-content,
    .startup-modal-content {
        background-color: white;
        border-radius: 10px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .tech-modal.active .tech-modal-content,
    .program-modal.active .program-modal-content,
    .startup-modal.active .startup-modal-content {
        transform: scale(1);
        opacity: 1;
    }
    
    .tech-modal-header,
    .program-modal-header,
    .startup-modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .tech-modal-header h3,
    .program-modal-header h3,
    .startup-modal-header h3 {
        margin: 0;
        color: #1a1a1a;
    }
    
    .tech-modal-close,
    .program-modal-close,
    .startup-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .tech-modal-close:hover,
    .program-modal-close:hover,
    .startup-modal-close:hover {
        color: #333;
    }
    
    .tech-modal-body,
    .program-modal-body,
    .startup-modal-body {
        padding: 20px;
    }
    
    .tech-stats {
        display: flex;
        justify-content: space-around;
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
    }
    
    .tech-stat {
        text-align: center;
    }
    
    .tech-stat .stat-label {
        display: block;
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 5px;
    }
    
    .tech-stat .stat-value {
        display: block;
        font-size: 1.25rem;
        font-weight: 700;
        color: #0066cc;
    }
    
    .program-features {
        list-style: none;
        padding: 0;
        margin: 20px 0;
    }
    
    .program-features li {
        padding: 8px 0;
        padding-right: 25px;
        position: relative;
        color: #555;
    }
    
    .program-features li::before {
        content: '✓';
        position: absolute;
        right: 0;
        color: #28a745;
        font-weight: bold;
    }
    
    .startup-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
    }
    
    .info-item {
        text-align: center;
    }
    
    .info-label {
        display: block;
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 5px;
    }
    
    .info-value {
        display: block;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1a1a1a;
    }
    
    .tech-modal-btn,
    .program-modal-btn,
    .startup-modal-btn {
        width: 100%;
        margin-top: 20px;
    }
    
    .story-nav-btn {
        transition: all 0.3s ease;
    }
    
    .story-nav-btn:hover {
        background-color: #0052a3 !important;
        transform: translateY(-50%) scale(1.1);
    }
    
    @media (max-width: 768px) {
        .tech-modal-content,
        .program-modal-content,
        .startup-modal-content {
            max-width: 95%;
            margin: 10px;
        }
        
        .tech-stats {
            flex-direction: column;
            gap: 15px;
        }
        
        .startup-info {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        
        .story-prev {
            right: 10px;
        }
        
        .story-next {
            left: 10px;
        }
    }
`;
document.head.appendChild(modalStyles);