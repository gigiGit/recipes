const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const INSTRUCTIONS_DIR = path.join(__dirname, 'Istruzioni');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API to get list of files
app.get('/api/files', (req, res) => {
  fs.readdir(INSTRUCTIONS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    res.json(txtFiles);
  });
});

// API to get file content
app.get('/api/file/:name', (req, res) => {
  const filePath = path.join(INSTRUCTIONS_DIR, req.params.name);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read file' });
    }
    res.json({ content: data });
  });
});

// API to save file content
app.post('/api/file/:name', (req, res) => {
  const filePath = path.join(INSTRUCTIONS_DIR, req.params.name);
  const content = req.body.content;
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to save file' });
    }
    res.json({ message: 'File saved successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});