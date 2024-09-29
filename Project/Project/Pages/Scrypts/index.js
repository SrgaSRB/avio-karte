$(document).ready(function () {

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

    var allFlights = []
    var allallFlights = []
    var shownFlights = []

    var loggedInUser = sessionStorage.getItem('loggedInUser');

    loadFlights();



    //UCITAVANJE LETOVA
    function loadFlights() {

        if (loggedInUser) {
            $('#flight-status').show();
            $('#status-label').show();
        } else {
            $("#flight-status").hide();
            $("#status-label").hide();
        }
        $.ajax({
            url: '/api/getFlights',
            method: 'GET',
            success: function (response) {
                console.log(response);

                let flightsList = []
                $.each(response, function (index, flight) {
                    if (flight.Status === "Aktivan") {
                        console.log(flight);
                        flightsList.push(flight);
                    }
                    allallFlights.push(flight);

                });

                loggedInUser = JSON.parse(loggedInUser); // Pretvaranje JSON stringa iz sessionStorage-a u objekat

                if (loggedInUser && loggedInUser.Reservations) {

                    let userReservations = loggedInUser.Reservations;

                    let userFlightIds = userReservations.map(res => res.FlightId);



                    let filteredFlights = allallFlights.filter(flight =>
                        (flight.Status === 'Završen' || flight.Status === 'Otkazan') && userFlightIds.includes(flight.Id)
                    );
                    //Na kraj liste samo aktivnih letova dodajem letova od datog korisnika koji si Zavrseni/Otkazani
                    allFlights = flightsList.concat(filteredFlights);
                    printFlights(allFlights);

                } else {
                    allFlights = flightsList;
                    printFlights(flightsList);
                }



            },
            error: function (xhr, status, error) {
                console.error("Došlo je do greške prilikom učitavanja fajla: ", error);
            }
        });
    }

    //ISPIS LETOVA
    function printFlights(flights) {

        var flightsDiv = $('#flights');
        flightsDiv.empty();

        destinationsFilling();
        shownFlights = flights;

        if (flights.length === 0) {
            flightsDiv.append('<div class="no-flights">Trenutno nema dostupnih letova za prikaz.</div>');
            $('.text-block').text('0');
        } else {
            flights.forEach(function (flight) {
                var flightDiv = `<div class="flight-div">
                <div class="flight-id">#${flight.Id}</div>
                <div class="flight-airline-hidden">${flight.Airline}</div>
                <div class="airline-list-image-div">
                    <img src="Photos/Airlines/${flight.Airline}.png" loading="lazy" alt=""/>
                </div>
                <div class="flight-information-div">
                    <div class="destinations-div">
                        <div class="init-destination">${flight.InitDest}</div>
                        <div class="dash">-</div>
                        <div class="outgoing-dest">${flight.OutgoingDest}</div>
                    </div>
                    <div class="date-times-div">
                        <div class="departure-date-div">
                            <img src="Photos/Icons/take-off.png" loading="lazy" alt="" class="airplane-image"/>
                            <div class="flight-date-textblock">${flight.DepartureDate}</div>
                        </div>
                        <div class="arrival-date-div">
                            <img src="Photos/Icons/landing_icon.png" loading="lazy" alt="" class="airplane-image"/>
                            <div class="flight-date-textblock">${flight.ArrivalDate}</div>
                        </div>
                    </div>
                    <div class="free-seats-div">
                        <div class="free-seats-textblock">Slobodna mesta:</div>
                        <div class="free-seats-number">${flight.FreeSeats}</div>
                        <div class="free-seats-textblock" id="total-seats">/${flight.TotalSeats}</div>
                        <div class="free-seats-textblock" id="occupated-seats">${flight.OccupatedSeats}</div>
                    </div>
                    <div class="airline-flights-list-entity-status-div">
                        <div class="flight-statis-textblock">Status leta: </div>
                        <div class="flight-status">${flight.Status}</div>
                    </div>
                    <div class="price-div">
                        <div class="price-textblock">Cena: <br/></div>
                        <div class="price-number">${flight.Price}<br/></div>
                    </div>
                </div>
                <a href="avio-kompanije.html#${flight.Airline}-reviews" class="link-3">Više o aviokompaniji &gt;&gt;</a>
            </div>`;
                flightsDiv.append(flightDiv);
            });
            $('.text-block').text(flights.length); // Ažuriramo broj prikazanih letova
        }

    }

    //POPUNJAVANJE DROPDOWN POLJA SA MOGICIM IZBORIMA
    function destinationsFilling() {
        var polazneDestinacije = [];
        var odredisneDestinacije = [];
        var statusLista = [];

        $.each(allFlights, function (index, flight) {
            // Dodaj polaznu destinaciju ako nije već u listi
            if (!polazneDestinacije.includes(flight.InitDest)) {
                polazneDestinacije.push(flight.InitDest);
            }

            // Dodaj odredišnu destinaciju ako nije već u listi
            if (!odredisneDestinacije.includes(flight.OutgoingDest)) {
                odredisneDestinacije.push(flight.OutgoingDest);
            }
            if (!statusLista.includes(flight.Status)) {
                statusLista.push(flight.Status);
            }
        });

        var initDestinationSelect = $("#init-destination").empty();
        initDestinationSelect.append($('<option>', {
            value: "",
            text: "Svi gradovi"
        }));
        $.each(polazneDestinacije, function (index, value) {
            initDestinationSelect.append($('<option>', {
                value: value,
                text: value
            }));
        });

        var outgoingDestSelect = $("#outgoing-dest").empty();
        outgoingDestSelect.append($('<option>', {
            value: "",
            text: "Svi gradovi"
        }));
        $.each(odredisneDestinacije, function (index, value) {
            outgoingDestSelect.append($('<option>', {
                value: value,
                text: value
            }));
        });

        var statusSelect = $("#flight-status").empty();
        statusSelect.append($('<option>', {
            value: "Svi letovi",
            text: "Svi letovi"
        }));
        $.each(statusLista, function (index, value) {
            statusSelect.append($('<option>', {
                value: value,
                text: value
            }));
        });
    }

    //SORTIRANJE LETOVA PO CENI
    $('#sort-select').change(function () {
        var sortOrder = $(this).val();
        var sortedFlights = shownFlights.slice();
        sortedFlights.sort(function (a, b) {
            if (sortOrder === "Rastuce") {
                return a.Price - b.Price; // Rastuće
            } else if (sortOrder === "Opadajuce") {
                return b.Price - a.Price; // Opadajuće
            }
        });
        printFlights(sortedFlights);
    });

    //FILTRIRANJE LETOVA
    $('#filter-form').submit(function (event) {
        event.preventDefault(); // Sprečavanje slanja forme

        // Dobijanje vrednosti filtera
        var initDestination = $('#init-destination').val();
        var outgoingDest = $('#outgoing-dest').val();
        var departureDate = formatDateSelect($("input[type='datetime-local']").eq(0).val());
        var arrivalDate = formatDateSelect($("input[type='datetime-local']").eq(1).val());
        var flightStatus = $('#flight-status').val(); // Dobijanje statusa leta iz select-a


        // Filtriranje letova
        var filteredFlights = allFlights.filter(function (flight) {
            var flightDepartureDate = formatDate(flight.DepartureDate);
            var flightArrivalDate = formatDate(flight.ArrivalDate);

            return (initDestination === "" || flight.InitDest === initDestination) &&
                (outgoingDest === "" || flight.OutgoingDest === outgoingDest) &&
                (!departureDate || flightDepartureDate >= departureDate) &&
                (!arrivalDate || flightArrivalDate <= arrivalDate) &&
                (flightStatus === 'Svi letovi' || flight.Status === flightStatus);
        });

        function formatDate(dateString) {
            if (!dateString) return null;

            // Parsiranje stringa u formatu dd/mm/yyyy hh:mm
            var [datePart, timePart] = dateString.split(' ');
            var [day, month, year] = datePart.split('/');
            var [hours, minutes] = timePart.split(':');

            // Kreiranje Date objekta
            var date = new Date(year, month - 1, day, hours, minutes);

            // Formatiranje datuma u željeni format
            var formattedDay = String(date.getDate()).padStart(2, '0');
            var formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
            var formattedYear = date.getFullYear().toString();
            var formattedHours = String(date.getHours()).padStart(2, '0');
            var formattedMinutes = String(date.getMinutes()).padStart(2, '0');

            return `${formattedDay}/${formattedMonth}/${formattedYear} ${formattedHours}:${formattedMinutes}`;
        }

        function formatDateSelect(dateString) {
            if (!dateString) return null;
            var parts = dateString.split('T');
            var dateParts = parts[0].split('-');
            var timeParts = parts[1].split(':');

            var year = dateParts[0];
            var month = dateParts[1];
            var day = dateParts[2];
            var hours = timeParts[0];
            var minutes = timeParts[1];

            var date = new Date(year, month, day, hours, minutes);
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        // Prikaz filtriranih letova
        printFlights(filteredFlights);
    });

    //OZNACAVANJE SELEKTOVANOG LETA
    $(document).on('click', '.flight-div', function () {
        // Ukloni prethodnu selekciju
        $(".flight-div").removeClass("selected-flight");

        if ($(this).find(".flight-status").text().trim() != "Aktivan")
            return

        // Obeleži selektovani div
        $(this).addClass("selected-flight");


        // Preuzmi podatke iz selektovanog leta
        selectFlight.AirLine = $(this).find(".flight-airline-hidden").text().trim();
        selectFlight.Id = $(this).find(".flight-id").text().trim().replace("#", "");
        selectFlight.InitDest = $(this).find(".init-destination").text().trim();
        selectFlight.OutgoingDest = $(this).find(".outgoing-dest").text().trim();
        selectFlight.DepartureDate = $(this).find(".departure-date-div .flight-date-textblock").text().trim();
        selectFlight.ArrivalDate = $(this).find(".arrival-date-div .flight-date-textblock").text().trim();
        selectFlight.FreeSeats = parseInt($(this).find(".free-seats-number").text().trim());
        selectFlight.OccupatedSeats = $(this).find("#occupated-seats").text().trim();
        selectFlight.TotalSeats = parseInt(selectFlight.FreeSeats) + parseInt(selectFlight.OccupatedSeats);
        selectFlight.Price = parseFloat($(this).find(".price-number").text().trim());
        selectFlight.Status = $(this).find(".flight-status").text().trim();

        var seatsNumber = $("#seats-number").val();

        $("#select-flight-dest").text(selectFlight.InitDest + " - " + selectFlight.OutgoingDest);
        $("#select-flight-id").text(selectFlight.Id);
        $(".select-flight-price-textbox").text("Cena: " + selectFlight.Price * seatsNumber + " RSD");
        console.log(selectFlight)

        validateSeatsNumber(seatsNumber, selectFlight.FreeSeats);

    });

    //PROMENA CENE PRI PROMENI BROJA SEDISTA
    $("#seats-number").on("input", function () {
        // Dobijanje vrednosti broja sedišta direktno kroz jQuery
        var seatsNumber = $(this).val();

        console.log(seatsNumber);
        var price = $(this).find(".price-number").text().trim();
        $(".select-flight-price-textbox").text("Cena: " + selectFlight.Price * seatsNumber + " RSD");

        validateSeatsNumber(seatsNumber, selectFlight.FreeSeats);

    });

    //PROMENA DOZVOLE SA SUBMIT ZA REZERVACIJU LETA
    function validateSeatsNumber(seatsNumber, freeSeats) {
        var reservationButton = $(".submit-button-3");

        if (seatsNumber > freeSeats || seatsNumber <= 0) {
            reservationButton.css("background-color", "red");
            reservationButton.prop("disabled", true);
        } else {
            reservationButton.css("background-color", "");
            reservationButton.prop("disabled", false);
        }
    }

    //REZERVACIJA LETA
    $('#reservation-flight').submit(function (event) {

        if (!loggedInUser) {
            window.location = '/Pages/login.html';
            alert('Molimo vas da se prijavite pre nego što napravite rezervaciju.');
            return;
        }
        event.preventDefault();
        var passengerNumbers = $('#seats-number').val();

        if (!(passengerNumbers > 0)) {
            alert("Niste izabrali let ili sedista")
            return;
        }
        let userString = sessionStorage.getItem('loggedInUser');

        // Zatim, pretvarate taj string u objekat
        let user = JSON.parse(userString);

        // Sada možete pristupiti Username i ostalim svojstvima
        let username = user.Username;

        $.ajax({
            type: "POST",
            url: "/api/makeReservation",
            contentType: "application/json", // Important: Add this line
            data: JSON.stringify({
                Flight: selectFlight,
                PassengerCount: parseInt(passengerNumbers),
                Username: username
            }),
            success: function (data) {
                alert('Rezervacija uspešno kreirana!');
                window.location.reload();

            },
            error: function (xhr, status, error) {
                alert('Greška pri kreiranju rezervacije: ' + xhr.responseText);
            }
        });
    });

    //RESTARTUJ PRETRAGU/PRIKAZ
    $('#restart-flights').on('click', function () {
        printFlights(allFlights);
    });
});
