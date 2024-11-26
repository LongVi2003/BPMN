import React, { useState, useEffect } from 'react';
import { useUser } from '../Login/UserContext';
import './UserAssignment.css';

function UserAssignment() {
  const [assignee, setAssignee] = useState('');
  const [candidateGroups, setCandidateGroups] = useState('');
  const [candidateUsers, setCandidateUsers] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState('');
  const { user, assignees, setAssignees } = useUser();

  // Fetch danh sách Assignee
  useEffect(() => {
    if (!user) return;
    const fetchAssignees = async () => {
      try {
        const response = await fetch('http://localhost:3000/assignee', {
          headers: { Authorization: 'Basic ' + btoa('demo:demo') },
        });
        if (response.ok) {
          const data = await response.json();
          setAssignees(data.data);
        } else {
          console.error('Failed to fetch Assignees');
        }
      } catch (error) {
        console.error('Error fetching Assignees:', error);
      }
    };

    fetchAssignees();
  }, [user, setAssignees]);

  // Gửi Assignee lên API
  const handleSave = async () => {
    const payload = { assignee, candidateGroups, candidateUsers, dueDate, followUpDate, priority };

    try {
      const response = await fetch('http://localhost:3000/assignee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Assignee saved successfully');
        setAssignees((prev) => [...prev, data.data]);
      } else {
        alert('Error saving Assignee');
      }
    } catch (error) {
      console.error('Error saving Assignee:', error);
      alert('Error saving Assignee');
    }
  };

  // Xử lý khi chọn Assignee
  const handleSelectAssignee = (selectedAssignee) => {
    setAssignee(selectedAssignee);

    const foundAssignee = assignees.find((a) => a.assignee === selectedAssignee);
    if (foundAssignee) {
      setCandidateGroups(foundAssignee.candidateGroups || '');
      setCandidateUsers(foundAssignee.candidateUsers || '');
      setDueDate(foundAssignee.dueDate ? new Date(foundAssignee.dueDate).toISOString().split('T')[0] : '');
      setFollowUpDate(foundAssignee.followUpDate ? new Date(foundAssignee.followUpDate).toISOString().split('T')[0] : '');
      setPriority(foundAssignee.priority || '');
    } else {
      setCandidateGroups('');
      setCandidateUsers('');
      setDueDate('');
      setFollowUpDate('');
      setPriority('');
    }
  };

  return (
    <div className="user-assignment-panel">     
        <label>Chọn Assignee:</label>
        <select
          onChange={(e) => handleSelectAssignee(e.target.value)}
          value={assignee}
        >
          <option value="">Select Assignee</option>
          {assignees.map((assignee, index) => (
            <option key={index} value={assignee.assignee}>
              {assignee.assignee}
            </option>
          ))}
        </select>
      <label>Assignee:</label>
      <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
      <label>Candidate Groups:</label>
      <input type="text" value={candidateGroups} onChange={(e) => setCandidateGroups(e.target.value)} />
      <label>Candidate Users:</label>
      <input type="text" value={candidateUsers} onChange={(e) => setCandidateUsers(e.target.value)} />
      <label>Due Date:</label>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <label>Follow-Up Date:</label>
      <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
      <label>Priority:</label>
      <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default UserAssignment;
