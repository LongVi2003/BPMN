import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../Login/UserContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useUser();

  return (
    <div className='navbar'>
      <div className="navbar-left">
        <NavLink 
          to='/dashboard' 
          className={({ isActive }) => isActive ? 'active-link' : ''}>
          <div>Camuda Diagram</div>
        </NavLink>
        <NavLink 
          to='/process' 
          className={({ isActive }) => isActive ? 'active-link' : ''}>
          <div>Process</div>
        </NavLink>
        <NavLink 
          to='/form-editor' 
          className={({ isActive }) => isActive ? 'active-link' : ''}>
          <div>Camuda Form</div>
        </NavLink>
      </div>
      {user ? (
        <div className='logout'>
          <span>Welcome, {user}</span>
          <NavLink to='/login'>
            <button onClick={logout}>Logout</button>
          </NavLink>
        </div>
      ) : (
        <NavLink to='/login'>
          <button>Login</button>
        </NavLink>
      )}
    </div>
  );
};

export default Navbar;
