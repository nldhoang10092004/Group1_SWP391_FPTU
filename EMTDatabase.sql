/* ================================================================
   EMTDatabase — Full DDL (SQL Server)
   One-shot script: CREATE DATABASE + CREATE TABLEs + VIEW + INDEX
   Model: Membership-only (no per-course purchase)
   ================================================================= */

/* 0) CREATE DATABASE (safe if exists) */
IF DB_ID(N'EMTDatabase') IS NULL
BEGIN
    PRINT 'Creating database EMTDatabase...';
    CREATE DATABASE EMTDatabase;
END
ELSE
BEGIN
    PRINT 'Database EMTDatabase already exists. Using it.';
END
GO

USE EMTDatabase;
GO

/* ================================================================
   1) CORE ACCOUNTS
   --------------------------------------------------------------- */

/* 1. Account */
IF OBJECT_ID('dbo.Account','U') IS NOT NULL DROP TABLE dbo.Account;
CREATE TABLE dbo.Account (
    AccountID   INT IDENTITY(1,1) PRIMARY KEY,
    Username    VARCHAR(50)   NOT NULL,
    Hashpass    VARCHAR(256)  NOT NULL,
    CreateAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    Status      VARCHAR(10)   NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE/LOCKED
    Email       VARCHAR(50)   NOT NULL,
    Role        VARCHAR(10)   NOT NULL DEFAULT 'STUDENT'   -- STUDENT/TEACHER/ADMIN
);
ALTER TABLE dbo.Account ADD CONSTRAINT UQ_Account_Username UNIQUE (Username);
ALTER TABLE dbo.Account ADD CONSTRAINT UQ_Account_Email   UNIQUE (Email);
ALTER TABLE dbo.Account ADD CONSTRAINT CK_Account_Status CHECK (Status IN ('ACTIVE','LOCKED'));
ALTER TABLE dbo.Account ADD CONSTRAINT CK_Account_Role   CHECK (Role   IN ('STUDENT','TEACHER','ADMIN'));
GO

/* 2. UserDetail (1–1 với Account; PK=FK) */
IF OBJECT_ID('dbo.UserDetail','U') IS NOT NULL DROP TABLE dbo.UserDetail;
CREATE TABLE dbo.UserDetail (
    AccountID   INT            NOT NULL PRIMARY KEY,  -- shared PK
    FullName    NVARCHAR(50)   NULL,
    Dob         DATE           NULL,
    Address     NVARCHAR(100)  NULL,
    Phone       VARCHAR(20)    NULL,
    AvatarURL   VARCHAR(256)   NULL
);
ALTER TABLE dbo.UserDetail
  ADD CONSTRAINT FK_UserDetail_Account
  FOREIGN KEY (AccountID) REFERENCES dbo.Account(AccountID);
GO

/* 3. Teacher (1–1 với Account; PK=FK) + CertJson gộp chứng chỉ */
IF OBJECT_ID('dbo.Teacher','U') IS NOT NULL DROP TABLE dbo.Teacher;
CREATE TABLE dbo.Teacher (
    TeacherID    INT            NOT NULL PRIMARY KEY,     -- = AccountID
    Description  NVARCHAR(255)  NULL,
    JoinAt       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CertJson     NVARCHAR(MAX)  NULL                       -- {"certs":["https://.../cert1.png", ...]}
);
ALTER TABLE dbo.Teacher
  ADD CONSTRAINT FK_Teacher_Account FOREIGN KEY (TeacherID) REFERENCES dbo.Account(AccountID);
ALTER TABLE dbo.Teacher
  ADD CONSTRAINT CK_Teacher_CertJson_IsJson CHECK (CertJson IS NULL OR ISJSON(CertJson)=1);
GO

/* ================================================================
   2) COURSE STRUCTURE (4 fixed levels; one course per level)
   --------------------------------------------------------------- */

/* 4. Course */
IF OBJECT_ID('dbo.Course','U') IS NOT NULL DROP TABLE dbo.Course;
CREATE TABLE dbo.Course (
    CourseID     INT IDENTITY(1,1) PRIMARY KEY,
    TeacherID    INT            NOT NULL,  -- owner/đại diện
    CourseName   NVARCHAR(100)  NOT NULL,
    Description  NVARCHAR(500)  NULL,
    CreateAt     DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CourseLevel  TINYINT        NOT NULL           -- 1=Nền tảng, 2=Cơ bản, 3=Trung cấp, 4=Chuyên sâu
);
ALTER TABLE dbo.Course
  ADD CONSTRAINT FK_Course_Teacher FOREIGN KEY (TeacherID) REFERENCES dbo.Teacher(TeacherID);
ALTER TABLE dbo.Course
  ADD CONSTRAINT CK_Course_Level CHECK (CourseLevel BETWEEN 1 AND 4);
ALTER TABLE dbo.Course
  ADD CONSTRAINT UQ_Course_Level UNIQUE (CourseLevel);
GO

/* 5. CourseChapter */
IF OBJECT_ID('dbo.CourseChapter','U') IS NOT NULL DROP TABLE dbo.CourseChapter;
CREATE TABLE dbo.CourseChapter (
    ChapterID    INT IDENTITY(1,1) PRIMARY KEY,
    CourseID     INT            NOT NULL,
    ChapterName  NVARCHAR(100)  NOT NULL
);
ALTER TABLE dbo.CourseChapter
  ADD CONSTRAINT FK_Chapter_Course FOREIGN KEY (CourseID) REFERENCES dbo.Course(CourseID);
CREATE INDEX IX_Chapter_Course ON dbo.CourseChapter(CourseID);
GO

/* 6. CourseVideo (IsPreview + ResourceJson cho tài nguyên đính kèm) */
IF OBJECT_ID('dbo.CourseVideo','U') IS NOT NULL DROP TABLE dbo.CourseVideo;
CREATE TABLE dbo.CourseVideo (
    VideoID     INT IDENTITY(1,1) PRIMARY KEY,
    ChapterID   INT            NOT NULL,
    CourseID    INT            NOT NULL,
    VideoName   NVARCHAR(100)  NOT NULL,
    VideoURL    VARCHAR(255)   NOT NULL,
    IsPreview   BIT            NOT NULL DEFAULT 0,         -- preview => free
    ResourceJson NVARCHAR(MAX) NULL                        -- {"attachments":[{"id":"att-1","name":"slides.pdf","url":"...","mime":"application/pdf"}]}
);
ALTER TABLE dbo.CourseVideo
  ADD CONSTRAINT FK_Video_Chapter FOREIGN KEY (ChapterID) REFERENCES dbo.CourseChapter(ChapterID);
ALTER TABLE dbo.CourseVideo
  ADD CONSTRAINT FK_Video_Course  FOREIGN KEY (CourseID)  REFERENCES dbo.Course(CourseID);
ALTER TABLE dbo.CourseVideo
  ADD CONSTRAINT CK_CourseVideo_ResourceJson_IsJson CHECK (ResourceJson IS NULL OR ISJSON(ResourceJson)=1);
CREATE INDEX IX_Video_Course         ON dbo.CourseVideo(CourseID);
CREATE INDEX IX_Video_Course_Preview ON dbo.CourseVideo(CourseID, IsPreview) INCLUDE (VideoID, VideoName, VideoURL);
GO

/* ================================================================
   3) QUIZ (giữ nguyên như đã thống nhất)
   --------------------------------------------------------------- */

/* 7. Quiz */
IF OBJECT_ID('dbo.Quiz','U') IS NOT NULL DROP TABLE dbo.Quiz;
CREATE TABLE dbo.Quiz (
    QuizID       INT IDENTITY(1,1) PRIMARY KEY,
    CourseID     INT            NOT NULL,
    Title        NVARCHAR(200)  NOT NULL,
    Description  NVARCHAR(1000) NULL,
    QuizType     TINYINT        NOT NULL,  -- 1=Listening, 2=Reading, 3=Writing, 4=Speaking
    IsActive     BIT            NOT NULL DEFAULT 1,
    CreatedAt    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);
ALTER TABLE dbo.Quiz
  ADD CONSTRAINT FK_Quiz_Course FOREIGN KEY (CourseID) REFERENCES dbo.Course(CourseID);
CREATE INDEX IX_Quiz_Course ON dbo.Quiz(CourseID, IsActive);
GO

/* 8. QuestionGroup (tuỳ quiz – part/section) */
IF OBJECT_ID('dbo.QuestionGroup','U') IS NOT NULL DROP TABLE dbo.QuestionGroup;
CREATE TABLE dbo.QuestionGroup (
    GroupID     INT IDENTITY(1,1) PRIMARY KEY,
    QuizID      INT            NOT NULL,
    GroupOrder  INT            NOT NULL,
    GroupType   TINYINT        NOT NULL,   -- 1=Listening, 2=Reading, 3=Writing, 4=Speaking
    Instruction NVARCHAR(2000) NULL
);
ALTER TABLE dbo.QuestionGroup
  ADD CONSTRAINT FK_QGroup_Quiz FOREIGN KEY (QuizID) REFERENCES dbo.Quiz(QuizID);
CREATE INDEX IX_QGroup_Quiz ON dbo.QuestionGroup(QuizID, GroupOrder);
GO

/* 9. Question */
IF OBJECT_ID('dbo.Question','U') IS NOT NULL DROP TABLE dbo.Question;
CREATE TABLE dbo.Question (
    QuestionID     INT IDENTITY(1,1) PRIMARY KEY,
    QuizID         INT            NOT NULL,
    GroupID        INT            NULL,
    QuestionType   TINYINT        NOT NULL,     -- 1=MCQ, 2=Writing, 3=Speaking...
    Content        NVARCHAR(2000) NOT NULL,
    QuestionOrder  INT            NOT NULL DEFAULT 1,
    ScoreWeight    DECIMAL(6,2)   NOT NULL DEFAULT 1.00,
    MetaJson       NVARCHAR(MAX)  NULL
);
ALTER TABLE dbo.Question
  ADD CONSTRAINT FK_Question_Quiz   FOREIGN KEY (QuizID)  REFERENCES dbo.Quiz(QuizID);
ALTER TABLE dbo.Question
  ADD CONSTRAINT FK_Question_QGroup FOREIGN KEY (GroupID) REFERENCES dbo.QuestionGroup(GroupID);
CREATE INDEX IX_Question_Quiz  ON dbo.Question(QuizID, QuestionOrder);
CREATE INDEX IX_Question_Group ON dbo.Question(GroupID, QuestionOrder);
GO

/* 10. Option (MCQ choices) */
IF OBJECT_ID('dbo.[Option]','U') IS NOT NULL DROP TABLE dbo.[Option];
CREATE TABLE dbo.[Option] (
    OptionID   INT IDENTITY(1,1) PRIMARY KEY,
    QuestionID INT             NOT NULL,
    Content    NVARCHAR(1000)  NOT NULL,
    IsCorrect  BIT             NOT NULL
);
ALTER TABLE dbo.[Option]
  ADD CONSTRAINT FK_Option_Question FOREIGN KEY (QuestionID) REFERENCES dbo.Question(QuestionID);
CREATE INDEX IX_Option_Question          ON dbo.[Option](QuestionID);
CREATE INDEX IX_Option_Question_IsCorrect ON dbo.[Option](QuestionID, IsCorrect);
GO

/* 11. Asset (đính kèm passage/audio chung cho Group nếu cần) */
IF OBJECT_ID('dbo.Asset','U') IS NOT NULL DROP TABLE dbo.Asset;
CREATE TABLE dbo.Asset (
    AssetID     INT IDENTITY(1,1) PRIMARY KEY,
    OwnerType   TINYINT        NOT NULL,  -- 1=QuestionGroup (2=Question...) mở rộng sau
    OwnerID     INT            NOT NULL,  -- = GroupID khi OwnerType=1
    AssetType   TINYINT        NOT NULL,  -- 1=audio,2=image,3=passage_text,4=file,5=video
    Url         NVARCHAR(1000) NULL,
    ContentText NVARCHAR(MAX)  NULL,
    Caption     NVARCHAR(300)  NULL,
    MimeType    NVARCHAR(100)  NULL
);
CREATE INDEX IX_Asset_Owner ON dbo.Asset(OwnerType, OwnerID);
GO

/* 12. Attempt (lần làm bài) */
IF OBJECT_ID('dbo.Attempt','U') IS NOT NULL DROP TABLE dbo.Attempt;
CREATE TABLE dbo.Attempt (
    AttemptID   INT IDENTITY(1,1) PRIMARY KEY,
    QuizID      INT          NOT NULL,
    UserID      INT          NOT NULL,
    StartedAt   DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    SubmittedAt DATETIME2    NULL,
    AutoScore   DECIMAL(6,2) NULL,
    ManualScore DECIMAL(6,2) NULL,
    Status      NVARCHAR(20) NOT NULL DEFAULT N'in_progress'
);
ALTER TABLE dbo.Attempt
  ADD CONSTRAINT FK_Attempt_Quiz FOREIGN KEY (QuizID) REFERENCES dbo.Quiz(QuizID);
ALTER TABLE dbo.Attempt
  ADD CONSTRAINT FK_Attempt_User FOREIGN KEY (UserID) REFERENCES dbo.Account(AccountID);
CREATE INDEX IX_Attempt_UserQuiz ON dbo.Attempt(UserID, QuizID, Status);
GO

/* 13. Answer (câu trả lời từng câu) */
IF OBJECT_ID('dbo.Answer','U') IS NOT NULL DROP TABLE dbo.Answer;
CREATE TABLE dbo.Answer (
    AnswerID    INT IDENTITY(1,1) PRIMARY KEY,
    AttemptID   INT             NOT NULL,
    QuestionID  INT             NOT NULL,
    OptionID    INT             NULL,               -- cho MCQ
    AnswerText  NVARCHAR(MAX)   NULL,               -- writing/free
    AnswerUrl   NVARCHAR(1000)  NULL,               -- speaking/audio upload
    GradedScore DECIMAL(6,2)    NULL,
    Feedback    NVARCHAR(MAX)   NULL,
    AnsweredAt  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);
ALTER TABLE dbo.Answer
  ADD CONSTRAINT FK_Answer_Attempt  FOREIGN KEY (AttemptID)  REFERENCES dbo.Attempt(AttemptID);
ALTER TABLE dbo.Answer
  ADD CONSTRAINT FK_Answer_Question FOREIGN KEY (QuestionID) REFERENCES dbo.Question(QuestionID);
ALTER TABLE dbo.Answer
  ADD CONSTRAINT FK_Answer_Option   FOREIGN KEY (OptionID)   REFERENCES dbo.[Option](OptionID);
CREATE INDEX IX_Answer_Attempt    ON dbo.Answer(AttemptID);
CREATE INDEX IX_Answer_Attempt_Q  ON dbo.Answer(AttemptID, QuestionID);
CREATE INDEX IX_Answer_Q          ON dbo.Answer(QuestionID);
GO

/* ================================================================
   4) MEMBERSHIP-ONLY COMMERCE (PayOS)
   --------------------------------------------------------------- */

/* 14. SubscriptionPlan (nhiều gói: tháng/quý/năm) */
IF OBJECT_ID('dbo.SubscriptionPlan','U') IS NOT NULL DROP TABLE dbo.SubscriptionPlan;
CREATE TABLE dbo.SubscriptionPlan (
    PlanID        INT IDENTITY(1,1) PRIMARY KEY,
    PlanCode      VARCHAR(50)   NOT NULL UNIQUE,   -- MONTHLY/QUARTERLY/YEARLY
    Name          NVARCHAR(100) NOT NULL,
    Price         DECIMAL(12,2) NOT NULL,
    DurationDays  INT           NOT NULL,          -- 30/90/365...
    IsActive      BIT           NOT NULL DEFAULT 1,
    CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* 15. UserMembership (lịch sử mua/gia hạn; không auto-renew) */
IF OBJECT_ID('dbo.UserMembership','U') IS NOT NULL DROP TABLE dbo.UserMembership;
CREATE TABLE dbo.UserMembership (
    MembershipID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID       INT          NOT NULL,
    PlanID       INT          NOT NULL,
    StartsAt     DATETIME2    NOT NULL,
    EndsAt       DATETIME2    NOT NULL,
    Status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE/EXPIRED/CANCELED
    CreatedAt    DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    CanceledAt   DATETIME2    NULL
);
ALTER TABLE dbo.UserMembership
  ADD CONSTRAINT FK_UM_User FOREIGN KEY (UserID) REFERENCES dbo.Account(AccountID);
ALTER TABLE dbo.UserMembership
  ADD CONSTRAINT FK_UM_Plan FOREIGN KEY (PlanID) REFERENCES dbo.SubscriptionPlan(PlanID);
CREATE INDEX IX_UM_User ON dbo.UserMembership(UserID, Status, EndsAt DESC);
GO

/* VIEW: vUserHasActiveMembership — check quyền nhanh */
IF OBJECT_ID('dbo.vUserHasActiveMembership','V') IS NOT NULL DROP VIEW dbo.vUserHasActiveMembership;
GO
CREATE VIEW dbo.vUserHasActiveMembership
AS
SELECT
    um.UserID,
    HasActiveMembership =
      CASE WHEN MAX(CASE WHEN um.Status='ACTIVE'
                          AND SYSUTCDATETIME() BETWEEN um.StartsAt AND um.EndsAt
                         THEN 1 ELSE 0 END)=1
           THEN 1 ELSE 0 END
FROM dbo.UserMembership um
GROUP BY um.UserID;
GO

/* 16. PaymentOrder (chỉ membership) */
IF OBJECT_ID('dbo.PaymentOrder','U') IS NOT NULL DROP TABLE dbo.PaymentOrder;
CREATE TABLE dbo.PaymentOrder (
    OrderID    INT IDENTITY(1,1) PRIMARY KEY,
    BuyerID    INT          NOT NULL,               -- FK -> Account
    PlanID     INT          NOT NULL,               -- FK -> SubscriptionPlan
    Amount     DECIMAL(12,2) NOT NULL,
    Status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',  -- PENDING/PAID/CANCELED
    CreatedAt  DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    PaidAt     DATETIME2    NULL
);
ALTER TABLE dbo.PaymentOrder
  ADD CONSTRAINT FK_PO_Buyer FOREIGN KEY (BuyerID) REFERENCES dbo.Account(AccountID);
ALTER TABLE dbo.PaymentOrder
  ADD CONSTRAINT FK_PO_Plan  FOREIGN KEY (PlanID)  REFERENCES dbo.SubscriptionPlan(PlanID);
ALTER TABLE dbo.PaymentOrder
  ADD CONSTRAINT CK_PO_Status CHECK (Status IN ('PENDING','PAID','CANCELED'));
CREATE INDEX IX_PO_Buyer_Status ON dbo.PaymentOrder(BuyerID, Status, CreatedAt DESC);
GO

/* 17. WebhookEvent (idempotent cho PayOS) */
IF OBJECT_ID('dbo.WebhookEvent','U') IS NOT NULL DROP TABLE dbo.WebhookEvent;
CREATE TABLE dbo.WebhookEvent (
    WebhookID  INT IDENTITY(1,1) PRIMARY KEY,
    OrderID    INT           NOT NULL,
    UniqueKey  VARCHAR(200)  NOT NULL UNIQUE,  -- để idempotent
    Payload    NVARCHAR(MAX) NULL,
    Signature  VARCHAR(256)  NULL,
    ReceivedAt DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
ALTER TABLE dbo.WebhookEvent
  ADD CONSTRAINT FK_Webhook_Order FOREIGN KEY (OrderID) REFERENCES dbo.PaymentOrder(OrderID);
GO

/* ================================================================
   5) SUPPORT (giữ lại theo yêu cầu)
   --------------------------------------------------------------- */

/* 18. Request (yêu cầu/complaint…) */
IF OBJECT_ID('dbo.Request','U') IS NOT NULL DROP TABLE dbo.Request;
CREATE TABLE dbo.Request (
    RequestID    INT IDENTITY(1,1) PRIMARY KEY,
    UserID       INT          NOT NULL,     -- FK -> Account
    CourseID     INT          NULL,         -- liên quan khóa (nếu report nội dung)
    RequestType  TINYINT      NOT NULL,     -- 1=Refund,2=ReportIssue,3=TeacherApproval,4=Other...
    Description  NVARCHAR(MAX) NULL,
    Status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING/APPROVED/REJECTED/RESOLVED
    CreatedAt    DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    ProcessedAt  DATETIME2    NULL,
    ProcessedBy  INT          NULL          -- FK -> Account (admin xử lý)
);
ALTER TABLE dbo.Request
  ADD CONSTRAINT FK_Request_User   FOREIGN KEY (UserID)      REFERENCES dbo.Account(AccountID);
ALTER TABLE dbo.Request
  ADD CONSTRAINT FK_Request_Course FOREIGN KEY (CourseID)    REFERENCES dbo.Course(CourseID);
ALTER TABLE dbo.Request
  ADD CONSTRAINT FK_Request_Admin  FOREIGN KEY (ProcessedBy)  REFERENCES dbo.Account(AccountID);
CREATE INDEX IX_Request_User   ON dbo.Request(UserID, CreatedAt);
CREATE INDEX IX_Request_Course ON dbo.Request(CourseID);
GO

/* 19. RequestLog (log đường dẫn/IP phục vụ điều tra lạm dụng) */
IF OBJECT_ID('dbo.RequestLog','U') IS NOT NULL DROP TABLE dbo.RequestLog;
CREATE TABLE dbo.RequestLog (
    LogID      BIGINT IDENTITY(1,1) PRIMARY KEY,
    ActorID    INT           NULL,            -- AccountID; NULL nếu guest
    ActorRole  TINYINT       NULL,            -- 1=Student,2=Teacher,3=Admin
    IP         VARCHAR(45)   NULL,            -- IPv4/IPv6
    Path       NVARCHAR(500) NOT NULL,        -- ví dụ: /course/123/video/456
    CreatedAt  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_RequestLog_Actor_Time ON dbo.RequestLog(ActorID, CreatedAt DESC);
GO

/* ================================================================
   6) (OPTIONAL) SEED CƠ BẢN CHO PLAN & 4 LEVEL COURSES
   Bỏ comment nếu muốn seed nhanh.
   ---------------------------------------------------------------
-- INSERT INTO dbo.SubscriptionPlan(PlanCode, Name, Price, DurationDays)
-- VALUES ('MONTHLY', N'Gói tháng',  99000, 30),
--        ('QUARTERLY', N'Gói quý', 249000, 90),
--        ('YEARLY',   N'Gói năm',  799000, 365);

-- Ví dụ seed 4 course level rỗng (sau cập nhật TeacherID thực tế):
-- INSERT INTO dbo.Teacher(TeacherID) VALUES (1); -- giả sử AccountID=1 là teacher
-- INSERT INTO dbo.Course(TeacherID, CourseName, Description, CourseLevel)
-- VALUES (1, N'Nền tảng',  N'Level 1', 1),
--        (1, N'Cơ bản',    N'Level 2', 2),
--        (1, N'Trung cấp', N'Level 3', 3),
--        (1, N'Chuyên sâu',N'Level 4', 4);
   ================================================================ */

PRINT 'EMTDatabase created successfully with all tables/views/indexes.';

-- 1) Thêm cột lưu Google 'sub' (OIDC Subject) – ổn định & duy nhất
ALTER TABLE dbo.Account ADD GoogleSub VARCHAR(128) NULL;

-- 2) Unique cho GoogleSub nhưng cho phép nhiều NULL
CREATE UNIQUE INDEX UX_Account_GoogleSub
ON dbo.Account(GoogleSub)
WHERE GoogleSub IS NOT NULL;

-- 3) Cho phép tài khoản social-only không có mật khẩu
ALTER TABLE dbo.Account ALTER COLUMN Hashpass VARCHAR(256) NULL;

-- 4) Đảm bảo tài khoản có ít nhất 1 phương thức đăng nhập
-- (Hashpass hoặc GoogleSub). Lưu ý: CHECK này chỉ kiểm tra trong cùng bảng.
ALTER TABLE dbo.Account
ADD CONSTRAINT CK_Account_AuthPresence
CHECK (Hashpass IS NOT NULL OR GoogleSub IS NOT NULL);

-- (Khuyến nghị) Một vài cột tiện dụng cho xác thực
ALTER TABLE dbo.Account ADD LastLoginAt DATETIME2 NULL;

use EMTDatabase
ALTER TABLE [dbo].[Account] ADD
  [RefreshTokenHash]       VARCHAR(88)  NULL,
  [RefreshTokenExpiresAt]  DATETIME2    NULL,
  [RefreshTokenVersion]    INT          NOT NULL CONSTRAINT DF_Account_RTVer DEFAULT(0);

USE EMTDatabase;
GO

DELETE FROM dbo.CourseVideo;
DELETE FROM dbo.CourseChapter;
DELETE FROM dbo.Course WHERE CourseLevel = 1;
GO

DBCC CHECKIDENT ('dbo.Course', RESEED, 0);
DBCC CHECKIDENT ('dbo.CourseChapter', RESEED, 0);
DBCC CHECKIDENT ('dbo.CourseVideo', RESEED, 0);
GO

-- ===========================================
-- COURSE LEVEL 1: IELTS Nền Tảng
-- ===========================================
INSERT INTO dbo.Course (TeacherID, CourseName, Description, CourseLevel)
VALUES (4, N'IELTS Nền Tảng', N'Level 1: Nền tảng', 1);
DECLARE @CourseID_1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'CHAPTER 1 : PHÁT ÂM CƠ BẢN');
DECLARE @Chap_1_1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 1: Phân biệt bảng chữ cái và bảng phiên âm', 'https://drive.google.com/uc?export=preview&id=1rRKsGu6q8CGJKzdKdt4e4QCLv64YAKqp', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 2: Giới thiệu tổng quan bảng phiên âm IPA', 'https://drive.google.com/uc?export=preview&id=12MUT8GeEqcWk7E0s8JD7qBkBq2shGnQI', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 1: Lỗi phát âm âm cuối "s" (/s/ và /z/)', 'https://drive.google.com/uc?export=preview&id=1za61TBsL_xS3EBWIjJJkjqdHV72fe8o-', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 2: Lỗi phát âm âm /θ/ và /ð/', 'https://drive.google.com/uc?export=preview&id=12rHy4E60RdrnV77kWihnU4m1cEagpuA6', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 3: Bắt lỗi 15 từ vựng dễ phát âm sai', 'https://drive.google.com/uc?export=preview&id=1wxWdC6GOCv0OfGFfDPCrSPuLrFxIf6b-', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 1: Tổng quan Âm nguyên âm', 'https://drive.google.com/uc?export=preview&id=1OkK7LGpAQdIbhpeVTGj0qAxGs_TESepD', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 2: Phân biệt cặp nguyên âm /i:/ - /i/', 'https://drive.google.com/uc?export=preview&id=12yBWqclMpA1_2nvLXuQNJe2jMaL9FjNy', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 3: Phân biệt cặp nguyên âm /u:/ - /u/', 'https://drive.google.com/uc?export=preview&id=17XAz2L9uyTiKOGjuYpzvWH2P8YoCLiiQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 1: Phân biệt cặp nguyên âm /a:/ - /ʌ/', 'https://drive.google.com/uc?export=preview&id=11ZrkQqgvVEkM4RZsH34_bkCeEfgwI-E5', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 2: Phân biệt cặp nguyên âm /ɒ/ - /ɔ:/', 'https://drive.google.com/uc?export=preview&id=1XgCyeWMW3TAxOZ24g1crDHMEQDHPnbYN', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 1: Phân biệt cặp nguyên âm /e/ - /æ/', 'https://drive.google.com/uc?export=preview&id=1fpvYysidoPrH9X8U2HI2Eaf6_gLqS7SX', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_1, N'Section 2: Phân biệt cặp nguyên âm /ə/ - /ɜ:/', 'https://drive.google.com/uc?export=preview&id=1M3hWE5N1_0w2fMVTE3Bqa-OmE0zDKP2C', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 2: TỪ VỰNG CƠ BẢN');
DECLARE @Chap_1_2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 1: Quốc gia và quốc tịch', 'https://drive.google.com/uc?export=preview&id=1ffj-5sy67Qi4zqO1VFwdf42o17XIHxNB', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 2: Số đếm', 'https://drive.google.com/uc?export=preview&id=1yaglVWrbb3G8QRbSHXEeUBs3dF5qc8sW', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 3: Các tính từ phổ biến', 'https://drive.google.com/uc?export=preview&id=1Cb468rTWigWh26BcRFUM4jLJbYv2tMZ7', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 1: Thời tiết', 'https://drive.google.com/uc?export=preview&id=1AVnPUVyCG_tGsFP8IiuqusWmx6AeIERY', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 2: Các loại động vật', 'https://drive.google.com/uc?export=preview&id=1c4U4LkKUyAwSf86su35ezK8SjPBEWV41', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_2, N'Section 3: Địa điểm', 'https://drive.google.com/uc?export=preview&id=1XbPQajkZGMIaDD2A2meqeKps8Tv_h6f6', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 3: PHÁT ÂM CƠ BẢN');
DECLARE @Chap_1_3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_3, N'Section 1: Tổng quan âm nguyên âm đôi - Bộ 3 nguyên âm đôi /ɪə/, /eə/, /ʊə/', 'https://drive.google.com/uc?export=preview&id=1_kzHMQ5qXcRpX1xq4RuqMxKWaNhNSsQg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_3, N'Section 2: Bộ 3 nguyên âm đôi /eɪ/, /aɪ/, /ɔɪ/', 'https://drive.google.com/uc?export=preview&id=1j5MH06bupQ9hzrn5spY5k0Os77fRMA6S', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_3, N'Section 3: Cặp nguyên âm đôi /əʊ/, /aʊ/', 'https://drive.google.com/uc?export=preview&id=1-tHu5B7pGbXxQgCecs3YfBS4SmDC5Xyz', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_3, N'Section 1: Tổng kết âm nguyên âm', 'https://drive.google.com/uc?export=preview&id=1OkK7LGpAQdIbhpeVTGj0qAxGs_TESepD', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 4: TỪ VỰNG CƠ BẢN');
DECLARE @Chap_1_4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_4, N'Section 1: Thói quen hàng ngày', 'https://drive.google.com/uc?export=preview&id=1ITAHIO-m4t5P2GMSxM2UdPKszLqpgqfM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_4, N'Section 2: Chuyến đi', 'https://drive.google.com/uc?export=preview&id=1ybenQ3K4-i2D5m4KaOJp1mmwKQ3VGZfu', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_4, N'Section 3: Làm việc nhà', 'https://drive.google.com/uc?export=preview&id=1umlC0-u4n876zXHSdA-uu_MtF9ldtu_k', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_4, N'Section 1: Các mối quan hệ gia đình', 'https://drive.google.com/uc?export=preview&id=1Bsy6tsJVQ7ellOryktXLpD7rzEsNnUSf', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_4, N'Section 2: Các bữa ăn trong gia đình', 'https://drive.google.com/uc?export=preview&id=1le1GwvPf11zHehSfQXdtVngob8vqY_AG', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 5: PHÁT ÂM CƠ BẢN');
DECLARE @Chap_1_5 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 1: Tổng quan âm phụ âm - Cặp phụ âm /p/, /b/', 'https://drive.google.com/uc?export=preview&id=1l1FoQg8bMjZH0icht8ZB3airAK9NYF78', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 2: Các cặp phụ âm /t/ - /d/, /k/ - /g/, /w/ - /j/', 'https://drive.google.com/uc?export=preview&id=1BUhfOcqaDcgTqZagaktyAq6waQZfA7EA', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 1: Bộ 3 phụ âm /m/, /n/, /ŋ/', 'https://drive.google.com/uc?export=preview&id=1Q1Unp5VVRYa_b6ybGdG5j4FOp-CoESY9', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 2: Bộ 3 phụ âm /h/, /l/, /r/', 'https://drive.google.com/uc?export=preview&id=1hrdE3aC0ApXu7W5LIm7V_IYoJ8Zic8ka', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 1: Cặp âm phụ âm /f/ - /v/, /∫/ -/ʒ/, /t∫/ - /dʒ/', 'https://drive.google.com/uc?export=preview&id=16B6tkcNKN4T-7MUFBru-JpdUx61yLiFc', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_5, N'Section 2: Tổng ôn âm phụ âm', 'https://drive.google.com/uc?export=preview&id=1VAc7G_uoO1LnLTkquS-BwCddf0ArMRVI', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 6: TỪ VỰNG CƠ BẢN');
DECLARE @Chap_1_6 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_6, N'Section 1: Mô tả căn nhà', 'https://drive.google.com/uc?export=preview&id=1A26cQ4wWvjk5xqJ1J3qsRZ7SwMQlKMSH', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_6, N'Section 2: Mô tả căn phòng', 'https://drive.google.com/uc?export=preview&id=1L6GfrA-4c_G1ej7v9KbCP3neQXxAY1pv', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_6, N'Section 1: Cơ thể con người', 'https://drive.google.com/uc?export=preview&id=100VBuM7IB9v1Q8Sx00uRVB-ppSFQ3LIW', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_6, N'Section 2: Sức khỏe con người', 'https://drive.google.com/uc?export=preview&id=1ELiEUWbi2GdA5j9GfBZta3WL2ZTz5I7L', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_6, N'Section 3: Hoạt động giải trí', 'https://drive.google.com/uc?export=preview&id=1YBAyi2MLM_1SeicPg5XuDr-a-UeGvoYZ', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 7: Phát âm - Từ vựng CƠ BẢN (Part 2)');
DECLARE @Chap_1_7 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 1: Âm tiết và trọng âm từ 2 âm tiết', 'https://drive.google.com/uc?export=preview&id=19O7cYSzokwCYK_aCKKxddSA37Xy0tkcp', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 2: Trọng âm từ 3 âm tiết trở lên và từ ghép', 'https://drive.google.com/uc?export=preview&id=1ALmFqjK35CKkbGoQyO9d3MnAMZDg-TRp', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 3: Tổng kết trọng âm', 'https://drive.google.com/uc?export=preview&id=1ink6s8ymJijgV9bq5fYGmiabh76PGvfY', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'SECTION 1: Mua sắm', 'https://drive.google.com/uc?export=preview&id=1PtkvwTnbGKfUQgRpaIwUPqIiWrXNzZ5C', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'SECTION 2: Học tập', 'https://drive.google.com/uc?export=preview&id=1MXGaOdCY9WpZ-jph4KVFvJ87bsmjRjoC', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 1: Du lịch và các kì nghỉ', 'https://drive.google.com/uc?export=preview&id=1jpVykfBztXZIbZctAXBwX2UQeesyt6-m', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 2: Âm nhạc và phim ảnh', 'https://drive.google.com/uc?export=preview&id=1vuKgFo9Ela9R_4lz7ePFhRf7y8Vu1hJO', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 3: Thể thao', 'https://drive.google.com/uc?export=preview&id=19W1_6zSEKvH6lzf2B8sWLbLS6Khgb0nL', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 1: Công việc và đồng nghiệp', 'https://drive.google.com/uc?export=preview&id=1PDD-5CDLI5vrTLz6lISop-06tKXxak2d', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 2: Phương tiện giao thông', 'https://drive.google.com/uc?export=preview&id=1R47XxRVdazYituwnEnLi7VaX-7e1QFQQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 3: Trang phục', 'https://drive.google.com/uc?export=preview&id=1z5oRHID8UaPhAreduc9YlcybEB2e2E1Y', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_7, N'Section 1: Công nghệ', 'https://drive.google.com/uc?export=preview&id=1keVn5Omy8mFIhlRWKDDaWrfJRH_JUgNT', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 8: NGỮ PHÁP CƠ BẢN PLUS');
DECLARE @Chap_1_8 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'SECTION 1.1: INTRODUCTION', 'https://drive.google.com/uc?export=preview&id=12vXl7pZBlgQNOHlh5jcggZ4Qr2yh3A9W', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'SECTION 1.2: INTRODUCTION', 'https://drive.google.com/uc?export=preview&id=1DAJt7kPl9SzP8GNN80BedXmD1X-Zua9_', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'Section 1: Các loại danh từ', 'https://drive.google.com/uc?export=preview&id=16aKekK9v5TeRg0MNvXP2NW0Jv9Gss6iV', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'Section 2: Danh từ đếm được và không đếm được. Số ít và số nhiều', 'https://drive.google.com/uc?export=preview&id=1zwdlsQUK2wwCK3GAHAE-jZria9VwtFnT', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'Section 3: Sở hữu cách', 'https://drive.google.com/uc?export=preview&id=1ZaOrqfKpO3Z8KSnfgcX9vmkiaA2iVWuX', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_8, N'Section 4: Hạn định từ', 'https://drive.google.com/uc?export=preview&id=1KMM1gpn5jyr0HG0X4zOx-KSZ0UjQEf81', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_1, N'Chapter 9: NGỮ PHÁP CƠ BẢN PLUS');
DECLARE @Chap_1_9 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 1: Các loại động từ', 'https://drive.google.com/uc?export=preview&id=1XhANi64LAUSmZNmxo_Bv9B90kcUHN_-p', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2.1: Thì hiện tại đơn', 'https://drive.google.com/uc?export=preview&id=1XOrE4MPsAL_iDxYg5F1U6vrvPfDEBTgQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2.2: Thì hiện tại đơn', 'https://drive.google.com/uc?export=preview&id=1CFqgTyqWwOErhYh3r6HmFe7lp2e7Bc2N', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 3: Thì hiện tại tiếp diễn', 'https://drive.google.com/uc?export=preview&id=1GTrjVNzC1AnqmIE35cYaFQv6Hmo1wV-x', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 4: Thì quá khứ đơn', 'https://drive.google.com/uc?export=preview&id=1ixfEPALv3IA0Hq837uUkNh_CM5lkfIQl', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 5: Thì tương lai đơn và tương lai gần', 'https://drive.google.com/uc?export=preview&id=150pdgB5wUwB6SLNCTTBhqGUp-iFBpKX0', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 6: Danh động từ và Động từ nguyên thể', 'https://drive.google.com/uc?export=preview&id=1qlaYwDFGUDSX4r2G-i0x_tR02XSm27BM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 1: Đại từ nhân xưng', 'https://drive.google.com/uc?export=preview&id=1gvMrsja0ruWi8Xb0bLATehxUpP0aFRMO', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2: Tính từ sở hữu và Đại từ sở hữu', 'https://drive.google.com/uc?export=preview&id=1rfQ444RrBJSsAFaZEPnpqpu4oDxuqMT9', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 3: Đại từ phản thân', 'https://drive.google.com/uc?export=preview&id=1C-aF93y9Mtapr7_1R8gE_ZJ5KR1sdm-t', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 1: Tính từ', 'https://drive.google.com/uc?export=preview&id=1t3tPsdA0wSlR2S0YXVh38nUzXgTDZ_32', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2: Thứ tự tính từ', 'https://drive.google.com/uc?export=preview&id=1oFLfNYqXJYAvEtRfv0O3iv-pmbanetXM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 3: Trạng từ', 'https://drive.google.com/uc?export=preview&id=1NTNeTOxQPwa-8wNVkpX0sSDgQX-hFs-M', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 4: Vị trí trạng từ', 'https://drive.google.com/uc?export=preview&id=1WceksdXPRrfxWWzH7U9gKs-OQiCxQDlb', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 5: So sánh tính từ/ trạng từ', 'https://drive.google.com/uc?export=preview&id=1_FJWdVD5Nv4_m7o5MLSOAfK6fX8En_u4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 1: Giới từ chỉ địa điểm', 'https://drive.google.com/uc?export=preview&id=1Jo1Uro547vOStl5KEFelfzSw8JlGeA51', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2: Giới từ chỉ thời gian', 'https://drive.google.com/uc?export=preview&id=1v3xPYmc1PD-_iGeNVKqC7WFQjMJM6Hb9', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 1: Bổ ngữ', 'https://drive.google.com/uc?export=preview&id=1W6N5X9opJZE2tA9nizcURRieHBCGrEqi', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 2: Các mẫu câu (1)', 'https://drive.google.com/uc?export=preview&id=1PuQH5TTBPUal7XIz7y307fs_732Dm52w', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_1, @Chap_1_9, N'Section 3: Các mẫu câu (2)', 'https://drive.google.com/uc?export=preview&id=1snfZNl9Mg5-A8faElSzLSk2LPAMe_g1E', 0);

-- ===========================================
-- COURSE LEVEL 2: IELTS Cơ Bản
-- ===========================================
INSERT INTO dbo.Course (TeacherID, CourseName, Description, CourseLevel)
VALUES (4, N'IELTS Cơ Bản', N'Level 2: Cơ bản', 2);
DECLARE @CourseID_2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_2, N'Chapter 1: IELTS LISTENING CƠ BẢN');
DECLARE @Chap_2_1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 1: Xác định từ khóa', 'https://www.youtube.com/embed/pG6jfmgfVxA', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 2: Dự đoán trước đáp án', 'https://www.youtube.com/embed/DoTeuHeqXWM', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 1: Dự đoán đáp án trên phương diện ngữ pháp', 'https://www.youtube.com/embed/fxHPs-fOND4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 2: Dự đoán đáp án bằng ngôn ngữ chỉ dẫn', 'https://www.youtube.com/embed/zGfyOCOEepM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Kĩ năng ghi chú', 'https://www.youtube.com/embed/D5CkBmf_6Ck', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 1: Nghe hiểu nội dung qua tiền tố, hậu tố', 'https://www.youtube.com/embed/jYsysnmIe3U', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Section 2: Nghe hiểu nội dung bằng kỹ năng xác định trọng âm', 'https://www.youtube.com/embed/_-UmZsYeYL8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Dạng câu hỏi nhiều lựa chọn ( (Multiple-choice )', 'https://www.youtube.com/embed/R3wYg4Jo7UI', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Dạng câu hỏi điền từ vào chỗ trống (Gap-filling)', 'https://www.youtube.com/embed/WNRG1xAtjEw', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_1, N'Dạng câu hỏi nối (Matching)', 'https://drive.google.com/uc?export=preview&id=1Ct4Ewxbrb77Dp2fuwKBicNFfmNUdfAwD', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_2, N'Chapter 2: writing cơ bản');
DECLARE @Chap_2_2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_2, N'Section 1: Mệnh đề, Câu đơn, Câu ghép', 'https://www.youtube.com/embed/FB6hKNxwO8U', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_2, N'Section 2: Câu phức, Câu phức ghép', 'https://www.youtube.com/embed/S3YNKFXn-OI', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_2, N'Section 1: Cách cải thiện kỹ năng viết câu', 'https://www.youtube.com/embed/8zsD2bD6R4k', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_2, N'Section 2: Các lỗi viết câu thường gặp', 'https://www.youtube.com/embed/1hXMBZZl8aU', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_2, N'Chapter 3: IELTS READING CƠ BẢN');
DECLARE @Chap_2_3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_3, N'Section 1: Nhận biết từ đồng nghĩa, trái nghĩa và paraphrase (1)', 'https://www.youtube.com/embed/H0IX2AV3Cg0', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_3, N'Section 2: Nhận biết từ đồng nghĩa, trái nghĩa và paraphrase (2)', 'https://www.youtube.com/embed/yMmG0DC8Y6g', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_2, N'Chapter 4: IELTS SPEAKING CƠ BẢN');
DECLARE @Chap_2_4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_4, N'Section 1: Đưa ra thông tin và miêu tả về bản thân', 'https://www.youtube.com/embed/J9e_sKqEOI8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_4, N'Section 2: Thể hiện sở thích của bản thân (1)', 'https://www.youtube.com/embed/eQTlyFg4ZlY', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_4, N'Section 3: Thể hiện sở thích của bản thân (2)', 'https://www.youtube.com/embed/ixVqBk8q-ww', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_4, N'Section 1: Thể hiện cảm xúc và quan điểm (1)', 'https://www.youtube.com/embed/P3n1yJaT4k8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_2, @Chap_2_4, N'Section 2: Thể hiện cảm xúc và quan điểm (2)', 'https://www.youtube.com/embed/s1Toc2m9dA0', 0);

-- ===========================================
-- COURSE LEVEL 3: IELTS Trung Cấp
-- ===========================================
INSERT INTO dbo.Course (TeacherID, CourseName, Description, CourseLevel)
VALUES (4, N'IELTS Trung Cấp', N'Level 3: Trung cấp', 3);
DECLARE @CourseID_3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_3, N'Chapter 1: IELTS LISTENING TRUNG CẤP');
DECLARE @Chap_3_1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Overview of the test', 'https://drive.google.com/uc?export=preview&id=1Qcv2z8a5f8V4mG9-vc1sEa8Xbd4oHW82', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Completion', 'https://drive.google.com/uc?export=preview&id=17U9h2Q9lMBcaEAgcsHTQy452XAI1qKKy', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Flowchart', 'https://drive.google.com/uc?export=preview&id=1kEuY5Wcg6BEWoo8Yif6ZwisRkGjhZMEl', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Short - answer questions', 'https://drive.google.com/uc?export=preview&id=17gQ6NGXW6vVoA4O2gLoWuvc9yezlRkyj', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Short Answer Question and Gap-filling Questions', 'https://drive.google.com/uc?export=preview&id=1N2CPnQRiXEE15IC1VXrZv1PPbgWO6x61', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Multiple choice questions', 'https://drive.google.com/uc?export=preview&id=1nSwI221Saiz6OmWoDb2SCVZ1-mDEzxlQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Pick from a list', 'https://drive.google.com/uc?export=preview&id=1UejHh0Fmc7KoyVcFNtHNFvuISveFBh0G', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Matching', 'https://drive.google.com/uc?export=preview&id=1xo9DevyZnBIpSdpJvFj_IFR443RSCmIO', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Labelling a map', 'https://drive.google.com/uc?export=preview&id=16164cbAIt-8uQQyogtjdUcYo16xBRoAe', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_1, N'Labelling a diagram', 'https://drive.google.com/uc?export=preview&id=11VLFpBc6sqc_iSItvhOZuktz0-ts4_Sr', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_3, N'Chapter 2: IELTS WRITTING TRUNG CẤP');
DECLARE @Chap_3_2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Introduction', 'https://drive.google.com/uc?export=preview&id=1osFibyN1gtN26ECHIp5ZlwcrF04CXlyg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Introduction to Writing Task 1', 'https://drive.google.com/uc?export=preview&id=1G96YT0H3m0VbCKgdvx73ptVOWOnamKtg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Charts with Trends', 'https://drive.google.com/uc?export=preview&id=1IiGMI61LRZ-6JXHUmfAo9gOWrg-llyWe', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Charts of Comparison', 'https://drive.google.com/uc?export=preview&id=1TBoVEhavoln2VyEVcxVYuPiSIgZTo4Se', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Mixed Charts', 'https://drive.google.com/uc?export=preview&id=1TGEK8KCQr70wKc31BJL7qCKz0w729CB1', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Maps', 'https://www.youtube.com/embed/ZCUJl3QBtvs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Diagrams', 'https://drive.google.com/uc?export=preview&id=1IN70oBpGCYxNt8cDl2bLWtF2eQUf0J6r', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Introduction to Writing Task 2', 'https://www.youtube.com/embed/Qk47EXNLYP8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Argumentative Essay without Opinion', 'https://www.youtube.com/embed/kujIXJfZxN8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Discussion', 'https://drive.google.com/uc?export=preview&id=10r5tG4inaYm0n-wl_yD76qeoBcvK2v5d', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_2, N'Problem/ Cause - Solution Essays', 'https://www.youtube.com/embed/dp-3pyqw84Y', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_3, N'Chapter 3: IELTS READING TRUNG CẤP');
DECLARE @Chap_3_3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Tổng quan về bài thi IELTS Reading và Giới thiệu khóa học', 'https://www.youtube.com/embed/If-GXbFV1g4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Các hiểu nhầm và kỹ nằng xử lý bài thi IELTS reading', 'https://drive.google.com/uc?export=preview&id=1kNsT0PcEW4G-mAhxzQqGn8kgvBTp-Q9N', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Matching Headings & Summary Completion', 'https://drive.google.com/uc?export=preview&id=1le5yizHn6sICpBDLpjHvzEfhFVCXry24', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Short Answer Questions & Gap-filling Questions', 'https://drive.google.com/uc?export=preview&id=1zlPtkOZsAjUhgeYPl64gDiA9O7ovV_n1', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'True/False/Not Given and Yes/No/Not given', 'https://www.youtube.com/embed/eIdhfz_5kgU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Multiple Choice Questions & Picking from a list', 'https://drive.google.com/uc?export=preview&id=1Zzlhc3PTEM1VS866hjZl2mBZGHmE5FsK', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_3, N'Matching Information, Matching Sentence Endings & Matching Names to Opinions (Classification)', 'https://drive.google.com/uc?export=preview&id=1RDFBD3pCZvig-_ZZTzLnCF_SXM4xF6_F', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_3, N'Chapter 4: IELTS SPEAKING TRUNG CẤP');
DECLARE @Chap_3_4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Giới thiệu về IELTS Speaking', 'https://www.youtube.com/embed/Ct2DLnCPed8', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Mở rộng phạm vi và tính chính xác của ngữ pháp', 'https://www.youtube.com/embed/7dEXkq7uj4g', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Tăng độ trôi chảy và mạch lạc cho bài nói', 'https://drive.google.com/uc?export=preview&id=10GWSNqnkkOC1L0wFNBJb-Cp_c7iKrCdR', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề miêu tả người', 'https://drive.google.com/uc?export=preview&id=1snC9kWSsD240XK9xIyVJF-aTr3VHUfn3', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề miêu tả địa điểm', 'https://drive.google.com/uc?export=preview&id=1_Ho9Wa4Hj75RShu-abEHEGKFYRgi3uOm', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề miêu tả đồ vật', 'https://drive.google.com/uc?export=preview&id=1RaC7S1H0JmMkownMbfejR5fRYKdC5Z6N', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề miêu tả sự kiện và trải nghiệm', 'https://drive.google.com/uc?export=preview&id=12VUaCb-zje82ENMTcSqfRy8OiNyzS7UU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm Chủ đề Phương tiện truyền thông', 'https://drive.google.com/uc?export=preview&id=1WDNGzA7CBivuyAwDgNyrq-A_G05Iii75', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề Sở thích', 'https://drive.google.com/uc?export=preview&id=16bqZWuk9jbDZCDuBZ29nGHKEjOFnhORg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_3, @Chap_3_4, N'Nhóm chủ đề Khác', 'https://www.youtube.com/embed/f0W-6WV6SLY', 0);
-- ===========================================
-- COURSE LEVEL 4: IELTS Chuyên Sâu
-- ===========================================
INSERT INTO dbo.Course (TeacherID, CourseName, Description, CourseLevel)
VALUES (4, N'IELTS Chuyên Sâu', N'Level 4: Chuyên sâu', 4);
DECLARE @CourseID_4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_4, N'Chapter 1: SPEAKING CHUYÊN SÂU PLUS');
DECLARE @Chap_4_1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Common pronunciation mistakes', 'https://drive.google.com/uc?export=preview&id=13S1BBYL_xUpKLXB93jaI4YRDAo4Ggyug', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Giới thiệu khoá học', 'https://drive.google.com/uc?export=preview&id=1VC74CCIofw-jCudh0EooptXJSY-nGGXC', 1);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Form Filling', 'https://drive.google.com/uc?export=preview&id=1XjwWnDB2txThvIUkBySaftH5IeScJpi7', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Further practice: Form Filling', 'https://drive.google.com/uc?export=preview&id=13VgcuaSYbXZYLZA6Q2sPf82dn8Xx1nfL', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Các dạng bài trong IELTS Writing task 1', 'https://www.youtube.com/embed/Hcw_ngS3_s4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Các dạng bài trong IELTS Writing task 2 (1)', 'https://www.youtube.com/embed/GAojBjv8ypg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Các dạng bài trong IELTS Writing task 2 (2)', 'https://www.youtube.com/embed/YgzPsv3xNmg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Task achievement', 'https://drive.google.com/uc?export=preview&id=1ugk-F1NJh4LjAJWQ0gsKq2doEw3HSPPP', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Coherence and cohesion', 'https://drive.google.com/uc?export=preview&id=1Md9ZXI9isG9XC_jXpybrWVQOT5gG_JgC', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Lexical resource, Grammatical range and accuracy', 'https://drive.google.com/uc?export=preview&id=19Y60eFmfgfxOkGi4hB7JtiYuwPxENfPT', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Giới thiệu khóa học và Hướng dẫn học', 'https://drive.google.com/uc?export=preview&id=1oXloijvxrk03rJUIbAocK-H1kNJpB7vU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Reading passage 1: T/F/NG, Short answer', 'https://drive.google.com/uc?export=preview&id=1hEiC1VztGbyPqd3gMtBDm-xQ9OjGcoM4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Ứng dụng vào IELTS SPEAKING', 'https://drive.google.com/uc?export=preview&id=1OYIdcwfrUhga630Z1aTYnYS4GAxNK5p6', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Instructor & Course Introduction', 'https://www.youtube.com/embed/9d0n0uZtmZc', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Marking Criteria', 'https://www.youtube.com/embed/f6EGQbCsrCU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 3: Brainstorming Method', 'https://www.youtube.com/embed/J7XnNu7Z5pU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Learning method: Guided Discovery', 'https://www.youtube.com/embed/g2za3LdxDlg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Fluency & Pronunciation Training: FER & Sentence Stress', 'https://www.youtube.com/embed/bb-kjPDFPtM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 3: Vocabulary', 'https://www.youtube.com/embed/ZIv-FuU2Dxg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 4: Grammar', 'https://www.youtube.com/embed/N9jLzIByWYg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Multiple Choice Questions with single and multiple answer', 'https://drive.google.com/uc?export=preview&id=1JmurUiJg0HIwexvhWr0xDkp0bQyd98sw', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Objective', 'https://drive.google.com/uc?export=preview&id=1HbtVI7nhynwSVM0EHC2pvDe0qObHa6iF', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Tentative', 'https://drive.google.com/uc?export=preview&id=1dXpfC5UNOenxglwGAVo-R04FF3-Ha--0', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Reading Passage 1: T/F/NG, Table/ Note/ Summary Completion', 'https://drive.google.com/uc?export=preview&id=1HI1fmgt66igJkhH1YiAzzMliPk9MpJwf', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Ứng dụng vào IELTS SPEAKING', 'https://drive.google.com/uc?export=preview&id=1t00KhxypBblZ_-F1roLMnIEylp81bgwj', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Fluency & Pronunciation Training', 'https://www.youtube.com/embed/TpogPXtnVqQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/6e_D9Qjsx0A', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 3: Grammar: Relative Clauses - Prediction', 'https://www.youtube.com/embed/Nm8ALZJSrY0', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Ideas: Question Type & Key Words', 'https://drive.google.com/uc?export=preview&id=1p4dvtMrb06aE7jAvgYARvLUSXNkKITxb', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Ideas: Brainstorming', 'https://drive.google.com/uc?export=preview&id=1W0mXr9MjLlzrZdSHDCuBP4tnLKXGnIGk', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Structure: The Skeleton', 'https://drive.google.com/uc?export=preview&id=1DGfgbqy0E0zb68WT1WXaa9yQwFM0FH8v', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Structure: Language', 'https://drive.google.com/uc?export=preview&id=1Uk_5aQmR6pfuGZfaXKNiYK7r5jorNkga', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Structure: Paraphrasing & Referencing', 'https://drive.google.com/uc?export=preview&id=1YLrn9AA_stU-VFmHFbQCgxqWdiaT3cKx', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Linking: Ideas to Sentences', 'https://drive.google.com/uc?export=preview&id=1Hlzq_M023GewGekz8VMzQUc8zatnqgz6', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Linking: Add Linking Devices', 'https://drive.google.com/uc?export=preview&id=10z7rWB9k7gMohRSbBbwp3orLczoOYzIU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1FcK7ra2my96sDS88Rd7KWKBE7BiPTXXi', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Reading passage 2: Matching information Sentence completion', 'https://drive.google.com/uc?export=preview&id=1FH8rW7qbX3YTkVZ0U4778GnPUKx0Sob3', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Ứng dụng vào IELTS SPEAKING', 'https://drive.google.com/uc?export=preview&id=1_dTzOr1pjO2rTy6nmcfrffAip3RQdUGU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 1: Fluency & Pronunciation Training', 'https://www.youtube.com/embed/BPnC_QeilTU', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/7MmzmpgwwXs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_1, N'Section 3: Grammar', 'https://www.youtube.com/embed/ACYDH_w6J3w', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_4, N'Chapter 3: LISTENING CHUYÊN SÂU');
DECLARE @Chap_4_2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Multiple Choice Questions with single and multiple answer - Part 3', 'https://drive.google.com/uc?export=preview&id=1LicKtP5ZxcTkOx_DhCp3s_JRM0Sr-S-Q', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Ideas: Question Type & Key Words', 'https://drive.google.com/uc?export=preview&id=1ShIe8qB6rZVF82PyTscV-7IY16FpLBRL', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Ideas: Brainstorming', 'https://www.youtube.com/embed/bG8qhy4LYEM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Structure: The Skeleton', 'https://drive.google.com/uc?export=preview&id=1yLaD5Op1N1RW-EGcoIQmB0MMARCwrB2x', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Structure: Language', 'https://drive.google.com/uc?export=preview&id=1iPqS-dliE4DHoBNkcLt0tnjh8td2ElHs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Structure: Paraphrasing & Referencing', 'https://drive.google.com/uc?export=preview&id=1l40CrsIpTMigD-kwNmfuuq-M4kteKWSs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Linking: Ideas to Sentences', 'https://www.youtube.com/embed/AEZxCPEqrJk', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Linking: Add Linking Devices', 'https://www.youtube.com/embed/Vh5Sdjd6g2U', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Linking: ISL', 'https://www.youtube.com/embed/0OcQgP8SLeE', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Section 1: Reading passage 2: MCQ, Summary completion, Y/N/NG', 'https://drive.google.com/uc?export=preview&id=1Rnu2wdrE4VomZxuLEweUPPtiudFN8gJQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_2, N'Section 2: Ứng dụng vào IELTS SPEAKING', 'https://drive.google.com/uc?export=preview&id=1r6M623Ni9hDgp8XjGDD1pRF6vcKXH2Ug', 0);

INSERT INTO dbo.CourseChapter (CourseID, ChapterName)
VALUES (@CourseID_4, N'Chapter 4: LISTENING CHUYÊN SÂU');
DECLARE @Chap_4_3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Question Type & Key Words', 'https://drive.google.com/uc?export=preview&id=19PkFjjXXt6hQUOrR4oCMTeXyHVdZ9tpj', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Brainstorming', 'https://drive.google.com/uc?export=preview&id=1nUzZXdqGB1OWpXoZfnV9pqLAY4rQDuqs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: The Skeleton', 'https://drive.google.com/uc?export=preview&id=1OuC1v5-PrvlBV226jLFZm9AhxFcQKcYb', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Language', 'https://drive.google.com/uc?export=preview&id=1W7vUxcTJzM1RMwd1pjhwaD-qB_klOUyx', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Paraphrasing & Referencing', 'https://drive.google.com/uc?export=preview&id=1iuPEY5zCtgW8_fvjiwgymus_bubTIaM6', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: Ideas to Sentences', 'https://drive.google.com/uc?export=preview&id=1lvz02zssEWhieQoUqebOp8r7VLhft3rZ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: Add Linking Devices', 'https://drive.google.com/uc?export=preview&id=1KOE6Q55Y85zXa5YG-h0lSiAgOlASJmui', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1ckzQpW7vqRiidhkQsYNh_7ihWdMvEXbC', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Reading passage 3: Matching information, MCQ, Summary', 'https://drive.google.com/uc?export=preview&id=1XgFkiJ3M7La3R30ZAqyfWzNoe3SE7stz', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Ứng dụng vào IELTS WRITING', 'https://drive.google.com/uc?export=preview&id=15yKK9quLNXEGcVIzAbvLM__H82hBw6jt', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Fluency & Pronunciation Training', 'https://www.youtube.com/embed/byivGumsZgQ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/M_cToFMkxHM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 3: Grammar: Giving Reasons - Correcting Yourself', 'https://www.youtube.com/embed/p-BqhqlNj0M', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Matching information', 'https://drive.google.com/uc?export=preview&id=1QiOfWrLJASXfOnHqe_-xUDF-72ukN3-I', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Reading passage 3: Summary, MCQ, matching sentence endings', 'https://drive.google.com/uc?export=preview&id=16hR9gJCny7kZNU0Xwzp_tR0SKX6GR4YI', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Ứng dụng vào IELTS WRITING', 'https://drive.google.com/uc?export=preview&id=1Lg4aSE8mSRBRTCILU231eXZccYJbFhks', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Fluency & Pronunciation Training', 'https://www.youtube.com/embed/ezlYXiMiX3U', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/yVhWLKuq_Zs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 3: Grammar: Generalization & Distancing - Opinion Questions: Importance', 'https://drive.google.com/uc?export=preview&id=1wQXkuAKvO5hbJgWaGgW0z0xnBw64XnRs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Sentence completion, short answer question', 'https://drive.google.com/uc?export=preview&id=1Cm0BDDDiSlo94OOhs_HB08Ry_K3tIiCO', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Question Type & Key Words', 'https://drive.google.com/uc?export=preview&id=1T2MyC-qLlNmsA8xAW7YFoqqHmewGRn5K', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Brainstorming', 'https://drive.google.com/uc?export=preview&id=1r0423x_SqXOm6UcA2NarDOub4FVpkDZw', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: The Skeleton', 'https://drive.google.com/uc?export=preview&id=18mj4R43_5ZhoIZvIBce6ZcXLinv3V5qX', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Language', 'https://drive.google.com/uc?export=preview&id=1lqHhkm1Aq8ZPcks8wcaZB9duzK5r8k8c', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Language in the Skeleton', 'https://drive.google.com/uc?export=preview&id=16c5d8A8B9heEBMZWPqn7XZ5GZRyKEaX_', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: Ideas to Sentences', 'https://drive.google.com/uc?export=preview&id=1KNq4MJ0R4sgOXr-qdaiXV-DDRZiZuPFa', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: Add Linking Devices', 'https://drive.google.com/uc?export=preview&id=1dBP8fk7e4ebadjEKPOPGY5pPGNbMnxsj', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1_M0R4z8s-7NJjva0K_SCM-fyhv3VukrE', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Paraphrasing & Referencing', 'https://drive.google.com/uc?export=preview&id=1_4ff2-8RhVJO6Rh1aYxfc-ze6S6EXjNE', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1A: Fluency Training', 'https://www.youtube.com/embed/BxHwqW4bds4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1B: Pronunciation Training', 'https://www.youtube.com/embed/e7sz01XfuLM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/SgzeLUc6_K4', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 3: Grammar', 'https://www.youtube.com/embed/9CP85bRzZig', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Reading passage 3: Matching features, YNNG, summary', 'https://drive.google.com/uc?export=preview&id=1hFovjRqFbhPH1Elqk_1EyLQSlrQG8zak', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Ứng dụng', 'https://drive.google.com/uc?export=preview&id=1NZxCIv4nlpVlNgf6eLYupPvotTfKOaAP', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1A: Fluency Training', 'https://www.youtube.com/embed/t-53HpuVhUY', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1B: Pronunciation Training', 'https://www.youtube.com/embed/NpkmGaabK6c', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Vocabulary', 'https://www.youtube.com/embed/Btk3eFPQ0MY', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 3: Grammar', 'https://drive.google.com/uc?export=preview&id=1UKsngZ5iIjP9cDII-K8eEXtr3qzhz0gH', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Reading passage 1 lạ: Xuất hiện matching và Yes/No/Not Given', 'https://drive.google.com/uc?export=preview&id=13IK2R5Hui0virLM6xA1qwMwMQPKSXiNy', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Ứng dụng', 'https://drive.google.com/uc?export=preview&id=10BOXpdYXvvddJx03fBSC7znda5U26yij', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Tenses', 'https://drive.google.com/uc?export=preview&id=1a0A-j__2vLqTEHiD99p8j5SoGjBFPluy', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Overview', 'https://drive.google.com/uc?export=preview&id=1pQ5-U-5sIXJjwI8oJ-1rV42uROsfV2WI', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Body', 'https://drive.google.com/uc?export=preview&id=1dpJaxNDZ4urkkmtrXy5xO5zJRvogSyd0', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Introduction & Overview', 'https://drive.google.com/uc?export=preview&id=1gInYLkt5JkH_0KHX8SLkKDb4BwoRaasM', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: In-context Paraphrase', 'https://drive.google.com/uc?export=preview&id=1DWrqOZ1RMzHM84lnooXRQtqUaVsJVfkz', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Body & Full Structure', 'https://drive.google.com/uc?export=preview&id=1X5a4cUIO_qG7eWCeSNbe8bl6DTFabltE', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language', 'https://www.youtube.com/embed/CNqtWvChpqk', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Ideas With Language', 'https://drive.google.com/uc?export=preview&id=1_ZIAtATuERlhkh5qrMCZ9MApFd_tTeEg', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: ISL', 'https://drive.google.com/uc?export=preview&id=17fbsz6M9RegPcOZvclGa2VwM8fhSEpTm', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Ideas to Sentences & Linking Devices', 'https://drive.google.com/uc?export=preview&id=1VuyJ4qfY13WyVVOiYU0Yyw5hbiLEOlzf', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 1: Reading passage 3 matching headings, sentence completion TFNG', 'https://drive.google.com/uc?export=preview&id=1gGGRxSX9Sh4HQTVHAI9i7T3_FQFVSu3n', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Section 2: Ứng dụng', 'https://drive.google.com/uc?export=preview&id=1U39b0Ms1jOkFWwWRf9Zzz9sO7nKAnq2D', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Tenses & Overview', 'https://drive.google.com/uc?export=preview&id=18u5KaF-ReemE4vUcnwE1jQm9icgg8Wzm', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Body', 'https://drive.google.com/uc?export=preview&id=11R5RZXwGaSGRCfIsTG03DvLuJjWAsg-d', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Introduction & Overview', 'https://drive.google.com/uc?export=preview&id=1kFml-J16jXfETwIsAzVd2GtjDg6kNxJ_', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: In-context Paraphrase & Full Structure', 'https://drive.google.com/uc?export=preview&id=1M9FzjFwWGNLybiaDg8morO6GA8E_gaTs', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Referencing', 'https://drive.google.com/uc?export=preview&id=1jYB4qdikp7IGF9opUQMS3fjwgl6X2t-V', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Comparisons', 'https://drive.google.com/uc?export=preview&id=17oqCs1XGzqEZD5s_zw1xIQ9urLyxoBlb', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Ideas to Sentences', 'https://drive.google.com/uc?export=preview&id=18ZW-ybCjJvOC6YJl4XzpRFMw4anFCmUK', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Add Linking Devices', 'https://drive.google.com/uc?export=preview&id=1zDCFIOVYmEyCLfVEQ3I9zIjmbKIYjb3-', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1ctofF3tHaOcE5xlb-hxIQDIVg-iVfLz3', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Advanced Discourse Markers to Boost your Speaking', 'https://drive.google.com/uc?export=preview&id=14462CP-fT8PxHPtdZXtYl8VKBpYnfHga', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Tenses & Overview', 'https://drive.google.com/uc?export=preview&id=12t7_6mPq2k_gaQF7oTB1oMN-2PiJyMHL', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Body', 'https://drive.google.com/uc?export=preview&id=1T9Ser9sJdzdlp0JG-SBpOujCL4Ir4-2w', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Introduction & Overview', 'https://drive.google.com/uc?export=preview&id=1LfW6edG-pW-SqWdr4UY2ClHLxWI_mkOe', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Full Structure with Paraphrasing', 'https://drive.google.com/uc?export=preview&id=17n23Umhb264PV5tj1vR8vkpEekr6e0AX', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Full Structure with Referencing', 'https://drive.google.com/uc?export=preview&id=1Fs9hs92OOpYjhACYvqfYVG31Z8CJ4G07', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Time Connectors', 'https://drive.google.com/uc?export=preview&id=1Q94PBrJ8isrjxiS6LyBJbggDtMv9rks3', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Other Useful Expressions', 'https://drive.google.com/uc?export=preview&id=1dN-p3sFC3ViOjNXcPeMHllnLgL0EaLPX', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: With language & linking devices', 'https://drive.google.com/uc?export=preview&id=15vlYdOsgMQpCftB1I1YX7FOzNo-_7Ixo', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Ideas to Sentences', 'https://drive.google.com/uc?export=preview&id=1pnE5iS2buN8m67ebDTh53Z1UBsN6NruZ', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1uNc3pRUAuF7lB7h87ZwnUKJXs4z5NliD', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Tenses & Overview', 'https://drive.google.com/uc?export=preview&id=1F9YIhxw5w4Rfe8qw_3DLUNOQGalkizw6', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Ideas: Body', 'https://drive.google.com/uc?export=preview&id=1bpPOe6EGuvNHeWccFLtPpB_z9YCTH8z7', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: Introduction & Overview', 'https://drive.google.com/uc?export=preview&id=1NzTEd1wif7xw6c2UmJxlK3pZaLfdINJ2', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Structure: In-context Paraphrases & Referencing', 'https://drive.google.com/uc?export=preview&id=1nAI6qjzA-vipw2UB9PtcWvYeYKPLkrRu', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Changes', 'https://drive.google.com/uc?export=preview&id=1eQg-0NcHq6r3ZtCIBtLmPOZugOZyeWZA', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Language - Locations', 'https://drive.google.com/uc?export=preview&id=1P7-EYxsrVkAmAWc06wg6LrS_cOTSy90A', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: Add Linking Devices', 'https://drive.google.com/uc?export=preview&id=1Ccandzqmt_bIKvtDlIbrIBZ6AfkBbuFk', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Language & Linking: ISL', 'https://drive.google.com/uc?export=preview&id=1lrLn-gLEilql2zkWB61GR3QEN5TEpH2C', 0);

INSERT INTO dbo.CourseVideo (CourseID, ChapterID, VideoName, VideoURL, IsPreview)
VALUES (@CourseID_4, @Chap_4_3, N'Grouping information technique', 'https://drive.google.com/uc?export=preview&id=10tWQZcWoduSNe7vkGb4uA_A5gI1NVLcG', 0);
