// Application state
let currentPage = 'landing';
let currentStep = 0;
let theme = localStorage.getItem('theme') || 'light';
let isLoggedIn = localStorage.getItem('adminToken') !== null;
let applications = [];
let filteredApplications = [];
let currentDocumentData = null;

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

// Data options
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

const documentTypes = [
    {key: "photo", label: "Passport Photo", icon: "📷", required: true},
    {key: "panCard", label: "PAN Card", icon: "🆔", required: true},
    {key: "aadharFront", label: "Aadhar Front", icon: "🆔", required: true},
    {key: "aadharBack", label: "Aadhar Back", icon: "🆔", required: true},
    {key: "resume", label: "Resume/CV", icon: "📄", required: true}
];

const steps = [
    { title: 'Personal Info', icon: '👤' },
    { title: 'Professional', icon: '💼' },
    { title: 'Documents', icon: '📄' },
    { title: 'Teaching', icon: '🎓' },
    { title: 'Review', icon: '✅' }
];

// Initialize app
function initApp() {
    console.log('Initializing Fintelligence Academy Faculty Empanelment App');
    
    try {
        // Set theme
        document.documentElement.setAttribute('data-color-scheme', theme);
        updateThemeToggle();
        
        // Load applications from localStorage
        loadApplications();
        
        // Show appropriate page
        if (isLoggedIn) {
            const logoutBtn = document.getElementById('logoutBtn');
            const adminAccessBtn = document.getElementById('adminAccessBtn');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (adminAccessBtn) adminAccessBtn.classList.add('hidden');
        }
        
        showPage('landing');
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Theme functions
function toggleTheme() {
    try {
        theme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-color-scheme', theme);
        localStorage.setItem('theme', theme);
        updateThemeToggle();
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

function updateThemeToggle() {
    try {
        const icon = document.getElementById('themeIcon');
        const text = document.getElementById('themeText');
        if (icon && text) {
            if (theme === 'light') {
                icon.textContent = '🌙';
                text.textContent = 'Dark';
            } else {
                icon.textContent = '☀️';
                text.textContent = 'Light';
            }
        }
    } catch (error) {
        console.error('Error updating theme toggle:', error);
    }
}

// Navigation functions
function showPage(page) {
    try {
        // Hide all pages
        const pages = document.querySelectorAll('#mainContent > div');
        pages.forEach(div => div.classList.add('hidden'));
        
        // Show selected page
        currentPage = page;
        switch(page) {
            case 'landing':
                document.getElementById('landingPage').classList.remove('hidden');
                document.getElementById('adminAccessBtn').classList.remove('hidden');
                break;
            case 'application':
                document.getElementById('applicationPage').classList.remove('hidden');
                document.getElementById('adminAccessBtn').classList.add('hidden');
                initializeApplicationForm();
                break;
            case 'admin-login':
                document.getElementById('adminLoginPage').classList.remove('hidden');
                document.getElementById('adminAccessBtn').classList.add('hidden');
                break;
            case 'admin':
                document.getElementById('adminDashboard').classList.remove('hidden');
                document.getElementById('adminAccessBtn').classList.add('hidden');
                initializeDashboard();
                break;
            case 'success':
                document.getElementById('successPage').classList.remove('hidden');
                document.getElementById('adminAccessBtn').classList.remove('hidden');
                break;
        }
    } catch (error) {
        console.error('Error showing page:', error);
    }
}

function showLanding() {
    showPage('landing');
}

function startApplication() {
    try {
        // Reset form data
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
        errors = {};
        currentStep = 0;
        showPage('application');
    } catch (error) {
        console.error('Error starting application:', error);
    }
}

function showAdminLogin() {
    showPage('admin-login');
}

// Admin functions
function adminLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const errorDiv = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');
        
        loginBtn.innerHTML = '<span class="loading"><span class="spinner"></span> Logging in...</span>';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            if (email === 'Survesh@fintelligenceacademy.com' && password === 'Self@1111') {
                localStorage.setItem('adminToken', 'admin-token-' + Date.now());
                isLoggedIn = true;
                document.getElementById('logoutBtn').classList.remove('hidden');
                showPage('admin');
            } else {
                errorDiv.textContent = 'Invalid credentials. Please check your email and password.';
                errorDiv.classList.remove('hidden');
            }
            
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
        }, 1000);
    } catch (error) {
        console.error('Error during admin login:', error);
    }
}

function logout() {
    try {
        localStorage.removeItem('adminToken');
        isLoggedIn = false;
        document.getElementById('logoutBtn').classList.add('hidden');
        showLanding();
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Application form functions
function initializeApplicationForm() {
    try {
        renderProgressBar();
        renderCurrentStep();
    } catch (error) {
        console.error('Error initializing application form:', error);
    }
}

function renderProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    progressBar.innerHTML = steps.map((step, index) => `
        <div class="progress-step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}" 
             onclick="goToStep(${index})" style="cursor: pointer;">
            <span>${step.icon}</span>
            <span>${step.title}</span>
        </div>
    `).join('');
}

// NEW: Add function to navigate to specific step
function goToStep(stepIndex) {
    try {
        // Allow navigation to completed steps or next step only
        if (stepIndex <= currentStep + 1 && stepIndex >= 0) {
            // Validate current step before moving forward
            if (stepIndex > currentStep) {
                if (!validateStep(currentStep)) {
                    renderCurrentStep(); // Show validation errors
                    return;
                }
            }
            
            currentStep = stepIndex;
            renderProgressBar();
            renderCurrentStep();
        }
    } catch (error) {
        console.error('Error navigating to step:', error);
    }
}

function renderCurrentStep() {
    const formSteps = document.getElementById('formSteps');
    if (!formSteps) return;
    
    switch(currentStep) {
        case 0:
            formSteps.innerHTML = renderPersonalInfo();
            break;
        case 1:
            formSteps.innerHTML = renderProfessionalInfo();
            break;
        case 2:
            formSteps.innerHTML = renderDocuments();
            break;
        case 3:
            formSteps.innerHTML = renderTeachingPreferences();
            break;
        case 4:
            formSteps.innerHTML = renderReview();
            break;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 0;
    }
    
    if (nextBtn) {
        if (currentStep === steps.length - 1) {
            nextBtn.innerHTML = '📤 Submit Application';
            nextBtn.onclick = submitApplication;
        } else {
            nextBtn.innerHTML = 'Next →';
            nextBtn.onclick = nextStep;
        }
    }
    
    // Initialize interactive elements
    setTimeout(initializeInteractiveElements, 100);
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
                           oninput="updateFormData('personalInfo', 'fullName', this.value)">
                    ${errors['personalInfo.fullName'] ? `<div class="error-message">${errors['personalInfo.fullName']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <input type="email" class="form-control ${errors['personalInfo.email'] ? 'error' : ''}" 
                           value="${formData.personalInfo.email}" 
                           oninput="updateFormData('personalInfo', 'email', this.value)">
                    ${errors['personalInfo.email'] ? `<div class="error-message">${errors['personalInfo.email']}</div>` : ''}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Phone Number *</label>
                    <input type="tel" class="form-control ${errors['personalInfo.phone'] ? 'error' : ''}" 
                           value="${formData.personalInfo.phone}" 
                           oninput="updateFormData('personalInfo', 'phone', this.value)">
                    ${errors['personalInfo.phone'] ? `<div class="error-message">${errors['personalInfo.phone']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" 
                           value="${formData.personalInfo.dob}" 
                           oninput="updateFormData('personalInfo', 'dob', this.value)">
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
                           oninput="updateFormData('personalInfo', 'city', this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">State</label>
                    <input type="text" class="form-control" 
                           value="${formData.personalInfo.state}" 
                           oninput="updateFormData('personalInfo', 'state', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">PIN Code</label>
                    <input type="text" class="form-control" 
                           value="${formData.personalInfo.pincode}" 
                           oninput="updateFormData('personalInfo', 'pincode', this.value)">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Complete Address</label>
                    <textarea class="form-control" rows="3" 
                              oninput="updateFormData('personalInfo', 'address', this.value)">${formData.personalInfo.address}</textarea>
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
                           oninput="updateFormData('professionalInfo', 'designation', this.value)">
                    ${errors['professionalInfo.designation'] ? `<div class="error-message">${errors['professionalInfo.designation']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Organization/Institution *</label>
                    <input type="text" class="form-control ${errors['professionalInfo.organization'] ? 'error' : ''}" 
                           value="${formData.professionalInfo.organization}" 
                           oninput="updateFormData('professionalInfo', 'organization', this.value)">
                    ${errors['professionalInfo.organization'] ? `<div class="error-message">${errors['professionalInfo.organization']}</div>` : ''}
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Years of Experience</label>
                    <div class="range-slider">
                        <input type="range" min="0" max="30" class="range-input" 
                               value="${formData.professionalInfo.experience}" 
                               oninput="updateFormData('professionalInfo', 'experience', parseInt(this.value)); updateRangeValue('experienceValue', this.value + ' years')">
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
                    <label class="form-label">Educational Qualifications</label>
                    <input type="text" class="form-control" 
                           value="${formData.professionalInfo.qualifications}" 
                           oninput="updateFormData('professionalInfo', 'qualifications', this.value)"
                           placeholder="e.g., MBA Finance, CFA, PhD Economics">
                </div>
                <div class="form-group">
                    <label class="form-label">Professional Certifications</label>
                    <input type="text" class="form-control" 
                           value="${formData.professionalInfo.certifications}" 
                           oninput="updateFormData('professionalInfo', 'certifications', this.value)"
                           placeholder="e.g., CFA, FRM, CPA">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">LinkedIn Profile URL</label>
                    <input type="url" class="form-control" 
                           value="${formData.professionalInfo.linkedinProfile}" 
                           oninput="updateFormData('professionalInfo', 'linkedinProfile', this.value)"
                           placeholder="https://linkedin.com/in/yourprofile">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Experience Summary (Max 500 words)</label>
                    <textarea class="form-control" rows="5" 
                              oninput="updateFormData('professionalInfo', 'bio', this.value)"
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
            <p style="color: var(--color-text-secondary); margin-bottom: 24px;">
                <strong>Note:</strong> For testing purposes, you can skip document uploads if needed. 
                Click the file upload areas or drag and drop files to upload documents.
            </p>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Passport Size Photo *</label>
                    <div class="file-upload" onclick="triggerFileUpload('photo')" 
                         ondrop="handleFileDrop(event, 'photo')" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="handleDragEnter(event)" 
                         ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primary);">📷</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'photo')">
                    <div id="photoPreview"></div>
                    ${errors['documents.photo'] ? `<div class="error-message">${errors['documents.photo']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">PAN Card *</label>
                    <div class="file-upload" onclick="triggerFileUpload('panCard')" 
                         ondrop="handleFileDrop(event, 'panCard')" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="handleDragEnter(event)" 
                         ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primary);">🆔</div>
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
                    <div class="file-upload" onclick="triggerFileUpload('aadharFront')" 
                         ondrop="handleFileDrop(event, 'aadharFront')" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="handleDragEnter(event)" 
                         ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primary);">🆔</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Image files only • Max 5MB</p>
                    </div>
                    <input type="file" id="aadharFrontInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event, 'aadharFront')">
                    <div id="aadharFrontPreview"></div>
                    ${errors['documents.aadharFront'] ? `<div class="error-message">${errors['documents.aadharFront']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Aadhar Card Back *</label>
                    <div class="file-upload" onclick="triggerFileUpload('aadharBack')" 
                         ondrop="handleFileDrop(event, 'aadharBack')" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="handleDragEnter(event)" 
                         ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primary);">🆔</div>
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
                    <label class="form-label">Resume/CV (PDF) *</label>
                    <div class="file-upload" onclick="triggerFileUpload('resume')" 
                         ondrop="handleFileDrop(event, 'resume')" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="handleDragEnter(event)" 
                         ondragleave="handleDragLeave(event)">
                        <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primary);">📄</div>
                        <p>Click to upload or drag and drop</p>
                        <p style="font-size: 0.875rem; color: var(--color-text-secondary);">PDF files only • Max 5MB</p>
                    </div>
                    <input type="file" id="resumeInput" accept=".pdf" style="display: none;" onchange="handleFileSelect(event, 'resume')">
                    <div id="resumePreview"></div>
                    ${errors['documents.resume'] ? `<div class="error-message">${errors['documents.resume']}</div>` : ''}
                </div>
            </div>
            <div style="background: var(--color-bg-2); padding: 16px; border-radius: 8px; margin-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary);">
                    <strong>💡 Testing Tip:</strong> For demonstration purposes, you can proceed without uploading documents. 
                    However, in a real application, all documents would be required.
                </p>
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
                    <label class="form-label">Teaching Mode *</label>
                    <select class="form-control ${errors['teachingPreferences.mode'] ? 'error' : ''}" 
                            onchange="updateFormData('teachingPreferences', 'mode', this.value)">
                        <option value="">Select Mode</option>
                        <option value="Online" ${formData.teachingPreferences.mode === 'Online' ? 'selected' : ''}>Online</option>
                        <option value="Offline" ${formData.teachingPreferences.mode === 'Offline' ? 'selected' : ''}>Offline</option>
                        <option value="Hybrid" ${formData.teachingPreferences.mode === 'Hybrid' ? 'selected' : ''}>Hybrid (Online + Offline)</option>
                    </select>
                    ${errors['teachingPreferences.mode'] ? `<div class="error-message">${errors['teachingPreferences.mode']}</div>` : ''}
                </div>
                <div class="form-group">
                    <label class="form-label">Available Days/Times</label>
                    <input type="text" class="form-control" 
                           value="${formData.teachingPreferences.availability}" 
                           oninput="updateFormData('teachingPreferences', 'availability', this.value)"
                           placeholder="e.g., Weekends, Evening hours, Mon-Fri 6-8 PM">
                </div>
            </div>
            <div class="form-row single">
                <div class="form-group">
                    <label class="form-label">Expected Monthly Compensation (₹)</label>
                    <div class="range-slider">
                        <input type="range" min="10000" max="200000" step="5000" class="range-input" 
                               value="${formData.teachingPreferences.expectedCompensation}" 
                               oninput="updateFormData('teachingPreferences', 'expectedCompensation', this.value); updateRangeValue('compensationValue', '₹' + parseInt(this.value).toLocaleString())">
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
                        <h4>Personal Information</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Name:</strong> ${formData.personalInfo.fullName || 'Not provided'}</p>
                        <p><strong>Email:</strong> ${formData.personalInfo.email || 'Not provided'}</p>
                        <p><strong>Phone:</strong> ${formData.personalInfo.phone || 'Not provided'}</p>
                        <p><strong>Date of Birth:</strong> ${formData.personalInfo.dob || 'Not provided'}</p>
                        <p><strong>Gender:</strong> ${formData.personalInfo.gender || 'Not provided'}</p>
                        <p><strong>City:</strong> ${formData.personalInfo.city || 'Not provided'}</p>
                        <p><strong>State:</strong> ${formData.personalInfo.state || 'Not provided'}</p>
                        <p><strong>Address:</strong> ${formData.personalInfo.address || 'Not provided'}</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__header">
                        <h4>Professional Information</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Designation:</strong> ${formData.professionalInfo.designation || 'Not provided'}</p>
                        <p><strong>Organization:</strong> ${formData.professionalInfo.organization || 'Not provided'}</p>
                        <p><strong>Experience:</strong> ${formData.professionalInfo.experience} years</p>
                        <p><strong>Expertise:</strong> ${formData.professionalInfo.expertise.length > 0 ? formData.professionalInfo.expertise.join(', ') : 'None selected'}</p>
                        <p><strong>Qualifications:</strong> ${formData.professionalInfo.qualifications || 'Not provided'}</p>
                        <p><strong>Certifications:</strong> ${formData.professionalInfo.certifications || 'Not provided'}</p>
                        <p><strong>LinkedIn:</strong> ${formData.professionalInfo.linkedinProfile || 'Not provided'}</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__header">
                        <h4>Documents</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Passport Photo:</strong> ${formData.documents.photo ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>PAN Card:</strong> ${formData.documents.panCard ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Aadhar Front:</strong> ${formData.documents.aadharFront ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Aadhar Back:</strong> ${formData.documents.aadharBack ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                        <p><strong>Resume/CV:</strong> ${formData.documents.resume ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__header">
                        <h4>Teaching Preferences</h4>
                    </div>
                    <div class="card__body">
                        <p><strong>Subjects:</strong> ${formData.teachingPreferences.subjects.length > 0 ? formData.teachingPreferences.subjects.join(', ') : 'None selected'}</p>
                        <p><strong>Teaching Mode:</strong> ${formData.teachingPreferences.mode || 'Not selected'}</p>
                        <p><strong>Availability:</strong> ${formData.teachingPreferences.availability || 'Not specified'}</p>
                        <p><strong>Expected Compensation:</strong> ₹${parseInt(formData.teachingPreferences.expectedCompensation).toLocaleString()} per month</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function updateFormData(section, field, value) {
    try {
        formData[section][field] = value;
        // Clear error when user starts typing
        const errorKey = `${section}.${field}`;
        if (errors[errorKey]) {
            delete errors[errorKey];
        }
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

function initializeInteractiveElements() {
    // Initialize file previews
    documentTypes.forEach(docType => {
        if (formData.documents[docType.key]) {
            showFilePreview(docType.key, formData.documents[docType.key]);
        }
    });
}

// Multi-select functions
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
        
        // Clear error when user selects options
        const errorKey = `${section}.${field}`;
        if (errors[errorKey]) {
            delete errors[errorKey];
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

// File upload functions
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
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                event.target.value = '';
                return;
            }
            
            // Convert to base64 and store
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.documents[type] = {
                    data: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: new Date().toISOString()
                };
                
                // Clear error when file is uploaded
                const errorKey = `documents.${type}`;
                if (errors[errorKey]) {
                    delete errors[errorKey];
                }
                
                showFilePreview(type, formData.documents[type]);
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        console.error('Error handling file select:', error);
    }
}

function handleFileDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('dragover');
    
    try {
        const file = event.dataTransfer.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            // Convert to base64 and store
            const reader = new FileReader();
            reader.onload = function(e) {
                formData.documents[type] = {
                    data: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: new Date().toISOString()
                };
                
                // Clear error when file is uploaded
                const errorKey = `documents.${type}`;
                if (errors[errorKey]) {
                    delete errors[errorKey];
                }
                
                showFilePreview(type, formData.documents[type]);
            };
            reader.readAsDataURL(file);
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
    event.target.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.target.classList.remove('dragover');
}

function showFilePreview(type, fileData) {
    try {
        const previewDiv = document.getElementById(type + 'Preview');
        if (!previewDiv) return;
        
        if (fileData.type && fileData.type.startsWith('image/')) {
            previewDiv.innerHTML = `
                <div class="file-preview">
                    <div class="file-item">
                        <img src="${fileData.data}" alt="Preview">
                        <button class="file-remove" onclick="removeFile('${type}')">×</button>
                    </div>
                </div>
            `;
        } else {
            previewDiv.innerHTML = `
                <div class="file-preview">
                    <div class="file-item">
                        <div style="padding: 1rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                            <p style="font-size: 0.75rem; word-break: break-all;">${fileData.name}</p>
                            <p style="font-size: 0.6rem; color: var(--color-text-secondary);">${(fileData.size / 1024).toFixed(1)} KB</p>
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

// Form navigation
function nextStep() {
    try {
        if (validateStep(currentStep)) {
            currentStep = Math.min(currentStep + 1, steps.length - 1);
            renderProgressBar();
            renderCurrentStep();
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
    } catch (error) {
        console.error('Error navigating to previous step:', error);
    }
}

function validateStep(step) {
    errors = {};
    
    switch (step) {
        case 0: // Personal Info
            if (!formData.personalInfo.fullName.trim()) errors['personalInfo.fullName'] = 'Full name is required';
            if (!formData.personalInfo.email.trim()) errors['personalInfo.email'] = 'Email is required';
            if (!formData.personalInfo.phone.trim()) errors['personalInfo.phone'] = 'Phone number is required';
            break;
        case 1: // Professional Info
            if (!formData.professionalInfo.designation.trim()) errors['professionalInfo.designation'] = 'Designation is required';
            if (!formData.professionalInfo.organization.trim()) errors['professionalInfo.organization'] = 'Organization is required';
            if (formData.professionalInfo.expertise.length === 0) errors['professionalInfo.expertise'] = 'At least one expertise area is required';
            break;
        case 2: // Documents - Made optional for testing
            // Relaxed validation for testing purposes
            break;
        case 3: // Teaching Preferences
            if (formData.teachingPreferences.subjects.length === 0) errors['teachingPreferences.subjects'] = 'At least one subject is required';
            if (!formData.teachingPreferences.mode.trim()) errors['teachingPreferences.mode'] = 'Teaching mode is required';
            break;
    }
    
    if (Object.keys(errors).length > 0) {
        renderCurrentStep(); // Re-render to show errors
        return false;
    }
    
    return true;
}

function submitApplication() {
    try {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerHTML = '<span class="loading"><span class="spinner"></span> Submitting...</span>';
            nextBtn.disabled = true;
        }
        
        setTimeout(() => {
            const application = {
                id: Date.now().toString(),
                ...formData,
                applicationStatus: 'Pending',
                submissionDate: new Date().toISOString(),
                adminNotes: ''
            };
            
            // Save to localStorage
            const existingApplications = JSON.parse(localStorage.getItem('facultyApplications') || '[]');
            existingApplications.push(application);
            localStorage.setItem('facultyApplications', JSON.stringify(existingApplications));
            
            // Show success page
            showPage('success');
        }, 2000);
    } catch (error) {
        console.error('Error submitting application:', error);
    }
}

// Admin dashboard functions
function loadApplications() {
    try {
        const stored = localStorage.getItem('facultyApplications');
        if (stored) {
            applications = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        applications = [];
    }
}

function initializeDashboard() {
    try {
        loadApplications();
        renderDashboardStats();
        filterApplications();
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
                <tr onclick="viewApplication('${app.id}')" style="cursor: pointer;">
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
                    <td onclick="event.stopPropagation();">
                        <div class="action-buttons">
                            <button class="btn btn--sm btn--secondary" onclick="viewApplication('${app.id}')">
                                👁️ View
                            </button>
                            <select class="form-control" style="padding: 4px 8px; font-size: 12px; min-width: 120px;" 
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

function updateApplicationStatus(id, status) {
    try {
        applications = applications.map(app =>
            app.id === id ? { ...app, applicationStatus: status } : app
        );
        localStorage.setItem('facultyApplications', JSON.stringify(applications));
        renderDashboardStats();
        filterApplications();
    } catch (error) {
        console.error('Error updating application status:', error);
    }
}

function viewApplication(id) {
    try {
        const application = applications.find(app => app.id === id);
        if (!application) return;
        
        const getDocumentStatus = (docs) => {
            const required = ['photo', 'panCard', 'aadharFront', 'aadharBack', 'resume'];
            const uploaded = required.filter(key => docs[key]).length;
            return `${uploaded}/${required.length} uploaded`;
        };
        
        document.getElementById('modalBody').innerHTML = `
            <div style="display: grid; gap: 2rem;">
                <div class="card">
                    <div class="card__header">
                        <h4>Personal Information</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div><strong>Name:</strong> ${application.personalInfo.fullName}</div>
                            <div><strong>Email:</strong> ${application.personalInfo.email}</div>
                            <div><strong>Phone:</strong> ${application.personalInfo.phone}</div>
                            <div><strong>Date of Birth:</strong> ${application.personalInfo.dob || 'Not provided'}</div>
                            <div><strong>Gender:</strong> ${application.personalInfo.gender || 'Not provided'}</div>
                            <div><strong>City:</strong> ${application.personalInfo.city || 'Not provided'}</div>
                            <div><strong>State:</strong> ${application.personalInfo.state || 'Not provided'}</div>
                            <div><strong>PIN Code:</strong> ${application.personalInfo.pincode || 'Not provided'}</div>
                        </div>
                        ${application.personalInfo.address ? `
                            <div style="margin-top: 1rem;">
                                <strong>Address:</strong><br>
                                ${application.personalInfo.address}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>Professional Information</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 0.5rem;">
                            <div><strong>Designation:</strong> ${application.professionalInfo.designation}</div>
                            <div><strong>Organization:</strong> ${application.professionalInfo.organization}</div>
                            <div><strong>Experience:</strong> ${application.professionalInfo.experience} years</div>
                            <div><strong>Expertise:</strong> ${application.professionalInfo.expertise.join(', ')}</div>
                            ${application.professionalInfo.qualifications ? `<div><strong>Qualifications:</strong> ${application.professionalInfo.qualifications}</div>` : ''}
                            ${application.professionalInfo.certifications ? `<div><strong>Certifications:</strong> ${application.professionalInfo.certifications}</div>` : ''}
                            ${application.professionalInfo.linkedinProfile ? `<div><strong>LinkedIn:</strong> <a href="${application.professionalInfo.linkedinProfile}" target="_blank">${application.professionalInfo.linkedinProfile}</a></div>` : ''}
                            ${application.professionalInfo.bio ? `
                                <div>
                                    <strong>Experience Summary:</strong>
                                    <p style="margin-top: 0.5rem; line-height: 1.6; background: var(--color-bg-1); padding: 1rem; border-radius: 8px;">${application.professionalInfo.bio}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>Teaching Preferences</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 0.5rem;">
                            <div><strong>Preferred Subjects:</strong> ${application.teachingPreferences.subjects.join(', ')}</div>
                            <div><strong>Teaching Mode:</strong> ${application.teachingPreferences.mode}</div>
                            <div><strong>Expected Compensation:</strong> ₹${parseInt(application.teachingPreferences.expectedCompensation).toLocaleString()} per month</div>
                            ${application.teachingPreferences.availability ? `<div><strong>Availability:</strong> ${application.teachingPreferences.availability}</div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>Uploaded Documents (${getDocumentStatus(application.documents)})</h4>
                    </div>
                    <div class="card__body">
                        <div class="document-grid">
                            ${documentTypes.map(docType => {
                                const doc = application.documents[docType.key];
                                if (doc) {
                                    return `
                                        <div class="document-item">
                                            ${doc.type && doc.type.startsWith('image/') ? 
                                                `<img src="${doc.data}" class="document-thumbnail" onclick="viewDocument('${docType.label}', '${doc.data}', '${doc.name}')" alt="${docType.label}">` :
                                                `<div class="document-placeholder" onclick="downloadDocument('${doc.data}', '${doc.name}')">📄</div>`
                                            }
                                            <div class="document-label">${docType.label}</div>
                                            <div class="document-actions-item">
                                                <button class="btn btn--sm btn--secondary" onclick="downloadDocument('${doc.data}', '${application.personalInfo.fullName}_${docType.label.replace(/[^a-zA-Z0-9]/g, '_')}.${doc.name.split('.').pop()}')">
                                                    📥 Download
                                                </button>
                                                ${doc.type && doc.type.startsWith('image/') ? 
                                                    `<button class="btn btn--sm btn--outline" onclick="viewDocument('${docType.label}', '${doc.data}', '${doc.name}')">
                                                        👁️ View
                                                    </button>` : ''
                                                }
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div class="document-item" style="opacity: 0.5;">
                                            <div class="document-placeholder">❌</div>
                                            <div class="document-label">${docType.label}</div>
                                            <div style="text-align: center; font-size: 12px; color: var(--color-error);">Not uploaded</div>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h4>Application Status & Notes</h4>
                    </div>
                    <div class="card__body">
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <label class="form-label">Status</label>
                                <select class="form-control" onchange="updateApplicationStatus('${application.id}', this.value)">
                                    <option value="Pending" ${application.applicationStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Under Review" ${application.applicationStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
                                    <option value="Approved" ${application.applicationStatus === 'Approved' ? 'selected' : ''}>Approved</option>
                                    <option value="Rejected" ${application.applicationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Admin Notes</label>
                                <textarea class="form-control" rows="3" 
                                          onchange="updateAdminNotes('${application.id}', this.value)"
                                          placeholder="Add notes about this application...">${application.adminNotes || ''}</textarea>
                            </div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">
                                <strong>Submitted:</strong> ${new Date(application.submissionDate).toLocaleString()}
                            </div>
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

function updateAdminNotes(id, notes) {
    try {
        applications = applications.map(app =>
            app.id === id ? { ...app, adminNotes: notes } : app
        );
        localStorage.setItem('facultyApplications', JSON.stringify(applications));
    } catch (error) {
        console.error('Error updating admin notes:', error);
    }
}

function viewDocument(title, dataUrl, filename) {
    try {
        currentDocumentData = { data: dataUrl, name: filename };
        document.getElementById('documentTitle').textContent = title;
        document.getElementById('documentViewer').innerHTML = `
            <img src="${dataUrl}" alt="${title}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: var(--shadow-md);">
        `;
        document.getElementById('documentModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error viewing document:', error);
    }
}

function downloadCurrentDocument() {
    try {
        if (currentDocumentData) {
            downloadDocument(currentDocumentData.data, currentDocumentData.name);
        }
    } catch (error) {
        console.error('Error downloading current document:', error);
    }
}

function downloadDocument(base64Data, filename) {
    try {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading document:', error);
    }
}

function closeModal() {
    try {
        document.getElementById('applicationModal').classList.add('hidden');
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

function closeDocumentModal() {
    try {
        document.getElementById('documentModal').classList.add('hidden');
        currentDocumentData = null;
    } catch (error) {
        console.error('Error closing document modal:', error);
    }
}

function exportToCSV() {
    try {
        const headers = [
            'Application ID',
            'Full Name', 
            'Email',
            'Phone',
            'Designation',
            'Organization',
            'Experience (Years)',
            'Expertise Areas',
            'LinkedIn Profile',
            'Application Status',
            'Submission Date',
            'Document Status',
            'Admin Notes'
        ];
        
        const csvData = filteredApplications.map(app => {
            const getDocumentStatus = (docs) => {
                const required = ['photo', 'panCard', 'aadharFront', 'aadharBack', 'resume'];
                const uploaded = required.filter(key => docs[key]).length;
                if (uploaded === required.length) return 'Complete';
                if (uploaded === 0) return 'No documents';
                const missing = required.filter(key => !docs[key]);
                return `Missing: ${missing.join(', ')}`;
            };
            
            return [
                app.id,
                app.personalInfo.fullName,
                app.personalInfo.email,
                app.personalInfo.phone,
                app.professionalInfo.designation,
                app.professionalInfo.organization,
                app.professionalInfo.experience,
                app.professionalInfo.expertise.join('; '),
                app.professionalInfo.linkedinProfile || '',
                app.applicationStatus,
                new Date(app.submissionDate).toLocaleDateString(),
                getDocumentStatus(app.documents),
                app.adminNotes || ''
            ];
        });
        
        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `faculty_applications_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Make functions globally available for onclick handlers
window.toggleTheme = toggleTheme;
window.showLanding = showLanding;
window.startApplication = startApplication;
window.showAdminLogin = showAdminLogin;
window.adminLogin = adminLogin;
window.logout = logout;
window.goToStep = goToStep;
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
window.updateAdminNotes = updateAdminNotes;
window.viewApplication = viewApplication;
window.viewDocument = viewDocument;
window.downloadCurrentDocument = downloadCurrentDocument;
window.downloadDocument = downloadDocument;
window.closeModal = closeModal;
window.closeDocumentModal = closeDocumentModal;
window.exportToCSV = exportToCSV;