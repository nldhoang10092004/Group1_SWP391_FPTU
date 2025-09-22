using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Answer")]
[Index("AttemptID", Name = "IX_Answer_Attempt")]
[Index("AttemptID", "QuestionID", Name = "IX_Answer_Attempt_Q")]
[Index("QuestionID", Name = "IX_Answer_Q")]
public partial class Answer
{
    [Key]
    public int AnswerID { get; set; }

    public int AttemptID { get; set; }

    public int QuestionID { get; set; }

    public int? OptionID { get; set; }

    public string? AnswerText { get; set; }

    [StringLength(1000)]
    public string? AnswerUrl { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? GradedScore { get; set; }

    public string? Feedback { get; set; }

    public DateTime AnsweredAt { get; set; }

    [ForeignKey("AttemptID")]
    [InverseProperty("Answers")]
    public virtual Attempt Attempt { get; set; } = null!;

    [ForeignKey("OptionID")]
    [InverseProperty("Answers")]
    public virtual Option? Option { get; set; }

    [ForeignKey("QuestionID")]
    [InverseProperty("Answers")]
    public virtual Question Question { get; set; } = null!;
}
