using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Feedback")]
public partial class Feedback
{
    [Key]
    [Column("FeedbackID")]
    public int FeedbackId { get; set; }   // ✅ Chữ "Id" viết hoa chữ I, không viết "ID"

    [Column("UserID")]
    public int UserId { get; set; }

    [Column("CourseID")]
    public int CourseId { get; set; }

    [Range(1, 5)]
    public byte Rating { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Comment { get; set; }

    [Column("CreatedAt")]
    public DateTime CreatedAt { get; set; }

    [Column("IsVisible")]
    public bool IsVisible { get; set; }

    [ForeignKey(nameof(UserId))]
    [InverseProperty(nameof(Account.Feedbacks))]
    public virtual Account User { get; set; } = null!;

    [ForeignKey(nameof(CourseId))]
    [InverseProperty(nameof(Course.Feedbacks))]
    public virtual Course Course { get; set; } = null!;
}
