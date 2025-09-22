using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("Asset")]
[Index("OwnerType", "OwnerID", Name = "IX_Asset_Owner")]
public partial class Asset
{
    [Key]
    public int AssetID { get; set; }

    public byte OwnerType { get; set; }

    public int OwnerID { get; set; }

    public byte AssetType { get; set; }

    [StringLength(1000)]
    public string? Url { get; set; }

    public string? ContentText { get; set; }

    [StringLength(300)]
    public string? Caption { get; set; }

    [StringLength(100)]
    public string? MimeType { get; set; }
}
