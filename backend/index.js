const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { type } = require('os');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));
 
const upload = multer({ dest: 'uploads/' });
const port = 3000;

//Database with mongoDb
mongoose.connect('mongodb+srv://nguyendu89000:longvi890@cluster0.yfvkr.mongodb.net/',)
.then(() =>console.log('Đã kết nối với MongoDB '))
.catch((error) => console.error('Lỗi khi kết nối với MongoDB ',error));

const CAMUNDA_API_URL = 'http://localhost:8080/engine-rest/deployment/create';
const CAMUNDA_TASK_API_URL = 'http://localhost:8080/engine-rest/task';


const LeaveRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String,
  reason: String,
  status: { type: String, default: 'Pending' },
});

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);



const assigneeSchema = new mongoose.Schema({
  assignee: { type: String, required: true },
  candidateGroups: { type: String },
  candidateUsers: { type: String },
  dueDate: { type: Date },
  followUpDate: { type: Date },
  priority: { type: Number },
});

const Assignee = mongoose.model('Assignee', assigneeSchema);



const deploymentSchema = new mongoose.Schema({
  deployment : String,
  name: String,
  deployAt: {type: Date, Default: new Date},
  data: Object
});
const Deployment = mongoose.model('Deployment',deploymentSchema);


const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  if (username === 'demo' && password === 'demo') {
    next();
  } else {
    return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
  }
}


app.post('/assignee', basicAuth, async (req, res) => {
  const { assignee, candidateGroups, candidateUsers, dueDate, followUpDate, priority } = req.body;

  try {
    const newAssignee = new Assignee({
      assignee,
      candidateGroups,
      candidateUsers,
      dueDate: new Date(dueDate),
      followUpDate: new Date(followUpDate),
      priority: parseInt(priority),
    });

    await newAssignee.save();
    res.status(201).json({ message: 'Assignee created successfully', data: newAssignee });
  } catch (error) {
    res.status(500).json({ message: 'Error creating Assignee', error });
  }
});




app.get('/assignee', basicAuth, async (req, res) => {
  try {
    const assignees = await Assignee.find();
    res.status(200).json({ message: 'Assignees retrieved successfully', data: assignees });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Assignees', error });
  }
});



app.post('/login',(req, res)=>{
  const {authorization} = req.headers;
  if(!authorization || !authorization.startsWith('Basic')){
    return res.status(401).json({message: 'Chưa đăng nhập'});
  }
  const base64Credentials = authorization.split(' ')[1];
  const [username, password] = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');

  if(username === 'demo' && password === 'demo'){
    res.json({message: 'Login Success'});
  }else{
    res.status(401).json({message: 'Tài khoản hoặc mật khẩu không đúng'});
  }
});


app.get('/process-definitions', basicAuth, async (req, res) => {
  const CAMUNDA_API_URL = 'http://localhost:8080/engine-rest/process-definition';

  try {
    const response = await fetch(CAMUNDA_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      const processDefinitions = await response.json();
      const detailDefinitions = await Promise.all(
        processDefinitions.map(async (definition) =>{
          const statsUrl = `${CAMUNDA_API_URL}/${definition.id}/statistics?incidents=true`;

          try{
            const statsResponse = await fetch(statsUrl, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic'+ Buffer.from('demo:demo').toString('base64'),
              },
            });
            if(statsResponse.ok){
              const stats = await statsResponse.json();
              return {...definition,
                incidents: stats[0]?.incidentCount||0,
                runningInstances:stats[0]?.instances ||0};
            }
          }catch(error){
            console.error(`Failed to fetch stats for ${definition.id}:`, error);
          }
          return {...definition, runningInstances : 0, incidents:0}
        })
      );
      res.status(200).json({ message: '', data: detailDefinitions });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ message: '', error: errorText });
    }
  } catch (err) {
    res.status(500).json({ message: '', error: err.message });
  }
});

app.get('/process-definitions/:id', basicAuth, async (req, res) => {
  const { id } = req.params;
  const CAMUNDA_API_URL = `http://localhost:8080/engine-rest/process-definition/${id}`;

  try {
    const response = await fetch(CAMUNDA_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      const processDefinition = await response.json();
      res.status(200).json(processDefinition);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/process-definition/:deploymentId/diagram', basicAuth, async (req, res) => {
  const { deploymentId } = req.params;
  const CAMUNDA_API_URL = `http://localhost:8080/engine-rest/process-definition/${deploymentId}/xml`;

  try {
    const response = await fetch(CAMUNDA_API_URL, {
      headers: {
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Camunda API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const { bpmn20Xml } = await response.json();

    if (!bpmn20Xml) {
      throw new Error('BPMN XML is missing in the response');
    }

    res.setHeader('Content-Type', 'application/xml');
    res.send(bpmn20Xml);
  } catch (error) {
    console.error('Backend Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.delete('/process-definitions/:id', basicAuth, async (req, res) => {
  const { id } = req.params;
  const { cascade } = req.query; 
  const CAMUNDA_API_URL = `http://localhost:8080/engine-rest/process-definition/${id}`;
  const options = cascade === 'true' ? '?cascade=true' : '';

  try {
    const response = await fetch(CAMUNDA_API_URL + options, {
      method: 'DELETE',
      headers: {
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      res.status(200).json({ message: 'Process definition deleted successfully' });
    } else {
      const errorText = await response.text();
      res
        .status(response.status)
        .json({ message: 'Failed to delete process definition', error: errorText });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting process definition', error: error.message });
  }
});



//get process instances
app.get('/process-instances/:id', basicAuth, async (req, res) => {
  const { id } = req.params; // This should be the process definition key

  const CAMUNDA_API_URL = `http://localhost:8080/engine-rest/process-instance?processDefinitionId=${id}`; // Use ID

  try {
    const response = await fetch(CAMUNDA_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      const processInstances = await response.json();
      res.status(200).json({
        message: 'Process instances retrieved successfully',
        data: processInstances,
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        message: 'Error retrieving process instances',
        error: errorText,
      });
    }
  } catch (error) {
    console.error('Error fetching process instances:', error);
    res.status(500).json({ message: 'Error fetching process instances', error });
  }
});

app.delete('/process-instances/:id', async (req, res) => {
  const { id } = req.params;
  const cascade = req.query.cascade === 'true';
  const options = cascade ? '?cascade=true' : '';

  try {
    const response = await fetch(`http://localhost:8080/engine-rest/process-instance/${id}${options}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      res.status(200).json({ message: 'Process instance đã xóa thành công' });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ message: 'Error xóa process instance', error: errorText });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error xóa process instance', error: error.message });
  }
});




app.get('/variable-instance/:id', async (req, res) => {
  const { id } = req.params;
  const CAMUNDA_API_URL = `http://localhost:8080/engine-rest/variable-instance?processInstanceId=${id}`;

  try {
    const response = await fetch(CAMUNDA_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (response.ok) {
      const variableInstances = await response.json();

      // Nhóm dữ liệu theo processInstanceId
      const groupedVariables = variableInstances.reduce((acc, variable) => {
        const { processInstanceId } = variable;
        if (!acc[processInstanceId]) acc[processInstanceId] = [];
        acc[processInstanceId].push(variable);
        return acc;
      }, {});

      res.status(200).json({
        message: 'Variables retrieved successfully',
        data: groupedVariables, // Trả về danh sách biến đã được nhóm
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        message: 'Error retrieving variables',
        error: errorText,
      });
    }
  } catch (error) {
    console.error('Error fetching variable instances:', error);
    res.status(500).json({ message: 'Error fetching variable instances', error });
  }
});






app.put('/variable-instance/:instanceId/:variableName', basicAuth, async (req, res) => {
  const { instanceId, variableName } = req.params;
  const { type, value } = req.body;

  if (!type || value === undefined) {
    return res.status(400).json({ error: 'Type and value are required' });
  }

  try {
    const response = await fetch(
      `http://localhost:8080/engine-rest/process-instance/${instanceId}/variables/${variableName}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization,
        },
        body: JSON.stringify({ type, value }),
      }
    );

    if (response.ok) {
      res.status(200).json({ message: 'Variable updated successfully' });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/variable-instance/:instanceId/:variableName', basicAuth, async (req, res) => {
  const { instanceId, variableName } = req.params;

  try {
    const response = await fetch(`http://localhost:8080/engine-rest/process-instance/${instanceId}/variables/${variableName}`, {
      method: 'DELETE',
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    if (response.ok) {
      res.status(200).json({ message: 'Variable deleted successfully' });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/deployment', upload.single('diagram'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  try {
    const formData = new FormData();
    formData.append('deployment-name', 'bpmn-diagram-deployment');
    formData.append('enable-duplicate-filtering', 'true');
    formData.append('deploy-changed-only', 'true');
    formData.append('diagram.bpmn', fs.createReadStream(filePath), {
      filename: 'diagram.bpmn',
      contentType: 'application/octet-stream',
    });

    const response = await fetch(CAMUNDA_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      const deployment = new Deployment({
        deployment: jsonResponse.id,
        name: 'diagram.bpmn',
        data: jsonResponse,
      })
      await deployment.save();
      res.json({
        message: 'BPMN diagram deployed thành công vào Camunda Cockpit!',
        data: jsonResponse,
      });
    } else {
      const errorResponse = await response.text();
      res.status(500).json({
        message: 'Deploy thất bại vào Camunda',
        error: errorResponse,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Deployed không thành công ', error: err });
  } finally {
    fs.unlinkSync(filePath); 
  }
});


app.post('/deploymentForm', upload.single('form'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  try {
    const formData = new FormData();
    formData.append('deployment-name', 'form-form-deployment');
    formData.append('enable-duplicate-filtering', 'true');
    formData.append('deploy-changed-only', 'true');
    formData.append('form.form', fs.createReadStream(filePath), {
      filename: 'form.form',
      contentType: 'application/octet-stream',
    });

    const response = await fetch(CAMUNDA_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      const deployment = new Deployment({
        deployment: jsonResponse.id,
        name: 'form.form',
        data: jsonResponse,
      })
      await deployment.save();
      res.json({
        message: 'BPMN diagram deployed thành công vào Camunda Cockpit!',
        data: jsonResponse,
      });
    } else {
      const errorResponse = await response.text();
      res.status(500).json({
        message: 'Deploy thất bại vào Camunda',
        error: errorResponse,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Deployed không thành công ', error: err });
  } finally {
    fs.unlinkSync(filePath); 
  }
});


app.get('/forms', async (req, res) => {
  try {
    const camundaUrl = 'http://localhost:8080/engine-rest/process-definition'; // Lấy danh sách process definitions
    const response = await fetch(camundaUrl, {
      headers: {
        Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch process definitions: ${response.statusText}`);
      return res.status(response.status).json({ message: 'Failed to fetch process definitions' });
    }

    const processDefinitions = await response.json();

    // Lấy thông tin formKey từ từng process definition
    const forms = await Promise.all(
      processDefinitions.map(async (process) => {
        try {
          const startFormResponse = await fetch(
            `http://localhost:8080/engine-rest/process-definition/${process.id}/startForm`,
            {
              headers: {
                Authorization: 'Basic ' + Buffer.from('demo:demo').toString('base64'),
              },
            }
          );

          if (startFormResponse.ok) {
            const { key } = await startFormResponse.json(); // API trả về { key: <formKey> }
            return {
              id: process.id,
              key: key || 'Chưa có Form Key hiển thị', // Form key lấy từ endpoint
              name: process.name || `Process ${process.id}`,
            };
          }
        } catch (error) {
          console.error(`Error fetching form key for process ${process.id}:`, error.message);
          return null; // Nếu không lấy được form key thì trả null
        }
      })
    );

    // Lọc các giá trị null (nếu có lỗi xảy ra)
    const filteredForms = forms.filter((form) => form !== null);

    res.status(200).json(filteredForms);
  } catch (error) {
    console.error('Error fetching forms:', error.message);
    res.status(500).json({ message: 'Error fetching forms', error: error.message });
  }
});


app.get('/tasks', async (req, res) => {
  try {
    const response = await fetch(CAMUNDA_TASK_API_URL); // URL Camunda Task API
    if (!response.ok) {
      throw new Error(`Camunda API Error: ${response.statusText}`);
    }

    const tasks = await response.json();

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const processDefinitionUrl = `http://localhost:8080/engine-rest/process-definition/${task.processDefinitionId}`;
        const formKeyUrl = `http://localhost:8080/engine-rest/task/${task.id}/form`;

        let processKey = 'UnKey';
        let formKey = null;

        // Fetch process definition key
        const processResponse = await fetch(processDefinitionUrl);
        if (processResponse.ok) {
          const processDefinition = await processResponse.json();
          processKey = processDefinition.key || 'UnKey';
        }

        // Fetch form key
        const formResponse = await fetch(formKeyUrl);
        if (formResponse.ok) {
          const formData = await formResponse.json();
          formKey = formData.key || null;
        }

        return {
          id: task.id,
          name: task.name,
          key: processKey,
          formKey: formKey, // Include form key
          created: task.created || null,
        };
      })
    );

    res.status(200).json(enrichedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/tasks-variable/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const formVariablesUrl = `http://localhost:8080/engine-rest/process-definition/${id}/form-variables`;

    const response = await fetch(formVariablesUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch form variables: ${response.statusText}`);
    }

    const formVariables = await response.json();
    res.status(200).json({ formVariables });
  } catch (error) {
    console.error('Error fetching form variables:', error.message);
    res.status(500).json({ error: 'Failed to fetch form variables' });
  }
});



app.listen(port, () => {
  console.log(`Server is running `);
});