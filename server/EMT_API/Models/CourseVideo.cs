using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("CourseVideo")]
[Index("CourseID", Name = "IX_Video_Course")]
[Index("CourseID", "IsPreview", Name = "IX_Video_Course_Preview")]
public partial class CourseVideo
{
    [Key]
    public int VideoID { get; set; }

    public int ChapterID { get; set; }

    public int CourseID { get; set; }

    [StringLength(100)]
    public string VideoName { get; set; } = null!;

    [StringLength(255)]
    [Unicode(false)]
    public string VideoURL { get; set; } = null!;

    public bool IsPreview { get; set; }

    public string? ResourceJson { get; set; }

    [ForeignKey("ChapterID")]
    [InverseProperty("CourseVideos")]
    public virtual CourseChapter Chapter { get; set; } = null!;

    [ForeignKey("CourseID")]
    [InverseProperty("CourseVideos")]
    public virtual Course Course { get; set; } = null!;
}
