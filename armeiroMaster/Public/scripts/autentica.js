// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6goEHoCNPt2Cs-ficvW5qa5wYQ37rW9Y",
    authDomain: "armeiromaster2024.firebaseapp.com",
    databaseURL: "https://armeiromaster2024-default-rtdb.firebaseio.com",
    projectId: "armeiromaster2024",
    storageBucket: "armeiromaster2024",
    messagingSenderId: "884269287845",
    appId: "1:884269287845:web:f206738986deb99742804c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    
    // Obtém os elementos do formulário
    const authForm = document.getElementById('auth-form');
    const message = document.getElementById('message');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminControls = document.getElementById('admin-controls');

    // Função para criar um novo usuário
    const signUp = (email, password) => {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Salva os dados do usuário no banco de dados
                firebase.database().ref('users/' + user.uid).set({
                    email: email,
                    type: 'user' // Define o tipo de usuário como padrão 'user'
                });
                message.textContent = 'Usuário criado com sucesso: ' + user.email;
                displayWelcomeMessage(user);
            })
            .catch((error) => {
                const errorMessage = error.message;
                message.textContent = 'Erro: ' + errorMessage;
            });
    };

    // Função para fazer login de usuário
    const login = (email, password) => {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                checkUserType(user.uid);
                displayWelcomeMessage(user);
            })
            .catch((error) => {
                const errorMessage = error.message;
                message.textContent = 'Erro: ' + errorMessage;
            });
    };

    // Função para verificar o tipo de usuário
    const checkUserType = (uid) => {
        const userRef = database.ref('users/' + uid);
        userRef.once('value').then((snapshot) => {
            const userType = snapshot.val().type;
            if (userType === 'admin') {
                adminControls.style.display = 'block';
                inicioLink.style.display = 'none'; // Esconde o link "Início" para administradores
            } else {
                adminControls.style.display = 'none';
                inicioLink.style.display = 'block'; // Mostra o link "Início" para usuários não administradores
            }
        });
    };

    // Função para exibir a mensagem de boas-vindas e redirecionar o usuário
    const displayWelcomeMessage = (user) => {
        message.textContent = '';
        welcomeMessage.innerHTML = `
            Bem-vindo, ${user.displayName || user.email}!<br>
        `;

        // Atualiza visibilidade do link "Início" no menu de navegação
        const uid = user.uid;
        checkUserType(uid);
    };


    // Adiciona ouvintes de evento aos botões
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signUp(email, password);
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    // Observador de estado de autenticação
    auth.onAuthStateChanged((user) => {
        if (user) {
            const uid = user.uid;
            console.log('Usuário logado com UID:', uid);
            checkUserType(uid);
            displayWelcomeMessage(user);
        } else {
            console.log('Usuário deslogado');
            adminControls.style.display = 'none';
        }
    });

    // Função para login com Google
    const loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                checkUserType(user.uid);
                displayWelcomeMessage(user);
            })
            .catch((error) => {
                const errorMessage = error.message;
                message.textContent = 'Erro: ' + errorMessage;
            });
    };

    googleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginWithGoogle();
    });

    // Função de logout
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            const message = document.getElementById('message');
            if (message) {
                message.textContent = 'Usuário deslogado com sucesso.';
            }

            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = '';

                // Remover outros elementos que precisam ser limpos ao deslogar
                const inicioBtnContainer = document.getElementById('inicioBtnContainer');
                if (inicioBtnContainer) {
                    inicioBtnContainer.innerHTML = ''; // Limpa o contêiner
                }
            }
            
            // Esconder controles de administrador ao deslogar
            const adminControls = document.getElementById('admin-controls');
            if (adminControls) {
                adminControls.style.display = 'none';
            }
        }).catch((error) => {
            const message = document.getElementById('message');
            if (message) {
                message.textContent = 'Erro ao deslogar: ' + error.message;
            }
        });
    });
});
