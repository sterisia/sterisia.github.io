console.log("📣 supabase-auth.js loaded");

const client = supabase.createClient('https://nakdqkyxszavzwmfolaz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha2Rxa3l4c3phdnp3bWZvbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNDIxNTcsImV4cCI6MjA2MzcxODE1N30.P-9C4DxK-TxUhBazAcRLD-LmsbaawLH6LoCeTphj6ys');

// -------------------- AUTH FUNCTIONS --------------------

async function signInWithGoogle() {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/error.html` // Update this path
    }
  });
  
  if (error) {
    console.error('Google sign-in error:', error.message);
    alert(error.message);
  }
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Sign in error:', error.message);
    alert(error.message);
  } else {
    console.log('✅ Sign in successful:', data.user?.email);
    // Force session refresh before redirect
    await client.auth.getSession();
    window.location.href = "error.html"; // Update this path
  }
}

// Add a manual session check function
async function checkSession() {
  console.log("🔄 Manually checking session...");
  const { data: sessionData, error } = await client.auth.getSession();
  
  if (error) {
    console.error("Session check error:", error);
    return null;
  }
  
  console.log("Session data:", sessionData);
  return sessionData?.session?.user;
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/error.html`
    }
  });
  
  if (error) {
    alert(error.message);
  } else {
    alert("Check your email to confirm your account!");
  }
}

async function logout() {
  await client.auth.signOut();
  window.location.href = "login.html";
}

// -------------------- GAME PROGRESS --------------------

async function loadUserProgress() {
  console.log("🔄 loadUserProgress() called");

  // Get current user
  const { data: { user }, error: userErr } = await client.auth.getUser();
  if (userErr) {
    console.error("⛔ Auth error:", userErr.message);
    return;
  }
  if (!user) {
    console.log("👤 No user logged in - using local storage for progress");
    loadLocalProgress();
    return;
  }

  console.log("✅ Logged-in user ID:", user.id);

  // Try to select the user's progress
  console.log("🔍 Checking for existing progress row...");
  const { data, error } = await client
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error("⚠️ SELECT error:", error.message);
    return;
  }

  if (data) {
    console.log("📦 Progress found:", data);
    window.progress = data;
    window.isLoggedIn = true;
    displayProgressValues(); 
    generateEndingSummary(); 
  } else {
    console.log("🆕 No row found. Creating new progress row...");
    await createUserProgress(user.id);
  }
}

async function createUserProgress(userId) {
  const defaultProgress = {
    user_id: userId,
    alph_enc: 0, 
    alph_fav: 0,
    ans_enc: 0, 
    ans_fav: 0,
    cas_enc: 0, 
    cas_fav: 0,
    sol_enc: 0, 
    sol_fav: 0,
    veg_enc: 0, 
    veg_fav: 0
  };

  const { data, error } = await client
    .from('user_progress')
    .insert([defaultProgress])
    .select()
    .single();

  if (error) {
    console.error("❌ INSERT error:", error.message);
    alert("Couldn't create your progress row. Check your RLS policy or table schema.");
    return;
  }

  console.log("✅ Progress row created successfully!");
  window.progress = data;
  displayProgressValues(); 
  generateEndingSummary(); 
}

// -------------------- LOCAL PROGRESS (FOR NON-LOGGED IN USERS) --------------------

function loadLocalProgress() {
  // Use in-memory storage since localStorage isn't available in Claude artifacts
  const defaultProgress = {
    alph_enc: 0, alph_fav: 0,
    ans_enc: 0, ans_fav: 0,
    cas_enc: 0, cas_fav: 0,
    sol_enc: 0, sol_fav: 0,
    veg_enc: 0, veg_fav: 0
  };

  // Try to get from memory or use defaults
  if (!window.progress) {
    window.progress = defaultProgress;
  }
  
  window.isLoggedIn = false;
  console.log("📦 Using local progress:", window.progress);
  displayProgressValues();
  generateEndingSummary();
}

function saveLocalProgress() {
  // In a real environment, you'd save to localStorage here
  // For now, it's just kept in memory during the session
  console.log("💾 Local progress saved to memory");
}

async function updateCounter(character, type, amount) {
  const { data: { user } } = await client.auth.getUser();
  
  const column = `${character}_${type}`;
  const current = window.progress?.[column] || 0;
  const newValue = current + amount;

  if (user && window.isLoggedIn) {
    // Update in database for logged-in users
    const { error } = await client
      .from('user_progress')
      .update({ [column]: newValue })
      .eq('user_id', user.id);

    if (error) {
      console.error(`Failed to update ${column}:`, error.message);
    } else {
      window.progress[column] = newValue;
      console.log(`✅ ${column} updated in database to ${newValue}`);
    }
  } else {
    // Update locally for non-logged-in users
    window.progress[column] = newValue;
    saveLocalProgress();
    console.log(`✅ ${column} updated locally to ${newValue}`);
  }
}

async function updateAndNavigate(character, type, amount, url) {
  await updateCounter(character, type, amount);
  window.location.href = url;
}

function displayProgressValues() {
  if (!window.progress) {
    console.warn("⚠️ Progress not available yet.");
    return;
  }

  const keys = [
    "alph_enc", "alph_fav",
    "ans_enc", "ans_fav",
    "cas_enc", "cas_fav",
    "sol_enc", "sol_fav",
    "veg_enc", "veg_fav"
  ];

  for (const key of keys) {
    const el = document.getElementById(key);
    if (el) {
      el.textContent = window.progress[key] ?? 0;
    }
  }
}

function redirectToLogin() {
  if (!window.location.pathname.includes("login.html")) {
    // Go up directories to find login page - adjust path as needed
    window.location.href = "/login.html"; // or "../../login.html" if deeper
  }
}

// -------------------- SESSION MANAGEMENT --------------------

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DOMContentLoaded — checking session");
  console.log("📍 Current page:", window.location.pathname);

  // Wait a bit for OAuth redirects to process
  await new Promise(resolve => setTimeout(resolve, 100));

  // Handle OAuth callback
  const { data: sessionData, error: sessionErr } = await client.auth.getSession();
  
  if (sessionErr) {
    console.error("❌ Error retrieving session:", sessionErr.message);
    // Continue without auth
    loadLocalProgress();
    return;
  }

  const user = sessionData?.session?.user;
  console.log("👤 Retrieved user:", user);
  console.log("🔑 Session exists:", !!sessionData?.session);

  const isLoginPage = window.location.pathname.includes("login.html");
  
  // Handle different scenarios
  if (!user) {
    console.log("🎮 No user logged in - continuing with local progress");
    loadLocalProgress();
    return;
  }

  // User is authenticated
  if (isLoginPage) {
    console.log("✅ Already logged in — redirecting to main page");
    window.location.href = "error.html"; // Change this to your actual main game page
    return;
  }

  // Load progress for authenticated user
  console.log("📦 User authenticated — loading cloud progress");
  await loadUserProgress();
});

// -------------------- PROGRESS MIGRATION --------------------

async function migrateLocalToCloud(localProgress, cloudProgress) {
  console.log("🔄 Starting progress migration...");
  console.log("📱 Local progress:", localProgress);
  console.log("☁️ Cloud progress:", cloudProgress);

  const progressKeys = ['alph_enc', 'alph_fav', 'ans_enc', 'ans_fav', 'cas_enc', 'cas_fav', 'sol_enc', 'sol_fav', 'veg_enc', 'veg_fav'];
  
  // Strategy: Take the maximum value for each stat (preserves most progress)
  const mergedProgress = {};
  let hasChanges = false;

  for (const key of progressKeys) {
    const localValue = localProgress[key] || 0;
    const cloudValue = cloudProgress[key] || 0;
    const maxValue = Math.max(localValue, cloudValue);
    
    mergedProgress[key] = maxValue;
    
    if (maxValue !== cloudValue) {
      hasChanges = true;
      console.log(`📊 ${key}: local(${localValue}) vs cloud(${cloudValue}) → using ${maxValue}`);
    }
  }

  if (hasChanges) {
    console.log("💾 Updating cloud progress with merged data...");
    
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;

    const { error } = await client
      .from('user_progress')
      .update(mergedProgress)
      .eq('user_id', user.id);

    if (error) {
      console.error("❌ Migration failed:", error.message);
      return false;
    }

    // Update local state
    window.progress = { ...mergedProgress, user_id: user.id };
    displayProgressValues();
    generateEndingSummary();
    
    console.log("✅ Progress migration completed successfully!");
    
    // Show user-friendly notification
    showMigrationNotification(localProgress, mergedProgress);
    return true;
  } else {
    console.log("✅ No migration needed - cloud progress is up to date");
    return false;
  }
}

function showMigrationNotification(localProgress, mergedProgress) {
  // Create a simple notification to show the user what happened
  const progressKeys = ['alph_enc', 'alph_fav', 'ans_enc', 'ans_fav', 'cas_enc', 'cas_fav', 'sol_enc', 'sol_fav', 'veg_enc', 'veg_fav'];
  let improvementCount = 0;
  
  for (const key of progressKeys) {
    if ((mergedProgress[key] || 0) > (localProgress[key] || 0)) {
      improvementCount++;
    }
  }
  
  if (improvementCount > 0) {
    // You can customize this notification method
    console.log(`🎉 Progress merged! Your cloud save had better progress in ${improvementCount} areas.`);
    
    // Optional: Show a user-facing notification
    if (typeof showNotification === 'function') {
      showNotification(`Welcome back! Your progress has been merged with your cloud save.`);
    }
  } else {
    console.log("📱 Your local progress was saved to the cloud!");
    
    if (typeof showNotification === 'function') {
      showNotification("Your local progress has been saved to the cloud!");
    }
  }
}

// Optional: Helper function for user notifications (you can implement this in your UI)
function showNotification(message) {
  // Example implementation - you can customize this
  if (window.alert) {
    // For now, just log it. You can replace with a nicer notification system
    console.log("🔔 Notification:", message);
  }
}

// Listen for auth state changes
client.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN') {
    if (session?.user) {
      console.log("🔄 User signed in - checking for progress migration");
      
      // Store current local progress before loading cloud progress
      const localProgress = window.progress ? { ...window.progress } : null;
      const wasUsingLocal = !window.isLoggedIn;
      
      // Load cloud progress
      await loadUserProgress();
      
      // If we had meaningful local progress and weren't already logged in
      if (localProgress && wasUsingLocal && hasSignificantProgress(localProgress)) {
        const cloudProgress = window.progress;
        await migrateLocalToCloud(localProgress, cloudProgress);
      } else {
        console.log("ℹ️ No local progress to migrate or already using cloud progress");
      }
    }
  } else if (event === 'SIGNED_OUT') {
    // Switch back to local progress
    console.log("👋 User signed out - switching to local progress");
    loadLocalProgress();
  }
});

// Helper function to determine if local progress is worth migrating
function hasSignificantProgress(progress) {
  if (!progress) return false;
  
  const progressKeys = ['alph_enc', 'alph_fav', 'ans_enc', 'ans_fav', 'cas_enc', 'cas_fav', 'sol_enc', 'sol_fav', 'veg_enc', 'veg_fav'];
  const totalProgress = progressKeys.reduce((sum, key) => sum + (progress[key] || 0), 0);
  
  // Consider it significant if there's any progress at all
  return totalProgress > 0;
}