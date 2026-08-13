import { useState, useEffect } from "react";
import type { Task } from "../types/task";
import { getAllTasks } from "../api/taskApi";
import { getDailyBriefing } from "../api/aiApi";

const DAILY_LIMIT = 10;

function Dashboard() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [briefing, setBriefing] = useState<string>("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [wasCached, setWasCached] = useState(false);
  const [usesLeft, setUsesLeft] = useState(DAILY_LIMIT);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  
  useEffect(() => {
    loadTasks();
    loadDailyUsage();
  }, []);
  
  // Auto-generate briefing on first load (only once per session)
    useEffect(() => {
      if (!hasAutoRun && tasks.length > 0) {
        setHasAutoRun(true);
        handleGetBriefing();
      }
    }, [tasks]);

  async function loadTasks() {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
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
      if (parsed.date === today) count = parsed.count;
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
      if(!result.cached)
		incrementUsage();
    } catch (err) {
      setBriefing("Could not generate briefing. Please try again.");
    } finally {
      setBriefingLoading(false);
    }
  }


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingTasks = tasks.filter(t => t.status === "PENDING");

  // Needs Attention: overdue OR due today
  const needsAttention = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  });

  // In Progress: has subtasks with at least one completed (partial progress)
  // AND not already in needsAttention
  const needsAttentionIds = new Set(needsAttention.map(t => t.id));
  const inProgress = pendingTasks.filter(t => {
    if (needsAttentionIds.has(t.id)) return false;
    if (!t.subtasks || t.subtasks.length === 0) return false;
    const completedCount = t.subtasks.filter(s => s.completed).length;
    return completedCount > 0 && completedCount < t.subtasks.length;
  });

  // Upcoming: everything else pending
  const inProgressIds = new Set(inProgress.map(t => t.id));
  const upcoming = pendingTasks.filter(t =>
    !needsAttentionIds.has(t.id) && !inProgressIds.has(t.id)
  );

  // ---- Progress calculation ----
  function getProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    return Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100);
  }

  function getTag(task: Task): string {
    if (!task.dueDate) return "";
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "Overdue";
    if (due.getTime() === today.getTime()) return "Today";
    return "";
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case "HIGH": return "var(--priority-high)";
      case "MEDIUM": return "var(--priority-medium)";
      case "LOW": return "var(--priority-low)";
      default: return "var(--border)";
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
  }

  // ---- Render a single task card in a column ----
  function renderTaskCard(task: Task) {
    const progress = getProgress(task);
    const tag = getTag(task);
    const hasChecklist = task.subtasks && task.subtasks.length > 0;

    return (
      <div
        key={task.id}
        className="dash-task-card"
        style={{ borderLeftColor: getPriorityColor(task.priority) }}
      >
        <div className="dash-task-header">
          <span className="dash-task-title">{task.title}</span>
          {tag && (
            <span className={`dash-task-tag ${tag.toLowerCase()}`}>
              {tag}
            </span>
          )}
        </div>

        {task.dueDate && (
          <span className="dash-task-due">Due {formatDate(task.dueDate)}</span>
        )}

        {hasChecklist && (
          <div className="dash-progress-section">
            <div className="dash-progress-bar">
              <div
                className="dash-progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="dash-progress-text">
              {task.subtasks!.filter(s => s.completed).length}/{task.subtasks!.length} items
            </span>
          </div>
        )}

        {!hasChecklist && (
          <span className="dash-progress-text">No checklist</span>
        )}
      </div>
    );
  }

  // ---- Render a column ----
  function renderColumn(
    title: string,
    icon: string,
    colorClass: string,
    taskList: Task[]
  ) {
    return (
      <div className="dash-column">
        <div className={`dash-column-header ${colorClass}`}>
          <span>{icon} {title}</span>
          <span className="dash-column-count">{taskList.length}</span>
        </div>
        <div className="dash-column-body">
          {taskList.length === 0 ? (
            <p className="dash-column-empty">Nothing here</p>
          ) : (
            taskList.map(task => renderTaskCard(task))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-v2">

      {/* Three category columns */}
      <div className="dash-columns">
        {renderColumn("Needs Attention", "⚠", "col-danger", needsAttention)}
        {renderColumn("In Progress", "◐", "col-warning", inProgress)}
        {renderColumn("Upcoming", "◌", "col-info", upcoming)}
      </div>

      {/* Daily Briefing */}
      <div className="briefing-section">
        <div className="briefing-header">
          <h2>So, how we doin'?</h2>
          <div className="briefing-controls">
            <span className="briefing-uses" title={`${usesLeft} uses remaining today`}>
              {usesLeft}/{DAILY_LIMIT} left
            </span>
            <button
              className="briefing-button"
              onClick={handleGetBriefing}
              disabled={briefingLoading || usesLeft <= 0}
            >
              {briefingLoading ? "Generating..." : usesLeft <= 0 ? "Limit Reached" : "Read My Day"}
            </button>
          </div>
        </div>

        {briefing && (
          <div className="briefing-content">
            {wasCached && <span className="cached-badge">Cached</span>}
            <p>{briefing}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;