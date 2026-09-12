document.addEventListener("DOMContentLoaded", () => {
    const demoButton = document.querySelector(".demo-button");
    const loginButton = document.querySelector(".login-button");

    demoButton?.addEventListener("click", () => {
        document.querySelector("#como-funciona")?.scrollIntoView({
            behavior: "smooth"
        });
    });

    loginButton?.addEventListener("click", () => {
        window.location.href = "app/index.html";
    });
});