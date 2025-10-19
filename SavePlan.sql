USE EMTDatabase;
GO

/* ============================================================
   SEED DATA CHO SUBSCRIPTION PLAN
   EMT - English Master Platform
   ------------------------------------------------------------
   Mỗi gói sẽ có:
     - PlanCode: mã định danh duy nhất
     - Name: tên hiển thị cho người dùng
     - Price: giá (VNĐ)
     - DurationDays: số ngày hiệu lực
   ============================================================ */

-- Xóa dữ liệu cũ (nếu cần reset)
DELETE FROM dbo.SubscriptionPlan;
DBCC CHECKIDENT ('dbo.SubscriptionPlan', RESEED, 0);
GO

-- Thêm các gói plan chính thức
INSERT INTO dbo.SubscriptionPlan (PlanCode, Name, Price, DurationDays)
VALUES
  ('MONTHLY',    N'Gói học 1 tháng',      99000,  30),
  ('QUARTERLY',  N'Gói học 3 tháng',     249000,  90),
  ('YEARLY',     N'Gói học 1 năm',       799000, 365),
  ('LIFETIME',   N'Gói trọn đời (ưu đãi đặc biệt)', 2999000, 9999);
GO

-- Kiểm tra lại dữ liệu
SELECT * FROM dbo.SubscriptionPlan;
GO

