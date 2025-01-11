import React, { useState, useEffect } from 'react';
import './TasklistMid.css';
import plus from '../../assets/plusIcon.png';
import nextArrow from '../../assets/next.png';
import TasklistRight from '../TasklistRight/TasklistRight';

const TasklistMid = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // State for the selected task

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/tasks');
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="task-container" style={{ display: 'flex' }}>
      <div className={`side-mid ${isOpen ? 'open' : 'closed'}`}>
        {isOpen ? (
          <>
            <div className="sidemid-header">
              <p>Created</p>
              <img
                src={nextArrow}
                alt="Expand"
                style={{
                  cursor: 'pointer',
                  width: '15px',
                  transform: 'rotate(90deg)',
                }}
              />
              <img
                src={plus}
                alt="Add"
                style={{
                  cursor: 'pointer',
                  width: '15px',
                  marginLeft: '10px',
                }}
              />
              <img
                src={nextArrow}
                alt="Toggle"
                onClick={toggleDropdown}
                style={{
                  cursor: 'pointer',
                  width: '15px',
                  transform: 'rotate(180deg)',
                  marginLeft: 'auto',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
            <div className="gettasklist">
              {loading && <p>Loading tasks...</p>}
              {error && <p>Error: {error}</p>}
              {!loading && !error && (
                <ul>
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      onClick={() => setSelectedTask(task)} // Set selected task on click
                      style={{ cursor: 'pointer' }}
                    >
                      <strong>{task.name || 'Unnamed Task'}</strong>
                      <p>{task.key || 'Unassigned'}</p>
                      <p>Created: {new Date(task.created).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <img
            src={nextArrow}
            alt="Toggle"
            onClick={toggleDropdown}
            style={{
              cursor: 'pointer',
              width: '20px',
              marginLeft: 'auto',
              transition: 'transform 0.3s ease',
            }}
          />
        )}
      </div>
      <TasklistRight selectedTask={selectedTask} />
    </div>
  );
};

export default TasklistMid;
