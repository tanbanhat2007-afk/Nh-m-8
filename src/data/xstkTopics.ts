import { TopicLesson } from '../types';

export const xstkTopics: TopicLesson[] = [
  {
    id: 'normal-clt',
    title: 'Phân phối Chuẩn & Định lý Giới hạn Trung tâm (CLT)',
    category: 'Phân phối xác suất',
    summary: 'Nền tảng của toàn bộ thống kê suy diễn: khi cỡ mẫu đủ lớn ($n \\ge 30$), phân phối của trung bình mẫu tiệm cận phân phối chuẩn bất kể hình dạng tổng thể gốc.',
    step1Concept: {
      intuitiveExplanation: 'Hãy tưởng tượng bạn đo chiều cao của hàng ngàn người ngẫu nhiên. Đa số mọi người có chiều cao quanh mức trung bình, càng cao vượt trội hoặc càng thấp thì số lượng càng hiếm dần, tạo thành một chiếc chuông hoàn hảo cân xứng.',
      keyAnalogy: 'Chiếc máy Plinko hay bàn cờ Galton: khi thả hàng ngàn viên bi rơi qua các chốt so le, mỗi va chạm trái/phải ngẫu nhiên cộng dồn lại sẽ tự động xếp thành hình chuông Gauss ở đáy.',
      realWorldApplication: 'Kiểm soát chất lượng sản xuất linh kiện vi mạch bán dẫn, chuẩn hóa điểm thi SAT/IELTS, đo lường biến động giá cổ phiếu và ước tính rủi ro tài chính Value-at-Risk (VaR).',
    },
    step2Theory: {
      theoremName: 'Định lý Giới hạn Trung tâm (Central Limit Theorem - Lindeberg–Lévy)',
      latexFormula: '\\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^n X_i \\xrightarrow{d} \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\quad \\text{khi } n \\ge 30',
      parameterDescriptions: [
        { symbol: '\\mu', meaning: 'Kỳ vọng toán (giá trị trung bình thực sự của tổng thể)' },
        { symbol: '\\sigma^2', meaning: 'Phương sai của biến ngẫu nhiên tổng thể' },
        { symbol: 'n', meaning: 'Kích thước mẫu kiểm tra (quy tắc thực nghiệm: $n \\ge 30$)' },
        { symbol: '\\sigma / \\sqrt{n}', meaning: 'Sai số chuẩn (Standard Error - SE) của trung bình mẫu' },
      ],
      conditions: [
        'Các biến ngẫu nhiên $X_1, X_2, ..., X_n$ độc lập và có cùng phân phối (i.i.d).',
        'Tổng thể có kỳ vọng hữu hạn $\\mu < \\infty$ và phương sai hữu hạn $\\sigma^2 < \\infty$.',
        'Cỡ mẫu $n$ đủ lớn (thường $n \\ge 30$, nếu phân phối gốc gần đối xứng thì $n$ có thể nhỏ hơn).',
      ],
    },
    step3Example: {
      problemStatement: 'Tuổi thọ bóng đèn LED của một nhà máy có trung bình $\\mu = 2000$ giờ và độ lệch chuẩn $\\sigma = 200$ giờ. Lấy ngẫu nhiên mẫu $n = 64$ bóng đèn. Tính xác suất để tuổi thọ trung bình của mẫu $\\bar{X}$ vượt quá 2040 giờ.',
      interactiveDiagramType: 'normal_curve',
      solutionWalkthrough: [
        'Bước 1: Do cỡ mẫu $n = 64 > 30$, theo CLT ta có $\\bar{X} \\sim \\mathcal{N}\\left(\\mu = 2000, \\sigma_{\\bar{X}} = \\frac{200}{\\sqrt{64}} = 25\\right)$.',
        'Bước 2: Chuẩn hóa biến ngẫu nhiên về biến chuẩn tắc $Z$: $Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} = \\frac{2040 - 2000}{25} = 1.6$.',
        'Bước 3: Tra bảng Laplace hoặc hàm phân phối chuẩn: $P(\\bar{X} > 2040) = P(Z > 1.6) = 1 - \\Phi(1.6) = 1 - 0.9452 = 0.0548$ (tương đương 5.48%).',
      ],
    },
    step4Practice: {
      problem: 'Một máy đóng gói đường tự động với trọng lượng trung bình 1kg và độ lệch chuẩn 20g. Chọn ngẫu nhiên mẫu gồm 100 gói. Tính xác suất để trọng lượng trung bình của 100 gói này chênh lệch không quá 3g so với trọng lượng chuẩn (tức từ 997g đến 1003g)?',
      clue: 'Tính sai số chuẩn $SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{20}{\\sqrt{100}} = 2\\text{g}$, sau đó tính $Z_1 = \\frac{-3}{2} = -1.5$ và $Z_2 = 1.5$.',
      expectedAnswerSnippet: 'P(|\\bar{X} - 1000| \\le 3) = 2\\Phi(1.5) - 1 \\approx 0.8664',
    },
  },
  {
    id: 'bayes-theorem',
    title: 'Xác suất Có Điều Kiện & Công thức Bayes',
    category: 'Xác suất cơ bản',
    summary: 'Công thức toán học định lượng cách chúng ta cập nhật niềm tin hoặc xác suất tiền nghiệm (Prior) khi có thêm bằng chứng thực tế mới (Likelihood & Evidence).',
    step1Concept: {
      intuitiveExplanation: 'Nếu một xét nghiệm y tế có độ chính xác 99%, bạn nhận kết quả Dương tính, liệu xác suất bạn thực sự mắc bệnh có phải là 99% không? Thật bất ngờ, nếu căn bệnh đó cực kỳ hiếm (ví dụ 1 trên 10,000), xác suất bạn thực sự bị bệnh có thể dưới 10%! Đó chính là sức mạnh của Bayes.',
      keyAnalogy: 'Thám tử phá án: Khởi đầu bằng danh sách nghi phạm bình đẳng. Mỗi khi tìm thấy một manh mối mới (dấu vân tay, bằng chứng ngoại phạm), thám tử cập nhật lại độ khả nghi của từng người.',
      realWorldApplication: 'Bộ lọc thư rác (Spam Filter) của Gmail, hệ thống chẩn đoán y khoa AI, xe tự hành định vị vị trí trong môi trường có tín hiệu GPS nhiễu.',
    },
    step2Theory: {
      theoremName: 'Công thức Bayes (Bayes\' Theorem)',
      latexFormula: 'P(A_k|B) = \\frac{P(A_k) \\cdot P(B|A_k)}{\\sum_{i=1}^n P(A_i) \\cdot P(B|A_i)} = \\frac{P(A_k) \\cdot P(B|A_k)}{P(B)}',
      parameterDescriptions: [
        { symbol: 'P(A_k)', meaning: 'Xác suất tiền nghiệm (Prior probability) của biến cố nguyên nhân $A_k$' },
        { symbol: 'P(B|A_k)', meaning: 'Hàm hợp lý (Likelihood): xác suất xuất hiện triệu chứng $B$ nếu nguyên nhân $A_k$ xảy ra' },
        { symbol: 'P(B)', meaning: 'Xác suất toàn phần của bằng chứng $B$ (Evidence)' },
        { symbol: 'P(A_k|B)', meaning: 'Xác suất hậu nghiệm (Posterior probability) cập nhật sau khi quan sát được $B$' },
      ],
      conditions: [
        'Hệ biến cố $A_1, A_2, ..., A_n$ lập thành một hệ đầy đủ (đôi một xung khắc và hợp lại thành không gian mẫu $\\Omega$).',
        'Xác suất của các nguyên nhân $P(A_i) > 0$.',
        'Xác suất của biến cố quan sát $P(B) > 0$.',
      ],
    },
    step3Example: {
      problemStatement: 'Tỷ lệ người mắc một bệnh hiếm trong dân số là 0.1% ($P(D) = 0.001$). Xét nghiệm cho kết quả dương tính với người có bệnh là 99% ($P(+|D) = 0.99$), nhưng tỷ lệ dương tính giả ở người khỏe là 2% ($P(+|\\bar{D}) = 0.02$). Một người đi khám nhận kết quả dương tính. Tính xác suất người này thực sự mắc bệnh?',
      interactiveDiagramType: 'bayes_tree',
      solutionWalkthrough: [
        'Bước 1: Tính xác suất toàn phần nhận kết quả dương tính $P(+)$: $P(+) = P(D)P(+|D) + P(\\bar{D})P(+|\\bar{D}) = 0.001 \\times 0.99 + 0.999 \\times 0.02 = 0.00099 + 0.01998 = 0.02097$.',
        'Bước 2: Áp dụng công thức Bayes để tính xác suất hậu nghiệm $P(D|+)$: $P(D|+) = \\frac{0.00099}{0.02097} \\approx 0.0472$ (tức chỉ khoảng 4.72%!).',
        'Bước 3: Phân tích bản chất: Vì bệnh quá hiếm, số ca dương tính giả từ nhóm người khỏe chiếm áp đảo so với ca dương tính thật.',
      ],
    },
    step4Practice: {
      problem: 'Ba máy I, II, III sản xuất lần lượt 30%, 45% và 25% tổng sản phẩm nhà máy. Tỷ lệ phế phẩm của 3 máy tương ứng là 1%, 2% và 3%. Chọn ngẫu nhiên 1 sản phẩm và thấy là phế phẩm. Tính xác suất sản phẩm đó do máy II sản xuất.',
      clue: 'Tính $P(F) = 0.3(0.01) + 0.45(0.02) + 0.25(0.03) = 0.0195$. Sau đó lấy $P(II \\cap F) / P(F)$.',
      expectedAnswerSnippet: 'P(M_2|F) = \\frac{0.45 \\times 0.02}{0.0195} \\approx 0.4615 (46.15\\%)',
    },
  },
  {
    id: 'binomial-dist',
    title: 'Phân phối Nhị thức & Dãy Phép thử Bernoulli',
    category: 'Biến ngẫu nhiên',
    summary: 'Mô hình hóa số lần thành công khi thực hiện lặp lại $n$ phép thử độc lập với xác suất thành công $p$ không đổi qua mỗi lần thử.',
    step1Concept: {
      intuitiveExplanation: 'Tung đồng xu 10 lần, số mặt ngửa bạn nhận được có thể từ 0 đến 10. Xác suất nhận được đúng 5 mặt ngửa sẽ cao nhất, và xác suất nhận được 0 hoặc 10 mặt ngửa là cực kỳ thấp.',
      keyAnalogy: 'Một tiền đạo sút luân lưu 5 quả: mỗi cú sút chỉ có 2 kết cục (Vào hoặc Trượt) với tỷ lệ thành công không đổi và không bị tâm lý ảnh hưởng bởi quả trước.',
      realWorldApplication: 'Dự báo tỷ lệ lỗi sản phẩm trong dây chuyền lắp ráp ô tô, số lượng khách hàng mua hàng sau khi click quảng cáo trực tuyến (Conversion Rate).',
    },
    step2Theory: {
      theoremName: 'Công thức Xác suất Phân phối Nhị thức B(n, p)',
      latexFormula: 'P(X = k) = C_n^k p^k (1-p)^{n-k} \\quad (k = 0, 1, 2, ..., n)',
      parameterDescriptions: [
        { symbol: 'n', meaning: 'Tổng số phép thử Bernoulli độc lập được tiến hành' },
        { symbol: 'p', meaning: 'Xác suất thành công trong một phép thử duy nhất ($0 \\le p \\le 1$)' },
        { symbol: 'k', meaning: 'Số lần thành công cần tính xác suất' },
        { symbol: 'E(X) = np', meaning: 'Kỳ vọng (số lần thành công trung bình)' },
        { symbol: 'Var(X) = np(1-p)', meaning: 'Phương sai của phân phối' },
      ],
      conditions: [
        'Chỉ có 2 kết cục loại trừ nhau trong mỗi phép thử: Thành công (S) hoặc Thất bại (F).',
        'Các phép thử phải hoàn toàn độc lập với nhau.',
        'Xác suất thành công $p$ là hằng số cố định xuyên suốt cả $n$ phép thử.',
      ],
    },
    step3Example: {
      problemStatement: 'Một bài thi trắc nghiệm gồm 10 câu hỏi, mỗi câu có 4 lựa chọn và chỉ có 1 đáp án đúng. Một học sinh không học bài nên đánh lụi ngẫu nhiên cả 10 câu. Tính xác suất học sinh này đạt đúng 4 câu?',
      interactiveDiagramType: 'binomial_bars',
      solutionWalkthrough: [
        'Bước 1: Xác định mô hình $X \\sim B(n = 10, p = 0.25)$.',
        'Bước 2: Áp dụng công thức với $k = 4$: $P(X = 4) = C_{10}^4 (0.25)^4 (0.75)^6$.',
        'Bước 3: Tính toán: $C_{10}^4 = 210$; $(0.25)^4 \\approx 0.003906$; $(0.75)^6 \\approx 0.177978$. Kết quả: $P(X = 4) \\approx 0.146$ (14.6%).',
      ],
    },
    step4Practice: {
      problem: 'Xác suất để một hạt giống nảy mầm là $p = 0.8$. Gieo 6 hạt giống độc lập. Tính xác suất để có ít nhất 5 hạt nảy mầm?',
      clue: 'Biến cố ít nhất 5 hạt nảy mầm là $P(X \\ge 5) = P(X = 5) + P(X = 6)$.',
      expectedAnswerSnippet: 'P(X \\ge 5) = C_6^5(0.8)^5(0.2)^1 + (0.8)^6 \\approx 0.3932 + 0.2621 = 0.6553',
    },
  },
  {
    id: 'hypothesis-testing',
    title: 'Kiểm định Giả thiết Thống kê (Z-test & t-test)',
    category: 'Kiểm định',
    summary: 'Phương pháp khoa học để quyết định chấp nhận hay bác bỏ một tuyên bố về tổng thể dựa trên bằng chứng dữ liệu thu thập từ mẫu ngẫu nhiên.',
    step1Concept: {
      intuitiveExplanation: 'Giống như tòa án xét xử: Một bị cáo luôn được coi là vô tội (Giả thiết $H_0$) cho đến khi công tố viên đưa ra bằng chứng đủ mạnh vượt qua mức nghi ngờ hợp lý ($p$-value $< \\alpha$) để tuyên bố có tội (Bác bỏ $H_0$, chấp nhận $H_1$).',
      keyAnalogy: 'Nếu một người tung đồng xu 20 lần và được cả 20 mặt ngửa, bạn có còn tin đồng xu là cân đối không? Xác suất chuyện đó xảy ra do may rủi quá bé ($p < 0.000001$), buộc bạn bác bỏ giả thiết cân đối!',
      realWorldApplication: 'Thử nghiệm lâm sàng thuốc mới (thuốc mới có thực sự giảm huyết áp hơn giả dược không?), A/B Testing giao diện website trong thương mại điện tử.',
    },
    step2Theory: {
      theoremName: 'Tiêu chuẩn Kiểm định Trung bình Tổng thể',
      latexFormula: 'Z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}} \\quad \\text{hoặc} \\quad T = \\frac{\\bar{X} - \\mu_0}{s / \\sqrt{n}} \\sim t(n-1)',
      parameterDescriptions: [
        { symbol: 'H_0: \\mu = \\mu_0', meaning: 'Giả thiết không (Null Hypothesis) biểu thị trạng thái không có sự khác biệt' },
        { symbol: 'H_1', meaning: 'Đối thiết (Alternative Hypothesis): kiểm định 2 phía $(\\ne)$ hoặc 1 phía $(<, >)$' },
        { symbol: '\\alpha', meaning: 'Mức ý nghĩa (Significance Level, thường chọn 0.05 hoặc 0.01) - xác suất mắc sai lầm loại I' },
        { symbol: 'p\\text{-value}', meaning: 'Xác suất quan sát được kết quả cực đoan như mẫu nếu $H_0$ là đúng' },
      ],
      conditions: [
        'Dùng Z-test khi phương sai tổng thể $\\sigma^2$ đã biết hoặc cỡ mẫu lớn $n \\ge 30$.',
        'Dùng t-test Student với $df = n - 1$ khi $\\sigma$ chưa biết và cỡ mẫu nhỏ $n < 30$ từ tổng thể phân phối chuẩn.',
      ],
    },
    step3Example: {
      problemStatement: 'Một công ty khẳng định thời gian phản hồi máy chủ trung bình là $\\mu = 50\\text{ms}$. Khách hàng nghi ngờ máy chủ chạy chậm hơn (tức $\\mu > 50\\text{ms}$). Đo ngẫu nhiên 36 yêu cầu thấy trung bình $\\bar{X} = 54\\text{ms}$, biết $\\sigma = 12\\text{ms}$. Với $\\alpha = 0.05$, hãy kiểm định nghi ngờ này.',
      interactiveDiagramType: 'hypothesis_test',
      solutionWalkthrough: [
        'Bước 1: Thiết lập giả thiết: $H_0: \\mu = 50$ đối với $H_1: \\mu > 50$ (kiểm định 1 phía bên phải).',
        'Bước 2: Tính giá trị quan sát $Z_{qs} = \\frac{54 - 50}{12 / \\sqrt{36}} = \\frac{4}{2} = 2.0$.',
        'Bước 3: Với $\\alpha = 0.05$, giá trị tới hạn là $z_{0.05} = 1.645$. Miền bác bỏ $W_\\alpha = (1.645, +\\infty)$.',
        'Bước 4: Vì $Z_{qs} = 2.0 > 1.645$, ta BÁC BỎ $H_0$. Nghi ngờ của khách hàng là có cơ sở vững chắc!',
      ],
    },
    step4Practice: {
      problem: 'Nồng độ đường trong máu của người bình thường là 100 mg/dL. Đo trên mẫu 16 bệnh nhân sau khi dùng thuốc thử thấy $\\bar{X} = 106$, $s = 8$. Biết dữ liệu có phân phối chuẩn. Với mức ý nghĩa $\\alpha = 0.05$, thuốc có làm tăng đường huyết không? ($t_{0.05; 15} = 1.753$).',
      clue: 'Tính $T_{qs} = \\frac{106 - 100}{8 / \\sqrt{16}} = \\frac{6}{2} = 3.0$. So sánh với $1.753$.',
      expectedAnswerSnippet: 'T_{qs} = 3.0 > 1.753 \\implies \\text{Bác bỏ } H_0, \\text{thuốc làm tăng đường huyết.}',
    },
  },
];
