import { app, db } from './firebase.js'; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const auth = getAuth(app);
const storage = getStorage(app);

document.getElementById('cert-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const statusText = document.getElementById('upload-status');
  const btn = document.getElementById('submit-cert-btn');
  const user = auth.currentUser;

  // REMOVE THIS IF CHECK FOR DUMMY TESTING:
  if (!user) {
    statusText.innerText = "Error: You must be logged in to Firebase.";
    statusText.style.color = "#ef4444"; // red
    return; 
  }

  const platform = document.getElementById('cert-platform').value;
  const course = document.getElementById('cert-course').value;
  const link = document.getElementById('cert-link').value;
  const file = document.getElementById('cert-file').files[0];

  if (!file) return;

  btn.disabled = true;
  statusText.innerText = "Uploading file to secure storage...";
  statusText.style.color = "#94a3b8";

  try {
    const storageRef = ref(storage, `certificates/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    
    statusText.innerText = "Generating secure link...";
    const fileUrl = await getDownloadURL(uploadTask.ref);

    statusText.innerText = "Submitting to Mentor Queue...";
    await addDoc(collection(db, 'certificates'), {
      userId: user.uid,
      platform: platform,
      courseName: course,
      credentialUrl: link,
      fileUrl: fileUrl,
      status: 'pending', 
      submittedAt: serverTimestamp()
    });

    statusText.innerText = "Success! Your certificate is pending mentor review.";
    statusText.style.color = "#10b981"; // green
    document.getElementById('cert-upload-form').reset();

  } catch (error) {
    console.error("Upload failed", error);
    statusText.innerText = "Upload failed. Please try again.";
    statusText.style.color = "#ef4444";
  } finally {
    btn.disabled = false;
  }
});
