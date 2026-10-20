import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StepPipelineTab from './components/tabs/StepPipelineTab';
import MultimodalTutorTab from './components/tabs/MultimodalTutorTab';
import VoiceCanvasStudioTab from './components/tabs/VoiceCanvasStudioTab';
import EssayGeneratorTab from './components/tabs/EssayGeneratorTab';
import McqQuizTab from './components/tabs/McqQuizTab';
import OralExamTab from './components/tabs/OralExamTab';
import ErrorAnalyticsTab from './components/tabs/ErrorAnalyticsTab';
import MindmapTab from './components/tabs/MindmapTab';
import CommunityForumTab from './components/tabs/CommunityForumTab';
import LearningProfileTab from './components/tabs/LearningProfileTab';
import VoiceAssistantWidget from './components/VoiceAssistantWidget';
import { TabType, ErrorLogItem } from './types';
import { initialErrorLogs } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pipeline');
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(initialErrorLogs);
  const [voiceDrawTrigger, setVoiceDrawTrigger] = useState<any>(null);

  const handleRecordError = (newError: ErrorLogItem) => {
    setErrorLogs((prev) => [newError, ...prev]);
  };

  const handleToggleResolveError = (id: string) => {
    setErrorLogs((prev) =>
      prev.map((e) => (e.id === id ? { ...e, resolved: !e.resolved } : e))
    );
  };

  const handleVoiceDrawCommand = (diagramType: any) => {
    setVoiceDrawTrigger(diagramType);
    // Switch to Voice-Canvas Studio tab so student immediately sees the AI drawing
    setActiveTab('voice-canvas');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        errorCount={errorLogs.filter((e) => !e.resolved).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'pipeline' && <StepPipelineTab />}

        {activeTab === 'multimodal' && <MultimodalTutorTab />}

        {activeTab === 'voice-canvas' && <VoiceCanvasStudioTab />}

        {activeTab === 'essay' && <EssayGeneratorTab />}

        {activeTab === 'mcq' && <McqQuizTab onRecordError={handleRecordError} />}

        {activeTab === 'oral-exam' && <OralExamTab onRecordError={handleRecordError} />}

        {activeTab === 'error-analytics' && (
          <ErrorAnalyticsTab
            errorLogs={errorLogs}
            onToggleResolve={handleToggleResolveError}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {activeTab === 'mindmap' && (
          <MindmapTab
            onOpenPracticeTopic={() => {
              setActiveTab('mcq');
            }}
          />
        )}

        {activeTab === 'forum' && <CommunityForumTab />}

        {activeTab === 'profile' && (
          <LearningProfileTab
            onStartRemedialExercise={() => {
              setActiveTab('essay');
            }}
          />
        )}
      </main>

      {/* Floating 2-way Voice AI Chatbot Widget */}
      <VoiceAssistantWidget
        onAiDrawCommand={handleVoiceDrawCommand}
        onNavigateTab={(tab) => setActiveTab(tab as TabType)}
        currentTopic="Xác suất Thống kê Đại cương"
      />

      {/* Subtle modern footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>ProbStat AI © 2026 — Nền tảng Học tập & Luyện thi Xác suất Thống kê Tích hợp Trợ lý Trí Tuệ Nhân Tạo</p>
      </footer>
    </div>
  );
}
