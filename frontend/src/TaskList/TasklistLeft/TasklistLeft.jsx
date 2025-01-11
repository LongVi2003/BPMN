import React, {useState,useEffect} from 'react'
import './TasklistLeft.css'
import nextArrow from '../../assets/next.png';
const TasklistLeft = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }
    useEffect(()=>{
        setIsOpen(true);
    },[])
    return (
        <div className={`side-left ${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? (
            <>
              <div className="side-header">
                <div>Create a filter</div>
                <img
              src={nextArrow}
              alt=""
              style={{  width: '20px', marginLeft: '20px',transform: 'rotate(180deg)', cursor: 'pointer'}}
              onClick={toggleDropdown}
            />
              </div>
              <div className="side-body">
                <div>All task</div>
              </div>
            </>
          ) : (
            <img
              src={nextArrow}
              alt=""
              style={{ cursor: 'pointer', width: '20px', marginLeft: '20px'}}
              onClick={toggleDropdown}
            />
          )}
        </div>
      );
    };

export default TasklistLeft
