let editor;
let currentFile = null;

document.addEventListener('DOMContentLoaded', () => {
  editor = SUNEDITOR.create('editor', {
    buttonList: [
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle'],
      ['removeFormat'],
      ['outdent', 'indent'],
      ['align', 'horizontalRule', 'list', 'lineHeight'],
      ['table', 'link', 'image', 'video'],
      ['fullScreen', 'showBlocks', 'codeView'],
      ['preview', 'print']
    ],
    height: '400px'
  });

  loadFileList();

  document.getElementById('save-btn').addEventListener('click', saveFile);
});

async function loadFileList() {
  try {
    const response = await fetch('/api/files');
    const files = await response.json();
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file;
      li.addEventListener('click', () => loadFile(file));
      fileList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading file list:', error);
  }
}

async function loadFile(filename) {
  try {
    const response = await fetch(`/api/file/${filename}`);
    const data = await response.json();
    editor.setContents(data.content);
    currentFile = filename;
  } catch (error) {
    console.error('Error loading file:', error);
  }
}

async function saveFile() {
  if (!currentFile) {
    alert('No file selected');
    return;
  }
  const content = editor.getContents();
  try {
    const response = await fetch(`/api/file/${currentFile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error('Error saving file:', error);
  }
}