import React, { useState, useEffect } from 'react';
import './NavbarTask.css';
import { useUser } from '../../Login/UserContext';
import nextArrow from '../../assets/next.png';
import { NavLink } from 'react-router-dom';

const NavbarTask = () => {
  const { user, logout } = useUser();
  const [dropMenu, setDropMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [formVariables, setFormVariables] = useState({});
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);

  const toggleDropMenu = () => {
    setDropMenu((prev) => !prev);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const closeFormModal = () => {
    setIsModalFormOpen(false);
    setSelectedProcess(null);
    setFormVariables({});
  }

  // Fetch process definitions from Camunda API
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('http://localhost:8080/engine-rest/process-definition');
        const data = await response.json();
        setProcesses(data);
      } catch (error) {
        console.error('Error fetching process definitions:', error);
      }
    };

    fetchProcesses();
  }, []);
  //Open Form Start Api
  const openFormModel = async (processKey) =>{
    try{
      const response = await fetch(`http://localhost:8080/engine-rest/process-definition/key/${processKey}/form-variables`);
      if(response.ok){
        const variables = await response.json();
        setFormVariables(variables);
        setSelectedProcess(processKey);
        setIsModalFormOpen(true);
      }else{
        alert('Failed to fetch form variables. Please try again.');
      }
    }catch(e){
      console.error('Failed to fetch form variables',error);
    }
  }

  //Start Process Api
  const startProcessWithForm = async () => {
    const variables = {};
    Object.keys(formVariables).forEach((key) => {
      variables[key] = {
        value: formVariables[key].value,
      };
    });
    try {
      const response = await fetch(`http://localhost:8080/engine-rest/process-definition/key/${selectedProcess}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables }),
      });

      if (response.ok) {
        alert(`Tạo ${selectedProcess} thành công!`);
        closeFormModal();
      } else {
        alert('Failed to start process. Please try again.');
      }
    } catch (error) {
      console.error('Error starting process:', error);
    }
  };
  return (
    <div className="navbartask">
      <div className="navbartask-left">
        <div>Camunda TaskList</div>
      </div>
      <div className="navbartask-right">
        <div className="navbar-right">
          <div className="startprocessintance" onClick={toggleModal}>
            Start Process
          </div>
          {user ? (
            <div className="logout">
              <span>Welcome, {user}</span>
              <img
                src={nextArrow}
                alt="Back"
                style={{ cursor: 'pointer', transform: 'rotate(90deg)', width: '15px' }}
                onClick={toggleDropMenu}
              />
              {dropMenu && (
                <div className="dropdown-menu">
                  <NavLink to="/login">
                    <button onClick={logout}>Logout</button>
                  </NavLink>
                  <NavLink to="/dashboard">DashBoard</NavLink>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login">
              <button>Login</button>
            </NavLink>
          )}
        </div>
      </div>
      {/* Modal for Start Process */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
           <div className="modal-header">
           <h3 className='modal-title'>Start Process</h3>
            <input
              type="text"
              placeholder="Search by process name"
              className="process-search"
              onChange={(e) =>
                setProcesses((prev) =>
                  prev.filter((process) =>
                    (process.name || process.key).toLowerCase().includes(e.target.value.toLowerCase())
                  )
                )
              }
            />
           </div>
           <p className='pp'>Click on the process to start.</p>
            <div className="process-list">
              {processes.length > 0 ? (
                processes.map((process) => (
                  <div
                    key={process.id}
                    className="process-item"
                    onClick={() => openFormModel(process.key)}
                  >
                    {process.name || process.key}
                  </div>
                ))
              ) : (
                <p>No processes available</p>
              )}
            </div>
            <p className='close-modal' onClick={toggleModal}>Close</p>
          </div>
        </div>
      )}
      {/* Start process */}
      {isModalFormOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h3 className="modal-title">Start Process: {selectedProcess}</h3>
      </div>
      <form className='form-task-process'>
        {/* Render form variables dynamically */}
        {Object.keys(formVariables).map((key) => (
          <div key={key} className="form-group">
            <label>{key}</label>
            <input
              type="text"
              value={formVariables[key]?.value || ''}
              onChange={(e) =>
                setFormVariables((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], value: e.target.value },
                }))
              }
            />
          </div>
        ))}
      </form>
      <div className="button-container">
        <button onClick={startProcessWithForm}>Start</button>
        <p onClick={closeFormModal}>Close</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default NavbarTask;
