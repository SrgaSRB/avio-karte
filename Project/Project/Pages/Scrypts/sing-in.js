$(document).ready(function () {

    //PRAVLJENJE NOVOG KORISNICKOG NALOGA
    $('#sing-in-form').submit(function (event) {
        event.preventDefault();  

        var username = $('#username').val();

        //PROVERA DA LI POSTOJI KORISNIK SA UNETIM KORISNICKIM IMENOM
        $.ajax({
            url: '/api/user/exists/' + username,
            type: 'GET',
            success: function (exists) {
                if (exists) {
                    alert('Korisničko ime već postoji, molimo izaberite drugo.');
                } else {
                    submitForm();  
                }
            },
            error: function () {
                alert('Došlo je do greške prilikom provere korisničkog imena.');
            }
        });
    });

    function submitForm() {
        var rawDate = $('#bday').val();  // Uzmi sirovu vrednost iz input polja za datum
        var dateParts = rawDate.split('-');  // Podeli datum na delove YYYY, MM, DD
        var formattedDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

        var formData = {
            Username: $('#username').val(),
            Password: $('#password').val(),
            FirstName: $('#first-name').val(),
            LastName: $('#last-name').val(),
            Email: $('#email').val(),
            BrthDay: formattedDate,
            Gender: $('#sex').val()
        };

        $.ajax({
            url: '/api/user/create',  
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Nalog je uspešno kreiran.');
                window.location.href = '/Pages/login.html';  
            },
            error: function (xhr) {
                alert('Greška pri kreiranju naloga: ' + xhr.responseText);
            }
        });
    }


});



