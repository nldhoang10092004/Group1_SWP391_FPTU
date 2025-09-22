using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Table("UserDetail")]
public partial class UserDetail
{
    [Key]
    public int AccountID { get; set; }

    [StringLength(50)]
    public string? FullName { get; set; }

    public DateOnly? Dob { get; set; }

    [StringLength(100)]
    public string? Address { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? Phone { get; set; }

    [StringLength(256)]
    [Unicode(false)]
    public string? AvatarURL { get; set; }

    [ForeignKey("AccountID")]
    [InverseProperty("UserDetail")]
    public virtual Account Account { get; set; } = null!;
}
