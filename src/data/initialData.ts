import {
  ErrorLogItem,
  UserSkillMatrix,
  ForumPost,
  McqQuestion,
  EssayExercise,
} from '../types';

export const initialSkillMatrix: UserSkillMatrix[] = [
  {
    pillar: 'Xác suất Tiên đề & Bayes',
    score: 82,
    status: 'Tốt',
    recommendedTopic: 'Thực hành thêm các bài toán chẩn đoán y tế nhiều tầng',
  },
  {
    pillar: 'Biến ngẫu nhiên Rời rạc & Poisson',
    score: 88,
    status: 'Xuất sắc',
    recommendedTopic: 'Xấp xỉ Poisson cho phân phối Nhị thức khi n lớn, p nhỏ',
  },
  {
    pillar: 'Phân phối Chuẩn & Định lý CLT',
    score: 75,
    status: 'Trung bình',
    recommendedTopic: 'Chuẩn hóa biến số và tra bảng Laplace / phân phối tích lũy Φ(z)',
  },
  {
    pillar: 'Ước lượng Khoảng Tin Cậy',
    score: 79,
    status: 'Trung bình',
    recommendedTopic: 'Phân biệt độ chính xác ước lượng ε và khoảng tin cậy 2 phía',
  },
  {
    pillar: 'Kiểm định Giả thiết (Z & t-test)',
    score: 62,
    status: 'Yếu',
    recommendedTopic: 'Quy tắc chọn kiểm định 1 phía hay 2 phía dựa vào câu từ đề bài',
  },
  {
    pillar: 'Hồi quy Tuyến tính & Tương quan',
    score: 70,
    status: 'Trung bình',
    recommendedTopic: 'Ý nghĩa của hệ số hồi quy β1 và kiểm định ý nghĩa mô hình',
  },
];

export const initialErrorLogs: ErrorLogItem[] = [
  {
    id: 'err-1',
    source: 'Trắc nghiệm',
    topic: 'Kiểm định Giả thiết',
    questionSummary: 'Kiểm định liệu tuổi thọ pin có bị giảm sút sau 2 năm (đối thiết H1: μ < μ0)?',
    errorClassification: 'Nhầm lẫn 1 phía và 2 phía',
    studentMisstep: 'Học viên chia đôi mức ý nghĩa α thành α/2 = 0.025 và tra giá trị z_0.025 = 1.96 thay vì z_0.05 = 1.645.',
    remedyAction: 'Ôn tập quy tắc: Đề bài dùng từ "giảm", "kém hơn", "ngắn hơn" -> Kiểm định 1 phía bên trái, miền bác bỏ chỉ nằm ở đuôi trái với diện tích α.',
    resolved: false,
    timestamp: '2 giờ trước',
  },
  {
    id: 'err-2',
    source: 'Tự luận',
    topic: 'Định lý Giới hạn Trung tâm (CLT)',
    questionSummary: 'Tính xác suất tổng trọng lượng của 50 kiện hàng vượt quá 1200kg.',
    errorClassification: 'Quên chuẩn hóa biến ngẫu nhiên',
    studentMisstep: 'Lấy độ lệch chuẩn của 1 kiện hàng σ chia cho 1 thay vì nhân √n với tổng hoặc chia √n với trung bình mẫu.',
    remedyAction: 'Ghi nhớ công thức biến đổi: Tổng T_n = ∑X_i có kỳ vọng nμ và độ lệch chuẩn σ√n.',
    resolved: false,
    timestamp: 'Hôm qua',
  },
  {
    id: 'err-3',
    source: 'Vấn đáp lý thuyết',
    topic: 'Xác suất Có Điều Kiện',
    questionSummary: 'Giải thích nghịch lý công tố viên (Prosecutor\'s Fallacy) và sự khác biệt giữa P(A|B) và P(B|A).',
    errorClassification: 'Sai công thức Bayes / Nghịch lý điều kiện',
    studentMisstep: 'Nhầm lẫn đồng nhất xác suất kết quả xét nghiệm dương tính P(+|Bệnh) với xác suất người mang kết quả dương tính bị bệnh P(Bệnh|+).',
    remedyAction: 'Thực hành vẽ Cây Xác suất (Tree Diagram) hoặc Bảng 2x2 để trực quan hóa không gian mẫu phân lớp.',
    resolved: true,
    timestamp: '3 ngày trước',
  },
  {
    id: 'err-4',
    source: 'Trắc nghiệm',
    topic: 'Ước lượng Tham số',
    questionSummary: 'Tính độ rộng khoảng tin cậy 95% cho tỷ lệ cử tri ủng hộ ứng viên.',
    errorClassification: 'Nhầm lẫn độ lệch chuẩn và sai số chuẩn',
    studentMisstep: 'Sử dụng công thức √(p(1-p)) thay vì √(p(1-p)/n).',
    remedyAction: 'Luôn kiểm tra đơn vị: sai số chuẩn phải giảm tỉ lệ nghịch với căn bậc hai của cỡ mẫu (1/√n).',
    resolved: false,
    timestamp: '5 ngày trước',
  },
];

export const initialMcqQuestions: McqQuestion[] = [
  {
    id: 1,
    topic: 'Kiểm định Giả thiết',
    question: 'Một nhà sản xuất nước giải khát đóng chai tuyên bố dung tích trung bình là 330ml. Thanh tra đo 36 chai thấy $\\bar{X} = 328$ml, độ lệch chuẩn $\\sigma = 6$ml. Để kiểm định nghi ngờ nhà máy đóng thiếu dung tích với $\\alpha = 0.05$, đối thiết $H_1$ và miền bác bỏ $W_\\alpha$ tương ứng là:',
    options: [
      'A. $H_1: \\mu < 330$ và $W_\\alpha = (-\\infty; -1.645)$',
      'B. $H_1: \\mu \\ne 330$ và $W_\\alpha = (-\\infty; -1.96) \\cup (1.96; +\\infty)$',
      'C. $H_1: \\mu < 330$ và $W_\\alpha = (-\\infty; -1.96)$',
      'D. $H_1: \\mu > 330$ và $W_\\alpha = (1.645; +\\infty)$',
    ],
    correctIndex: 0,
    whyExplanation: 'Thanh tra nghi ngờ "đóng thiếu" (tức $\\mu < 330$), do đó đối thiết là kiểm định 1 phía bên trái $H_1: \\mu < 330$. Với mức ý nghĩa $\\alpha = 0.05$, giá trị tới hạn chuẩn tắc là $-z_{0.05} = -1.645$. Miền bác bỏ là $W_\\alpha = (-\\infty; -1.645)$.',
    commonTrap: 'Học sinh hay chọn B vì thói quen làm kiểm định 2 phía mà không đọc kỹ chữ "đóng thiếu" trong câu hỏi.',
  },
  {
    id: 2,
    topic: 'Định lý Giới hạn Trung tâm',
    question: 'Theo Định lý Giới hạn Trung tâm (CLT), điều nào sau đây là ĐÚNG NHẤT về phân phối của trung bình mẫu $\\bar{X}$ khi cỡ mẫu $n \\ge 30$?',
    options: [
      'A. Tổng thể ban đầu bắt buộc phải có phân phối chuẩn thì trung bình mẫu mới có phân phối chuẩn',
      'B. Phân phối của trung bình mẫu tiệm cận chuẩn bất kể hình dạng phân phối của tổng thể gốc (miễn là có phương sai hữu hạn)',
      'C. Khi $n$ tăng lên vô hạn, phương sai của trung bình mẫu sẽ tăng tỉ lệ thuận với $\\sqrt{n}$',
      'D. Độ lệch chuẩn của mẫu $s$ luôn bằng đúng độ lệch chuẩn của tổng thể $\\sigma$',
    ],
    correctIndex: 1,
    whyExplanation: 'Đây chính là vẻ đẹp kỳ diệu của CLT: Dù tổng thể gốc có bị lệch, phân phối đều, hay bất kỳ dạng nào, phân phối của trung bình mẫu $\\bar{X}$ vẫn sẽ tiệm cận chuẩn $\\mathcal{N}(\\mu, \\sigma^2/n)$ khi $n \\ge 30$.',
    commonTrap: 'Học sinh hay nhầm lẫn chọn A vì nghĩ phân phối chuẩn của mẫu đòi hỏi tổng thể cũng phải chuẩn.',
  },
  {
    id: 3,
    topic: 'Xác suất Có Điều Kiện & Bayes',
    question: 'Tỷ lệ người mắc bệnh trong cộng đồng là $0.5\\%$. Một xét nghiệm có độ nhạy $98\\%$ (người có bệnh xét nghiệm dương tính) và độ đặc hiệu $95\\%$ (người không bệnh xét nghiệm âm tính). Một người xét nghiệm dương tính. Xác suất người này thực sự mắc bệnh xấp xỉ:',
    options: [
      'A. $98\\%$',
      'B. $8.95\\%$',
      'C. $50\\%$',
      'D. $95\\%$',
    ],
    correctIndex: 1,
    whyExplanation: 'Áp dụng công thức Bayes: $P(+) = 0.005 \\times 0.98 + 0.995 \\times 0.05 = 0.0049 + 0.04975 = 0.05465$. Xác suất thực sự mắc bệnh: $P(\\text{Bệnh}|+) = \\frac{0.0049}{0.05465} \\approx 0.0896$ (khoảng $8.95\\%$).',
    commonTrap: 'Lỗi tư duy trực giác phổ biến nhất (Base Rate Fallacy): Tưởng rằng xét nghiệm 98% chuẩn thì có kết quả dương tính là 98% bị bệnh!',
  },
  {
    id: 4,
    topic: 'Phân phối Rời rạc',
    question: 'Một tổng đài nhận trung bình $\\lambda = 4$ cuộc gọi mỗi phút. Số cuộc gọi trong 1 phút tuân theo phân phối Poisson. Xác suất trong 1 phút không có cuộc gọi nào là:',
    options: [
      'A. $e^{-4} \\approx 0.0183$',
      'B. $4e^{-4} \\approx 0.0733$',
      'C. 0',
      'D. $1 - e^{-4} \\approx 0.9817$',
    ],
    correctIndex: 0,
    whyExplanation: 'Công thức Poisson: $P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}$. Với $k = 0$, ta có $P(X = 0) = \\frac{4^0 e^{-4}}{0!} = e^{-4} \\approx 0.0183$.',
    commonTrap: 'Quên quy ước $0! = 1$ và $4^0 = 1$.',
  },
];

export const initialEssayExercises: EssayExercise[] = [
  {
    id: 1,
    title: 'Bài toán ước lượng mức tiêu thụ điện trung bình mùa hè',
    difficulty: 'Vận dụng',
    statement: 'Để ước tính mức tiêu thụ điện trung bình hàng tháng của các hộ gia đình trong một khu đô thị, người ta khảo sát ngẫu nhiên 64 hộ và thu được kết quả: trung bình mẫu $\\bar{X} = 380$ kWh, độ lệch chuẩn mẫu hiệu chỉnh $s = 40$ kWh. Hãy tìm khoảng tin cậy $95\\%$ cho mức tiêu thụ điện trung bình của toàn khu đô thị. Biết giá trị tới hạn chuẩn $z_{0.025} = 1.96$.',
    strategySteps: [
      'Bước 1: Xác định quy mô mẫu: Do $n = 64 \\ge 30$, theo Định lý Giới hạn Trung tâm, ta có thể áp dụng xấp xỉ phân phối chuẩn tắc $Z$.',
      'Bước 2: Tính sai số chuẩn của số trung bình: $SE = \\frac{s}{\\sqrt{n}} = \\frac{40}{\\sqrt{64}} = 5$ kWh.',
      'Bước 3: Tính độ chính xác ước lượng (Margin of Error): $\\epsilon = z_{\\alpha/2} \\cdot SE = 1.96 \\times 5 = 9.8$ kWh.',
      'Bước 4: Thiết lập khoảng tin cậy: $(\\bar{X} - \\epsilon, \\bar{X} + \\epsilon) = (380 - 9.8; 380 + 9.8) = (370.2; 389.8)$ kWh.',
    ],
  },
  {
    id: 2,
    title: 'Kiểm định hiệu quả của phương pháp dạy học mới',
    difficulty: 'Nâng cao',
    statement: 'Điểm thi trung bình môn XSTK nhiều năm qua là 6.8 điểm. Áp dụng phương pháp giảng dạy tích hợp Bảng vẽ tương tác AI cho một lớp 25 sinh viên, điểm trung bình đạt được là $\\bar{X} = 7.3$, độ lệch chuẩn mẫu $s = 1.2$. Giả sử điểm thi có phân phối chuẩn. Với mức ý nghĩa $\\alpha = 0.05$, phương pháp mới có thực sự nâng cao điểm thi không? (Cho biết $t_{0.05; 24} = 1.711$).',
    strategySteps: [
      'Bước 1: Đặt giả thiết: $H_0: \\mu = 6.8$ (không có sự cải thiện) đối với đối thiết 1 phía $H_1: \\mu > 6.8$ (phương pháp mới làm tăng điểm).',
      'Bước 2: Vì cỡ mẫu nhỏ $n = 25 < 30$ và phương sai tổng thể chưa biết, ta dùng tiêu chuẩn kiểm định Student: $T = \\frac{\\bar{X} - \\mu_0}{s / \\sqrt{n}}$.',
      'Bước 3: Thay số tính giá trị quan sát: $T_{qs} = \\frac{7.3 - 6.8}{1.2 / \\sqrt{25}} = \\frac{0.5}{0.24} \\approx 2.083$.',
      'Bước 4: So sánh với giá trị tới hạn: $T_{qs} = 2.083 > t_{0.05; 24} = 1.711$, kết luận bác bỏ $H_0$, phương pháp mới đem lại hiệu quả thực sự.',
    ],
  },
];

export const initialForumPosts: ForumPost[] = [
  {
    id: 'post-1',
    author: 'Trần Minh Quang (ĐH Bách Khoa)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    title: 'Phân vân khi nào dùng Z-test và khi nào dùng t-test?',
    content: 'Em chào thầy cô và các bạn. Em thường bị lúng túng trong các bài toán kiểm định trung bình mẫu: khi nào thì được dùng bảng phân phối chuẩn Z, còn khi nào bắt buộc phải dùng Student t? Nếu n = 30 và chưa biết phương sai tổng thể thì dùng cái nào chính xác hơn?',
    tags: ['Kiểm định giả thiết', 'Z-test vs t-test', 'Lý thuyết mẫu'],
    aiStarterGuidance: 'Trợ giảng AI: Quy tắc vàng là xét 2 yếu tố: (1) Phương sai tổng thể $\\sigma^2$ đã biết hay chưa? (2) Cỡ mẫu $n \\ge 30$ hay $n < 30$ cùng giả định phân phối chuẩn. Với $n \\ge 30$, phân phối $t(n-1)$ tiệm cận rất sát với $Z$, nên cả 2 cách thường cho kết luận tương đương, nhưng dùng $t$ luôn an toàn nhất!',
    likes: 14,
    repliesCount: 2,
    createdAt: '4 giờ trước',
    replies: [
      {
        id: 'rep-1',
        author: 'Nguyễn Lê Hoàng',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        content: 'Theo thầy mình dặn thì cứ chưa biết sigma và mẫu dưới 30 thì 100% phải dùng t-Student với bậc tự do df = n - 1 nha bạn.',
        createdAt: '3 giờ trước',
      },
      {
        id: 'rep-2',
        author: 'Trợ lý AI EdTech',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        isAi: true,
        content: 'Bổ sung thêm: Nếu tổng thể gốc không có phân phối chuẩn mà $n < 30$, ta thậm chí không được dùng cả $Z$ lẫn $t$, mà phải chuyển sang kiểm định phi tham số (Non-parametric tests như Wilcoxon sign-rank test)!',
        createdAt: '2 giờ trước',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Lê Thu Trang (ĐH Kinh Tế Quốc Dân)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    title: 'Cách nhớ nhanh phân biệt $P(A|B)$ và $P(B|A)$ trong bài toán Bayes?',
    content: 'Mọi người có mẹo nào giúp không bị nhầm lẫn giữa điều kiện đã xảy ra và biến cố cần tính không ạ? Hôm thi thử em đảo ngược mẫu số làm sai cả bài.',
    tags: ['Xác suất Bayes', 'Mẹo thi', 'Xác suất điều kiện'],
    aiStarterGuidance: 'Trợ giảng AI: Mẹo ghi nhớ: Chữ cái đứng SAU dấu gạch đứng "|" là thông tin BẠN ĐÃ BIẾT CHẮC CHẮN (Đã xảy ra/Hiện tượng quan sát thấy). Còn chữ cái đứng TRƯỚC là điều bạn ĐANG TÌM KIẾM/NGHI NGỜ.',
    likes: 21,
    repliesCount: 1,
    createdAt: 'Hôm qua',
    replies: [
      {
        id: 'rep-3',
        author: 'Vũ Đức Nam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        content: 'Cứ vẽ cây xác suất nhánh ra là không bao giờ nhầm được bạn nhé, nhánh 1 là nguyên nhân, nhánh 2 là kết quả!',
        createdAt: '18 giờ trước',
      },
    ],
  },
];
