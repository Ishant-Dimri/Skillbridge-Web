// admin.js — Admin actions: add tasks, resources, view users
// Uses Firestore to store admin-created tasks and resources

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb;

const taskForm = document.getElementById('admin-task-form');
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description: desc,
        createdAt: new Date().toISOString()
      });
      alert('Task added.');
      taskForm.reset();
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  });
}

const resourceForm = document.getElementById('admin-resource-form');
if (resourceForm) {
  resourceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('resource-title').value.trim();
    const link = document.getElementById('resource-link').value.trim();
    try {
      await addDoc(collection(db, 'resources'), {
        title,
        link,
        createdAt: new Date().toISOString()
      });
      alert('Resource added.');
      resourceForm.reset();
    } catch (err) {
      alert('Error adding resource: ' + err.message);
    }
  });
}
