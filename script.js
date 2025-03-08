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

  // Initialize the app UI
  initializeApp();

  // Try to create admin account
  createAdminAccount();

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
    if (!appContainer) return; // Safety check

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
            <button id="login-button" class="btn btn-gradient"><i class="fas fa-gamepad"></i> Join Now</button>
          </div>
          <div id="user-profile" class="hidden">
            <div class="user-points">
              <i class="fas fa-coins"></i> <span id="user-points-display">0</span>
            </div>
            <img id="user-avatar" class="user-avatar" src="" alt="User Avatar">
            <div id="user-dropdown" class="hidden">
              <a href="#" data-page="profile"><i class="fas fa-user"></i> My Profile</a>
              <a href="#" data-page="history"><i class="fas fa-history"></i> Tournament History</a>
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
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks) {
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const page = this.getAttribute('data-page');
          renderMainContent(page);
        });
      });
    }

    // Add event listener for login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.addEventListener('click', function() {
        showAuthModal();
      });
    }

    // Add event listener for logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        auth.signOut().then(() => {
          console.log('User signed out');
          showNotification("You've been logged out successfully", "info");
        }).catch((error) => {
          console.error('Sign out error:', error);
        });
      });
    }

    // Add event listener for user avatar (to show dropdown)
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
      userAvatar.addEventListener('click', function() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
          dropdown.classList.toggle('hidden');
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden') && e.target !== userAvatar && !userAvatar.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
    }
    
    // Add footer
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <i class="fas fa-trophy"></i> Tournament Hub
          </div>
          <div class="footer-links">
            <div class="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#" data-page="home">Home</a></li>
                <li><a href="#" data-page="tournaments">Tournaments</a></li>
                <li><a href="#" data-page="rewards">Rewards</a></li>
                <li><a href="#" data-page="vip">VIP Membership</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Support</h3>
              <ul>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Connect</h3>
              <div class="social-icons">
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-discord"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Tournament Hub. All rights reserved.</p>
        </div>
      </div>
    `;
    appContainer.appendChild(footer);
    
    // Setup footer link events
    const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
    if (footerLinks) {
      footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const page = this.getAttribute('data-page');
          renderMainContent(page);
        });
      });
    }
  }

  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Add scope for profile info
    provider.addScope('profile');
    provider.addScope('email');
    
    // First try signInWithPopup as it works better in embedded environments
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign in successful');
        const user = result.user;
        
        // Check if this is a new user
        const isNewUser = result.additionalUserInfo?.isNewUser;
        if (isNewUser) {
          createUserDocument(user);
        }
        
        showNotification(`Welcome, ${user.displayName}!`, "success");
      })
      .catch((error) => {
        console.error('Google sign in popup error:', error);
        
        // If popup fails, try redirect as fallback
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
          try {
            // Fall back to redirect method
            auth.signInWithRedirect(provider)
              .catch((redirectError) => {
                handleGoogleSignInError(redirectError);
              });
              
            // Setup redirect result handler
            auth.getRedirectResult().then((result) => {
              if (result.user) {
                console.log('Google sign in successful after redirect');
                const user = result.user;
                
                // Check if this is a new user
                const isNewUser = result.additionalUserInfo?.isNewUser;
                if (isNewUser) {
                  createUserDocument(user);
                }
                
                showNotification(`Welcome, ${user.displayName}!`, "success");
              }
            }).catch((redirectResultError) => {
              console.error('Google redirect result error:', redirectResultError);
              handleGoogleSignInError(redirectResultError);
            });
          } catch (e) {
            console.error('Google sign in setup error:', e);
            showNotification("Google sign-in is currently unavailable. Please use email/password instead.", "warning");
          }
        } else {
          handleGoogleSignInError(error);
        }
      });
  }
  
  function handleGoogleSignInError(error) {
    console.error('Google sign in error:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/unauthorized-domain') {
      showNotification("This domain is not authorized for Google Sign-in. Please use email/password instead.", "warning");
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      showNotification("Google sign-in was cancelled. Please try again.", "info");
    } else if (error.code === 'auth/network-request-failed') {
      showNotification("Network error. Please check your connection and try again.", "error");
    } else {
      showNotification(`Sign in failed: ${error.message}`, "error");
    }
  }

  function createUserDocument(user) {
    // Check if user email is admin - specific admin email
    const isAdmin = user.email && (user.email === 'Jitenadminpanelaccess@gmail.com' || user.email === 'karateboyjitenderprajapat@gmail.com' || user.email.endsWith('@admin.tournamenthub.com'));

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
    const userPointsDisplay = document.getElementById('user-points-display');

    if (userAvatar) userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random&color=fff`;
    if (authButtons) authButtons.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    
    // Check if user is admin
    const isAdmin = user.email && (
      user.email === 'Jitenadminpanelaccess@gmail.com' || 
      user.email === 'karateboyjitenderprajapat@gmail.com' || 
      user.email.endsWith('@admin.tournamenthub.com')
    );
    
    if (adminPanelLink && isAdmin) {
      adminPanelLink.classList.remove('hidden');
    }

    // Get and display user points
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userPointsDisplay) {
          userPointsDisplay.textContent = userData.points || 0;
        }
        
        // If this is an admin logging in, check and update admin status
        if (isAdmin && !userData.isAdmin) {
          db.collection('users').doc(user.uid).update({
            isAdmin: true
          }).then(() => {
            console.log('User updated with admin privileges');
            showNotification('Admin privileges granted', 'success');
          });
        }
      }
    }).catch(err => {
      console.error('Error loading user data:', err);
    });

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
    const user = firebase.auth().currentUser;
    
    const tournamentsHTML = `
      <div class="container">
        <h2 class="section-title">All Tournaments</h2>

        <div class="tournament-filters mb-3">
          <div class="filter-controls">
            <select class="form-input tournament-filter" id="tournament-status-filter">
              <option value="all">All Tournaments</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            
            <select class="form-input tournament-filter ml-2" id="tournament-prize-filter">
              <option value="all">All Prize Pools</option>
              <option value="low">Low (< 1000 points)</option>
              <option value="medium">Medium (1000-3000 points)</option>
              <option value="high">High (> 3000 points)</option>
            </select>
            
            <input type="text" class="form-input ml-2" id="tournament-search" placeholder="Search tournaments...">
          </div>
          
          <div class="tournament-count">
            <span id="tournament-count-display">6 tournaments found</span>
          </div>
        </div>

        <div class="tournament-grid">
          <div class="tournament-card">
            <div class="tournament-banner">
              <span class="tournament-status upcoming">Upcoming</span>
            </div>
            <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Weekend Warrior Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> Starts in 2 days</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 64 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-gamepad"></i> Battle Royale</span>
              </div>
              <div class="tournament-prize">Prize: 1000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 50 points</span>
                <button class="btn btn-primary tournament-join-btn" data-tournament-id="t1" data-entry-fee="50">Join Tournament</button>
              </div>
            </div>
          </div>
          
          <div class="tournament-card">
            <div class="tournament-banner">
              <span class="tournament-status ongoing">Ongoing</span>
            </div>
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Pro Gaming League</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> Ongoing</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 128 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-gamepad"></i> FPS Championship</span>
              </div>
              <div class="tournament-prize">Prize: 5000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 200 points</span>
                <button class="btn btn-primary tournament-join-btn" data-tournament-id="t2" data-entry-fee="200">Join Tournament</button>
              </div>
            </div>
          </div>
          
          <div class="tournament-card">
            <div class="tournament-banner">
              <span class="tournament-status today">Today</span>
            </div>
            <img src="https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Flash Quiz Challenge</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> Today</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 32 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-brain"></i> Trivia Masters</span>
              </div>
              <div class="tournament-prize">Prize: 500 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 25 points</span>
                <button class="btn btn-primary tournament-join-btn" data-tournament-id="t3" data-entry-fee="25">Join Tournament</button>
              </div>
            </div>
          </div>
          
          <div class="tournament-card">
            <div class="tournament-banner">
              <span class="tournament-status upcoming">Next Week</span>
            </div>
            <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Strategy Masters</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> Next week</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 16 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-chess"></i> Strategy Games</span>
              </div>
              <div class="tournament-prize">Prize: 3000 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 150 points</span>
                <button class="btn btn-primary tournament-join-btn" data-tournament-id="t4" data-entry-fee="150">Join Tournament</button>
              </div>
            </div>
          </div>
          
          <div class="tournament-card">
            <div class="tournament-banner">
              <span class="tournament-status upcoming">Tomorrow</span>
            </div>
            <img src="https://images.unsplash.com/photo-1559116315-f69f60c3b506?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">Puzzle Marathon</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> Tomorrow</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 50 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-puzzle-piece"></i> Puzzle Games</span>
              </div>
              <div class="tournament-prize">Prize: 800 points</div>
              <div class="tournament-entry">
                <span class="entry-fee">Entry: 40 points</span>
                <button class="btn btn-primary tournament-join-btn" data-tournament-id="t5" data-entry-fee="40">Join Tournament</button>
              </div>
            </div>
          </div>
          
          <div class="tournament-card vip-tournament">
            <div class="tournament-banner">
              <span class="tournament-status vip">VIP Only</span>
            </div>
            <img src="https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
            <div class="tournament-details">
              <h3 class="tournament-title">VIP Elite Showdown</h3>
              <div class="tournament-info">
                <span class="tournament-date"><i class="far fa-calendar-alt"></i> This weekend</span>
                <span class="tournament-players"><i class="fas fa-users"></i> 32 players</span>
              </div>
              <div class="tournament-game">
                <span><i class="fas fa-trophy"></i> Multi-game Championship</span>
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
    
    mainContent.innerHTML = tournamentsHTML;
    
    // Add event listeners for tournament filtering
    const statusFilter = document.getElementById('tournament-status-filter');
    const prizeFilter = document.getElementById('tournament-prize-filter');
    const searchInput = document.getElementById('tournament-search');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', filterTournaments);
    }
    
    if (prizeFilter) {
      prizeFilter.addEventListener('change', filterTournaments);
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', filterTournaments);
    }
    
    // Add event listeners for join tournament buttons
    const joinButtons = document.querySelectorAll('.tournament-join-btn');
    joinButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tournamentId = this.getAttribute('data-tournament-id');
        const entryFee = parseInt(this.getAttribute('data-entry-fee'), 10);
        
        if (!user) {
          showNotification("Please sign in to join tournaments", "warning");
          showAuthModal();
          return;
        }
        
        // Check if user has enough points
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            const userData = doc.data();
            const userPoints = userData.points || 0;
            
            if (userPoints >= entryFee) {
              // Here you would implement the tournament join logic
              showNotification(`Successfully joined tournament! Entry fee: ${entryFee} points`, "success");
              
              // Update user points
              db.collection('users').doc(user.uid).update({
                points: firebase.firestore.FieldValue.increment(-entryFee),
                tournaments: firebase.firestore.FieldValue.arrayUnion({
                  tournamentId: tournamentId,
                  joinDate: firebase.firestore.FieldValue.serverTimestamp()
                })
              }).then(() => {
                // Update displayed points
                const pointsDisplay = document.getElementById('user-points-display');
                if (pointsDisplay) {
                  pointsDisplay.textContent = userPoints - entryFee;
                }
              });
            } else {
              showNotification(`Not enough points to join. Need ${entryFee} points but you have ${userPoints}`, "error");
            }
          }
        }).catch(error => {
          console.error("Error checking user points:", error);
          showNotification("Error joining tournament. Please try again.", "error");
        });
      });
    });
  }
  
  function filterTournaments() {
    const statusFilter = document.getElementById('tournament-status-filter').value;
    const prizeFilter = document.getElementById('tournament-prize-filter').value;
    const searchTerm = document.getElementById('tournament-search').value.toLowerCase();
    
    const tournamentCards = document.querySelectorAll('.tournament-card');
    let visibleCount = 0;
    
    tournamentCards.forEach(card => {
      // Get tournament details
      const title = card.querySelector('.tournament-title').textContent.toLowerCase();
      const status = card.querySelector('.tournament-status').textContent.toLowerCase();
      const prize = card.querySelector('.tournament-prize').textContent;
      const prizeValue = parseInt(prize.match(/\d+/)[0], 10);
      
      // Check if tournament matches all filters
      let matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'upcoming' && (status.includes('upcoming') || status.includes('next') || status.includes('tomorrow'))) ||
                         (statusFilter === 'ongoing' && status.includes('ongoing')) ||
                         (statusFilter === 'completed' && status.includes('completed'));
                         
      let matchesPrize = prizeFilter === 'all' || 
                        (prizeFilter === 'low' && prizeValue < 1000) ||
                        (prizeFilter === 'medium' && prizeValue >= 1000 && prizeValue <= 3000) ||
                        (prizeFilter === 'high' && prizeValue > 3000);
                        
      let matchesSearch = searchTerm === '' || title.includes(searchTerm);
      
      // Show or hide tournament card
      if (matchesStatus && matchesPrize && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Update count display
    const countDisplay = document.getElementById('tournament-count-display');
    if (countDisplay) {
      countDisplay.textContent = `${visibleCount} tournament${visibleCount !== 1 ? 's' : ''} found`;
    }
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
                  <div class="message-sender">GamePro99</<div class="message-text">Anyone joining the Weekend Warrior Challenge? Looking for teammates!</div>
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

    // Add loading indicator while fetching data
    mainContent.innerHTML = `
      <div class="container text-center mt-4">
        <div class="loader"></div>
        <p>Loading profile...</p>
      </div>
    `;

    // Get user data from Firestore
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();

        const joinDate = userData.joinDate ? new Date(userData.joinDate.toDate()) : new Date();
        const memberDays = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
        const tournamentCount = userData.tournaments?.length || 0;

        mainContent.innerHTML = `
          <div class="container">
            <div class="profile-container">
              <div class="profile-header">
                <img src="${user.photoURL || 'https://via.placeholder.com/100'}" alt="User Avatar" class="profile-avatar">
                <div class="profile-info">
                  <h2>${userData.displayName}</h2>
                  <p><i class="far fa-calendar-alt"></i> Member since ${userData.joinDate ? new Date(userData.joinDate.toDate()).toLocaleDateString() : 'Unknown'} (${memberDays} days)</p>
                  <p>${userData.isVIP ? '<span class="vip-badge"><i class="fas fa-crown"></i> VIP Member</span>' : 'Standard Member'}</p>
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
                  <div class="stat-value">${tournamentCount}</div>
                  <div class="stat-label">Tournaments Joined</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${userData.rewards?.dailyLogin?.streakDays || 0}</div>
                  <div class="stat-label">Login Streak</div>
                </div>
              </div>
              
              <div class="profile-content">
                <div class="profile-tabs">
                  <div class="profile-tab active" data-tab="tournaments">Tournament History</div>
                  <div class="profile-tab" data-tab="achievements">Achievements</div>
                  <div class="profile-tab" data-tab="referrals">Referrals</div>
                  <div class="profile-tab" data-tab="settings">Account Settings</div>
                </div>
                
                <div class="profile-tab-content" id="tournaments-tab">
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-trophy"></i> Your Tournament History</h3>
                    ${tournamentCount > 0 ? `
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
                          ${userData.tournaments.map(tournament => `
                            <tr>
                              <td>Weekend Warrior Challenge</td>
                              <td>${new Date(tournament.joinDate?.toDate() || Date.now()).toLocaleDateString()}</td>
                              <td>TBD</td>
                              <td>--</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    ` : `
                      <div class="text-center mt-4 mb-4">
                        <p>You haven't joined any tournaments yet.</p>
                        <button class="btn btn-primary mt-2" id="find-tournaments-btn">Find Tournaments</button>
                      </div>
                    `}
                  </div>
                  
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-medal"></i> Upcoming Tournaments</h3>
                    <div class="grid mt-3">
                      <div class="tournament-card">
                        <div class="tournament-banner">
                          <span class="tournament-status upcoming">Upcoming</span>
                        </div>
                        <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Tournament Image" class="tournament-image">
                        <div class="tournament-details">
                          <h3 class="tournament-title">Weekend Warrior Challenge</h3>
                          <div class="tournament-info">
                            <span class="tournament-date"><i class="far fa-calendar-alt"></i> Starts in 2 days</span>
                            <span class="tournament-players"><i class="fas fa-users"></i> 64 players</span>
                          </div>
                          <div class="tournament-game">
                            <span><i class="fas fa-gamepad"></i> Battle Royale</span>
                          </div>
                          <div class="tournament-prize">Prize: 1000 points</div>
                          <div class="tournament-entry">
                            <span class="entry-fee">Entry: 50 points</span>
                            <button class="btn btn-primary tournament-join-btn" data-tournament-id="t1" data-entry-fee="50">Join Tournament</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="profile-tab-content hidden" id="achievements-tab">
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-award"></i> Your Achievements</h3>
                    <div class="achievement-grid">
                      <div class="achievement-card active">
                        <div class="achievement-icon">
                          <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>New Member</h4>
                          <p>Join Tournament Hub</p>
                        </div>
                      </div>
                      
                      <div class="achievement-card active">
                        <div class="achievement-icon">
                          <i class="fas fa-coins"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>First Points</h4>
                          <p>Earn at least 100 points</p>
                        </div>
                      </div>
                      
                      <div class="achievement-card ${userData.rewards?.dailyLogin?.streakDays >= 7 ? 'active' : ''}">
                        <div class="achievement-icon">
                          <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>Dedicated Player</h4>
                          <p>Log in for 7 days in a row</p>
                        </div>
                      </div>
                      
                      <div class="achievement-card ${tournamentCount > 0 ? 'active' : ''}">
                        <div class="achievement-icon">
                          <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>Tournament Participant</h4>
                          <p>Join your first tournament</p>
                        </div>
                      </div>
                      
                      <div class="achievement-card">
                        <div class="achievement-icon">
                          <i class="fas fa-trophy"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>Tournament Winner</h4>
                          <p>Win your first tournament</p>
                        </div>
                      </div>
                      
                      <div class="achievement-card">
                        <div class="achievement-icon">
                          <i class="fas fa-crown"></i>
                        </div>
                        <div class="achievement-info">
                          <h4>VIP Status</h4>
                          <p>Become a VIP member</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="profile-tab-content hidden" id="referrals-tab">
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-user-plus"></i> Referrals</h3>
                    <p class="mb-3">Invite friends to join Tournament Hub and earn 100 points for each friend who signs up using your referral link.</p>
                    
                    <div class="form-group mb-3">
                      <label class="form-label">Your Referral Link</label>
                      <div class="referral-link-container">
                        <input type="text" id="referral-link" class="form-input" value="https://tournamenthub.com/ref/${userData.displayName}" readonly>
                        <button class="btn btn-primary" id="copy-referral-link">Copy</button>
                      </div>
                    </div>
                    
                    <div class="referral-stats">
                      <div class="referral-stat">
                        <div class="referral-stat-value">${userData.referrals?.length || 0}</div>
                        <div class="referral-stat-label">Friends Invited</div>
                      </div>
                      
                      <div class="referral-stat">
                        <div class="referral-stat-value">${(userData.referrals?.length || 0) * 100}</div>
                        <div class="referral-stat-label">Points Earned</div>
                      </div>
                    </div>
                    
                    <div class="social-share mt-4">
                      <p>Share your referral link:</p>
                      <div class="social-buttons">
                        <button class="btn btn-social btn-twitter"><i class="fab fa-twitter"></i> Twitter</button>
                        <button class="btn btn-social btn-facebook"><i class="fab fa-facebook-f"></i> Facebook</button>
                        <button class="btn btn-social btn-discord"><i class="fab fa-discord"></i> Discord</button>
                        <button class="btn btn-social btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="profile-tab-content hidden" id="settings-tab">
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-user-cog"></i> Account Settings</h3>
                    
                    <div class="form-group">
                      <label class="form-label">Display Name</label>
                      <input type="text" class="form-input" id="display-name" value="${userData.displayName}">
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-input" value="${userData.email}" readonly>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">Profile Picture</label>
                      <div class="avatar-upload">
                        <img src="${user.photoURL || 'https://via.placeholder.com/100'}" alt="User Avatar" class="profile-avatar" style="width: 80px; height: 80px;">
                        <button class="btn btn-secondary" id="change-avatar-btn">Change Picture</button>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">Notification Settings</label>
                      <div class="checkbox-group">
                        <label class="checkbox-label">
                          <input type="checkbox" checked> Email notifications for tournaments
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" checked> Email notifications for rewards
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" checked> Push notifications
                        </label>
                      </div>
                    </div>
                    
                    <button class="btn btn-primary mt-3" id="save-settings-btn">Save Changes</button>
                  </div>
                  
                  <div class="profile-section">
                    <h3 class="profile-section-title"><i class="fas fa-shield-alt"></i> Security</h3>
                    
                    <button class="btn btn-secondary mb-3" id="change-password-btn">Change Password</button>
                    
                    <div class="form-group">
                      <label class="form-label">Two-Factor Authentication</label>
                      <div class="toggle-container">
                        <label class="toggle">
                          <input type="checkbox">
                          <span class="toggle-slider"></span>
                        </label>
                        <span>Disabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Setup tab switching
        const tabs = document.querySelectorAll('.profile-tab');
        if (tabs.length > 0) {
          tabs.forEach(tab => {
            tab.addEventListener('click', function() {
              const tabName = this.getAttribute('data-tab');
              
              // Hide all tab contents
              document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.add('hidden');
              });
              
              // Show selected tab content
              document.getElementById(`${tabName}-tab`).classList.remove('hidden');
              
              // Update active tab
              document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('active');
              });
              this.classList.add('active');
            });
          });
        }
        
        // Copy referral link button
        const copyReferralBtn = document.getElementById('copy-referral-link');
        if (copyReferralBtn) {
          copyReferralBtn.addEventListener('click', function() {
            const referralLink = document.getElementById('referral-link');
            referralLink.select();
            document.execCommand('copy');
            showNotification('Referral link copied to clipboard!', 'success');
          });
        }
        
        // Find tournaments button
        const findTournamentsBtn = document.getElementById('find-tournaments-btn');
        if (findTournamentsBtn) {
          findTournamentsBtn.addEventListener('click', function() {
            renderMainContent('tournaments');
          });
        }
        
        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
          saveSettingsBtn.addEventListener('click', function() {
            const newDisplayName = document.getElementById('display-name').value.trim();
            
            if (newDisplayName && newDisplayName !== userData.displayName) {
              // Update display name in Firebase Auth
              user.updateProfile({
                displayName: newDisplayName
              }).then(() => {
                // Update display name in Firestore
                db.collection('users').doc(user.uid).update({
                  displayName: newDisplayName
                }).then(() => {
                  showNotification('Profile updated successfully!', 'success');
                }).catch(error => {
                  console.error('Error updating profile in Firestore:', error);
                  showNotification('Error updating profile', 'error');
                });
              }).catch(error => {
                console.error('Error updating profile in Auth:', error);
                showNotification('Error updating profile', 'error');
              });
            } else {
              showNotification('Settings saved!', 'success');
            }
          });
        }
        
        // Change avatar button
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        if (changeAvatarBtn) {
          changeAvatarBtn.addEventListener('click', function() {
            showNotification('Avatar change feature coming soon!', 'info');
          });
        }
        
        // Change password button
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
          changePasswordBtn.addEventListener('click', function() {
            showNotification('Password change feature coming soon!', 'info');
          });
        }
      }
    }).catch(error => {
      console.error('Error loading user data:', error);
      mainContent.innerHTML = `
        <div class="container">
          <div class="alert error">
            <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
            <p>There was an error loading your profile data. Please try again later.</p>
            <button class="btn btn-primary mt-3" onclick="renderMainContent('home')">Return to Home</button>
          </div>
        </div>
      `;
    });
  }

  function renderAdminPanel() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Check if current user is admin
    const user = auth.currentUser;
    if (!user) return;

    // Show loading state
    mainContent.innerHTML = `
      <div class="container text-center">
        <div class="loader"></div>
        <p>Loading admin panel...</p>
      </div>
    `;

    // Get user data to verify admin status
    db.collection('users').doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const isAdmin = userData.isAdmin || 
                       user.email === 'Jitenadminpanelaccess@gmail.com' || 
                       user.email === 'karateboyjitenderprajapat@gmail.com' ||
                       user.email.endsWith('@admin.tournamenthub.com');

        if (isAdmin) {
          // Set admin flag if not already set
          if (!userData.isAdmin) {
            db.collection('users').doc(user.uid).update({
              isAdmin: true
            });
          }

          // Load stats for dashboard
          loadAdminStats().then(stats => {
            // Render admin panel with real stats
            mainContent.innerHTML = `
              <div class="admin-layout">
                <div class="admin-sidebar">
                  <div class="admin-logo">
                    <i class="fas fa-trophy"></i> Admin Panel
                  </div>
                  <div class="admin-user">
                    <img src="${user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Admin'}&background=random&color=fff`}" alt="Admin Avatar">
                    <div class="admin-user-info">
                      <div class="admin-user-name">${userData.displayName || user.email}</div>
                      <div class="admin-user-role">Administrator</div>
                    </div>
                  </div>
                  <ul class="admin-nav">
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link active" data-admin-page="dashboard">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                      </a>
                    </li>
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link" data-admin-page="users">
                        <i class="fas fa-users"></i> User Management
                      </a>
                    </li>
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link" data-admin-page="tournaments">
                        <i class="fas fa-trophy"></i> Tournament Management
                      </a>
                    </li>
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link" data-admin-page="rewards">
                        <i class="fas fa-gift"></i> Rewards & Earnings
                      </a>
                    </li>
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link" data-admin-page="ads">
                        <i class="fas fa-ad"></i> Ad Management
                      </a>
                    </li>
                    <li class="admin-nav-item">
                      <a href="#" class="admin-nav-link" data-admin-page="settings">
                        <i class="fas fa-cog"></i> Settings
                      </a>
                    </li>
                    <li class="admin-nav-item admin-nav-back">
                      <a href="#" class="admin-nav-link" id="back-to-site">
                        <i class="fas fa-arrow-left"></i> Back to Site
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="admin-content">
                  <div id="admin-dashboard-page">
                    <div class="admin-header">
                      <h1 class="admin-title">Dashboard</h1>
                      <div class="admin-actions">
                        <button class="btn btn-primary" id="refresh-admin-data">
                          <i class="fas fa-sync-alt"></i> Refresh Data
                        </button>
                      </div>
                    </div>

                    <div class="stats-grid mb-4">
                      <div class="stat-box">
                        <i class="fas fa-users"></i>
                        <div class="value">${stats.totalUsers}</div>
                        <div class="label">Total Users</div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-trophy"></i>
                        <div class="value">${stats.activeTournaments}</div>
                        <div class="label">Active Tournaments</div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-coins"></i>
                        <div class="value">${stats.pointsDistributed}</div>
                        <div class="label">Points Distributed</div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-user-plus"></i>
                        <div class="value">${stats.newUsers}</div>
                        <div class="label">New Users (Today)</div>
                      </div>
                    </div>

                    <div class="admin-quick-actions mb-4">
                      <h2 class="mb-2">Quick Actions</h2>
                      <div class="quick-actions-grid">
                        <div class="quick-action-card" id="create-tournament">
                          <i class="fas fa-trophy"></i>
                          <span>Create Tournament</span>
                        </div>
                        <div class="quick-action-card" id="add-user">
                          <i class="fas fa-user-plus"></i>
                          <span>Add User</span>
                        </div>
                        <div class="quick-action-card" id="edit-rewards">
                          <i class="fas fa-gift"></i>
                          <span>Edit Rewards</span>
                        </div>
                        <div class="quick-action-card" id="site-settings">
                          <i class="fas fa-cog"></i>
                          <span>Site Settings</span>
                        </div>
                      </div>
                    </div>

                    <div class="admin-card">
                      <div class="admin-card-header">
                        <h2>Recent Users</h2>
                        <button class="btn btn-sm btn-primary" id="view-all-users">View All</button>
                      </div>
                      <div class="admin-table-container">
                        <table class="admin-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Join Date</th>
                              <th>Points</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody id="recent-users-table">
                            ${stats.recentUsers.length > 0 ? 
                              stats.recentUsers.map(user => `
                                <tr>
                                  <td>
                                    <div class="user-cell">
                                      <img src="${user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random&color=fff`}" alt="User Avatar">
                                      <div>
                                        <div class="user-name">${user.displayName}</div>
                                        <div class="user-email">${user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>${new Date(user.joinDate.toDate()).toLocaleDateString()}</td>
                                  <td>${user.points}</td>
                                  <td><span class="status-badge ${user.isVIP ? 'vip' : 'standard'}">${user.isVIP ? 'VIP' : 'Standard'}</span></td>
                                  <td>
                                    <div class="table-actions">
                                      <button class="btn btn-sm btn-primary edit-user" data-user-id="${user.uid}"><i class="fas fa-edit"></i></button>
                                      <button class="btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-danger'} toggle-ban" data-user-id="${user.uid}">
                                        <i class="fas ${user.isBanned ? 'fa-user-check' : 'fa-user-slash'}"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              `).join('') : 
                              '<tr><td colspan="5" class="text-center">No users found</td></tr>'
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="admin-card">
                      <div class="admin-card-header">
                        <h2>Upcoming Tournaments</h2>
                        <button class="btn btn-sm btn-primary" id="view-all-tournaments">View All</button>
                      </div>
                      <div class="admin-table-container">
                        <table class="admin-table">
                          <thead>
                            <tr>
                              <th>Tournament</th>
                              <th>Start Date</th>
                              <th>Entry Fee</th>
                              <th>Prize Pool</th>
                              <th>Participants</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody id="tournaments-table">
                            ${stats.tournaments.length > 0 ? 
                              stats.tournaments.map(tournament => `
                                <tr>
                                  <td>${tournament.name}</td>
                                  <td>${new Date(tournament.startDate).toLocaleDateString()}</td>
                                  <td>${tournament.entryFee} points</td>
                                  <td>${tournament.prizePool} points</td>
                                  <td>${tournament.participants}/${tournament.maxParticipants}</td>
                                  <td>
                                    <div class="table-actions">
                                      <button class="btn btn-sm btn-primary edit-tournament" data-tournament-id="${tournament.id}"><i class="fas fa-edit"></i></button>
                                      <button class="btn btn-sm btn-danger delete-tournament" data-tournament-id="${tournament.id}"><i class="fas fa-trash"></i></button>
                                    </div>
                                  </td>
                                </tr>
                              `).join('') :
                              '<tr><td colspan="6" class="text-center">No tournaments found</td></tr>'
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;

            // Setup admin panel event listeners
            setupAdminPanelEvents();
            
            // Add event listener for "Back to Site" button
            document.getElementById('back-to-site').addEventListener('click', (e) => {
              e.preventDefault();
              renderMainContent('home');
            });
            
            // Add event listener for "Refresh Data" button
            document.getElementById('refresh-admin-data').addEventListener('click', () => {
              loadAdminStats().then(updatedStats => {
                // Update dashboard stats
                document.querySelectorAll('.stat-box .value')[0].textContent = updatedStats.totalUsers;
                document.querySelectorAll('.stat-box .value')[1].textContent = updatedStats.activeTournaments;
                document.querySelectorAll('.stat-box .value')[2].textContent = updatedStats.pointsDistributed;
                document.querySelectorAll('.stat-box .value')[3].textContent = updatedStats.newUsers;
                
                // Update tables as needed
                showNotification("Dashboard data refreshed", "success");
              });
            });
            
            // Add event listeners for quick action cards
            document.getElementById('create-tournament').addEventListener('click', () => {
              showAdminPage('tournaments');
              // Would typically show a tournament creation form
              showNotification("Tournament creation coming soon", "info");
            });
            
            document.getElementById('add-user').addEventListener('click', () => {
              showAdminPage('users');
              // Would typically show a user creation form
              showNotification("User creation coming soon", "info");
            });
            
            document.getElementById('edit-rewards').addEventListener('click', () => {
              showAdminPage('rewards');
            });
            
            document.getElementById('site-settings').addEventListener('click', () => {
              showAdminPage('settings');
            });
          }).catch(err => {
            console.error("Error loading admin stats:", err);
            showNotification("Error loading admin dashboard", "error");
          });
        } else {
          // Not an admin
          mainContent.innerHTML = `
            <div class="container">
              <div class="alert error">
                <h3><i class="fas fa-exclamation-triangle"></i> Access Denied</h3>
                <p>You do not have permission to access the admin panel.</p>
                <p>Please contact the site administrator if you believe this is an error.</p>
                <button class="btn btn-primary mt-3" id="back-to-home">Return to Home</button>
              </div>
            </div>
          `;
          
          document.getElementById('back-to-home').addEventListener('click', () => {
            renderMainContent('home');
          });
        }
      }
    }).catch(err => {
      console.error("Error checking admin status:", err);
      mainContent.innerHTML = `
        <div class="container">
          <div class="alert error">
            <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
            <p>There was an error loading the admin panel. Please try again later.</p>
            <button class="btn btn-primary mt-3" id="back-to-home">Return to Home</button>
          </div>
        </div>
      `;
      
      document.getElementById('back-to-home').addEventListener('click', () => {
        renderMainContent('home');
      });
    });
  }
  
  // Function to load admin dashboard stats
  function loadAdminStats() {
    return new Promise((resolve, reject) => {
      // Initialize stats object with default values
      const stats = {
        totalUsers: 0,
        activeTournaments: 0,
        pointsDistributed: 0,
        newUsers: 0,
        recentUsers: [],
        tournaments: []
      };
      
      // Get total users count and recent users
      db.collection('users').get().then(snapshot => {
        stats.totalUsers = snapshot.size;
        let totalPoints = 0;
        let todayUsers = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Process users for recent list and stats
        const recentUsers = [];
        snapshot.forEach(doc => {
          const userData = doc.data();
          totalPoints += userData.points || 0;
          
          // Check if user joined today
          if (userData.joinDate && userData.joinDate.toDate() >= today) {
            todayUsers++;
          }
          
          // Add to recent users array (limited to 5)
          if (recentUsers.length < 5) {
            recentUsers.push({
              ...userData,
              uid: doc.id
            });
          }
        });
        
        stats.pointsDistributed = totalPoints;
        stats.newUsers = todayUsers;
        stats.recentUsers = recentUsers;
        
        // Get tournaments
        db.collection('tournaments').get().then(snapshot => {
          stats.activeTournaments = snapshot.size;
          
          // Process tournaments for the list
          const tournaments = [];
          snapshot.forEach(doc => {
            const tournamentData = doc.data();
            tournaments.push({
              ...tournamentData,
              id: doc.id
            });
          });
          
          stats.tournaments = tournaments.slice(0, 5); // Limit to 5 tournaments
          
          resolve(stats);
        }).catch(reject);
      }).catch(reject);
    });
  }

  function setupAdminPanelEvents() {
    // Admin navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove active class from all links
        document.querySelectorAll('.admin-nav-link').forEach(l => {
          l.classList.remove('active');
        });

        // Add active class to clicked link
        this.classList.add('active');

        // Get page to display
        const page = this.getAttribute('data-admin-page');
        showAdminPage(page);
      });
    });
  }

  function showAdminPage(page) {
    // Hide all admin pages
    ['dashboard', 'users', 'tournaments', 'rewards', 'ads', 'settings'].forEach(p => {
      const pageElement = document.getElementById(`admin-${p}-page`);
      if (pageElement) {
        pageElement.style.display = 'none';
      }
    });

    // Show selected page
    const selectedPage = document.getElementById(`admin-${page}-page`);
    if (selectedPage) {
      selectedPage.style.display = 'block';
    } else {
      // Create the page if it doesn't exist
      createAdminPage(page);
    }
  }

  function createAdminPage(page) {
    const adminContent = document.querySelector('.admin-content');
    let pageHTML = '';

    switch (page) {
      case 'users':
        pageHTML = `
          <div id="admin-users-page">
            <div class="admin-header">
              <h1 class="admin-title">User Management</h1>
              <div class="admin-actions">
                <button class="btn btn-primary">
                  <i class="fas fa-user-plus"></i> Add User
                </button>
              </div>
            </div>

            <div class="admin-card">
              <div class="admin-filters mb-3">
                <input type="text" class="form-input" placeholder="Search users..." style="width: 300px;">
                <select class="form-input ml-2">
                  <option value="all">All Users</option>
                  <option value="vip">VIP Users</option>
                  <option value="standard">Standard Users</option>
                  <option value="banned">Banned Users</option>
                </select>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>VIP Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="7" class="text-center">No users found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;

      case 'tournaments':
        pageHTML = `
          <div id="admin-tournaments-page">
            <div class="admin-header">
              <h1 class="admin-title">Tournament Management</h1>
              <div class="admin-actions">
                <button class="btn btn-primary">
                  <i class="fas fa-plus"></i> Create Tournament
                </button>
              </div>
            </div>

            <div class="admin-card">
              <div class="admin-filters mb-3">
                <input type="text" class="form-input" placeholder="Search tournaments..." style="width: 300px;">
                <select class="form-input ml-2">
                  <option value="all">All Tournaments</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Entry Fee</th>
                    <th>Prize Pool</th>
                    <th>Participants</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="8" class="text-center">No tournaments found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;

      case 'rewards':
        pageHTML = `
          <div id="admin-rewards-page">
            <div class="admin-header">
              <h1 class="admin-title">Rewards & Earnings</h1>
              <div class="admin-actions">
                <button class="btn btn-primary">
                  <i class="fas fa-plus"></i> Create Reward
                </button>
              </div>
            </div>

            <div class="admin-card">
              <h2>Daily Rewards</h2>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Reward Type</th>
                    <th>Points Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Daily Login</td>
                    <td>10-60 points</td>
                    <td>Active</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-sm btn-primary">Edit</button>
                        <button class="btn btn-sm btn-danger">Disable</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Watch Ads</td>
                    <td>20 points</td>
                    <td>Active</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-sm btn-primary">Edit</button>
                        <button class="btn btn-sm btn-danger">Disable</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Referral Bonus</td>
                    <td>100 points</td>
                    <td>Active</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-sm btn-primary">Edit</button>
                        <button class="btn btn-sm btn-danger">Disable</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;

      case 'ads':
        pageHTML = `
          <div id="admin-ads-page">
            <div class="admin-header">
              <h1 class="admin-title">Ad Management</h1>
              <div class="admin-actions">
                <button class="btn btn-primary">
                  <i class="fas fa-plus"></i> Add Ad Unit
                </button>
              </div>
            </div>

            <div class="admin-card">
              <h2>Ad Settings</h2>
              <div class="form-group">
                <label class="form-label">Google AdSense Publisher ID</label>
                <input type="text" class="form-input" placeholder="pub-xxxxxxxxxxxxxxxx">
              </div>
              <div class="form-group">
                <label class="form-label">Watch Ads & Earn Feature</label>
                <div>
                  <label>
                    <input type="radio" name="ads-earn" checked> Enabled
                  </label>
                  <label style="margin-left: 20px;">
                    <input type="radio" name="ads-earn"> Disabled
                  </label>
                </div>
              </div>
              <button class="btn btn-primary">Save Settings</button>
            </div>
          </div>
        `;
        break;

      case 'settings':
        pageHTML = `
          <div id="admin-settings-page">
            <div class="admin-header">
              <h1 class="admin-title">Settings</h1>
              <div class="admin-actions">
                <button class="btn btn-primary">
                  <i class="fas fa-save"></i> Save All Settings
                </button>
              </div>
            </div>

            <div class="admin-card">
              <h2>Website Settings</h2>
              <div class="form-group">
                <label class="form-label">Site Name</label>
                <input type="text" class="form-input" value="Tournament Hub">
              </div>
              <div class="form-group">
                <label class="form-label">Site Description</label>
                <textarea class="form-input" rows="3">Join tournaments, earn rewards, and compete with players worldwide.</textarea>
              </div>
            </div>

            <div class="admin-card">
              <h2>Administrator Settings</h2>
              <div class="form-group">
                <label class="form-label">Admin Email</label>
                <input type="email" class="form-input" value="Jitenadminpanelaccess@gmail.com" readonly>
              </div>
              <div class="form-group">
                <label class="form-label">Change Admin Password</label>
                <input type="password" class="form-input" placeholder="Enter new password">
              </div>
              <button class="btn btn-primary">Update Admin Settings</button>
            </div>
          </div>
        `;
        break;

      default:
        pageHTML = `
          <div id="admin-${page}-page">
            <h1>Page Not Found</h1>
            <p>The requested admin page does not exist.</p>
          </div>
        `;
    }

    adminContent.innerHTML += pageHTML;
  }

  // Professional Authentication Modal
  function showAuthModal() {
    console.log("Show Authentication Modal");
    
    // Check if modal already exists
    let modal = document.getElementById('authModal');
    
    // Remove existing modal if present to avoid conflicts
    if (modal) {
      document.body.removeChild(modal);
    }
    
    // Create a new auth modal
    const modalHTML = `
      <div id="authModal" class="auth-modal">
        <div class="auth-modal-content">
          <div class="auth-modal-header">
            <h2><i class="fas fa-trophy"></i> Tournament Hub</h2>
            <span class="auth-close">&times;</span>
          </div>
          <div class="auth-modal-body">
            <div class="auth-welcome">
              <h3>Join the Tournament Community</h3>
              <p>Sign up to participate in tournaments, earn rewards, and compete with players worldwide.</p>
            </div>
            <div class="auth-tabs">
              <button class="auth-tab-btn active" data-tab="login">Login</button>
              <button class="auth-tab-btn" data-tab="register">Register</button>
            </div>

            <div id="login-tab" class="auth-tab-content active">
              <form class="auth-form" id="login-form">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-input" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-input" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn btn-gradient btn-block">Login</button>
              </form>

              <div class="auth-divider">
                <span>OR</span>
              </div>

              <button id="google-signin-btn" class="btn btn-google btn-block">
                <i class="fab fa-google"></i> Continue with Google
              </button>
            </div>

            <div id="register-tab" class="auth-tab-content">
              <form class="auth-form" id="register-form">
                <div class="form-group">
                  <label class="form-label">Username</label>
                  <input type="text" name="username" class="form-input" placeholder="Choose a username" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-input" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input type="password" name="password" class="form-input" placeholder="Create a password" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm Password</label>
                  <input type="password" name="confirm-password" class="form-input" placeholder="Confirm your password" required>
                </div>
                <button type="submit" class="btn btn-gradient btn-block">Create Account</button>
              </form>

              <div class="auth-divider">
                <span>OR</span>
              </div>

              <button id="google-signup-btn" class="btn btn-google btn-block">
                <i class="fab fa-google"></i> Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Create the modal element
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    
    // Append the modal to the body directly
    document.body.appendChild(modalElement.firstElementChild);
    
    // Get the newly created modal (after it's definitely in the DOM)
    modal = document.getElementById('authModal');
    
    if (modal) {
      // Show the modal
      modal.style.display = 'flex';
      
      // Set up the event listeners
      setupAuthModalEvents();
    } else {
      console.error('Failed to create auth modal');
      showNotification("An error occurred. Please try again.", "error");
    }
  }

  function setupAuthModalEvents() {
    const modal = document.getElementById('authModal');
    if (!modal) {
      console.error('Auth modal not found in the DOM');
      return;
    }

    // Close button functionality
    const closeButton = modal.querySelector('.auth-close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }

    // Close when clicking outside modal
    document.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Tab switching
    const tabButtons = modal.querySelectorAll('.auth-tab-btn');
    if (tabButtons && tabButtons.length > 0) {
      tabButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Remove active class from all tabs and contents
          modal.querySelectorAll('.auth-tab-btn').forEach(function(b) {
            b.classList.remove('active');
          });
          
          modal.querySelectorAll('.auth-tab-content').forEach(function(c) {
            c.classList.remove('active');
          });

          // Add active class to clicked tab
          btn.classList.add('active');

          // Show corresponding content
          const tabName = btn.getAttribute('data-tab');
          const tabContent = modal.querySelector(`#${tabName}-tab`);
          if (tabContent) {
            tabContent.classList.add('active');
          }
        });
      });
    }

    // Form submission for email/password login
    const loginForm = modal.querySelector('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = loginForm.querySelector('input[name="email"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        
        if (!emailInput || !passwordInput) {
          showNotification("Email or password input not found", "error");
          return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
          showNotification("Please enter both email and password", "error");
          return;
        }
        
        // Sign in with email and password
        signInWithEmailPassword(email, password);
        modal.style.display = 'none';
      });
    }

    // Form submission for email/password registration
    const registerForm = modal.querySelector('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const usernameInput = registerForm.querySelector('input[name="username"]');
        const emailInput = registerForm.querySelector('input[name="email"]');
        const passwordInput = registerForm.querySelector('input[name="password"]');
        const confirmPasswordInput = registerForm.querySelector('input[name="confirm-password"]');
        
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
          showNotification("One or more registration inputs not found", "error");
          return;
        }
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!username || !email || !password || !confirmPassword) {
          showNotification("Please fill in all fields", "error");
          return;
        }
        
        if (password !== confirmPassword) {
          showNotification("Passwords do not match!", "error");
          return;
        }
        
        // Create user with email and password
        createUserWithEmailPassword(email, password, username);
        modal.style.display = 'none';
      });
    }

    // Google sign in buttons
    const googleSignInBtn = modal.querySelector('#google-signin-btn');
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', function() {
        signInWithGoogle();
        modal.style.display = 'none';
      });
    }

    const googleSignUpBtn = modal.querySelector('#google-signup-btn');
    if (googleSignUpBtn) {
      googleSignUpBtn.addEventListener('click', function() {
        signInWithGoogle();
        modal.style.display = 'none';
      });
    }
  }
  
  // New function to sign in with email and password
  function signInWithEmailPassword(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Email sign in successful');
        const user = userCredential.user;
        showNotification(`Welcome back, ${user.displayName || email}!`, "success");
      })
      .catch((error) => {
        console.error('Email sign in error:', error);
        showNotification(`Login failed: ${error.message}`, "error");
      });
  }
  
  // New function to create user with email and password
  function createUserWithEmailPassword(email, password, displayName) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Email registration successful');
        const user = userCredential.user;
        
        // Update profile with displayName
        return user.updateProfile({
          displayName: displayName,
          photoURL: `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff`
        }).then(() => {
          // Create user document
          createUserDocument(user);
          showNotification(`Welcome to Tournament Hub, ${displayName}!`, "success");
        });
      })
      .catch((error) => {
        console.error('Email registration error:', error);
        showNotification(`Registration failed: ${error.message}`, "error");
      });
  }

  // Function to create admin account (if it doesn't exist)
  function createAdminAccount() {
    const adminEmail = 'karateboyjitenderprajapat@gmail.com';
    const adminPassword = 'Selfdefence2010';

    auth.createUserWithEmailAndPassword(adminEmail, adminPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Admin account created:', user.uid);
        // Additional setup for admin account, if needed
        createUserDocument(user); // Add this user to firestore and mark as admin.
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('Admin account already exists.');
        } else {
          console.error('Error creating admin account:', error);
        }
      });
  }
});