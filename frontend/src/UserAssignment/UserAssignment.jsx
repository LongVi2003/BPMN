import React, { useState, useEffect } from 'react';
import './UserAssignment.css';

function UserAssignment({ selectedElement, updateProperty }) {
  const [assignee, setAssignee] = useState('');
  const [candidateGroups, setCandidateGroups] = useState('');
  const [candidateUsers, setCandidateUsers] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    if (selectedElement) {
      setAssignee(selectedElement.businessObject.assignee || '');
      setCandidateGroups(selectedElement.businessObject.candidateGroups || '');
      setCandidateUsers(selectedElement.businessObject.candidateUsers || '');
      setDueDate(selectedElement.businessObject.dueDate || '');
      setFollowUpDate(selectedElement.businessObject.followUpDate || '');
      setPriority(selectedElement.businessObject.priority || '');
    }
  }, [selectedElement]);

  const handleSave = () => {
    updateProperty('assignee', assignee);
    updateProperty('candidateGroups', candidateGroups);
    updateProperty('candidateUsers', candidateUsers);
    updateProperty('dueDate', dueDate);
    updateProperty('followUpDate', followUpDate);
    updateProperty('priority', priority);
    alert('User assignment saved');
  };

  return (
    <div className="user-assignment-panel">
      <label>Assignee:</label>
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
        <option value="User Assignment 1">User Assignment 1</option>
        <option value="User Assignment 2">User Assignment 2</option>
        <option value="User Assignment 3">User Assignment 3</option>
      </select>
      <label>Candidate Groups:</label>
      <input type="text" value={candidateGroups} onChange={(e) => setCandidateGroups(e.target.value)} />

      <label>Candidate Users:</label>
      <input type="text" value={candidateUsers} onChange={(e) => setCandidateUsers(e.target.value)} />

      <label>Due Date:</label>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      <label>Follow-Up Date:</label>
      <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />

      <label>Priority:</label>
      <input type="text" value={priority} onChange={(e) => setPriority(e.target.value)} />

      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default UserAssignment;
