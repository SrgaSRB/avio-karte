using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using Project.Models;
using System.IO;

namespace Project.Controllers
{
    public class UserController : ApiController
    {
        [HttpPost, Route("api/login")]
        public IHttpActionResult Login([FromBody] User loginData)
        {
            // Proveri da li postoji korisnik sa unetim korisničkim imenom
            var user = DataBase.Korisnici.FirstOrDefault(u => u.Username == loginData.Username);

            if (user == null || user.Password != loginData.Password)
            {
                // Ako korisnik ne postoji ili lozinka nije tačna, vrati bad request
                return BadRequest("Pogrešno korisničko ime ili lozinka.");
            }

            // Ako su korisničko ime i lozinka tačni, postavi kolačić
            var cookie = new HttpCookie("username", user.Username)
            {
                HttpOnly = true, // Onemogućava pristup kolačiću putem JavaScript-a
                Secure = Request.RequestUri.Scheme == Uri.UriSchemeHttps, // Kolačić će biti poslan samo preko HTTPS
                Expires = DateTime.Now.AddHours(1) // Kolačić će isteći za 1 sat
            };

            HttpContext.Current.Response.Cookies.Add(cookie);

            // Vrati korisnički objekat
            return Ok(user);
        }

        [HttpPost, Route("api/updateUser")]
        public IHttpActionResult UpdateUser([FromBody] User updatedUser)
        {
            // Učitaj sve korisnike iz korisnici.json
            var filePath = HttpContext.Current.Server.MapPath("~/Pages/Data/korisnici.json");
            var json = File.ReadAllText(filePath);
            var users = JsonConvert.DeserializeObject<List<User>>(json);

            // Pronađi korisnika po korisničkom imenu
            var user = users.FirstOrDefault(u => u.Username == updatedUser.Username);
            if (user == null)
            {
                return BadRequest("Korisnik nije pronađen.");
            }

            // Ažuriraj podatke korisnika
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.BrthDay = updatedUser.BrthDay;
            user.Gender = updatedUser.Gender;
            user.IsAdmin = updatedUser.IsAdmin;

            // Sačuvaj ažurirane podatke nazad u korisnici.json
            File.WriteAllText(filePath, JsonConvert.SerializeObject(users, Formatting.Indented));

            DataBase.Korisnici = users;

            // Vrati odgovor
            return Ok("Profil je uspešno izmenjen.");
        }

        [HttpGet]
        [Route("api/user/exists/{username}")]
        public IHttpActionResult UsernameExists(string username)
        {
            var userExists = DataBase.Korisnici.Any(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
            return Ok(userExists);
        }

        [HttpPost]
        [Route("api/user/create")]
        public IHttpActionResult CreateUser([FromBody] User newUser)
        {
            if (DataBase.Korisnici.Any(u => u.Username.Equals(newUser.Username, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest("Korisničko ime već postoji.");
            }

            // Dodavanje korisnika u listu i snimanje promena
            DataBase.Korisnici.Add(newUser);
            SaveChangesToDisk();  // Metoda za snimanje u JSON fajl

            return Ok();
        }

        [HttpGet]
        [Route("api/users")]
        public IHttpActionResult GetUsers()
        {
            var users = DataBase.Korisnici; 

            if (users == null || !users.Any())
            {
                return NotFound(); 
            }

            return Ok(users); 
        }





        private void SaveChangesToDisk()
        {

            SaveToJson(DataBase.Korisnici, HttpContext.Current.Server.MapPath("~/Pages/Data/korisnici.json"));
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
                // Log error
                Console.WriteLine($"Error saving data to disk: {ex.Message}");
            }
        }
    }
}
