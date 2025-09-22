using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Request")]
[Index("CourseID", Name = "IX_Request_Course")]
[Index("UserID", "CreatedAt", Name = "IX_Request_User")]
public partial class Request
{
    [Key]
    public int RequestID { get; set; }

    public int UserID { get; set; }

    public int? CourseID { get; set; }

    public byte RequestType { get; set; }

    public string? Description { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public int? ProcessedBy { get; set; }

    [ForeignKey("CourseID")]
    [InverseProperty("Requests")]
    public virtual Course? Course { get; set; }

    [ForeignKey("ProcessedBy")]
    [InverseProperty("RequestProcessedByNavigations")]
    public virtual Account? ProcessedByNavigation { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("RequestUsers")]
    public virtual Account User { get; set; } = null!;
}
