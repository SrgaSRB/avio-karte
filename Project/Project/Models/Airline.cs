using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class Airline
    {
        public string Name { get; set; }
        public string Adress { get; set; }
        public string ContactInfo { get; set; }
        public int Id { get; set; }
        public bool IsDeleted { get; set; }

        public List<Flight> Flights { get; set; }
        public List<Review> Reviews { get; set; }

        public Airline(string name, string adress, string contactInfo, int id, List<Flight> flights, List<Review> reviews)
        {
            Name = name;
            Adress = adress;
            ContactInfo = contactInfo;
            Id = id;
            Flights = flights;
            Reviews = reviews;
        }
    }
}