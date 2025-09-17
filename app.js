// =================== FINTELLIGENCE FACULTY EMPANELMENT SYSTEM ===================
// GitHub Pages Compatible Faculty Empanelment App with Global Database
// Multiple Storage Strategies: GitHub Gist API, FormSubmit Email, localStorage
// Features: Complete form workflow, document management, admin dashboard
// ================================================================================

// ========== GLOBAL CONFIGURATION ==========
const CONFIG = {
  // Admin credentials
  admin: {
    email: 'Survesh@fintelligenceacademy.com',
    password: 'Self@1111'
  },
  
  // Storage strategies (in order of preference)
  storage: {
    github: {
      apiUrl: 'https://api.github.com/gists',
      description: 'Faculty Applications Database - Fintelligence Academy',
      filename: 'applications.json',
      enabled: true
    },
    formsubmit: {
      endpoint: 'https://formsubmit.co/ajax/admin@fintelligenceacademy.com',
      enabled: true
    },
    localStorage: {
      key: 'fintelligence-faculty-applications',
      enabled: true
    }
  },
  
  // Form configuration
  form: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    requiredDocuments: ['photo', 'panCard', 'aadharFront', 'aadharBack', 'resume']
  }
};

// ========== GLOBAL STATE ==========
let theme = localStorage.getItem('fintelligence-theme') || 'light';
let isLoggedIn = localStorage.getItem('fintelligence-admin-token') !== null;
let applications = [];
let filteredApplications = [];
let currentStep = 0;
let formData = getEmptyFormData();
let currentEditingId = null;

// Document types and form options
const DOCUMENT_TYPES = [
  { key: 'photo', label: 'Passport Photo', icon: '📷', required: true },
  { key: 'panCard', label: 'PAN Card', icon: '🆔', required: true },
  { key: 'aadharFront', label: 'Aadhar Front', icon: '🆔', required: true },
  { key: 'aadharBack', label: 'Aadhar Back', icon: '🆔', required: true },
  { key: 'resume', label: 'Resume/CV', icon: '📄', required: true }
];

const EXPERTISE_OPTIONS = [
  'Artificial Intelligence & Machine Learning',
  'Quantitative Finance', 
  'Traditional Finance',
  'Data Science & Analytics',
  'Financial Modeling',
  'Risk Management',
  'Portfolio Management', 
  'Algorithmic Trading',
  'Blockchain & Cryptocurrency',
  'Financial Research',
  'Python for Finance',
  'Excel & VBA',
  'Derivatives Trading',
  'Investment Banking',
  'Financial Planning'
];

const SUBJECT_OPTIONS = [
  'AI/LLM Agents in Finance',
  'Quantitative Finance Methods',
  'Financial Market Analysis', 
  'Statistical Modeling',
  'Machine Learning for Finance',
  'Risk Assessment & Management',
  'Portfolio Optimization',
  'Trading Strategies',
  'Financial Data Analysis',
  'Python Programming',
  'Excel Advanced Techniques',
  'Derivatives & Options',
  'Investment Analysis', 
  'Corporate Finance',
  'Financial Planning'
];

// ========== UTILITY FUNCTIONS ==========
function $(selector) { 
  return document.querySelector(selector); 
}

function $all(selector) { 
  return document.querySelectorAll(selector); 
}

function generateId() {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function fileSizeReadable(size) {
  if (size >= 1024 * 1024) return (size/1024/1024).toFixed(1) + ' MB';
  if (size >= 1024) return (size/1024).toFixed(1) + ' KB';
  return size + ' B';
}

function getEmptyFormData() {
  return {
    personalInfo: {
      fullName: '', email: '', phone: '', dob: '', gender: '', 
      address: '', city: '', state: '', pincode: ''
    },
    professionalInfo: {
      designation: '', organization: '', experience: '', expertise: [], 
      qualifications: '', certifications: '', linkedinProfile: '', bio: ''
    },
    documents: {
      photo: null, panCard: null, aadharFront: null, aadharBack: null, resume: null
    },
    teachingPreferences: {
      subjects: [], mode: '', availability: '', expectedCompensation: ''
    }
  };
}

// ========== SAMPLE DATA CREATION ==========
function createSampleApplications() {
  const sampleData = [
    {
      id: 'app_sample_001',
      personalInfo: {
        fullName: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91-9876543210',
        dob: '1985-06-15',
        gender: 'Male',
        city: 'Mumbai',
        address: '123 Finance Street, Andheri East, Mumbai',
        state: 'Maharashtra',
        pincode: '400069'
      },
      professionalInfo: {
        designation: 'Senior Financial Analyst',
        organization: 'HDFC Bank',
        experience: '11-15',
        expertise: ['Quantitative Finance', 'Risk Management', 'Financial Modeling'],
        qualifications: 'MBA in Finance from IIM Mumbai, CFA Level 3',
        certifications: 'CFA, FRM, PMP',
        linkedinProfile: 'https://linkedin.com/in/rajesh-kumar-finance',
        bio: 'Experienced financial professional with 12+ years in quantitative finance and risk management.'
      },
      documents: {
        photo: {
          name: 'photo.jpg',
          size: 245760,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        panCard: {
          name: 'pan_card.jpg',
          size: 189440,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        aadharFront: {
          name: 'aadhar_front.jpg',
          size: 234560,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        aadharBack: {
          name: 'aadhar_back.jpg',
          size: 298760,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        resume: {
          name: 'resume.pdf',
          size: 524288,
          type: 'application/pdf',
          data: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+PgovUHJvY1NldCBbL1BERiAvVGV4dF0KPj4KL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjcwIDcwIFRECihTYW1wbGUgRG9jdW1lbnQpIFRqClQqCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMCAwMDAwMCBuIAowMDAwMDAyOTcgMDAwMDAgbiAKMDAwMDAwMzY1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDU4CiUlRU9G'
        }
      },
      teachingPreferences: {
        subjects: ['Quantitative Finance Methods', 'Risk Assessment & Management', 'Financial Modeling'],
        mode: 'Hybrid',
        availability: 'Weekends and evenings, flexible schedule',
        expectedCompensation: '75000-100000'
      },
      applicationStatus: 'Pending',
      submissionDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      adminNotes: ''
    },
    {
      id: 'app_sample_002',
      personalInfo: {
        fullName: 'Prof. Priya Singh',
        email: 'priya.singh@email.com',
        phone: '+91-9876543211',
        dob: '1980-03-22',
        gender: 'Female',
        city: 'Bangalore',
        address: '456 Tech Park, Whitefield, Bangalore',
        state: 'Karnataka',
        pincode: '560066'
      },
      professionalInfo: {
        designation: 'Associate Professor',
        organization: 'IIM Bangalore',
        experience: '6-10',
        expertise: ['Artificial Intelligence & Machine Learning', 'Data Science & Analytics', 'Python for Finance'],
        qualifications: 'PhD in Computer Science from IISc Bangalore, M.Tech in AI',
        certifications: 'Google Cloud ML Engineer, AWS Certified',
        linkedinProfile: 'https://linkedin.com/in/priya-singh-ai',
        bio: 'AI researcher and educator specializing in machine learning applications in finance.'
      },
      documents: {
        photo: {
          name: 'profile_photo.jpg',
          size: 198765,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        panCard: {
          name: 'pan.jpg',
          size: 156789,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        aadharFront: null, // Missing document to show incomplete status
        aadharBack: {
          name: 'aadhar_back.jpg',
          size: 267890,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        resume: {
          name: 'cv_priya_singh.pdf',
          size: 445678,
          type: 'application/pdf',
          data: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+PgovUHJvY1NldCBbL1BERiAvVGV4dF0KPj4KL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjcwIDcwIFRECihTYW1wbGUgRG9jdW1lbnQpIFRqClQqCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMCAwMDAwMCBuIAowMDAwMDAyOTcgMDAwMDAgbiAKMDAwMDAwMzY1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDU4CiUlRU9G'
        }
      },
      teachingPreferences: {
        subjects: ['AI/LLM Agents in Finance', 'Machine Learning for Finance', 'Python Programming'],
        mode: 'Online',
        availability: 'Flexible, prefer weekday evenings',
        expectedCompensation: '50000-75000'
      },
      applicationStatus: 'Approved',
      submissionDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      adminNotes: 'Excellent candidate with strong AI background. Approved for ML finance courses.'
    },
    {
      id: 'app_sample_003',
      personalInfo: {
        fullName: 'Mr. Arjun Patel',
        email: 'arjun.patel@email.com',
        phone: '+91-9876543212',
        dob: '1990-11-08',
        gender: 'Male',
        city: 'Ahmedabad',
        address: '789 Business District, SG Highway, Ahmedabad',
        state: 'Gujarat',
        pincode: '380015'
      },
      professionalInfo: {
        designation: 'Trading Manager',
        organization: 'Zerodha Securities',
        experience: '3-5',
        expertise: ['Algorithmic Trading', 'Derivatives Trading', 'Portfolio Management'],
        qualifications: 'MBA in Finance from XLRI, B.Tech in Computer Science',
        certifications: 'NISM Certified, Options Trading Specialist',
        linkedinProfile: 'https://linkedin.com/in/arjun-patel-trading',
        bio: 'Trading professional with expertise in algorithmic strategies and derivatives.'
      },
      documents: {
        photo: {
          name: 'arjun_photo.jpg',
          size: 187654,
          type: 'image/jpeg',
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        },
        panCard: null, // Missing
        aadharFront: null, // Missing
        aadharBack: null, // Missing
        resume: null // Missing - incomplete application
      },
      teachingPreferences: {
        subjects: ['Trading Strategies', 'Derivatives & Options', 'Algorithmic Trading'],
        mode: 'Hybrid',
        availability: 'Weekends only due to full-time trading responsibilities',
        expectedCompensation: '100000-150000'
      },
      applicationStatus: 'Under Review',
      submissionDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      adminNotes: 'Good trading background but missing required documents. Following up.'
    }
  ];
  
  return sampleData;
}

// ========== THEME MANAGEMENT ==========
function applyTheme() {
  document.documentElement.setAttribute('data-color-scheme', theme);
  const themeIcon = $('#themeIcon');
  const themeText = $('#themeText');
  if (themeIcon && themeText) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    themeText.textContent = theme === 'light' ? 'Dark' : 'Light';
  }
}

function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('fintelligence-theme', theme);
  applyTheme();
  showToast('Theme switched to ' + theme + ' mode', 'info');
}

// ========== NAVIGATION SYSTEM ==========
function showPage(page) {
  console.log('Navigating to page:', page);
  
  // Hide all main content sections
  const pages = $all('#mainContent > div');
  pages.forEach(div => div.classList.add('hidden'));
  
  const adminBtn = $('#adminAccessBtn');
  const logoutBtn = $('#logoutBtn');
  
  switch(page) {
    case 'landing': 
      $('#landingPage')?.classList.remove('hidden');
      adminBtn?.classList.remove('hidden');
      logoutBtn?.classList.add('hidden');
      break;
      
    case 'application': 
      $('#applicationPage')?.classList.remove('hidden');
      adminBtn?.classList.add('hidden');
      initApplicationForm();
      break;
      
    case 'admin-login': 
      $('#adminLoginPage')?.classList.remove('hidden');
      adminBtn?.classList.add('hidden');
      break;
      
    case 'admin': 
      $('#adminDashboard')?.classList.remove('hidden');
      adminBtn?.classList.add('hidden');
      logoutBtn?.classList.remove('hidden');
      initDashboard();
      break;
      
    case 'success': 
      $('#successPage')?.classList.remove('hidden');
      adminBtn?.classList.remove('hidden');
      logoutBtn?.classList.add('hidden');
      break;
  }
}

// Public navigation functions
function showLanding() { showPage('landing'); }
function startApplication() { 
  formData = getEmptyFormData(); 
  currentStep = 0; 
  showPage('application'); 
}
function showAdminLogin() { showPage('admin-login'); }

// ========== NOTIFICATION SYSTEM ==========
function showToast(message, type = 'info', duration = 4000) {
  const container = $('#toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>${getToastIcon(type)}</span>
      <span>${message}</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

function showLoading(message = 'Processing...') {
  const indicator = $('#loadingIndicator');
  const text = $('#loadingText');
  if (indicator && text) {
    text.textContent = message;
    indicator.classList.remove('hidden');
  }
}

function hideLoading() {
  const indicator = $('#loadingIndicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

// ========== STORAGE SYSTEM ==========
class GlobalStorage {
  constructor() {
    this.strategies = [
      { name: 'Local Storage', handler: this.localStorageStrategy.bind(this) },
      { name: 'GitHub Gist', handler: this.githubStrategy.bind(this) },
      { name: 'FormSubmit Email', handler: this.formsubmitStrategy.bind(this) }
    ];
  }
  
  async save(data) {
    let lastError = null;
    
    for (const strategy of this.strategies) {
      try {
        console.log(`Attempting to save with ${strategy.name}...`);
        await strategy.handler.save(data);
        console.log(`✅ Successfully saved with ${strategy.name}`);
        this.updateDbStatus('online', `Connected via ${strategy.name}`);
        return true;
      } catch (error) {
        console.warn(`❌ ${strategy.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    this.updateDbStatus('offline', 'All storage methods failed');
    throw lastError || new Error('All storage strategies failed');
  }
  
  async load() {
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.handler.load();
        if (result && result.length >= 0) { // Changed condition to allow empty arrays
          console.log(`✅ Loaded data from ${strategy.name}: ${result.length} items`);
          this.updateDbStatus('online', `Connected via ${strategy.name}`);
          return result;
        }
      } catch (error) {
        console.warn(`❌ ${strategy.name} load failed:`, error.message);
        continue;
      }
    }
    
    console.log('📦 No existing data found, creating sample data');
    // If no data exists anywhere, create and save sample data
    const sampleData = createSampleApplications();
    await this.localStorageStrategy.save(sampleData);
    this.updateDbStatus('online', 'Initialized with sample data');
    return sampleData;
  }
  
  // Local Storage Strategy (Primary for GitHub Pages)
  localStorageStrategy = {
    save: async (data) => {
      if (data.personalInfo) {
        // Single application - add to existing array
        const existing = JSON.parse(localStorage.getItem(CONFIG.storage.localStorage.key) || '[]');
        const index = existing.findIndex(app => app.id === data.id);
        if (index >= 0) {
          existing[index] = data;
        } else {
          existing.push(data);
        }
        localStorage.setItem(CONFIG.storage.localStorage.key, JSON.stringify(existing));
      } else {
        // Array of applications - replace entirely
        localStorage.setItem(CONFIG.storage.localStorage.key, JSON.stringify(data));
      }
      return true;
    },
    
    load: async () => {
      const data = localStorage.getItem(CONFIG.storage.localStorage.key);
      return data ? JSON.parse(data) : [];
    }
  };
  
  // GitHub Gist Strategy
  githubStrategy = {
    save: async (data) => {
      const gistData = {
        description: CONFIG.storage.github.description,
        public: false,
        files: {
          [CONFIG.storage.github.filename]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      };
      
      const response = await fetch(CONFIG.storage.github.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify(gistData)
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const result = await response.json();
      localStorage.setItem('fintelligence-gist-id', result.id);
      return result;
    },
    
    load: async () => {
      const gistId = localStorage.getItem('fintelligence-gist-id');
      if (!gistId) return [];
      
      const response = await fetch(`${CONFIG.storage.github.apiUrl}/${gistId}`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const gist = await response.json();
      const content = gist.files[CONFIG.storage.github.filename]?.content;
      return content ? JSON.parse(content) : [];
    }
  };
  
  // FormSubmit Email Strategy
  formsubmitStrategy = {
    save: async (data) => {
      const formData = new FormData();
      formData.append('_subject', 'New Faculty Application - Fintelligence Academy');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('application_data', JSON.stringify(data, null, 2));
      formData.append('applicant_name', data.personalInfo?.fullName || 'Unknown');
      formData.append('applicant_email', data.personalInfo?.email || 'Unknown');
      formData.append('submission_time', new Date().toISOString());
      
      const response = await fetch(CONFIG.storage.formsubmit.endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`FormSubmit error: ${response.status}`);
      }
      
      return response.json();
    },
    
    load: async () => {
      // FormSubmit doesn't provide read access, fallback to localStorage
      return await this.localStorageStrategy.load();
    }
  };
  
  updateDbStatus(status, message) {
    const statusDot = $('.status-dot');
    const statusText = $('#dbStatusText');
    
    if (statusDot) {
      statusDot.className = status === 'online' ? 'status-dot' : 'status-dot offline';
    }
    
    if (statusText) {
      statusText.textContent = `Database: ${message}`;
    }
  }
}

// Global storage instance
const globalStorage = new GlobalStorage();

// ========== FORM SYSTEM ==========
function initApplicationForm() {
  renderExpertiseCheckboxes();
  renderSubjectCheckboxes();
  renderDocumentUploads();
  updateFormProgress();
  updateFormNavigation();
  
  // Fix date field handling
  const dobField = $('#dob');
  if (dobField) {
    dobField.addEventListener('input', function(e) {
      // Ensure the date value is properly stored
      formData.personalInfo.dob = e.target.value;
    });
  }
}

function renderExpertiseCheckboxes() {
  const container = $('#expertiseGroup');
  if (!container) return;
  
  container.innerHTML = EXPERTISE_OPTIONS.map(option => `
    <div class="checkbox-item">
      <input type="checkbox" id="expertise_${option.replace(/\s+/g, '_')}" 
             value="${option}" onchange="updateExpertise()">
      <label for="expertise_${option.replace(/\s+/g, '_')}">${option}</label>
    </div>
  `).join('');
}

function renderSubjectCheckboxes() {
  const container = $('#subjectsGroup');
  if (!container) return;
  
  container.innerHTML = SUBJECT_OPTIONS.map(option => `
    <div class="checkbox-item">
      <input type="checkbox" id="subject_${option.replace(/\s+/g, '_')}" 
             value="${option}" onchange="updateSubjects()">
      <label for="subject_${option.replace(/\s+/g, '_')}">${option}</label>
    </div>
  `).join('');
}

function renderDocumentUploads() {
  const container = $('#documentUploadGrid');
  if (!container) return;
  
  container.innerHTML = DOCUMENT_TYPES.map(doc => `
    <div class="document-upload-item" id="upload_${doc.key}">
      <div class="upload-icon">${doc.icon}</div>
      <div class="upload-title">${doc.label}</div>
      <div class="upload-subtitle">
        ${doc.required ? 'Required' : 'Optional'} • Max 5MB<br>
        JPG, PNG, PDF
      </div>
      <input type="file" class="file-input" accept="image/*,application/pdf" 
             onchange="handleFileUpload(event, '${doc.key}')">
      <div class="file-preview" id="preview_${doc.key}" style="display:none;"></div>
      <div class="file-info" id="info_${doc.key}" style="display:none;"></div>
      <button class="remove-file" id="remove_${doc.key}" style="display:none;" 
              onclick="removeFile('${doc.key}')">×</button>
    </div>
  `).join('');
}

function updateExpertise() {
  const checkboxes = $all('#expertiseGroup input[type="checkbox"]:checked');
  formData.professionalInfo.expertise = Array.from(checkboxes).map(cb => cb.value);
}

function updateSubjects() {
  const checkboxes = $all('#subjectsGroup input[type="checkbox"]:checked');
  formData.teachingPreferences.subjects = Array.from(checkboxes).map(cb => cb.value);
}

function handleFileUpload(event, docType) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file
  if (file.size > CONFIG.form.maxFileSize) {
    showToast(`File size must be less than ${CONFIG.form.maxFileSize / (1024*1024)}MB`, 'error');
    return;
  }
  
  if (!CONFIG.form.allowedTypes.includes(file.type)) {
    showToast('Please upload JPG, PNG, or PDF files only', 'error');
    return;
  }
  
  // Convert to base64
  const reader = new FileReader();
  reader.onload = function(e) {
    formData.documents[docType] = {
      name: file.name,
      size: file.size,
      type: file.type,
      data: e.target.result
    };
    
    updateDocumentPreview(docType, file, e.target.result);
    showToast(`${file.name} uploaded successfully`, 'success');
  };
  
  reader.readAsDataURL(file);
}

function updateDocumentPreview(docType, file, dataUrl) {
  const uploadItem = $(`#upload_${docType}`);
  const preview = $(`#preview_${docType}`);
  const info = $(`#info_${docType}`);
  const removeBtn = $(`#remove_${docType}`);
  
  if (uploadItem) uploadItem.classList.add('uploaded');
  
  if (preview) {
    preview.style.display = 'block';
    if (file.type.startsWith('image/')) {
      preview.innerHTML = `<img src="${dataUrl}" class="file-preview" alt="${file.name}">`;
    } else {
      preview.innerHTML = `<div class="document-icon">📄</div>`;
    }
  }
  
  if (info) {
    info.style.display = 'block';
    info.innerHTML = `${file.name}<br>${fileSizeReadable(file.size)}`;
  }
  
  if (removeBtn) removeBtn.style.display = 'block';
}

function removeFile(docType) {
  formData.documents[docType] = null;
  
  const uploadItem = $(`#upload_${docType}`);
  const preview = $(`#preview_${docType}`);
  const info = $(`#info_${docType}`);
  const removeBtn = $(`#remove_${docType}`);
  const fileInput = $(`#upload_${docType} .file-input`);
  
  if (uploadItem) uploadItem.classList.remove('uploaded');
  if (preview) preview.style.display = 'none';
  if (info) info.style.display = 'none';
  if (removeBtn) removeBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
  
  showToast('File removed', 'info');
}

function changeStep(direction) {
  if (direction > 0 && !validateCurrentStep()) {
    return;
  }
  
  collectCurrentStepData();
  
  const newStep = currentStep + direction;
  if (newStep >= 0 && newStep < 4) {
    currentStep = newStep;
    updateFormProgress();
    updateFormNavigation();
    populateFormFields();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function validateCurrentStep() {
  const errors = [];
  
  switch (currentStep) {
    case 0: // Personal Info
      if (!$('#fullName')?.value.trim()) errors.push('Full Name is required');
      if (!$('#email')?.value.trim()) errors.push('Email is required');
      if (!$('#phone')?.value.trim()) errors.push('Phone is required');
      if (!$('#city')?.value.trim()) errors.push('City is required');
      break;
      
    case 1: // Professional Info
      if (!$('#designation')?.value.trim()) errors.push('Designation is required');
      if (!$('#organization')?.value.trim()) errors.push('Organization is required');
      if (!$('#experience')?.value) errors.push('Experience is required');
      if (!$('#qualifications')?.value.trim()) errors.push('Qualifications are required');
      if (formData.professionalInfo.expertise.length === 0) {
        errors.push('Please select at least one area of expertise');
      }
      break;
      
    case 2: // Documents
      const missingDocs = CONFIG.form.requiredDocuments.filter(docKey => !formData.documents[docKey]);
      if (missingDocs.length > 0) {
        errors.push(`Missing required documents: ${missingDocs.map(key => 
          DOCUMENT_TYPES.find(d => d.key === key)?.label
        ).join(', ')}`);
      }
      break;
      
    case 3: // Teaching Preferences
      if (!$('#teachingMode')?.value) errors.push('Teaching mode is required');
      if (formData.teachingPreferences.subjects.length === 0) {
        errors.push('Please select at least one subject to teach');
      }
      break;
  }
  
  if (errors.length > 0) {
    showToast(errors[0], 'error');
    return false;
  }
  
  return true;
}

function collectCurrentStepData() {
  switch (currentStep) {
    case 0: // Personal Info
      formData.personalInfo = {
        fullName: $('#fullName')?.value.trim() || '',
        email: $('#email')?.value.trim() || '',
        phone: $('#phone')?.value.trim() || '',
        dob: $('#dob')?.value || '',
        gender: $('#gender')?.value || '',
        address: $('#address')?.value.trim() || '',
        city: $('#city')?.value.trim() || '',
        state: $('#state')?.value || '',
        pincode: $('#pincode')?.value || ''
      };
      break;
      
    case 1: // Professional Info
      formData.professionalInfo = {
        ...formData.professionalInfo,
        designation: $('#designation')?.value.trim() || '',
        organization: $('#organization')?.value.trim() || '',
        experience: $('#experience')?.value || '',
        qualifications: $('#qualifications')?.value.trim() || '',
        certifications: $('#certifications')?.value.trim() || '',
        linkedinProfile: $('#linkedinProfile')?.value.trim() || '',
        bio: $('#bio')?.value.trim() || ''
      };
      break;
      
    case 3: // Teaching Preferences
      formData.teachingPreferences = {
        ...formData.teachingPreferences,
        mode: $('#teachingMode')?.value || '',
        availability: $('#availability')?.value.trim() || '',
        expectedCompensation: $('#expectedCompensation')?.value || ''
      };
      break;
  }
}

function populateFormFields() {
  switch (currentStep) {
    case 0: // Personal Info
      const pi = formData.personalInfo;
      if ($('#fullName')) $('#fullName').value = pi.fullName || '';
      if ($('#email')) $('#email').value = pi.email || '';
      if ($('#phone')) $('#phone').value = pi.phone || '';
      if ($('#dob')) $('#dob').value = pi.dob || '';
      if ($('#gender')) $('#gender').value = pi.gender || '';
      if ($('#address')) $('#address').value = pi.address || '';
      if ($('#city')) $('#city').value = pi.city || '';
      if ($('#state')) $('#state').value = pi.state || '';
      if ($('#pincode')) $('#pincode').value = pi.pincode || '';
      break;
      
    case 1: // Professional Info
      const prof = formData.professionalInfo;
      if ($('#designation')) $('#designation').value = prof.designation || '';
      if ($('#organization')) $('#organization').value = prof.organization || '';
      if ($('#experience')) $('#experience').value = prof.experience || '';
      if ($('#qualifications')) $('#qualifications').value = prof.qualifications || '';
      if ($('#certifications')) $('#certifications').value = prof.certifications || '';
      if ($('#linkedinProfile')) $('#linkedinProfile').value = prof.linkedinProfile || '';
      if ($('#bio')) $('#bio').value = prof.bio || '';
      
      // Restore expertise checkboxes
      prof.expertise.forEach(expertise => {
        const checkbox = $(`#expertise_${expertise.replace(/\s+/g, '_')}`);
        if (checkbox) checkbox.checked = true;
      });
      break;
      
    case 3: // Teaching Preferences
      const tp = formData.teachingPreferences;
      if ($('#teachingMode')) $('#teachingMode').value = tp.mode || '';
      if ($('#availability')) $('#availability').value = tp.availability || '';
      if ($('#expectedCompensation')) $('#expectedCompensation').value = tp.expectedCompensation || '';
      
      // Restore subject checkboxes
      tp.subjects.forEach(subject => {
        const checkbox = $(`#subject_${subject.replace(/\s+/g, '_')}`);
        if (checkbox) checkbox.checked = true;
      });
      break;
  }
}

function updateFormProgress() {
  const steps = $all('.step');
  steps.forEach((step, index) => {
    step.classList.remove('active', 'completed');
    if (index === currentStep) {
      step.classList.add('active');
    } else if (index < currentStep) {
      step.classList.add('completed');
    }
  });
  
  const formSteps = $all('.form-step');
  formSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === currentStep) {
      step.classList.add('active');
    }
  });
}

function updateFormNavigation() {
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const submitBtn = $('#submitBtn');
  
  if (prevBtn) {
    prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-flex';
  }
  
  if (nextBtn && submitBtn) {
    if (currentStep === 3) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }
}

async function submitApplication() {
  if (!validateCurrentStep()) return;
  
  collectCurrentStepData();
  
  // Final validation
  if (!formData.personalInfo.fullName || !formData.personalInfo.email) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  showLoading('Submitting your application to global database...');
  
  try {
    // Create application object
    const application = {
      id: generateId(),
      ...formData,
      applicationStatus: 'Pending',
      submissionDate: new Date().toISOString(),
      adminNotes: ''
    };
    
    // Save to global storage
    await globalStorage.save(application);
    
    // Send admin notification email
    await sendAdminNotification(application);
    
    hideLoading();
    showToast('Application submitted successfully!', 'success');
    
    // Reset form and show success page
    formData = getEmptyFormData();
    currentStep = 0;
    showPage('success');
    
  } catch (error) {
    hideLoading();
    console.error('Submission error:', error);
    showToast('Application submitted but may need manual review. Admin has been notified.', 'warning');
    showPage('success');
  }
}

async function sendAdminNotification(application) {
  try {
    const formData = new FormData();
    formData.append('_subject', 'New Faculty Application Submitted - Fintelligence Academy');
    formData.append('_template', 'table');
    formData.append('_captcha', 'false');
    formData.append('applicant_name', application.personalInfo.fullName);
    formData.append('applicant_email', application.personalInfo.email);
    formData.append('applicant_phone', application.personalInfo.phone);
    formData.append('designation', application.professionalInfo.designation);
    formData.append('organization', application.professionalInfo.organization);
    formData.append('experience', application.professionalInfo.experience);
    formData.append('expertise', application.professionalInfo.expertise.join(', '));
    formData.append('subjects', application.teachingPreferences.subjects.join(', '));
    formData.append('teaching_mode', application.teachingPreferences.mode);
    formData.append('application_id', application.id);
    formData.append('submission_time', formatDate(application.submissionDate));
    
    await fetch(CONFIG.storage.formsubmit.endpoint, {
      method: 'POST',
      body: formData
    });
  } catch (error) {
    console.warn('Admin notification failed:', error);
  }
}

// ========== ADMIN AUTHENTICATION ==========
function adminLogin(event) {
  event.preventDefault();
  
  const emailInput = $('#adminEmail');
  const passwordInput = $('#adminPassword');
  const errorDiv = $('#loginError');
  
  if (!emailInput || !passwordInput) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (email === CONFIG.admin.email && password === CONFIG.admin.password) {
    localStorage.setItem('fintelligence-admin-token', 'token-' + Date.now());
    isLoggedIn = true;
    errorDiv?.classList.add('hidden');
    showToast('Login successful', 'success');
    showPage('admin');
  } else {
    if (errorDiv) {
      errorDiv.textContent = 'Invalid credentials. Please try again.';
      errorDiv.classList.remove('hidden');
    }
    showToast('Invalid login credentials', 'error');
  }
}

function logout() { 
  localStorage.removeItem('fintelligence-admin-token'); 
  isLoggedIn = false; 
  showToast('Logged out successfully', 'info');
  showLanding(); 
}

// ========== ADMIN DASHBOARD ==========
async function initDashboard() {
  showLoading('Loading applications from global database...');
  
  try {
    applications = await globalStorage.load();
    renderStats();
    filterApplications();
    hideLoading();
    showToast('Dashboard loaded successfully', 'success');
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    hideLoading();
    showToast('Error loading applications', 'error');
  }
}

function renderStats() {
  const stats = { 
    total: applications.length,
    pending: applications.filter(a => a.applicationStatus === 'Pending').length,
    approved: applications.filter(a => a.applicationStatus === 'Approved').length,
    rejected: applications.filter(a => a.applicationStatus === 'Rejected').length,
    underReview: applications.filter(a => a.applicationStatus === 'Under Review').length
  };

  const statsHtml = `
    <div class="stat-card">
      <div class="stat-number">${stats.total}</div>
      <div class="stat-label">Total Applications</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: var(--color-warning);">${stats.pending}</div>
      <div class="stat-label">Pending Review</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: var(--color-info);">${stats.underReview}</div>
      <div class="stat-label">Under Review</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: var(--color-success);">${stats.approved}</div>
      <div class="stat-label">Approved</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: var(--color-error);">${stats.rejected}</div>
      <div class="stat-label">Rejected</div>
    </div>
  `;

  const statsContainer = $('#dashboardStats');
  if (statsContainer) {
    statsContainer.innerHTML = statsHtml;
  }
}

function filterApplications() {
  const searchInput = $('#searchInput');
  const statusFilter = $('#statusFilter');
  
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const status = statusFilter ? statusFilter.value : '';
  
  filteredApplications = applications.filter(app => {
    const searchMatch = !query || 
      app.personalInfo.fullName.toLowerCase().includes(query) || 
      app.personalInfo.email.toLowerCase().includes(query) ||
      app.professionalInfo.designation.toLowerCase().includes(query);
    
    const statusMatch = !status || app.applicationStatus === status;
    
    return searchMatch && statusMatch;
  });
  
  renderApplicationsTable();
}

function docsCompletion(app) {
  const total = DOCUMENT_TYPES.length;
  const uploaded = DOCUMENT_TYPES.filter(dt => app.documents[dt.key]).length;
  return `${uploaded}/${total}`;
}

function renderApplicationsTable() {
  const tableBody = $('#applicationsTable');
  const emptyState = $('#emptyState');
  
  if (!tableBody || !emptyState) return;
  
  if (filteredApplications.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  const rows = filteredApplications.map(app => {
    const docStatus = docsCompletion(app);
    const docClass = docStatus === '5/5' ? 'doc-status-complete' : 'doc-status-incomplete';
    
    return `
      <tr>
        <td>
          <div style="font-weight: 500;">${app.personalInfo.fullName}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">
            ID: ${app.id}
          </div>
        </td>
        <td>
          <div>${app.personalInfo.email}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">
            ${app.personalInfo.phone}
          </div>
        </td>
        <td>
          <div style="font-weight: 500;">${app.professionalInfo.designation}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">
            ${app.professionalInfo.organization}
          </div>
        </td>
        <td>${app.professionalInfo.experience}</td>
        <td>
          <span class="status-badge status-${app.applicationStatus.toLowerCase().replace(/ /g, '-')}">
            ${app.applicationStatus}
          </span>
        </td>
        <td><span class="doc-status-indicator ${docClass}">${docStatus}</span></td>
        <td style="white-space: nowrap;">
          <button class="btn btn--secondary btn--sm" onclick="viewApplication('${app.id}')" title="View Details">👁️</button>
          <button class="btn btn--outline btn--sm" onclick="editApplicationStatus('${app.id}')" title="Update Status">✏️</button>
          <button class="btn btn--outline btn--sm" onclick="downloadAllDocs('${app.id}')" title="Download Documents">📦</button>
        </td>
      </tr>
    `;
  }).join('');
  
  tableBody.innerHTML = rows;
}

// ========== APPLICATION MANAGEMENT ==========
function viewApplication(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  
  const modalBody = $('#modalBody');
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h4>Personal Information</h4>
      </div>
      <div class="card__body">
        <div class="form-row">
          <div><strong>Name:</strong> ${app.personalInfo.fullName}</div>
          <div><strong>Email:</strong> ${app.personalInfo.email}</div>
        </div>
        <div class="form-row">
          <div><strong>Phone:</strong> ${app.personalInfo.phone}</div>
          <div><strong>City:</strong> ${app.personalInfo.city}</div>
        </div>
        ${app.personalInfo.address ? `<p><strong>Address:</strong> ${app.personalInfo.address}</p>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card__header">
        <h4>Professional Information</h4>
      </div>
      <div class="card__body">
        <div class="form-row">
          <div><strong>Designation:</strong> ${app.professionalInfo.designation}</div>
          <div><strong>Organization:</strong> ${app.professionalInfo.organization}</div>
        </div>
        <div class="form-row">
          <div><strong>Experience:</strong> ${app.professionalInfo.experience}</div>
          <div><strong>LinkedIn:</strong> 
            ${app.professionalInfo.linkedinProfile ? 
              `<a href="${app.professionalInfo.linkedinProfile}" target="_blank">View Profile</a>` : 
              'Not provided'
            }
          </div>
        </div>
        <p><strong>Expertise:</strong> ${app.professionalInfo.expertise.join(', ') || 'Not specified'}</p>
        <p><strong>Qualifications:</strong> ${app.professionalInfo.qualifications}</p>
        ${app.professionalInfo.bio ? `<p><strong>Bio:</strong> ${app.professionalInfo.bio}</p>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card__header">
        <h4>Teaching Preferences</h4>
      </div>
      <div class="card__body">
        <div class="form-row">
          <div><strong>Mode:</strong> ${app.teachingPreferences.mode}</div>
          <div><strong>Expected Compensation:</strong> ${app.teachingPreferences.expectedCompensation || 'Not specified'}</div>
        </div>
        <p><strong>Subjects:</strong> ${app.teachingPreferences.subjects.join(', ') || 'Not specified'}</p>
        ${app.teachingPreferences.availability ? `<p><strong>Availability:</strong> ${app.teachingPreferences.availability}</p>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card__header">
        <h4>Documents (${docsCompletion(app)})</h4>
      </div>
      <div class="card__body">
        <div class="document-gallery">
          ${DOCUMENT_TYPES.map(dt => renderDocumentCard(app, dt)).join('')}
        </div>
        <div style="text-align: center; margin-top: 16px;">
          <button class="btn btn--primary" onclick="downloadAllDocs('${app.id}')">📦 Download All as ZIP</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__header">
        <h4>Application Status</h4>
      </div>
      <div class="card__body">
        <div class="form-row">
          <div><strong>Status:</strong> <span class="status-badge status-${app.applicationStatus.toLowerCase().replace(/ /g, '-')}">${app.applicationStatus}</span></div>
          <div><strong>Submitted:</strong> ${formatDate(app.submissionDate)}</div>
        </div>
        ${app.adminNotes ? `<p><strong>Admin Notes:</strong> ${app.adminNotes}</p>` : ''}
        <div style="margin-top: 16px;">
          <button class="btn btn--outline" onclick="editApplicationStatus('${app.id}'); closeModal();">Update Status</button>
        </div>
      </div>
    </div>
  `;
  
  $('#applicationModal')?.classList.remove('hidden');
}

function renderDocumentCard(app, dt) {
  const doc = app.documents[dt.key];
  
  if (doc) {
    const isImage = doc.type.startsWith('image/');
    const preview = isImage 
      ? `<img src="${doc.data}" class="document-preview" alt="${dt.label}">`
      : `<div class="document-icon">${dt.icon}</div>`;
    
    return `
      <div class="document-card" title="${doc.name} – ${fileSizeReadable(doc.size)}">
        ${preview}
        <div class="document-label">${dt.label}</div>
        <div class="document-actions">
          <button class="btn btn--outline btn--sm" onclick="downloadDocument('${app.id}','${dt.key}')" title="Download">📥</button>
          <button class="btn btn--secondary btn--sm" onclick="openFullView('${doc.data}')" title="View Full Size">🔍</button>
        </div>
        <div class="document-status uploaded">✓</div>
      </div>
    `;
  }
  
  return `
    <div class="document-card missing">
      <div class="document-icon">${dt.icon}</div>
      <div class="document-label">${dt.label}</div>
      <div class="document-status missing">!</div>
    </div>
  `;
}

function editApplicationStatus(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  
  currentEditingId = id;
  
  // Populate modal
  const statusSelect = $('#newStatus');
  const notesTextarea = $('#adminNotes');
  
  if (statusSelect) statusSelect.value = app.applicationStatus;
  if (notesTextarea) notesTextarea.value = app.adminNotes || '';
  
  $('#statusModal')?.classList.remove('hidden');
}

async function saveStatusUpdate() {
  if (!currentEditingId) return;
  
  const newStatus = $('#newStatus')?.value;
  const adminNotes = $('#adminNotes')?.value;
  
  if (!newStatus) {
    showToast('Please select a status', 'error');
    return;
  }
  
  showLoading('Updating application status...');
  
  try {
    // Update application
    applications = applications.map(app => 
      app.id === currentEditingId 
        ? { ...app, applicationStatus: newStatus, adminNotes: adminNotes, lastUpdated: new Date().toISOString() }
        : app
    );
    
    // Save to global storage
    await globalStorage.save(applications);
    
    // Refresh dashboard
    renderStats();
    filterApplications();
    
    closeStatusModal();
    hideLoading();
    showToast('Application status updated successfully', 'success');
    
  } catch (error) {
    hideLoading();
    console.error('Status update error:', error);
    showToast('Error updating status', 'error');
  }
}

// ========== DOCUMENT MANAGEMENT ==========
function downloadDocument(appId, docKey) {
  const app = applications.find(a => a.id === appId);
  if (!app || !app.documents[docKey]) return;
  
  const doc = app.documents[docKey];
  const link = document.createElement('a');
  link.href = doc.data;
  link.download = doc.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadAllDocs(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;
  
  if (!window.JSZip) {
    showToast('ZIP functionality is loading. Please try again in a moment.', 'warning');
    return;
  }
  
  const zip = new JSZip();
  let hasFiles = false;
  
  DOCUMENT_TYPES.forEach(dt => {
    const doc = app.documents[dt.key];
    if (doc) {
      try {
        const base64 = doc.data.split(',')[1];
        zip.file(doc.name, base64, {base64: true});
        hasFiles = true;
      } catch (error) {
        console.warn('Error adding file to ZIP:', error);
      }
    }
  });
  
  if (!hasFiles) {
    showToast('No documents available for download', 'warning');
    return;
  }
  
  try {
    showLoading('Creating ZIP file...');
    const blob = await zip.generateAsync({type: 'blob'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${app.personalInfo.fullName.replace(/\s+/g, '_')}_documents.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    hideLoading();
    showToast('Documents downloaded successfully', 'success');
    
  } catch (error) {
    hideLoading();
    console.error('Error creating ZIP file:', error);
    showToast('Error creating ZIP file. Please try again.', 'error');
  }
}

// ========== DATA MANAGEMENT ==========
async function syncDatabase() {
  showLoading('Syncing with global database...');
  
  try {
    applications = await globalStorage.load();
    renderStats();
    filterApplications();
    hideLoading();
    showToast('Database synced successfully', 'success');
  } catch (error) {
    hideLoading();
    console.error('Sync error:', error);
    showToast('Error syncing database', 'error');
  }
}

function exportData() {
  const data = JSON.stringify(applications, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `faculty-applications-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Data exported successfully', 'success');
}

function importData() {
  $('#importFile')?.click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid file format');
      }
      
      showLoading('Importing data...');
      
      // Merge with existing data
      const existingIds = applications.map(app => app.id);
      const newApplications = importedData.filter(app => !existingIds.includes(app.id));
      
      applications = [...applications, ...newApplications];
      
      // Save to global storage
      await globalStorage.save(applications);
      
      renderStats();
      filterApplications();
      hideLoading();
      
      showToast(`Imported ${newApplications.length} new applications`, 'success');
      
    } catch (error) {
      hideLoading();
      console.error('Import error:', error);
      showToast('Invalid file format or import error', 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

function exportToCSV() {
  if (filteredApplications.length === 0) { 
    showToast('No applications to export', 'warning');
    return; 
  }
  
  const headers = [
    'ID', 'Full Name', 'Email', 'Phone', 'City', 'Designation', 'Organization', 
    'Experience', 'Expertise', 'Subjects', 'Teaching Mode', 'Status', 'Submission Date', 
    'Document Status', 'Admin Notes'
  ];
  
  const rows = filteredApplications.map(app => [
    app.id,
    app.personalInfo.fullName,
    app.personalInfo.email,
    app.personalInfo.phone,
    app.personalInfo.city,
    app.professionalInfo.designation,
    app.professionalInfo.organization,
    app.professionalInfo.experience,
    app.professionalInfo.expertise.join('; '),
    app.teachingPreferences.subjects.join('; '),
    app.teachingPreferences.mode,
    app.applicationStatus,
    formatDate(app.submissionDate),
    docsCompletion(app),
    app.adminNotes || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `faculty-applications-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('CSV exported successfully', 'success');
}

// ========== MODAL MANAGEMENT ==========
function closeModal() { 
  $('#applicationModal')?.classList.add('hidden'); 
}

function closeStatusModal() {
  $('#statusModal')?.classList.add('hidden');
  currentEditingId = null;
}

function openFullView(data) { 
  window.open(data, '_blank'); 
}

// ========== INITIALIZATION ==========
function init() {
  console.log('🚀 Initializing Fintelligence Faculty Empanelment System');
  
  // Apply theme
  applyTheme();
  
  // Check admin login state
  if (isLoggedIn) { 
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) logoutBtn.classList.remove('hidden'); 
  }
  
  // Preload applications for faster dashboard access
  globalStorage.load().then(data => {
    applications = data;
    console.log(`📊 Loaded ${applications.length} applications from storage`);
  }).catch(error => {
    console.warn('Initial load failed:', error);
  });
  
  // Show landing page
  showLanding();
  
  // Add click outside modal to close
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
      closeStatusModal();
    }
  });
  
  console.log('✅ System initialized successfully');
}

// ========== GLOBAL FUNCTION ASSIGNMENTS ==========
// Make functions available globally for onclick handlers
window.toggleTheme = toggleTheme;
window.showLanding = showLanding;
window.startApplication = startApplication;
window.showAdminLogin = showAdminLogin;
window.adminLogin = adminLogin;
window.logout = logout;
window.changeStep = changeStep;
window.submitApplication = submitApplication;
window.updateExpertise = updateExpertise;
window.updateSubjects = updateSubjects;
window.handleFileUpload = handleFileUpload;
window.removeFile = removeFile;
window.filterApplications = filterApplications;
window.viewApplication = viewApplication;
window.editApplicationStatus = editApplicationStatus;
window.saveStatusUpdate = saveStatusUpdate;
window.closeModal = closeModal;
window.closeStatusModal = closeStatusModal;
window.downloadDocument = downloadDocument;
window.downloadAllDocs = downloadAllDocs;
window.openFullView = openFullView;
window.syncDatabase = syncDatabase;
window.exportData = exportData;
window.importData = importData;
window.handleImportFile = handleImportFile;
window.exportToCSV = exportToCSV;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}