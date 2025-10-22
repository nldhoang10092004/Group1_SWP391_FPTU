using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMT_API.Models;

public partial class Account
{
    [StringLength(88)]
    [Unicode(false)]
    public string? RefreshTokenHash { get; set; }

    public DateTime? RefreshTokenExpiresAt { get; set; }

    public int RefreshTokenVersion { get; set; }
}
