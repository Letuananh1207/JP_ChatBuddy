export const grammarErrorLogPrompt = (userContents: string[]): string => {
  return `
    Bạn là một chuyên gia ngôn ngữ Nhật Bản.
    Dưới đây là danh sách các câu tin nhắn của người dùng (User Messages).
    
    User Messages: ${JSON.stringify(userContents)}
    
    Nhiệm vụ:
    1. Phân tích từng câu để tìm những cấu trúc ngữ pháp tiếng Nhật bị sử dụng sai hoặc chưa chính xác.
    2. Với mỗi loại lỗi ngữ pháp, hãy trả về một đối tượng JSON gồm:
       - grammarName: tên cấu trúc ngữ pháp bị sai
       - count: số lần lỗi đó xuất hiện trong toàn bộ danh sách tin nhắn
       - logs: một mảng các đối tượng chi tiết, mỗi đối tượng gồm:
         + wrong: đoạn ngữ pháp sai (chỉ vùng sai, không cần toàn bộ câu)
         + corrected: phiên bản đúng sau khi sửa (chỉ vùng sai đã sửa)
    3. TRẢ VỀ DUY NHẤT một mảng JSON các đối tượng như trên.
       Ví dụ: 
       [
         {
           "grammarName": "〜ます + でした",
           "count": 1,
           "logs": [
             { "wrong": "行きますでした", "corrected": "行きました" }
           ]
         }
       ]
    4. Nếu không phát hiện lỗi ngữ pháp nào, trả về: []
    
    Lưu ý:
    - Chỉ trả về JSON, không giải thích thêm.
    - Luôn chỉ ra vùng sai và vùng đúng tương ứng.
  `;
};

export const reviewPrompt = (userContents: string[]): string => {
  return `
    Bạn là một chuyên gia ngôn ngữ Nhật Bản và giáo viên luyện viết.
    Dưới đây là danh sách các câu tin nhắn của học viên:
    ${JSON.stringify(userContents)}

    Nhiệm vụ:
    1. Với mỗi câu, tạo một đối tượng JSON gồm:
       - id: chuỗi duy nhất cho từng review.
       - userMessage: câu gốc của người dùng.
       - correction: phiên bản đúng nếu câu chứa lỗi; nếu câu đúng, để null.
       - improvements: mảng các chú giải bằng tiếng Việt về lỗi hoặc điểm cần cải thiện.
    2. Tạo thêm một trường "summary" là mảng 3 lời nhận xét tổng quát về cách cải thiện hoặc sửa lỗi,
       mỗi phần tử nên là một gợi ý ngắn gọn, rõ ràng và hữu ích.
    3. TRẢ VỀ DUY NHẤT một đối tượng JSON chứa 2 trường: "reviews" và "summary".
    4. Không thêm bất kỳ giải thích nào bên ngoài JSON.

    Ví dụ:
    {
      "reviews": [
        {
          "id": "review-1",
          "userMessage": "きのうは映画を見ています",
          "correction": "きのうは映画を見ました",
          "improvements": [
            "Bạn dùng \"～ています\" nhưng \"きのう\" là quá khứ xác định",
            "Dùng \"～ました\" để nói về hành động đã hoàn thành",
            "～ています = đang làm / ～ました = đã làm xong"
          ]
        }
      ],
      "summary": [
        "Chú ý dùng đúng thì quá khứ khi nhắc lại sự việc đã xảy ra.",
        "Kiểm tra cách dùng trợ từ và cấu trúc câu để tránh sai ngữ pháp.",
        "Giữ câu ngắn gọn và chính xác, tránh dùng biểu thức quá phức tạp nếu chưa chắc chắn."
      ]
    }
  `;
};

export const recommendedLessonPrompt = (summary: string[]): string => {
  return `
    Bạn là giáo viên tiếng Nhật và chuyên gia xây dựng lộ trình học.

    Dưới đây là các nhận xét của giáo viên về học viên:
    ${JSON.stringify(summary)}

    Nhiệm vụ:

    Bước 1:
    Phân tích từng nhận xét và xác định các chủ đề học tiếng Nhật cần cải thiện.
    Ví dụ:
    - Từ vựng không phù hợp ngữ cảnh → vocabulary usage, word nuance, collocation
    - Câu hỏi chưa rõ ràng → question patterns, interrogative grammar
    - Câu quá dài hoặc phức tạp → basic grammar, natural sentence building

    Bước 2:
    Tìm các video YouTube DẠY TIẾNG NHẬT thực sự liên quan đến các chủ đề trên.

    Yêu cầu bắt buộc:
    - Chỉ chọn video học tiếng Nhật.
    - Không chọn vlog, podcast, anime clip, shorts, nhạc hoặc nội dung giải trí.
    - Ưu tiên các kênh học tiếng Nhật nổi tiếng.
    - Mỗi video phải liên quan trực tiếp tới ít nhất một lỗi trong summary.
    - Chỉ trả về video YouTube thực sự tồn tại.
    - Không được tự tạo URL.
    - Trả về từ 3 đến 5 video.

    Kết quả:
    Chỉ trả về JSON array chứa URL YouTube.

    Ví dụ:
    [
      "https://www.youtube.com/watch?v=xxxxx",
      "https://www.youtube.com/watch?v=yyyyy",
      "https://www.youtube.com/watch?v=zzzzz"
    ]
    `;
};

export const recommendedLessonKeywordPrompt = (summary: string[]): string => {
  return `
      Bạn là giáo viên tiếng Nhật và chuyên gia đề xuất học liệu.

      Dưới đây là các điểm cần cải thiện của học viên:
      ${JSON.stringify(summary)}

      Nhiệm vụ:
      1. Dựa trên các điểm trong summary, sinh ra một mảng từ khoá tìm kiếm ngắn (mỗi từ khoá 2-5 từ) phù hợp để tìm video YouTube dạy tiếng Nhật có liên quan.
      2. Trả về DUY NHẤT một mảng JSON chứa các từ khoá. Ví dụ:
         ["past tense Japanese grammar", "particle usage Japanese", "polite form ました vs ます"]
      3. Không thêm bất kỳ giải thích nào khác ngoài mảng JSON.
    `;
};
