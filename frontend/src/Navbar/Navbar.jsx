import React,{useState} from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../Login/UserContext';
import './Navbar.css';
import nextArrow from '../assets/next.png';

const Navbar = () => {
  const { user, logout } = useUser();
  const [dropMenu, setDropMenu] = useState(false);

  const toggleDropMenu = (menu) => {
    setDropMenu((prev => !prev));
  };

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
          <img
              src={nextArrow}
              alt="Back"
              style={{ cursor: 'pointer', transform: 'rotate(90deg)',width:'15px' }}
              onClick={toggleDropMenu}
            />
            {dropMenu &&(
              <div className="dropdown-menu">
                 <NavLink to='/login'><button onClick={logout}>Logout</button></NavLink>
                 <NavLink to='/task-list'>TaskList</NavLink>
              </div>
            )}
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
