import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD91rWW1oII6l1R7vLxPWfjm8RGDKmPyO4",
  authDomain: "video-editor-fb918.firebaseapp.com",
  projectId: "video-editor-fb918",
  storageBucket: "video-editor-fb918.firebasestorage.app",
  messagingSenderId: "314231253118",
  appId: "1:314231253118:web:e563d453ff00d992ec902f",
  measurementId: "G-QLSHQ4HZBZ"
};

const _app = initializeApp(firebaseConfig);

export const auth = getAuth(_app);
