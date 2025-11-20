// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initContactForm();
    initFAQ();
    initFormValidation();
    initAnimations();
});

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitForm();
            }
        });
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
}

// FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Form validation
function initFormValidation() {
    // Custom validation functions
    window.validateField = function(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'companyName':
                if (!validateRequired(value)) {
                    isValid = false;
                    errorMessage = 'שם החברה הוא שדה חובה';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'שם החברה חייב להכיל לפחות 2 תווים';
                }
                break;
                
            case 'contactPerson':
                if (!validateRequired(value)) {
                    isValid = false;
                    errorMessage = 'שם איש הקשר הוא שדה חובה';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'שם איש הקשר חייב להכיל לפחות 2 תווים';
                }
                break;
                
            case 'email':
                if (!validateRequired(value)) {
                    isValid = false;
                    errorMessage = 'דוא"ל הוא שדה חובה';
                } else if (!validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'אנא הזינו כתובת דוא"ל תקינה';
                }
                break;
                
            case 'phone':
                if (value && !validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'אנא הזינו מספר טלפון תקין';
                }
                break;
                
            case 'reason':
                if (!validateRequired(value)) {
                    isValid = false;
                    errorMessage = 'אנא בחרו סיבת פנייה';
                }
                break;
        }
        
        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    };
    
    // Required field validation
    function validateRequired(value) {
        return value.trim() !== '';
    }
    
    // Email validation
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Phone validation (Israeli format)
    function validatePhone(phone) {
        const re = /^0(5[^7]|[2-4]|[8-9]|1)[0-9]{8}$/;
        return re.test(phone.replace(/[-()\s]/g, ''));
    }
}

// Validate entire form
function validateForm() {
    const contactForm = document.getElementById('contactForm');
    const inputs = contactForm.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

// Submit form
function submitForm() {
    const contactForm = document.getElementById('contactForm');
    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('formMessage');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
    
    // Prepare form data
    const contactData = {
        companyName: formData.get('companyName'),
        contactPerson: formData.get('contactPerson'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        reason: formData.get('reason'),
        developersNeeded: formData.get('developersNeeded'),
        techStack: formData.getAll('techStack'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on'
    };
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showFormMessage('ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'שלח הודעה';
        
        // Send confirmation email (simulated)
        sendConfirmationEmail(contactData.email);
        
        console.log('Form submitted:', contactData);
    }, 2000);
}

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
        }, 5000);
    }
}

// Send confirmation email (simulated)
function sendConfirmationEmail(email) {
    // In a real application, this would be handled by the server
    console.log('Confirmation email sent to:', email);
    
    // For demo purposes, show a notification
    setTimeout(() => {
        showNotification(`דוא"ל אישור נשלח ל-${email}`, 'success');
    }, 2500);
}

// Show notification
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
        transition: 'opacity 0.3s ease',
        maxWidth: '90%'
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

// Initialize animations
function initAnimations() {
    // Animate process steps on scroll
    const processSteps = document.querySelectorAll('.step');
    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.3 });
    
    processSteps.forEach(step => {
        processObserver.observe(step);
    });
    
    // Animate testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.2 });
    
    testimonialCards.forEach(card => {
        testimonialObserver.observe(card);
    });
    
    // Animate info cards
    const infoCards = document.querySelectorAll('.info-card');
    const infoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.2 });
    
    infoCards.forEach(card => {
        infoObserver.observe(card);
    });
}

// Add CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .step.animate {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .testimonial-card.animate {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .info-card.animate {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Delay animations for sequential appearance */
    .step:nth-child(1) { animation-delay: 0.1s; }
    .step:nth-child(2) { animation-delay: 0.2s; }
    .step:nth-child(3) { animation-delay: 0.3s; }
    .step:nth-child(4) { animation-delay: 0.4s; }
    
    .info-card:nth-child(1) { animation-delay: 0.1s; }
    .info-card:nth-child(2) { animation-delay: 0.2s; }
    .info-card:nth-child(3) { animation-delay: 0.3s; }
    .info-card:nth-child(4) { animation-delay: 0.4s; }
    
    .testimonial-card:nth-child(1) { animation-delay: 0.1s; }
    .testimonial-card:nth-child(2) { animation-delay: 0.2s; }
    .testimonial-card:nth-child(3) { animation-delay: 0.3s; }
    
    /* Form validation animations */
    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: #dc3545;
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    /* Loading spinner */
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(animationStyles);