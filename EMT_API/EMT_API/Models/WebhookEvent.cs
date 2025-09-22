using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("WebhookEvent")]
[Index("UniqueKey", Name = "UQ__WebhookE__2DE46E93E1C82353", IsUnique = true)]
public partial class WebhookEvent
{
    [Key]
    public int WebhookID { get; set; }

    public int OrderID { get; set; }

    [StringLength(200)]
    [Unicode(false)]
    public string UniqueKey { get; set; } = null!;

    public string? Payload { get; set; }

    [StringLength(256)]
    [Unicode(false)]
    public string? Signature { get; set; }

    public DateTime ReceivedAt { get; set; }

    [ForeignKey("OrderID")]
    [InverseProperty("WebhookEvents")]
    public virtual PaymentOrder Order { get; set; } = null!;
}
