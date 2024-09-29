$(document).ready(function () {
    var users = [];
    var airlines = [];
    var flights = [];
    var reservations = [];

    var selectedAirline = {
        "Name": "",
        "Adress": "",
        "ContactInfo": "",
        "Id": 0,
        "Flights": [],
        "Reviews": []
    }

    var selectedFlight = {
        "Airline": "",
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

    var selectedReservation = {
        "User": "",
        "FlightId": 0,
        "Id": 0,
        "PassengerNumbers": 0,
        "TotalPrice": 0,
        "IsDeleted": false,
        "Status": ""
    }

    var selectedReview = {
        "User": "",
        "Airline": "",
        "Title": "",
        "Description": "",
        "Id": 0,
        "ImagePath": "",
        "Status": ""
    }

    //UCITAVANJE KORISNIKA
    function loadUsers() {
        return $.ajax({
            url: '/api/users', // URL vašeg API-ja za dobijanje korisnika
            type: 'GET',
            success: function (data) {
                users = data; // Sačuvajte preuzete podatke u globalnu varijablu
                renderUsers(users); // Prikazuje korisnike
            },
            error: function () {
                console.error("Došlo je do greške prilikom učitavanja korisnika.");
            }
        });
    }
    //ISPIS KORISNIKA
    function renderUsers(data) {
        var usersListDiv = $('.users-list');
        usersListDiv.empty(); // Očistite listu pre dodavanja novih elemenata

        data.forEach(function (user) {
            var userHtml = `
                <div class="user-entity">
                    <img src="Photos/Icons/people.png" loading="lazy" alt="Slika u vidu ikone-vektora koja predstavlja osobu" class="image" />
                    <div class="text-block">${user.FirstName}</div>
                    <div class="text-block">${user.LastName}</div>
                    <img src="Photos/Icons/birthday.png" loading="lazy" alt="Slika u vidu ikone-vektora na kojoj je torta na stanici kalendara" class="image-2" />
                    <div>${user.BrthDay}</div>
                    <div class="text-block-4">korisničko ime: ${user.Username}</div>
                    <div class="text-block-5">${user.Email}</div>
                </div>
            `;
            usersListDiv.append(userHtml);
        });
        $('.text-block-19').text(data.length)
    }
    //SORTIRANJE KORISNIKA
    $('#name-sort').on('change', function () {
        var sortValue = $(this).val();
        var sortedUsers = users.slice(); // Kopirajte array da ne mijenjate original

        if (sortValue.includes('name')) {
            sortedUsers.sort(function (a, b) {
                var nameA = a.FirstName.toLowerCase();
                var nameB = b.FirstName.toLowerCase();
                return (sortValue === 'name-rastuce') ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
        } else if (sortValue.includes('bday')) {
            sortedUsers.sort(function (a, b) {
                // Preformatiranje datuma iz DD/MM/YYYY u YYYY-MM-DD
                var dateA = formatDateForSorting(a.BrthDay);
                var dateB = formatDateForSorting(b.BrthDay);
                return (sortValue === 'bday-rastuce') ? dateA - dateB : dateB - dateA;
            });
        }

        renderUsers(sortedUsers); // Ponovo renderujte korisnike sa sortiranim podacima
    });
    //FILTRIRANJE KORISNIKA
    $('#users-search').submit(function (event) {
        event.preventDefault(); // Sprečava standardno slanje forme
        var firstName = $('#users-search-first-name').val().toLowerCase();
        var lastName = $('#users-search-last-name').val().toLowerCase();
        var bdayAfter = $('#users-search-bdayafter').val();
        var bdayBefore = $('#users-search-bdaybefore').val();

        // Filtriranje korisnika na osnovu unetih kriterijuma
        var filteredUsers = users.filter(function (user) {
            var meetsFirstName = firstName ? user.FirstName.toLowerCase().includes(firstName) : true;
            var meetsLastName = lastName ? user.LastName.toLowerCase().includes(lastName) : true;
            var userBday = new Date(formatDateForSorting(user.BrthDay));
            var afterDate = bdayAfter ? new Date(bdayAfter) : new Date('1900-01-01');
            var beforeDate = bdayBefore ? new Date(bdayBefore) : new Date('2100-01-01');
            var meetsBdayAfter = userBday >= afterDate;
            var meetsBdayBefore = userBday <= beforeDate;

            return meetsFirstName && meetsLastName && meetsBdayAfter && meetsBdayBefore;
        });

        renderUsers(filteredUsers); // Prikaz filtriranih korisnika
    });


    //UCITAVANJE AVIKOMPANIJA
    function loadAirlines() {
        return $.ajax({
            url: '/api/getAviokompanije',
            type: 'GET',
            success: function (data) {
                renderAirlines(data);
                airlines = data;
                fillAirlineDropdown(airlines);

            },
            error: function () {
                console.error("Došlo je do greške prilikom učitavanja aviokompanija.");
            }
        });
    }
    //ISPIS AVIKOMPANIJA
    function renderAirlines(airlines) {
        var airlinesListDiv = $('.airlines-list');
        airlinesListDiv.empty(); // Čišćenje prethodnih unosa

        airlines.forEach(function (airline) {
            var airlineHtml = `
                <div class="airline-entity">
                <div id='airline-id'>${airline.Id}</div>
                    <div class="airline-entity-image">
                        <img src="Photos/Airlines/${airline.Name}.png" alt="Slika logo-a aviokompanije" class='airline-image'/>
                    </div>
                    <div class="airline-entity-info">
                        <div class="text-block-6" id='airline-name'>${airline.Name}</div>
                        <div class="airline-entity-contact-div">
                            <img src="Photos/Icons/phone.svg" alt="Slika telefonske slusalice u vidu ikone-vektora" />
                            <a href="tel:${airline.ContactInfo}" class="link" id='airline-phone'>${airline.ContactInfo}</a>
                        </div>
                        <div class="airline-entity-email-div">
                            <img src="Photos/Icons/email.svg" loading="lazy" alt="Slika u vidu ikonice-vektora postanskog pisma koje predstavlja email adresu" />
                            <a id='Address' href="mailto:${airline.Adress}" class="link">${airline.Adress}</a>
                        </div>
                    </div>
                </div>
            `;
            airlinesListDiv.append(airlineHtml); // Dodavanje novog HTML bloka za svaku aviokompaniju
        });
    }
    //FILTRIRANJE AVIKOMPANIJA
    $('#airlines-search').submit(function (event) {
        event.preventDefault(); // Sprečava standardno slanje forme

        var nameFilter = $('#airline-search-name').val().toLowerCase();
        var emailFilter = $('#airline-search-email').val().toLowerCase();
        var telFilter = $('#airline-search-tel').val().toLowerCase();

        var filteredAirlines = airlines.filter(function (airline) {
            var nameMatch = airline.Name.toLowerCase().includes(nameFilter);
            var emailMatch = airline.Adress.toLowerCase().includes(emailFilter);
            var telMatch = airline.ContactInfo.toLowerCase().includes(telFilter);
            return nameMatch && emailMatch && telMatch;
        });

        renderAirlines(filteredAirlines); // Ponovo prikazuje aviokompanije na osnovu filtriranih rezultata
    });

    //DODAVANJE AVIOKOMPANIJE
    $('#arlines-add').submit(function (event) {
        event.preventDefault(); // Sprečava standardno slanje forme

        var newAirline = {
            Name: $('#airline-add-name').val(),
            Adress: $('#airline-add-email').val(),
            ContactInfo: $('#airline-add-tel').val()
        };

        // Slanje podataka na server preko AJAX-a
        $.ajax({
            url: '/api/addAirline',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newAirline),
            success: function (response) {
                alert('Aviokompanija je uspešno dodata.');
                airlines.push(response); // Dodavanje nove aviokompanije u listu
                renderAirlines(airlines);
                location.reload();

            },
            error: function (xhr, status, error) {
                alert('Greška pri dodavanju aviokompanije: ' + xhr.responseText);
            }
        });
    });
    //SELEKTOVANJE AVIKOMPANIJE
    $('.airlines-list').on('click', '.airline-entity', function () {

        $('.airline-entity').removeClass('selected-airline');
        $(this).addClass('selected-airline');
        $('#delete-select-airline').show();
        $('#delete-select-airline').css('display', 'flex');

        // Uzimanje podataka iz selektovane aviokompanije
        let name = $(this).find('#airline-name').text();
        let email = $(this).find('#Address').attr('href').slice(7); // Uklanjanje 'mailto:' iz href atributa
        let tel = $(this).find('#airline-phone').text();
        let id = $(this).find('#airline-id').text();

        selectedAirline.Name = name;
        selectedAirline.Adress = email;
        selectedAirline.ContactInfo = tel;
        selectedAirline.Id = id;

        // Postavljanje vrednosti u formi za izmenu
        $('#arline-select-name').val(name);
        $('#airline-select-email').val(email);
        $('#airline-select-phone').val(tel);
    });
    //IZMENA AVIKOMPANIJE
    $('#airline-change').submit(function (event) {
        event.preventDefault(); // Sprečava standardno ponašanje forme

        // Uzimanje vrednosti iz formulara
        let name = $('#arline-select-name').val();
        let email = $('#airline-select-email').val();
        let tel = $('#airline-select-phone').val();

        var dataToSend = {
            Id: selectedAirline.Id,
            Name: name,
            Adress: email,
            ContactInfo: tel
        };

        $.ajax({
            url: '/api/updateAirline',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                alert('Aviokompanija je uspešno izmenjena.');
                location.reload();
            },
            error: function (xhr, status, error) {
                console.error('Došlo je do greške prilikom izmene aviokompanije: ' + error);
                alert('Greška prilikom izmene aviokompanije.');
            }
        });
    });
    //BRISANJE AVIKOMPANIJE
    $(document).on('click', '#delete-select-airline', function () {
        var airlineId = selectedAirline.Id; // Pretpostavljam da imate globalnu varijablu `selectedAirline` koja čuva trenutno izabranu aviokompaniju

        if (!airlineId) {
            alert('Nema izabrane aviokompanije za brisanje.');
            return;
        }

        if (confirm('Da li ste sigurni da želite da obrišete ovu aviokompaniju?')) {
            $.ajax({
                url: '/api/deleteAirline/' + airlineId,
                type: 'PUT',
                success: function (response) {
                    alert('Aviokompanija je uspešno obrisana.');
                    location.reload(); // Osvježava stranicu ili možete ručno ukloniti element iz liste
                },
                error: function (xhr) {
                    alert('Došlo je do greške prilikom brisanja aviokompanije: ' + xhr.responseText);
                }
            });
        }
    });



    //UCITAVANJE LETOVA
    function loadFlights() {
        return $.ajax({
            url: '/api/getFlights', // Endpoint za dobijanje svih letova
            type: 'GET',
            success: function (data) {
                renderFlights(data); // Renderovanje letova na stranici
                flights = data;
            },
            error: function () {
                console.error("Došlo je do greške prilikom učitavanja letova.");
            }
        });
    }
    //ISPISIVANJE LETOVA
    function renderFlights(flights) {
        var flightsListDiv = $('.flights-list');
        flightsListDiv.empty(); // Čišćenje liste letova pre dodavanja novih

        flights.forEach(function (flight) {
            var flightHtml = `
                <div class="flight-entity">
                <div id='flight-airline-hidden'>${flight.Airline}</div>
                <div id='flight-id-hidden'>${flight.Id}</div>
                    <div class="flight-image-div">
                        <img src="Photos/Airlines/${flight.Airline}.png" alt="Slika aviokompanije ${flight.Airline}" id='flight-image'/>
                    </div>
                    <div class="flight-info">
                        <div class="flight-destinations-textblock">${flight.InitDest} - ${flight.OutgoingDest}</div>
                        <div class="flight-date-div">
                            <img src="Photos/Icons/take-off.png" loading="lazy" alt="Slika avioka kako uzlece sa piste" class="image-3" />
                            <div class="flight-init-date-textblock">${flight.DepartureDate}</div>
                            <img src="Photos/Icons/landing.png" alt="Slika aviona kako slece na pistu" class="image-3" />
                            <div class="flight-outgoing-date-textblock">${flight.ArrivalDate}</div>
                        </div>
                        <div class="flight-free-seats-div">
                            <div>Slobodna mesta:</div>
                            <div class="flight-free-seats-number">${flight.FreeSeats}</div>
                        </div>
                        <div class="flight-status-div">
                            <div>Status: </div>
                            <div class="flight-status-textbock">${flight.Status}</div>
                        </div>
                        <div class="flight-piroce-textblock">
                            <div>Cena:</div>
                            <div class="flight-price">${flight.Price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
            flightsListDiv.append(flightHtml); // Dodavanje HTML bloka za svaki let
        });
    }
    //FILTRIRANJE LETOVA
    $('#flight-search').submit(function (event) {
        event.preventDefault(); // Sprečavanje standardnog slanja forme

        var initDest = $('#flight-search-init-destination').val().toLowerCase();
        var outDest = $('#flight-search-outgoing-dest').val().toLowerCase();
        var depDate = $('#flight-search-departure-date').val();
        var arrDate = $('#flight-search-arrival-date').val();

        // Filtriranje letova na osnovu unetih parametara
        var filteredFlights = flights.filter(function (flight) {
            return (initDest ? flight.InitDest.toLowerCase().includes(initDest) : true) &&
                (outDest ? flight.OutgoingDest.toLowerCase().includes(outDest) : true) &&
                (!depDate || new Date(flight.DepartureDate) >= new Date(depDate)) &&
                (!arrDate || new Date(flight.ArrivalDate) <= new Date(arrDate));
        });

        renderFlights(filteredFlights); // Prikaz filtriranih letova
    });
    //DODAVANJE MOGUCIH AVIKOMPANIJA ZA DODAVANJE LETA
    function fillAirlineDropdown(airlines) {
        var airlineDropdown = $('#flight-add-airline');
        var airlineDropdown2 = $('#flight-change-airline');
        airlineDropdown.empty(); // Čisti prethodne unose
        airlines.forEach(function (airline) {
            airlineDropdown.append($('<option>', {
                value: airline.Name,
                text: airline.Name
            }));
            airlineDropdown2.append($('<option>', {
                value: airline.Name,
                text: airline.Name
            }));
        });
    }
    //DODAVANJE LETA U AVIKOMPANIJU I LISTU LETOVA
    $('#flight-add').submit(function (event) {
        event.preventDefault();  // Zaustavlja standardno slanje forme

        var DepartureDate = formatDate($('#flight-add-departure-date').val());
        var ArrivalDate = formatDate($('#flight-add-arrival-date').val());
        // Podaci o letu iz forme
        var newFlight = {
            Airline: $('#flight-add-airline').val(), // Uzima ime aviokompanije direktno iz dropdown-a
            InitDest: $('#flight-add-init-destination').val(),
            OutgoingDest: $('#flight-add-outgoing-destination').val(),
            DepartureDate,
            ArrivalDate,
            TotalSeats: parseInt($('#flight-add-free-seats').val()), // Pretpostavljam da postoji polje za ukupan broj mesta
            FreeSeats: parseInt($('#flight-add-free-seats').val()), // Sva mesta su slobodna na početku
            Price: parseFloat($('#flight-add-price').val()),
            Status: "Aktivan" // Postavljanje statusa leta na "Aktivan"
        };

        // Slanje podataka na server preko AJAX-a
        $.ajax({
            url: '/api/addFlight',  // Pretpostavljamo da postoji endpoint /api/addFlight
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newFlight),
            success: function (response) {
                alert('Let je uspešno dodat.');
                location.reload();
            },
            error: function (xhr, status, error) {
                alert('Došlo je do greške pri dodavanju leta: ' + xhr.responseText);
            }
        });
    });
    //SELEKTOVANJE LETA
    $('.flights-list').on('click', '.flight-entity', function () {
        // Uklanjanje selekcije sa prethodno selektovanog leta
        $('.flight-entity').removeClass('selected-flight');
        $(this).addClass('selected-flight'); // Dodavanje klase za vizuelni prikaz selekcije
        $('#flight-change-delete-button').show();
        $('#change-button').show();

        // Uzimanje podataka iz selektovanog leta
        var selectedAirline = $(this).find('#flight-airline-hidden').text();
        var id = $(this).find('#flight-id-hidden').text();
        var departureDate = $(this).find('.flight-init-date-textblock').text();
        var arrivalDate = $(this).find('.flight-outgoing-date-textblock').text();
        var freeSeats = $(this).find('.flight-free-seats-number').text();
        var price = $(this).find('.flight-price').text();
        var status = $(this).find('.flight-status-textbock').text();

        selectedFlight.Airline = selectedAirline;
        selectedFlight.Id = id;
        selectedFlight.DepartureDate = departureDate;
        selectedFlight.ArrivalDate = arrivalDate;
        selectedFlight.FreeSeats = freeSeats;
        selectedFlight.Price = price;
        selectedFlight.Status = status;

        // Postavljanje vrednosti u formu za izmenu
        $('#flight-change-airline').val(selectedAirline); // Ovo pretpostavlja da su vrednosti u selectu imena aviokompanija
        $('#flight-change-departure-date').val(formatDateForInput(departureDate));
        $('#flight-change-arrival-date').val(formatDateForInput(arrivalDate));
        $('#flight-change-price').val(price);
        $('#flight-search-free-seats').val(freeSeats);
        $('#Status').val(status); // Ovde pretpostavljamo da su vrednosti u select-u 'zavrsen', 'otkazan', 'aktivan'
    });
    //IZMENA LETA
    $('#flight-change').submit(function (event) {
        event.preventDefault(); // Sprečava standardno slanje forme

        // Uzimanje vrednosti iz forme
        var updatedFlight = {
            Id: selectedFlight.Id,
            Airline: $('#flight-change-airline').val(),
            InitDest: selectedFlight.InitDest,
            OutgoingDest: selectedFlight.OutgoingDest,
            DepartureDate: formatDate($('#flight-change-departure-date').val()),
            ArrivalDate: formatDate($('#flight-change-arrival-date').val()),
            FreeSeats: parseInt($('#flight-search-free-seats').val()),
            Price: parseFloat($('#flight-change-price').val()),
            Status: $('#Status').val()
        };

        // Slanje izmenjenih podataka leta na server
        $.ajax({
            url: '/api/updateFlight',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedFlight),
            success: function (response) {
                alert('Let je uspešno izmenjen.');
                location.reload();  // Osvežava stranicu
            },
            error: function (xhr, status, error) {
                alert('Došlo je do greške prilikom izmene leta: ' + xhr.responseText);
            }
        });
    });
    //BRISANJE LETA
    $(document).on('click', '#flight-change-delete-button', function () {
        var flightId = selectedFlight.Id; // Pretpostavljam da selektovani let čuvaš u `selectedFlight`
        if (!flightId) {
            alert('Nije izabran let za brisanje.');
            return;
        }

        if (confirm('Da li ste sigurni da želite da obrišete ovaj let?')) {
            $.ajax({
                url: '/api/deleteFlight/' + flightId,
                type: 'PUT',
                success: function (response) {
                    alert('Let je uspešno obrisan.');
                    location.reload(); // Osvežava stranicu ili možete ručno ukloniti element iz liste
                },
                error: function (xhr) {
                    alert('Došlo je do greške prilikom brisanja leta: ' + xhr.responseText);
                }
            });
        }
    });

    //UCITAVANJE REZERVACIJA
    function loadReservations() {
        return $.ajax({
            url: '/api/getReservations', // Pretpostavka da postoji endpoint za dobijanje rezervacija
            type: 'GET',
            success: function (data) {
                data.forEach(function (reservation) {
                    if (reservation.Status === 'Kreirana') {
                        var flight = flights.find(f => f.Id === reservation.FlightId);
                        var user = users.find(u => u.Username === reservation.User);
                        reservation.UserEntity = user;
                        reservation.FlightEntity = flight;
                        reservations.push(reservation);
                    }
                });
                renderReservations(reservations);
            },
            error: function () {
                console.error("Došlo je do greške prilikom učitavanja rezervacija.");
            }
        });
    }
    //USPIS REZERVACIJA U ZADATU LISTU (DIV POLJE)
    function renderReservations(reservations) {
        var reservationsListDiv = $('.reservations-list');
        reservationsListDiv.empty(); // Očisti prethodne unose

        reservations.forEach(function (reservation) {
            if (reservation.Status === 'Kreirana') {
                var reservationHtml = `
                    <div class="reservation-entity">
                        <div class="user-name-div">
                            <div>Ime:</div>
                            <div class="text-block-13">${reservation.UserEntity.FirstName} ${reservation.UserEntity.LastName}</div>
                         </div>
                        <div class="user-username-div">
                            <div>Korisničko ime:</div>
                            <div class="text-block-13">${reservation.User}</div>
                        </div>
                        <div class="user-username-div">
                            <div>Id: </div>
                            <div class="text-block-13" id='reservation-id'>${reservation.Id}</div>
                        </div>
                        <div class="user-username-div">
                            <div>Reservation status </div>
                            <div class="text-block-13">${reservation.Status}</div>
                        </div>
                        <div class="reservation-flight">
                            <div class="reservation-image-flight-div">
                                <img src="Photos/Airlines/${reservation.FlightEntity.Airline}.png" loading="lazy" alt="Slika aviokompanije" class='reservation-airline-image'/>
                            </div>
                            <div class="reservation-flight-info">
                                <div class="reservation-destinations">${reservation.FlightEntity.InitDest} - ${reservation.FlightEntity.OutgoingDest}</div>
                                <div class="flight-date-div">
                                    <img src="Photos/Icons/take-off.png" alt="Slika aviona kako uzlece sa piste" class="airplane-image" />
                                    <div class="reservation-init-date">${reservation.FlightEntity.DepartureDate}</div>
                                    <img src="Photos/Icons/landing.png" alt="Slika aviona kako slece na pistu" class="image-3" />
                                    <div class="reservation-outgoing-date">${reservation.FlightEntity.ArrivalDate}</div>
                                </div>
                                <div class="flight-free-seats-div">
                                    <div>Slobodna mesta:</div>
                                    <div class="reservation-free-seats">${reservation.FlightEntity.FreeSeats}</div>
                                </div>
                                <div class="flight-status-div">
                                    <div>Status: </div>
                                    <div class="reservation-status">${reservation.FlightEntity.Status}</div>
                                </div>
                                <div class="flight-piroce-textblock">
                                    <div>Cena:</div>
                                    <div class="reservation-flight-price">${reservation.FlightEntity.Price.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                reservationsListDiv.append(reservationHtml); // Dodavanje HTML bloka za svaku rezervaciju
            }
        });
    }
    //OZNACAVANJE LISTE KLIKOM NA NJU
    $('.reservations-list').on('click', '.reservation-entity', function () {
        $('.reservation-entity').removeClass('selected-reservation');
        $(this).addClass('selected-reservation');

        $('.reservation-button-delete').show();
        $('.reservation-button-delete').css('display', 'flex');
        $('.reservation-button-delete').css('align-items', 'center');
        $('.reservation-button-approve').show();
        $('.reservation-button-approve').css('display', 'flex');
        $('.reservation-button-approve').css('align-items', 'center');

        selectedReservation.id = $(this).find('#reservation-id').text();

    });
    //OTKAZIVANJE REZERVACIJE
    $(document).on('click', '#cancel-reservation', function () {
        var reservationId = selectedReservation.id; // ID selektovane rezervacije

        if (!reservationId) {
            alert('Nije izabrana rezervacija za otkazivanje.');
            return;
        }

        if (confirm('Da li ste sigurni da želite da otkažete ovu rezervaciju?')) {
            $.ajax({
                url: '/api/cancelReservation/' + reservationId,
                type: 'PUT',
                success: function (response) {
                    alert('Rezervacija je uspešno otkazana.');
                    location.reload();
                },
                error: function (xhr) {
                    alert('Došlo je do greške prilikom otkazivanja rezervacije: ' + xhr.responseText);
                }
            });
        }
    });
    //ODOBRAVANJE REZERVACIJE
    $(document).on('click', '#approve-reservation', function () {
        var reservationId = selectedReservation.id;

        if (!reservationId) {
            alert('Nije izabrana rezervacija za odobravanje.');
            return;
        }

        $.ajax({
            url: '/api/approveReservation/' + reservationId,
            type: 'PUT',
            success: function (response) {
                alert('Rezervacija je uspešno odobrena.');
                location.reload();
            },
            error: function (xhr) {
                alert('Došlo je do greške prilikom odobravanja rezervacije: ' + xhr.responseText);
            }
        });

    });




    //
    function loadReviews() {
        return $.ajax({
            url: '/api/getReviews',
            type: 'GET',
            success: function (data) {
                renderReviews(data);
            },
            error: function () {
                console.error("Došlo je do greške prilikom učitavanja recenzija.");
            }
        });
    }

    function renderReviews(reviews) {
        var reviewsListDiv = $('.reviews-list');
        reviewsListDiv.empty(); // Čišćenje liste pre dodavanja novih elemenata

        reviews.forEach(function (review) {
            var reviewHtml = `
            <div class="review-entity">
            <div id='id-review-hidden'>${review.Id}</div>
                <div class="review-user-div">
                    <div>Ime:</div>
                    <div class="text-block-16">${review.User}</div>
                </div>
                <div class="review-airline-div">
                    <div class="review-airline-image-div">
                        <img src="Photos/Airlines/${review.Airline}.png" loading="lazy" alt="Slika aviokomapnije" class="image-4" />
                    </div>
                    <div class="review-airline-name-div">
                        <div>Za aviokompaniju:</div>
                        <div class="text-block-18">${review.Airline}</div>
                    </div>
                </div>
                <div class="review-info-div">
                    <div class="review-title-description-div">
                        <div class="text-block-17">${review.Title}</div>
                        <p>${review.Description}</p>
                    </div>
                    <div class="review-image-div">
                        <img src="${review.ImagePath}" loading="lazy" alt="Slika recenzije koju je dodao kreator recenzije" />
                    </div>
                </div>
                <div class="review-status-div">
                    <div>Status:</div>
                    <div class="review-status">${review.Status}</div>
                </div>
            </div>
        `;
            reviewsListDiv.append(reviewHtml);
        });
    }
    //OZNACAVANJE SELEKTOVANE RECENZIJE

    $(document).on('click', '.review-entity', function () {
        // Uklanjanje klase 'selected-review' sa svih recenzija
        $('.review-entity').removeClass('selected-review');

        // Dodavanje klase 'selected-review' na kliknutu recenziju
        $(this).addClass('selected-review');

        $('.review-button-delete').show();
        $('.review-button-delete').css('display', 'flex');
        $('.review-button-delete').css('align-items', 'center');
        $('.review-button-approve').show();
        $('.review-button-approve').css('display', 'flex');
        $('.review-button-approve').css('align-items', 'center');

        selectedReview.Id = $(this).find('#id-review-hidden').text();
    });
    //OTKAZIVANJE RECENZIJE
    $(document).on('click', '#cancel-review', function () {
        var reviewId = selectedReview.Id;

        if (!reviewId) {
            alert("ID recenzije nije dostupan.");
            return;
        }

        if (confirm('Da li ste sigurni da želite da obrišete ovu recenziju?')) {
            // Slanje AJAX zahteva za brisanje recenzije
            $.ajax({
                url: '/api/review/cancel/' + reviewId, // Pretpostavka za endpoint
                type: 'PUT',
                success: function (response) {
                    alert('Recenzija je uspešno obrisana.');
                    location.reload(); // Osvežava stranicu ili možete ažurirati samo deo stranice koji prikazuje recenzije
                },
                error: function (xhr) {
                    alert('Došlo je do greške prilikom brisanja recenzije: ' + xhr.responseText);
                }
            });
        }
    });

    $(document).on('click', '#approve-review', function () {
        var reviewId = selectedReview.Id;

        if (!reviewId) {
            alert("ID recenzije nije dostupan.");
            return;
        }

        $.ajax({
            url: '/api/review/approve/' + reviewId, 
            type: 'PUT',
            success: function (response) {
                alert('Recenzija je uspešno odobrena.');
                location.reload(); 
            },
            error: function (xhr) {
                alert('Došlo je do greške prilikom odobravanja recenzije: ' + xhr.responseText);
            }
        });

    });






    // Funkcija za formatiranje datuma iz dd/mm/yyyy hh:mm u yyyy-mm-ddThh:mm format za input datetime-local
    function formatDateForInput(dateStr) {
        var parts = dateStr.split(' ');
        var dateParts = parts[0].split('/');
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1]}`;
    }




    function formatDate(dateStr) {
        var date = new Date(dateStr);
        var day = ('0' + date.getDate()).slice(-2); // Dodaje nulu ako je potrebno
        var month = ('0' + (date.getMonth() + 1)).slice(-2); // Dodaje nulu ako je potrebno, mjeseci su 0-based
        var year = date.getFullYear();
        var hours = ('0' + date.getHours()).slice(-2);
        var minutes = ('0' + date.getMinutes()).slice(-2);
        return `${day}/${month}/${year} ${hours}:${minutes}`; // Vraća string u formatu "dd/mm/yyyy hh:mm"
    }
    function formatDateForSorting(dateStr) {
        var parts = dateStr.split('/'); // Deli string na DD, MM, YYYY
        return new Date(parts[2], parts[1] - 1, parts[0]); // Kreira novi Date objekat u formatu YYYY, MM, DD
    }

    //Dodavanje imena i prezimena u odobravanje rezervacija <div class="user-name-div"><div>Ime:</div><div class="text-block-13">${reservation.User}</div></div >

    $(document).ready(function () {
        loadUsers()
            .then(loadAirlines)
            .then(loadFlights)
            .then(function () {
                return loadReviews();
            })
            .then(function () {
                return loadReservations();
            })
            .catch(function (error) {
                console.error('Došlo je do greške prilikom učitavanja podataka:', error);
            });
    });

});

