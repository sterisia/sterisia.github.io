console.log("📣 supabase-auth.js loaded");

const client = supabase.createClient('https://nakdqkyxszavzwmfolaz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha2Rxa3l4c3phdnp3bWZvbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNDIxNTcsImV4cCI6MjA2MzcxODE1N30.P-9C4DxK-TxUhBazAcRLD-LmsbaawLH6LoCeTphj6ys');

// -------------------- AUTH FUNCTIONS --------------------

async function signInWithGoogle() {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/index.html` // or whatever your main game page is
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

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    // Redirect to main game page instead of reloading
    window.location.href = "index.html"; // or your main game page
  }
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/index.html`
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
    console.warn("⛔ No user found, redirecting...");
    redirectToLogin();
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

async function updateCounter(character, type, amount) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const column = `${character}_${type}`;
  const current = window.progress?.[column] || 0;
  const newValue = current + amount;

  const { error } = await client
    .from('user_progress')
    .update({ [column]: newValue })
    .eq('user_id', user.id);

  if (error) {
    console.error(`Failed to update ${column}:`, error.message);
  } else {
    window.progress[column] = newValue;
    console.log(`✅ ${column} updated to ${newValue}`);
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
    window.location.href = "login.html";
  }
}

// -------------------- SESSION MANAGEMENT --------------------

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 DOMContentLoaded — checking session");

  // Handle OAuth callback
  const { data: sessionData, error: sessionErr } = await client.auth.getSession();
  
  if (sessionErr) {
    console.error("❌ Error retrieving session:", sessionErr.message);
    return;
  }

  const user = sessionData?.session?.user;
  console.log("👤 Retrieved user:", user);

  const isLoginPage = window.location.pathname.includes("login.html");
  
  // Handle different page scenarios
  if (!user) {
    if (!isLoginPage) {
      console.warn("🔒 No user — redirecting to login");
      redirectToLogin();
    }
    return;
  }

  // User is authenticated
  if (isLoginPage) {
    console.log("✅ Already logged in — redirecting to main page");
    window.location.href = "error.html"; // Change this to your actual main page
    return;
  }

  // Load progress for authenticated user on game pages
  console.log("📦 User authenticated — loading progress");
  await loadUserProgress();
});

// Listen for auth state changes
client.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN') {
    // User just signed in, create progress if needed
    if (session?.user) {
      await loadUserProgress();
    }
  } else if (event === 'SIGNED_OUT') {
    // Clear progress data
    window.progress = null;
    if (!window.location.pathname.includes("login.html")) {
      redirectToLogin();
    }
  }
});