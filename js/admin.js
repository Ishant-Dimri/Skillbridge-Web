// admin.js — Admin actions: add tasks, resources
// Uses Firestore to store admin-created tasks and resources

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const { db } = window.fb;

// ==========================================
// 1. Handle Adding Global Tasks
// ==========================================
const taskForm = document.getElementById('admin-task-form');
if (taskForm) {
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    
    try {
      await addDoc(collection(db, 'tasks'), {
        title: title,
        description: desc,
        createdAt: new Date().toISOString()
      });
      alert('Global Task added successfully!');
      taskForm.reset();
    } catch (err) {
      console.error("Error adding task:", err);
      alert('Error adding task: ' + err.message);
    }
  });
}

// ==========================================
// 2. Handle Adding Learning Resources
// ==========================================
const resourceForm = document.getElementById('admin-resource-form');
if (resourceForm) {
  resourceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('resource-title').value.trim();
    const link = document.getElementById('resource-link').value.trim();
    
    try {
      await addDoc(collection(db, 'resources'), {
        title: title,
        link: link,
        createdAt: new Date().toISOString()
      });
      alert('Learning Resource added successfully!');
      resourceForm.reset();
    } catch (err) {
      console.error("Error adding resource:", err);
      alert('Error adding resource: ' + err.message);
    }
  });
}
