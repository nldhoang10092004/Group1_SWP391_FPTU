namespace EMT_API.Security
{
    public interface IOtpService
    {
        string Generate(string email);
        bool Verify(string email, string otp);
    }
}
