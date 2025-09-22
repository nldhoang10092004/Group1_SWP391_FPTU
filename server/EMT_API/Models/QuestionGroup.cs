using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("QuestionGroup")]
[Index("QuizID", "GroupOrder", Name = "IX_QGroup_Quiz")]
public partial class QuestionGroup
{
    [Key]
    public int GroupID { get; set; }

    public int QuizID { get; set; }

    public int GroupOrder { get; set; }

    public byte GroupType { get; set; }

    [StringLength(2000)]
    public string? Instruction { get; set; }

    [InverseProperty("Group")]
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

    [ForeignKey("QuizID")]
    [InverseProperty("QuestionGroups")]
    public virtual Quiz Quiz { get; set; } = null!;
}
