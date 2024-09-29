$(document).ready(function () {
    var loggedInUser = sessionStorage.getItem('loggedInUser');

    if (loggedInUser) {
        var loginLink = document.getElementById("login-link");
        if (loginLink) {
            loginLink.textContent = "Korisnički nalog";
            loginLink.href = "korisnicka-stranica.html";
        }
    } else {
        loginLink.textContent = "Prijava";
        loginLink.href = "login.html";
    }
});