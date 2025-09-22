using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("PaymentOrder")]
[Index("BuyerID", "Status", "CreatedAt", Name = "IX_PO_Buyer_Status", IsDescending = new[] { false, false, true })]
public partial class PaymentOrder
{
    [Key]
    public int OrderID { get; set; }

    public int BuyerID { get; set; }

    public int PlanID { get; set; }

    [Column(TypeName = "decimal(12, 2)")]
    public decimal Amount { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    [ForeignKey("BuyerID")]
    [InverseProperty("PaymentOrders")]
    public virtual Account Buyer { get; set; } = null!;

    [ForeignKey("PlanID")]
    [InverseProperty("PaymentOrders")]
    public virtual SubscriptionPlan Plan { get; set; } = null!;

    [InverseProperty("Order")]
    public virtual ICollection<WebhookEvent> WebhookEvents { get; set; } = new List<WebhookEvent>();
}
