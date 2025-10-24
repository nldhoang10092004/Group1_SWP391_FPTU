using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EMT_API.Services
{
    public class GoogleDriveService
    {
        private readonly DriveService _drive;

        public GoogleDriveService(IConfiguration cfg)
        {
            var sa = new
            {
                Type = cfg["GoogleService:Type"],
                ProjectId = cfg["GoogleService:ProjectId"],
                PrivateKeyId = cfg["GoogleService:PrivateKeyId"],
                PrivateKey = cfg["GoogleService:PrivateKey"],
                ClientEmail = cfg["GoogleService:ClientEmail"],
                ClientId = cfg["GoogleService:ClientId"],
                TokenUri = cfg["GoogleService:TokenUri"]
            };

            var json = $@"{{
                ""type"": ""{sa.Type}"",
                ""project_id"": ""{sa.ProjectId}"",
                ""private_key_id"": ""{sa.PrivateKeyId}"",
                ""private_key"": ""{sa.PrivateKey.Replace("\n", "\\n")}"",
                ""client_email"": ""{sa.ClientEmail}"",
                ""client_id"": ""{sa.ClientId}"",
                ""token_uri"": ""{sa.TokenUri}""
            }}";

            var credential = GoogleCredential
                .FromJson(json)
                .CreateScoped(DriveService.Scope.Drive);

            _drive = new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "EMT-Drive"
            });
        }

        public async Task<IList<Google.Apis.Drive.v3.Data.File>> ListFilesAsync(string folderId = "root")
        {
            var request = _drive.Files.List();
            request.Q = $"'{folderId}' in parents and trashed = false";
            request.Fields = "files(id, name, mimeType, size, modifiedTime)";
            var result = await request.ExecuteAsync();
            return result.Files;
        }
    }
}
