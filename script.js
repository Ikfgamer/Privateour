// Firebase Configuration and Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Hide loading screen after everything is loaded
  const loadingScreen = document.getElementById('loading-screen');

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBqDwc_TcqqBOICcM-djWShW250MsVQCvg",
    authDomain: "flowing-athlete-452807-k6.firebaseapp.com",
    projectId: "flowing-athlete-452807-k6",
    storageBucket: "flowing-athlete-452807-k6.firebasestorage.app",
    messagingSenderId: "1046325065023",
    appId: "1:1046325065023:web:79ce007fa947b73ec6cf8a",
    measurementId: "G-M65H20B0V5"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // Initialize the UI
  initializeApp();

  // Authentication state observer
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in
      console.log("User is signed in:", user.displayName);
      loadUserData(user);
      renderMainContent('home');
    } else {
      // User is signed out
      console.log("User is signed out");
      renderAuthContent();
    }

    // Hide loading screen after auth state is determined
    loadingScreen.classList.add('hidden');
  });

  // Initialize the app UI
  function initializeApp() {
    const appContainer = document.getElementById('app');

    // Create navigation bar
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
      <div class="navbar-container">
        <a href="#" class="nav-logo">
          <i class="fas fa-trophy"></i> Tournament Hub
        </a>
        <ul class="nav-links">
          <li class="nav-item"><a href="#" class="nav-link" data-page="home">Home</a></li>
          <li class="nav-item"><a href="#" class="nav-link" data-page="tournaments">Tournaments</a></li>
          <li class="nav-item"><a href="#" class="nav-link" data-page="rewards">Rewards</a></li>
          <li class="nav-item"><a href="#" class="nav-link" data-page="vip">VIP</a></li>
          <li class="nav-item"><a href="#" class="nav-link" data-page="community">Community</a></li>
        </ul>
        <div class="user-controls">
          <div id="auth-buttons">
            <button id="login-button" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Sign In</button>
          </div>
          <div id="user-profile" class="hidden">
            <img id="user-avatar" class="user-avatar" src="" alt="User Avatar">
            <div id="user-dropdown" class="hidden">
              <a href="#" data-page="profile"><i class="fas fa-user"></i> My Profile</a>
              <a href="#" id="admin-panel-link" class="hidden" data-page="admin"><i class="fas fa-cog"></i> Admin Panel</a>
              <a href="#" id="logout-button"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
          </div>
        </div>
      </div>
    `;
    appContainer.appendChild(navbar);

    // Create main content container
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    appContainer.appendChild(mainContent);

    // Add event listeners for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        renderMainContent(page);
      });
    });

    // Add event listener for login button
    document.getElementById('login-button').addEventListener('click', function() {
      showAuthModal();
    });

    // Add event listener for logout button
    document.getElementById('logout-button').addEventListener('click', function(e) {
      e.preventDefault();
      auth.signOut().then(() => {
        console.log('User signed out');
      }).catch((error) => {
        console.error('Sign out error:', error);
      });
    });

    // Add event listener for user avatar (to show dropdown)
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
      userAvatar.addEventListener('click', function() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('hidden');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (e.target !== userAvatar && !userAvatar.contains(e.target)) {
        const dropdown = document.getElementById('user-dropdown');
        if (!dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      }
    });
  }

  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign in successful');
        // The signed-in user info.
        const user = result.user;

        // Check if this is a new user (first time signing in)
        const isNewUser = result.additionalUserInfo.isNewUser;
        if (isNewUser) {
          // Create a user document in Firestore
          createUserDocument(user);
        }
      })
      .catch((error) => {
        console.error('Google sign in error:', error);
      });
  }

  function createUserDocument(user) {
    // Check if user email is admin
    const isAdmin = user.email && (user.email === 'admin@example.com' || user.email.endsWith('@admin.tournamenthub.com'));

    db.collection('users').doc(user.uid).set({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random&color=fff`,
      points: 100, // Starting points
      tournaments: [],
      joinDate: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      isVIP: false,
      isAdmin: isAdmin,
      referrals: [],
      rewards: {
        dailyLogin: {
          lastClaimed: null,
          streakDays: 0
        }
      }
    }).then(() => {
      console.log('User document created');
      if (isAdmin) {
        showNotification('Admin account detected! You have access to the admin panel.', 'success');
      }
    }).catch((error) => {
      console.error('Error creating user document:', error);
    });
  }

  function loadUserData(user) {
    // Update UI with user data
    const userAvatar = document.getElementById('user-avatar');
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const adminPanelLink = document.getElementById('admin-panel-link');

    if (userAvatar) userAvatar.src = user.photoURL || 'https://via.placeholder.com/40';
    if (authButtons) authButtons.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (adminPanelLink && user.email && (user.email === 'admin@example.com' || user.email.endsWith('@admin.tournamenthub.com'))) {
      adminPanelLink.classList.remove('hidden');
    }

    // Track daily login
    trackDailyLogin(user.uid);
  }

  function trackDailyLogin(userId) {
    const userRef = db.collection('users').doc(userId);
    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const now = new Date();
        const lastLogin = userData.rewards?.dailyLogin?.lastClaimed ?
                          userData.rewards.dailyLogin.lastClaimed.toDate() : null;

        // Check if this is a new day for login
        if (!lastLogin || !isSameDay(now, lastLogin)) {
          // Give daily login reward
          let streakDays = userData.rewards?.dailyLogin?.streakDays || 0;
          streakDays++;

          // Calculate reward points based on streak
          const rewardPoints = 10 + Math.min(streakDays * 5, 50); // Max 60 points for 10+ day streak

          userRef.update({
            points: firebase.firestore.FieldValue.increment(rewardPoints),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            'rewards.dailyLogin.lastClaimed': firebase.firestore.FieldValue.serverTimestamp(),
            'rewards.dailyLogin.streakDays': streakDays
          }).then(() => {
            showNotification(`Daily login reward: +${rewardPoints} points! (Day ${streakDays} streak)`);
          });
        } else {
          // Just update last login
          userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });
  }

  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  function renderAuthContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="hero">
        <h1>Welcome to Tournament Hub</h1>
        <p>Join tournaments, earn rewards, and compete with players worldwide.</p>
        <button id="hero-login-button" class="btn btn-primary">Sign In to Get Started</button>
      </div>
      <div class="container">
        <h2 class="section-title">Featured Tournaments</h2>
        <div class="grid">
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Weekend Warrior Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date">Starts in 2 days</span>
                <span class="tournament-players">64 players</span>
              </div>
              <div class="tournament-prize">Prize: 1000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 50 points</span>
                <button class="btn btn-primary" disabled>Sign in to Join</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Pro Gaming League</h3>
              <div class="tournament-info">
                <span class="tournament-date">Ongoing</span>
                <span class="tournament-players">128 players</span>
              </div>
              <div class="tournament-prize">Prize: 5000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 200 points</span>
                <button class="btn btn-primary" disabled>Sign in to Join</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Flash Quiz Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date">Today</span>
                <span class="tournament-players">32 players</span>
              </div>
              <div class="tournament-prize">Prize: 500 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 25 points</span>
                <button class="btn btn-primary" disabled>Sign in to Join</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listener for hero login button in renderAuthContent
    document.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'hero-login-button') {
        showAuthModal();
      }
    });
  }

  function renderMainContent(page) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    // Highlight active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-page') === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    switch(page) {
      case 'home':
        renderHomePage();
        break;
      case 'tournaments':
        renderTournamentsPage();
        break;
      case 'rewards':
        renderRewardsPage();
        break;
      case 'vip':
        renderVIPPage();
        break;
      case 'community':
        renderCommunityPage();
        break;
      case 'profile':
        renderProfilePage();
        break;
      case 'admin':
        renderAdminPanel(); // Added admin panel rendering
        break;
      default:
        renderHomePage();
    }
  }

  function renderHomePage() {
    const mainContent = document.getElementById('main-content');

    // Get current user
    const user = auth.currentUser;
    if (!user) return;

    // Get user data from Firestore
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();

        mainContent.innerHTML = `
          <div class="hero">
            <h1>Welcome back, ${userData.displayName}!</h1>
            <p>You have ${userData.points} points to use in tournaments.</p>
          </div>
          <div class="container">
            <div class="stats-grid mb-4">
              <div class="stat-box">
                <i class="fas fa-trophy"></i>
                <div class="value">0</div>
                <div class="label">Tournaments Won</div>
              </div>
              <div class="stat-box">
                <i class="fas fa-gamepad"></i>
                <div class="value">0</div>
                <div class="label">Tournaments Joined</div>
              </div>
              <div class="stat-box">
                <i class="fas fa-coins"></i>
                <div class="value">${userData.points}</div>
                <div class="label">Points</div>
              </div>
              <div class="stat-box">
                <i class="fas fa-users"></i>
                <div class="value">${userData.referrals?.length || 0}</div>
                <div class="label">Referrals</div>
              </div>
            </div>

            <h2 class="section-title">Upcoming Tournaments</h2>
            <div class="grid">
              <div class="tournament-card">
                <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
                <div class="tournament-details">
                  <h3 class="tournament-title">Weekend Warrior Challenge</h3>
                  <div class="tournament-info">
                    <span class="tournament-date">Starts in 2 days</span>
                    <span class="tournament-players">64 players</span>
                  </div>
                  <div class="tournament-prize">Prize: 1000 points</div>
                  <div class="tournament-entry">
                    <span class="entry-fee">Entry: 50 points</span>
                    <button class="btn btn-primary">Join Tournament</button>
                  </div>
                </div>
              </div>
              <div class="tournament-card">
                <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
                <div class="tournament-details">
                  <h3 class="tournament-title">Pro Gaming League</h3>
                  <div class="tournament-info">
                    <span class="tournament-date">Ongoing</span>
                    <span class="tournament-players">128 players</span>
                  </div>
                  <div class="tournament-prize">Prize: 5000 points</div>
                  <div class="tournament-entry">
                    <span class="entry-fee">Entry: 200 points</span>
                    <button class="btn btn-primary">Join Tournament</button>
                  </div>
                </div>
              </div>
              <div class="tournament-card">
                <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
                <div class="tournament-details">
                  <h3 class="tournament-title">Flash Quiz Challenge</h3>
                  <div class="tournament-info">
                    <span class="tournament-date">Today</span>
                    <span class="tournament-players">32 players</span>
                  </div>
                  <div class="tournament-prize">Prize: 500 points</div>
                  <div class="tournament-entry">
                    <span class="entry-fee">Entry: 25 points</span>
                    <button class="btn btn-primary">Join Tournament</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="rewards-container mt-4">
              <h2 class="section-title">Daily Rewards</h2>
              <div class="reward-item">
                <div class="reward-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="reward-details">
                  <h3 class="reward-title">Daily Login Streak: Day ${userData.rewards?.dailyLogin?.streakDays || 0}</h3>
                  <p class="reward-description">Log in daily to earn points. Longer streaks earn more points!</p>
                </div>
                <div class="reward-points">+${10 + Math.min((userData.rewards?.dailyLogin?.streakDays || 0) * 5, 50)} points</div>
              </div>
              <div class="reward-item">
                <div class="reward-icon">
                  <i class="fas fa-ad"></i>
                </div>
                <div class="reward-details">
                  <h3 class="reward-title">Watch Ads for Points</h3>
                  <p class="reward-description">Watch a short ad to earn extra points.</p>
                </div>
                <div class="reward-points">+20 points</div>
                <button class="btn btn-secondary">Watch Ad</button>
              </div>
            </div>
          </div>
        `;
      }
    });
  }

  function renderTournamentsPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="container">
        <h2 class="section-title">All Tournaments</h2>

        <div class="tournament-filters mb-3">
          <select class="form-input" style="width: auto;">
            <option value="all">All Tournaments</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="grid">
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Weekend Warrior Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date">Starts in 2 days</span>
                <span class="tournament-players">64 players</span>
              </div>
              <div class="tournament-prize">Prize: 1000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 50 points</span>
                <button class="btn btn-primary">Join Tournament</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Pro Gaming League</h3>
              <div class="tournament-info">
                <span class="tournament-date">Ongoing</span>
                <span class="tournament-players">128 players</span>
              </div>
              <div class="tournament-prize">Prize: 5000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 200 points</span>
                <button class="btn btn-primary">Join Tournament</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Flash Quiz Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date">Today</span>
                <span class="tournament-players">32 players</span>
              </div>
              <div class="tournament-prize">Prize: 500 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 25 points</span>
                <button class="btn btn-primary">Join Tournament</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Strategy Masters</h3>
              <div class="tournament-info">
                <span class="tournament-date">Next week</span>
                <span class="tournament-players">16 players</span>
              </div>
              <div class="tournament-prize">Prize: 3000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 150 points</span>
                <button class="btn btn-primary">Join Tournament</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Puzzle Marathon</h3>
              <div class="tournament-info">
                <span class="tournament-date">Tomorrow</span>
                <span class="tournament-players">50 players</span>
              </div>
              <div class="tournament-prize">Prize: 800 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 40 points</span>
                <button class="btn btn-primary">Join Tournament</button>
              </div>
            </div>
          </div>
          <div class="tournament-card">
            <img src="https://via.placeholder.com/300x180" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">VIP Elite Showdown</h3>
              <div class="tournament-info">
                <span class="tournament-date">This weekend</span>
                <span class="tournament-players">32 players</span>
              </div>
              <div class="tournament-prize">Prize: 10000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">VIP Only</span>
                <button class="btn btn-secondary">Upgrade to VIP</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRewardsPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="container">
        <h2 class="section-title">Earn Points & Rewards</h2>

        <div class="rewards-container">
          <h3 class="mb-2">Daily Rewards</h3>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Daily Login Bonus</h3>
              <p class="reward-description">Log in daily to earn points. Longer streaks earn more points!</p>
            </div>
            <div class="reward-points">+10-60 points</div>
          </div>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-ad"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Watch Ads for Points</h3>
              <p class="reward-description">Watch a short ad to earn extra points (3 times daily).</p>
            </div>
            <div class="reward-points">+20 points</div>
            <button class="btn btn-secondary">Watch Ad</button>
          </div>
        </div>

        <div class="rewards-container mt-4">
          <h3 class="mb-2">Refer & Earn</h3>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Invite Friends</h3>
              <p class="reward-description">Earn points for each friend who joins using your referral link.</p>
            </div>
            <div class="reward-points">+100 points per referral</div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Your Referral Link</label>
            <div style="display: flex;">
              <input type="text" class="form-input" value="https://tournamenthub.com/ref/username" readonly style="flex-grow: 1; margin-right: 10px;">
              <button class="btn btn-primary">Copy</button>
            </div>
          </div>
        </div>

        <div class="rewards-container mt-4">
          <h3 class="mb-2">Tournament Achievements</h3>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Tournament Victory</h3>
              <p class="reward-description">Win a tournament to earn bonus points besides the prize pool.</p>
            </div>
            <div class="reward-points">+200 points</div>
          </div>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-medal"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Tournament Finalist</h3>
              <p class="reward-description">Reach the finals of any tournament.</p>
            </div>
            <div class="reward-points">+100 points</div>
          </div>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-fire"></i>
            </div>
            <div class="reward-details">
              <h3 class="reward-title">Win Streak</h3>
              <p class="reward-description">Win 3 tournaments in a row.</p>
            </div>
            <div class="reward-points">+500 points</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderVIPPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="container">
        <div class="vip-container">
          <h2 class="vip-title">VIP Membership</h2>
          <p class="vip-description">Upgrade to VIP and unlock exclusive benefits and features!</p>

          <div class="vip-benefits">
            <div class="vip-benefit">
              <i class="fas fa-coins"></i>
              <h3>Double Points</h3>
              <p>Earn 2x points from daily logins and ads</p>
            </div>
            <div class="vip-benefit">
              <i class="fas fa-lock-open"></i>
              <h3>Exclusive Tournaments</h3>
              <p>Access to VIP-only tournaments with bigger prizes</p>
            </div>
            <div class="vip-benefit">
              <i class="fas fa-clock"></i>
              <h3>Early Access</h3>
              <p>Join tournaments before non-VIP members</p>
            </div>
            <div class="vip-benefit">
              <i class="fas fa-tag"></i>
              <h3>Discounted Entry</h3>
              <p>20% off tournament entry fees</p>
            </div>
          </div>

          <p class="mt-3 mb-3">Available Soon</p>
        </div>
      </div>
    `;
  }

  function renderCommunityPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="container">
        <h2 class="section-title">Community Hub</h2>

        <div class="chat-container">
          <div class="chat-sidebar">
            <div style="padding: 1rem; border-bottom: 1px solid #ddd;">
              <h3>Chat Channels</h3>
            </div>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 0.75rem 1rem; border-bottom: 1px solid #eee; background-color: var(--primary-light); color: white;"># general</li>
              <li style="padding: 0.75rem 1rem; border-bottom: 1px solid #eee;"># tournament-help</li>
              <li style="padding: 0.75rem 1rem; border-bottom: 1px solid #eee;"># team-finding</li>
              <li style="padding: 0.75rem 1rem; border-bottom: 1px solid #eee;"># strategies</li>
              <li style="padding: 0.75rem 1rem; border-bottom: 1px solid #eee;"># off-topic</li>
            </ul>
          </div>
          <div class="chat-main">
            <div class="chat-header">
              <h3># general</h3>
            </div>
            <div class="chat-messages">
              <div class="message">
                <img src="https://via.placeholder.com/40" alt="User Avatar" class="message-avatar">
                <div class="message-content">
                  <div class="message-sender">TournamentMaster</div>
                  <div class="message-text">Welcome to the community chat! This is where you can discuss tournaments, find teammates, and share strategies.</div>
                  <div class="message-time">2 hours ago</div>
                </div>
              </div>
              <div class="message">
                <img src="https://via.placeholder.com/40" alt="User Avatar" class="message-avatar">
                <div class="message-content">
                  <div class="message-sender">GamePro99</div>
                  <div class="message-text">Anyone joining the Weekend Warrior Challenge? Looking for teammates!</div>
                  <div class="message-time">45 minutes ago</div>
                </div>
              </div>
              <div classdiv class="message">
                <img src="https://via.placeholder.com/40" alt="User Avatar" class="message-avatar">
                <div class="message-content">
                  <div class="message-sender">StrategyGuru</div>
                  <div class="message-text">I'll join! I've won it twice before. Add me to your team.</div>
                  <div class="message-time">30 minutes ago</div>
                </div>
              </div>
              <div class="message">
                <img src="https://via.placeholder.com/40" alt="User Avatar" class="message-avatar">
                <div class="message-content">
                  <div class="message-sender">NewPlayer123</div>
                  <div class="message-text">How many points do you typically need to win the Flash Quiz Challenge?</div>
                  <div class="message-time">15 minutes ago</div>
                </div>
              </div>
              <div class="message">
                <img src="https://via.placeholder.com/40" alt="User Avatar" class="message-avatar">
                <div class="message-content">
                  <div class="message-sender">QuizChampion</div>
                  <div class="message-text">Usually around 2000-2500 points to win first place. It's all about speed and accuracy!</div>
                  <div class="message-time">5 minutes ago</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="Type your message...">
              <button class="btn btn-primary">Send</button>
            </div>
          </div>
        </div>

        <div class="rewards-container mt-4">
          <h3 class="mb-2">Community Leaderboard</h3>
          <table class="leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Tournaments Won</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="rank rank-1">1</td>
                <td>TournamentMaster</td>
                <td>32</td>
                <td>25,480</td>
              </tr>
              <tr>
                <td class="rank rank-2">2</td>
                <td>GamePro99</td>
                <td>28</td>
                <td>21,350</td>
              </tr>
              <tr>
                <td class="rank rank-3">3</td>
                <td>StrategyGuru</td>
                <td>25</td>
                <td>19,780</td>
              </tr>
              <tr>
                <td class="rank">4</td>
                <td>QuizChampion</td>
                <td>22</td>
                <td>18,430</td>
              </tr>
              <tr>
                <td class="rank">5</td>
                <td>TopPlayer</td>
                <td>20</td>
                <td>16,890</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderProfilePage() {
    const mainContent = document.getElementById('main-content');

    // Get current user
    const user = auth.currentUser;
    if (!user) return;

    // Get user data from Firestore
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();

        mainContent.innerHTML = `
          <div class="container">
            <div class="profile-container">
              <div class="profile-header">
                <img src="${user.photoURL || 'https://via.placeholder.com/100'}" alt="User Avatar" class="profile-avatar">
                <div class="profile-info">
                  <h2>${userData.displayName}</h2>
                  <p>Member since ${userData.joinDate ? new Date(userData.joinDate.toDate()).toLocaleDateString() : 'Unknown'}</p>
                  <p>${userData.isVIP ? '<span style="color: gold;"><i class="fas fa-crown"></i> VIP Member</span>' : 'Standard Member'}</p>
                </div>
              </div>

              <div class="profile-stats">
                <div class="stat-card">
                  <div class="stat-value">${userData.points}</div>
                  <div class="stat-label">Points</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">0</div>
                  <div class="stat-label">Tournaments Won</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">0</div>
                  <div class="stat-label">Tournaments Joined</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${userData.rewards?.dailyLogin?.streakDays || 0}</div>
                  <div class="stat-label">Login Streak</div>
                </div>
              </div>

              <h3 class="section-title">Your Tournament History</h3>
              <table class="leaderboard mb-4">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Date</th>
                    <th>Placement</th>
                    <th>Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="4" class="text-center">No tournament history yet</td>
                  </tr>
                </tbody>
              </table>

              <h3 class="section-title">Referrals</h3>
              <div class="form-group mb-3">
                <label class="form-label">Your Referral Link</label>
                <div style="display: flex;">
                  <input type="text" class="form-input" value="https://tournamenthub.com/ref/${userData.displayName}" readonly style="flex-grow: 1; margin-right: 10px;">
                  <button class="btn btn-primary">Copy</button>
                </div>
              </div>
              <p>You've invited ${userData.referrals?.length || 0} friends and earned ${(userData.referrals?.length || 0) * 100} points from referrals.</p>
            </div>
          </div>
        `;
      }
    });
  }

  function renderAdminPanel() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="container">
        <h1>Admin Panel</h1>
        <p>This is the admin panel. You can manage users, tournaments, and rewards here.</p>
      </div>
    `;
  }

  // Placeholder for showAuthModal function (needs implementation)
  function showAuthModal() {
    // Implement your authentication modal logic here.  This is a placeholder.
    console.log("Show Authentication Modal");
    signInWithGoogle(); //For now, this still calls the Google Sign-In
  }
});