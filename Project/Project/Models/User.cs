using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class User
    {
        //must be unique name
        public string Username { get ; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string BrthDay { get; set; }
        public string Gender {  get; set; }
        public bool IsAdmin { get; set; }
        public List<Reservation> Reservations { get; set; }

        public User(string username, string password, string firstName, string lastName, string email, string brthDay, string gender, bool isAdmin, List<Reservation> reservations)
        {
            Username = username;
            Password = password;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            BrthDay = brthDay;
            Gender = gender;
            IsAdmin = isAdmin;
            Reservations = reservations;
        }
    }
}