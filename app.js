// Global Storage Configuration using JSONBin.io
const STORAGE_CONFIG = {
    baseUrl: 'https://api.jsonbin.io/v3',
    binId: '6651a2b2e41b4d34e40f8b53',
    masterKey: '$2a$10$PfRvjBg7MHdPfRvjBg7MHdPfRvjBg7MHdP',
    fallbackKey: 'faculty-applications-backup'
};

// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'Survesh@fintelligenceacademy.com',
    password: 'Self@1111'
};

// Application state
let currentPage = 'landing';
let currentStep = 0;
let theme = localStorage.getItem('theme') || 'light';
let isLoggedIn = localStorage.getItem('adminToken') !== null;
let applications = [];
let filteredApplications = [];

// Form data structure
let formData = {
    personalInfo: {
        fullName: '', email: '', phone: '', dob: '', gender: '', 
        address: '', city: '', state: '', pincode: ''
    },
    professionalInfo: {
        designation: '', organization: '', experience: 5, expertise: [],
        qualifications: '', certifications: '', linkedinProfile: '', bio: ''
    },
    documents: {
        photo: null, panCard: null, aadharFront: null, 
        aadharBack: null, resume: null
    },
    teachingPreferences: {
        subjects: [], mode: '', availability: '', expectedCompensation: '50000'
    }
};

// Form validation errors
let errors = {};

// Data options from the provided configuration
const expertiseOptions = [
    "Artificial Intelligence & Machine Learning",
    "Quantitative Finance", 
    "Traditional Finance",
    "Data Science & Analytics",
    "Financial Modeling",
    "Risk Management",
    "Portfolio Management", 
    "Algorithmic Trading",
    "Blockchain & Cryptocurrency",
    "Financial Research",
    "Python for Finance",
    "Excel & VBA",
    "Derivatives Trading",
    "Investment Banking",
    "Financial Planning"
];

const subjectOptions = [
    "AI/LLM Agents in Finance",
    "Quantitative Finance Methods",
    "Financial Market Analysis", 
    "Statistical Modeling",
    "Machine Learning for Finance",
    "Risk Assessment & Management",
    "Portfolio Optimization",
    "Trading Strategies",
    "Financial Data Analysis",
    "Python Programming",
    "Excel Advanced Techniques",
    "Derivatives & Options",
    "Investment Analysis", 
    "Corporate Finance",
    "Financial Planning"
];

const steps = [
    { title: 'Personal Info', icon: '👤' },
    { title: 'Professional', icon: '💼' },
    { title: 'Documents', icon: '📄' },
    { title: 'Teaching', icon: '🎓' },
    { title: 'Review', icon: '✅' }
];

// =============================================================================
// STORAGE FUNCTIONS - Using JSONBin.io with fallback to localStorage
// =============================================================================

async function saveToGlobalDB(data) {
    try {
        console.log('Saving to global database...');
        showLoading('Saving to global database...');
        
        const response = await fetch(`${STORAGE_CONFIG.baseUrl}/b/${STORAGE_CONFIG.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': STORAGE_CONFIG.masterKey,
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify({ applications: data })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Successfully saved to global database');
        
        // Also save to localStorage as backup
        localStorage.setItem(STORAGE_CONFIG.fallbackKey, JSON.stringify(data));
        
        hideLoading();
        return result;
    } catch (error) {
        console.error('Error saving to global database:', error);
        // Fallback to localStorage
        localStorage.setItem(STORAGE_CONFIG.fallbackKey, JSON.stringify(data));
        hideLoading();
        return { success: true, fallback: true };
    }
}

async function loadFromGlobalDB() {
    try {
        console.log('Loading from global database...');
        showLoading('Loading applications...');
        
        const response = await fetch(`${STORAGE_CONFIG.baseUrl}/b/${STORAGE_CONFIG.binId}/latest`, {
            headers: {
                'X-Master-Key': STORAGE_CONFIG.masterKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Successfully loaded from global database');
        hideLoading();
        
        return result.record?.applications || [];
    } catch (error) {
        console.error('Error loading from global database:', error);
        hideLoading();
        
        // Fallback to localStorage
        const fallbackData = localStorage.getItem(STORAGE_CONFIG.fallbackKey);
        return fallbackData ? JSON.parse(fallbackData) : [];
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    if (overlay && text) {
        text.textContent = message;
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// =============================================================================
// THEME FUNCTIONS - FIXED
// =============================================================================

function toggleTheme() {
    try {
        console.log('Toggling theme from', theme);
        
        // Toggle theme
        theme = theme === 'light' ? 'dark' : 'light';
        
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update button immediately
        updateThemeToggle();
        
        console.log('Theme toggled to', theme);
        
        // Small delay for visual feedback
        setTimeout(() => {
            console.log('Theme toggle completed successfully');
        }, 300);
        
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

function updateThemeToggle() {
    try {
        const icon = document.getElementById('themeIcon');
        const text = document.getElementById('themeText');
        
        if (icon && text) {
            if (theme === 'dark') {
                icon.textContent = '☀️';
                text.textContent = 'Light';
            } else {
                icon.textContent = '🌙';
                text.textContent = 'Dark';
            }
        }
    } catch (error) {
        console.error('Error updating theme toggle:', error);
    }
}

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    updateThemeToggle();
}

// =============================================================================
// NAVIGATION FUNCTIONS - FIXED
// =============================================================================

function showPage(page) {
    try {
        console.log('Navigating to page:', page);
        
        // Hide all pages first
        const pages = ['landingPage', 'applicationPage', 'adminLoginPage', 'adminDashboard', 'successPage'];
        pages.forEach(pageId => {
            const element = document.getElementById(pageId);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Show selected page
        currentPage = page;
        const adminAccessBtn = document.getElementById('adminAccessBtn');
        
        let targetPageId = '';
        switch(page) {
            case 'landing':
                targetPageId = 'landingPage';
                if (adminAccessBtn) adminAccessBtn.classList.remove('hidden');
                break;
            case 'application':
                targetPageId = 'applicationPage';
                if (adminAccessBtn) adminAccessBtn.classList.add('hidden');
                setTimeout(() => initializeApplicationForm(), 100);
                break;
            case 'admin-login':
                targetPageId = 'adminLoginPage';
                if (adminAccessBtn) adminAccessBtn.classList.add('hidden');
                break;
            case 'admin':
                targetPageId = 'adminDashboard';
                if (adminAccessBtn) adminAccessBtn.classList.add('hidden');
                setTimeout(() => initializeDashboard(), 100);
                break;
            case 'success':
                targetPageId = 'successPage';
                if (adminAccessBtn) adminAccessBtn.classList.remove('hidden');
                break;
        }
        
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            console.log('Successfully navigated to', page);
        } else {
            console.error('Target page element not found:', targetPageId);
        }
        
    } catch (error) {
        console.error('Error showing page:', error);
    }
}

// Navigation wrapper functions
function showLanding() {
    showPage('landing');
}

function startApplication() {
    try {
        console.log('Starting application process');
        
        // Reset form data completely
        formData = {
            personalInfo: {
                fullName: '', email: '', phone: '', dob: '', gender: '', 
                address: '', city: '', state: '', pincode: ''
            },
            professionalInfo: {
                designation: '', organization: '', experience: 5, expertise: [],
                qualifications: '', certifications: '', linkedinProfile: '', bio: ''
            },
            documents: {
                photo: null, panCard: null, aadharFront: null, 
                aadharBack: null, resume: null
            },
            teachingPreferences: {
                subjects: [], mode: '', availability: '', expectedCompensation: '50000'
            }
        };
        
        // Reset other state
        errors = {};
        currentStep = 0;
        
        // Navigate to application page
        showPage('application');
        
        console.log('Application started successfully');
    } catch (error) {
        console.error('Error starting application:', error);
    }
}

function showAdminLogin() {
    showPage('admin-login');
}

// =============================================================================
// ADMIN FUNCTIONS - FIXED
// =============================================================================

async function adminLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        const errorDiv = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');
        
        console.log('Attempting admin login for:', email);
        
        // Show loading state
        if (loginBtn) {
            loginBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>Logging in...';
            loginBtn.disabled = true;
        }
        
        // Clear previous errors
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
        }
        
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check credentials
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            // Success
            localStorage.setItem('adminToken', 'admin-token-' + Date.now());
            isLoggedIn = true;
            
            // Update UI
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            
            // Navigate to dashboard
            showPage('admin');
            console.log('Admin login successful');
        } else {
            // Failure
            if (errorDiv) {
                errorDiv.textContent = 'Invalid email or password. Please check your credentials and try again.';
                errorDiv.classList.remove('hidden');
            }
            console.log('Admin login failed - invalid credentials');
        }
        
        // Reset button state
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error during admin login:', error);
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
        }
        
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = 'An error occurred during login. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    }
}

function logout() {
    try {
        localStorage.removeItem('adminToken');
        isLoggedIn = false;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        
        showLanding();
        console.log('User logged out successfully');
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// =============================================================================
// APPLICATION FORM FUNCTIONS
// =============================================================================

function initializeApplicationForm() {
    try {
        renderProgressBar();
        renderCurrentStep();
        console.log('Application form initialized');
    } catch (error) {
        console.error('Error initializing application form:', error);
    }
}

function renderProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    progressBar.innerHTML = steps.map((step, index) => `
        <div class="progress-step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}">
            <span>${step.icon}</span>
            <span>${step.title}</span>
        </div>
    `).join('');
}

function renderCurrentStep() {
    const formSteps = document.getElementById('formSteps');
    if (!formSteps) return;
    
    let content = '';
    
    switch(currentStep) {
        case 0:
            content = renderPersonalInfo();
            break;
        case 1:
            content = renderProfessionalInfo();
            break;
        case 2:
            content = renderDocuments();
            break;
        case 3:
            content = renderTeachingPreferences();
            break;
        case 4:
            content = renderReview();
            break;
    }
    
    formSteps.innerHTML = content;
    updateNavigationButtons();
    
    // Initialize interactive elements after DOM update
    setTimeout(() => {
        initializeInteractiveElements();
        clearValidationErrors();
    }, 100);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = false;
        if (currentStep === steps.length - 1) {
            nextBtn.innerHTML = '📤 Submit Application';
        } else {
            nextBtn.innerHTML = 'Next →';
        }
    }
}

function renderPersonalInfo() {
    return `
        <div class="form-section">
            <h3>👤 Personal Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-control ${errors['personalInfo.fullName'] ? 'error' : ''}" 
                           value="${formData.personalInfo.fullName}" 
                           onchange="updateFormData('personalInfo', 'fullName', this.value)">
                    ${errors['personalInfo.fullName'] ? `<div class="error-message">${errors['personalInfo.fullName']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <input type="email" class="form-control ${errors['personalInfo.email'] ? 'error' : ''}" 
                           value="${formData.personalInfo.email}" 
                           onchange="updateFormData('personalInfo', 'email', this.value)">
                    ${errors['personalInfo.email'] ? `<div class="error-message">${errors['personalInfo.email']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Phone Number *</label>
                    <input type="tel" class="form-control ${errors['personalInfo.phone'] ? 'error' : ''}" 
                           value="${formData.personalInfo.phone}" 
                           onchange="updateFormData('personalInfo', 'phone', this.value)">
                    ${errors['personalInfo.phone'] ? `<div class="error-message">${errors['personalInfo.phone']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" 
                           value="${formData.personalInfo.dob}" 
                           onchange="updateFormData('personalInfo', 'dob', this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select class="form-control" onchange="updateFormData('personalInfo', 'gender', this.value)">
                        <option value="">Select Gender</option>
                        <option value="Male" ${formData.personalInfo.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${formData.personalInfo.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${formData.personalInfo.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">City</label>
                    <input type="text" class="form-control" 
                           value="${formData.personalInfo.city}" 
                           onchange="updateFormData('personalInfo', 'city', this.value)">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" rows="3" 
                              onchange="updateFormData('personalInfo', 'address', this.value)">${formData.personalInfo.address}</textarea>
                </div>
            </div>
        </div>
    `;
}

function renderProfessionalInfo() {
    return `
        <div class="form-section">
            <h3>💼 Professional Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Current Designation *</label>
                    <input type="text" class="form-control ${errors['professionalInfo.designation'] ? 'error' : ''}" 
                           value="${formData.professionalInfo.designation}" 
                           onchange="updateFormData('professionalInfo', 'designation', this.value)">
                    ${errors['professionalInfo.designation'] ? `<div class="error-message">${errors['professionalInfo.designation']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Organization/Institution *</label>
                    <input type="text" class="form-control ${errors['professionalInfo.organization'] ? 'error' : ''}" 
                           value="${formData.professionalInfo.organization}" 
                           onchange="updateFormData('professionalInfo', 'organization', this.value)">
                    ${errors['professionalInfo.organization'] ? `<div class="error-message">${errors['professionalInfo.organization']}</div>` : ''}
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Years of Experience</label>
                    <div class="range-slider">
                        <input type="range" min="0" max="30" class="range-input" 
                               value="${formData.professionalInfo.experience}" 
                               onchange="updateFormData('professionalInfo', 'experience', parseInt(this.value)); updateRangeValue('experienceValue', this.value + ' years')">
                        <div class="range-value" id="experienceValue">${formData.professionalInfo.experience} years</div>
                    </div>
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Areas of Expertise *</label>
                    <div class="multi-select" id="expertiseSelect">
                        <div class="form-control multi-select-input" onclick="toggleDropdown('expertiseSelect')">
                            ${formData.professionalInfo.expertise.length === 0 ? 
                                '<span style="color: var(--color-text-secondary);">Select your areas of expertise</span>' : 
                                formData.professionalInfo.expertise.map(item => `
                                    <span class="selected-tag">
                                        ${item}
                                        <button class="tag-remove" onclick="removeFromMultiSelect('professionalInfo', 'expertise', '${item.replace(/'/g, "\\'")}'); event.stopPropagation();">×</button>
                                    </span>
                                `).join('')
                            }
                        </div>
                        <div class="multi-select-dropdown" id="expertiseDropdown">
                            ${expertiseOptions.map(option => `
                                <div class="multi-select-option" onclick="toggleMultiSelectOption('professionalInfo', 'expertise', '${option.replace(/'/g, "\\'")}')">
                                    <input type="checkbox" ${formData.professionalInfo.expertise.includes(option) ? 'checked' : ''}> ${option}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${errors['professionalInfo.expertise'] ? `<div class="error-message">${errors['professionalInfo.expertise']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">LinkedIn Profile</label>
                    <input type="url" class="form-control" 
                           value="${formData.professionalInfo.linkedinProfile}" 
                           onchange="updateFormData('professionalInfo', 'linkedinProfile', this.value)"
                           placeholder="https://linkedin.com/in/yourprofile">
                </div>
                <div class="form-group">
                    <label class="form-label">Professional Certifications</label>
                    <input type="text" class="form-control" 
                           value="${formData.professionalInfo.certifications}" 
                           onchange="updateFormData('professionalInfo', 'certifications', this.value)"
                           placeholder="e.g., CFA, FRM, CPA">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Brief Bio/Experience Summary</label>
                    <textarea class="form-control" rows="5" 
                              onchange="updateFormData('professionalInfo', 'bio', this.value)"
                              placeholder="Tell us about your experience, achievements, and what you bring to our platform...">${formData.professionalInfo.bio}</textarea>
                </div>
            </div>
        </div>
    `;
}

function renderDocuments() {
    return `
        <div class="form-section">
            <h3>📄 Document Upload</h3>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Passport Size Photo *</label>
                    <div class="file-upload" onclick="triggerFileUpload('photo')" ondrop="handleFileDrop(event, 'photo')" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--fintel-primary);">☁️</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'photo')">
                    <div id="photoPreview"></div>
                    ${errors['documents.photo'] ? `<div class="error-message">${errors['documents.photo']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">PAN Card *</label>
                    <div class="file-upload" onclick="triggerFileUpload('panCard')" ondrop="handleFileDrop(event, 'panCard')" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--fintel-primary);">☁️</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="panCardInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'panCard')">
                    <div id="panCardPreview"></div>
                    ${errors['documents.panCard'] ? `<div class="error-message">${errors['documents.panCard']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Aadhar Card Front *</label>
                    <div class="file-upload" onclick="triggerFileUpload('aadharFront')" ondrop="handleFileDrop(event, 'aadharFront')" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--fintel-primary);">☁️</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="aadharFrontInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'aadharFront')">
                    <div id="aadharFrontPreview"></div>
                    ${errors['documents.aadharFront'] ? `<div class="error-message">${errors['documents.aadharFront']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Aadhar Card Back *</label>
                    <div class="file-upload" onclick="triggerFileUpload('aadharBack')" ondrop="handleFileDrop(event, 'aadharBack')" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--fintel-primary);">☁️</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="aadharBackInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'aadharBack')">
                    <div id="aadharBackPreview"></div>
                    ${errors['documents.aadharBack'] ? `<div class="error-message">${errors['documents.aadharBack']}</div>` : ''}
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Resume/CV (PDF)</label>
                    <div class="file-upload" onclick="triggerFileUpload('resume')" ondrop="handleFileDrop(event, 'resume')" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--fintel-primary);">☁️</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">PDF files only • Max 10MB</p>
                    </div>
                    <input type="file" id="resumeInput" accept=".pdf" style="display: none;" onchange="handleFileSelect(event, 'resume')">
                    <div id="resumePreview"></div>
                </div>
            </div>
        </div>
    `;
}

function renderTeachingPreferences() {
    return `
        <div class="form-section">
            <h3>🎓 Teaching Preferences</h3>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Preferred Subjects *</label>
                    <div class="multi-select" id="subjectsSelect">
                        <div class="form-control multi-select-input" onclick="toggleDropdown('subjectsSelect')">
                            ${formData.teachingPreferences.subjects.length === 0 ? 
                                '<span style="color: var(--color-text-secondary);">Select subjects you\'d like to teach</span>' : 
                                formData.teachingPreferences.subjects.map(item => `
                                    <span class="selected-tag">
                                        ${item}
                                        <button class="tag-remove" onclick="removeFromMultiSelect('teachingPreferences', 'subjects', '${item.replace(/'/g, "\\'")}'); event.stopPropagation();">×</button>
                                    </span>
                                `).join('')
                            }
                        </div>
                        <div class="multi-select-dropdown" id="subjectsDropdown">
                            ${subjectOptions.map(option => `
                                <div class="multi-select-option" onclick="toggleMultiSelectOption('teachingPreferences', 'subjects', '${option.replace(/'/g, "\\'")}')">
                                    <input type="checkbox" ${formData.teachingPreferences.subjects.includes(option) ? 'checked' : ''}> ${option}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${errors['teachingPreferences.subjects'] ? `<div class="error-message">${errors['teachingPreferences.subjects']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Preferred Teaching Mode *</label>
                    <select class="form-control ${errors['teachingPreferences.mode'] ? 'error' : ''}" 
                            onchange="updateFormData('teachingPreferences', 'mode', this.value)">
                        <option value="">Select Mode</option>
                        <option value="Online" ${formData.teachingPreferences.mode === 'Online' ? 'selected' : ''}>Online</option>
                        <option value="Offline" ${formData.teachingPreferences.mode === 'Offline' ? 'selected' : ''}>Offline</option>
                        <option value="Hybrid" ${formData.teachingPreferences.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                    </select>
                    ${errors['teachingPreferences.mode'] ? `<div class="error-message">${errors['teachingPreferences.mode']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Availability</label>
                    <input type="text" class="form-control" 
                           value="${formData.teachingPreferences.availability}" 
                           onchange="updateFormData('teachingPreferences', 'availability', this.value)"
                           placeholder="e.g., Weekends, Evening hours">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Expected Monthly Compensation (₹)</label>
                    <div class="range-slider">
                        <input type="range" min="10000" max="200000" step="5000" class="range-input" 
                               value="${formData.teachingPreferences.expectedCompensation}" 
                               onchange="updateFormData('teachingPreferences', 'expectedCompensation', this.value); updateRangeValue('compensationValue', '₹' + parseInt(this.value).toLocaleString())">
                        <div class="range-value" id="compensationValue">₹${parseInt(formData.teachingPreferences.expectedCompensation).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderReview() {
    return `
        <div class="form-section">
            <h3>✅ Review Your Application</h3>
            <div style="display: grid; gap: 2rem;">
                <div class="card">
                    <div class="card__header">
                        <h4>👤 Personal Information</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Name:</strong> ${formData.personalInfo.fullName}</p>
                        <p><strong>Email:</strong> ${formData.personalInfo.email}</p>
                        <p><strong>Phone:</strong> ${formData.personalInfo.phone}</p>
                        ${formData.personalInfo.city ? `<p><strong>City:</strong> ${formData.personalInfo.city}</p>` : ''}
                        ${formData.personalInfo.dob ? `<p><strong>Date of Birth:</strong> ${formData.personalInfo.dob}</p>` : ''}
                        ${formData.personalInfo.gender ? `<p><strong>Gender:</strong> ${formData.personalInfo.gender}</p>` : ''}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__header">
                        <h4>💼 Professional Information</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Designation:</strong> ${formData.professionalInfo.designation}</p>
                        <p><strong>Organization:</strong> ${formData.professionalInfo.organization}</p>
                        <p><strong>Experience:</strong> ${formData.professionalInfo.experience} years</p>
                        <p><strong>Expertise:</strong> ${formData.professionalInfo.expertise.join(', ')}</p>
                        ${formData.professionalInfo.linkedinProfile ? `<p><strong>LinkedIn:</strong> ${formData.professionalInfo.linkedinProfile}</p>` : ''}
                        ${formData.professionalInfo.certifications ? `<p><strong>Certifications:</strong> ${formData.professionalInfo.certifications}</p>` : ''}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__header">
                        <h4>🎓 Teaching Preferences</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Preferred Subjects:</strong> ${formData.teachingPreferences.subjects.join(', ')}</p>
                        <p><strong>Teaching Mode:</strong> ${formData.teachingPreferences.mode}</p>
                        <p><strong>Expected Compensation:</strong> ₹${parseInt(formData.teachingPreferences.expectedCompensation).toLocaleString()}</p>
                        ${formData.teachingPreferences.availability ? `<p><strong>Availability:</strong> ${formData.teachingPreferences.availability}</p>` : ''}
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>📄 Documents Uploaded</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Photo:</strong> ${formData.documents.photo ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>PAN Card:</strong> ${formData.documents.panCard ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Aadhar Front:</strong> ${formData.documents.aadharFront ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Aadhar Back:</strong> ${formData.documents.aadharBack ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Resume:</strong> ${formData.documents.resume ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// FORM HELPER FUNCTIONS
// =============================================================================

function updateFormData(section, field, value) {
    try {
        formData[section][field] = value;
        console.log(`Updated ${section}.${field}:`, value);
    } catch (error) {
        console.error('Error updating form data:', error);
    }
}

function updateRangeValue(elementId, value) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    } catch (error) {
        console.error('Error updating range value:', error);
    }
}

function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.form-control.error');
    errorElements.forEach(element => {
        element.classList.remove('error');
    });
}

function initializeInteractiveElements() {
    Object.keys(formData.documents).forEach(key => {
        if (formData.documents[key]) {
            showFilePreview(key, formData.documents[key]);
        }
    });
}

// =============================================================================
// MULTI-SELECT FUNCTIONS
// =============================================================================

function toggleDropdown(selectId) {
    try {
        const dropdown = document.getElementById(selectId.replace('Select', 'Dropdown'));
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    } catch (error) {
        console.error('Error toggling dropdown:', error);
    }
}

function toggleMultiSelectOption(section, field, option) {
    try {
        const currentValues = formData[section][field];
        if (currentValues.includes(option)) {
            formData[section][field] = currentValues.filter(v => v !== option);
        } else {
            formData[section][field] = [...currentValues, option];
        }
        renderCurrentStep();
    } catch (error) {
        console.error('Error toggling multi-select option:', error);
    }
}

function removeFromMultiSelect(section, field, option) {
    try {
        formData[section][field] = formData[section][field].filter(v => v !== option);
        renderCurrentStep();
    } catch (error) {
        console.error('Error removing from multi-select:', error);
    }
}

// =============================================================================
// FILE UPLOAD FUNCTIONS
// =============================================================================

function triggerFileUpload(type) {
    try {
        const input = document.getElementById(type + 'Input');
        if (input) {
            input.click();
        }
    } catch (error) {
        console.error('Error triggering file upload:', error);
    }
}

function handleFileSelect(event, type) {
    try {
        const file = event.target.files[0];
        if (file && validateFile(file, type)) {
            formData.documents[type] = file;
            showFilePreview(type, file);
        }
    } catch (error) {
        console.error('Error handling file select:', error);
    }
}

function handleFileDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget;
    target.classList.remove('dragover');
    
    try {
        const file = event.dataTransfer.files[0];
        if (file && validateFile(file, type)) {
            formData.documents[type] = file;
            showFilePreview(type, file);
            
            const input = document.getElementById(type + 'Input');
            if (input) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
            }
        }
    } catch (error) {
        console.error('Error handling file drop:', error);
    }
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function validateFile(file, type) {
    const maxSize = type === 'resume' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    
    if (file.size > maxSize) {
        alert(`File size should not exceed ${type === 'resume' ? '10MB' : '5MB'}`);
        return false;
    }
    
    if (type === 'resume') {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file for resume');
            return false;
        }
    } else {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return false;
        }
    }
    
    return true;
}

function showFilePreview(type, file) {
    try {
        const previewDiv = document.getElementById(type + 'Preview');
        if (!previewDiv) return;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewDiv.innerHTML = `
                    <div class="file-preview">
                        <div class="file-item">
                            <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
                            <button class="file-remove" onclick="removeFile('${type}')">×</button>
                        </div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            previewDiv.innerHTML = `
                <div class="file-preview">
                    <div class="file-item">
                        <div style="padding: 1rem; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                            <p style="font-size: 0.75rem; word-break: break-all; margin: 0;">${file.name}</p>
                        </div>
                        <button class="file-remove" onclick="removeFile('${type}')">×</button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error showing file preview:', error);
    }
}

function removeFile(type) {
    try {
        formData.documents[type] = null;
        
        const previewDiv = document.getElementById(type + 'Preview');
        if (previewDiv) {
            previewDiv.innerHTML = '';
        }
        
        const inputElement = document.getElementById(type + 'Input');
        if (inputElement) {
            inputElement.value = '';
        }
    } catch (error) {
        console.error('Error removing file:', error);
    }
}

// =============================================================================
// FORM NAVIGATION & VALIDATION
// =============================================================================

function nextStep() {
    try {
        if (currentStep === steps.length - 1) {
            // This is the submit button
            submitApplication();
        } else {
            // Validate current step
            if (validateStep(currentStep)) {
                currentStep = Math.min(currentStep + 1, steps.length - 1);
                renderProgressBar();
                renderCurrentStep();
                window.scrollTo(0, 0);
            } else {
                renderCurrentStep(); // Re-render to show validation errors
            }
        }
    } catch (error) {
        console.error('Error navigating to next step:', error);
    }
}

function prevStep() {
    try {
        currentStep = Math.max(currentStep - 1, 0);
        renderProgressBar();
        renderCurrentStep();
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error navigating to previous step:', error);
    }
}

function validateStep(step) {
    errors = {};
    let isValid = true;
    
    switch (step) {
        case 0: // Personal Info
            if (!formData.personalInfo.fullName.trim()) {
                errors['personalInfo.fullName'] = 'Full name is required';
                isValid = false;
            }
            if (!formData.personalInfo.email.trim()) {
                errors['personalInfo.email'] = 'Email is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
                errors['personalInfo.email'] = 'Please enter a valid email address';
                isValid = false;
            }
            if (!formData.personalInfo.phone.trim()) {
                errors['personalInfo.phone'] = 'Phone number is required';
                isValid = false;
            } else if (!/^[0-9]{10}$/.test(formData.personalInfo.phone.replace(/\D/g, ''))) {
                errors['personalInfo.phone'] = 'Please enter a valid 10-digit phone number';
                isValid = false;
            }
            break;
            
        case 1: // Professional Info
            if (!formData.professionalInfo.designation.trim()) {
                errors['professionalInfo.designation'] = 'Current designation is required';
                isValid = false;
            }
            if (!formData.professionalInfo.organization.trim()) {
                errors['professionalInfo.organization'] = 'Organization/Institution is required';
                isValid = false;
            }
            if (formData.professionalInfo.expertise.length === 0) {
                errors['professionalInfo.expertise'] = 'Please select at least one area of expertise';
                isValid = false;
            }
            break;
            
        case 2: // Documents
            if (!formData.documents.photo) {
                errors['documents.photo'] = 'Passport size photo is required';
                isValid = false;
            }
            if (!formData.documents.panCard) {
                errors['documents.panCard'] = 'PAN card is required';
                isValid = false;
            }
            if (!formData.documents.aadharFront) {
                errors['documents.aadharFront'] = 'Aadhar card front is required';
                isValid = false;
            }
            if (!formData.documents.aadharBack) {
                errors['documents.aadharBack'] = 'Aadhar card back is required';
                isValid = false;
            }
            break;
            
        case 3: // Teaching Preferences
            if (formData.teachingPreferences.subjects.length === 0) {
                errors['teachingPreferences.subjects'] = 'Please select at least one subject you\'d like to teach';
                isValid = false;
            }
            if (!formData.teachingPreferences.mode.trim()) {
                errors['teachingPreferences.mode'] = 'Please select a preferred teaching mode';
                isValid = false;
            }
            break;
    }
    
    return isValid;
}

async function submitApplication() {
    try {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>Submitting...';
            nextBtn.disabled = true;
        }
        
        // Create application object
        const application = {
            id: generateId(),
            ...JSON.parse(JSON.stringify(formData)), // Deep clone
            applicationStatus: 'Pending',
            submissionDate: new Date().toISOString(),
            adminNotes: ''
        };
        
        // Convert files to base64 for storage
        const documentsWithBase64 = {};
        for (const [key, file] of Object.entries(formData.documents)) {
            if (file) {
                documentsWithBase64[key] = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: await fileToBase64(file)
                };
            } else {
                documentsWithBase64[key] = null;
            }
        }
        application.documents = documentsWithBase64;
        
        // Load existing applications and add new one
        const existingApplications = await loadFromGlobalDB();
        const updatedApplications = [...existingApplications, application];
        
        // Save to global database
        await saveToGlobalDB(updatedApplications);
        
        console.log('Application submitted successfully');
        showPage('success');
        
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('There was an error submitting your application. Please try again.');
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '📤 Submit Application';
            nextBtn.disabled = false;
        }
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// =============================================================================
// ADMIN DASHBOARD FUNCTIONS
// =============================================================================

async function loadApplications() {
    try {
        applications = await loadFromGlobalDB();
        console.log('Loaded applications:', applications.length);
    } catch (error) {
        console.error('Error loading applications:', error);
        applications = [];
    }
}

async function initializeDashboard() {
    try {
        await loadApplications();
        renderDashboardStats();
        filterApplications();
        console.log('Dashboard initialized');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

function renderDashboardStats() {
    try {
        const stats = {
            total: applications.length,
            pending: applications.filter(app => app.applicationStatus === 'Pending').length,
            underReview: applications.filter(app => app.applicationStatus === 'Under Review').length,
            approved: applications.filter(app => app.applicationStatus === 'Approved').length,
            rejected: applications.filter(app => app.applicationStatus === 'Rejected').length
        };

        const statsContainer = document.getElementById('dashboardStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #F59E0B">${stats.pending}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #3B82F6">${stats.underReview}</div>
                    <div class="stat-label">Under Review</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #22C55E">${stats.approved}</div>
                    <div class="stat-label">Approved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #EF4444">${stats.rejected}</div>
                    <div class="stat-label">Rejected</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error rendering dashboard stats:', error);
    }
}

function filterApplications() {
    try {
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        
        if (!searchInput || !statusFilter) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilterValue = statusFilter.value;
        
        filteredApplications = applications.filter(app => {
            const matchesSearch = !searchTerm || 
                app.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
                app.personalInfo.email.toLowerCase().includes(searchTerm) ||
                app.professionalInfo.organization.toLowerCase().includes(searchTerm) ||
                app.professionalInfo.designation.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilterValue || app.applicationStatus === statusFilterValue;
            
            return matchesSearch && matchesStatus;
        });
        
        renderApplicationsTable();
    } catch (error) {
        console.error('Error filtering applications:', error);
    }
}

function renderApplicationsTable() {
    try {
        const tbody = document.getElementById('applicationsTable');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody || !emptyState) return;
        
        if (filteredApplications.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            tbody.innerHTML = filteredApplications.map(app => `
                <tr>
                    <td>${app.personalInfo.fullName}</td>
                    <td>${app.personalInfo.email}</td>
                    <td>${app.professionalInfo.designation}</td>
                    <td>${app.professionalInfo.experience} years</td>
                    <td>
                        <span class="status-badge status-${app.applicationStatus.toLowerCase().replace(' ', '-')}">
                            ${app.applicationStatus}
                        </span>
                    </td>
                    <td>${new Date(app.submissionDate).toLocaleDateString()}</td>
                    <td>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn--secondary btn--sm" onclick="viewApplication('${app.id}')">
                                👁️ View
                            </button>
                            <select class="form-control" style="padding: 0.25rem; font-size: 0.75rem; min-width: 100px;" 
                                    onchange="updateApplicationStatus('${app.id}', this.value)">
                                <option value="Pending" ${app.applicationStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Under Review" ${app.applicationStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
                                <option value="Approved" ${app.applicationStatus === 'Approved' ? 'selected' : ''}>Approved</option>
                                <option value="Rejected" ${app.applicationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error rendering applications table:', error);
    }
}

async function updateApplicationStatus(id, status) {
    try {
        showLoading('Updating status...');
        
        applications = applications.map(app =>
            app.id === id ? { ...app, applicationStatus: status } : app
        );
        
        await saveToGlobalDB(applications);
        renderDashboardStats();
        filterApplications();
        
        console.log(`Updated application ${id} status to ${status}`);
    } catch (error) {
        console.error('Error updating application status:', error);
        alert('Error updating status. Please try again.');
    }
}

function viewApplication(id) {
    try {
        const application = applications.find(app => app.id === id);
        if (!application) return;
        
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;
        
        modalBody.innerHTML = `
            <div style="display: grid; gap: 2rem;">
                <div class="card">
                    <div class="card__header">
                        <h4>👤 Personal Information</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                            <div><strong>Name:</strong> ${application.personalInfo.fullName}</div>
                            <div><strong>Email:</strong> ${application.personalInfo.email}</div>
                            <div><strong>Phone:</strong> ${application.personalInfo.phone}</div>
                            <div><strong>City:</strong> ${application.personalInfo.city || 'Not provided'}</div>
                            <div><strong>Gender:</strong> ${application.personalInfo.gender || 'Not provided'}</div>
                            <div><strong>DOB:</strong> ${application.personalInfo.dob || 'Not provided'}</div>
                        </div>
                        ${application.personalInfo.address ? `<div style="margin-top: 1rem;"><strong>Address:</strong> ${application.personalInfo.address}</div>` : ''}
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>💼 Professional Information</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 1rem;">
                            <div><strong>Designation:</strong> ${application.professionalInfo.designation}</div>
                            <div><strong>Organization:</strong> ${application.professionalInfo.organization}</div>
                            <div><strong>Experience:</strong> ${application.professionalInfo.experience} years</div>
                            <div><strong>Areas of Expertise:</strong><br/>${application.professionalInfo.expertise.join(', ')}</div>
                            ${application.professionalInfo.linkedinProfile ? `<div><strong>LinkedIn:</strong> <a href="${application.professionalInfo.linkedinProfile}" target="_blank">${application.professionalInfo.linkedinProfile}</a></div>` : ''}
                            ${application.professionalInfo.certifications ? `<div><strong>Certifications:</strong> ${application.professionalInfo.certifications}</div>` : ''}
                            ${application.professionalInfo.bio ? `<div><strong>Bio:</strong><br/><p style="margin-top: 0.5rem; line-height: 1.6;">${application.professionalInfo.bio}</p></div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>🎓 Teaching Preferences</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 1rem;">
                            <div><strong>Preferred Subjects:</strong><br/>${application.teachingPreferences.subjects.join(', ')}</div>
                            <div><strong>Teaching Mode:</strong> ${application.teachingPreferences.mode}</div>
                            <div><strong>Expected Compensation:</strong> ₹${parseInt(application.teachingPreferences.expectedCompensation).toLocaleString()}</div>
                            ${application.teachingPreferences.availability ? `<div><strong>Availability:</strong> ${application.teachingPreferences.availability}</div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>📄 Documents</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${renderDocumentPreview('Photo', application.documents.photo)}
                            ${renderDocumentPreview('PAN Card', application.documents.panCard)}
                            ${renderDocumentPreview('Aadhar Front', application.documents.aadharFront)}
                            ${renderDocumentPreview('Aadhar Back', application.documents.aadharBack)}
                            ${renderDocumentPreview('Resume', application.documents.resume)}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>📊 Application Status</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 1rem;">
                            <div><strong>Status:</strong> <span class="status-badge status-${application.applicationStatus.toLowerCase().replace(' ', '-')}">${application.applicationStatus}</span></div>
                            <div><strong>Submitted:</strong> ${new Date(application.submissionDate).toLocaleDateString()} at ${new Date(application.submissionDate).toLocaleTimeString()}</div>
                            <div><strong>Application ID:</strong> ${application.id}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('applicationModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error viewing application:', error);
    }
}

function renderDocumentPreview(title, doc) {
    if (!doc) {
        return `
            <div style="text-align: center; padding: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-base);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--color-text-secondary);">❌</div>
                <p style="margin: 0; font-weight: 500;">${title}</p>
                <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-secondary);">Not uploaded</p>
            </div>
        `;
    }
    
    const isImage = doc.type && doc.type.startsWith('image/');
    
    return `
        <div style="text-align: center; padding: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-base);">
            ${isImage ? 
                `<img src="${doc.data}" alt="${title}" style="width: 100%; max-width: 150px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">` :
                `<div style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--fintel-primary);">📄</div>`
            }
            <p style="margin: 0; font-weight: 500;">${title}</p>
            <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-secondary);">${doc.name}</p>
            <a href="${doc.data}" download="${doc.name}" style="display: inline-block; margin-top: 0.5rem; font-size: 0.875rem;">⬇️ Download</a>
        </div>
    `;
}

function closeModal() {
    try {
        document.getElementById('applicationModal').classList.add('hidden');
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

function exportToCSV() {
    try {
        const headers = [
            'Application ID', 'Name', 'Email', 'Phone', 'City', 'Designation', 'Organization', 
            'Experience (Years)', 'Areas of Expertise', 'Preferred Subjects', 'Teaching Mode',
            'Expected Compensation', 'Status', 'Submission Date'
        ];
        
        const csvData = filteredApplications.map(app => [
            app.id,
            app.personalInfo.fullName,
            app.personalInfo.email,
            app.personalInfo.phone,
            app.personalInfo.city || '',
            app.professionalInfo.designation,
            app.professionalInfo.organization,
            app.professionalInfo.experience,
            '"' + app.professionalInfo.expertise.join(', ') + '"',
            '"' + app.teachingPreferences.subjects.join(', ') + '"',
            app.teachingPreferences.mode,
            app.teachingPreferences.expectedCompensation,
            app.applicationStatus,
            new Date(app.submissionDate).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => typeof field === 'string' && field.includes(',') && !field.startsWith('"') ? `"${field}"` : field).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `faculty_applications_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('CSV exported successfully');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Error exporting data. Please try again.');
    }
}

// =============================================================================
// INITIALIZATION & EVENT HANDLERS
// =============================================================================

function initApp() {
    try {
        console.log('Initializing Fintelligence Academy Faculty Empanelment App');
        
        // Initialize theme
        initializeTheme();
        
        // Check admin login status
        if (isLoggedIn) {
            const logoutBtn = document.getElementById('logoutBtn');
            const adminAccessBtn = document.getElementById('adminAccessBtn');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (adminAccessBtn) adminAccessBtn.classList.add('hidden');
        }
        
        // Show landing page
        showPage('landing');
        
        // Bind event handlers to buttons
        bindEventHandlers();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function bindEventHandlers() {
    try {
        // Bind navigation buttons if they exist
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        
        if (nextBtn) {
            nextBtn.onclick = nextStep;
        }
        
        if (prevBtn) {
            prevBtn.onclick = prevStep;
        }
        
        console.log('Event handlers bound successfully');
    } catch (error) {
        console.error('Error binding event handlers:', error);
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    try {
        const dropdowns = document.querySelectorAll('.multi-select-dropdown.open');
        dropdowns.forEach(dropdown => {
            const parent = dropdown.closest('.multi-select');
            if (parent && !parent.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
    } catch (error) {
        console.error('Error handling document click:', error);
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing App');
    setTimeout(initApp, 100); // Small delay to ensure all elements are ready
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Make all functions globally available for onclick handlers - FIXED
window.toggleTheme = toggleTheme;
window.showLanding = showLanding;
window.startApplication = startApplication;
window.showAdminLogin = showAdminLogin;
window.adminLogin = adminLogin;
window.logout = logout;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updateFormData = updateFormData;
window.updateRangeValue = updateRangeValue;
window.toggleDropdown = toggleDropdown;
window.toggleMultiSelectOption = toggleMultiSelectOption;
window.removeFromMultiSelect = removeFromMultiSelect;
window.triggerFileUpload = triggerFileUpload;
window.handleFileSelect = handleFileSelect;
window.handleFileDrop = handleFileDrop;
window.handleDragOver = handleDragOver;
window.handleDragEnter = handleDragEnter;
window.handleDragLeave = handleDragLeave;
window.removeFile = removeFile;
window.submitApplication = submitApplication;
window.filterApplications = filterApplications;
window.updateApplicationStatus = updateApplicationStatus;
window.viewApplication = viewApplication;
window.closeModal = closeModal;
window.exportToCSV = exportToCSV;

console.log('Fintelligence Academy Faculty Empanelment System Loaded Successfully with all fixes applied!');