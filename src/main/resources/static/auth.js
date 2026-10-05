const API_URL = "https://minicache-api.onrender.com";


// ======================================================
// EMAILJS
// ======================================================

(function () {

    emailjs.init({
        publicKey: "h2Lav4SdA_A_tQL7f"
    });

})();


// ======================================================
// PASSWORD VISIBILITY
// ======================================================

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
                isPassword
                    ? "text"
                    : "password";

            togglePassword.classList.toggle(
                "fa-eye"
            );

            togglePassword.classList.toggle(
                "fa-eye-slash"
            );

        }
    );
}


// ======================================================
// SIGNUP
// ======================================================

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


            // -------------------------------
            // VALIDATION
            // -------------------------------

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

                // ==================================================
                // REGISTER USER
                // ==================================================

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

                                username:
                                username,

                                email:
                                email,

                                password:
                                password

                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Registration response:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                    return;
                }


                // ==================================================
                // VERIFICATION TOKEN
                // ==================================================

                const verificationToken =
                    data.verificationToken;


                if (!verificationToken) {

                    console.error(
                        "Verification token missing from backend response.",
                        data
                    );

                    message.textContent =
                        "Account created, but verification token was not received.";

                    return;
                }


                // ==================================================
                // VERIFICATION LINK
                // ==================================================

                const verificationLink =
                    `${API_URL}/verify-email.html?token=${encodeURIComponent(
                        verificationToken
                    )}`;


                console.log(
                    "Verification link:",
                    verificationLink
                );


                // ==================================================
                // SEND VERIFICATION EMAIL
                // ==================================================

                message.textContent =
                    "Account created. Sending verification email...";


                await emailjs.send(
                    "service_om680x9",
                    "template_p8kbb3d",
                    {

                        name:
                        username,

                        email:
                        email,

                        verification_link:
                        verificationLink

                    }
                );


                // ==================================================
                // SUCCESS
                // ==================================================

                message.textContent =
                    "Registration successful! Verification email sent. Please check your inbox.";


                // Clear fields

                document.getElementById(
                    "signupUsername"
                ).value = "";


                document.getElementById(
                    "signupEmail"
                ).value = "";


                document.getElementById(
                    "signupPassword"
                ).value = "";


                // Redirect to login

                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    2000
                );


            } catch (error) {

                console.error(
                    "Registration / EmailJS error:",
                    error
                );


                message.textContent =
                    "Account was created, but the verification email could not be sent. Please check EmailJS configuration.";
            }

        }
    );
}


// ======================================================
// GO TO LOGIN
// ======================================================

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