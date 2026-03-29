// upload.js — Handle project upload form and store data in Firestore and Storage
// Uses Firebase modular SDK

import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const { auth, db, storage } = window.fb;

const form = document.getElementById('project-upload-form');
const status = document.getElementById('upload-status');

onAuthStateChanged(auth, (user) => {
  if (!user && form) {
    // If not logged in, prompt to login
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Please login to upload a project.');
      window.location.href = 'login.html';
    });
  }
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const tech = document.getElementById('project-tech').value.split(',').map(s => s.trim()).filter(Boolean);
    const link = document.getElementById('project-link').value.trim();
    const fileInput = document.getElementById('project-image');
    const file = fileInput.files[0];

    status.innerText = 'Uploading...';

    try {
      let imageUrl = '';
      if (file) {
        const storageReference = storageRef(storage, `projects/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageReference, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const docRef = await addDoc(collection(db, 'projects'), {
        title,
        description,
        tech,
        link,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        author: auth.currentUser ? auth.currentUser.uid : null
      });

      status.innerText = 'Project uploaded successfully.';
      form.reset();
      // Optionally redirect to projects page
      setTimeout(() => window.location.href = 'projects.html', 1200);
    } catch (err) {
      console.error(err);
      status.innerText = 'Upload failed: ' + err.message;
    }
  });
}
