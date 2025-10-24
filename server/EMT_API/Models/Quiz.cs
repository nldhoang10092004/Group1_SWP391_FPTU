using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Quiz")]
[Index("CourseID", "IsActive", Name = "IX_Quiz_Course")]
public partial class Quiz
{
    [Key]
    public int QuizID { get; set; }

    public int? CourseID { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    public byte QuizType { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("Quiz")]
    public virtual ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();

    [ForeignKey("CourseID")]
    [InverseProperty("Quizzes")]
    public virtual Course Course { get; set; } = null!;

    [InverseProperty("Quiz")]
    public virtual ICollection<QuestionGroup> QuestionGroups { get; set; } = new List<QuestionGroup>();

    [InverseProperty("Quiz")]
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
}
