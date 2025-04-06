using Microsoft.AspNetCore.Mvc;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<WeatherForecastController> _logger;

        public TestController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet("{text?}", Name = "GetText")]
        public IActionResult GetTest(string? text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return Ok("No text provided.");
            }
            return Ok($"You provided: {text}");
        }
    }
}
