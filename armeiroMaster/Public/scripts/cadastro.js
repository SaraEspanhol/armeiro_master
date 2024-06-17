import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6goEHoCNPt2Cs-ficvW5qa5wYQ37rW9Y",
  authDomain: "armeiromaster2024.firebaseapp.com",
  databaseURL: "https://armeiromaster2024-default-rtdb.firebaseio.com",
  projectId: "armeiromaster2024",
  storageBucket: "armeiromaster2024.appspot.com",
  messagingSenderId: "884269287845",
  appId: "1:884269287845:web:f206738986deb99742804c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);



function cadastrarRadio() {
  const refValue = document.getElementById('cd_REF').value;
  const groupValue = document.getElementById('cd_Grupo').value;
  const modelValue = document.getElementById('cd_Modelo').value;
  const batteryValue = document.getElementById('cd_Bateria').value;
  const serialNumberValue = document.getElementById('cd_NumeroSerie').value;
  const antennaValue = document.getElementById('cd_Antena').value;
  const statusValue = document.getElementById('cd_Situacao').value;
  const alterationValue = document.getElementById('cd_Alteracao').value;

  const radioRef = ref(database, 'radios/' + refValue);
  set(radioRef, {
    ref: refValue,
    group: groupValue,
    model: modelValue,
    battery: batteryValue,
    serialNumber: serialNumberValue,
    antenna: antennaValue,
    status: statusValue,
    alteration: alterationValue
  }).then(() => {
    alert("Rádio cadastrado com sucesso!");
  }).catch((error) => {
    alert("Falha ao cadastrar rádio: " + error.message);
  });
}

function atualizarRadio() {
  const refValue = document.getElementById('cd_REF').value;
  const groupValue = document.getElementById('cd_Grupo').value;
  const modelValue = document.getElementById('cd_Modelo').value;
  const batteryValue = document.getElementById('cd_Bateria').value;
  const serialNumberValue = document.getElementById('cd_NumeroSerie').value;
  const antennaValue = document.getElementById('cd_Antena').value;
  const statusValue = document.getElementById('cd_Situacao').value;
  const alterationValue = document.getElementById('cd_Alteracao').value;

  const radioRef = ref(database, 'radios/' + refValue);
  update(radioRef, {
    group: groupValue,
    model: modelValue,
    battery: batteryValue,
    serialNumber: serialNumberValue,
    antenna: antennaValue,
    status: statusValue,
    alteration: alterationValue
  }).then(() => {
    alert("Rádio atualizado com sucesso!");
  }).catch((error) => {
    alert("Falha ao atualizar rádio: " + error.message);
  });
}

function readData() {
  const refValue = document.getElementById('cd_REF').value;
  const radioRef = ref(database, 'radios/' + refValue);

  get(radioRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById('cd_Grupo').value = data.group;
      document.getElementById('cd_Modelo').value = data.model;
      document.getElementById('cd_Bateria').value = data.battery;
      document.getElementById('cd_NumeroSerie').value = data.serialNumber;
      document.getElementById('cd_Antena').value = data.antenna;
      document.getElementById('cd_Situacao').value = data.status;
      document.getElementById('cd_Alteracao').value = data.alteration;
    } else {
      alert("Nenhum dado encontrado para esta referência.");
    }
  }).catch((error) => {
    alert("Falha ao buscar dados: " + error.message);
  });
}

document.getElementById('bt_Cadastrar').addEventListener('click', cadastrarRadio);
document.getElementById('bt_atualizar').addEventListener('click', atualizarRadio);

document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => {
    alert("Logout realizado com sucesso.");
    window.location.href = "index.html";
  }).catch((error) => {
    alert("Falha ao fazer logout: " + error.message);
  });
});
