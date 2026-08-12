import { useState } from "react";
import type { Task } from "../types/task";

interface CalendarProps {
  tasks: Task[];
}

function Calendar({ tasks }: CalendarProps) {

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // What day of the week does the 1st of this month fall on?
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // How many days in this month?
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Navigate months
  function goToPreviousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  // Get tasks for a specific day
  function tasksForDay(day: number): Task[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  }

  // Get priority color
  function getPriorityBg(priority: string): string {
    switch (priority) {
      case "HIGH": return "rgba(231, 76, 60, 0.15)";
      case "MEDIUM": return "rgba(243, 156, 18, 0.15)";
      case "LOW": return "rgba(52, 152, 219, 0.15)";
      default: return "transparent";
    }
  }

  function getPriorityBorder(priority: string): string {
    switch (priority) {
      case "HIGH": return "var(--priority-high)";
      case "MEDIUM": return "var(--priority-medium)";
      case "LOW": return "var(--priority-low)";
      default: return "var(--border)";
    }
  }

  // Is this day today?
  function isToday(day: number): boolean {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  }

  // Build calendar grid cells
  function renderCells() {
    const cells = [];

    // Empty cells before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty-cell"></div>);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = tasksForDay(day);

      cells.push(
        <div
          key={day}
          className={`calendar-cell ${isToday(day) ? "today" : ""}`}
        >
          <span className="calendar-day-number">{day}</span>
          <div className="calendar-tasks">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={`calendar-task-pill ${task.status === "COMPLETED" ? "completed" : ""}`}
                style={{
                  backgroundColor: getPriorityBg(task.priority),
                  borderLeft: `3px solid ${getPriorityBorder(task.priority)}`,
                }}
                title={`${task.title} [${task.priority}] - ${task.status}`}
              >
                {task.status === "COMPLETED" ? "✓ " : ""}
                {task.title.length > 12 ? task.title.substring(0, 12) + "…" : task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <span className="calendar-more">+{dayTasks.length - 3} more</span>
            )}
          </div>
        </div>
      );
    }

    return cells;
  }

  return (
    <div className="calendar-widget">
      {/* Month navigation */}
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>◄</button>
        <h3 className="calendar-month-title">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>►</button>
      </div>

      {/* Day name headers */}
      <div className="calendar-grid">
        {dayNames.map((name) => (
          <div key={name} className="calendar-day-header">{name}</div>
        ))}

        {/* Calendar cells */}
        {renderCells()}
      </div>
    </div>
  );
}
export default Calendar;