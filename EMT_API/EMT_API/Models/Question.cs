using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Question")]
[Index("GroupID", "QuestionOrder", Name = "IX_Question_Group")]
[Index("QuizID", "QuestionOrder", Name = "IX_Question_Quiz")]
public partial class Question
{
    [Key]
    public int QuestionID { get; set; }

    public int QuizID { get; set; }

    public int? GroupID { get; set; }

    public byte QuestionType { get; set; }

    [StringLength(2000)]
    public string Content { get; set; } = null!;

    public int QuestionOrder { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal ScoreWeight { get; set; }

    public string? MetaJson { get; set; }

    [InverseProperty("Question")]
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    [ForeignKey("GroupID")]
    [InverseProperty("Questions")]
    public virtual QuestionGroup? Group { get; set; }

    [InverseProperty("Question")]
    public virtual ICollection<Option> Options { get; set; } = new List<Option>();

    [ForeignKey("QuizID")]
    [InverseProperty("Questions")]
    public virtual Quiz Quiz { get; set; } = null!;
}
