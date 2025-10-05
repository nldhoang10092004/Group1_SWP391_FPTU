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
