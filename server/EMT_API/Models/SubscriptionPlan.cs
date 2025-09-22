using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("SubscriptionPlan")]
[Index("PlanCode", Name = "UQ__Subscrip__DDC8069B872594E4", IsUnique = true)]
public partial class SubscriptionPlan
{
    [Key]
    public int PlanID { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string PlanCode { get; set; } = null!;

    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column(TypeName = "decimal(12, 2)")]
    public decimal Price { get; set; }

    public int DurationDays { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("Plan")]
    public virtual ICollection<PaymentOrder> PaymentOrders { get; set; } = new List<PaymentOrder>();

    [InverseProperty("Plan")]
    public virtual ICollection<UserMembership> UserMemberships { get; set; } = new List<UserMembership>();
}
