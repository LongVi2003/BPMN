import React, { useState, useEffect } from 'react';
import './TasklistRight.css';
import nextArrow from '../../assets/next.png';
import maximize from '../../assets/maximize.png';
import user from '../../assets/user.png';

const TasklistRight = ({ selectedTask }) => {
  const [activeTab, setActiveTab] = useState('forms');
  const [formVariables, setFormVariables] = useState(null);
  const [claimBy, setClaimBy] = useState(null);

  // Fetch form data when tab or selectedTask changes
  useEffect(() => {
    if (activeTab === 'forms' && selectedTask?.id) {
      const fetchFormData = async () => {
        try {
          const formResponse = await fetch(
            `http://localhost:8080/engine-rest/task/${selectedTask.id}/form`
          );

          if (!formResponse.ok) {
            throw new Error('Failed to fetch form information');
          }

          const formInfo = await formResponse.json();

          // Check if form has a key and fetch form variables
          if (formInfo?.key) {
            try {
              const variablesResponse = await fetch(
                `http://localhost:8080/engine-rest/task/${selectedTask.id}/form-variables`
              );

              if (!variablesResponse.ok) {
                throw new Error('Failed to fetch form variables');
              }

              const formVariablesData = await variablesResponse.json();
              setFormVariables({ type: 'variables', content: formVariablesData });
            } catch (error) {
              console.error('Error fetching form variables:', error.message);
              alert('Failed to fetch form data.');
            }
          }
        } catch (error) {
          console.error(`Error fetching form for task ${selectedTask.id}:`, error.message);
          setFormVariables(null);
        }
      };

      fetchFormData();
    }
  }, [activeTab, selectedTask]);

  // Handle form variable changes
  const handleInputChange = (key, value) => {
    setFormVariables((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: {
          ...prev.content[key],
          value,
        },
      },
    }));
  };

  // Claim task
  const handleClaimTask = async () => {
    if (!selectedTask?.id) {
      alert('No task selected to claim');
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/engine-rest/task/${selectedTask.id}/claim`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'demo' }),
        }
      );

      if (response.ok) {
        setClaimBy('demo');
      } else {
        const errorData = await response.json();
        alert(`Error claiming task: ${errorData.errorMsg}`);
      }
    } catch (e) {
      console.error('Error claiming task:', e);
      alert('Failed to claim task. Please try again.');
    }
  };

  // Complete task
  const handleCompleteTask = async () => {
    if (!selectedTask?.id) {
      alert('No task selected to complete');
      return;
    }

    try {
      const variables =
        formVariables?.type === 'variables' ? formVariables.content : {};

      const response = await fetch(
        `http://localhost:8080/engine-rest/task/${selectedTask.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variables: Object.fromEntries(
              Object.entries(variables).map(([key, variable]) => [
                key,
                { value: variable.value },
              ])
            ),
          }),
        }
      );

      if (response.ok) {
        alert('Task completed successfully!');
        setClaimBy(null);
        setFormVariables(null);
      } else {
        const errorData = await response.json();
        alert(`Error completing task: ${errorData.errorMsg}`);
      }
    } catch (e) {
      console.error('Error completing task:', e);
      alert('Failed to complete task. Please try again.');
    }
  };

  // Render form based on formVariables
  const renderForm = () => {
    if (!formVariables) return <p>Loading form...</p>;

    if (formVariables.type === 'variables') {
      return (
        <form>
          {Object.entries(formVariables.content).map(([key, variable]) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{variable.label || key}</label>
              {variable.type === 'String' && (
                <input
                  type="text"
                  id={key}
                  value={variable.value || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              )}
              {variable.type === 'Boolean' && (
                <input
                  type="checkbox"
                  id={key}
                  checked={variable.value || false}
                  onChange={(e) => handleInputChange(key, e.target.checked)}
                />
              )}
              {variable.type === 'Number' && (
                <input
                  type="number"
                  id={key}
                  value={variable.value || ''}
                  onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                />
              )}
            </div>
          ))}
        </form>
      );
    }

    return <p>Form type not supported</p>;
  };

  return (
    <div className="side-right">
      <div className="side-right-header">
        <img
          src={nextArrow}
          alt=""
          style={{ cursor: 'pointer', width: '15px', transform: 'rotate(180deg)' }}
        />
        <img
          src={maximize}
          alt=""
          style={{ cursor: 'pointer', width: '15px', marginLeft: '10px' }}
        />
      </div>
      <div className="side-right-name">
        {selectedTask ? (
          <>
            <h2>{selectedTask.name}</h2>
            <p>{selectedTask.key}</p>
          </>
        ) : (
          <p>Chọn task để xem chi tiết</p>
        )}
      </div>
      <div className="side-right-claim" onClick={handleClaimTask}>
        <img src={user} alt="" style={{ cursor: 'pointer', width: '15px' }} />
        <p>{claimBy ? `${claimBy}` : 'Claim'}</p>
      </div>
      <div className="form-tabs">
        <div className="tab-header">
          <button
            className={activeTab === 'forms' ? 'active-tab' : ''}
            onClick={() => setActiveTab('forms')}
          >
            Form
          </button>
          <button
            className={activeTab === 'history' ? 'active-tab' : ''}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={activeTab === 'diagram' ? 'active-tab' : ''}
            onClick={() => setActiveTab('diagram')}
          >
            Diagram
          </button>
          <button
            className={activeTab === 'description' ? 'active-tab' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
        </div>
      </div>
      <div className="form-content">
        {activeTab === 'forms' && renderForm()}
        {activeTab === 'history' && <p>History content goes here</p>}
        {activeTab === 'diagram' && <p>Diagram content goes here</p>}
        {activeTab === 'description' && <p>Description content goes here</p>}
      </div>
      <div className="side-right-footer">
        <button>Save</button>
        <button onClick={handleCompleteTask}>Complete</button>
      </div>
    </div>
  );
};

export default TasklistRight;
