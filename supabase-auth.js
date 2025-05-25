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
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (data) {
    window.progress = data;
    console.log("Progress loaded:", data);
  } else {
    // New user, insert initial row
    const { error: insertError } = await supabase
      .from('user_progress')
      .insert([{ user_id: user.id }]);
    if (insertError) {
      console.error("Failed to insert initial progress row:", insertError.message);
    }
    window.progress = {};
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
