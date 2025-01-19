import React, { useState, useEffect } from 'react';
import './TasklistRight.css';
import nextArrow from '../../assets/next.png';
import maximize from '../../assets/maximize.png';
import user from '../../assets/user.png';

const TasklistRight = ({ selectedTask, setSelectedTask }) => {
  const [activeTab, setActiveTab] = useState('forms');
  const [form, setForm] = useState(null);
  const [claimBy, setClaimBy] = useState(null);


  useEffect(() => {
    if (selectedTask) {
      fetchClaimInfo();
      fetchFormData();
    }
  }, [selectedTask]);

  const fetchClaimInfo = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/engine-rest/task/${selectedTask.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch task information');
      }

      const data = await response.json();
      setClaimBy(data.assignee);
    } catch (error) {
      console.error(`Error fetching task info:`, error.message);
    }
  };

  const fetchFormData = async () => {
    try {
      const formResponse = await fetch(
        `http://localhost:8080/engine-rest/task/${selectedTask.id}/form`
      );

      if (!formResponse.ok) {
        throw new Error('Failed to fetch form information');
      }

      const formInfo = await formResponse.json();

      // Handle formKey for embedded forms
      if (formInfo?.formKey) {
        const formUrl = formInfo.formKey.replace('embedded:app:', 'http://localhost:8080/');
        setForm({ type: 'embedded', content: formUrl });
      } else {
        // Handle form variables if no embedded form
        const variablesResponse = await fetch(
          `http://localhost:8080/engine-rest/task/${selectedTask.id}/form-variables`
        );

        if (!variablesResponse.ok) {
          throw new Error('Failed to fetch form variables');
        }

        const formVariablesData = await variablesResponse.json();
        setForm({ type: 'variables', content: formVariablesData });
      }
    } catch (error) {
      console.error(`Error fetching form for task ${selectedTask.id}:`, error.message);
      setForm(null);
    }
  };


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
      
    }
  };

  // Complete task and load the next one
  const handleCompleteTask = async () => {
    if (!selectedTask?.id) {
      alert('No task selected to complete');
      return;
    }

    try {
      const variables =
        form?.type === 'variables' ? form.content : {};

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

        // Fetch the next task
        const nextTaskResponse = await fetch(
          'http://localhost:8080/engine-rest/task',
          { method: 'GET' }
        );

        if (!nextTaskResponse.ok) {
          throw new Error('Failed to fetch the next task');
        }

        const nextTasks = await nextTaskResponse.json();


        if (nextTasks.length > 0) {
          const nextTask = nextTasks[0]; 
          setSelectedTask(nextTask);
        } else {
          alert('No more tasks available.');
          setSelectedTask(null); 
        }

        setClaimBy(null);
        setFormVariables(null);
      } else {
        const errorData = await response.json();
        alert(`Error completing task: ${errorData.errorMsg}`);
      }
    } catch (e) {
      console.error('Error completing task:', e);
      setFormVariables(null)
    }
  };

  // Render form based on formVariables
  const renderForm = () => {
    if (!form) return <p>Loading form...</p>;

    if(form.type === 'embedded') {
      return (
        <iframe
          title="Embedded Form"
          className="embedded-form"
          src={formVariables.content}
          width="100%"
          height="500"
        ></iframe>
      );
    }

    if (form.type === 'variables') {
      return (
        <form className="form-task">
          {Object.entries(form.content).map(([key, variable]) => (
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
