using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Option")]
[Index("QuestionID", Name = "IX_Option_Question")]
[Index("QuestionID", "IsCorrect", Name = "IX_Option_Question_IsCorrect")]
public partial class Option
{
    [Key]
    public int OptionID { get; set; }

    public int QuestionID { get; set; }

    [StringLength(1000)]
    public string Content { get; set; } = null!;

    public bool IsCorrect { get; set; }

    [InverseProperty("Option")]
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    [ForeignKey("QuestionID")]
    [InverseProperty("Options")]
    public virtual Question Question { get; set; } = null!;
}
