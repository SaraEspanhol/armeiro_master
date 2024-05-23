// Funcao para carregar um XML generico
function loadXML(url, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        callback(this);
    }
    xhttp.open("GET", url);
    xhttp.send();
}

// Funcao para preencher Dropdowns
function preencherDropdown(xmlDoc, dropdown, tagName) {
    dropdown.innerHTML = "";
    
    const options = xmlDoc.getElementsByTagName(tagName);
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent;
        const option = new Option(optionText, optionText);
        dropdown.appendChild(option);
    }
}

// Carregar o XML de Modelos
function loadModelos() {
    loadXML("data/modelos.xml", processarModelosDropdown);
}

// Carregar o XML de Materiais
function loadMateriais() {
    loadXML("data/materiais.xml", myFunction);
}

function processarModelos(xml) {
    const xmlDoc = xml.responseXML;
    const selectModelo = document.getElementById("Modelo");
    preencherDropdown(xmlDoc, selectModelo, "nome");
    
    // Adicionar evento de mudança ao select de modelos
    selectModelo.addEventListener('change', function() {
        console.log("Modelo selecionado:", this.value);
        // Chamar a função atualizarREFeGrupo() passando o valor do modelo selecionado como argumento
        atualizarREFeGrupo(this.value);
    });
}

function processarMateriais(xml) {
    const xmlDoc = xml.responseXML;
    const radios = xmlDoc.getElementsByTagName("radio");

    let maxRef = 0;
    for (let i = 0; i < radios.length; i++) {
        const ref = parseInt(radios[i].getElementsByTagName("ref")[0].textContent.replace("RAD", ""));
        if (ref > maxRef) {
            maxRef = ref;
        }
    }
}

// Carregar os XMLs ao carregar a página
window.onload = function() {
    loadMateriais();
    loadModelos();
};

const radioIDs = new Set();

function myFunction(xml) {
    const xmlDoc = xml.responseXML;
    const radios = xmlDoc.getElementsByTagName("radio");

    let table = "";
    for (let i = 0; i < radios.length; i++) {

        const ref = radios[i].getElementsByTagName("ref")[0].textContent;
        
        // Verificar se o ID do rádio já foi adicionado à tabela
        if (radioIDs.has(ref)) {
            continue;
        }
        
        // Adicionar o ID do rádio ao conjunto
        radioIDs.add(ref);

        table += "<tr>";
        table += "<td data-col='filtroRef'>" + radios[i].getElementsByTagName("ref")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroGrupo'>" + radios[i].getElementsByTagName("grupo")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroModelo'>" + radios[i].getElementsByTagName("modelo")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroNS'>" + radios[i].getElementsByTagName("ns")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroBateria'>" + radios[i].getElementsByTagName("bateria")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroAntena'>" + radios[i].getElementsByTagName("antena")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroSituacao'>" + radios[i].getElementsByTagName("situacao")[0].childNodes[0].nodeValue + "</td>";
        table += "<td data-col='filtroAlteracao'>" + radios[i].getElementsByTagName("alteracao")[0].childNodes[0].nodeValue + "</td>";
        table += "<td><button class='btn-lixeira' data-ref='" + ref + "'>Excluir</button></td>";
        table += "<td><button class='btn-favorito' class data-ref='" + ref + "'>Favorito</button></td>";
        table += "</tr>";
    }
    document.getElementById("corpo-tabela").innerHTML = "";
    document.getElementById("corpo-tabela").innerHTML = table;

    const btnLixeiraList = document.querySelectorAll('.btn-lixeira');

    btnLixeiraList.forEach(btn => {
        btn.addEventListener('click', function() {
            const ref = this.getAttribute('data-ref');
            excluirRadio(ref);
        });
    });

    // Armazenar os valores dos filtros
    const refSet = new Set();
    const grupoSet = new Set();
    const modeloSet = new Set();
    const nsSet = new Set();
    const bateriaSet = new Set();
    const antenaSet = new Set();
    const situacaoSet = new Set();
    const alteracaoSet = new Set();
    
    for (let i = 0; i < radios.length; i++) {
        refSet.add(radios[i].getElementsByTagName("ref")[0].textContent);
        grupoSet.add(radios[i].getElementsByTagName("grupo")[0].textContent);
        modeloSet.add(radios[i].getElementsByTagName("modelo")[0].textContent);
        nsSet.add(radios[i].getElementsByTagName("ns")[0].textContent);
        bateriaSet.add(radios[i].getElementsByTagName("bateria")[0].textContent);
        antenaSet.add(radios[i].getElementsByTagName("antena")[0].textContent);
        situacaoSet.add(radios[i].getElementsByTagName("situacao")[0].textContent);
        alteracaoSet.add(radios[i].getElementsByTagName("alteracao")[0].textContent);
    }
    
    preencherDropdownComSet(refSet, "filtroRef");
    preencherDropdownComSet(grupoSet, "filtroGrupo");
    preencherDropdownComSet(modeloSet, "filtroModelo");
    preencherDropdownComSet(nsSet, "filtroNS");
    preencherDropdownComSet(bateriaSet, "filtroBateria");
    preencherDropdownComSet(antenaSet, "filtroAntena");
    preencherDropdownComSet(situacaoSet, "filtroSituacao");
    preencherDropdownComSet(alteracaoSet, "filtroAlteracao");

    // Ouvintes dos filtros
    document.getElementById('filtroRef').addEventListener('change', filtrarTabela);
    document.getElementById('filtroGrupo').addEventListener('change', filtrarTabela);
    document.getElementById('filtroModelo').addEventListener('change', filtrarTabela);
    document.getElementById('filtroNS').addEventListener('change', filtrarTabela);
    document.getElementById('filtroBateria').addEventListener('change', filtrarTabela);
    document.getElementById('filtroAntena').addEventListener('change', filtrarTabela);
    document.getElementById('filtroSituacao').addEventListener('change', filtrarTabela);
    document.getElementById('filtroAlteracao').addEventListener('change', filtrarTabela);
}

// Listener das lixeiras
document.addEventListener('DOMContentLoaded', function() { 
    document.querySelectorAll('.btn-lixeira').forEach(btn => {
        console.log(btn); // Verifique se os botões estão sendo selecionados corretamente
        btn.addEventListener('click', function() {
            console.log("Botão lixeira clicado"); // Verifique se a função é chamada quando um botão é clicado
            const ref = this.getAttribute('data-ref');
            excluirRadio(ref);
        });
    });
});

function excluirRadio(ref) {
    console.log("Excluindo rádio com ref:", ref); // Verifique se a função é chamada com o ref correto
    // Enviar uma solicitação DELETE para a rota /excluir-radio/:ref no servidor
    fetch('http://127.0.0.1:3000/excluir-radio/' + ref, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao excluir o rádio.');
        }
        console.log('Rádio excluído com sucesso.');

        // Remover a linha correspondente à rádio excluído da tabela
        const tableRow = document.querySelector('tr[data-ref="' + ref + '"]');
        if (tableRow) {
            tableRow.remove();
        }
    })
    .catch(error => {
        console.error('Erro ao excluir o rádio:', error.message);
    });
}


function preencherDropdownComSet(valores, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    
    // Adicionar uma opção para cada valor no conjunto
    valores.forEach(function(valor) {
        const option = new Option(valor, valor);
        dropdown.appendChild(option);
    });
}

// Função para filtrar a tabela com base nos filtros selecionados
function filtrarTabela() {
    const filtros = {
        'filtroRef': document.getElementById('filtroRef').value.toUpperCase(),
        'filtroGrupo': document.getElementById('filtroGrupo').value.toUpperCase(),
        'filtroModelo': document.getElementById('filtroModelo').value.toUpperCase(),
        'filtroNS': document.getElementById('filtroNS').value.toUpperCase(),
        'filtroBateria': document.getElementById('filtroBateria').value.toUpperCase(),
        'filtroAntena': document.getElementById('filtroAntena').value.toUpperCase(),
        'filtroSituacao': document.getElementById('filtroSituacao').value.toUpperCase(),
        'filtroAlteracao': document.getElementById('filtroAlteracao').value.toUpperCase(),
    };

    console.log(filtros);

    const todasLinhas = document.querySelectorAll("#corpo-tabela tr");

    todasLinhas.forEach(function(linha) {
        let mostrar = true;
    
        for (let key in filtros) {
            const valorFiltro = filtros[key];
    
            if (valorFiltro !== '') {
                const indiceColuna = Array.from(linha.children).findIndex(cell => cell.getAttribute('data-col') === key);
    
                if (indiceColuna !== -1) {
                    const textoCelula = linha.children[indiceColuna].textContent.toUpperCase();

                    if (!textoCelula.includes(valorFiltro)) {
                        mostrar = false;
                        break;
                    }
                }
            }
        }
        
        linha.style.display = mostrar ? "" : "none";
    });
    
}

// Função para exportar o XML filtrado
function exportarTabela() {
    const tabelaFiltrada = document.querySelectorAll("#corpo-tabela tr");

    // Inicializar uma string para armazenar os dados CSV
    let csv = "REF,Grupo,Modelo,Número de Série,Bateria,Antena,Situação,Alteração\n";

    // Adicionar no CSV as linhas da tabela filtrada
    tabelaFiltrada.forEach(function(linha) {
        if (linha.style.display !== "none") {
            const celulas = linha.querySelectorAll("td");
            celulas.forEach(function(celula, index) {
                csv += celula.textContent;
                if (index < celulas.length - 1) {
                    csv += ",";
                }
            });
            csv += "\n";
        }
    });

    // Fazer o Download do arquivo CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'tabela_filtrada.csv';
    link.click();

    alert("Tabela exportada com sucesso!");
}

// Listener do Clique do Botão Exportar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bt_exportar').addEventListener('click', exportarTabela);
});

// FUNÇÕES DE CADASTRO DE NOVOS RÁDIOS


// Função para cadastrar um novo modelo de rádio
function cadastrarNovoModelo() {
    // Obter os valores inseridos pelo usuário
    const novoModelo = document.getElementById('cd_novoModelo').value;
    const novoGrupo = document.getElementById('cd_novoGrupo').value;

    // Verificar se os campos foram preenchidos
    if (novoModelo.trim() === '' || novoGrupo === 'Grupo') {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Construir o objeto com os dados do novo modelo
    const data = {
        novoModelo: novoModelo,
        novoGrupo: novoGrupo
    };

    // Enviar uma solicitação POST para o servidor
    fetch('http://localhost:3000/cadastrar-modelo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao cadastrar modelo');
        }
        return response.json();
    })
    .then(data => {
        console.log('Modelo cadastrado com sucesso:', data);
        alert('Novo modelo cadastrado com sucesso.');
    })
    .catch(error => {
        console.error('Erro ao cadastrar modelo:', error);
        alert('Erro ao cadastrar novo modelo. Por favor, tente novamente mais tarde.');
    });
}

// Adicionar um evento de clique ao botão de cadastrar novo modelo
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bt_CadastrarModelo').addEventListener('click', cadastrarNovoModelo);
});

let xmlDocModelos;

// Função para processar o XML dos modelos apenas para preenchimento do dropdown cd_Modelo
function processarModelosDropdown(xml) {
    xmlDocModelos = xml.responseXML;
    const selectModelo = document.getElementById("cd_Modelo");
    preencherDropdown(xmlDocModelos, selectModelo, "nome");

    // Adicionar evento de mudança ao select de modelos
    selectModelo.addEventListener('change', function() {
        console.log("Modelo selecionado:", this.value);
        processarMateriais(xml);
    });
}

// Adicionar um ouvinte de evento de mudança ao dropdown cd_Modelo
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('cd_Modelo').addEventListener('change', function() {

        // Obter o valor selecionado no dropdown cd_Modelo
        const selectedModelo = this.value;

        // Realizar a lógica para encontrar a referência (REF) e o grupo correspondentes ao modelo selecionado
        const modelos = xmlDocModelos.getElementsByTagName('modelo');

        let ref;
        let grupo;

        // Procurar pelo modelo selecionado no XML dos modelos
        for (let i = 0; i < modelos.length; i++) {
            const nomeModelo = modelos[i].getElementsByTagName('nome')[0].textContent;
            if (nomeModelo === selectedModelo) {
                ref = modelos[i].getElementsByTagName('pre')[0].textContent;
                grupo = modelos[i].getElementsByTagName('grupo')[0].textContent;
                break;
            }
        }

        // Atualizar os valores dos campos cd_REF e cd_Grupo
        document.getElementById('cd_REF').value = ref;
        document.getElementById('cd_Grupo').value = grupo;

    });
});

function cadastrarNovoRadio() {
    // Obter os valores inseridos pelo usuário
    const modelo = document.getElementById('cd_Modelo').value;
    const grupo = document.getElementById('cd_Grupo').value;
    const ref = document.getElementById('cd_REF').value;
    const numeroSerie = document.getElementById('cd_NumeroSerie').value;
    const bateria = document.getElementById('cd_Bateria').value;
    const antena = document.getElementById('cd_Antena').value;
    const situacao = document.getElementById('cd_Situacao').value;
    const alteracao = document.getElementById('cd_Alteracao').value;

    // Verificar se os campos obrigatórios foram preenchidos
    if (modelo.trim() === '' || grupo === 'Grupo' || ref.trim() === '' || numeroSerie.trim() === '' || bateria === 'Status da Bateria' || antena === 'Status da Antena' || situacao === 'Situação') {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Construir o objeto com os dados do novo rádio
    const data = {
        cd_Modelo: modelo,
        cd_Grupo: grupo,
        cd_REF: ref,
        cd_NumeroSerie: numeroSerie,
        cd_Bateria: bateria,
        cd_Antena: antena,
        cd_Situacao: situacao,
        cd_Alteracao: alteracao
    };

    // Enviar uma solicitação POST para o servidor
    fetch('http://localhost:3000/cadastrar-radio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao cadastrar novo rádio');
        }
        return response.json();
    })
    .then(data => {
        console.log('Rádio cadastrado com sucesso:', data);
        alert('Novo rádio cadastrado com sucesso.');
    })
    .catch(error => {
        console.error('Erro ao cadastrar novo rádio:', error);
        alert('Erro ao cadastrar novo rádio. Por favor, tente novamente mais tarde.');
    });
}

// Adicionar um evento de clique ao botão de cadastrar novo radio
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bt_Cadastrar').addEventListener('click', cadastrarNovoRadio);
});