import React, { useState, useEffect } from 'react';
import { useUser } from '../Login/UserContext';
import './UserAssignment.css';
import nextArrow from '../assets/next.png';

function UserAssignment() {
  const [view, setView] = useState('UserAssignment'); // State to toggle views
  const [assignee, setAssignee] = useState('');
  const [candidateGroups, setCandidateGroups] = useState('');
  const [candidateUsers, setCandidateUsers] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState('');
  const { user, assignees, setAssignees } = useUser();
  const [isTransitioning, setIsTransitioning] = useState(false); // For smooth transitions
  const [selectedForm, setSelectedForm] = useState(''); // Selected form key
  const [forms, setForms] = useState([]); // State for forms




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

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('http://localhost:3000/forms', {
          headers: { Authorization: 'Basic ' + btoa('demo:demo') },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch forms: ${response.statusText}`);
        }

        const data = await response.json();
        setForms(data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    fetchForms();
  }, []);
  
  


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

  const handleViewSwitch = (targetView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(targetView);
      setIsTransitioning(false);
    }, 500); // Match this with the CSS transition duration
  };

  const renderFormsView = () => (
    <div className={`forms-panel ${isTransitioning ? 'hidden' : ''}`}>
      <label>Type</label>
      <select>
        <option value="embedded">Embedded or External Task Form</option>
      </select>
      <label>Form Key:</label>
      <select onChange={(e) => setSelectedForm(e.target.value)} value={selectedForm}>
        <option value="">Select Form</option>
        {forms.map((form, index) => (
          <option key={index} value={form.key}>
            {form.name} - ({form.key}) {/* Hiển thị tên process kèm form key */}
          </option>
        ))}
      </select>
      <button onClick={() => handleViewSwitch('UserAssignment')}>Back</button>
    </div>
  );

  // UserAssignment view rendering
  const renderUserAssignmentView = () => (
    <div className={`user-assignment-panel ${isTransitioning ? 'hidden' : ''}`}>
      <img src={nextArrow} alt="Next" onClick={() => handleViewSwitch('Forms')} />
      <label>Chọn Assignee:</label>
      <select onChange={(e) => handleSelectAssignee(e.target.value)} value={assignee}>
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

  return <>{view === 'UserAssignment' ? renderUserAssignmentView() : renderFormsView()}</>;
}

export default UserAssignment;
