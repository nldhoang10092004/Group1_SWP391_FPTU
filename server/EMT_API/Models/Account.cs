using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Account")]
[Index("Email", Name = "UQ_Account_Email", IsUnique = true)]
[Index("Username", Name = "UQ_Account_Username", IsUnique = true)]
public partial class Account
{
    [Key]
    public int AccountID { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Username { get; set; } = null!;

    [StringLength(256)]
    [Unicode(false)]
    public string? Hashpass { get; set; }

    public DateTime CreateAt { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [StringLength(50)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [StringLength(10)]
    [Unicode(false)]
    public string Role { get; set; } = null!;

    [StringLength(128)]
    [Unicode(false)]
    public string? GoogleSub { get; set; }

    public DateTime? LastLoginAt { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();

    [InverseProperty("Buyer")]
    public virtual ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();

    [InverseProperty("ProcessedByNavigation")]
    public virtual ICollection<Request> RequestProcessedByNavigations { get; set; } = new List<Request>();

    [InverseProperty("User")]
    public virtual ICollection<Request> RequestUsers { get; set; } = new List<Request>();

    [InverseProperty("TeacherNavigation")]
    public virtual Teacher? Teacher { get; set; }

    [InverseProperty("Account")]
    public virtual UserDetail? UserDetail { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserMembership> UserMemberships { get; set; } = new List<UserMembership>();
}
