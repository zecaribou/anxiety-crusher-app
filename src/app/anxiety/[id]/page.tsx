"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Step {
  id: string;
  text: string;
  done: boolean;
}

interface Idea {
  id: string;
  title: string;
  steps: Step[];
}

interface Anxiety {
  id: string;
  text: string;
  createdAt: string;
  status: "open" | "in-progress" | "resolved";
  updates: string[];
  ideas?: Idea[];
  progress?: number; // 0-100, user-defined
}

export default function AnxietyDetailPage() {
  const { id } = useParams();
  const [log, setLog] = useState<Anxiety | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [newStep, setNewStep] = useState<{ [ideaId: string]: string }>({});
  const [progressValue, setProgressValue] = useState<number>(log?.progress ?? 0);
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("anxietyLogs") || "[]");
    const foundLog = savedLogs.find((log: Anxiety) => log.id === id);
    setLog(foundLog);
  }, [id]);

  useEffect(() => {
    setProgressValue(log?.progress ?? 0);
    setShowSave(false);
  }, [log?.progress]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressValue(Number(e.target.value));
    setShowSave(true);
  };

  const addUpdate = () => {
    if (!log || newUpdate.trim() === "") return;

    const updatedLog: Anxiety = {
      ...log,
      updates: [...(log.updates || []), newUpdate],
    };

    const allLogs = JSON.parse(localStorage.getItem("anxietyLogs") || "[]");
    const updatedLogs = allLogs.map((l: Anxiety) =>
      l.id === log.id ? updatedLog : l
    );
    localStorage.setItem("anxietyLogs", JSON.stringify(updatedLogs));
    setLog(updatedLog);
    setNewUpdate("");
  };

  // Helper to update log in localStorage
  const updateLog = (updatedLog: Anxiety) => {
    const allLogs = JSON.parse(localStorage.getItem("anxietyLogs") || "[]");
    const updatedLogs = allLogs.map((l: Anxiety) => (l.id === updatedLog.id ? updatedLog : l));
    localStorage.setItem("anxietyLogs", JSON.stringify(updatedLogs));
    setLog(updatedLog);
  };

  // Add a new idea
  const addIdea = () => {
    if (!log || !newIdea.trim()) return;
    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea.trim(),
      steps: [],
    };
    const updatedLog: Anxiety = {
      ...log,
      ideas: log.ideas ? [idea, ...log.ideas] : [idea],
    };
    updateLog(updatedLog);
    setNewIdea("");
  };

  // Add a step to an idea
  const addStep = (ideaId: string) => {
    if (!log || !newStep[ideaId]?.trim()) return;
    const step: Step = {
      id: Date.now().toString(),
      text: newStep[ideaId],
      done: false,
    };
    const updatedLog: Anxiety = {
      ...log,
      ideas: log.ideas?.map((idea) =>
        idea.id === ideaId ? { ...idea, steps: [...idea.steps, step] } : idea
      ),
    };
    updateLog(updatedLog);
    setNewStep((prev) => ({ ...prev, [ideaId]: "" }));
  };

  // Toggle step completion
  const toggleStep = (ideaId: string, stepId: string) => {
    if (!log) return;
    const updatedLog: Anxiety = {
      ...log,
      ideas: log.ideas?.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              steps: idea.steps.map((step) =>
                step.id === stepId ? { ...step, done: !step.done } : step
              ),
            }
          : idea
      ),
    };
    updateLog(updatedLog);
  };

  // Calculate progress percentage based on updates
  const updateCount = log?.updates.length || 0;
  const maxUpdates = 5; // You can adjust this number as needed
  const progress = Math.min(100, Math.round((updateCount / maxUpdates) * 100));

  // Save user-defined progress
  const saveProgress = () => {
    if (!log) return;
    const updatedLog: Anxiety = { ...log, progress: progressValue };
    updateLog(updatedLog);
    setShowSave(false);
  };

  if (!log) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--blue)' }}>Anxiety Detail</h1>
        <p className="mb-2">{log.text}</p>
        <p className="text-sm text-gray-500 mb-2">
          Created on: {new Date(log.createdAt).toLocaleString()}
        </p>
        <span className={`status-tag status-${log.status.replace('in-progress', 'in-progress')}`}>{log.status.replace('open', 'Open').replace('in-progress', 'In Progress').replace('resolved', 'Resolved')}</span>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#4A6FA5]">Progress</span>
            <span className="text-sm font-semibold text-[#7A9B8E]">{progressValue}%</span>
          </div>
          <div className="w-full bg-[#E8DDD4] rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full"
              style={{ width: `${progressValue}%`, background: '#4A6FA5', transition: 'width 0.3s' }}
            ></div>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={0}
              max={100}
              value={progressValue}
              onChange={handleSliderChange}
              className="flex-1 accent-[#4A6FA5]"
            />
            {showSave && (
              <button
                onClick={saveProgress}
                className="modern-btn px-4 py-1 text-sm"
                style={{ background: '#7A9B8E' }}
              >
                Save
              </button>
            )}
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Updates</h2>
        <ul className="list-disc list-inside mb-4">
          {log.updates.map((update, index) => (
            <li key={index}>{update}</li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add progress update..."
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          className="w-full mb-2"
        />
        <button
          onClick={addUpdate}
          className="modern-btn"
        >
          Add Update
        </button>
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#4A6FA5' }}>What can I do?</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add an idea (e.g. Try a new approach)"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            className="flex-1 border border-[#C5D5C5] rounded px-3 py-2 focus:border-[#4A6FA5]"
            style={{ background: '#E8DDD4' }}
          />
          <button
            onClick={addIdea}
            className="modern-btn"
            style={{ background: '#4A6FA5' }}
          >
            Add Idea
          </button>
        </div>
        {log.ideas && log.ideas.length > 0 ? (
          <div className="space-y-4">
            {log.ideas.map((idea) => (
              <div key={idea.id} className="rounded-xl border border-[#C5D5C5] bg-[#B8D4E3] p-4 shadow-sm">
                <div className="font-semibold text-[#4A6FA5] mb-2">{idea.title}</div>
                <ul className="mb-2">
                  {idea.steps.map((step) => (
                    <li key={step.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={step.done}
                        onChange={() => toggleStep(idea.id, step.id)}
                        className="accent-[#7A9B8E] w-4 h-4 rounded"
                      />
                      <span className={step.done ? 'line-through text-gray-500' : ''}>{step.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a step..."
                    value={newStep[idea.id] || ''}
                    onChange={(e) => setNewStep((prev) => ({ ...prev, [idea.id]: e.target.value }))}
                    className="flex-1 border border-[#C5D5C5] rounded px-2 py-1 focus:border-[#4A6FA5]"
                    style={{ background: '#E8DDD4' }}
                  />
                  <button
                    onClick={() => addStep(idea.id)}
                    className="modern-btn px-3 py-1 text-sm"
                    style={{ background: '#7A9B8E' }}
                  >
                    Add Step
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No ideas yet. Brainstorm your first one!</p>
        )}
      </div>
    </div>
  );
}
