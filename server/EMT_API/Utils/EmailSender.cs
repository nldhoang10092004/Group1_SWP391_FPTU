using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace EMT_API.Utils
{
    public class EmailSender
    {
        private readonly EmailSetting _setting;
        private readonly SmtpClient _smtpClient;

        public EmailSender(IOptions<EmailSetting> emailSettings)
        {
            _setting = emailSettings.Value;
            _smtpClient = new SmtpClient(_setting.Server)
            {
                Port = _setting.Port,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };
            _smtpClient.Credentials = new NetworkCredential(_setting.Email, _setting.Password);
        }


        private MailMessage MailMessageServer(string from, string displayname, string to, string subject, string body)
        {
            var msg = new MailMessage() { From = new MailAddress(from, displayname, Encoding.UTF8) };
            msg.To.Add(new MailAddress(to));
            msg.Subject = subject;
            msg.Body = body;
            msg.IsBodyHtml = true;
            msg.BodyEncoding = Encoding.UTF8;
            msg.Headers.Add("Mail", "App Mail");
            msg.Priority = MailPriority.High;
            msg.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
            return msg;
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var msg = MailMessageServer(_setting.Email, _setting.SenderName, email, subject, htmlMessage);
            return _smtpClient.SendMailAsync(msg);
        }

    }
}
