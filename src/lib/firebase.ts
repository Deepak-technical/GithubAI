// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCa4pcWrIB_8vfvL_XrZ_3B5ZfuH2xBf_U",
//   authDomain: "githubai-22cf8.firebaseapp.com",
//   projectId: "githubai-22cf8",
//   storageBucket: "githubai-22cf8.appspot.com",
//   messagingSenderId: "983859899577",
//   appId: "1:983859899577:web:6fad61757235045b083f68",
//   measurementId: "G-YPD07BDNTW"
// };
const firebaseConfig = {
  apiKey: "AIzaSyBUhohsuTIsBwyYxMZsyF7yrTKNEcxYb1A",
  authDomain: "githubai-b73e9.firebaseapp.com",
  projectId: "githubai-b73e9",
  storageBucket: "githubai-b73e9.firebasestorage.app",
  messagingSenderId: "252898339982",
  appId: "1:252898339982:web:d46fdd7ab0867186b56ddf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (setProgress) setProgress(progress);
        
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, (error: any) => {
        reject(error);
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
          resolve(downloadUrl);
        });
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
