"use client";

import { useEffect, useState } from "react";

type Anxiety = {
  id: string;
  text: string;
  description: string;
  createdAt: string;
  status: "thinking" | "acting" | "solved";
  updates: string[];
  progress?: number;
};

export default function Home() {
  const [worry, setWorry] = useState("");
  const [description, setDescription] = useState("");
  const [logs, setLogs] = useState<Anxiety[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"thinking" | "acting" | "solved">("thinking");
  const [showSummary, setShowSummary] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("anxietyLogs");
    if (stored) {
      setLogs(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem("anxietyLogs", JSON.stringify(logs));
  }, [logs]);

  const handleLog = () => {
    if (worry.trim() !== "") {
      const newEntry: Anxiety = {
        id: Date.now().toString(),
        text: worry.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        status: "thinking",
        updates: [],
      };
      setLogs([newEntry, ...logs]);
      setWorry("");
      setDescription("");
    }
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const startEdit = (log: Anxiety) => {
    setEditingId(log.id);
    setEditText(log.text);
    setEditDescription(log.description);
    setEditStatus(log.status);
  };

  const saveEdit = (id: string) => {
    setLogs(logs.map((log) =>
      log.id === id ? { ...log, text: editText, description: editDescription, status: editStatus } : log
    ));
    setEditingId(null);
  };

  // Group logs by status
  const grouped = {
    thinking: logs.filter((l) => l.status === "thinking"),
    acting: logs.filter((l) => l.status === "acting"),
    solved: logs.filter((l) => l.status === "solved"),
  };

  // Summary data
  const today = new Date().toISOString().slice(0, 10);
  const daily = logs.filter(l => l.createdAt.slice(0, 10) === today).length;
  const weekly = logs.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 7;
  }).length;
  const monthly = logs.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div className="flex w-full max-w-md justify-between items-center mb-4">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--blue)' }}>
          Anxiety Crusher 🧘‍♀️
        </h1>
        <button onClick={() => setShowSummary(true)} title="Summary" className="modern-btn px-3 py-1 ml-2" style={{ background: '#7A9B8E' }}>
          📊
        </button>
      </div>
      <textarea
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        placeholder="What's bothering you today?"
        className="w-full max-w-md h-16 mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        className="w-full max-w-md h-12 mb-4"
      />
      <button
        onClick={handleLog}
        className="modern-btn mb-8"
      >
        Log It
      </button>

      {(["thinking", "acting", "solved"] as const).map((status) => (
        <div key={status} className="w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold mb-2 capitalize" style={{ color: 'var(--blue)' }}>
            {status === "thinking" ? "Thinking" : status === "acting" ? "Acting" : "Solved"}
          </h2>
          {grouped[status].length === 0 ? (
            <p className="text-gray-400 text-center">No problems here.</p>
          ) : (
            grouped[status].map((log) => (
              <div key={log.id} className="card flex items-center gap-4 mb-2">
                {editingId === log.id ? (
                  <div className="flex-1 min-w-0">
                    <input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full mb-1 border rounded px-2 py-1"
                    />
                    <input
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="w-full mb-1 border rounded px-2 py-1"
                    />
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as "thinking" | "acting" | "solved")}
                      className="w-full mb-1 border rounded px-2 py-1"
                    >
                      <option value="thinking">Thinking</option>
                      <option value="acting">Acting</option>
                      <option value="solved">Solved</option>
                    </select>
                    <button onClick={() => saveEdit(log.id)} className="modern-btn px-3 py-1 mr-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="modern-btn px-3 py-1" style={{ background: '#E8DDD4', color: '#4A6FA5' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 mb-1 truncate font-semibold flex items-center">
                        {log.text}
                        <button onClick={() => startEdit(log)} className="ml-2 text-xs text-blue-500">✏️</button>
                      </p>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        {log.description || <span className="italic text-gray-300">No description</span>}
                        <button onClick={() => startEdit(log)} className="ml-2 text-xs text-blue-400">✏️</button>
                      </p>
                      <p className="text-xs text-gray-400">Logged on: {new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-center min-w-[56px]">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="#E8DDD4" />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#4A6FA5"
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - (log.progress ?? 0) / 100)}
                          strokeLinecap="round"
                        />
                        <text x="24" y="28" textAnchor="middle" fontSize="16" fill="#4A6FA5" fontWeight="bold">
                          {log.progress ?? 0}%
                        </text>
                      </svg>
                      <span className="text-xs text-[#7A9B8E] mt-1">Progress</span>
                    </div>
                    <button onClick={() => handleDelete(log.id)} className="ml-2 text-red-400 hover:text-red-600 text-xl">🗑️</button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      ))}

      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl max-w-sm w-full relative">
            <button onClick={() => setShowSummary(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--blue)' }}>
              Log Summary
            </h2>
            <div className="mb-2">Today: <span className="font-semibold">{daily}</span></div>
            <div className="mb-2">This week: <span className="font-semibold">{weekly}</span></div>
            <div className="mb-2">This month: <span className="font-semibold">{monthly}</span></div>
            <div className="mt-4">
              <h3 className="font-semibold mb-1">By Status</h3>
              <div>Thinking: {grouped.thinking.length}</div>
              <div>Acting: {grouped.acting.length}</div>
              <div>Solved: {grouped.solved.length}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
