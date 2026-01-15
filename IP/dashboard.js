// DOM Elements
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
const menuItems = document.querySelectorAll('.menu-item');
const contentAreas = document.querySelectorAll('.content-area');
const teachersGrid = document.getElementById('teachersGrid');
const teacherModal = document.getElementById('teacherModal');
const closeModal = document.getElementById('closeModal');
const submitFeedbackBtn = document.getElementById('submitFeedback');
const cancelFeedbackBtn = document.getElementById('cancelFeedback');
const currentTimeElement = document.getElementById('currentTime');
const logoutBtn = document.querySelector('.logout-btn');

// Teachers data - load from localStorage or use default
let teachers = JSON.parse(localStorage.getItem('teachers')) || [
    {
        id: 1,
        name: "Dr. Sarah Angesom",
        department: "Computer Science",
        subject: "Data Structures",
        rating: 4.5,
        feedbackCount: 0,
        avatar: "SJ",
        status: "pending"
    },
    {
        id: 2,
        name: "Prof. Michael ",
        department: "Mathematics",
        subject: "Calculus III",
        rating: 4.8,
        feedbackCount: 0,
        avatar: "MC",
        status: "completed"
    },
    {
        id: 3,
        name: "Tesfaye",
        department: "Law",
        subject: "Civics",
        rating: 4.2,
        feedbackCount: 0,
        avatar: "EW",
        status: "pending"
    },
    {
        id: 4,
        name: "Dr. Gebril",
        department: "Arts & Humanities",
        subject: "Modern Literature",
        rating: 4.7,
        feedbackCount: 0,
        avatar: "DM",
        status: "pending"
    },
    {
        id: 5,
        name: "Abreham T.",
        department: "Computer Science",
        subject: "Software",
        rating: 4.9,
        feedbackCount: 0,
        avatar: "LA",
        status: "completed"
    },
    {
        id: 6,
        name: "Dr. Tsega",
        department: "Computer Science",
        subject: "Internet Programming",
        rating: 4.9,
        feedbackCount: 0,
        avatar: "LA",
        status: "completed"
    },
    {
        id: 7,
        name: "Sufian",
        department: "Computer Science",
        subject: "Advanced Java",
        rating: 4.9,
        feedbackCount: 0,
        avatar: "LA",
        status: "completed"
    },
    {
        id: 8,
        name: "Dr. Mulugeta",
        department: "Software ",
        subject: "OOP",
        rating: 4.9,
        feedbackCount: 0,
        avatar: "LA",
        status: "completed"
    },
    {
        id: 9,
        name: "Dr. Seid",
        department: "IT",
        subject: "Data Communication",
        rating: 4.9,
        feedbackCount: 0,
        avatar: "LA",
        status: "completed"
    },
    {
        id: 10,
        name: "Prof. Robel",
        department: "Medical Sciences",
        subject: "Organic Chemistry",
        rating: 4.3,
        feedbackCount: 0,
        avatar: "RB",
        status: "pending"
    }
];

// Current teacher for modal
let currentTeacher = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) {
        window.location.href = 'test.html';
        return;
    }
    
    initializeDashboard();
    initializeEventListeners();
    updateTime();
    setInterval(updateTime, 60000); // Update time every minute
});

// Initialize dashboard
function initializeDashboard() {
    // Save teachers to localStorage on first load
    if (!localStorage.getItem('teachers')) {
        localStorage.setItem('teachers', JSON.stringify(teachers));
    } else {
        teachers = JSON.parse(localStorage.getItem('teachers'));
    }
    
    // Check if user is admin
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    if (isAdmin) {
        // Show admin interface
        setupAdminInterface();
        loadAdminDashboard();
    } else {
        // Show student interface
        setupStudentInterface();
        // Update user info
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userDepartment').textContent = formatDepartment(currentUser.department);
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Load teachers
        loadTeachers();
    }
    
    // Set active page
    const activePage = sessionStorage.getItem('activePage') || (isAdmin ? 'admin-dashboard' : 'dashboard');
    switchPage(activePage);
}

// Setup admin interface
function setupAdminInterface() {
    // Hide student menu items
    const studentMenuItems = document.querySelectorAll('.menu-item:not(.admin-menu-item)');
    studentMenuItems.forEach(item => item.style.display = 'none');
    
    // Show admin menu items
    const adminMenuItems = document.querySelectorAll('.admin-menu-item');
    adminMenuItems.forEach(item => item.style.display = 'flex');
    
    // Update user info display
    document.getElementById('userName').textContent = currentUser.name || 'Administrator';
    document.getElementById('userDepartment').textContent = 'Administrator';
}

// Setup student interface
function setupStudentInterface() {
    // Hide admin menu items
    const adminMenuItems = document.querySelectorAll('.admin-menu-item');
    adminMenuItems.forEach(item => item.style.display = 'none');
    
    // Show student menu items
    const studentMenuItems = document.querySelectorAll('.menu-item:not(.admin-menu-item)');
    studentMenuItems.forEach(item => item.style.display = 'flex');
}

// Update dashboard statistics with realistic values
function updateDashboardStats() {
    // Total Teachers
    const totalTeachers = teachers.length;
    const totalTeachersElement = document.getElementById('totalTeachersValue');
    if (totalTeachersElement) {
        totalTeachersElement.textContent = totalTeachers;
    }
    
    // Feedback Given (from current user)
    const userFeedbacks = currentUser.feedbacks || [];
    const feedbackGiven = userFeedbacks.length;
    const feedbackGivenElement = document.getElementById('feedbackGivenValue');
    if (feedbackGivenElement) {
        feedbackGivenElement.textContent = feedbackGiven;
    }
    
    // Average Rating (average of all ratings given by current user)
    let averageRating = 0.0;
    if (feedbackGiven > 0) {
        const totalRating = userFeedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        averageRating = totalRating / feedbackGiven;
    }
    const averageRatingElement = document.getElementById('averageRatingValue');
    if (averageRatingElement) {
        averageRatingElement.textContent = averageRating.toFixed(1);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page);
        });
    });
    
    // Modal controls
    closeModal.addEventListener('click', closeTeacherModal);
    cancelFeedbackBtn.addEventListener('click', closeTeacherModal);
    
    // Submit feedback
    submitFeedbackBtn.addEventListener('click', handleFeedbackSubmit);
    
    // Quick action buttons
    document.getElementById('giveFeedbackBtn')?.addEventListener('click', () => switchPage('teachers'));
    document.getElementById('viewTeachersBtn')?.addEventListener('click', () => switchPage('teachers'));
    
    // Stat card click handlers
    document.getElementById('totalTeachersCard')?.addEventListener('click', () => switchPage('teachers'));
    document.getElementById('feedbackGivenCard')?.addEventListener('click', () => switchPage('feedback'));
    
    // Filter events
    document.getElementById('departmentFilter')?.addEventListener('change', filterTeachers);
    document.getElementById('subjectFilter')?.addEventListener('change', filterTeachers);
    document.getElementById('sortFilter')?.addEventListener('change', filterTeachers);
    
    // Star rating - will be initialized when modal opens
    // (moved to initializeStarRatingListeners function)
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Admin event listeners
    document.getElementById('addTeacherBtn')?.addEventListener('click', openAddTeacherModal);
    document.getElementById('closeAddTeacherModal')?.addEventListener('click', closeAddTeacherModal);
    document.getElementById('cancelAddTeacher')?.addEventListener('click', closeAddTeacherModal);
    document.getElementById('submitAddTeacher')?.addEventListener('click', handleAddTeacher);
    
    // Edit teacher modal listeners
    document.getElementById('closeEditTeacherModal')?.addEventListener('click', closeEditTeacherModal);
    document.getElementById('cancelEditTeacher')?.addEventListener('click', closeEditTeacherModal);
    document.getElementById('submitEditTeacher')?.addEventListener('click', handleEditTeacher);
    
    // Admin stat card click handlers
    document.getElementById('adminTotalTeachersCard')?.addEventListener('click', () => switchPage('manage-teachers'));
    document.getElementById('adminTotalFeedbacksCard')?.addEventListener('click', () => switchPage('manage-feedback'));
    document.getElementById('adminTotalStudentsCard')?.addEventListener('click', () => switchPage('manage-students'));
    
    // Close add teacher modal on outside click
    const addTeacherModal = document.getElementById('addTeacherModal');
    if (addTeacherModal) {
        addTeacherModal.addEventListener('click', (e) => {
            if (e.target === addTeacherModal) {
                closeAddTeacherModal();
            }
        });
    }
    
    // Close edit teacher modal on outside click
    const editTeacherModal = document.getElementById('editTeacherModal');
    if (editTeacherModal) {
        editTeacherModal.addEventListener('click', (e) => {
            if (e.target === editTeacherModal) {
                closeEditTeacherModal();
            }
        });
    }
}

// Switch between pages
function switchPage(page) {
    // Update active menu item
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Show active content area
    contentAreas.forEach(area => {
        area.classList.remove('active');
        if (area.id === `${page}Page`) {
            area.classList.add('active');
        }
    });
    
    // Save active page
    sessionStorage.setItem('activePage', page);
    
    // Load content if needed
    if (page === 'teachers') {
        loadTeachers();
    } else if (page === 'feedback') {
        loadAllFeedbacks();
    } else if (page === 'profile') {
        loadProfilePage();
    } else if (page === 'dashboard') {
        updateDashboardStats();
    } else if (page === 'admin-dashboard') {
        loadAdminDashboard();
    } else if (page === 'manage-teachers') {
        loadAdminTeachers();
    } else if (page === 'manage-feedback') {
        loadAdminFeedbacks();
    } else if (page === 'manage-students') {
        loadAdminStudents();
    }
}

// Load teachers into grid
function loadTeachers(filteredTeachers = teachers) {
    teachersGrid.innerHTML = '';
    
    // Filter teachers by user's department (students only see their department teachers)
    const userDepartment = formatDepartment(currentUser.department);
    const departmentTeachers = filteredTeachers.filter(teacher => {
        // Admin can see all teachers, students see only their department
        if (currentUser.role === 'admin') {
            return true;
        }
        return teacher.department === userDepartment;
    });
    
    departmentTeachers.forEach(teacher => {
        // All teachers show as available for feedback (no restriction)
        const teacherWithStatus = {
            ...teacher,
            userStatus: 'pending' // Always allow feedback
        };
        const teacherCard = createTeacherCard(teacherWithStatus);
        teachersGrid.appendChild(teacherCard);
    });
}

// Create teacher card element
function createTeacherCard(teacher) {
    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.dataset.id = teacher.id;
    
    card.innerHTML = `
        <div class="teacher-header">
            <div class="teacher-avatar-large">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="teacher-info">
                <h3>${teacher.name}</h3>
                <p>${teacher.department}</p>
            </div>
        </div>
        <div class="teacher-details-grid">
            <div class="detail-item">
                <i class="fas fa-book"></i>
                <span>${teacher.subject}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-users"></i>
                <span>${teacher.feedbackCount} feedbacks</span>
            </div>
        </div>
        <div class="teacher-rating">
            <div class="stars">
                ${generateStars(teacher.rating)}
            </div>
            <span class="rating-value">${teacher.rating.toFixed(1)}</span>
        </div>
        <div class="teacher-footer">
            <span class="status-badge pending">
                Available for Feedback
            </span>
            <button class="feedback-btn" data-teacher-id="${teacher.id}">
                Give Feedback
            </button>
        </div>
    `;
    
    // Add click event to feedback button
    const feedbackBtn = card.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Ensure we have the full teacher data
            let teacherData = teachers.find(t => t.id === teacher.id);
            if (!teacherData) {
                teacherData = teacher;
            }
            openTeacherModal(teacherData);
        });
    }
    
    // Also make the whole card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking on the button or its children
        if (e.target.closest('.feedback-btn')) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        // Ensure we have the full teacher data
        let teacherData = teachers.find(t => t.id === teacher.id);
        if (!teacherData) {
            teacherData = teacher;
        }
        openTeacherModal(teacherData);
    });
    
    return card;
}

// Generate star icons
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star active"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Filter teachers based on selections
function filterTeachers() {
    const department = document.getElementById('departmentFilter').value;
    const subject = document.getElementById('subjectFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    let filtered = [...teachers];
    
    // Filter by department
    if (department !== 'all') {
        filtered = filtered.filter(teacher => 
            teacher.department.toLowerCase().includes(department)
        );
    }
    
    // Filter by subject
    if (subject !== 'all') {
        filtered = filtered.filter(teacher => 
            teacher.subject.toLowerCase().includes(subject)
        );
    }
    
    // Sort results
    if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'pending') {
        filtered.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return 0;
        });
    }
    
    loadTeachers(filtered);
}

// Open teacher modal
function openTeacherModal(teacher) {
    if (!teacher) {
        console.error('Teacher data is missing');
        return;
    }
    
    currentTeacher = teacher;
    
    // Update modal content
    const modalTeacherName = document.getElementById('modalTeacherName');
    const modalDepartment = document.getElementById('modalDepartment');
    const modalSubject = document.getElementById('modalSubject');
    const modalRating = document.getElementById('modalRating');
    
    if (modalTeacherName) modalTeacherName.textContent = teacher.name || 'Unknown Teacher';
    if (modalDepartment) modalDepartment.textContent = teacher.department || 'N/A';
    if (modalSubject) modalSubject.textContent = teacher.subject || 'N/A';
    if (modalRating) modalRating.textContent = (teacher.rating || 0).toFixed(1);
    
    // Initialize star rating event listeners
    initializeStarRatingListeners();
    
    // Always show fresh form - students can give feedback to any teacher in their department
    resetFeedbackForm();
    if (submitFeedbackBtn) {
        submitFeedbackBtn.innerHTML = '<span>Submit Feedback</span>';
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.removeAttribute('data-feedback-id');
    }
    
    // Show modal
    if (teacherModal) {
        teacherModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Initialize star rating listeners (call this when modal opens)
function initializeStarRatingListeners() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        // Remove existing listeners by cloning
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);
        
        // Add new listener
        newStar.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating) || parseInt(this.getAttribute('data-rating'));
            if (rating) {
                setStarRating(rating);
            }
        });
    });
}

// Close teacher modal
function closeTeacherModal() {
    teacherModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentTeacher = null;
    // Reset form and enable button when closing
    resetFeedbackForm();
    if (submitFeedbackBtn) {
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.innerHTML = '<span>Submit Feedback</span>';
        submitFeedbackBtn.removeAttribute('data-feedback-id');
    }
}

// Reset feedback form
function resetFeedbackForm() {
    // Reset star rating
    setStarRating(0);
    
    // Reset textarea
    document.getElementById('feedbackComments').value = '';
    
    // Reset radio buttons
    document.querySelectorAll('input[name="recommend"]').forEach(radio => {
        radio.checked = false;
    });
}

// Set star rating
function setStarRating(rating) {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('active');
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// Handle feedback submission
async function handleFeedbackSubmit() {
    if (!currentTeacher) return;
    
    const rating = document.querySelectorAll('.star-rating i.active').length;
    const comments = document.getElementById('feedbackComments').value.trim();
    const recommend = document.querySelector('input[name="recommend"]:checked')?.value;
    
    // Validate
    if (rating === 0) {
        alert('Please provide a rating');
        return;
    }
    
    if (!recommend) {
        alert('Please indicate if you would recommend this teacher');
        return;
    }
    
    // Show loading
    submitFeedbackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitFeedbackBtn.disabled = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Always create new feedback (students can give multiple feedbacks to teachers in their department)
    // Update teacher rating and feedback count
    const teacherIndex = teachers.findIndex(t => t.id === currentTeacher.id);
    if (teacherIndex !== -1) {
        // Calculate new average rating
        const currentRating = teachers[teacherIndex].rating || 0;
        const currentCount = teachers[teacherIndex].feedbackCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        
        teachers[teacherIndex].rating = newRating;
        teachers[teacherIndex].feedbackCount = newCount;
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    
    // Save feedback to user data
    const feedback = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.name,
        teacherDepartment: currentTeacher.department,
        teacherSubject: currentTeacher.subject,
        rating,
        comments,
        recommend,
        submittedAt: new Date().toISOString(),
        likes: [],
        dislikes: []
    };
    
    // Update user's feedbacks
    if (currentUser.feedbacks) {
        currentUser.feedbacks.push(feedback);
    } else {
        currentUser.feedbacks = [feedback];
    }
    
    // Save feedback globally so all users can see it
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    allFeedbacks.push(feedback);
    localStorage.setItem('allFeedbacks', JSON.stringify(allFeedbacks));
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('schoolUsers', JSON.stringify(users));
    }
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Show success message
    showSuccessModal();
}

// Show success modal
function showSuccessModal() {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Feedback Submitted!</h3>
            <p>Thank you for your valuable feedback.</p>
            <button class="btn-primary" id="closeSuccessModal">Continue</button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .success-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            animation: modalSlideUp 0.3s ease;
        }
        .success-icon {
            font-size: 60px;
            color: #4CAF50;
            margin-bottom: 20px;
        }
        .success-content h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .success-content p {
            color: #666;
            margin-bottom: 30px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(successModal);
    
    // Close success modal
    document.getElementById('closeSuccessModal').addEventListener('click', () => {
        document.body.removeChild(successModal);
        closeTeacherModal();
        
        // Refresh teachers list and update current user
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (document.getElementById('teachersPage').classList.contains('active')) {
            loadTeachers();
        }
        
        // Reset submit button
        submitFeedbackBtn.innerHTML = 'Submit Feedback';
        submitFeedbackBtn.disabled = false;
        delete submitFeedbackBtn.dataset.feedbackId;
    });
}

// Format department name
function formatDepartment(department) {
    const departmentNames = {
        'computer-science': 'Computer Science',
        'engineering': 'Engineering',
        'business': 'Business Administration',
        'arts': 'Arts & Humanities',
        'science': 'Natural Sciences',
        'medical': 'Medical Sciences',
        'law': 'Law',
        'education': 'Education'
    };
    
    return departmentNames[department] || department;
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    currentTimeElement.textContent = timeString;
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Clear session storage
    sessionStorage.removeItem('currentUser');
    
    // Redirect to login
    window.location.href = 'index.html';
}

// Close modal on outside click
teacherModal.addEventListener('click', (e) => {
    if (e.target === teacherModal) {
        closeTeacherModal();
    }
});

// Load all feedbacks for the feedback page
function loadAllFeedbacks() {
    const feedbackListContainer = document.getElementById('feedbackListContainer');
    if (!feedbackListContainer) return;
    
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    
    if (allFeedbacks.length === 0) {
        feedbackListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No Feedbacks Yet</h3>
                <p>Be the first to share your feedback about teachers!</p>
            </div>
        `;
        return;
    }
    
    // Sort by most recent first
    allFeedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    feedbackListContainer.innerHTML = '';
    
    allFeedbacks.forEach(feedback => {
        const feedbackCard = createFeedbackCard(feedback);
        feedbackListContainer.appendChild(feedbackCard);
    });
}

// Create feedback card element
function createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.dataset.feedbackId = feedback.id;
    
    const likes = feedback.likes || [];
    const dislikes = feedback.dislikes || [];
    const hasLiked = likes.includes(currentUser.id);
    const hasDisliked = dislikes.includes(currentUser.id);
    const isOwnFeedback = feedback.userId === currentUser.id;
    
    const submittedDate = new Date(feedback.submittedAt);
    const dateString = submittedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = submittedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        <div class="feedback-header">
            <div class="feedback-user">
                <div class="feedback-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="feedback-user-info">
                    <h4>${feedback.userName} ${isOwnFeedback ? '<span class="you-badge">(You)</span>' : ''}</h4>
                    <p>${dateString} at ${timeString}</p>
                </div>
            </div>
            <div class="feedback-rating">
                ${generateStars(feedback.rating)}
                <span class="rating-number">${feedback.rating}/5</span>
            </div>
        </div>
        
        <div class="feedback-teacher-info">
            <i class="fas fa-chalkboard-teacher"></i>
            <span><strong>${feedback.teacherName}</strong> - ${feedback.teacherSubject} (${feedback.teacherDepartment})</span>
        </div>
        
        ${feedback.comments ? `
            <div class="feedback-comments">
                <p>${escapeHtml(feedback.comments)}</p>
            </div>
        ` : ''}
        
        <div class="feedback-recommend">
            <i class="fas fa-${feedback.recommend === 'yes' ? 'thumbs-up' : 'thumbs-down'}"></i>
            <span>Would ${feedback.recommend === 'yes' ? '' : 'not '}recommend this teacher</span>
        </div>
        
        <div class="feedback-actions">
            <div class="feedback-vote-actions">
                <button class="like-btn ${hasLiked ? 'active' : ''} ${isOwnFeedback ? 'disabled' : ''}" 
                        data-feedback-id="${feedback.id}" 
                        ${isOwnFeedback ? 'disabled' : ''}>
                    <i class="fas fa-thumbs-up"></i>
                    <span class="like-count">${likes.length}</span>
                </button>
                <button class="dislike-btn ${hasDisliked ? 'active' : ''} ${isOwnFeedback ? 'disabled' : ''}" 
                        data-feedback-id="${feedback.id}"
                        ${isOwnFeedback ? 'disabled' : ''}>
                    <i class="fas fa-thumbs-down"></i>
                    <span class="dislike-count">${dislikes.length}</span>
                </button>
            </div>
            ${isOwnFeedback ? `
                <button class="delete-feedback-btn" data-feedback-id="${feedback.id}" title="Delete this feedback">
                    <i class="fas fa-trash-alt"></i>
                    <span>Delete</span>
                </button>
            ` : ''}
        </div>
    `;
    
    // Add event listeners for like/dislike buttons
    if (!isOwnFeedback) {
        const likeBtn = card.querySelector('.like-btn');
        const dislikeBtn = card.querySelector('.dislike-btn');
        
        likeBtn.addEventListener('click', () => handleFeedbackLike(feedback.id));
        dislikeBtn.addEventListener('click', () => handleFeedbackDislike(feedback.id));
    }
    
    // Add event listener for delete button
    if (isOwnFeedback) {
        const deleteBtn = card.querySelector('.delete-feedback-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDeleteFeedback(feedback.id);
            });
        }
    }
    
    return card;
}

// Handle feedback like
function handleFeedbackLike(feedbackId) {
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const feedbackIndex = allFeedbacks.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) return;
    
    const feedback = allFeedbacks[feedbackIndex];
    const likes = feedback.likes || [];
    const dislikes = feedback.dislikes || [];
    const userId = currentUser.id;
    
    // Remove from dislikes if exists
    const dislikeIndex = dislikes.indexOf(userId);
    if (dislikeIndex > -1) {
        dislikes.splice(dislikeIndex, 1);
    }
    
    // Toggle like
    const likeIndex = likes.indexOf(userId);
    if (likeIndex > -1) {
        likes.splice(likeIndex, 1);
    } else {
        likes.push(userId);
    }
    
    feedback.likes = likes;
    feedback.dislikes = dislikes;
    
    // Update localStorage
    allFeedbacks[feedbackIndex] = feedback;
    localStorage.setItem('allFeedbacks', JSON.stringify(allFeedbacks));
    
    // Reload feedbacks
    loadAllFeedbacks();
    
    // Update user's feedback in their own data if it's their feedback
    if (feedback.userId === currentUser.id) {
        const users = JSON.parse(localStorage.getItem('schoolUsers')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            const userFeedbackIndex = users[userIndex].feedbacks.findIndex(f => f.id === feedbackId);
            if (userFeedbackIndex > -1) {
                users[userIndex].feedbacks[userFeedbackIndex] = feedback;
                localStorage.setItem('schoolUsers', JSON.stringify(users));
                currentUser = users[userIndex];
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    }
}

// Handle feedback dislike
function handleFeedbackDislike(feedbackId) {
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const feedbackIndex = allFeedbacks.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) return;
    
    const feedback = allFeedbacks[feedbackIndex];
    const likes = feedback.likes || [];
    const dislikes = feedback.dislikes || [];
    const userId = currentUser.id;
    
    // Remove from likes if exists
    const likeIndex = likes.indexOf(userId);
    if (likeIndex > -1) {
        likes.splice(likeIndex, 1);
    }
    
    // Toggle dislike
    const dislikeIndex = dislikes.indexOf(userId);
    if (dislikeIndex > -1) {
        dislikes.splice(dislikeIndex, 1);
    } else {
        dislikes.push(userId);
    }
    
    feedback.likes = likes;
    feedback.dislikes = dislikes;
    
    // Update localStorage
    allFeedbacks[feedbackIndex] = feedback;
    localStorage.setItem('allFeedbacks', JSON.stringify(allFeedbacks));
    
    // Reload feedbacks
    loadAllFeedbacks();
    
    // Update user's feedback in their own data if it's their feedback
    if (feedback.userId === currentUser.id) {
        const users = JSON.parse(localStorage.getItem('schoolUsers')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            const userFeedbackIndex = users[userIndex].feedbacks.findIndex(f => f.id === feedbackId);
            if (userFeedbackIndex > -1) {
                users[userIndex].feedbacks[userFeedbackIndex] = feedback;
                localStorage.setItem('schoolUsers', JSON.stringify(users));
                currentUser = users[userIndex];
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    }
}

// Load profile page
function loadProfilePage() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('profileUserName').textContent = currentUser.name;
    document.getElementById('profileUserEmail').textContent = currentUser.email;
    document.getElementById('profileStudentId').textContent = currentUser.studentId || 'N/A';
    document.getElementById('profileDepartment').textContent = formatDepartment(currentUser.department);
    
    // Member since date
    if (currentUser.createdAt) {
        const memberDate = new Date(currentUser.createdAt);
        document.getElementById('profileMemberSince').textContent = memberDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        document.getElementById('profileMemberSince').textContent = 'N/A';
    }
    
    // Update stats
    const feedbacks = currentUser.feedbacks || [];
    document.getElementById('profileFeedbackCount').textContent = feedbacks.length;
    
    // Calculate total likes
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const userFeedbacks = allFeedbacks.filter(f => f.userId === currentUser.id);
    const totalLikes = userFeedbacks.reduce((sum, f) => sum + (f.likes ? f.likes.length : 0), 0);
    document.getElementById('profileTotalLikes').textContent = totalLikes;
    
    // Calculate average rating
    if (feedbacks.length > 0) {
        const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
        document.getElementById('profileAverageRating').textContent = avgRating.toFixed(1);
    } else {
        document.getElementById('profileAverageRating').textContent = '0.0';
    }
    
    // Load user's feedbacks
    loadMyFeedbacks();
}

// Load my feedbacks for profile page
function loadMyFeedbacks() {
    const myFeedbacksList = document.getElementById('myFeedbacksList');
    if (!myFeedbacksList) return;
    
    const feedbacks = currentUser.feedbacks || [];
    
    if (feedbacks.length === 0) {
        myFeedbacksList.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-comment-slash"></i>
                <p>You haven't submitted any feedback yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort by most recent first
    feedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    myFeedbacksList.innerHTML = '';
    
    feedbacks.forEach(feedback => {
        const item = document.createElement('div');
        item.className = 'my-feedback-item';
        
        const submittedDate = new Date(feedback.submittedAt);
        const dateString = submittedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Get likes and dislikes from global feedbacks
        const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
        const globalFeedback = allFeedbacks.find(f => f.id === feedback.id);
        const likes = globalFeedback ? (globalFeedback.likes || []).length : 0;
        const dislikes = globalFeedback ? (globalFeedback.dislikes || []).length : 0;
        
        item.innerHTML = `
            <div class="my-feedback-header">
                <div class="my-feedback-teacher">
                    <strong>${feedback.teacherName}</strong>
                    <span>${feedback.teacherSubject}</span>
                </div>
                <div class="my-feedback-rating">
                    ${generateStars(feedback.rating)}
                </div>
            </div>
            ${feedback.comments ? `
                <div class="my-feedback-comment">
                    <p>${escapeHtml(feedback.comments)}</p>
                </div>
            ` : ''}
            <div class="my-feedback-footer">
                <span class="my-feedback-date">${dateString}</span>
                <div class="my-feedback-footer-right">
                    <div class="my-feedback-stats">
                        <span><i class="fas fa-thumbs-up"></i> ${likes}</span>
                        <span><i class="fas fa-thumbs-down"></i> ${dislikes}</span>
                    </div>
                    <button class="delete-my-feedback-btn" data-feedback-id="${feedback.id}" title="Delete this feedback">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add delete button event listener
        const deleteBtn = item.querySelector('.delete-my-feedback-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDeleteFeedback(feedback.id);
            });
        }
        
        myFeedbacksList.appendChild(item);
    });
}

// Handle delete feedback
function handleDeleteFeedback(feedbackId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
    }
    
    // Remove from user's feedbacks
    const userFeedbacks = currentUser.feedbacks || [];
    currentUser.feedbacks = userFeedbacks.filter(f => f.id !== feedbackId);
    
    // Remove from global feedbacks
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const updatedFeedbacks = allFeedbacks.filter(f => f.id !== feedbackId);
    localStorage.setItem('allFeedbacks', JSON.stringify(updatedFeedbacks));
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('schoolUsers', JSON.stringify(users));
    }
    
    // Reload feedbacks and teachers
    loadAllFeedbacks();
    loadTeachers();
    loadMyFeedbacks(); // Reload profile page feedbacks if on that page
    updateDashboardStats(); // Update dashboard stats
    
    // Show success message
    showNotification('Feedback deleted successfully', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle delete feedback
function handleDeleteFeedback(feedbackId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
    }
    
    // Remove from user's feedbacks
    if (currentUser.feedbacks) {
        currentUser.feedbacks = currentUser.feedbacks.filter(f => f.id !== feedbackId);
    }
    
    // Remove from global feedbacks
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const updatedFeedbacks = allFeedbacks.filter(f => f.id !== feedbackId);
    localStorage.setItem('allFeedbacks', JSON.stringify(updatedFeedbacks));
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('schoolUsers', JSON.stringify(users));
    }
    
    // Reload feedbacks
    loadAllFeedbacks();
    loadMyFeedbacks();
    loadTeachers(); // Reload teachers to update status
    
    // Show success message
    showDeleteSuccessMessage();
}

// Show delete success message
function showDeleteSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.className = 'delete-success-msg';
    successMsg.innerHTML = `
        <div class="delete-success-content">
            <i class="fas fa-check-circle"></i>
            <span>Feedback deleted successfully</span>
        </div>
    `;
    
    document.body.appendChild(successMsg);
    
    // Add animation
    setTimeout(() => {
        successMsg.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.classList.remove('show');
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ADMIN FUNCTIONS =====

// Load admin dashboard
function loadAdminDashboard() {
    // Update stats
    document.getElementById('adminTotalTeachers').textContent = teachers.length;
    
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    document.getElementById('adminTotalFeedbacks').textContent = allFeedbacks.length;
    
    const allUsers = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    const studentCount = allUsers.filter(u => !u.role || u.role !== 'admin').length;
    document.getElementById('adminTotalStudents').textContent = studentCount;
}

// Load admin teachers page
function loadAdminTeachers() {
    const adminTeachersGrid = document.getElementById('adminTeachersGrid');
    if (!adminTeachersGrid) return;
    
    adminTeachersGrid.innerHTML = '';
    
    teachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.innerHTML = `
            <div class="teacher-header">
                <div class="teacher-avatar-large">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="teacher-info">
                    <h3>${teacher.name}</h3>
                    <p>${teacher.department}</p>
                </div>
            </div>
            <div class="teacher-details-grid">
                <div class="detail-item">
                    <i class="fas fa-book"></i>
                    <span>${teacher.subject}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>${teacher.feedbackCount || 0} feedbacks</span>
                </div>
            </div>
            <div class="teacher-rating">
                <div class="stars">
                    ${generateStars(teacher.rating)}
                </div>
                <span class="rating-value">${teacher.rating.toFixed(1)}</span>
            </div>
            <div class="teacher-footer">
                <button class="btn-primary edit-teacher-btn" data-teacher-id="${teacher.id}">
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button class="btn-danger delete-teacher-btn" data-teacher-id="${teacher.id}">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        `;
        
        const editBtn = card.querySelector('.edit-teacher-btn');
        editBtn.addEventListener('click', () => openEditTeacherModal(teacher));
        
        const deleteBtn = card.querySelector('.delete-teacher-btn');
        deleteBtn.addEventListener('click', () => handleDeleteTeacher(teacher.id));
        
        adminTeachersGrid.appendChild(card);
    });
}

// Load admin feedbacks page
function loadAdminFeedbacks() {
    const adminFeedbackListContainer = document.getElementById('adminFeedbackListContainer');
    if (!adminFeedbackListContainer) return;
    
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    
    if (allFeedbacks.length === 0) {
        adminFeedbackListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No Feedbacks Yet</h3>
                <p>No feedbacks have been submitted yet.</p>
            </div>
        `;
        return;
    }
    
    // Sort by most recent first
    allFeedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    adminFeedbackListContainer.innerHTML = '';
    
    allFeedbacks.forEach(feedback => {
        const card = createAdminFeedbackCard(feedback);
        adminFeedbackListContainer.appendChild(card);
    });
}

// Create admin feedback card
function createAdminFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.dataset.feedbackId = feedback.id;
    
    const submittedDate = new Date(feedback.submittedAt);
    const dateString = submittedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = submittedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const likes = feedback.likes || [];
    const dislikes = feedback.dislikes || [];
    
    card.innerHTML = `
        <div class="feedback-header">
            <div class="feedback-user">
                <div class="feedback-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="feedback-user-info">
                    <h4>${feedback.userName}</h4>
                    <p>${dateString} at ${timeString}</p>
                </div>
            </div>
            <div class="feedback-rating">
                ${generateStars(feedback.rating)}
                <span class="rating-number">${feedback.rating}/5</span>
            </div>
        </div>
        
        <div class="feedback-teacher-info">
            <i class="fas fa-chalkboard-teacher"></i>
            <span><strong>${feedback.teacherName}</strong> - ${feedback.teacherSubject} (${feedback.teacherDepartment})</span>
        </div>
        
        ${feedback.comments ? `
            <div class="feedback-comments">
                <p>${escapeHtml(feedback.comments)}</p>
            </div>
        ` : ''}
        
        <div class="feedback-recommend">
            <i class="fas fa-${feedback.recommend === 'yes' ? 'thumbs-up' : 'thumbs-down'}"></i>
            <span>Would ${feedback.recommend === 'yes' ? '' : 'not '}recommend this teacher</span>
        </div>
        
        <div class="feedback-actions">
            <div class="feedback-vote-actions">
                <span><i class="fas fa-thumbs-up"></i> ${likes.length}</span>
                <span><i class="fas fa-thumbs-down"></i> ${dislikes.length}</span>
            </div>
            <button class="btn-danger delete-feedback-admin-btn" data-feedback-id="${feedback.id}">
                <i class="fas fa-trash"></i>
                <span>Delete Feedback</span>
            </button>
        </div>
    `;
    
    const deleteBtn = card.querySelector('.delete-feedback-admin-btn');
    deleteBtn.addEventListener('click', () => handleAdminDeleteFeedback(feedback.id));
    
    return card;
}

// Open add teacher modal
function openAddTeacherModal() {
    const modal = document.getElementById('addTeacherModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('addTeacherForm').reset();
    }
}

// Close add teacher modal
function closeAddTeacherModal() {
    const modal = document.getElementById('addTeacherModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Handle add teacher
function handleAddTeacher() {
    const name = document.getElementById('teacherName').value.trim();
    const department = document.getElementById('teacherDepartment').value;
    const subject = document.getElementById('teacherSubject').value.trim();
    const initialRating = parseFloat(document.getElementById('teacherInitialRating').value);
    
    if (!name || !department || !subject) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Generate new teacher ID
    const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    
    const newTeacher = {
        id: newId,
        name: name,
        department: department,
        subject: subject,
        rating: initialRating || 4.0,
        feedbackCount: 0,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
        status: 'pending'
    };
    
    teachers.push(newTeacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    closeAddTeacherModal();
    loadAdminTeachers();
    loadAdminDashboard();
    
    // Reload for students if they're viewing teachers
    if (!currentUser || currentUser.role !== 'admin') {
        loadTeachers();
    }
    
    showNotification('Teacher added successfully', 'success');
}

// Open edit teacher modal
function openEditTeacherModal(teacher) {
    const modal = document.getElementById('editTeacherModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Populate form with teacher data
        document.getElementById('editTeacherName').value = teacher.name;
        document.getElementById('editTeacherDepartment').value = teacher.department;
        document.getElementById('editTeacherSubject').value = teacher.subject;
        document.getElementById('editTeacherRating').value = teacher.rating;
        
        // Store teacher ID for update
        modal.dataset.teacherId = teacher.id;
    }
}

// Close edit teacher modal
function closeEditTeacherModal() {
    const modal = document.getElementById('editTeacherModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        delete modal.dataset.teacherId;
    }
}

// Handle edit teacher
function handleEditTeacher() {
    const modal = document.getElementById('editTeacherModal');
    const teacherId = parseInt(modal.dataset.teacherId);
    
    if (!teacherId) {
        alert('Teacher ID not found');
        return;
    }
    
    const name = document.getElementById('editTeacherName').value.trim();
    const department = document.getElementById('editTeacherDepartment').value;
    const subject = document.getElementById('editTeacherSubject').value.trim();
    const rating = parseFloat(document.getElementById('editTeacherRating').value);
    
    if (!name || !department || !subject) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Find and update teacher
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);
    if (teacherIndex === -1) {
        alert('Teacher not found');
        return;
    }
    
    // Update teacher data
    teachers[teacherIndex].name = name;
    teachers[teacherIndex].department = department;
    teachers[teacherIndex].subject = subject;
    teachers[teacherIndex].rating = rating;
    teachers[teacherIndex].avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Save to localStorage
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    // Update teacher data in feedbacks
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    allFeedbacks.forEach(feedback => {
        if (feedback.teacherId === teacherId) {
            feedback.teacherName = name;
            feedback.teacherDepartment = department;
            feedback.teacherSubject = subject;
        }
    });
    localStorage.setItem('allFeedbacks', JSON.stringify(allFeedbacks));
    
    closeEditTeacherModal();
    loadAdminTeachers();
    loadAdminDashboard();
    
    // Reload for students if they're viewing teachers
    if (!currentUser || currentUser.role !== 'admin') {
        loadTeachers();
    }
    
    showNotification('Teacher updated successfully', 'success');
}

// Handle delete teacher
function handleDeleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher? This will also remove all related feedbacks.')) {
        return;
    }
    
    // Remove teacher
    teachers = teachers.filter(t => t.id !== teacherId);
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    // Remove all feedbacks related to this teacher
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const updatedFeedbacks = allFeedbacks.filter(f => f.teacherId !== teacherId);
    localStorage.setItem('allFeedbacks', JSON.stringify(updatedFeedbacks));
    
    // Remove feedbacks from all users
    const allUsers = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    allUsers.forEach(user => {
        if (user.feedbacks) {
            user.feedbacks = user.feedbacks.filter(f => f.teacherId !== teacherId);
        }
    });
    localStorage.setItem('schoolUsers', JSON.stringify(allUsers));
    
    loadAdminTeachers();
    loadAdminDashboard();
    loadAdminFeedbacks();
    
    // Reload for students if they're viewing teachers
    if (!currentUser || currentUser.role !== 'admin') {
        loadTeachers();
    }
    
    showNotification('Teacher deleted successfully', 'success');
}

// Handle admin delete feedback
function handleAdminDeleteFeedback(feedbackId) {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
    }
    
    // Remove from global feedbacks
    const allFeedbacks = JSON.parse(localStorage.getItem('allFeedbacks')) || [];
    const updatedFeedbacks = allFeedbacks.filter(f => f.id !== feedbackId);
    localStorage.setItem('allFeedbacks', JSON.stringify(updatedFeedbacks));
    
    // Remove from user's feedbacks
    const allUsers = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    allUsers.forEach(user => {
        if (user.feedbacks) {
            user.feedbacks = user.feedbacks.filter(f => f.id !== feedbackId);
        }
    });
    localStorage.setItem('schoolUsers', JSON.stringify(allUsers));
    
    // Update current user if they're viewing
    if (currentUser && currentUser.feedbacks) {
        currentUser.feedbacks = currentUser.feedbacks.filter(f => f.id !== feedbackId);
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    loadAdminFeedbacks();
    loadAdminDashboard();
    
    showNotification('Feedback deleted successfully', 'success');
}

// Load admin students page
function loadAdminStudents() {
    const studentsListContainer = document.getElementById('studentsListContainer');
    if (!studentsListContainer) return;
    
    const allUsers = JSON.parse(localStorage.getItem('schoolUsers')) || [];
    const students = allUsers.filter(u => !u.role || u.role !== 'admin');
    
    if (students.length === 0) {
        studentsListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-graduate"></i>
                <h3>No Students Yet</h3>
                <p>No students have registered yet.</p>
            </div>
        `;
        return;
    }
    
    studentsListContainer.innerHTML = '';
    
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        const memberDate = student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';
        
        const feedbackCount = student.feedbacks ? student.feedbacks.length : 0;
        
        card.innerHTML = `
            <div class="student-header">
                <div class="student-avatar-large">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p>${student.email}</p>
                </div>
            </div>
            <div class="student-details-grid">
                <div class="detail-item">
                    <i class="fas fa-id-card"></i>
                    <span>${student.studentId || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-building"></i>
                    <span>${formatDepartment(student.department)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-comments"></i>
                    <span>${feedbackCount} feedbacks</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Joined: ${memberDate}</span>
                </div>
            </div>
        `;
        
        studentsListContainer.appendChild(card);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}