// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfo2hMr0Wk7GDfXemH-yPAtElHrSQibAg",
    authDomain: "earlyaccessmanagerweb.firebaseapp.com",
    databaseURL: "https://earlyaccessmanagerweb-default-rtdb.firebaseio.com",
    projectId: "earlyaccessmanagerweb",
    storageBucket: "earlyaccessmanagerweb.firebasestorage.app",
    messagingSenderId: "191918135663",
    appId: "1:191918135663:web:747b81aca99ffa4c9a309a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Admin UID (your Firebase UID - get it from console after first sign in)
const ADMIN_UID = '7cmhbtYeP6e2qBcS41BY3y46U0w2';

// Games will be loaded from Firebase Database
let GAMES = [];

// State
let currentUser = null;
let selectedGame = null;

// DOM Elements
const screens = {
    landing: document.getElementById('landing-screen'),
    search: document.getElementById('search-screen'),
    submission: document.getElementById('submission-screen'),
    status: document.getElementById('status-screen'),
    admin: document.getElementById('admin-screen')
};

const loadingOverlay = document.getElementById('loading-overlay');

// Utility Functions
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function generateVerificationCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        
        // Load games from database
        await loadGames();
        
        // Load or create user profile
        const userProfileRef = database.ref(`user-profiles/${user.uid}`);
        const profileSnapshot = await userProfileRef.once('value');
        
        if (!profileSnapshot.exists()) {
            // Create new user profile
            await userProfileRef.set({
                username: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                photoURL: user.photoURL,
                createdAt: Date.now()
            });
        }
        
        // Check if admin
        if (user.uid === ADMIN_UID) {
            loadAdminDashboard();
            showScreen('admin');
        } else {
            // Check for existing submission
            const submission = await checkUserSubmission(user.uid);
            if (submission) {
                displayStatus(submission);
                showScreen('status');
            } else {
                showScreen('search');
            }
        }
    } else {
        currentUser = null;
        showScreen('landing');
    }
    hideLoading();
});

// Load Games from Database
async function loadGames() {
    const gamesRef = database.ref('games');
    const snapshot = await gamesRef.once('value');
    
    if (snapshot.exists()) {
        const gamesData = snapshot.val();
        GAMES = Object.keys(gamesData).map(key => ({
            id: key,
            name: gamesData[key].name
        }));
    } else {
        // If no games exist, show error
        GAMES = [];
    }
}

// Google Sign In
const signInButtons = [
    document.getElementById('google-signin-btn-header'),
    document.getElementById('google-signin-btn-cta')
];

signInButtons.forEach(btn => {
    if (btn) {
        btn.addEventListener('click', async () => {
            showLoading();
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                await auth.signInWithPopup(provider);
            } catch (error) {
                console.error('Sign in error:', error);
                alert('Sign in failed. Please try again.');
                hideLoading();
            }
        });
    }
});

// Sign Out Buttons
document.querySelectorAll('[id^="signout-btn"]').forEach(btn => {
    btn.addEventListener('click', () => {
        auth.signOut();
    });
});

// Game Search
const gameSearchInput = document.getElementById('game-search');
const searchResults = document.getElementById('search-results');

gameSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        searchResults.classList.remove('active');
        return;
    }
    
    const filtered = GAMES.filter(game => 
        game.name.toLowerCase().includes(query)
    );
    
    displaySearchResults(filtered);
});

function displaySearchResults(games) {
    if (games.length === 0) {
        searchResults.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem; font-size: 0.9375rem;">No games found</p>';
        searchResults.classList.add('active');
        return;
    }
    
    searchResults.innerHTML = games.map(game => `
        <div class="game-item" data-game-id="${game.id}">
            <strong>${game.name}</strong>
        </div>
    `).join('');
    
    searchResults.classList.add('active');
    
    // Add click handlers
    document.querySelectorAll('.game-item').forEach(item => {
        item.addEventListener('click', () => {
            const gameId = item.dataset.gameId;
            selectedGame = GAMES.find(g => g.id === gameId);
            showSubmissionForm();
        });
    });
}

// Submission Form
function showSubmissionForm() {
    document.getElementById('selected-game-title').textContent = selectedGame.name;
    showScreen('submission');
}

document.getElementById('back-to-search').addEventListener('click', () => {
    showScreen('search');
});

document.getElementById('submission-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    const playerId = document.getElementById('player-id').value.trim();
    const playerName = document.getElementById('player-name').value.trim();
    
    try {
        // Get user profile for username
        const userProfileRef = database.ref(`user-profiles/${currentUser.uid}`);
        const profileSnapshot = await userProfileRef.once('value');
        const profile = profileSnapshot.val();
        
        // Create submission in Realtime Database
        const submissionRef = database.ref('submissions').push();
        await submissionRef.set({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: profile?.username || currentUser.displayName,
            gameId: selectedGame.id,
            gameName: selectedGame.name,
            playerId: playerId,
            playerName: playerName,
            status: 'pending',
            submittedAt: Date.now(),
            verificationCode: null,
            verified: false
        });
        
        const submission = await checkUserSubmission(currentUser.uid);
        displayStatus(submission);
        showScreen('status');
    } catch (error) {
        console.error('Submission error:', error);
        alert('Submission failed. Please try again.');
    }
    
    hideLoading();
});

// Check User Submission
async function checkUserSubmission(userId) {
    const submissionsRef = database.ref('submissions');
    const snapshot = await submissionsRef.orderByChild('userId').equalTo(userId).once('value');
    
    if (!snapshot.exists()) return null;
    
    // Get the most recent submission
    let latestSubmission = null;
    let latestTime = 0;
    
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.submittedAt > latestTime) {
            latestTime = data.submittedAt;
            latestSubmission = { id: childSnapshot.key, ...data };
        }
    });
    
    return latestSubmission;
}

// Display Status
function displayStatus(submission) {
    const statusContent = document.getElementById('status-content');
    
    if (submission.status === 'pending') {
        statusContent.innerHTML = `
            <div class="status-card">
                <span class="status-badge pending">Pending Approval</span>
                <h3>${submission.gameName}</h3>
                <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 0.9375rem;">
                    Your request is being reviewed. You'll receive a verification code once approved.
                </p>
            </div>
        `;
    } else if (submission.status === 'approved') {
        statusContent.innerHTML = `
            <div class="status-card">
                <span class="status-badge approved">Approved</span>
                <h3>${submission.gameName}</h3>
                <div class="verification-code">
                    <div class="code-display">${submission.verificationCode}</div>
                    <button class="copy-btn" onclick="copyCode('${submission.verificationCode}')">Copy Code</button>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9375rem;">
                    Enter this code in-game to complete verification. This code can only be used once.
                </p>
            </div>
        `;
    } else if (submission.status === 'rejected') {
        statusContent.innerHTML = `
            <div class="status-card">
                <span class="status-badge rejected">Rejected</span>
                <h3>${submission.gameName}</h3>
                <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 0.9375rem;">
                    Your request was not approved. Please contact support for more information.
                </p>
            </div>
        `;
    }
}

// Copy Code
window.copyCode = function(code) {
    navigator.clipboard.writeText(code);
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
};

// Admin Dashboard
async function loadAdminDashboard() {
    const pendingRequests = document.getElementById('pending-requests');
    
    // Listen for pending submissions in real-time
    const submissionsRef = database.ref('submissions');
    submissionsRef.orderByChild('status').equalTo('pending').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            pendingRequests.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); font-size: 1.05rem;">No pending requests</p>';
            return;
        }
        
        const submissions = [];
        snapshot.forEach((childSnapshot) => {
            submissions.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Sort by submission time (newest first)
        submissions.sort((a, b) => b.submittedAt - a.submittedAt);
        
        pendingRequests.innerHTML = submissions.map(data => {
            const submittedDate = new Date(data.submittedAt).toLocaleString();
            return `
                <div class="request-card">
                    <div class="request-info">
                        <p><strong>Game:</strong> ${data.gameName}</p>
                        <p><strong>User:</strong> ${data.userName} (${data.userEmail})</p>
                        <p><strong>Player ID:</strong> ${data.playerId}</p>
                        <p><strong>Player Name:</strong> ${data.playerName}</p>
                        <p><strong>Submitted:</strong> ${submittedDate}</p>
                    </div>
                    <div class="request-actions">
                        <button class="btn-approve" onclick="approveRequest('${data.id}')">Approve</button>
                        <button class="btn-reject" onclick="rejectRequest('${data.id}')">Reject</button>
                    </div>
                </div>
            `;
        }).join('');
    });
}

// Approve Request
window.approveRequest = async function(submissionId) {
    showLoading();
    const code = generateVerificationCode();
    
    try {
        await database.ref(`submissions/${submissionId}`).update({
            status: 'approved',
            verificationCode: code,
            approvedAt: Date.now()
        });
    } catch (error) {
        console.error('Approval error:', error);
        alert('Approval failed. Please try again.');
    }
    
    hideLoading();
};

// Reject Request
window.rejectRequest = async function(submissionId) {
    showLoading();
    
    try {
        await database.ref(`submissions/${submissionId}`).update({
            status: 'rejected',
            rejectedAt: Date.now()
        });
    } catch (error) {
        console.error('Rejection error:', error);
        alert('Rejection failed. Please try again.');
    }
    
    hideLoading();
};

// Unity Integration - Verification Endpoint
// This would typically be a Cloud Function, but here's the client-side logic
window.verifyCode = async function(playerId, code) {
    try {
        const submissionsRef = database.ref('submissions');
        const snapshot = await submissionsRef.orderByChild('playerId').equalTo(playerId).once('value');
        
        if (!snapshot.exists()) {
            return { success: false, message: 'Invalid player ID' };
        }
        
        let matchingSubmission = null;
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.verificationCode === code && 
                data.status === 'approved' && 
                !data.verified) {
                matchingSubmission = { id: childSnapshot.key, ...data };
            }
        });
        
        if (!matchingSubmission) {
            return { success: false, message: 'Invalid or already used code' };
        }
        
        await database.ref(`submissions/${matchingSubmission.id}`).update({
            verified: true,
            verifiedAt: Date.now()
        });
        
        return { success: true, message: 'Verification successful' };
    } catch (error) {
        console.error('Verification error:', error);
        return { success: false, message: 'Verification failed' };
    }
};
