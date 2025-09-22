using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Teacher")]
public partial class Teacher
{
    [Key]
    public int TeacherID { get; set; }

    [StringLength(255)]
    public string? Description { get; set; }

    public DateTime JoinAt { get; set; }

    public string? CertJson { get; set; }

    [InverseProperty("Teacher")]
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    [ForeignKey("TeacherID")]
    [InverseProperty("Teacher")]
    public virtual Account TeacherNavigation { get; set; } = null!;
}
