"use client";

import { useEffect, useState } from "react";

type Anxiety = {
  id: string;
  text: string;
  createdAt: string;
  status: "open" | "in-progress" | "resolved";
  updates: string[];
  progress?: number;
};

export default function Home() {
  const [worry, setWorry] = useState("");
  const [logs, setLogs] = useState<Anxiety[]>([]);

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
        createdAt: new Date().toISOString(),
        status: "open",
        updates: [],
      };
      setLogs([newEntry, ...logs]);
      setWorry("");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--blue)' }}>
        Anxiety Crusher 🧘‍♀️
      </h1>
      <textarea
        value={worry}
        onChange={(e) => setWorry(e.target.value)}
        placeholder="What's bothering you today?"
        className="w-full max-w-md h-32 mb-4"
      />
      <button
        onClick={handleLog}
        className="modern-btn mb-8"
      >
        Log It
      </button>

      <div className="w-full max-w-md">
        {logs.length === 0 ? (
          <p className="text-gray-600 text-center">No worries logged yet.</p>
        ) : (
          logs.map((log) => (
            <a
              href={`/anxiety/${log.id}`}
              key={log.id}
              className="card cursor-pointer transition flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 mb-1 truncate">{log.text}</p>
                <p className="text-sm text-gray-500 truncate">
                  Logged on: {new Date(log.createdAt).toLocaleString()}
                </p>
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
              <span className={`status-tag status-${log.status.replace('in-progress', 'in-progress')}`}>{log.status.replace('open', 'Open').replace('in-progress', 'In Progress').replace('resolved', 'Resolved')}</span>
            </a>
          ))
        )}
      </div>
    </main>
  );
}
