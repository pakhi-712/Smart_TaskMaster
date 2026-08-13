import { useState, useEffect } from "react";
import type { Task } from "../types/task";
import { getAllTasks, toggleTaskStatus, deleteTask } from "../api/taskApi";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import FilterBar from "./FilterBar";

interface LayoutProps {
  userName: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

type ActiveView = "dashboard" | "calendar" | "all" | "pending" | "completed"
  | "priority-high" | "priority-medium" | "priority-low";

function Layout({ userName, darkMode, onToggleDarkMode, onLogout }: LayoutProps) {

  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // unfiltered, for calendar
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadTasks();
    loadAllTasks();
  }, [activeView, searchKeyword]);

  async function loadAllTasks() {
    try {
      const data = await getAllTasks();
      setAllTasks(data);
    } catch (err) {
      console.error("Failed to load all tasks:", err);
    }
  }

  async function loadTasks() {
    setLoading(true);
    try {
      let status: string | undefined;
      let priority: string | undefined;
      let keyword: string | undefined;

      if (activeView === "pending") status = "PENDING";
      if (activeView === "completed") status = "COMPLETED";
      if (activeView === "priority-high") priority = "HIGH";
      if (activeView === "priority-medium") priority = "MEDIUM";
      if (activeView === "priority-low") priority = "LOW";
      if (searchKeyword) keyword = searchKeyword;

      const data = await getAllTasks(status, priority, keyword);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  function sortedTasks(): Task[] {
    const sorted = [...tasks];
    switch (sortOption) {
      case "newest":
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return sorted.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "priority": {
        const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return sorted.sort((a, b) => order[a.priority] - order[b.priority]);
      }
      case "due-date":
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      default:
        return sorted;
    }
  }

  async function handleToggleStatus(taskId: number) {
    try {
      await toggleTaskStatus(taskId);
      loadTasks();
      loadStats();
      loadAllTasks();
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  }

  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      loadTasks();
      loadStats();
      loadAllTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setAllTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    loadStats();
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleAddTask() {
    setEditingTask(null);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
    loadStats();
    loadAllTasks();
  }

  function getPageTitle(): string {
    switch (activeView) {
      case "dashboard": return "Dashboard";
      case "all": return "All Tasks";
      case "pending": return "Pending Tasks";
      case "completed": return "Completed Tasks";
      case "priority-high": return "High Priority";
      case "priority-medium": return "Medium Priority";
      case "priority-low": return "Low Priority";
      default: return "Tasks";
    }
  }

  function renderContent() {
    if (activeView === "dashboard") {
      return <Dashboard />;
    }


    // Task list views
    return (
      <>
        <FilterBar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
        <TaskList
          tasks={sortedTasks()}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onTaskUpdated={handleTaskUpdated}
        />
      </>
    );
  }

  return (
    <div className="layout">
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`main-content ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h2 className="page-title">{getPageTitle()}</h2>
          <div className="top-bar-actions">
            <span className="user-greeting">Hi, {userName}</span>
            <label className="theme-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={onToggleDarkMode}
              />
              <span className="theme-switch-track">
                <span className="theme-switch-thumb">
                  <i className={darkMode ? "ti ti-moon" : "ti ti-sun"}></i>
                </span>
              </span>
            </label>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>

        <button
          className="fab"
          onClick={() => {
            setActiveView("all");
            handleAddTask();
          }}
        >
          <i className="ti ti-plus"></i>
        </button>

        {showForm && (
          <TaskForm
            task={editingTask}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Layout;