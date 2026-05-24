// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAciNY2r-wLxhnraOOPpQbg39LMTFn4nEI",
  authDomain: "webfinalproject-ef3ea.firebaseapp.com",
  databaseURL: "https://webfinalproject-ef3ea-default-rtdb.firebaseio.com",
  projectId: "webfinalproject-ef3ea",
  storageBucket: "webfinalproject-ef3ea.appspot.com",
  messagingSenderId: "672209298527",
  appId: "1:672209298527:web:95391ccadc5b5396c267ea",
  measurementId: "G-BJLQTBCC2K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
