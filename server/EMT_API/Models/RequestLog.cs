using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("RequestLog")]
[Index("ActorID", "CreatedAt", Name = "IX_RequestLog_Actor_Time", IsDescending = new[] { false, true })]
public partial class RequestLog
{
    [Key]
    public long LogID { get; set; }

    public int? ActorID { get; set; }

    public byte? ActorRole { get; set; }

    [StringLength(45)]
    [Unicode(false)]
    public string? IP { get; set; }

    [StringLength(500)]
    public string Path { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
