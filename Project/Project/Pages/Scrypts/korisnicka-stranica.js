$(document).ready(function () {

    var loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    var username = JSON.parse(sessionStorage.getItem('loggedInUser')).Username;

    var selectFlight = {
        "AirLine": "",
        "Id": 0,
        "InitDest": "",
        "OutgoingDest": "",
        "DepartureDate": "",
        "ArrivalDate": "",
        "FreeSeats": 0,
        "OccupatedSeats": 0,
        "TotalSeats": 0,
        "Price": 0,
        "Status": ""
    }

    var selectReservation = {
        "User": "",
        "FlightId": 0,
        "PassengerNumbers": 0,
        "TotalPrice": 0,
        "Status": "",
        Id: 0
    }

    review = {
        "User": "",
        "Airline": "",
        "Title": "",
        "Description": "",
        "ImagePath": "",
        "Status": "",
        "Id": 0,
    }

    $('.logout-button').on('click', function (event) {
        event.preventDefault(); // Sprečava default akciju za link

        // Uklanja korisnika iz sessionStorage
        sessionStorage.removeItem('loggedInUser');

        // Preusmerava na stranicu za prijavu
        window.location.href = 'login.html';
    });

    //POPUNJAVANJE PODATAKA O KORISKINU, AKO JE ADMIN DODAJ NAPREDNA/ADMINSKA PODESAVANJE 
    if (loggedInUser) {
        $('#user-profile-settings-name').val(loggedInUser.FirstName);
        $('#user-profile-settings-last-name').val(loggedInUser.LastName);
        $('#user-profile-settings-username').val(loggedInUser.Username);
        $('#user-profile-settings-email').val(loggedInUser.Email);
        $('#user-profile-settings-dbay').val(loggedInUser.BrthDay);
        if (loggedInUser.Gender === "M") {
            $('#user-profile-settings-sex').append('<option value="M" selected>Muški</option>');
            $('#user-profile-settings-sex').append('<option value="Z">Ženski</option>');
        } else if (loggedInUser.Gender === "Z") {
            $('#user-profile-settings-sex').append('<option value="M">Muški</option>');
            $('#user-profile-settings-sex').append('<option value="Z" selected>Ženski</option>');
        } else {
            $('#user-profile-settings-sex').append('<option value="" selected>Odaberite pol</option>');
            $('#user-profile-settings-sex').append('<option value="M">Muški</option>');
            $('#user-profile-settings-sex').append('<option value="Z">Ženski</option>');
        }

        if (loggedInUser.IsAdmin) {
            $('#user-profile-settings-usertype').append('<option value="admin">Admin</option>');
        } else {
            $('#user-profile-settings-usertype').append('<option value="user">Korisnik</option>');
        }

        $("#user-profile-settings").submit(function (event) {
            event.preventDefault(); // Sprečava standardno ponašanje submit dugmeta

            // Preuzmi podatke iz forme
            var updatedUser = {
                Username: $("#user-profile-settings-username").val(),
                FirstName: $("#user-profile-settings-name").val(),
                LastName: $("#user-profile-settings-last-name").val(),
                Email: $("#user-profile-settings-email").val(),
                BrthDay: $("#user-profile-settings-dbay").val(),
                Gender: $("#user-profile-settings-sex").val(),
                IsAdmin: sessionStorage.getItem('loggedInUser') ? JSON.parse(sessionStorage.getItem('loggedInUser')).IsAdmin : false // preuzmi iz sessionStorage
            };

            // Pošalji podatke na backend
            $.ajax({
                type: "POST",
                url: "/api/updateUser",
                data: JSON.stringify(updatedUser),
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    alert("Profil uspešno izmenjen.");
                    // Ažuriraj sessionStorage sa novim podacima
                    sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
                },
                error: function (xhr, status, error) {
                    console.error("Greška prilikom izmene profila: ", xhr.responseText);
                    alert("Došlo je do greške prilikom izmene profila.");
                }
            });
        });

        //ADMINSKA PODESAVANJA
        $(document).ready(function () {

            if (loggedInUser && loggedInUser.IsAdmin) {
                loadAdminSettingsPage();
            }
        });


        //UCITAVANJE LISTE REZERVACIJA
        $.ajax({
            type: "GET",
            url: "/api/userReservations",
            data: { username: username },
            success: function (reservations) {
                var listDiv = $('.airline-flights-list-div');
                listDiv.empty();

                //ISPIS REZERVACIJA
                reservations.forEach(function (item) {
                    var reservation = item.Reservation;
                    var flight = item.Flight;

                    var reservationDiv = `
                <div class='airline-flights-list-entity'>
                    <div id="reservation-flight-name-hidden">${flight.Airline}</div>
                    <div id='flight-id'>#${flight.Id}</div>
                    <div class='airline-flights-list-entity-information'>
                        <div class='airline-flights-list-entity-destinations'>
                            <div class='init-destination'>${flight.InitDest}</div>
                            <div class='dash'>-</div>
                            <div class='outgoing-dest'>${flight.OutgoingDest}</div>
                            <img loading='lazy' src='' alt='' class='airplane-image' />
                        </div>
                        <div class='airline-flights-list-entity-date-div'>
                            <div class='departure-date-div'>
                                <img loading='lazy' src='Photos/Icons/take-off.png' alt='' class='airplane-image' />
                                <div class='flight-date-textblock'>${flight.DepartureDate}</div>
                            </div>
                            <div class='arrival-date-div'>
                                <img loading='lazy' src='Photos/Icons/landing_icon.png' alt='' class='airplane-image' />
                                <div class='flight-date-textblock'>${flight.ArrivalDate}</div>
                            </div>
                        </div>
                        <div class='airline-flights-list-entity-freeseats-div'>
                            <div class='free-seats-textblock'>Slobodna mesta :</div>
                            <div class='free-seats-number'>${flight.FreeSeats}</div>
                        </div>
                        <div class='airline-flights-list-entity-status-div'>
                            <div class='flight-statis-textblock'>Status leta: </div>
                            <div class='flight-status' id='flight-status'>${flight.Status}</div>
                        </div>
                        <div class='airline-flights-list-entity-status-div'>
                            <div class='flight-statis-textblock'>Status rezervacije: </div>
                            <div class='flight-status' id="reservation-status">${reservation.Status}</div>
                        </div>
                        <div class='airline-flights-list-entity-status-div'>
                            <div class='flight-statis-textblock'>Zauzeto mesta: </div>
                            <div class='flight-status' id='reservation-passenger-numbers'>${reservation.PassengerNumbers}</div>
                        </div>
                        <div class='airline-flights-list-entity-status-div'>
                            <div class='flight-statis-textblock'>Id rezervacije: </div>
                            <div class='flight-status' id='reservation-id'>${reservation.Id}</div>
                        </div>
                        <div class='airline-flights-list-entity-price-div'>
                            <div class='price-textblock'>Cena:</div>
                            <div class='price-number'>${flight.Price}</div>
                        </div>
                    </div>
                </div>`;
                    listDiv.append(reservationDiv);
                });

                //OZNACAVANJE REZERVACIJE
                $(document).on('click', '.airline-flights-list-entity', function () {

                    $('#reservation-button').hide();
                    $('#review-create-form').hide();

                    var departureDateString = $(this).find('.departure-date-div .flight-date-textblock').text();
                    var dateParts = departureDateString.split(' ');
                    var date = dateParts[0].split('/');
                    var time = dateParts[1].split(':');
                    var formattedDateString = `${date[2]}-${date[1]}-${date[0]}T${time[0]}:${time[1]}`;
                    var departureDate = new Date(formattedDateString);
                    var currentDate = new Date();
                    var nextDay = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)); // Trenutno vreme plus 24 sata

                    let flightStatus = $(this).find('#flight-status').text();
                    let reservationStatus = $(this).find('#reservation-status').text();

                    if (flightStatus === "Završen") {
                        $('#reservation-button').hide();
                        $('#review-create-form').show();
                        $('#review-create-form').css('display', 'flex');
                    } else if (departureDate > nextDay && (reservationStatus === "Kreirana" || reservationStatus === "Odobrena")) {
                        $('#reservation-button').show();
                        $('#review-create-form').hide();
                    } else {
                        return
                    }


                    $(".airline-flights-list-entity").removeClass("selected-flight");
                    $(this).addClass("selected-flight");

                    selectFlight.Id = $(this).find('#flight-id').text();
                    selectFlight.AirLine = $('#reservation-flight-name-hidden').text();
                    selectReservation.PassengerNumbers = $(this).find('#reservation-passenger-numbers').text();;
                    selectReservation.Id = $(this).find('#reservation-id').text();


                });

                //PRAVLJENJE RECENZIJE
                $('#review-create-form').submit(function (e) {
                    e.preventDefault();  // Sprečava standardno slanje forme

                    var formData = new FormData(this); // Kreiranje FormData objekta sa podacima forme

                    let title = $('#review-title').val();
                    let description = $('#review-description').val();

                    // Dodavanje dodatnih informacija o recenziji
                    formData.append('User', loggedInUser.FirstName); // Primer kako dodati korisnika
                    formData.append('Airline', selectFlight.AirLine);
                    formData.append('Status', 'Kreirana');
                    formData.append('Description', description);
                    formData.append('Title', title);

                    // Ovo pretpostavlja da imate učitani id za sledeću recenziju ili ga server generiše
                    // formData.append('Id', nextReviewId); // Ovo bi trebalo server da postavlja ako nije već postavljeno

                    $.ajax({
                        url: '/api/review/createWithImage',  // API endpoint
                        type: 'POST',
                        data: formData,
                        contentType: false, // Nemojte postavljati content type header
                        processData: false, // Nemojte procesirati podatke kao string
                        success: function (response) {
                            alert('Recenzija je uspešno kreirana.');
                            // Opcionalno: Preusmeravanje ili osvežavanje stranice
                        },
                        error: function (xhr) {
                            alert('Greška pri kreiranju recenzije: ' + xhr.responseText);
                        }
                    });
                });


                //UKLANJANJE REZERVACIJE
                $(document).on('click', '#reservation-button', function () {

                    var dataToSend = {
                        flightID: selectFlight.Id,
                        seatsNumber: selectReservation.PassengerNumbers,
                        username: loggedInUser.Username,
                        reservationId: selectReservation.Id
                    };

                    $.ajax({
                        url: '/api/cancelReservation',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(dataToSend),
                        success: function (response) {
                            console.log('Rezervacija uspešno otkazana');
                            alert('Rezervacija je uspešno otkazana.');
                            window.location.reload();

                        },
                        error: function (xhr, status, error) {
                            console.error('Došlo je do greške prilikom otkazivanja rezervacije: ' + error);
                            alert('Greška prilikom otkazivanja rezervacije.');
                        }
                    });
                });

                //SORTIRANJE REZERVACIJA
                $(document).ready(function () {
                    $('#status-filter').change(function () {
                        var selectedStatus = $(this).val();
                        $('.airline-flights-list-entity').each(function () {
                            var reservationStatus = $(this).find('#reservation-status').text();
                            if (selectedStatus === 'Svi' || reservationStatus === selectedStatus) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                        });
                    });
                });



            },
            error: function (err) {
                console.error('Error loading reservations:', err);
            }
        });

        function loadAdminSettingsPage() {
            $.ajax({
                url: 'admin-settings.html',
                type: 'GET',
                success: function (response) {
                    $('body').append(response);
                },
                error: function () {
                    console.error('Nije moguće učitati stranicu za administraciju.');
                }
            });
        }

    } else {
        window.location = '/Pages/index.html';
    }
});
