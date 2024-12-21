import React, { useEffect, useState } from 'react';
import './Process.css';
import Navbar from '../Navbar/Navbar.jsx';
import { Link } from 'react-router-dom';
import deleteIcon from '../assets/delete.png';

const Process = () => {
  const [processDefinitions, setProcessDefinition] = useState([]);
  const [error, setError] = useState(null);

  const fetchProcessDefinition = async () => {
    try {
      const response = await fetch('http://localhost:3000/process-definitions', {
        headers: {
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProcessDefinition(data.data);
      } else {
        const error = await response.text();
        setError(error);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteProcessById = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete Process Definition?');
    if(confirm){
      try {
        const response = await fetch(
             `http://localhost:3000/process-definitions/${id}?cascade=true`,
             {
              method: 'DELETE',
               headers: {
                 Authorization: 'Basic ' + btoa('demo:demo'),
              },
            }
           );
    
           if (response.ok) {
            setProcessDefinition((prevDefinitions) =>
              prevDefinitions.filter((process) => process.id !== id)
             );
             alert("Xóa thành công Process Definition");
        } else {
             const errorText = await response.text();
             console.error('Error deleting process definition:', errorText);
           }
         } catch (error) {
           console.error('Error:', error);
         }
     };
    }

  useEffect(() => {
    fetchProcessDefinition();
  }, []);

  return (
    <div className="process-container">
      <Navbar />
      <header className="process-header">
        <h2>Process definitions deployed</h2>
        <input type="text" placeholder="Add criteria" className="criteria-input" />
      </header>

      <div className="process-list">
        <div className="process-list-header">
          <div>State</div>
          <div>Incidents</div>
          <div>Running Instances</div>
          <div>Key</div>
          <div>Name</div>
          <div></div>
        </div>

        {error && <div className="error">Error</div>}

        {processDefinitions.map((process) => (
          <div className="process-row" key={process.id}>
            <div>✔️</div>
            <div>{process.incidents || 0}</div>
            <div>{process.runningInstances || 0}</div>
            <Link to={`/processdetail/${process.id}`}>
              <div>{process.key}</div>
            </Link>
            <Link to={`/processdetail/${process.id}`}>
              <div>{process.name}</div>
            </Link>
             <button onClick={() => deleteProcessById(process.id)}>
              <img src={deleteIcon} alt="delete" />
            </button> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default Process;
