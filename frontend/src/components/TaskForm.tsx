import { useState } from "react";
import type { Task, TaskCreateRequest } from "../types/task";
import { createTask, updateTask } from "../api/taskApi";

interface TaskFormProps {
  task: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {

  const isEditing = task !== null;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "");
  const [category, setCategory] = useState(task?.category || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");

  // Subtask inputs (only for new tasks — existing tasks add via TaskItem)
  const [subtaskInputs, setSubtaskInputs] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addSubtaskInput() {
    setSubtaskInputs([...subtaskInputs, ""]);
  }

  function updateSubtaskInput(index: number, value: string) {
    const updated = [...subtaskInputs];
    updated[index] = value;
    setSubtaskInputs(updated);
  }

  function removeSubtaskInput(index: number) {
    setSubtaskInputs(subtaskInputs.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    const requestData: TaskCreateRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority ? (priority as "LOW" | "MEDIUM" | "HIGH") : undefined,
      category: category.trim() || undefined,
      dueDate: dueDate || undefined,
      subtasks: subtaskInputs.filter(s => s.trim() !== ""),
    };

    try {
      if (isEditing && task) {
        await updateTask(task.id, requestData);
      } else {
        await createTask(requestData);
      }
      onSuccess();
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Failed to save task");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <h2>{isEditing ? "Edit Task" : "Add New Task"}</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Add details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority		  
			{isEditing && (
		        <span className="priority-hint"> — select "Auto" to let AI re-evaluate</span>
		      )}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
			  <option value="">Auto</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              placeholder="e.g. Work, Personal"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Subtask / Checklist section — only show when creating new task */}
        {!isEditing && (
          <div className="form-group">
            <label>Checklist Items</label>
            {subtaskInputs.map((text, index) => (
              <div key={index} className="subtask-form-row">
                <input
                  type="text"
                  placeholder={`Item ${index + 1}`}
                  value={text}
                  onChange={(e) => updateSubtaskInput(index, e.target.value)}
                />
                <button
                  type="button"
                  className="subtask-form-remove"
                  onClick={() => removeSubtaskInput(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="subtask-form-add"
              onClick={addSubtaskInput}
            >
              + Add checklist item
            </button>
          </div>
        )}

        <div className="form-actions">
          <button className="cancel-button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Task" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;