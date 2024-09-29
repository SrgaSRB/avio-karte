using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class ReservationRequest
    {
        public Flight Flight { get; set; }
        public int PassengerCount { get; set; }
        public string Username { get; set; }

        public ReservationRequest(Flight flight, int passengerCount, string username)
        {
            Flight = flight;
            PassengerCount = passengerCount;
            this.Username = username;   
        }
    }
}