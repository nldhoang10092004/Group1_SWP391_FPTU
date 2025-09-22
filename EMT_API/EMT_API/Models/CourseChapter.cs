using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("CourseChapter")]
[Index("CourseID", Name = "IX_Chapter_Course")]
public partial class CourseChapter
{
    [Key]
    public int ChapterID { get; set; }

    public int CourseID { get; set; }

    [StringLength(100)]
    public string ChapterName { get; set; } = null!;

    [ForeignKey("CourseID")]
    [InverseProperty("CourseChapters")]
    public virtual Course Course { get; set; } = null!;

    [InverseProperty("Chapter")]
    public virtual ICollection<CourseVideo> CourseVideos { get; set; } = new List<CourseVideo>();
}
