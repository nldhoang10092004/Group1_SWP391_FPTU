using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Attempt")]
[Index("UserID", "QuizID", "Status", Name = "IX_Attempt_UserQuiz")]
public partial class Attempt
{
    [Key]
    public int AttemptID { get; set; }

    public int QuizID { get; set; }

    public int UserID { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? AutoScore { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? ManualScore { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    [InverseProperty("Attempt")]
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    [ForeignKey("QuizID")]
    [InverseProperty("Attempts")]
    public virtual Quiz Quiz { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("Attempts")]
    public virtual Account User { get; set; } = null!;
}
