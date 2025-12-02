const authModal = document.getElementById("authModal");
const openBtn = document.getElementById("openAuthModal");
const closeBtn = document.getElementById("closeAuthModal");
const signOutBtn = document.getElementById("btn-signOut");

const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

const toSignin = document.getElementById("toSignin");
const toSignup = document.getElementById("toSignup");

const title = document.getElementById("authTitle");

const token = localStorage.getItem("token");
const accountNotSignedIn = document.querySelector(".account-not-signedin");
const accountSignedIn = document.querySelector(".account-signedin");

if (accountNotSignedIn && accountSignedIn) {
    if (token) {
        accountNotSignedIn.classList.add("displayNone");
        accountSignedIn.classList.remove("displayNone");
    } else {
        accountNotSignedIn.classList.remove("displayNone");
        accountSignedIn.classList.add("displayNone");
    }
} else {
    console.warn("Không tìm thấy phần tử account-notSignedIn hoặc account-signedIn");
}


// Mở modal
openBtn.onclick = () => {
    authModal.style.display = "block";
};

// Đóng modal
closeBtn.onclick = () => {
    authModal.style.display = "none";
};

// Click ra ngoài cũng tắt
window.onclick = (e) => {
    if (e.target === authModal) authModal.style.display = "none";
};

// Chuyển sang Sign Up
toSignup.onclick = (e) => {
    e.preventDefault();
    signinForm.classList.remove("active");
    signupForm.classList.add("active");
    title.innerText = "Sign Up";
};

// Chuyển sang Sign In
toSignin.onclick = (e) => {
    e.preventDefault();
    signupForm.classList.remove("active");
    signinForm.classList.add("active");
    title.innerText = "Sign In";
};


signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;
    const fullName = signupForm.querySelector('input[type="text"]').value;
    const dob = signupForm.querySelector('input[type="date"]').value;

    try {
        const res = await fetch("http://localhost:8080/api/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                displayName: fullName,
                dob
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Signup failed!");
            return;
        }

        alert("Signup success!");
        console.log("User:", data);

        // Optional: auto switch to sign in form
        document.getElementById("toSignin").click();

    } catch (err) {
        console.error(err);
        alert("Server error!");
    }
});

document.getElementById("signinForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const res = await fetch("http://localhost:8080/api/user/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Invalid email or password.");
            return;
        }

        alert("Sign in successful!");

        if (data.result.token) {
            localStorage.setItem("token", data.result.token);
        }

        window.location.reload();

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
    }
});

signOutBtn.onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function isAdminToken(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;

  const roles = payload.role || payload.roles || payload.authorities || payload.scope || payload.scopes;

  if (Array.isArray(roles)) {
    return roles.some(r => String(r).toLowerCase().includes('admin'));
  }

  if (typeof roles === 'string') {
    return roles.toLowerCase().split(/[\s,]+/).some(r => r.includes('admin'));
  }

  if (Array.isArray(payload.authorities)) {
    return payload.authorities.some(a => String(a.authority || a).toLowerCase().includes('admin'));
  }

  return false;
}

// Example usage:
const etoken = localStorage.getItem('token');
if (isAdminToken(etoken)) {
  window.location.href = 'admin.html';
} 

