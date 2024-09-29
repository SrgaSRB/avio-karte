using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.IO;
using Project.Models;

namespace Project.Controllers
{
    public class LetController : ApiController
    {
        //PREKO AVIKOMPANIJA
        [HttpGet, Route("api/getFlights")]
        public IHttpActionResult GetFlights()
        {
            var allFlights = new List<Flight>();
            // Iteracija kroz sve aviokompanije i dodavanje njihovih neobrisanih letova u listu
            DataBase.Aviokompanije.ForEach(airline => {
                // Filtriranje letova da se uzmu samo oni koji nisu obrisani
                allFlights.AddRange(airline.Flights.Where(flight => !flight.IsDeleted));
            });

            return Ok(allFlights);
        }

        [HttpPost]
        [Route("api/addFlight")]
        public IHttpActionResult AddFlight(Flight flight)
        {
            if (flight == null)
            {
                return BadRequest("Flight data is missing.");
            }

            // Pronalazak aviokompanije po imenu
            var airline = DataBase.Aviokompanije.FirstOrDefault(a => a.Name == flight.Airline && !a.IsDeleted);
            if (airline == null)
            {
                return NotFound();
            }

            flight.Id = (DataBase.Letovi.Any() ? DataBase.Letovi.Max(f => f.Id) + 1 : 1);
            flight.Status = FlightStatus.Aktivan;
            flight.FreeSeats = flight.TotalSeats;
            flight.OccupatedSeats = 0;

            // Dodavanje leta u listu letova aviokompanije
            airline.Flights.Add(flight);

            // Dodavanje leta u globalnu listu letova
            DataBase.Letovi.Add(flight);

            // Ovde treba implementirati logiku za čuvanje izmena
            SaveChangesToDisk(); // Ako imate mehanizam za čuvanje izmena

            return Ok(flight);
        }

        [HttpPut]
        [Route("api/updateFlight")]
        public IHttpActionResult UpdateFlight(Flight updatedFlight)
        {
            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == updatedFlight.Id);
            if (flight == null)
            {
                return NotFound(); // Let nije pronađen
            }

            // Provera da li let ima rezervacije sa statusom Kreirana ili Odobrena
            var reservations = DataBase.Rezervacije.Where(r => r.FlightId == flight.Id && (r.Status == ReservationStatus.Kreirana || r.Status == ReservationStatus.Odobrena)).ToList();
            if (reservations.Any() && flight.Price != updatedFlight.Price)
            {
                return BadRequest("Nije moguće promeniti cenu leta koji ima aktivne rezervacije.");
            }

            // Ažuriranje podataka o letu
            flight.Airline = updatedFlight.Airline;
            flight.DepartureDate = updatedFlight.DepartureDate;
            flight.ArrivalDate = updatedFlight.ArrivalDate;
            flight.FreeSeats = updatedFlight.FreeSeats;
            flight.Price = updatedFlight.Price;
            flight.Status = updatedFlight.Status;

            // Pronađi avikompaniju koja poseduje ovaj let i ažuriraj let i unutar te liste
            var airline = DataBase.Aviokompanije.FirstOrDefault(a => a.Flights.Any(f => f.Id == flight.Id));
            if (airline != null)
            {
                var airlineFlight = airline.Flights.FirstOrDefault(f => f.Id == flight.Id);
                if (airlineFlight != null)
                {
                    airlineFlight.Airline = updatedFlight.Airline;
                    airlineFlight.DepartureDate = updatedFlight.DepartureDate;
                    airlineFlight.ArrivalDate = updatedFlight.ArrivalDate;
                    airlineFlight.FreeSeats = updatedFlight.FreeSeats;
                    airlineFlight.Price = updatedFlight.Price;
                    airlineFlight.Status = updatedFlight.Status;
                }
            }

            SaveChangesToDisk(); // Ažuriranje podataka na disku

            return Ok(flight);
        }

        [HttpPut]
        [Route("api/deleteFlight/{id}")]
        public IHttpActionResult DeleteFlight(int id)
        {
            var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == id);
            if (flight == null)
            {
                return NotFound(); // Let nije pronađen
            }

            // Provera da li let ima rezervacije koje sprečavaju brisanje
            if (DataBase.Rezervacije.Any(r => r.FlightId == id && !r.IsDeleted && (r.Status == ReservationStatus.Kreirana || r.Status == ReservationStatus.Odobrena)))
            {
                return BadRequest("Let ne može biti obrisan jer ima aktivne rezervacije.");
            }

            // Postavljanje leta kao logički obrisano u glavnoj listi letova
            flight.IsDeleted = true;

            // Postavljanje leta kao logički obrisano u listi letova unutar avikompanije
            var airline = DataBase.Aviokompanije.FirstOrDefault(a => a.Flights.Any(f => f.Id == id));
            if (airline != null)
            {
                var airlineFlight = airline.Flights.FirstOrDefault(f => f.Id == id);
                if (airlineFlight != null)
                {
                    airlineFlight.IsDeleted = true;
                }
            }

            SaveChangesToDisk(); // Ako imate mehanizam za čuvanje izmena

            return Ok();
        }

















        private void SaveChangesToDisk()
        {
            SaveToJson(DataBase.Aviokompanije, HttpContext.Current.Server.MapPath("~/Pages/Data/aviokompanije.json"));
            SaveToJson(DataBase.Letovi, HttpContext.Current.Server.MapPath("~/Pages/Data/letovi.json"));
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


    }
}
