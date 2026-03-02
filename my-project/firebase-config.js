// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCv12W_WPMdAGDWDJ6TPD5eoJSWTsqE6Eg",
  authDomain: "guinchorioclarosp.firebaseapp.com",
  projectId: "guinchorioclarosp",
  storageBucket: "guinchorioclarosp.firebasestorage.app",
  messagingSenderId: "959050454992",
  appId: "1:959050454992:web:f727b32975f0fa29300bd5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Serviços
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Exportar para uso global
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
