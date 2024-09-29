using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class Review
    {
        public string User { get; set; }
        public string Airline { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Id { get; set; }
        public string ImagePath { get; set; } = string.Empty;
        [JsonIgnore] // Ignoriše prilikom serijalizacije
        public ReviewStatus Status { get; set; }

        [JsonProperty("Status")]
        public string StatusString
        {
            get { return Status.ToString(); }
            set { Status = (ReviewStatus)Enum.Parse(typeof(ReviewStatus), value, true); }
        }
        public Review (string user, string airline, string title, string description, string imagePath, ReviewStatus status, int id)
        {
            User = user;
            Airline = airline;
            Title = title;
            Description = description;
            ImagePath = imagePath;
            Status = status;
            Id = id;
        }
    }

}