import { getDatabase, ref, set, update, get, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
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

export { app, auth, database };

document.addEventListener('DOMContentLoaded', (event) => {
    let radiosData = {};
    let currentSortColumn = null;
    let isAscending = true;

    //Carregar informacoes do banco
    const readData = () => {
        get(ref(database, 'radios')).then((snapshot) => {
            if (snapshot.exists()) {
                radiosData = snapshot.val();
                updateTable();
                populateFilters();
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error('Error fetching data: ', error);
        });
    };
    
    //Fazer update da tabela para filtrar, favoritar e excluir rádios
    const updateTable = async (data = null) => {
        const tableBody = document.getElementById('corpo-tabela');
        tableBody.innerHTML = ''; 
      
        let radiosToDisplay = data ? data : []; 
        const filters = {
          ref: document.getElementById('filtroRef').value,
          grupo: document.getElementById('filtroGrupo').value,
          modelo: document.getElementById('filtroModelo').value,
          numeroSerie: document.getElementById('filtroNS').value,
          bateria: document.getElementById('filtroBateria').value,
          antena: document.getElementById('filtroAntena').value,
          situacao: document.getElementById('filtroSituacao').value,
          alteracao: document.getElementById('filtroAlteracao').value,
        };
      
        let sortedData = []; 
      
        if (currentSortColumn) {
          sortedData.sort((a, b) => {
            const fieldA = a[currentSortColumn] || '';
            const fieldB = b[currentSortColumn] || '';
            const comparison = fieldA.localeCompare(fieldB, 'en', { sensitivity: 'base' });
            return isAscending ? comparison : -comparison;
          });
        }
      
        const radiosRef = ref(database, 'radios');
        const snapshot = await get(radiosRef);
      
        if (snapshot.exists()) {
          radiosData = snapshot.val();
          radiosToDisplay = Object.keys(radiosData).map(key => ({ id: key, ...radiosData[key] }));
      
        //Aplicar filtros selecionados
          for (let radio of radiosToDisplay) {
            if (
              (filters.ref && filters.ref !== radio.id) ||
              (filters.grupo && filters.grupo !== radio.group) ||
              (filters.modelo && filters.modelo !== radio.model) ||
              (filters.numeroSerie && filters.numeroSerie !== radio.serialNumber) ||
              (filters.bateria && filters.bateria !== radio.battery) ||
              (filters.antena && filters.antena !== radio.antenna) ||
              (filters.situacao && filters.situacao !== radio.status) ||
              (filters.alteracao && filters.alteracao !== radio.alteration)
            ) {
              continue;
            }
      
            // Criar linhas da tabela
            let row = tableBody.insertRow();
            row.insertCell(0).textContent = radio.id;
            row.insertCell(1).textContent = radio.group;
            row.insertCell(2).textContent = radio.model;
            row.insertCell(3).textContent = radio.serialNumber;
            row.insertCell(4).textContent = radio.battery;
            row.insertCell(5).textContent = radio.antenna;
            row.insertCell(6).textContent = radio.status;
            row.insertCell(7).textContent = radio.alteration;
      
            // Adicionar botões Excluir e Favoritar
            let btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'me-1');
            btnExcluir.onclick = () => excluirRadio(radio.id);
            row.insertCell(8).appendChild(btnExcluir);
      
            let btnFavorito = document.createElement('button');
            btnFavorito.classList.add('btn', 'btn-sm', 'me-1', 'p-0', 'border-0', 'bg-transparent');
            btnFavorito.innerHTML = radio.favorito ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-warning"></i>';
            btnFavorito.onclick = () => favoritarRadio(radio.id);
            row.insertCell(9).appendChild(btnFavorito);
          }
        } else {
          console.log("No data available");
        }
      };
    

    const sortByColumn = (columnName) => {
        if (columnName === currentSortColumn) {
            isAscending = !isAscending;
        } else {
            currentSortColumn = columnName;
            isAscending = true;
        }
        updateTable(); // Atualiza a tabela após alterar a ordenação
    };

    const sortByFavorite = (order) => {
        let sortedData = Object.keys(radiosData).map(key => ({ id: key, ...radiosData[key] }));
        sortedData.sort((a, b) => {
            const isFavA = a.favorito || false;
            const isFavB = b.favorito || false;
            return order === 'asc' ? isFavA - isFavB : isFavB - isFavA;
        });
        updateTable(sortedData); // Atualiza a tabela com os dados ordenados por favorito
    };

    // Listener para o botão de Ordenar
    document.getElementById('bt_ordenar').addEventListener('click', () => {
        const ordenarPor = document.getElementById('ordenarPor').value;
        const ordem = document.getElementById('ordem').value;
        if (ordenarPor === 'favorito') {
            sortByFavorite(ordem);
        } else {
            sortByColumn(ordenarPor.toLowerCase()); // Converte para minúsculas para compatibilidade
        }
    });

    // Adiciona listeners para ordenação ao clicar no cabeçalho da tabela
    document.querySelectorAll('#tabela th').forEach(header => {
        header.addEventListener('click', () => {
            const columnName = header.textContent.trim();
            sortByColumn(columnName.toLowerCase()); // Converte para minúsculas para compatibilidade
        });
    });

    // Função para preencher os filtros com valores únicos dos dados
    const populateFilters = () => {
        const refs = new Set();
        const grupos = new Set();
        const modelos = new Set();
        const numerosSerie = new Set();
        const baterias = new Set();
        const antenas = new Set();
        const situacoes = new Set();
        const alteracoes = new Set();

        for (let id in radiosData) {
            refs.add(id);
            grupos.add(radiosData[id].group);
            modelos.add(radiosData[id].model);
            numerosSerie.add(radiosData[id].serialNumber);
            baterias.add(radiosData[id].battery);
            antenas.add(radiosData[id].antenna);
            situacoes.add(radiosData[id].status);
            alteracoes.add(radiosData[id].alteration);
        }

        fillFilter('filtroRef', refs);
        fillFilter('filtroGrupo', grupos);
        fillFilter('filtroModelo', modelos);
        fillFilter('filtroNS', numerosSerie);
        fillFilter('filtroBateria', baterias);
        fillFilter('filtroAntena', antenas);
        fillFilter('filtroSituacao', situacoes);
        fillFilter('filtroAlteracao', alteracoes);
    };

    // Função para preencher um filtro com valores
    const fillFilter = (filterId, values) => {
        const filter = document.getElementById(filterId);
        filter.innerHTML = `<option value="">${filter.options[0].text}</option>`;
        values.forEach(value => {
            filter.innerHTML += `<option value="${value}">${value}</option>`;
        });
    };

    // Função para excluir um rádio
    const excluirRadio = (id) => {
        remove(ref(database, 'radios/' + id)).then(() => {
            readData(); // Atualiza a tabela após excluir
            alert('Rádio excluído com sucesso!');
        }).catch((error) => {
            console.error('Erro ao excluir rádio: ', error);
        });
    };

    // Função para favoritar um rádio
    const favoritarRadio = (id) => {
        const radioRef = ref(database, 'radios/' + id);
        const radio = radiosData[id];
        update(radioRef, {
            favorito: !radio.favorito
        }).then(() => {
            readData(); // Atualiza a tabela após favoritar
            alert(`Rádio ${radio.favorito ? 'des' : ''}favoritado com sucesso!`);
        }).catch((error) => {
            console.error('Erro ao favoritar rádio: ', error);
        });
    };

    // Adiciona listeners para os filtros
    document.querySelectorAll('.filtro-dropdown').forEach(filter => {
        filter.addEventListener('change', updateTable);
    });



    // Função para exportar dados da tabela para CSV
    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Ref.,Grupo,Modelo,Número de Série,Bateria,Antena,Situação,Alteração\n"; // Adiciona cabeçalhos

        for (let id in radiosData) {
            const radio = radiosData[id];
            csvContent += `${id},${radio.group},${radio.model},${radio.serialNumber},${radio.battery},${radio.antenna},${radio.status},${radio.alteration}\n`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "radios.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Adiciona listener ao botão de exportar
    document.getElementById('bt_exportar').addEventListener('click', exportToCSV);

    // Chama a função para ler dados
    readData();

    // Função de logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth).then(() => {
          alert("Logout realizado com sucesso.");
          window.location.href = "index.html";
        }).catch((error) => {
          alert("Falha ao fazer logout: " + error.message);
        });
    });
});