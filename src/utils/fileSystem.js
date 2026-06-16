export async function loadProgressFile() {
  try {
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
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to create save file:', error);
      alert('Failed to create save file.');
    }
    return null;
  }
}

export async function saveProgressFile(fileHandle, data) {
  try {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  } catch (error) {
    console.error('Failed to save to file:', error);
    // Silent fail for auto-save, but could log it
    return false;
  }
}
