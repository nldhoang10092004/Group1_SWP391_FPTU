using System;
using System.Collections.Generic;

namespace EMT_API.Models;

public partial class FlashcardItem
{
    public int ItemId { get; set; }

    public int SetId { get; set; }

    public string FrontText { get; set; } = null!;

    public string BackText { get; set; } = null!;

    public string? Example { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual FlashcardSet Set { get; set; } = null!;
}
