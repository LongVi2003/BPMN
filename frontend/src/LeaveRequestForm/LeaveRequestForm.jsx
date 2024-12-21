import React,{useState, useEffect} from 'react'
import './LeaveRequestForm.css'
import Navbar from '../Navbar/Navbar.jsx'
import nextArrow from '../assets/next.png';

const LeaveRequestForm = () => {

  const [formView, setFormView] = useState(true);
  const [requests, setRequests] = useState([]); // Danh sách đơn xin nghỉ phép



  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, email, date, time, reason, value} = e.target;
    setFormData({...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3000/api/leave-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setRequests([...requests, formData]); // Cập nhật danh sách đơn trong UI
        setFormData({ name: '', email: '', date: '', time: '', reason: '' }); // Reset form
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error('Lỗi khi gửi đơn:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

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
  
    if (!formView) fetchRequests(); // Lấy danh sách khi chuyển sang chế độ xem danh sách
  }, [formView]);

  return (
    <div>
      <Navbar/>
      <div className="leave-request-form">
        {formView ? (
          <div>
             <div className="form-header">
      <h2>ĐƠN XIN NGHỈ PHÉP</h2>
      <img src={nextArrow} alt="Next" onClick = {() => setFormView(false)}/>
      </div>
      <form className="form" onSubmit = {handleSubmit}>
        <label>
          Họ và Tên
          <input type="text" placeholder="Họ và Tên" required name = 'name' value = {formData.name} onChange = {handleChange} />
        </label>
        <label>
          Email
          <input type="email" placeholder="Email" required name = 'email' value ={formData.email} onChange ={handleChange} />
        </label>
        <label>
          Ngày Nghỉ
          <input type="date" placeholder="Ngày Nghỉ" required name = 'date' value ={formData.date} onChange ={handleChange}/>
        </label>
        <label>
          Thời Gian Nghỉ
          <input type="text" placeholder="Thời Gian Nghỉ" required name = 'time' value ={formData.time} onChange ={handleChange} />
        </label>
        <label>
          Lý Do Nghỉ
          <input type= 'text' placeholder="Lý Do Nghỉ" required name = 'reason' value ={formData.reason} onChange ={handleChange}></input>
        </label>
        <button type="submit">Gửi Đề Nghị</button>
      </form>
          </div>
        ):(
          <div>
          <div className="form-header">
            <h2>Danh Sách Đơn Xin Nghỉ Phép</h2>
            <img
              src={nextArrow}
              alt="Back"
              onClick={() => setFormView(true)} // Chuyển về chế độ form
              style={{ cursor: 'pointer', transform: 'rotate(180deg)' }}
            />
          </div>
          {requests.length > 0 ? (
  <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th>Họ và Tên</th>
        <th>Email</th>
        <th>Ngày Nghỉ</th>
        <th>Thời Gian Nghỉ</th>
        <th>Lý Do Nghỉ</th>
        <th>Trạng Thái</th>
      </tr>
    </thead>
    <tbody>
      {requests.map((request, index) => (
        <tr key={index}>
          <td>{request.name}</td>
          <td>{request.email}</td>
          <td>{request.date}</td>
          <td>{request.time}</td>
          <td>{request.reason}</td>
          <td style={{ textAlign: 'left' }}>
        {request.status === 'Approved' ? (
          <span style={{ color: 'green' }}>Đã Duyệt</span>
        ) : request.status === 'Rejected' ? (
          <span style={{ color: 'red' }}>Đã Từ Chối</span>
        ) : (
          <span style={{ color: 'orange' }}>Chưa Duyệt</span>
        )}
</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>Chưa có đơn xin nghỉ phép nào.</p>
)}

        </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequestForm;
