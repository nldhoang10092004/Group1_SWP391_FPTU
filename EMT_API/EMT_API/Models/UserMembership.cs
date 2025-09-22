using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("UserMembership")]
[Index("UserID", "Status", "EndsAt", Name = "IX_UM_User", IsDescending = new[] { false, false, true })]
public partial class UserMembership
{
    [Key]
    public long MembershipID { get; set; }

    public int UserID { get; set; }

    public int PlanID { get; set; }

    public DateTime StartsAt { get; set; }

    public DateTime EndsAt { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? CanceledAt { get; set; }

    [ForeignKey("PlanID")]
    [InverseProperty("UserMemberships")]
    public virtual SubscriptionPlan Plan { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("UserMemberships")]
    public virtual Account User { get; set; } = null!;
}
