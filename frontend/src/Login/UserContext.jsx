import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const [assignees, setAssignees] = useState([]);

  const login = (username) => {
    setUser(username);
    localStorage.setItem('user', username);
  };

  const logout = () => {
    setUser('');
    setAssignees([]); // Reset danh sách Assignee
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, assignees, setAssignees }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
