using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class Flight
    {
        public string Airline { get; set; }
        public int Id { get; set; }
        public string InitDest { get; set; }
        public string OutgoingDest { get; set; }
        public string DepartureDate { get; set; }
        public string ArrivalDate { get; set; }
        public int FreeSeats { get; set; }
        public int OccupatedSeats { get; set; }
        public int TotalSeats { get; set; }
        public double Price { get; set; }
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        public FlightStatus Status { get; set; }

        [JsonProperty("Status")]
        public string StatusString
        {
            get { return Status.ToString(); }
            set { Status = (FlightStatus)Enum.Parse(typeof(FlightStatus), value); }
        }

        public Flight(string airline, int id, string initDest, string outgoingDest, string departureDate, string arrivalDate, int freeSeats, int occupatedSeats, int totalSeats, double price, FlightStatus status)
        {
            Airline = airline;
            Id = id;
            InitDest = initDest;
            OutgoingDest = outgoingDest;
            DepartureDate = departureDate;
            ArrivalDate = arrivalDate;
            FreeSeats = freeSeats;
            OccupatedSeats = occupatedSeats;
            TotalSeats = totalSeats;
            Price = price;
            Status = status;
        }
    }
}