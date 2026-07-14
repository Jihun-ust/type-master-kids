export async function loadProgressFile() {
  try {
    if (window.showOpenFilePicker) {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false
      });

      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      return { fileHandle, data };
    } else {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.onchange = (e) => {
          document.body.removeChild(input);
          const file = e.target.files[0];
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              resolve({ fileHandle: { isFallback: true, name: file.name }, data });
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        };
        input.click();
      });
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to load file:', error);
      alert('Failed to load progress file.');
    }
    return null;
  }
}

export async function createNewSaveFile(suggestedName) {
  try {
    if (window.showSaveFilePicker) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${suggestedName}.json`,
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      return fileHandle;
    } else {
      return { isFallback: true, name: `${suggestedName}.json` };
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to create save file:', error);
      alert('Failed to create save file.');
    }
    return null;
  }
}

export async function saveProgressFile(fileHandle, data, isAutoSave = false) {
  try {
    if (fileHandle && !fileHandle.isFallback && window.showSaveFilePicker) {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      return true;
    } else {
      if (isAutoSave) return false;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileHandle ? fileHandle.name : 'progress.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (error) {
    console.error('Failed to save to file:', error);
    // Silent fail for auto-save, but could log it
    return false;
  }
}
