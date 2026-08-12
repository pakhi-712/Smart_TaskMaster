import { useState, useEffect } from "react";
import type { DashboardStats } from "../types/task";
import { getDailyBriefing } from "../api/aiApi";
import { getActivityData } from "../api/taskApi";

interface DashboardProps {
  stats: DashboardStats | null;
}

const DAILY_LIMIT = 5;

function Dashboard({ stats }: DashboardProps) {

  const [briefing, setBriefing] = useState<string>("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [wasCached, setWasCached] = useState(false);
  const [usesLeft, setUsesLeft] = useState(DAILY_LIMIT);
  const [activityData, setActivityData] = useState<Record<string, number>>({});

  // Load activity data and daily usage count on mount
  useEffect(() => {
    loadActivity();
    loadDailyUsage();
  }, []);

  async function loadActivity() {
    try {
      const data = await getActivityData();
      setActivityData(data);
    } catch (err) {
      console.error("Failed to load activity:", err);
    }
  }

  function loadDailyUsage() {
    const stored = localStorage.getItem("briefingUsage");
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = new Date().toDateString();
      if (parsed.date === today) {
        setUsesLeft(DAILY_LIMIT - parsed.count);
      } else {
        // New day — reset
        localStorage.setItem("briefingUsage", JSON.stringify({ date: today, count: 0 }));
        setUsesLeft(DAILY_LIMIT);
      }
    } else {
      localStorage.setItem("briefingUsage",
        JSON.stringify({ date: new Date().toDateString(), count: 0 }));
    }
  }

  function incrementUsage() {
    const stored = localStorage.getItem("briefingUsage");
    const today = new Date().toDateString();
    let count = 0;

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        count = parsed.count;
      }
    }

    count++;
    localStorage.setItem("briefingUsage", JSON.stringify({ date: today, count }));
    setUsesLeft(DAILY_LIMIT - count);
  }

  async function handleGetBriefing() {
    if (usesLeft <= 0) return;

    setBriefingLoading(true);
    setBriefing("");
    setWasCached(false);

    try {
      const result = await getDailyBriefing();
      setBriefing(result.briefing);
      setWasCached(result.cached);
      incrementUsage();
    } catch (err) {
      setBriefing("Could not generate briefing. Please try again.");
    } finally {
      setBriefingLoading(false);
    }
  }

  // ---- Heatmap logic ----
  function buildHeatmapCells() {
    const cells = [];
    const today = new Date();

    // Build 364 days (52 weeks) going backwards from today
    for (let i = 363; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0]; // "2026-08-09"
      const count = activityData[dateStr] || 0;

      let level = "empty";
      if (count === 1) level = "level-1";
      else if (count === 2 || count === 3) level = "level-2";
      else if (count >= 4) level = "level-3";

      cells.push(
        <div
          key={dateStr}
          className={`heatmap-cell ${level}`}
          title={`${dateStr}: ${count} task${count !== 1 ? "s" : ""} completed`}
        />
      );
    }
    return cells;
  }

  if (!stats) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const statCards = [
    { label: "Total Tasks", value: stats.total, color: "blue" },
    { label: "Pending", value: stats.pending, color: "orange" },
    { label: "Completed", value: stats.completed, color: "green" },
    { label: "High Priority", value: stats.highPriority, color: "red" },
    { label: "Overdue", value: stats.overdue, color: "purple" },
  ];

  return (
    <div className="dashboard">

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-${card.color}`}>
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </div>
        ))}
      </div>

      {/* AI Daily Briefing */}
      <div className="briefing-section">
        <div className="briefing-header">
          <h3>Daily Briefing</h3>
          <div className="briefing-controls">
            <span
              className="briefing-uses"
              title={`${usesLeft} uses remaining today`}
            >
              {usesLeft}/{DAILY_LIMIT} left
            </span>
            <button
              className="briefing-button"
              onClick={handleGetBriefing}
              disabled={briefingLoading || usesLeft <= 0}
              title={usesLeft <= 0 ? "Daily limit reached. Resets tomorrow." : ""}
            >
              {briefingLoading ? "Generating..." : usesLeft <= 0 ? "Limit Reached" : "Read My Day"}
            </button>
          </div>
        </div>

        {briefing && (
          <div className="briefing-content">
            {wasCached && <span className="cached-badge">⚡ Cached</span>}
            <p>{briefing}</p>
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="heatmap-section">
        <h3>Activity Streak</h3>
        <div className="heatmap-grid">
          {buildHeatmapCells()}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-cell empty"></div>
          <div className="heatmap-cell level-1"></div>
          <div className="heatmap-cell level-2"></div>
          <div className="heatmap-cell level-3"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;