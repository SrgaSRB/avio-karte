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
    public class AirlineController : ApiController
    {

        [HttpGet, Route("api/getAviokompanije")]
        public IHttpActionResult GetLetovi()
        {
            // Filtriranje aviokompanija koje nisu obrisane
            var aktivneAviokompanije = DataBase.Aviokompanije.Where(a => !a.IsDeleted).ToList();

            // Provera da li postoji bilo koja aktivna aviokompanija
            if (aktivneAviokompanije == null || !aktivneAviokompanije.Any())
            {
                return NotFound(); // Vraća 404 ako nema aktivnih aviokompanija
            }

            // Vraćanje liste aktivnih aviokompanija
            return Ok(aktivneAviokompanije);
        }

        [HttpPost, Route("api/addAirline")]
        public IHttpActionResult AddAirline(Airline newAirline)
        {
            if (newAirline == null)
            {
                return BadRequest("Data for the new airline is incomplete.");
            }

            newAirline.Id = DataBase.Aviokompanije.Max(a => a.Id) + 1;
            newAirline.Flights = new List<Flight>();
            newAirline.Reviews = new List<Review>();
            newAirline.IsDeleted = false;

            DataBase.Aviokompanije.Add(newAirline);
            SaveChangesToDisk();

            return Ok(newAirline);

        }

        [HttpPut]
        [Route("api/updateAirline")]
        public IHttpActionResult UpdateAirline([FromBody] Airline updatedAirline)
        {

            var airline = DataBase.Aviokompanije.FirstOrDefault(a => a.Id == updatedAirline.Id);

            if (airline == null)
            {
                return NotFound(); // Ako aviokompanija sa datim ID-om ne postoji
            }

            airline.Name = updatedAirline.Name;
            airline.Adress = updatedAirline.Adress;
            airline.ContactInfo = updatedAirline.ContactInfo;


            SaveChangesToDisk();

            return Ok(airline);
        }


        [HttpPut]
        [Route("api/deleteAirline/{id}")]
        public IHttpActionResult DeleteAirline(int id)
        {
            var airline = DataBase.Aviokompanije.FirstOrDefault(a => a.Id == id);
            if (airline == null)
            {
                return NotFound(); // Vraća 404 ako aviokompanija ne postoji
            }

            if (airline.Flights.Any(f => f.Status == FlightStatus.Aktivan))
            {
                return BadRequest("Nije moguće obrisati aviokompaniju koja ima aktivne letove.");
            }

            // Postavljanje polja IsDeleted na true
            airline.IsDeleted = true;

            SaveChangesToDisk();

            return Ok("Aviokompanija je uspešno obrisana.");
        }




        private void SaveChangesToDisk()
        {
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

    }

}

