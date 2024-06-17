

const firebaseConfig = {
    apiKey: "AIzaSyA6goEHoCNPt2Cs-ficvW5qa5wYQ37rW9Y",
    authDomain: "armeiromaster2024.firebaseapp.com",
    databaseURL: "https://armeiromaster2024-default-rtdb.firebaseio.com",
    projectId: "armeiromaster2024",
    storageBucket: "armeiromaster2024.appspot.com",
    messagingSenderId: "884269287845",
    appId: "1:884269287845:web:f206738986deb99742804c"
};
  
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();



    // Função de logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth).then(() => {
          alert("Logout realizado com sucesso.");
          window.location.href = "index.html";
        }).catch((error) => {
          alert("Falha ao fazer logout: " + error.message);
        });
    });

    document.getElementById('bt_enviar').addEventListener('click', () => {
        const email = document.getElementById('cd_email').value;
        const category = document.getElementById('cd_categoria').value;
        const description = document.getElementById('cd_descricao').value;

        database.ref('messages').push({
            email: email,
            category: category,
            description: description,
            timestamp: new Date().toISOString()
        })
        .then(() => {
            alert('Mensagem enviada com sucesso!');
        })
        .catch((error) => {
            console.error('Erro ao enviar mensagem: ', error);
        });
    });