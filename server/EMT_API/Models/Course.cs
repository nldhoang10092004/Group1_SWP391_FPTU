using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Course")]
[Index("CourseLevel", Name = "UQ_Course_Level", IsUnique = true)]
public partial class Course
{
    [Key]
    public int CourseID { get; set; }

    public int TeacherID { get; set; }

    [StringLength(100)]
    public string CourseName { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public DateTime CreateAt { get; set; }

    public byte CourseLevel { get; set; }

    [InverseProperty("Course")]
    public virtual ICollection<CourseChapter> CourseChapters { get; set; } = new List<CourseChapter>();

    [InverseProperty("Course")]
    public virtual ICollection<CourseVideo> CourseVideos { get; set; } = new List<CourseVideo>();

    [InverseProperty("Course")]
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();

    [InverseProperty("Course")]
    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    [InverseProperty("Course")]
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();


    [ForeignKey("TeacherID")]
    [InverseProperty("Courses")]
    public virtual Teacher Teacher { get; set; } = null!;


}
