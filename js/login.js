const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            loginMessage.textContent =
                data.error || "Error al iniciar sesión";

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
        );

        window.location.href =
            "index.html";

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            "No se pudo conectar con el servidor";

    }

});