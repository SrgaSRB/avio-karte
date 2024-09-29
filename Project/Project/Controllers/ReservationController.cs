using Newtonsoft.Json;
using Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.IO;

namespace Project.Controllers
{
    public class ReservationController : ApiController
    {
        // GET api/reservations
        [HttpGet]
        [Route("api/userReservations")]
        public IHttpActionResult GetReservationsForUser([FromUri] string username)
        {
            // Filtriraj rezervacije po korisničkom imenu
            var userReservations = DataBase.Rezervacije.Where(r => r.User == username).ToList();

            if (userReservations == null || userReservations.Count == 0)
            {
                return NotFound(); // Vrati 404 ako nema rezervacija za datog korisnika
            }

            // Kreiraj listu koja će čuvati rezervacije sa dodatim informacijama o letovima
            var reservationsWithFlights = userReservations.Select(reservation =>
            {
                var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == reservation.FlightId);
                return new
                {
                    Reservation = reservation,
                    Flight = flight
                };
            }).ToList();

            // Vrati listu rezervacija sa letovima
            return Ok(reservationsWithFlights);
        }

        [HttpPost, Route("api/makeReservation")]
        public IHttpActionResult MakeReservation([FromBody] ReservationRequest request)
        {
            Flight selectedFlight = request.Flight;
            int passengerCount = request.PassengerCount;

            if (selectedFlight == null || passengerCount <= 0)
            {
                return BadRequest("Invalid flight data or passenger count.");
            }

            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == selectedFlight.Id && f.Status == FlightStatus.Aktivan);
            if (flight == null)
            {
                return NotFound();
            }

            if (flight.FreeSeats < passengerCount)
            {
                return BadRequest("Not enough free seats available.");
            }

            string username = request.Username;
            flight.FreeSeats -= passengerCount;
            flight.OccupatedSeats += passengerCount;

            int nextReservationId = DataBase.Rezervacije.Any() ? DataBase.Rezervacije.Max(r => r.Id) + 1 : 1;

            var reservation = new Reservation
            {
                Id = nextReservationId,
                User = username,
                FlightId = flight.Id,
                PassengerNumbers = passengerCount,
                TotalPrice = flight.Price * passengerCount,
                Status = ReservationStatus.Kreirana
            };

            DataBase.Rezervacije.Add(reservation);

            var user = DataBase.Korisnici.FirstOrDefault(u => u.Username == username);
            if (user.Reservations == null)
            {
                user.Reservations = new List<Reservation>();
            }
            user.Reservations.Add(reservation);

            UpdateFlightInAirlinesJson(selectedFlight.Id, passengerCount);
            SaveChangesToDisk();

            return Ok(reservation);
        }

        [HttpPost, Route("api/cancelReservation")]
        public IHttpActionResult CancelReservation([FromBody] CancelReservationRequest request)
        {
            var reservation = DataBase.Rezervacije.FirstOrDefault(r => r.Id == request.ReservationId && r.User == request.Username);
            if (reservation == null)
            {
                return NotFound();
            }

            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == reservation.FlightId);
            if (flight == null)
            {
                return NotFound();
            }

            if (flight.FreeSeats < request.SeatsNumber)
            {
                return BadRequest("Mismatch in seats count.");
            }

            // Vraćanje mesta na letu
            flight.FreeSeats += request.SeatsNumber;
            flight.OccupatedSeats -= request.SeatsNumber;

            // Uklanjanje rezervacije iz liste rezervacija
            DataBase.Rezervacije.Remove(reservation);

            // Uklanjanje rezervacije iz korisničkih rezervacija
            var user = DataBase.Korisnici.FirstOrDefault(u => u.Username == request.Username);
            if (user != null && user.Reservations != null)
            {
                user.Reservations.RemoveAll(r => r.Id == request.ReservationId);
            }

            foreach (var airline in DataBase.Aviokompanije)
            {
                var flightinAirline = airline.Flights.FirstOrDefault(f => f.Id == reservation.FlightId);
                if (flightinAirline != null)
                {
                    flightinAirline.FreeSeats += request.SeatsNumber;
                    flightinAirline.OccupatedSeats -= request.SeatsNumber;

                    break;  
                }
            }

            // Ažuriranje JSON datoteka
            SaveChangesToDisk();

            return Ok("Reservation canceled successfully.");
        }
        [HttpGet]
        [Route("api/getReservations")]
        public IHttpActionResult GetReservations()
        {
            List<Reservation> allReservations = DataBase.Rezervacije;

            // Filtriranje rezervacija koje imaju status "Kreirana"
            var kreiraneRezervacije = allReservations.Where(r => r.Status == ReservationStatus.Kreirana).ToList();

            if (kreiraneRezervacije == null || !kreiraneRezervacije.Any())
            {
                return NotFound();
            }

            return Ok(kreiraneRezervacije);
        }

        [HttpPut]
        [Route("api/cancelReservation/{id}")]
        public IHttpActionResult CancelReservation(int id)
        {
            var reservation = DataBase.Rezervacije.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
            {
                return NotFound();
            }

            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == reservation.FlightId);
            if (flight == null)
            {
                return NotFound();
            }

            // Pronalaženje aviokompanije koja poseduje let i ažuriranje leta
            foreach (var airline in DataBase.Aviokompanije)
            {
                var flightToUpdate = airline.Flights.FirstOrDefault(f => f.Id == flight.Id);
                if (flightToUpdate != null)
                {
                    flightToUpdate.FreeSeats += reservation.PassengerNumbers;
                    flightToUpdate.OccupatedSeats -= reservation.PassengerNumbers;
                    break; // Prekidamo petlju kada nađemo odgovarajući let
                }
            }

            // Ažuriranje leta u globalnoj listi letova
            flight.FreeSeats += reservation.PassengerNumbers;
            flight.OccupatedSeats -= reservation.PassengerNumbers;

            // Promena statusa rezervacije
            reservation.Status = ReservationStatus.Otkazana;

            // Ažuriranje korisnika i njegovih rezervacija
            var user = DataBase.Korisnici.FirstOrDefault(u => u.Username == reservation.User);
            if (user != null)
            {
                var userReservation = user.Reservations.FirstOrDefault(r => r.Id == id);
                if (userReservation != null)
                {
                    userReservation.Status = ReservationStatus.Otkazana;
                }
            }

            SaveChangesToDisk(); // Snimanje svih izmena

            return Ok("Rezervacija je otkazana i let je ažuriran.");
        }


        [HttpPut]
        [Route("api/approveReservation/{id}")]
        public IHttpActionResult ApproveReservation(int id)
        {
            var reservation = DataBase.Rezervacije.FirstOrDefault(r => r.Id == id);
            if (reservation == null)
            {
                return NotFound();
            }

            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == reservation.FlightId);
            if (flight == null)
            {
                return NotFound();
            }


            // Promena statusa rezervacije
            reservation.Status = ReservationStatus.Odobrena;

            // Ažuriranje korisnika i njegovih rezervacija
            var user = DataBase.Korisnici.FirstOrDefault(u => u.Username == reservation.User);
            if (user != null)
            {
                var userReservation = user.Reservations.FirstOrDefault(r => r.Id == id);
                if (userReservation != null)
                {
                    userReservation.Status = ReservationStatus.Odobrena;
                }
            }

            SaveChangesToDisk(); // Snimanje svih izmena

            return Ok("Rezervacija je odobrena.");
        }








        public class CancelReservationRequest
        {
            public string Username { get; set; }
            public int ReservationId { get; set; }
            public int FlightID { get; set; }
            public int SeatsNumber { get; set; }
        }




        private void SaveChangesToDisk()
        {
            SaveToJson(DataBase.Letovi, HttpContext.Current.Server.MapPath("~/Pages/Data/letovi.json"));
            SaveToJson(DataBase.Rezervacije, HttpContext.Current.Server.MapPath("~/Pages/Data/rezervacije.json"));
            SaveToJson(DataBase.Korisnici, HttpContext.Current.Server.MapPath("~/Pages/Data/korisnici.json"));
            SaveToJson(DataBase.Aviokompanije, HttpContext.Current.Server.MapPath("~/Pages/Data/aviokompanije.json"));
        }

        private void SaveToJson<T>(List<T> data, string filePath)
        {
            try
            {
                string json = JsonConvert.SerializeObject(data, Formatting.Indented);
                File.WriteAllText(filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving data to disk: {ex.Message}");
            }
        }

        public void UpdateFlightInAirlinesJson(int flightId, int passengerCount)
        {
            var airlines = DataBase.Aviokompanije;

            foreach (var airline in airlines)
            {
                var flight = airline.Flights.FirstOrDefault(f => f.Id == flightId);
                if (flight != null)
                {
                    flight.FreeSeats -= passengerCount;
                    flight.OccupatedSeats += passengerCount;

                    SaveToJson(airlines, HttpContext.Current.Server.MapPath("~/Pages/Data/aviokompanije.json"));
                    break;
                }
            }
        }


    }
}
