import type {  } from "../types/task";

interface SidebarProps {
  activeView: string;
  onChangeView: (view: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function Sidebar({ activeView, onChangeView, stats, isOpen, onToggle }: SidebarProps) {

  const mainNavItems = [
    { label: "Dashboard", value: "dashboard", count: null },
    /*{ label: "Calendar", value: "calendar", count: null },*/
    { label: "All Tasks", value: "all", count: stats?.total ?? null },
    { label: "Pending", value: "pending", count: stats?.pending ?? null },
    { label: "Completed", value: "completed", count: stats?.completed ?? null },
  ];

  const priorityNavItems = [
    { label: "High Priority", value: "priority-high", color: "var(--priority-high)" },
    { label: "Medium Priority", value: "priority-medium", color: "var(--priority-medium)" },
    { label: "Low Priority", value: "priority-low", color: "var(--priority-low)" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h1 className="app-title">TaskMaster</h1>
        <button className="sidebar-close" onClick={onToggle}>✕</button>
		<button className="sidebar-open" onClick={onToggle}>✕</button>

      </div>

      <nav className="sidebar-nav">
        {mainNavItems.map((item) => (
          <button
            key={item.value}
            className={`nav-item ${activeView === item.value ? "active" : ""}`}
            onClick={() => onChangeView(item.value)}
          >
            <span className="nav-label">{item.label}</span>
            {item.count !== null && (
              <span className="nav-count">{item.count}</span>
            )}
          </button>
        ))}

        <div className="sidebar-section-label">By Priority</div>

        {priorityNavItems.map((item) => (
          <button
            key={item.value}
            className={`nav-item ${activeView === item.value ? "active" : ""}`}
            onClick={() => onChangeView(item.value)}
          >
            <span className="priority-dot" style={{ backgroundColor: item.color }}></span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <p className="sidebar-hint">Manage your tasks efficiently</p>
      </div>
    </aside>
  );
}
export default Sidebar;