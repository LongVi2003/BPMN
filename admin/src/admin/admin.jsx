import React, { useEffect, useState } from 'react';
import './admin.css';

const Admin = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/leave-requests');
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          console.error('Lỗi khi lấy danh sách đơn.');
        }
      } catch (error) {
        console.error('Lỗi hệ thống:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/leave-request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === updatedRequest._id ? updatedRequest : req
          )
        );
        alert('Duyệt đơn thành công!');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message}`);
      }
    } catch (error) {
      console.error('Lỗi hệ thống:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const handleReject = async (id) =>{
    try{
      const response = await fetch(`http://localhost:3000/api/leave-request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      if(response.ok){
        const updatedRequest = await response.json();
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === updatedRequest._id? updatedRequest : req
          )
        );
        alert('Từ chối đơn thành công!');
      }else{
        const error = await response.json();
        alert(`L��i: ${error.message}`);
      }
    }catch(error){
      console.error('L��i hệ thống:', error);
      alert('Đã xảy ra l��i. Vui lòng thử lại.');
    }
  }

  return (
    <div>
      <div className="form-header">
        <h2>Danh Sách Đơn Xin Nghỉ Phép</h2>
      </div>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th>Ngày Nghỉ</th>
            <th>Thời Gian Nghỉ</th>
            <th>Lý Do Nghỉ</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td>{request.name}</td>
              <td>{request.email}</td>
              <td>{request.date}</td>
              <td>{request.time}</td>
              <td>{request.reason}</td>
              <td>
                {request.status === 'Approved' ? (
                  <span style={{ color: 'green' }}>Đã Duyệt</span>
                ) : request.status === 'Rejected'?(
                  <span style={{ color:'red' }}>Đã Từ Chối</span>
                ):(
                  <>
                  <button
                    onClick={() => handleApprove(request._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: 'green',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Duyệt
                  </button>

                  <button
                    onClick={() => handleReject(request._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '10px',
                    }}
                  >
                    Từ Chối
                  </button>
                  </>
                  
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
