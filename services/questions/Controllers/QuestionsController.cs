using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace questions.Controllers
{
		public enum QuestionType
		{
			Text = "text",
			Image = "image"
		}

		public class Question
		{
			public string Id { get; set; }
			public int Record { get; set; }
			public string Answer { get; set; }
			abstract public QuestionType Type { get; }
		}

		public class TextQuestion : Question
		{
			public QuestionType Type
			{
				get => QuestionType.Text;
			}
			public string Text { get; set; }
		}

		public class ImageQuestion : Question<QuestionType.Image>
		{
			public QuestionType Type
			{
				get => QuestionType.Image;
			}
			public string Src { get; set; }
		}

    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        // GET api/values
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ActionResult<string> Get(int id)
        {
            return "value";
        }

				[HttpGet("{id/answer}")]
				
    }
}
