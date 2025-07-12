// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Function to set theme
function setTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark theme
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light theme
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    setTheme(savedTheme);
});

// Toggle theme on button click
themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
});

// --- Navigation and Section Switching ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');

function showSection(id) {
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
        section.classList.remove('active-section');
    });
    const activeSection = document.getElementById(id);
    if (activeSection) {
        activeSection.style.display = 'block'; // Show the requested section
        activeSection.classList.add('active-section');
    }

    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove active class from all links
    });
    const targetLink = document.querySelector(`.nav-link[data-section="${id}"]`);
    if (targetLink) {
        targetLink.classList.add('active'); // Add active to current link
    }

    // Close mobile menu if open
    const navMenu = document.getElementById("navMenu");
    const headerActions = document.getElementById("headerActions");
    if (navMenu && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        if (headerActions) { // Check if headerActions exists before trying to remove class
            headerActions.classList.remove('show');
        }
    }
}

// Handle navigation clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.dataset.section;
        showSection(sectionId);
    });
});

// --- Custom Message Box Functions (replaces alert/confirm) ---
const messageBoxOverlay = document.getElementById('message-box-overlay');
const messageBoxTitle = document.getElementById('message-box-title');
const messageBoxContent = document.getElementById('message-box-content');
const messageBoxActions = document.getElementById('message-box-actions');

/**
 * Displays a custom message box.
 * @param {string} title - The title of the message box.
 * @param {string} message - The content message.
 * @param {Array<Object>} buttons - An array of button objects:
 * [{ text: 'OK', className: 'btn', onClick: () => {} }]
 */
function showMessageBox(title, message, buttons) {
    messageBoxTitle.textContent = title;
    messageBoxContent.textContent = message;
    messageBoxActions.innerHTML = ''; // Clear previous buttons

    buttons.forEach(btnConfig => {
        const button = document.createElement('button');
        button.textContent = btnConfig.text;
        button.className = btnConfig.className || 'btn'; // Default class
        button.onclick = () => {
            hideMessageBox();
            if (btnConfig.onClick) {
                btnConfig.onClick();
            }
        };
        messageBoxActions.appendChild(button);
    });

    messageBoxOverlay.classList.add('active');
}

function hideMessageBox() {
    messageBoxOverlay.classList.remove('active');
}

// --- Authentication Logic ---
let isLoggedIn = false; // Simulated login state

// Load registered users from localStorage, or use dummy data if none exists
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || { //
    'john.doe@example.com': {
        id: 'user123',
        name: 'John Doe',
        location: 'New York, USA',
        profilePhoto: 'https://placehold.co/130x130/007bff/ffffff?text=JD',
        skillsOffered: ['Web Development (React)', 'Graphic Design (Photoshop)'],
        skillsWanted: ['Spanish Language Lessons', 'Photography Basics'],
        availability: 'evenings',
        isPublic: true,
        isAdmin: false,
        password: 'password123' // Storing password for simulation
    }
};

// Function to save registered users to localStorage
function saveRegisteredUsers() { //
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); //
}

// Load current user from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser')); //
if (currentUser) { //
    isLoggedIn = true; //
}

// Function to save current user to localStorage
function saveCurrentUser() { //
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); //
}

// Function to remove current user from localStorage
function removeCurrentUser() { //
    localStorage.removeItem('currentUser'); //
}

// Function to update header buttons based on login state
function updateAuthButtons() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const navMenu = document.getElementById('navMenu');

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        // Show all nav links except login/signup
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            const sectionId = link.dataset.section;
            if (sectionId !== 'login' && sectionId !== 'signup') {
                link.closest('li').style.display = 'list-item';
            }
        });
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        // Hide all nav links except home, testimonials, policy, and admin if applicable
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            const sectionId = link.dataset.section;
            if (sectionId === 'home' || sectionId === 'testimonials' || sectionId === 'policy') {
                link.closest('li').style.display = 'list-item';
            } else if (sectionId === 'admin' && currentUser && currentUser.isAdmin) {
                link.closest('li').style.display = 'list-item';
            }
            else {
                link.closest('li').style.display = 'none';
            }
        });
    }
}

// Simulated Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (registeredUsers[email] && registeredUsers[email].password === password) {
        isLoggedIn = true;
        currentUser = registeredUsers[email];
        saveCurrentUser(); // Save current user to localStorage
        showMessageBox('Login Successful', `Welcome back, ${currentUser.name}!`, [{
            text: 'OK',
            className: 'btn',
            onClick: () => {
                updateAuthButtons();
                updateProfileUI();
                updateDashboardStats();
                updateAdminUI(); // Update admin UI in case admin logs in
                showSection('dashboard'); // Redirect to dashboard after login
            }
        }]);
    } else {
        showMessageBox('Login Failed', 'Invalid email or password.', [{ text: 'Try Again', className: 'btn btn-danger' }]);
    }
});

// Simulated Sign Up
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showMessageBox('Sign Up Failed', 'Passwords do not match.', [{ text: 'OK', className: 'btn btn-danger' }]);
        return;
    }

    if (registeredUsers[email]) {
        showMessageBox('Sign Up Failed', 'An account with this email already exists.', [{ text: 'OK', className: 'btn btn-danger' }]);
        return;
    }

    // Simulate user registration
    const newUserId = 'user' + Math.random().toString(36).substr(2, 9);
    registeredUsers[email] = {
        id: newUserId,
        name: name,
        email: email,
        password: password,
        location: 'Not set',
        profilePhoto: `https://placehold.co/130x130/007bff/ffffff?text=${name.split(' ').map(n => n[0]).join('')}`,
        skillsOffered: [],
        skillsWanted: [],
        availability: 'flexible',
        isPublic: true,
        isAdmin: false
    };

    isLoggedIn = true;
    currentUser = registeredUsers[email];
    saveRegisteredUsers(); // Save updated registered users to localStorage
    saveCurrentUser(); // Save current user to localStorage

    showMessageBox('Sign Up Successful', `Welcome to SkillSwap, ${name}! Your account has been created.`, [{
        text: 'Get Started',
        className: 'btn',
        onClick: () => {
            updateAuthButtons();
            updateProfileUI();
            updateDashboardStats();
            showSection('profile'); // Redirect to profile to complete details
        }
    }]);
});

// Handle Login/Signup button clicks in header
document.getElementById('login-btn').addEventListener('click', () => showSection('login'));
document.getElementById('signup-btn').addEventListener('click', () => showSection('signup'));


// Dummy stats for dashboard (these can be made dynamic based on current user's swaps if desired)
let dashboardStats = {
    totalSwaps: 5,
    pendingRequests: 2,
    avgRating: 4.8,
    activeUsers: 120
};

// Function to update UI based on currentUser
function updateProfileUI() {
    if (!currentUser) return; // Only update if a user is logged in

    document.querySelector('.profile-card .profile-photo').src = currentUser.profilePhoto;
    document.querySelector('.profile-card h2').textContent = currentUser.name;
    document.querySelector('.profile-card p:nth-of-type(1)').textContent = `Location: ${currentUser.location}`;
    document.querySelector('.profile-card p:nth-of-type(2)').textContent = `Availability: ${currentUser.availability.charAt(0).toUpperCase() + currentUser.availability.slice(1)}`;
    document.querySelector('.profile-card p:nth-of-type(3)').textContent = `Profile Status: ${currentUser.isPublic ? 'Public' : 'Private'}`;

    const skillsOfferedDiv = document.querySelector('.profile-card .skills-list:nth-of-type(1)');
    skillsOfferedDiv.innerHTML = '';
    currentUser.skillsOffered.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        skillsOfferedDiv.appendChild(span);
    });

    const skillsWantedDiv = document.querySelector('.profile-card .skills-list:nth-of-type(2)');
    skillsWantedDiv.innerHTML = '';
    currentUser.skillsWanted.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        skillsWantedDiv.appendChild(span);
    });

    // Populate profile edit form
    document.getElementById('name').value = currentUser.name;
    document.getElementById('location').value = currentUser.location;
    document.getElementById('profile-photo').value = currentUser.profilePhoto;
    document.getElementById('skills-offered').value = currentUser.skillsOffered.join(', ');
    document.getElementById('skills-wanted').value = currentUser.skillsWanted.join(', ');
    document.getElementById('availability').value = currentUser.availability;
    document.getElementById('public-profile').checked = currentUser.isPublic;

    // Show/hide admin link (now the <li> element itself)
    const adminNavLinkLi = document.querySelector('.nav-link[data-section="admin"]').closest('li');
    if (currentUser.isAdmin) {
        adminNavLinkLi.style.display = 'list-item';
    } else {
        adminNavLinkLi.style.display = 'none';
    }
}

// Function to update dashboard stats
function updateDashboardStats() {
    // These stats are currently dummy, but could be derived from `allSwaps` and `registeredUsers`
    // For now, they remain static as per the original structure unless explicitly requested to be dynamic.
    document.getElementById('total-swaps-stat').textContent = dashboardStats.totalSwaps;
    document.getElementById('pending-requests-stat').textContent = dashboardStats.pendingRequests;
    document.getElementById('avg-rating-stat').textContent = dashboardStats.avgRating;
    document.getElementById('active-users-stat').textContent = dashboardStats.activeUsers;
}


// Initial UI update on load
document.addEventListener('DOMContentLoaded', () => {
    // Determine initial section based on login status
    const initialHash = window.location.hash.substring(1);
    if (isLoggedIn) {
        updateProfileUI();
        updateDashboardStats();
        updateAuthButtons();
        updateAdminUI();
        if (initialHash && document.getElementById(initialHash)) {
            showSection(initialHash);
        } else {
            showSection('dashboard'); // Default to dashboard if logged in
        }
    } else {
        updateAuthButtons();
        showSection('home'); // Default to home/login if not logged in
    }
});

// Profile Form Submission
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const profilePhoto = document.getElementById('profile-photo').value;
    const skillsOffered = document.getElementById('skills-offered').value.split(',').map(s => s.trim()).filter(s => s);
    const skillsWanted = document.getElementById('skills-wanted').value.split(',').map(s => s.trim()).filter(s => s);
    const availability = document.getElementById('availability').value;
    const isPublic = document.getElementById('public-profile').checked;

    // Simulate API call to update profile
    console.log('Updating profile with:', { name, location, profilePhoto, skillsOffered, skillsWanted, availability, isPublic });

    // Update local dummy data
    currentUser.name = name;
    currentUser.location = location;
    currentUser.profilePhoto = profilePhoto;
    currentUser.skillsOffered = skillsOffered;
    currentUser.skillsWanted = skillsWanted;
    currentUser.availability = availability;
    currentUser.isPublic = isPublic;

    // Update the registeredUsers object as well
    if (currentUser && currentUser.email) {
        registeredUsers[currentUser.email] = currentUser; //
        saveRegisteredUsers(); // Save updated registered users to localStorage
        saveCurrentUser(); // Save current user to localStorage
    }


    updateProfileUI(); // Re-render profile section

    showMessageBox('Profile Updated', 'Your profile has been successfully saved!', [{ text: 'OK', className: 'btn' }]);
});

// Simulate User Search
async function searchUsers() {
    const searchTerm = document.getElementById('search-skill').value.toLowerCase();
    console.log('Searching for skill:', searchTerm);

    // Simulate API call: fetch('/api/users/search?skill=' + searchTerm)
    // Filter from registeredUsers, excluding the current user and non-public profiles
    const filteredUsers = Object.values(registeredUsers).filter(user => {
        if (!user.isPublic || (currentUser && user.id === currentUser.id)) {
            return false;
        }
        return user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm));
    });

    const userResultsDiv = document.getElementById('user-results');
    userResultsDiv.innerHTML = ''; // Clear previous results

    if (filteredUsers.length === 0) {
        userResultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-color);">No users found matching your search.</p>';
        return;
    }

    filteredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
                    <img src="${user.profilePhoto}" alt="User Photo" class="user-photo">
                    <h4>${user.name}</h4>
                    <p>Location: ${user.location}</p>
                    <div class="skills-offered">
                        <h5>Offers:</h5>
                        ${user.skillsOffered.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="skills-wanted">
                        <h5>Wants:</h5>
                        ${user.skillsWanted.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                    <button class="btn" onclick="requestSwap('${user.id}')">Request Swap</button>
                `;
        userResultsDiv.appendChild(userCard);
    });
}

// Simulated Request Swap
function requestSwap(targetUserId) {
    if (!isLoggedIn) {
        showMessageBox('Login Required', 'Please log in to request a swap.', [{ text: 'OK', className: 'btn', onClick: () => showSection('login') }]);
        return;
    }

    const targetUser = Object.values(registeredUsers).find(user => user.id === targetUserId);

    if (!targetUser) {
        showMessageBox('Error', 'Target user not found.', [{ text: 'OK', className: 'btn btn-danger' }]);
        return;
    }

    showMessageBox(
        'Request Swap',
        `Are you sure you want to request a swap with ${targetUser.name}? (This would prompt for skill selection in a real app)`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Confirm', className: 'btn', onClick: () => {
                    const newSwapId = 'SWP' + Math.random().toString(36).substr(2, 9);
                    const newSwap = {
                        id: newSwapId,
                        requesterId: currentUser.id,
                        requesterName: currentUser.name,
                        receiverId: targetUserId,
                        receiverName: targetUser.name,
                        status: 'pending',
                        date: new Date().toISOString().slice(0, 10),
                        requesterSkill: currentUser.skillsOffered[0] || 'Unknown Skill', // Placeholder
                        receiverSkill: targetUser.skillsOffered[0] || 'Unknown Skill' // Placeholder
                    };
                    allSwaps.push(newSwap); //
                    saveAllSwaps(); // Save all swaps to localStorage

                    console.log(`Swap requested with ${targetUserId}`);
                    showMessageBox('Swap Initiated', 'Your swap request has been sent!', [{ text: 'OK', className: 'btn' }]);
                    updateSwapLists();
                    dashboardStats.pendingRequests++;
                    updateDashboardStats();
                }
            }
        ]
    );
}

function simulateSwapRequest(userId) {
    const demoUser = demoUsers.find(u => u.id === userId);
    if (!demoUser) return;

    const myUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!myUser) {
        showMessageBox('Login Required', 'Please log in before requesting a swap.', ['OK']);
        return;
    }

    // Show simulated outgoing swap
    const swapId = 'swap_' + Date.now();
    const outgoingHTML = `
    <li id="${swapId}">
      <span><strong>To:</strong> ${demoUser.name} (${demoUser.skillsOffered[0]}) for your (${demoUser.skillsWanted[0]})</span>
      <div class="action-buttons">
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${swapId}').remove()">Delete</button>
      </div>
    </li>
  `;
    document.getElementById('outgoing-requests').insertAdjacentHTML('beforeend', outgoingHTML);

    // Automatically accept the swap after 30 seconds
    setTimeout(() => {
        document.getElementById(swapId)?.remove();
        const completedHTML = `
      <div class="swap-request-item">
        <p><strong>You swapped:</strong> ${demoUser.skillsOffered[0]} with ${demoUser.name}</p>
        <p>Status: <span class="status-tag accepted">Completed</span></p>
        <p>Your Rating: 5 stars</p>
        <p>Feedback: "Great experience, thank you!"</p>
      </div>
    `;
        document.getElementById('completed-swaps').insertAdjacentHTML('beforeend', completedHTML);
    }, 30000); // 30 seconds
}

// Simulate Accept Swap
function acceptSwap(requestId) {
    showMessageBox(
        'Accept Swap',
        `Are you sure you want to accept swap request ${requestId}?`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Accept', className: 'btn btn-success', onClick: () => {
                    console.log(`Swap ${requestId} accepted`);
                    const swap = allSwaps.find(s => s.id === requestId); //
                    if (swap) { //
                        swap.status = 'accepted'; //
                        saveAllSwaps(); //
                    }
                    showMessageBox('Swap Accepted', `Swap request ${requestId} has been accepted.`, [{ text: 'OK', className: 'btn' }]);
                    updateSwapLists();
                    dashboardStats.pendingRequests--;
                    dashboardStats.totalSwaps++;
                    updateDashboardStats();
                }
            }
        ]
    );
}

// Simulate Reject Swap
function rejectSwap(requestId) {
    showMessageBox(
        'Reject Swap',
        `Are you sure you want to reject swap request ${requestId}?`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Reject', className: 'btn btn-danger', onClick: () => {
                    console.log(`Swap ${requestId} rejected`);
                    const swapToReject = allSwaps.find(s => s.id === requestId); // Assuming requestId is a swap ID
                    if (swapToReject) { //
                        swapToReject.status = 'rejected'; //
                        saveAllSwaps(); //
                    }
                    updateAdminUI(); // Update admin UI after rejection
                    showMessageBox('Swap Rejected', `Swap request ${requestId} has been rejected.`, [{ text: 'OK', className: 'btn' }]);
                    updateSwapLists();
                    dashboardStats.pendingRequests--;
                    updateDashboardStats();
                }
            }
        ]
    );
}

// Simulate Delete Swap (for outgoing, unaccepted requests)
function deleteSwap(requestId) {
    showMessageBox(
        'Delete Swap Request',
        `Are you sure you want to delete swap request ${requestId}? This action cannot be undone.`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Delete', className: 'btn btn-danger', onClick: () => {
                    console.log(`Swap ${requestId} deleted`);
                    allSwaps = allSwaps.filter(swap => swap.id !== requestId); //
                    saveAllSwaps(); //
                    showMessageBox('Request Deleted', `Swap request ${requestId} has been deleted.`, [{ text: 'OK', className: 'btn' }]);
                    updateSwapLists();
                    dashboardStats.pendingRequests--;
                    updateDashboardStats();
                }
            }
        ]
    );
}

// Simulate Rate Swap (after completion)
function rateSwap(swapId) {
    showMessageBox(
        'Rate Your Swap',
        `How would you rate your swap with ${swapId}? (In a real app, this would be a form with stars/text)`,
        [
            { text: 'Later', className: 'btn btn-secondary' },
            {
                text: 'Rate Now', className: 'btn', onClick: () => {
                    const rating = prompt("Enter rating (1-5) and feedback:"); // Simple prompt for demo
                    if (rating) {
                        const swap = allSwaps.find(s => s.id === swapId); //
                        if (swap) { //
                            swap.yourRating = parseFloat(rating.split(' ')[0]); //
                            swap.yourFeedback = rating.substring(rating.indexOf(' ') + 1) || ''; //
                            saveAllSwaps(); //
                        }
                        console.log(`Swap ${swapId} rated: ${rating}`);
                        showMessageBox('Rating Submitted', 'Thank you for your feedback!', [{ text: 'OK', className: 'btn' }]);
                        updateSwapLists();
                    }
                }
            }
        ]
    );
}

// Function to update swap lists (incoming, outgoing, completed)
function updateSwapLists() {
    if (!currentUser) { //
        document.getElementById('incoming-requests').innerHTML = '<p>Please log in to view your swap requests.</p>'; //
        document.getElementById('outgoing-requests').innerHTML = '<p>Please log in to view your outgoing requests.</p>'; //
        document.getElementById('completed-swaps').innerHTML = '<p>Please log in to view your completed swaps.</p>'; //
        return; //
    }

    const incoming = allSwaps.filter(req => req.receiverId === currentUser.id && req.status === 'pending'); //
    const outgoing = allSwaps.filter(req => req.requesterId === currentUser.id && req.status === 'pending'); //
    const completed = allSwaps.filter(swap => (swap.requesterId === currentUser.id || swap.receiverId === currentUser.id) && swap.status === 'accepted'); //

    const incomingList = document.getElementById('incoming-requests');
    incomingList.innerHTML = '';
    if (incoming.length === 0) {
        incomingList.innerHTML = '<p>No incoming requests.</p>';
    }
    incoming.forEach(req => {
        // Find the actual names for display using registeredUsers
        const fromUser = Object.values(registeredUsers).find(user => user.id === req.requesterId);
        const forUser = Object.values(registeredUsers).find(user => user.id === req.receiverId);

        const li = document.createElement('li');
        li.innerHTML = `
                        <span><strong>From:</strong> ${fromUser ? fromUser.name : 'Unknown User'} (${req.requesterSkill}) for your (${req.receiverSkill})</span>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm" onclick="acceptSwap('${req.id}')">Accept</button>
                            <button class="btn btn-danger btn-sm" onclick="rejectSwap('${req.id}')">Reject</button>
                        </div>
                    `;
        incomingList.appendChild(li);
    });

    const outgoingList = document.getElementById('outgoing-requests');
    outgoingList.innerHTML = '';
    if (outgoing.length === 0) {
        outgoingList.innerHTML = '<p>No outgoing requests.</p>';
    }
    outgoing.forEach(req => {
        // Find the actual names for display using registeredUsers
        const toUser = Object.values(registeredUsers).find(user => user.id === req.receiverId);
        const forUser = Object.values(registeredUsers).find(user => user.id === req.requesterId);

        const li = document.createElement('li');
        li.innerHTML = `
                        <span><strong>To:</strong> ${toUser ? toUser.name : 'Unknown User'} (${req.receiverSkill}) for your (${req.requesterSkill})</span>
                        <div class="action-buttons">
                            <button class="btn btn-danger btn-sm" onclick="deleteSwap('${req.id}')">Delete</button>
                        </div>
                    `;
        outgoingList.appendChild(li);
    });

    const completedList = document.getElementById('completed-swaps');
    completedList.innerHTML = '';
    if (completed.length === 0) {
        completedList.innerHTML = '<p>No completed swaps.</p>';
    }
    completed.forEach(swap => {
        const withUser = (swap.requesterId === currentUser.id) ? Object.values(registeredUsers).find(user => user.id === swap.receiverId) : Object.values(registeredUsers).find(user => user.id === swap.requesterId);
        const yourSkill = (swap.requesterId === currentUser.id) ? swap.requesterSkill : swap.receiverSkill;
        const theirSkill = (swap.requesterId === currentUser.id) ? swap.receiverSkill : swap.requesterSkill;

        const li = document.createElement('div');
        li.className = 'swap-request-item';
        li.innerHTML = `
                        <p><strong>You swapped:</strong> ${yourSkill} with ${withUser ? withUser.name : 'Unknown User'} for their ${theirSkill}</p>
                        <p>Status: <span class="status-tag ${swap.status}">${swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span></p>
                        ${swap.yourRating ? `<p>Your Rating: ${swap.yourRating} stars</p>` : ''}
                        ${swap.yourFeedback ? `<p>Feedback: "${swap.yourFeedback}"</p>` : ''}
                        <div class="actions">
                            ${swap.status === 'accepted' && !swap.yourRating ? `<button class="btn btn-secondary btn-sm" onclick="rateSwap('${swap.id}')">Rate Swap</button>` : ''}
                        </div>
                    `;
        completedList.appendChild(li);
    });
}

// Initial swap list update
document.addEventListener('DOMContentLoaded', updateSwapLists);


// --- Admin Panel Functions (Simulated Backend Calls) ---

// Dummy data for admin panel (load from localStorage or use defaults)
let skillsForModeration = JSON.parse(localStorage.getItem('skillsForModeration')) || [ //
    { id: 'SK001', description: 'Learn to hack into anything!', user: 'BadUser123', status: 'pending_review' },
    { id: 'SK002', description: 'Advanced Python Programming', user: 'GoodDev456', status: 'approved' },
    { id: 'SK003', description: 'Sell illegal software', user: 'SpamKing', status: 'pending_review' }
];

let usersForManagement = JSON.parse(localStorage.getItem('usersForManagement')) || [ //
    { id: 'USR001', name: 'BadUser123', email: 'bad@example.com', status: 'active' },
    { id: 'USR002', name: 'GoodDev456', email: 'good@example.com', status: 'active' },
    { id: 'USR003', name: 'SpamKing', email: 'spam@example.com', status: 'active' }
];

let allSwaps = JSON.parse(localStorage.getItem('allSwaps')) || [ //
    { id: 'SWP001', requesterId: 'user123', requesterName: 'John Doe', receiverId: 'jane_smith_id', receiverName: 'Jane Smith', status: 'accepted', date: '2025-07-10', requesterSkill: 'Graphic Design', receiverSkill: 'Photography' },
    { id: 'SWP002', requesterId: 'mike_johnson_id', requesterName: 'Mike Johnson', receiverId: 'user123', receiverName: 'John Doe', status: 'pending', date: '2025-07-11', requesterSkill: 'Excel', receiverSkill: 'Web Development' },
    { id: 'SWP003', requesterId: 'alice_brown_id', requesterName: 'Alice Brown', receiverId: 'mike_johnson_id', receiverName: 'Mike Johnson', status: 'rejected', date: '2025-07-09', requesterSkill: 'Spanish Language', receiverSkill: 'Guitar Lessons' }
];

function saveSkillsForModeration() { //
    localStorage.setItem('skillsForModeration', JSON.stringify(skillsForModeration)); //
}

function saveUsersForManagement() { //
    localStorage.setItem('usersForManagement', JSON.stringify(usersForManagement)); //
}

function saveAllSwaps() { //
    localStorage.setItem('allSwaps', JSON.stringify(allSwaps)); //
}


function updateAdminUI() {
    // Only update admin UI if current user is an admin
    if (!currentUser || !currentUser.isAdmin) {
        document.getElementById('admin').innerHTML = '<p style="text-align: center; color: var(--text-color);">Access Denied. You must be an administrator to view this section.</p>';
        return;
    }


    const skillModerationList = document.getElementById('skill-moderation-list');
    skillModerationList.innerHTML = '';
    skillsForModeration.forEach(skill => {
        const tr = document.createElement('tr');
        const statusClass = skill.status === 'pending_review' ? 'warning' : (skill.status === 'approved' ? 'accepted' : 'danger');
        tr.innerHTML = `
                    <td>${skill.id}</td>
                    <td>${skill.description}</td>
                    <td>${skill.user}</td>
                    <td><span class="status-tag ${statusClass}">${skill.status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span></td>
                    <td class="action-buttons">
                        ${skill.status === 'pending_review' ? `
                            <button class="btn btn-success btn-sm" onclick="approveSkill('${skill.id}')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="rejectSkill('${skill.id}')">Reject</button>
                        ` : ''}
                    </td>
                `;
        skillModerationList.appendChild(tr);
    });

    const userManagementList = document.getElementById('user-management-list');
    userManagementList.innerHTML = '';
    usersForManagement.forEach(user => {
        const tr = document.createElement('tr');
        const statusClass = user.status === 'active' ? 'accepted' : 'danger';
        tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status-tag ${statusClass}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
                    <td class="action-buttons">
                        ${user.status === 'active' ? `<button class="btn btn-danger btn-sm" onclick="banUser('${user.id}')">Ban</button>` : `<button class="btn btn-secondary btn-sm" onclick="unbanUser('${user.id}')">Unban</button>`}
                    </td>
                `;
        userManagementList.appendChild(tr);
    });

    const swapMonitoringList = document.getElementById('swap-monitoring-list');
    swapMonitoringList.innerHTML = '';
    allSwaps.forEach(swap => {
        const tr = document.createElement('tr');
        const statusClass = swap.status === 'pending' ? 'warning' : (swap.status === 'accepted' ? 'accepted' : 'danger');
        tr.innerHTML = `
                    <td>${swap.id}</td>
                    <td>${swap.requesterName}</td>
                    <td>${swap.receiverName}</td>
                    <td><span class="status-tag ${statusClass}">${swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span></td>
                    <td>${swap.date}</td>
                `;
        swapMonitoringList.appendChild(tr);
    });
}

// Initial admin UI update on load
document.addEventListener('DOMContentLoaded', updateAdminUI);

function approveSkill(skillId) {
    showMessageBox(
        'Approve Skill',
        `Are you sure you want to approve skill ${skillId}?`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Approve', className: 'btn btn-success', onClick: () => {
                    console.log(`Approving skill ${skillId}`);
                    const skill = skillsForModeration.find(s => s.id === skillId);
                    if (skill) { //
                        skill.status = 'approved'; //
                        saveSkillsForModeration(); //
                    }
                    updateAdminUI();
                    showMessageBox('Skill Approved', `Skill ${skillId} has been approved.`, [{ text: 'OK', className: 'btn' }]);
                }
            }
        ]
    );
}

function rejectSkill(skillId) {
    showMessageBox(
        'Reject Skill',
        `Are you sure you want to reject skill ${skillId}?`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Reject', className: 'btn btn-danger', onClick: () => {
                    console.log(`Rejecting skill ${skillId}`);
                    const skill = skillsForModeration.find(s => s.id === skillId);
                    if (skill) { //
                        skill.status = 'rejected'; //
                        saveSkillsForModeration(); //
                    }
                    updateAdminUI();
                    showMessageBox('Skill Rejected', `Skill ${skillId} has been rejected.`, [{ text: 'OK', className: 'btn' }]);
                }
            }
        ]
    );
}

function banUser(userId) {
    showMessageBox(
        'Ban User',
        `Are you sure you want to ban user ${userId}? This will prevent them from accessing the platform.`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Ban User', className: 'btn btn-danger', onClick: () => {
                    console.log(`Banning user ${userId}`);
                    const user = usersForManagement.find(u => u.id === userId);
                    if (user) { //
                        user.status = 'banned'; //
                        // Also find and update in registeredUsers if necessary
                        const registeredUserByEmail = Object.values(registeredUsers).find(ru => ru.id === userId);
                        if (registeredUserByEmail) {
                            registeredUserByEmail.status = 'banned'; // Example, add status to registeredUsers if not there
                        }
                        saveUsersForManagement(); //
                        saveRegisteredUsers(); //
                    }
                    updateAdminUI();
                    showMessageBox('User Banned', `User ${userId} has been banned.`, [{ text: 'OK', className: 'btn' }]);
                }
            }
        ]
    );
}

function unbanUser(userId) {
    showMessageBox(
        'Unban User',
        `Are you sure you want to unban user ${userId}?`,
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Unban User', className: 'btn btn-success', onClick: () => {
                    console.log(`Unbanning user ${userId}`);
                    const user = usersForManagement.find(u => u.id === userId);
                    if (user) { //
                        user.status = 'active'; //
                        // Also find and update in registeredUsers if necessary
                        const registeredUserByEmail = Object.values(registeredUsers).find(ru => ru.id === userId);
                        if (registeredUserByEmail) {
                            registeredUserByEmail.status = 'active'; // Example, add status to registeredUsers if not there
                        }
                        saveUsersForManagement(); //
                        saveRegisteredUsers(); //
                    }
                    updateAdminUI();
                    showMessageBox('User Unbanned', `User ${userId} has been unbanned.`, [{ text: 'OK', className: 'btn' }]);
                }
            }
        ]
    );
}

document.getElementById('admin-message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const messageContent = document.getElementById('platform-message').value;
    if (messageContent.trim()) {
        console.log('Sending platform-wide message:', messageContent);
        // Simulate API call. In a real app, this would send to a database/message queue
        showMessageBox('Message Sent', 'Platform-wide message has been sent!', [{ text: 'OK', className: 'btn' }]);
        document.getElementById('platform-message').value = '';
    } else {
        showMessageBox('Error', 'Message content cannot be empty.', [{ text: 'OK', className: 'btn btn-danger' }]);
    }
});

function downloadReport(reportType) {
    console.log(`Downloading ${reportType} report...`);
    // Simulate API call: fetch(`/api/admin/reports/${reportType}`)
    showMessageBox('Report Download', `Simulating download for ${reportType} report. In a real app, this would trigger a file download.`, [{ text: 'OK', className: 'btn' }]);
}

// --- Logout Functionality ---
document.getElementById('logout-btn').addEventListener('click', () => {
    showMessageBox(
        'Logout',
        'Are you sure you want to log out?',
        [
            { text: 'Cancel', className: 'btn btn-secondary' },
            {
                text: 'Logout', className: 'btn btn-danger', onClick: () => {
                    console.log('User logged out');
                    isLoggedIn = false;
                    currentUser = null;
                    removeCurrentUser(); // Remove current user from localStorage
                    updateAuthButtons();
                    showSection('home'); // Redirect to home page after logout
                    showMessageBox('Logged Out', 'You have been successfully logged out.', [{ text: 'OK', className: 'btn' }]);
                }
            }
        ]
    );
});

const hamburger = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");
const headerActions = document.getElementById("headerActions");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    headerActions.classList.toggle("show");
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        headerActions.classList.remove('show');
    });
});

// --- Predefined Demo Users for "Browse Swaps" ---
// Sample Browse Swaps Search Logic (LocalStorage Based)

// --- Dummy Users (Updated) ---
const dummyUsers = [
    {
        id: 'demo1',
        name: 'Priya Shah',
        location: 'Ahmedabad',
        profilePhoto: 'https://placehold.co/90x90/28a745/ffffff?text=Priya',
        skillsOffered: ['Gujarati Cooking', 'Knitting'],
        skillsWanted: ['Digital Marketing', 'Python Basics']
    },
    {
        id: 'demo2',
        name: 'Rahul Mehta',
        location: 'Surat',
        profilePhoto: 'https://placehold.co/90x90/ffc107/000000?text=Rahul',
        skillsOffered: ['Excel', 'Trading Basics'],
        skillsWanted: ['Web Design', 'JavaScript']
    },
    {
        id: 'jane_smith_id',
        name: 'Jane Smith',
        location: 'Los Angeles, USA',
        profilePhoto: 'https://placehold.co/90x90/e94560/ffffff?text=JS',
        skillsOffered: ['Photography', 'Video Editing'],
        skillsWanted: ['Public Speaking', 'Cooking']
    },
    {
        id: 'mike_johnson_id',
        name: 'Mike Johnson',
        location: 'Chicago, USA',
        profilePhoto: 'https://placehold.co/90x90/007bff/ffffff?text=MJ',
        skillsOffered: ['Excel', 'Data Analysis'],
        skillsWanted: ['Web Development', 'Guitar Lessons']
    },
    {
        id: 'alice_brown_id',
        name: 'Alice Brown',
        location: 'Seattle, USA',
        profilePhoto: 'https://placehold.co/90x90/28a745/ffffff?text=AB',
        skillsOffered: ['Spanish Language'],
        skillsWanted: ['Gardening']
    },
    {
        id: 'ron_patel_id',
        name: 'Ron Patel',
        location: 'Mumbai, India',
        profilePhoto: 'https://placehold.co/90x90/f39c12/ffffff?text=RP',
        skillsOffered: ['Cooking', 'Yoga'],
        skillsWanted: ['Python', 'Web Development']
    }
];

let requestedSwaps = new Set(); // Track who we've already requested swaps with

// --- Browse Swaps Search Logic ---
function searchUsers() {
    const searchTerm = document.getElementById('search-skill').value.toLowerCase();
    const resultsDiv = document.getElementById('user-results');
    resultsDiv.innerHTML = '';

    const filtered = dummyUsers.filter(user =>
        user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm))
    );

    if (filtered.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align:center;">No users found matching that skill.</p>';
        return;
    }

    filtered.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <img src="${user.profilePhoto}" class="user-photo" alt="${user.name}">
            <h4>${user.name}</h4>
            <p>Location: ${user.location}</p>
            <div class="skills-offered">
                <h5>Offers:</h5>
                ${user.skillsOffered.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="skills-wanted">
                <h5>Wants:</h5>
                ${user.skillsWanted.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <button class="btn" onclick="simulateSwapRequest('${user.id}')">Request Swap</button>
        `;
        resultsDiv.appendChild(userCard);
    });
}

// --- Simulate Swap Request with Restrictions ---
function simulateSwapRequest(userId) {
    const user = dummyUsers.find(u => u.id === userId);
    if (!user) return;

    if (requestedSwaps.has(userId)) {
        showMessageBox("Swap Already Done", "You have already swapped your skill with the person.", [{ text: "OK", className: "btn btn-secondary" }]);
        return;
    }

    // Track the request
    requestedSwaps.add(userId);

    // Show outgoing swap immediately
    const swapId = 'swap_' + Date.now();
    const outgoingHTML = `
        <li id="${swapId}">
            <span><strong>To:</strong> ${user.name} (${user.skillsOffered[0]}) for your (${user.skillsWanted[0]})</span>
            <div class="action-buttons">
                <button class="btn btn-danger btn-sm" onclick="document.getElementById('${swapId}').remove()">Delete</button>
            </div>
        </li>
    `;
    document.getElementById('outgoing-requests').insertAdjacentHTML('beforeend', outgoingHTML);

    // Auto-accept the request in 30 seconds
    setTimeout(() => {
        const outgoingEl = document.getElementById(swapId);
        if (outgoingEl) outgoingEl.remove();

        const completedHTML = `
            <div class="swap-request-item" style="border-left: 5px solid var(--success-color);">
                <p><strong>You swapped:</strong> ${user.skillsOffered[0]} with ${user.name}</p>
                <p>Status: <span class="status-tag accepted">Accepted</span></p>
                <p>Your Rating: 5 stars</p>
                <p>Feedback: "Great experience!"</p>
            </div>
        `;
        document.getElementById('completed-swaps').insertAdjacentHTML('beforeend', completedHTML);
    }, 30000);
}

// Optional: Trigger search on Enter key
document.getElementById('search-skill').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchUsers();
    }
});

