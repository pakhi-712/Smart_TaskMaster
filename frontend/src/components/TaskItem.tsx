import { useState } from "react";
import type { Task } from "../types/task";
import { addSubtask, toggleSubtask, deleteSubtask } from "../api/taskApi";

interface TaskItemProps {
  task: Task;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

function TaskItem({ task, onToggleStatus, onDelete, onEdit, onTaskUpdated }: TaskItemProps) {

  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isCompleted = task.status === "COMPLETED";
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedCount = task.subtasks?.filter(s => s.completed).length ?? 0;
  const totalCount = task.subtasks?.length ?? 0;

  const isOverdue = (() => {
    if (!task.dueDate || task.status !== "PENDING") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  })();

  function getPriorityColor(): string {
    switch (task.priority) {
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
      month: "short", day: "numeric", year: "numeric",
    });
  }

  async function handleAddSubtask() {
    if (!newSubtaskText.trim()) return;
    try {
      const updated = await addSubtask(task.id, newSubtaskText.trim());
      onTaskUpdated(updated);
      setNewSubtaskText("");
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  }

  async function handleToggleSubtask(subtaskId: number) {
    try {
      const updated = await toggleSubtask(task.id, subtaskId);
      onTaskUpdated(updated);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  }

  async function handleDeleteSubtask(subtaskId: number) {
    try {
      const updated = await deleteSubtask(task.id, subtaskId);
      onTaskUpdated(updated);
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  }

  function handleSubtaskKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
  }

  return (
    <div
      className={`task-item ${isCompleted ? "completed" : ""} ${isOverdue ? "overdue" : ""}`}
      style={{ borderLeftColor: getPriorityColor() }}
    >
      <div className="task-left">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={onToggleStatus}
        />

        <div className="task-info">
          <div className="task-title-row">
            <span className={`task-title ${isCompleted ? "strike" : ""}`}>
              {task.title}
            </span>
            {hasSubtasks && (
              <span className="subtask-count">
                {completedCount}/{totalCount}
              </span>
            )}
          </div>

          {task.description && (
            <span className="task-description">{task.description}</span>
          )}

          <div className="task-meta">
            {task.dueDate && (
              <span className={`task-due ${isOverdue ? "overdue-text" : ""}`}>
                {isOverdue ? "Overdue: " : "Due: "}
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.category && (
              <span className="task-category">{task.category}</span>
            )}
          </div>

          {/* Expandable subtask section */}
          {(hasSubtasks || !isCompleted) && (
            <button
              className="expand-subtasks"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "▾ Hide checklist" : "▸ Show checklist"}
              {hasSubtasks && !expanded && ` (${completedCount}/${totalCount})`}
            </button>
          )}

          {expanded && (
            <div className="subtask-list">
              {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="subtask-item">
                  <input
                    type="checkbox"
                    className="subtask-checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <span className={`subtask-text ${subtask.completed ? "strike" : ""}`}>
                    {subtask.text}
                  </span>
                  <button
                    className="subtask-delete"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add subtask input — only show if task is not completed */}
              {!isCompleted && (
                <div className="subtask-add">
                  {showSubtaskInput ? (
                    <div className="subtask-input-row">
                      <input
                        type="text"
                        placeholder="Add checklist item..."
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        onKeyDown={handleSubtaskKeyDown}
                        autoFocus
                      />
                      <button className="subtask-add-btn" onClick={handleAddSubtask}>Add</button>
                      <button className="subtask-cancel-btn" onClick={() => {
                        setShowSubtaskInput(false);
                        setNewSubtaskText("");
                      }}>✕</button>
                    </div>
                  ) : (
                    <button
                      className="subtask-add-trigger"
                      onClick={() => setShowSubtaskInput(true)}
                    >
                      + Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="task-right">
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        <div className="task-actions">
          <button className="action-btn edit-btn" onClick={onEdit}>✏️</button>
          <button className="action-btn delete-btn" onClick={onDelete}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;