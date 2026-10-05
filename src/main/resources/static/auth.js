const API_URL = "https://minicache-api.onrender.com";


// =====================================================
// PASSWORD VISIBILITY
// =====================================================

const togglePassword =
    document.getElementById("togglePassword");

const signupPassword =
    document.getElementById("signupPassword");

if (togglePassword && signupPassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                signupPassword.type === "password";

            signupPassword.type =
                isPassword ? "text" : "password";

            togglePassword.classList.toggle(
                "fa-eye"
            );

            togglePassword.classList.toggle(
                "fa-eye-slash"
            );
        }
    );
}


// =====================================================
// SIGNUP
// =====================================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("signupUsername")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("signupPassword")
                    .value;

            const message =
                document.getElementById(
                    "signupMessage"
                );


            if (!username) {

                message.textContent =
                    "Please enter a username.";

                return;
            }


            if (!email) {

                message.textContent =
                    "Please enter your email.";

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                message.textContent =
                    "Please enter a valid email.";

                return;
            }


            if (password.length < 8) {

                message.textContent =
                    "Password must be at least 8 characters.";

                return;
            }


            message.textContent =
                "Creating your account...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok && data.success) {

                    message.textContent =
                        "Account created successfully! Redirecting to login...";

                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 1500);

                } else {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                }

            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";

            }

        }
    );
}


// =====================================================
// GO TO LOGIN
// =====================================================

const goToLogin =
    document.getElementById("goToLogin");

if (goToLogin) {

    goToLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );
}