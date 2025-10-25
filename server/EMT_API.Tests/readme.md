# 🧠 EMT - Unit Testing Challenge: AI Speaking Feature

> 📍 Repo: [Group1_SWP391_FPTU](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)  
> 🧩 Feature được chọn: **Thi Nói bằng AI (AI Speaking Test)**  
> 🧑‍💻 Thành viên nhóm: Nguyễn Lê Duy Hoàng · Nguyễn Kim Huấn · Nguyễn Thị Thanh Trà · Trần Lữ Đăng Trung

---

## ⚡ Giới thiệu

**EMT (English Master Platform)** là nền tảng học ngoại ngữ 4 kỹ năng (Nghe - Nói - Đọc - Viết) ứng dụng **Trí tuệ Nhân tạo (AI)**.  
Mục tiêu là mang đến trải nghiệm học tập thông minh, tiết kiệm và đánh giá chính xác theo chuẩn IELTS.

**Module được kiểm thử:**  
> 🎯 *Thi Nói (AI-Speaking)* – trái tim của hệ thống, nơi người học ghi âm bài nói, hệ thống xử lý bằng 2 AI model:
- 🎙 **Deepgram API** → Chuyển giọng nói thành văn bản (Speech-to-Text)
- 🤖 **ChatGPT API** → Sinh đề thi & chấm điểm (Prompt + Grading)

---

## 🧩 Phạm vi kiểm thử

Các lớp & hàm được test:
- `AISpeakingController`
- `AISpeakingService`
- `PromptModule`
- `GradingModule`
- `TranscriptionModule`

### Mục tiêu
- Kiểm thử pipeline đầy đủ: *Sinh đề → Nộp bài → Chấm điểm → Phản hồi*
- Đảm bảo:
  - JSON AI hợp lệ
  - Không crash khi key sai hoặc format hỏng
  - Luồng controller trả đúng mã trạng thái HTTP
  - Coverage ≥ 80%

---

## 🧠 Kiến trúc kiểm thử

└── EMT_API.Tests/
├── Controllers/
│ └── AISpeakingControllerTests.cs
├── Services/
│ ├── PromptModuleTests.cs
│ ├── GradingModuleTests.cs
│ └── TranscriptionModuleTests.cs
├── TestResults.html
├── coverage/
│ └── index.html
└── prompts/
└── log.md

yaml
Sao chép mã

---

## 🧪 Bộ Test Case Chính (6/18)

| ID | Tên Case | Module | Input | Expected Output | Result |
|----|-----------|---------|--------|-----------------|--------|
| TC01 | Generate prompt (valid) | Controller | Có membership | 200 OK + JSON `{topic}` | ✅ |
| TC02 | Generate prompt (no membership) | Controller | Không membership | 403 Forbidden | ✅ |
| TC03 | Submit without file | Controller | Thiếu file âm thanh | 400 Bad Request | ✅ |
| TC06 | Submit valid audio | Controller | File + prompt hợp lệ | 200 OK + JSON feedback | ✅ |
| TC08 | Prompt JSON valid | PromptModule | Mock AI key | JSON parse đúng format | ✅ |
| TC14 | Handle fake API key | GradingModule | Key sai | Exception được catch | ✅ |

> Tổng cộng 18 case (đủ 4 module chính), 100% pass, coverage trung bình ~85%.

---

## 🧠 AI Prompt Workflow

AI được dùng trong giai đoạn sinh test:

> **Prompt:**  
> "Phân tích module Thi Speaking bằng AI gồm các class AISpeakingController, PromptModule, GradingModule, TranscriptionModule.  
> Hãy sinh bộ test case (happy path, edge case, error handling) và code mẫu cho từng module."

**AI Output:**  
- TC01–06 → Controller  
- TC07–10 → PromptModule  
- TC11–14 → GradingModule  
- TC15–18 → TranscriptionModule

---

## ⚙️ Cách chạy test

### 1️⃣ Cài dependencies
```bash
cd EMT_API.Tests
dotnet restore
2️⃣ Chạy test kèm coverage
bash
Sao chép mã
dotnet test EMT_API.Tests ^
  /p:CollectCoverage=true ^
  /p:CoverletOutputFormat=lcov ^
  /p:CoverletOutput=../coverage/
Sau khi chạy, báo cáo coverage sẽ xuất ở coverage/index.html.

📊 Kết quả kiểm thử
✅ 18/18 test passed

🧩 Coverage trung bình: ≈85%

AISpeakingService: 81.5%

AISpeakingController: 67.2%

PromptModule + GradingModule: ~90–100%

Ảnh minh họa:

markdown
Sao chép mã
------------------------------
Test Run Successful.
Total tests: 18
Passed: 18
Duration: 7.7s
------------------------------
🧰 Mock & Dependency
Dependency	Mục đích	Cách xử lý
Deepgram API	Speech-to-text	Mock JSON transcript
ChatGPT API	Sinh đề + chấm điểm	Mock AI response
MembershipUtil	Kiểm tra quyền học viên	Giả lập user có/không membership
IFormFile	Upload file âm thanh	Mock FormFile bằng stream giả

🚀 Cách báo cáo & demo
TestResults.html → Dùng trong phần demo để show 18 test pass

Swagger → Dùng minh họa 4 case chính (TC01–03–06)

Coverage/index.html → Dùng cho phần “Tối ưu & Mocking”


Prompt:
1. Đây là Repo Github của Project 
https://github.com/nldhoang10092004/Group1_SWP391_FPTU. Phân tích module Thi Speaking gồm Controller và 3 Service (Prompt, Grading, Transcription) của Backend. Xác định các hàm cần test, đầu vào, đầu ra, edge case và dependency phải mock
2. Từ những phân tích  về cấu trúc Controller - Service và các service con trong đó, generate ra cho tôi các test case để test các chức năng của Controller, Service đó. Code: { Code của Controller, Service}
3. Từ các phân tích test case, và code của service và controller, hãy viết các đoạn XUnit code để test từng test case.
