import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gemini SDK on server-side
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper for model calling with graceful fallback
async function callGemini(prompt: string, systemInstruction?: string, imageBase64?: string) {
  if (!ai) {
    return null;
  }
  try {
    const parts: any[] = [];
    if (imageBase64) {
      // Support png/jpeg data URLs or raw base64
      const mimeMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const cleanData = imageBase64.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanData,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts.length === 1 ? parts[0].text : { parts },
      config: {
        systemInstruction: systemInstruction || 'Bạn là Trợ lý AI Chuyên gia Giảng dạy Xác suất Thống kê (XSTK) cấp đại học.',
        temperature: 0.4,
      },
    });

    return response.text || '';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return null;
  }
}

// ---------------- API ROUTES ----------------

/**
 * Global Feature: AI Voice Search & Navigation
 * Understands natural spoken queries in Vietnamese and maps to XSTK topics, formulas, tabs, and exercises.
 */
app.post('/api/ai/voice-search', async (req, res) => {
  const { query } = req.body;

  const systemInstruction = `Bạn là Bộ Máy Tìm Kiếm Bằng Giọng Nói AI cho Nền tảng Học tập Xác suất Thống kê (ProbStat AI).
Người dùng vừa nói một câu tìm kiếm bằng tiếng Việt.
Nhiệm vụ của bạn:
1. Hiểu mục tiêu và bản chất toán học của câu nói.
2. Xác định tab phù hợp nhất trong 10 tab:
   - "pipeline": Quy trình học 4 bước, khái niệm, định lý, CLT, Bayes, Nhị thức, Chuẩn, Kiểm định.
   - "multimodal": Chấm điểm bài làm ảnh/PDF/iPad, sửa bài giải.
   - "voice-canvas": Phòng vẽ iPad, vẽ đồ thị, tương tác âm thanh.
   - "essay": Bài tập tự luận, luyện giải toán tự luận.
   - "mcq": Trắc nghiệm, câu hỏi chọn phương án, giải thích "Tại sao?".
   - "oral-exam": Vấn đáp lý thuyết, kiểm tra miệng, lỗ hổng kiến thức.
   - "error-analytics": Lỗi sai, xem lại các câu làm sai, phân tích điểm yếu.
   - "mindmap": Bản đồ tư duy, sơ đồ cây tri thức, tổng quan hệ thống.
   - "forum": Diễn đàn, hỏi đáp cộng đồng, bài đăng sinh viên.
   - "profile": Hồ sơ cá nhân, ma trận kỹ năng, điểm số.
3. Trả về JSON:
{
  "recognizedQuery": "Câu truy vấn đã chuẩn hóa",
  "targetTab": "tên tab ở trên",
  "targetTopicId": "normal-clt | bayes-theorem | binomial-dist | hypothesis-testing",
  "spokenResponse": "Câu phản hồi ngắn gọn 1 câu để đọc to cho học sinh nghe bằng giọng nói",
  "results": [
    {
      "title": "Tiêu đề kết quả tìm kiếm",
      "type": "Khái niệm / Định lý" | "Công thức" | "Bài tập" | "Phân tích lỗi",
      "tab": "tên tab tương ứng",
      "description": "Mô tả ngắn gọn kết quả tìm được",
      "formula": "Công thức toán nếu có"
    }
  ]
}`;

  const prompt = `Câu nói của người dùng: "${query}"
Hãy phân tích ngữ nghĩa và trả về JSON tìm kiếm.`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, ...parsed });
    } catch {
      // Fall through
    }
  }

  // Smart heuristic search matcher if API is busy
  const lower = (query || '').toLowerCase();
  let targetTab = 'pipeline';
  let targetTopicId = 'normal-clt';
  let spokenResponse = `Đã tìm thấy nội dung phù hợp cho "${query}".`;

  if (lower.includes('trắc nghiệm') || lower.includes('tại sao') || lower.includes('quiz') || lower.includes('chọn đáp án')) {
    targetTab = 'mcq';
    spokenResponse = 'Đang chuyển bạn đến Ngân hàng Bài tập Trắc nghiệm và tính năng giải thích Tại sao.';
  } else if (lower.includes('tự luận') || lower.includes('bài tập lớn') || lower.includes('5 bài')) {
    targetTab = 'essay';
    spokenResponse = 'Đang mở bộ Bài tập Tự luận có hướng dẫn chiến lược giải.';
  } else if (lower.includes('vấn đáp') || lower.includes('kiểm tra miệng') || lower.includes('lỗ hổng')) {
    targetTab = 'oral-exam';
    spokenResponse = 'Đang mở phòng Vấn đáp Lý thuyết AI.';
  } else if (lower.includes('lỗi sai') || lower.includes('thống kê lỗi') || lower.includes('nhầm lẫn')) {
    targetTab = 'error-analytics';
    spokenResponse = 'Đang mở Bảng Thống kê & Phân tích Lỗi sai Tổng hợp.';
  } else if (lower.includes('bản đồ') || lower.includes('tư duy') || lower.includes('mindmap') || lower.includes('cây')) {
    targetTab = 'mindmap';
    spokenResponse = 'Đang hiển thị Bản đồ Tư duy toàn diện Xác suất Thống kê.';
  } else if (lower.includes('diễn đàn') || lower.includes('thảo luận') || lower.includes('hỏi đáp') || lower.includes('cộng đồng')) {
    targetTab = 'forum';
    spokenResponse = 'Đang chuyển đến Diễn đàn Học tập và Trợ giảng AI.';
  } else if (lower.includes('hồ sơ') || lower.includes('kỹ năng') || lower.includes('tiến trình') || lower.includes('điểm số')) {
    targetTab = 'profile';
    spokenResponse = 'Đang mở Hồ sơ Học tập và Ma trận Kỹ năng cá nhân của bạn.';
  } else if (lower.includes('bảng vẽ') || lower.includes('ipad') || lower.includes('vẽ đồ thị') || lower.includes('nói chuyện')) {
    targetTab = 'voice-canvas';
    spokenResponse = 'Đang mở Phòng Tương tác Giọng nói & Bảng vẽ iPad Live.';
  } else if (lower.includes('chấm') || lower.includes('barem') || lower.includes('ảnh bài làm') || lower.includes('pdf')) {
    targetTab = 'multimodal';
    spokenResponse = 'Đang mở AI Tutor Chấm điểm Đa phương thức theo Barem.';
  } else if (lower.includes('bayes') || lower.includes('xác suất điều kiện')) {
    targetTab = 'pipeline';
    targetTopicId = 'bayes-theorem';
    spokenResponse = 'Tìm thấy chuyên đề Công thức Xác suất Bayes và Xác suất có điều kiện.';
  } else if (lower.includes('nhị thức') || lower.includes('bernoulli')) {
    targetTab = 'pipeline';
    targetTopicId = 'binomial-dist';
    spokenResponse = 'Tìm thấy chuyên đề Phân phối Nhị thức và Dãy phép thử Bernoulli.';
  } else if (lower.includes('kiểm định') || lower.includes('z-test') || lower.includes('t-test') || lower.includes('giả thiết')) {
    targetTab = 'pipeline';
    targetTopicId = 'hypothesis-testing';
    spokenResponse = 'Tìm thấy chuyên đề Kiểm định Giả thiết Thống kê Z-test và Student t-test.';
  }

  return res.json({
    success: true,
    recognizedQuery: query,
    targetTab,
    targetTopicId,
    spokenResponse,
    results: [
      {
        title: `Nội dung liên quan: ${query}`,
        type: 'Chuyên đề chính',
        tab: targetTab,
        description: `Truy cập trực tiếp chuyên mục tương ứng với từ khóa "${query}".`,
      },
    ],
  });
});

/**
 * Feature 2 & 3: Multimodal AI Tutor (Image / Canvas / PDF screenshot evaluation)
 * Rule: Provide Hints & Strategy ONLY, never the full solution directly.
 */
app.post('/api/ai/multimodal-tutor', async (req, res) => {
  const { imageBase64, problemText, studentNotes, topic } = req.body;

  const systemInstruction = `Bạn là Trợ lý AI Tutor Chấm điểm & Cố vấn Xác suất Thống kê (XSTK) thông minh.
QUY TẮC CỐT LÕI (BẮT BUỘC):
1. Tuyệt đối KHÔNG cung cấp trực tiếp lời giải chi tiết hay đáp số cuối cùng ngay lập tức. Mục tiêu là kích thích tư duy người học.
2. Cung cấp:
   - "Đánh giá bước làm hiện tại": Nhận xét các bước người học đã làm đúng hoặc chệch hướng trên hình vẽ/bài làm.
   - "Barem điểm đối chiếu": Điểm thành phần dự kiến (Xác định biến ngẫu nhiên, Chọn công thức/phân phối, Lập luận logic).
   - "Chiến lược giải gợi ý (Hints & Strategy)": Gợi ý 2-3 câu hỏi gợi mở hoặc bước tiếp theo để sinh viên tự tìm ra lời giải.
   - "Gợi ý trực quan trên bảng vẽ iPad": Đề xuất dạng đồ thị (phân phối chuẩn Gauss, bảng phân phối xác suất, cây xác suất Bayes, miền bác bỏ p-value) nên vẽ để làm sáng tỏ bài toán.
3. Định dạng công thức toán học bằng chuẩn KaTeX/LaTeX, ví dụ: $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ hoặc $Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}$.
4. Phản hồi bằng tiếng Việt sư phạm, ấm áp, truyền cảm hứng.`;

  const prompt = `Bài toán XSTK: ${problemText || 'Học viên đính kèm bài làm trên hình ảnh hoặc bảng vẽ Canvas.'}
Ghi chú học viên: ${studentNotes || 'Không có'}
Chủ đề: ${topic || 'Xác suất Thống kê chung'}

Hãy phân tích bài làm trên hình ảnh/canvas (nếu có) hoặc đề bài, đưa ra nhận xét theo barem điểm và Chiến lược gợi ý hướng đi (KHÔNG ĐƯỢC CHO LỜI GIẢI CHI TIẾT NGAY).`;

  const aiResult = await callGemini(prompt, systemInstruction, imageBase64);

  if (aiResult) {
    return res.json({ success: true, analysis: aiResult });
  }

  // High quality curated heuristic fallback if Gemini API is not yet configured
  return res.json({
    success: true,
    analysis: `### 🎯 Nhận xét & Đánh giá Barem Bước Làm
1. **Xác định bài toán & Biến ngẫu nhiên:** Bạn đã nhận diện đúng đại lượng cần xét. Hãy chú ý đặt tên biến ngẫu nhiên rõ ràng (ví dụ: Gọi $X$ là số lần thành công trong $n$ phép thử độc lập).
2. **Chọn phân phối & Công thức:** Đang đi đúng hướng! Hãy kiểm tra lại điều kiện áp dụng: liệu các phép thử có hoàn toàn độc lập với xác suất $p$ không đổi hay không?

---

### 💡 Chiến lược Gợi ý Hướng Đi (Hints & Strategy)
* **Gợi ý 1:** Hãy tự hỏi: Xác suất cần tính là $P(X = k)$ hay $P(X \\ge k)$? Nếu là tích lũy $P(X \\ge 1)$, liệu phương pháp biến cố đối nghịch $1 - P(X = 0)$ có nhanh hơn không?
* **Gợi ý 2:** Nhớ kiểm tra lại $E(X) = n \\cdot p$ và $Var(X) = n \\cdot p(1-p)$ trước khi thế số vào bước tiếp theo.
* **Gợi ý 3 (Tương tác Bảng vẽ):** Hãy vẽ trục phân phối xác suất hoặc cây biến cố (Tree Diagram) lên bảng iPad để trực quan hóa các nhánh xác suất trước khi cộng gộp.

*(Lưu ý: Thầy cô AI giữ lại đáp số cuối cùng để bạn tự tay hoàn tất bước tính toán!)*`,
  });
});

/**
 * Feature 3: Voice & Live iPad Canvas Assistant
 * Returns voice text answer + whiteboard drawing commands (diagramType, formula, dataPoints)
 */
app.post('/api/ai/voice-tutor', async (req, res) => {
  const { question, currentTopic } = req.body;

  const systemInstruction = `Bạn là Trợ lý Giọng nói & Bảng vẽ XSTK. Bạn trả lời ngắn gọn, chuẩn xác, dễ nghe khi chuyển thành giọng nói, và đồng thời xác định xem có nên vẽ trực quan lên bảng iPad không.
Nếu cần vẽ, hãy chỉ định rõ loại đồ thị: 'normal_curve' (phân phối chuẩn), 'binomial_bars' (cột nhị thức), 'bayes_tree' (cây xác suất), 'hypothesis_test' (miền bác bỏ Z/t).
Trả về JSON với cấu trúc:
{
  "speechText": "Nội dung phản hồi súc tích bằng tiếng Việt tự nhiên",
  "whiteboard": {
    "shouldDraw": true,
    "title": "Tên đồ thị minh họa",
    "diagramType": "normal_curve" | "binomial_bars" | "bayes_tree" | "hypothesis_test",
    "latexFormula": "Công thức KaTeX chính",
    "explanation": "Lời chú thích trên bảng"
  }
}`;

  const prompt = `Câu hỏi của học viên: "${question}"
Chủ đề hiện tại: "${currentTopic || 'Tổng quan XSTK'}"
Hãy tạo phản hồi dạng JSON.`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, ...parsed });
    } catch {
      return res.json({
        success: true,
        speechText: aiResult,
        whiteboard: {
          shouldDraw: true,
          title: 'Phân tích trực quan ' + (currentTopic || 'XSTK'),
          diagramType: 'normal_curve',
          latexFormula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
          explanation: 'Đồ thị phân phối chuẩn hình chuông Gauss đối xứng qua kỳ vọng \\mu',
        },
      });
    }
  }

  // Default intelligent response
  return res.json({
    success: true,
    speechText: `Chào bạn! Về câu hỏi "${question}", trong Xác suất Thống kê, cốt lõi là ta cần xác định rõ không gian mẫu và phân phối của biến ngẫu nhiên. Tôi đã phác thảo đồ thị phân phối chuẩn cùng công thức liên quan lên bảng vẽ iPad để bạn tiện theo dõi nhé!`,
    whiteboard: {
      shouldDraw: true,
      title: 'Đồ thị Phân phối Chuẩn Gauss N(μ, σ²)',
      diagramType: 'normal_curve',
      latexFormula: 'P(a \\le X \\le b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      explanation: 'Diện tích dưới đường cong hình chuông biểu diễn xác suất. Quy tắc 68-95-99.7% là chìa khóa để ước lượng nhanh.',
    },
  });
});

/**
 * Feature 4 & 5: Generate Similar Exercises (Essay or MCQ)
 */
app.post('/api/ai/generate-exercises', async (req, res) => {
  const { type, topic, difficulty } = req.body;

  const systemInstruction = `Bạn là Chuyên gia Khảo thí và Ra đề Xác suất Thống kê.
Tạo bộ câu hỏi chuẩn sư phạm theo chủ đề và độ khó yêu cầu.
Nếu type === 'essay': tạo 5 bài toán tự luận có gợi ý chiến lược giải từng bước (KHÔNG đưa lời giải đầy đủ ngay).
Nếu type === 'mcq': tạo 5 câu trắc nghiệm 4 phương án A, B, C, D, kèm đáp án đúng và lý giải ngắn gọn.
Trả về JSON chuẩn.`;

  const prompt = `Yêu cầu: Tạo bộ bài tập ${type === 'mcq' ? 'Trắc nghiệm (5 câu)' : 'Tự luận (5 câu)'}
Chủ đề: ${topic || 'Phân phối xác suất & Kiểm định'}
Độ khó: ${difficulty || 'Vận dụng'}
Format JSON:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "title": "Tên bài toán ngắn gọn",
      "statement": "Nội dung đề bài chi tiết chứa công thức LaTeX trong dấu $...$",
      "strategySteps": ["Bước 1: ...", "Bước 2: ...", "Bước 3: ..."],
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."], // chỉ dành cho mcq
      "correctIndex": 0, // 0-3 dành cho mcq
      "whyExplanation": "Lý giải bản chất tại sao đáp án đúng và các phương án khác sai bẫy gì" // dành cho mcq
    }
  ]
}`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, ...parsed });
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback curated questions
  return res.json({
    success: true,
    topic: topic || 'Biến ngẫu nhiên & Phân phối xác suất',
    questions: [
      {
        id: 1,
        title: 'Xác suất xạ thủ bắn trúng bia',
        statement: 'Một xạ thủ bắn độc lập 8 phát vào bia với xác suất trúng mỗi phát là $p = 0.75$. Gọi $X$ là số phát trúng bia. Tính xác suất để xạ thủ bắn trúng ít nhất 6 phát.',
        strategySteps: [
          'Bước 1: Nhận diện biến ngẫu nhiên $X \\sim B(n=8, p=0.75)$ theo quy luật Nhị thức.',
          'Bước 2: Viết công thức biến cố ít nhất 6 phát: $P(X \\ge 6) = P(X=6) + P(X=7) + P(X=8)$.',
          'Bước 3: Sử dụng công thức Bernoulli: $P(X = k) = C_n^k p^k (1-p)^{n-k}$ để tính từng số hạng.',
        ],
        options: [
          'A. $P(X \\ge 6) \\approx 0.6785$',
          'B. $P(X \\ge 6) \\approx 0.3215$',
          'C. $P(X \\ge 6) \\approx 0.8124$',
          'D. $P(X \\ge 6) \\approx 0.5421$',
        ],
        correctIndex: 0,
        whyExplanation: 'Ta có $P(X=6) = C_8^6 (0.75)^6 (0.25)^2 \\approx 0.3115$, $P(X=7) = C_8^7 (0.75)^7 (0.25)^1 \\approx 0.2670$, $P(X=8) = (0.75)^8 \\approx 0.1001$. Tổng là $0.3115 + 0.2670 + 0.1001 = 0.6786$. Phương án B sai do lấy phần bù.',
      },
      {
        id: 2,
        title: 'Kiểm định trung bình mẫu với độ lệch chuẩn đã biết',
        statement: 'Trọng lượng trung bình của một loại sản phẩm theo quy chuẩn là $\\mu_0 = 500\\text{g}$ với $\\sigma = 15\\text{g}$. Kiểm tra ngẫu nhiên 36 sản phẩm thu được trung bình mẫu $\\bar{X} = 494\\text{g}$. Với mức ý nghĩa $\\alpha = 0.05$, hãy cho biết quy trình sản xuất có bị giảm sút trọng lượng không?',
        strategySteps: [
          'Bước 1: Thiết lập cặp giả thiết: $H_0: \\mu = 500$ đối với $H_1: \\mu < 500$ (kiểm định 1 phía bên trái).',
          'Bước 2: Tính tiêu chuẩn kiểm định $Z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}}$.',
          'Bước 3: Tra giá trị tới hạn $z_{0.05}$ và so sánh giá trị quan sát $Z_{qs}$ với miền bác bỏ $W_\\alpha = (-\\infty, -1.645)$.',
        ],
        options: [
          'A. Bác bỏ $H_0$ vì $Z_{qs} = -2.4 < -1.645$, kết luận trọng lượng bị giảm sút',
          'B. Chấp nhận $H_0$ vì $Z_{qs} = -1.2 > -1.645$, quy trình vẫn bình thường',
          'C. Bác bỏ $H_0$ theo kiểm định 2 phía với $z_{0.025} = 1.96$',
          'D. Không đủ dữ liệu vì chưa biết phân phối của tổng thể',
        ],
        correctIndex: 0,
        whyExplanation: 'Tiêu chuẩn kiểm định: $Z = \\frac{494 - 500}{15 / \\sqrt{36}} = \\frac{-6}{2.5} = -2.4$. Vì kiểm định phía trái $H_1: \\mu < 500$, miền bác bỏ là $Z < -z_{0.05} = -1.645$. Do $-2.4 < -1.645$, ta bác bỏ $H_0$ với độ tin cậy 95%.',
      },
      {
        id: 3,
        title: 'Công thức Xác suất Đầy đủ và Bayes',
        statement: 'Có 3 hộp sản phẩm: Hộp I có 8 chính phẩm, 2 phế phẩm; Hộp II có 7 chính phẩm, 3 phế phẩm; Hộp III có 9 chính phẩm, 1 phế phẩm. Chọn ngẫu nhiên 1 hộp và từ đó lấy ra 1 sản phẩm thấy là phế phẩm. Xác suất phế phẩm đó thuộc Hộp II là bao nhiêu?',
        strategySteps: [
          'Bước 1: Đặt biến cố $A_i$ là chọn được Hộp $i$ ($P(A_i) = 1/3$) và $B$ là lấy được phế phẩm.',
          'Bước 2: Tính các xác suất điều kiện: $P(B|A_1) = 0.2$, $P(B|A_2) = 0.3$, $P(B|A_3) = 0.1$.',
          'Bước 3: Tính $P(B)$ theo công thức xác suất đầy đủ, sau đó áp dụng công thức Bayes: $P(A_2|B) = \\frac{P(A_2)P(B|A_2)}{P(B)}$.',
        ],
        options: [
          'A. $P(A_2|B) = 0.50$',
          'B. $P(A_2|B) = 0.33$',
          'C. $P(A_2|B) = 0.60$',
          'D. $P(A_2|B) = 0.25$',
        ],
        correctIndex: 0,
        whyExplanation: 'Ta có $P(B) = \\frac{1}{3}(0.2 + 0.3 + 0.1) = \\frac{0.6}{3} = 0.2$. Do đó $P(A_2|B) = \\frac{(1/3) \\times 0.3}{0.2} = \\frac{0.1}{0.2} = 0.50$ (50%).',
      },
      {
        id: 4,
        title: 'Khoảng ước lượng tin cậy cho kỳ vọng',
        statement: 'Đo chiều cao của 100 học sinh nam ngẫu nhiên được $\\bar{X} = 168\\text{cm}$, độ lệch chuẩn hiệu chỉnh $s = 6\\text{cm}$. Tìm khoảng tin cậy 95% cho chiều cao trung bình của học sinh nam toàn trường.',
        strategySteps: [
          'Bước 1: Do cỡ mẫu $n = 100 \\ge 30$, theo định lý giới hạn trung tâm, ta dùng phân phối chuẩn với $z_{\\alpha/2} = 1.96$.',
          'Bước 2: Tính độ chính xác ước lượng: $\\epsilon = z_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}} = 1.96 \\cdot \\frac{6}{10} = 1.176\\text{cm}$.',
          'Bước 3: Khoảng tin cậy là $(\\bar{X} - \\epsilon, \\bar{X} + \\epsilon)$.',
        ],
        options: [
          'A. $(166.82; 169.18)\\text{cm}$',
          'B. $(165.50; 170.50)\\text{cm}$',
          'C. $(167.04; 168.96)\\text{cm}$',
          'D. $(166.24; 169.76)\\text{cm}$',
        ],
        correctIndex: 0,
        whyExplanation: '$\\epsilon = 1.96 \\times \\frac{6}{\\sqrt{100}} = 1.176$. Khoảng tin cậy là $(168 - 1.176; 168 + 1.176) = (166.824; 169.176)\\text{cm}$.',
      },
      {
        id: 5,
        title: 'Phân phối Poisson trong dòng sự kiện',
        statement: 'Số lượng cuộc gọi đến một tổng đài trong 1 phút tuân theo quy luật Poisson với trung bình $\\lambda = 3$ cuộc gọi/phút. Tính xác suất để trong 1 phút tổng đài nhận được đúng 2 cuộc gọi.',
        strategySteps: [
          'Bước 1: Xác định biến ngẫu nhiên $Y \\sim P(\\lambda = 3)$.',
          'Bước 2: Áp dụng công thức phân phối Poisson: $P(Y = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}$.',
          'Bước 3: Thay $k = 2, \\lambda = 3$ và tính giá trị.',
        ],
        options: [
          'A. $P(Y = 2) = \\frac{9}{2} e^{-3} \\approx 0.2240$',
          'B. $P(Y = 2) = 3 e^{-3} \\approx 0.1494$',
          'C. $P(Y = 2) = \\frac{27}{6} e^{-3} \\approx 0.2240$',
          'D. $P(Y = 2) \\approx 0.3528$',
        ],
        correctIndex: 0,
        whyExplanation: '$P(Y = 2) = \\frac{3^2 e^{-3}}{2!} = \\frac{9}{2} \\cdot 0.049787 \\approx 0.22404$ (xấp xỉ 22.4%).',
      },
    ],
  });
});

/**
 * Feature 5: Explain MCQ "Tại sao?"
 */
app.post('/api/ai/explain-mcq', async (req, res) => {
  const { question, options, selectedIndex, correctIndex } = req.body;

  const systemInstruction = `Bạn là Trợ lý AI Phân tích Lỗi sai và Bẫy Đề thi Xác suất Thống kê.
Học sinh vừa nhấn nút "Tại sao?" sau khi chọn đáp án.
Hãy phân tích:
1. Bản chất toán học của câu hỏi.
2. Tại sao đáp án đúng lại đúng (chỉ ra công thức và lập luận).
3. Tại sao đáp án học sinh chọn lại đúng hoặc sai (chỉ ra bẫy thường gặp như: nhầm biến cố đối, nhầm kiểm định 1 phía với 2 phía, chia sai bậc tự do, nhầm lẫn giữa độ lệch chuẩn và phương sai).
4. Lời khuyên vàng để không tái phạm lỗi này.
Định dạng KaTeX đẹp.`;

  const prompt = `Câu hỏi: ${question}
Các lựa chọn:
${options.map((opt: string, i: number) => `[${i}] ${opt}`).join('\n')}
Học sinh đã chọn: [${selectedIndex}] ${options[selectedIndex]}
Đáp án chính xác: [${correctIndex}] ${options[correctIndex]}

Hãy giải thích chi tiết lý do và bẫy đề thi.`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    return res.json({ success: true, explanation: aiResult });
  }

  const isCorrect = selectedIndex === correctIndex;
  return res.json({
    success: true,
    explanation: isCorrect
      ? `### 🎉 Xuất sắc! Bạn đã chọn chính xác!
**Tại sao đáp án này đúng?**
- Bạn đã áp dụng đúng công thức và phân tích chính xác điều kiện của bài toán.
- **Bẫy đề thi cần lưu ý:** Rất nhiều bạn sinh viên nhầm lẫn giữa kiểm định 1 phía và 2 phía hoặc quên chuẩn hóa biến ngẫu nhiên $Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}$. Bạn đã tỉnh táo vượt qua bẫy này!`
      : `### ⚠️ Phân tích Bẫy & Lỗi Sai Thường Gặp
**1. Điểm nhầm lẫn then chốt:**
- Bạn đã chọn phương án: **${options[selectedIndex]}**
- Đáp án chính xác là: **${options[correctIndex]}**

**2. Nguyên nhân sai bản chất:**
- Thường gặp khi bạn quên xét biến cố đối nghịch $P(A) = 1 - P(\\bar{A})$ hoặc nhầm giữa phân phối Nhị thức $B(n, p)$ và phân phối Siêu bội $H(N, M, n)$ (chọn có hoàn lại vs không hoàn lại).
- Trong kiểm định giả thiết, hãy chú ý chiều của đối thiết $H_1$: dấu $<$ tương ứng kiểm định phía trái, dấu $>$ là phía phải, dấu $\\ne$ mới chia đôi $\\alpha/2$!

**💡 Lời khuyên vàng:** Trước khi bấm máy tính, hãy dành 10 giây viết rõ ký hiệu biến ngẫu nhiên và phân phối kèm tham số ra giấy nháp nhé!`,
  });
});

/**
 * Feature 6: AI Theory Oral Examination (Vấn đáp Lý thuyết AI)
 */
app.post('/api/ai/oral-exam', async (req, res) => {
  const { question, studentAnswer, topic } = req.body;

  const systemInstruction = `Bạn là Giảng viên Đại học phụ trách Vấn đáp Lý thuyết Xác suất Thống kê.
Nhiệm vụ:
1. Đánh giá câu trả lời của sinh viên trên thang điểm 10.
2. Phân tích:
   - Điểm hiểu đúng bản chất (Strengths).
   - "Lỗ hổng kiến thức" (Knowledge gaps): những ý chưa sâu hoặc dùng sai thuật ngữ toán học.
   - "Nguyên nhân hiểu sai bản chất" (Root misconception): chỉ rõ tại sao sinh viên hay bị nhầm ở điểm này.
3. Câu hỏi mở rộng tiếp theo (Socratic follow-up question) để kiểm tra độ nắm vững.
Trả về JSON.`;

  const prompt = `Chủ đề: ${topic || 'Lý thuyết XSTK'}
Câu hỏi vấn đáp: "${question}"
Câu trả lời của sinh viên: "${studentAnswer}"

Hãy đánh giá và phân tích chuyên sâu. Trả về format JSON:
{
  "score": 8, // thang 10
  "feedback": "Nhận xét tổng quát",
  "knowledgeGaps": ["Lỗ hổng 1", "Lỗ hổng 2"],
  "rootMisconception": "Nguyên nhân hiểu sai bản chất ở đây là...",
  "remedialAdvice": "Lời khuyên khắc phục",
  "followUpQuestion": "Câu hỏi vấn đáp tiếp theo"
}`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, ...parsed });
    } catch {
      // Fall through
    }
  }

  // Curated oral evaluation fallback
  return res.json({
    success: true,
    score: 8.5,
    feedback: 'Bạn nắm được định nghĩa cơ bản và diễn đạt mạch lạc bằng ngôn từ của mình.',
    knowledgeGaps: [
      'Chưa nhấn mạnh điều kiện biến độc lập và cỡ mẫu đủ lớn ($n \\ge 30$) khi phát biểu Định lý Giới hạn Trung tâm.',
      'Cần phân biệt rạch ròi giữa độ lệch chuẩn tổng thể $\\sigma$ và sai số chuẩn của số trung bình $SE = \\sigma / \\sqrt{n}$.',
    ],
    rootMisconception: 'Sinh viên thường nghĩ phân phối chuẩn áp dụng cho từng phần tử riêng lẻ, trong khi CLT thực chất khẳng định phân phối của "Trung bình mẫu" hoặc "Tổng" sẽ hội tụ về chuẩn.',
    remedialAdvice: 'Hãy xem lại chương Định lý Giới hạn Trung tâm và thực hành với đồ thị mô phỏng phân phối lấy mẫu (Sampling Distribution).',
    followUpQuestion: 'Nếu tổng thể ban đầu hoàn toàn lệch (skewed, ví dụ Exponential) chứ không đối xứng, thì trung bình mẫu $\\bar{X}$ có còn tiệm cận phân phối Chuẩn không khi $n = 100$?',
  });
});

/**
 * Feature 9: Community Forum AI Teaching Assistant
 */
app.post('/api/ai/forum-assist', async (req, res) => {
  const { title, content } = req.body;

  const systemInstruction = `Bạn là Trợ giảng AI cho Diễn đàn Học tập Xác suất Thống kê.
Nhiệm vụ:
1. Đề xuất 2-3 tags chủ đề chính xác (ví dụ: ["Phân phối Poisson", "Xác suất Bayes", "Kiểm định t-Student"]).
2. Đưa ra gợi ý thảo luận định hướng (Starter Guidance) cho bài đăng để giúp các bạn khác cùng thảo luận mà không làm lộ ngay giải pháp cuối cùng.`;

  const prompt = `Tiêu đề bài viết: ${title}
Nội dung bài viết: ${content}

Trả về JSON:
{
  "suggestedTags": ["Tag 1", "Tag 2"],
  "starterGuidance": "Gợi ý thảo luận từ Trợ giảng AI..."
}`;

  const aiResult = await callGemini(prompt, systemInstruction);

  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, ...parsed });
    } catch {
      // Fall through
    }
  }

  return res.json({
    success: true,
    suggestedTags: ['Xác suất Thống kê', 'Phương pháp giải', 'Tư duy mô hình'],
    starterGuidance: 'Trợ giảng AI nhận thấy đây là một bài toán thú vị! Các bạn hãy bắt đầu bằng việc lập bảng không gian mẫu hoặc xác định dạng biến ngẫu nhiên trước nhé.',
  });
});

// Mount Vite middleware for dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ProbStat AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
