const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Permitir solicitações somente do Live Server
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir todos os métodos HTTP
    allowedHeaders: ['Content-Type', 'Authorization'] // Permitir os cabeçalhos necessários
  }));

// Middleware para analisar dados do formulário
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Rota para cadastrar um novo modelo
app.post('/cadastrar-modelo', (req, res) => {
    const novoModelo = req.body.novoModelo;
    const novoGrupo = req.body.novoGrupo;

    // Ler o arquivo XML
    fs.readFile(path.join(__dirname, 'armeiro_master', 'data', 'modelos.xml'), (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo XML:', err);
            return res.status(500).send('Erro ao processar a solicitação.');
        }

        // Converter XML para JSON
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao converter XML para JSON:', err);
                return res.status(500).send('Erro ao processar a solicitação.');
            }

            // Adicionar novo modelo ao JSON
            const novoModeloXml = {
                nome: novoModelo,
                pre: 'RAD' + (result.modelos.modelo.length + 1),
                grupo: novoGrupo
            };
            result.modelos.modelo.push(novoModeloXml);

            // Converter JSON de volta para XML
            const builder = new xml2js.Builder();
            const novoXml = builder.buildObject(result);

            // Escrever o novo XML no arquivo
            fs.writeFile(path.join(__dirname, 'armeiro_master', 'data', 'modelos.xml'), novoXml, (err) => {
                if (err) {
                    console.error('Erro ao escrever arquivo XML:', err);
                    return res.status(500).send('Erro ao processar a solicitação.');
                }

                console.log('Modelo cadastrado com sucesso:', novoModelo);
                res.send('Modelo cadastrado com sucesso!');
            });
        });
    });
});

// Rota para obter a lista de modelos
app.get('/modelos', (req, res) => {
    // Aqui você deve ler o arquivo modelos.xml ou acessar o banco de dados, dependendo de como os modelos são armazenados
    // Após obter os modelos, envie-os como resposta
    fs.readFile(path.join(__dirname, 'armeiro_master', 'data', 'modelos.xml'), (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo XML:', err);
            return res.status(500).send('Erro ao processar a solicitação.');
        }

        // Converter XML para JSON
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao converter XML para JSON:', err);
                return res.status(500).send('Erro ao processar a solicitação.');
            }

            // Extrair a lista de modelos do JSON
            const modelos = result.modelos.modelo.map(modelo => modelo.nome[0]);

            // Enviar os modelos como resposta
            res.json(modelos);
        });
    });
});

function ordenarRadiosPorRef(radios) {
    return radios.sort((a, b) => {
        return a.ref[0].localeCompare(b.ref[0]);
    });
}

// Rota para cadastrar um novo rádio
app.post('/cadastrar-radio', (req, res) => {
    const ref = req.body.cd_REF;
    const grupo = req.body.cd_Grupo;
    const modelo = req.body.cd_Modelo;
    const numeroSerie = req.body.cd_NumeroSerie;
    const bateria = req.body.cd_Bateria;
    const antena = req.body.cd_Antena;
    const situacao = req.body.cd_Situacao;
    const alteracao = req.body.cd_Alteracao;

    // Ler o arquivo XML
    fs.readFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo XML:', err);
            return res.status(500).send('Erro ao processar a solicitação.');
        }

        // Converter XML para JSON
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao converter XML para JSON:', err);
                return res.status(500).send('Erro ao processar a solicitação.');
            }

            
            // Verificar se há um array de radios dentro de materiais
            let radios;
            if (result && result.materiais && result.materiais.radio && Array.isArray(result.materiais.radio)) {
                radios = result.materiais.radio;
            } else {
                console.error('Nenhum rádio encontrado no XML. Adicionando novo rádio:', ref);
                result.materiais = { radio: [] }; // Criar uma nova lista de rádios
                radios = result.materiais.radio;
            }

            // Adicionar novo rádio ao XML
            const novoRadioXml = {
                ref: ref,
                grupo: grupo,
                modelo: modelo,
                ns: numeroSerie,
                bateria: bateria,
                antena: antena,
                situacao: situacao,
                alteracao: alteracao
            };
            radios.push(novoRadioXml);
            
            // Converter JSON de volta para XML
            const builder = new xml2js.Builder();
            let novoXml = builder.buildObject(result);

            // Escrever o novo XML no arquivo
            fs.writeFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), novoXml, (err) => {
                if (err) {
                    console.error('Erro ao escrever arquivo XML:', err);
                    return res.status(500).send('Erro ao processar a solicitação.');
                }

                console.log('Rádio cadastrado com sucesso:', ref);

                // Ler novamente o arquivo XML para ordenação
                fs.readFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), (err, newData) => {
                    if (err) {
                        console.error('Erro ao ler arquivo XML:', err);
                        return res.status(500).send('Erro ao processar a solicitação.');
                    }

                    // Converter XML para JSON
                    xml2js.parseString(newData, (err, newResult) => {
                        if (err) {
                            console.error('Erro ao converter XML para JSON:', err);
                            return res.status(500).send('Erro ao processar a solicitação.');
                        }

                        // Ordenar os rádios por ref
                        newResult.materiais.radio = ordenarRadiosPorRef(newResult.materiais.radio);

                        // Converter JSON de volta para XML
                        novoXml = builder.buildObject(newResult);

                        // Escrever o novo XML ordenado no arquivo
                        fs.writeFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), novoXml, (err) => {
                            if (err) {
                                console.error('Erro ao escrever arquivo XML:', err);
                                return res.status(500).send('Erro ao processar a solicitação.');
                            }

                            console.log('Rádio cadastrado e XML ordenado com sucesso:', ref);
                            res.send('Rádio cadastrado e XML ordenado com sucesso!');
                        });
                    });
                });
            });
        });
    });
});

// Adicione uma nova rota para lidar com a exclusão de rádio
app.delete('/excluir-radio/:ref', (req, res) => {
    const ref = req.params.ref;

    // Ler o arquivo XML
    fs.readFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo XML:', err);
            return res.status(500).send('Erro ao processar a solicitação.');
        }

        // Converter XML para JSON
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao converter XML para JSON:', err);
                return res.status(500).send('Erro ao processar a solicitação.');
            }

            // Encontrar e remover o rádio com a ref correspondente
            const radios = result.materiais.radio;
            const index = radios.findIndex(radio => radio.ref[0] === ref);
            if (index !== -1) {
                radios.splice(index, 1); // Remover o rádio do array
            }

            // Converter JSON de volta para XML
            const builder = new xml2js.Builder();
            const novoXml = builder.buildObject(result);

            // Escrever o novo XML no arquivo
            fs.writeFile(path.join(__dirname, 'armeiro_master', 'data', 'materiais.xml'), novoXml, (err) => {
                if (err) {
                    console.error('Erro ao escrever arquivo XML:', err);
                    return res.status(500).send('Erro ao processar a solicitação.');
                }

                console.log('Rádio excluído com sucesso:', ref);
                res.send('Rádio excluído com sucesso!');
            });
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
});


