import type { Task } from "../types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

function TaskList({ tasks, loading, onToggleStatus, onDelete, onEdit, onTaskUpdated }: TaskListProps) {

  if (loading) {
    return <div className="task-list-message">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p className="empty-icon">📋</p>
        <p className="empty-text">No tasks here yet</p>
        <p className="empty-hint">Click the + button to add your first task</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={() => onToggleStatus(task.id)}
          onDelete={() => onDelete(task.id)}
          onEdit={() => onEdit(task)}
          onTaskUpdated={onTaskUpdated}
        />
      ))}
    </div>
  );
}

export default TaskList;