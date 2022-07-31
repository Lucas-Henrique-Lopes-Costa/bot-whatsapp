const { Client, LocalAuth, MessageMedia, List } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-whatsapp-server' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', '© BOT-LUCAS - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-LUCAS QRCode recebido, aponte a câmera seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '© BOT-LUCAS Dispositivo pronto!');
    socket.emit('message', '© BOT-LUCAS Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('© BOT-LUCAS Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-ZDG Autenticado!');
    socket.emit('message', '© BOT-ZDG Autenticado!');
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-LUCAS Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-LUCAS Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-ZDG Cliente desconectado!');
  console.log('© BOT-LUCAS Cliente desconectado', reason);
  client.initialize();
});
});


client.on('message', async msg => {

  const mediaPath = MessageMedia.fromFilePath('./saiba-mais.ogg');
  const mediaPath1 = MessageMedia.fromFilePath('./lucas.png');

  if (msg.body === 'lucas-bot') {
    let sections = [{title:'Olá bem vindo!',rows:[{title:'Agende o seu horário', description: 'Você vai ser direcionado para uma irá escolher o melhor horário para você'},{title:'Onde fica?', description: 'Enviaremos a localização e as informações adicionais'},{title:'Quero saber mais como é o seu negócio', description: 'Enviarei um áudio de como trabalhamos aqui'}]}];
    let list = new List('Bem vindo!!','Quero começar uma seção',sections,'📅 Agenda!','© BOT-LUCAS');
    client.sendMessage(msg.from, list);
  }
  if (msg.body.includes('Quero saber mais como é o seu negócio')) {
    client.sendMessage(msg.from, mediaPath, {sendAudioAsVoice: true});
  }
  if (msg.body.includes('Onde fica?')) {
    client.sendMessage(msg.from, "Nós nos localizamos aqui: https://www.google.com/");
  }
  if (msg.body.includes('Agende o seu horário')) {
    client.sendMessage(msg.from, mediaPath, {sendAudioAsVoice: true});
    client.sendMessage(msg.from, mediaPath1, {caption: 'Esse sou eu ❤'});
  }
 

});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
});


// ESTRATÉGIA ZAP DAS GALÁXIAS
// ZDG © 2020
// www.zapdasgalaxias.com.br  