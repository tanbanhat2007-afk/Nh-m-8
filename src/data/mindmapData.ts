import { MindmapNode } from '../types';

export const xstkMindmap: MindmapNode = {
  id: 'root',
  label: 'Xác Suất Thống Kê (Probability & Statistics)',
  category: 'Root',
  description: 'Toàn bộ khung kiến thức toán học về hiện tượng ngẫu nhiên, mô hình hóa dữ liệu và suy diễn thống kê.',
  children: [
    {
      id: 'prob-foundation',
      label: '1. Nền tảng Xác suất Cổ điển',
      category: 'Xác suất cơ bản',
      description: 'Không gian mẫu $\\Omega$, biến cố ngẫu nhiên, các tiên đề Kolmogorov.',
      formula: 'P(A) = \\frac{|A|}{|\\Omega|} \\quad (0 \\le P(A) \\le 1)',
      children: [
        {
          id: 'conditional-prob',
          label: 'Xác suất Có Điều Kiện',
          category: 'Xác suất cơ bản',
          description: 'Xác suất biến cố A xảy ra khi biết biến cố B đã xảy ra.',
          formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
        },
        {
          id: 'total-prob-bayes',
          label: 'Xác suất Toàn phần & Bayes',
          category: 'Xác suất cơ bản',
          description: 'Cập nhật niềm tin tiền nghiệm sang hậu nghiệm khi có chứng cứ mới.',
          formula: 'P(A_k|B) = \\frac{P(A_k)P(B|A_k)}{\\sum P(A_i)P(B|A_i)}',
        },
        {
          id: 'independence',
          label: 'Biến cố Độc lập',
          category: 'Xác suất cơ bản',
          description: 'Biến cố A xảy ra không ảnh hưởng xác suất của B: $P(A \\cap B) = P(A)P(B)$.',
          formula: 'P(A \\cap B) = P(A) \\cdot P(B)',
        },
      ],
    },
    {
      id: 'random-variables',
      label: '2. Biến Ngẫu Nhiên & Đặc Trưng',
      category: 'Biến ngẫu nhiên',
      description: 'Hàm số gán mỗi kết cục trong không gian mẫu với một số thực.',
      formula: 'X: \\Omega \\to \\mathbb{R}',
      children: [
        {
          id: 'expectation-variance',
          label: 'Kỳ vọng & Phương sai',
          category: 'Biến ngẫu nhiên',
          description: 'Kỳ vọng E(X) là trọng tâm phân phối, Phương sai Var(X) đo độ phân tán rủi ro.',
          formula: 'E(X) = \\sum x_i p_i, \\quad \\text{Var}(X) = E(X^2) - [E(X)]^2',
        },
        {
          id: 'covariance-corr',
          label: 'Hiệp phương sai & Hệ số Tương quan',
          category: 'Biến ngẫu nhiên',
          description: 'Đo lường mối quan hệ tuyến tính giữa 2 biến ngẫu nhiên X và Y.',
          formula: '\\rho_{XY} = \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\sigma_Y} \\quad (-1 \\le \\rho \\le 1)',
        },
      ],
    },
    {
      id: 'distributions',
      label: '3. Các Phân phối Quan trọng',
      category: 'Phân phối xác suất',
      description: 'Họ các phân phối chuẩn mực xuất hiện trong tự nhiên và công nghệ.',
      children: [
        {
          id: 'discrete-dist',
          label: 'Phân phối Rời rạc (Nhị thức, Poisson, Siêu bội)',
          category: 'Phân phối xác suất',
          description: 'Mô hình số lần thành công $B(n,p)$, dòng sự kiện hiếm $P(\\lambda)$.',
          formula: 'P(X=k) = C_n^k p^k (1-p)^{n-k}, \\quad P(Y=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}',
        },
        {
          id: 'continuous-dist',
          label: 'Phân phối Chuẩn Gauss $\\mathcal{N}(\\mu, \\sigma^2)$',
          category: 'Phân phối xác suất',
          description: 'Đường cong hình chuông chi phối hầu hết các quy luật tự nhiên và kỹ thuật.',
          formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
        },
        {
          id: 'student-t-chisq',
          label: 'Phân phối Student t & Khi-bình phương ($\\chi^2$)',
          category: 'Phân phối xác suất',
          description: 'Phân phối phục vụ suy diễn với mẫu nhỏ và kiểm tra tính độc lập/độ phù hợp.',
          formula: 'T = \\frac{\\bar{X}-\\mu}{s/\\sqrt{n}} \\sim t(n-1)',
        },
      ],
    },
    {
      id: 'inferential-stats',
      label: '4. Thống Kê Suy Diễn',
      category: 'Ước lượng & Kiểm định',
      description: 'Từ một mẫu dữ liệu ngẫu nhiên hữu hạn, suy luận ra bản chất của toàn thể tổng thể.',
      children: [
        {
          id: 'clt-law-large-num',
          label: 'Định lý Giới hạn Trung tâm (CLT)',
          category: 'Lý thuyết mẫu',
          description: 'Khi $n \\ge 30$, trung bình mẫu luôn hội tụ về phân phối chuẩn.',
          formula: '\\bar{X} \\approx \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right)',
        },
        {
          id: 'confidence-intervals',
          label: 'Ước lượng Khoảng Tin Cậy',
          category: 'Ước lượng',
          description: 'Khoảng chứa tham số tổng thể với độ tin cậy $(1-\\alpha)$ cho trước.',
          formula: '\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}',
        },
        {
          id: 'hypothesis-testing-node',
          label: 'Kiểm định Giả thiết Thống kê',
          category: 'Kiểm định',
          description: 'Quyết định bác bỏ hay chưa đủ bằng chứng bác bỏ $H_0$ dựa trên mức ý nghĩa $\\alpha$ và $p$-value.',
          formula: 'p\\text{-value} \\le \\alpha \\implies \\text{Bác bỏ } H_0',
        },
      ],
    },
    {
      id: 'regression-modelling',
      label: '5. Tương Quan & Hồi Quy',
      category: 'Hồi quy',
      description: 'Mô hình hóa mối liên hệ hàm số giữa biến độc lập X và biến phụ thuộc Y.',
      formula: 'Y = \\beta_0 + \\beta_1 X + \\epsilon',
      children: [
        {
          id: 'ols-estimation',
          label: 'Phương pháp Bình phương Cực tiểu (OLS)',
          category: 'Hồi quy',
          description: 'Tìm đường thẳng hồi quy tối thiểu hóa tổng bình phương phần dư $\\sum e_i^2$.',
          formula: '\\hat{\\beta}_1 = \\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum (x_i-\\bar{x})^2}',
        },
        {
          id: 'r-squared',
          label: 'Hệ số Xác định $R^2$',
          category: 'Hồi quy',
          description: 'Tỷ lệ biến thiên của Y được giải thích bởi mô hình hồi quy tuyến tính.',
          formula: 'R^2 = \\frac{SSR}{SST} = 1 - \\frac{SSE}{SST}',
        },
      ],
    },
  ],
};
