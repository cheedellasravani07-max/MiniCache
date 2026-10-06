const API_URL = "https://minicache-api.onrender.com";

let loginType = "USER";


// =====================================================
// LOGIN TYPE SELECTION
// =====================================================

const userLoginOption =
    document.getElementById("userLoginOption");

const adminLoginOption =
    document.getElementById("adminLoginOption");


userLoginOption.addEventListener(
    "click",
    () => {

        loginType = "USER";

        userLoginOption.classList.add("active");

        adminLoginOption.classList.remove(
            "active",
            "admin-active"
        );

        document.getElementById(
            "loginButtonText"
        ).textContent = "Sign In";

    }
);


adminLoginOption.addEventListener(
    "click",
    () => {

        loginType = "ADMIN";

        adminLoginOption.classList.add(
            "active",
            "admin-active"
        );

        userLoginOption.classList.remove(
            "active"
        );

        document.getElementById(
            "loginButtonText"
        ).textContent = "Admin Sign In";

    }
);


// =====================================================
// PASSWORD VISIBILITY
// =====================================================

const passwordToggle =
    document.getElementById(
        "loginPasswordToggle"
    );

const passwordInput =
    document.getElementById(
        "loginPassword"
    );


passwordToggle.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        passwordToggle.classList.toggle(
            "fa-eye"
        );

        passwordToggle.classList.toggle(
            "fa-eye-slash"
        );

    }
);


// =====================================================
// LOGIN
// =====================================================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const username =
            document
                .getElementById("loginUsername")
                .value
                .trim();

        const password =
            document
                .getElementById("loginPassword")
                .value;

        const message =
            document.getElementById(
                "loginMessage"
            );


        if (!username || !password) {

            message.textContent =
                "Please enter username and password.";

            return;
        }


        message.textContent =
            loginType === "ADMIN"
                ? "Authenticating administrator..."
                : "Signing in...";


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.success &&
                data.token
            ) {

                /*
                 * The backend already determines
                 * the user's actual role.
                 */

                const actualRole =
                    data.role ||
                    "USER";


                // Prevent a normal user from
                // entering through Admin Login.

                if (
                    loginType === "ADMIN" &&
                    actualRole !== "ADMIN"
                ) {

                    message.textContent =
                        "Access denied. This account is not an administrator.";

                    return;
                }


                // Prevent an admin from using
                // the normal User Login.

                if (
                    loginType === "USER" &&
                    actualRole === "ADMIN"
                ) {

                    message.textContent =
                        "Please use Admin Login for this account.";

                    return;
                }


                // Save authentication data.

                localStorage.setItem(
                    "minicacheToken",
                    data.token
                );


                if (data.refreshToken) {

                    localStorage.setItem(
                        "minicacheRefreshToken",
                        data.refreshToken
                    );

                }


                localStorage.setItem(
                    "minicacheUsername",
                    data.username || username
                );


                localStorage.setItem(
                    "minicacheRole",
                    actualRole
                );


                message.textContent =
                    "Login successful. Redirecting...";


                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 700);


            } else {

                message.textContent =
                    data.message ||
                    "Invalid username or password.";

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";

        }

    }
);


// =====================================================
// CREATE ACCOUNT
// =====================================================

document
    .getElementById("goToSignup")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "auth.html";

        }
    );

// FORGOT PASSWORD
document
    .getElementById("forgotPasswordLink")
    .addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            const username =
                prompt(
                    "Enter your MiniCache username:"
                );

            if (!username || !username.trim()) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/forgot-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username:
                                    username.trim()
                            })
                        }
                    );

                const data =
                    await response.json();

                if (response.ok && data.success) {

                    alert(
                        "If an account exists with this username, a password reset email has been sent. Please check your email."
                    );

                } else {

                    alert(
                        data.message ||
                        "Unable to process password reset request."
                    );
                }

            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
