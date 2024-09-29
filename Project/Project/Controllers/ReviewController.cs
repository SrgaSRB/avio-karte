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
    public class ReviewController : ApiController
    {
        [HttpGet]
        [Route("api/getReviews")]
        public IHttpActionResult GetReviews()
        {
            var reviews = DataBase.Recenzije.Where(r => r.Status == ReviewStatus.Kreirana).ToList();
            return Ok(reviews);
        }

        [HttpPut]
        [Route("api/review/cancel/{id}")]
        public IHttpActionResult CancelReview(int id)
        {
            var review = DataBase.Recenzije.FirstOrDefault(r => r.Id == id);
            if (review == null)
            {
                return NotFound();
            }

            review.Status = ReviewStatus.Odbijena;

            foreach (var airline in DataBase.Aviokompanije)
            {
                var foundReview = airline.Reviews.FirstOrDefault(r => r.Id == id);
                if (foundReview != null)
                {
                    foundReview.Status = ReviewStatus.Odbijena;
                    break;
                }
            }

            SaveChangesToDisk(); 

            return Ok("Recenzija je obrisana.");
        }


        [HttpPut]
        [Route("api/review/approve/{id}")]
        public IHttpActionResult ApproveReview(int id)
        {
            var review = DataBase.Recenzije.FirstOrDefault(r => r.Id == id);
            if (review == null)
            {
                return NotFound();
            }

            review.Status = ReviewStatus.Odobrena;

            foreach (var airline in DataBase.Aviokompanije)
            {
                var foundReview = airline.Reviews.FirstOrDefault(r => r.Id == id);
                if (foundReview != null)
                {
                    foundReview.Status = ReviewStatus.Odobrena;
                    break;
                }
            }

            SaveChangesToDisk();

            return Ok("Recenzija je odobrena.");
        }

        [HttpPost]
        [Route("api/review/uploadImage/{reviewId}")]
        public IHttpActionResult UploadImageForReview(int reviewId, HttpPostedFileBase imageFile)
        {
            var review = DataBase.Recenzije.FirstOrDefault(r => r.Id == reviewId);
            if (review == null)
            {
                return NotFound();
            }

            if (imageFile != null && imageFile.ContentLength > 0)
            {
                var fileName = Path.GetFileName(imageFile.FileName);
                var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Pages/Photos/Reviews"), fileName);
                imageFile.SaveAs(path);
                review.ImagePath = "/Pages/Photos/Reviews/" + fileName;
            }

            SaveChangesToDisk();
            return Ok("Image uploaded successfully.");
        }

        [HttpPost]
        [Route("api/review/createWithImage")]
        public IHttpActionResult CreateReviewWithImage()
        {
            var httpRequest = HttpContext.Current.Request;
            string imagePath = null;  

            // Provera da li postoji poslati fajl i snimanje ako postoji
            if (httpRequest.Files.Count > 0)
            {
                var file = httpRequest.Files[0];
                if (file != null && file.ContentLength > 0)
                {
                    var fileName = Path.GetFileName(file.FileName);
                    var filePath = Path.Combine(HttpContext.Current.Server.MapPath("~/Pages/Photos/Reviews"), fileName);
                    file.SaveAs(filePath);
                    imagePath = "/Pages/Photos/Reviews/" + fileName;
                }
            }

            string user = httpRequest.Form["User"];
            string airline = httpRequest.Form["Airline"];
            string title = httpRequest.Form["Title"];
            string description = httpRequest.Form["Description"];
            ReviewStatus status = (ReviewStatus)Enum.Parse(typeof(ReviewStatus), httpRequest.Form["Status"]);

            // Kreiranje nove recenzije, slika je opciona
            var review = new Review(user, airline, title, description, imagePath, status, GetNextReviewId());

            DataBase.Recenzije.Add(review);
            var foundAirline = DataBase.Aviokompanije.FirstOrDefault(a => a.Name == airline);
            if (foundAirline != null)
            {
                foundAirline.Reviews.Add(review);
            }


            SaveChangesToDisk();

            return Ok("Recenzija je uspešno kreirana.");
        }


        private int GetNextReviewId()
        {
            // Implementacija za dohvatanje sledećeg ID za recenziju
            return DataBase.Recenzije.Max(r => r.Id) + 1;
        }



        private void SaveChangesToDisk()
        {
            SaveToJson(DataBase.Letovi, HttpContext.Current.Server.MapPath("~/Pages/Data/letovi.json"));
            SaveToJson(DataBase.Aviokompanije, HttpContext.Current.Server.MapPath("~/Pages/Data/aviokompanije.json"));
            SaveToJson(DataBase.Recenzije, HttpContext.Current.Server.MapPath("~/Pages/Data/recenzije.json"));
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
