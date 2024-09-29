using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class Reservation
    {
        public string User { get; set; }
        public int FlightId { get; set; }
        public int Id { get; set; }
        public int PassengerNumbers {  get; set; }
        public double TotalPrice { get; set; }
        public bool IsDeleted { get; set; }


        [JsonIgnore]
        public ReservationStatus Status { get; set; }

        // Kreiraj svojstvo koje će se koristiti za serijalizaciju/deserijalizaciju
        [JsonProperty("Status")]
        public string StatusName
        {
            get { return Status.ToString(); }
            set { Status = (ReservationStatus)Enum.Parse(typeof(ReservationStatus), value, true); }
        }


    }
}