namespace EMT_API.Utils
{
    public static class EmailTemplate
    {
        public static string BuildResetPasswordEmail(string usernameOrEmail, string link)
        {
            var safeName = System.Net.WebUtility.HtmlEncode(usernameOrEmail);

            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
<meta charset=""UTF-8"">
<title>Yêu cầu đặt lại mật khẩu - EMT</title>
<style>
    body {{
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
    }}
    .container {{
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
    }}
    .header {{
        background: linear-gradient(135deg, #0078d4, #00b0f0);
        color: #fff;
        padding: 20px;
        text-align: center;
    }}
    .content {{
        padding: 30px;
        color: #333;
        line-height: 1.7;
    }}
    .btn {{
        display: inline-block;
        margin: 20px 0;
        padding: 12px 24px;
        background: #0078d4;
        color: #fff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
    }}
    .btn:hover {{
        background: #005fa3;
    }}
    .footer {{
        background-color: #f1f5f9;
        padding: 20px;
        font-size: 13px;
        color: #555;
        text-align: center;
        border-top: 1px solid #e2e8f0;
    }}
    .card {{
        margin-top: 15px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        background-color: #fff;
        display: inline-block;
    }}
    .logo {{
        font-weight: bold;
        color: #0078d4;
        font-size: 16px;
    }}
</style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Yêu cầu đặt lại mật khẩu</h2>
        </div>
        <div class=""content"">
            <p>Xin chào <b>{safeName}</b>,</p>
            <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản <b>English Master (EMT)</b>.</p>
            <p>Bấm vào nút bên dưới để đặt lại mật khẩu (liên kết hết hạn sau <b>30 phút</b>):</p>

            <p style=""text-align:center;"">
                <a href=""{link}"" class=""btn"">Đặt lại mật khẩu</a>
            </p>

            <p>Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
            <p>Cảm ơn bạn đã sử dụng nền tảng <b>EMT</b> để học tiếng Anh!</p>
        </div>
        <div class=""footer"">
            <div class=""card"">
                <div class=""logo"">🌐 English Master</div>
                <div>📧 support@englishmaster.com</div>
                <div>📞 +84 987 654 321</div>
                <div>🏠 FPT University, Việt Nam</div>
            </div>
            <p style=""margin-top:10px;color:#999;font-size:12px;"">
                © 2025 English Master Team. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
