import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAUvEkbFq23p0AuX5nBfv2OOYbtf--GrxI",
    authDomain: "lunamercandise1.firebaseapp.com",
    projectId: "lunamercandise1",
    storageBucket: "lunamercandise1.firebasestorage.app",
    messagingSenderId: "881515097273",
    appId: "1:881515097273:web:a5fb328a1129392930ff68",
    measurementId: "G-0YTJYYWE24"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };