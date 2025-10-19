using System;
using System.Collections.Generic;

namespace EMT_API.Models;

public partial class FlashcardSet
{
    public int SetId { get; set; }

    public int? CourseId { get; set; }

    public int? ChapterId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<FlashcardItem> FlashcardItems { get; set; } = new List<FlashcardItem>();
}
