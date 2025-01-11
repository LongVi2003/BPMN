import React from 'react'
import './TaskList.css'
import NavbarTask from './navbarTask/NavbarTask'
import TasklistLeft from './TasklistLeft/TasklistLeft'
import TasklistMid from './TasklistMid/TasklistMid'
import TasklistRight from './TasklistRight/TasklistRight'
const TaskList = () => {
  return (
    <div>
      <NavbarTask />
      <div className="tasklist">
        <div className="tasklist-left">
          <TasklistLeft />
        </div>
        <div className="tasklist-mid">
          <TasklistMid />
        </div>
       
      </div>
    </div>
  )
}

export default TaskList
