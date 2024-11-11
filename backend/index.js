const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); // Enables CORS for all routes
const upload = multer({ dest: 'uploads/' });
const port = 3000;

const CAMUNDA_API_URL = 'http://localhost:8080/engine-rest/deployment/create';

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

app.listen(port, () => {
  console.log(`Server is running `);
});
