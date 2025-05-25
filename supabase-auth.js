console.log("📣 supabase-auth.js loaded");

const client = supabase.createClient('https://nakdqkyxszavzwmfolaz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha2Rxa3l4c3phdnp3bWZvbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNDIxNTcsImV4cCI6MjA2MzcxODE1N30.P-9C4DxK-TxUhBazAcRLD-LmsbaawLH6LoCeTphj6ys');

// -------------------- AUTH FUNCTIONS --------------------

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    location.reload();
  }
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
  } else {
    alert("Check your email to confirm your account!");
  }
}

async function logout() {
  await client.auth.signOut();
  location.reload();
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
  } else {
    console.log("🆕 No row found. Attempting to insert new progress row...");

    const { error: insertError } = await client
      .from('user_progress')
      .insert([{ user_id: user.id }]);

    if (insertError) {
      console.error("❌ INSERT error:", insertError.message);
      alert("Couldn't create your progress row. Check your RLS policy or table schema.");
      return;
    }

    console.log("✅ Row inserted successfully!");
    window.progress = {}; // Initialize empty progress state
  }
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

  const { error } = await supabase
    .from('user_progress')
    .update({ [column]: newValue })
    .eq('user_id', user.id);

  if (error) {
    console.error(`Failed to update ${column}:`, error.message);
  } else {
    window.progress[column] = newValue;
  }
}

// -------------------- PAGE INIT --------------------

// window.onload = async () => {
//   const { data: { user } } = await client.auth.getUser();

//   if (!user && !window.location.href.includes("login.html")) {
//     // Redirect users who are not logged in (unless they’re already on the login page)
//     redirectToLogin();
//   } else if (user) {
//     await loadUserProgress();
//   }
// };

// function redirectToLogin() {
//   // You can customize this to show a form instead
//   if (!window.location.href.includes("login.html")) {
//     window.location.href = "login.html";
//   }
// }
