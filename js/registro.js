const registroForm =
    document.getElementById("registroForm");

const registroMessage =
    document.getElementById("registroMessage");

registroForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nombre =
        document.getElementById("nombre").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const passwordConfirm =
        document.getElementById("passwordConfirm").value;

    if (password !== passwordConfirm) {

        registroMessage.textContent =
            "Las contraseñas no coinciden";

        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/auth/registro",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre,
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            registroMessage.textContent =
                data.error || "Error al crear la cuenta";

            return;
        }

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(error);

        registroMessage.textContent =
            "No se pudo conectar con el servidor";

    }

});