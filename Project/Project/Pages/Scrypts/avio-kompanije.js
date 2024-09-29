$(document).ready(function () {

    var loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    //UCITAVANJE I ISPIS AVIKOMPANIJA
    $.ajax({
        url: '/api/getAviokompanije',
        method: 'GET',
        dataType: 'json',
        success: function (data) {

            $.each(data, function (index, airline) {
                var airlineHTML = `
                        <div class="airline-entity-div" id="${airline.Name.replace(/ /g, '-')}-reviews">                    <div class="airline-list-image-div">
                        <img src="Photos/Airlines/${airline.Name}.png" alt=""/>
                    </div>
                    <div class="airline-info-div">
                        <div class="airline-name">${airline.Name}</div>
                        <div class="airline-telephone-div">
                            <img src="Photos/Icons/phone.svg" loading="lazy" alt=""/>
                            <a href="tel:${airline.ContactInfo}" class="link">${airline.ContactInfo}</a>
                        </div>
                        <div class="airline-adress-div">
                            <img src="Photos/Icons/email.svg" loading="lazy" alt=""/>
                            <a href="mailto:${airline.Adress}" class="link-2">${airline.Adress}</a>
                        </div>
                        <div class="airline-flyghts-list-block-div">
                            <div class="text-block-3">Letovi</div>
                            <div class="airline-flights-list-div">
                                ${generateFlights(airline.Flights)}
                            </div>
                        </div>
                        <div class="airline-reviews-list-block-div">
                            <div class="text-block-4">Recenzije</div>
                            <div class="airline-reviews-list">
                                ${generateReviews(airline.Reviews)}
                            </div>
                        </div>
                    </div>
                </div>`;

                $('.airlines-list-div').append(airlineHTML);
            });

            scrollToHash();

        },
        error: function (xhr, status, error) {
            console.error("Došlo je do greške prilikom učitavanja fajla: ", error);
        }
    });

    //ISPIS LETOVA U PREVIDJENU LISTU 
    function generateFlights(flights) {
        var flightsHTML = '';
        $.each(flights, function (index, flight) {
            flightsHTML += `
                <div class="airline-flights-list-entity">
                    <div class="airline-flights-list-entity-information">
                        <div class="airline-flights-list-entity-destinations">
                            <div class="init-destination">${flight.InitDest}</div>
                            <div class="dash">-</div>
                            <div class="outgoing-dest">${flight.OutgoingDest}</div>
                            <img src="Photos/Icons/direct-flight.ong" loading="lazy" alt="Slika aviona kako leti sa jedne lokacije na drugu" class="airplane-image"/>
                        </div>
                        <div class="airline-flights-list-entity-date-div">
                            <div class="departure-date-div">
                                <img src="Photos/Icons/take-off.png" loading="lazy" alt="" class="airplane-image"/>
                                <div class="flight-date-textblock">${flight.DepartureDate}</div>
                            </div>
                            <div class="arrival-date-div">
                                <img src="Photos/Icons/landing_icon.png" loading="lazy" alt="" class="airplane-image"/>
                                <div class="flight-date-textblock">${flight.ArrivalDate}</div>
                            </div>
                        </div>
                        <div class="airline-flights-list-entity-freeseats-div">
                            <div class="free-seats-textblock">Slobodna mesta:</div>
                            <div class="free-seats-number">${flight.FreeSeats}</div>
                        </div>
                        <div class="airline-flights-list-entity-status-div">
                            <div class="flight-statis-textblock">Status leta: </div>
                            <div class="flight-status">${flight.Status}</div>
                        </div>
                        <div class="airline-flights-list-entity-price-div">
                            <div class="price-textblock">Cena:</div>
                            <div class="price-number">${flight.Price}</div>
                        </div>
                    </div>
                </div>`;
        });
        return flightsHTML;
    }

    //ISPIS RECENZIJA U PREVIDJENU LISTU 
    function generateReviews(reviews) {
        var reviewsHTML = '';

        $.each(reviews, function (index, review) {

            if (loggedInUser) {

                if (!loggedInUser.IsAdmin && review.Status !== "Odobrena")
                    return
            } else {
                if (review.Status !== "Odobrena")
                    return

                reviewsHTML += `
                <div class="review-entity">
                    <div class="review-entity-div1">
                        <div class="review-status">${review.Title}</div>
                        <div class="review-user">Napisao: ${review.User}</div>
                        <div class="review-airline">Za aviokompaniju: ${review.Airline}</div>
                        <div class="review-image-div">
                            <img src="${review.ImagePath}" loading="lazy" alt="" class="review-image"/>
                        </div>
                    </div>
                    <div class="review-entity-div2">
                        <div class="review-description">${review.Description}</div>
                    </div>
                </div>`;
                return;
            }

            reviewsHTML += `
                <div class="review-entity">
                    <div class="review-entity-div1">
                        <div class="review-status">${review.Title}</div>
                        <div class="review-user">Napisao: ${review.User}</div>
                        <div class="review-airline">Za aviokompaniju: ${review.Airline}</div>
                        <div class="review-image-div">
                            <img src="${review.ImagePath}" loading="lazy" alt="" class="review-image"/>
                        </div>
                    </div>
                    <div class="review-entity-div2">
                        <div class="review-description">${review.Description}</div>
                    </div>
                </div>`;

        });
        return reviewsHTML;
    }

    //ANIMACIJA ZA SPUSTANJE STRANICE NA ZADATI HASH KOD
    function scrollToHash() {
        var hash = window.location.hash;
        if (hash) {
            var safeHash = hash.replace(/%20/g, '-');
            if ($(safeHash).length) {
                $('html, body').animate({
                    scrollTop: $(safeHash).offset().top
                }, 1000);
            }
        }
    }

});

