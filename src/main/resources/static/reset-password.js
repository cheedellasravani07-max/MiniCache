const API_URL =
    "https://minicache-api.onrender.com";

// GET TOKEN FROM URL
const urlParams =
    new URLSearchParams(window.location.search);

const resetToken =
    urlParams.get("token");

const resetForm =
    document.getElementById(
        "resetPasswordForm"
    );

const message =
    document.getElementById(
        "resetMessage"
    );

// CHECK TOKEN
if (!resetToken) {

    message.textContent =
        "Invalid or missing password reset link.";

    resetForm.style.display = "none";
}


// PASSWORD VISIBILITY
function setupPasswordToggle(
    toggleId,
    inputId
) {

    const toggle =
        document.getElementById(toggleId);

    const input =
        document.getElementById(inputId);

    if (!toggle || !input) {
        return;
    }

    toggle.addEventListener(
        "click",
        () => {

            const isPassword =
                input.type === "password";

            input.type =
                isPassword
                    ? "text"
                    : "password";

            toggle.classList.toggle(
                "fa-eye"
            );

            toggle.classList.toggle(
                "fa-eye-slash"
            );
        }
    );
}

setupPasswordToggle(
    "newPasswordToggle",
    "newPassword"
);

setupPasswordToggle(
    "confirmPasswordToggle",
    "confirmPassword"
);


// RESET PASSWORD
if (resetForm) {

    resetForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const newPassword =
                document
                    .getElementById(
                        "newPassword"
                    )
                    .value;

            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    .value;

            if (newPassword.length < 8) {

                message.textContent =
                    "Password must be at least 8 characters.";

                return;
            }

            if (newPassword !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }

            message.textContent =
                "Resetting your password...";

            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/reset-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                token: resetToken,

                                newPassword:
                                newPassword

                            })
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {

                    message.textContent =
                        "Password reset successful! Redirecting to login...";

                    resetForm.reset();

                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 2000);

                } else {

                    message.textContent =
                        data.message ||
                        "Password reset failed.";

                }

            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";
            }
        }
    );
}


// BACK TO LOGIN
const goToLogin =
    document.getElementById(
        "goToLogin"
    );

if (goToLogin) {

    goToLogin.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );
}