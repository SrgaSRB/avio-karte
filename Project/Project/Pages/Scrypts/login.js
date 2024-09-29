$(document).ready(function () {

    //LOGOVANJE KORISKINA -> PROVERA DA LI POSTOJI KORISNIK SA UNETIM KORISNICKIM IMENOM I LOZINKOM
    $("#login-in-form").submit(function (event) {
        event.preventDefault(); 

        var username = $("#username").val();
        var password = $("#password").val();

        var loginData = {
            Username: username,
            Password: password
        };


        $.ajax({
            type: "POST",
            url: "/api/login",
            data: JSON.stringify(loginData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log("Login successful!", response);
                sessionStorage.setItem('loggedInUser', JSON.stringify(response));
                window.location = '/Pages/index.html';
            },
            error: function (xhr, status, error) {
                console.error("Login failed: ", xhr.responseText);
                alert("Pogrešno korisničko ime ili lozinka.");
            }
        });
    });
});
