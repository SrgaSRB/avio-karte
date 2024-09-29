using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Globalization;

namespace Project.Models
{
    public static class DataBase
    {

        public static List<User> Korisnici;
        public static List<Airline> Aviokompanije;
        public static List<Flight> Letovi;
        public static List<Reservation> Rezervacije;
        public static List<Review> Recenzije;
        public static void CreateData()
        {
            Letovi = LoadFlightsFromJson("~/Pages/Data/letovi.json");
            Korisnici = LoadUsersFromJson("~/Pages/Data/korisnici.json");
            Aviokompanije = LoadAirlinesFromJson("~/Pages/Data/aviokompanije.json");
            Recenzije = LoadReviewsFromJson("~/Pages/Data/recenzije.json");
            Rezervacije = LoadReservarionFromJson("~/Pages/Data/rezervacije.json");


        }


        public static List<User> LoadUsersFromJson(string relativePath)
        {
            List<User> users = new List<User>();
            try
            {
                string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

                // Učitaj JSON sadržaj iz fajla
                var json = File.ReadAllText(absolutePath);

                // Deserijalizuj JSON u listu aviokompanija
                users = JsonConvert.DeserializeObject<List<User>>(json);
            }
            catch (Exception ex)
            {
                // Obrada izuzetaka
                Console.WriteLine($"Greška prilikom učitavanja JSON fajla: {ex.Message}");
            }
            return users;
        }

        public static List<Flight> LoadFlightsFromJson(string relativePath)
        {
            // Dobavljanje apsolutne putanje
            string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

            if (!File.Exists(absolutePath))
            {
                throw new FileNotFoundException("Fajl sa letovima nije pronađen.", absolutePath);
            }

            string json = File.ReadAllText(absolutePath);
            List<Flight> flights = JsonConvert.DeserializeObject<List<Flight>>(json);

            // Provera datuma za svaki let i ažuriranje statusa ako je datum polaska prošao
            foreach (var flight in flights)
            {
                if (!flight.IsDeleted && flight.Status != FlightStatus.Završen)
                {
                    DateTime departureDate;
                    if (DateTime.TryParseExact(flight.DepartureDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out departureDate))
                    {
                        if (departureDate < DateTime.Now)
                        {
                            flight.Status = FlightStatus.Završen; // Postavljanje statusa leta na "Završen"
                        }
                    }
                }
            }

            SaveToJson(flights, HttpContext.Current.Server.MapPath("~/Pages/Data/letovi.json"));


            return flights;
        }

        public static List<Airline> LoadAirlinesFromJson(string relativePath)
        {
            List<Airline> airlines = new List<Airline>();
            try
            {
                string absolutePath = HttpContext.Current.Server.MapPath(relativePath);
                var json = File.ReadAllText(absolutePath);
                airlines = JsonConvert.DeserializeObject<List<Airline>>(json);

                // Dodato: Ažuriranje statusa letova
                foreach (var airline in airlines)
                {
                    foreach (var flight in airline.Flights)
                    {
                        if (!flight.IsDeleted && flight.Status != FlightStatus.Završen)
                        {
                            if (DateTime.TryParseExact(flight.DepartureDate, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime departureDate))
                            {
                                if (departureDate < DateTime.Now)
                                {
                                    flight.Status = FlightStatus.Završen;
                                }
                            }
                        }
                    }
                }

                // Ako je bilo izmena, sačuvaj izmene nazad u fajl
                SaveToJson(airlines, absolutePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Greška prilikom učitavanja JSON fajla: {ex.Message}");
            }
            return airlines;
        }

        public static List<Review> LoadReviewsFromJson(string relativePath)
        {
            List<Review> reviews = new List<Review>();
            try
            {
                string absolutePath = HttpContext.Current.Server.MapPath(relativePath);

                // Učitaj JSON sadržaj iz fajla
                var json = File.ReadAllText(absolutePath);

                // Deserijalizuj JSON u listu aviokompanija
                reviews = JsonConvert.DeserializeObject<List<Review>>(json);
            }
            catch (Exception ex)
            {
                // Obrada izuzetaka
                Console.WriteLine($"Greška prilikom učitavanja JSON fajla: {ex.Message}");
            }
            return reviews;
        }

        public static List<Reservation> LoadReservarionFromJson(string relativePath)
        {
            List<Reservation> reservations = new List<Reservation>();
            try
            {
                string absolutePath = HttpContext.Current.Server.MapPath(relativePath);
                var json = File.ReadAllText(absolutePath);
                reservations = JsonConvert.DeserializeObject<List<Reservation>>(json);

                // Ažuriranje statusa rezervacija na osnovu statusa letova
                foreach (var reservation in reservations)
                {
                    var flight = DataBase.Letovi.FirstOrDefault(f => f.Id == reservation.FlightId && !f.IsDeleted);
                    if (flight != null && flight.Status == FlightStatus.Završen)
                    {
                        if (reservation.Status == ReservationStatus.Kreirana || reservation.Status == ReservationStatus.Odobrena)
                        {
                            reservation.Status = ReservationStatus.Završena;
                            // Ažuriranje rezervacije u profilu korisnika
                            foreach (var user in DataBase.Korisnici)
                            {
                                var userReservation = user.Reservations.FirstOrDefault(r => r.Id == reservation.Id);
                                if (userReservation != null)
                                {
                                    userReservation.Status = ReservationStatus.Završena;
                                }
                            }
                        }
                    }
                }

                // Sačuvaj promene ako ih ima
                SaveToJson(reservations, absolutePath);
                SaveToJson(DataBase.Korisnici, HttpContext.Current.Server.MapPath("~/Pages/Data/korisnici.json"));

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Greška prilikom učitavanja JSON fajla: {ex.Message}");
            }
            return reservations;
        }

        public static void SaveChangesToDisk()
        {
            SaveToJson(Aviokompanije, HttpContext.Current.Server.MapPath("~/Pages/Data/aviokompanije.json"));
            SaveToJson(Letovi, HttpContext.Current.Server.MapPath("~/Pages/Data/letovi.json"));
        }

        public static void SaveToJson<T>(List<T> data, string filePath)
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