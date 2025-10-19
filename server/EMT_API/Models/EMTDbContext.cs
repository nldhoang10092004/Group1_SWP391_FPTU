using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Models;

public partial class EMTDbContext : DbContext
{
    public EMTDbContext()
    {
    }

    public EMTDbContext(DbContextOptions<EMTDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<FlashcardItem> FlashcardItems { get; set; }

    public virtual DbSet<FlashcardSet> FlashcardSets { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.;Database=EMTDatabase;User Id=sa;Password=12345;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FlashcardItem>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("PK__Flashcar__727E83EBAA1FE0D8");

            entity.ToTable("FlashcardItem");

            entity.Property(e => e.ItemId).HasColumnName("ItemID");
            entity.Property(e => e.BackText).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Example).HasMaxLength(500);
            entity.Property(e => e.FrontText).HasMaxLength(500);
            entity.Property(e => e.SetId).HasColumnName("SetID");

            entity.HasOne(d => d.Set).WithMany(p => p.FlashcardItems)
                .HasForeignKey(d => d.SetId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Flashcard__SetID__41EDCAC5");
        });

        modelBuilder.Entity<FlashcardSet>(entity =>
        {
            entity.HasKey(e => e.SetId).HasName("PK__Flashcar__7E08473D39DBDC16");

            entity.ToTable("FlashcardSet");

            entity.Property(e => e.SetId).HasColumnName("SetID");
            entity.Property(e => e.ChapterId).HasColumnName("ChapterID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
