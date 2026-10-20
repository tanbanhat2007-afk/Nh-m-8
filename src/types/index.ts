export type TabType =
  | 'pipeline'
  | 'multimodal'
  | 'voice-canvas'
  | 'essay'
  | 'mcq'
  | 'oral-exam'
  | 'error-analytics'
  | 'mindmap'
  | 'forum'
  | 'profile';

export interface TopicLesson {
  id: string;
  title: string;
  category: 'Xác suất cơ bản' | 'Biến ngẫu nhiên' | 'Phân phối xác suất' | 'Ước lượng' | 'Kiểm định' | 'Hồi quy';
  summary: string;
  // 4 steps
  step1Concept: {
    intuitiveExplanation: string;
    keyAnalogy: string;
    realWorldApplication: string;
  };
  step2Theory: {
    theoremName: string;
    latexFormula: string;
    parameterDescriptions: { symbol: string; meaning: string }[];
    conditions: string[];
  };
  step3Example: {
    problemStatement: string;
    interactiveDiagramType: 'normal_curve' | 'binomial_bars' | 'bayes_tree' | 'hypothesis_test';
    solutionWalkthrough: string[];
  };
  step4Practice: {
    problem: string;
    clue: string;
    expectedAnswerSnippet: string;
  };
}

export interface RubricCriterion {
  name: string;
  maxScore: number;
  earnedScore?: number;
  comment: string;
}

export interface MultimodalEvaluation {
  id: string;
  timestamp: string;
  problemTitle: string;
  studentNotes?: string;
  canvasImage?: string;
  rubric: RubricCriterion[];
  overallRating: 'Cần cải thiện' | 'Đang đi đúng hướng' | 'Rất tốt';
  hintsAndStrategy: string[];
  ipadWhiteboardSuggestion?: string;
}

export interface EssayExercise {
  id: number;
  title: string;
  statement: string;
  difficulty: 'Cơ bản' | 'Vận dụng' | 'Nâng cao';
  strategySteps: string[];
  userDraft?: string;
}

export interface McqQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  whyExplanation: string;
  commonTrap: string;
  userSelectedIndex?: number;
  isAnswered?: boolean;
}

export interface OralSession {
  id: string;
  topic: string;
  question: string;
  studentAnswer: string;
  score: number;
  feedback: string;
  knowledgeGaps: string[];
  rootMisconception: string;
  remedialAdvice: string;
  followUpQuestion?: string;
  timestamp: string;
}

export interface ErrorLogItem {
  id: string;
  source: 'Vấn đáp lý thuyết' | 'Trắc nghiệm' | 'Tự luận';
  topic: string;
  questionSummary: string;
  errorClassification:
    | 'Nhầm lẫn 1 phía và 2 phía'
    | 'Quên chuẩn hóa biến ngẫu nhiên'
    | 'Sai công thức Bayes / Nghịch lý điều kiện'
    | 'Nhầm phân phối Nhị thức & Poisson'
    | 'Nhầm lẫn độ lệch chuẩn và sai số chuẩn'
    | 'Sai miền bác bỏ giả thiết';
  studentMisstep: string;
  remedyAction: string;
  resolved: boolean;
  timestamp: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  description: string;
  formula?: string;
  category: string;
  children?: MindmapNode[];
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  tags: string[];
  aiStarterGuidance?: string;
  likes: number;
  repliesCount: number;
  createdAt: string;
  replies: {
    id: string;
    author: string;
    avatar: string;
    isAi?: boolean;
    content: string;
    createdAt: string;
  }[];
}

export interface UserSkillMatrix {
  pillar: string;
  score: number; // 0 - 100
  status: 'Yếu' | 'Trung bình' | 'Tốt' | 'Xuất sắc';
  recommendedTopic: string;
}
