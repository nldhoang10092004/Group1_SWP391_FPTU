using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

[Keyless]
public partial class vUserHasActiveMembership
{
    public int UserID { get; set; }

    public int HasActiveMembership { get; set; }
}
