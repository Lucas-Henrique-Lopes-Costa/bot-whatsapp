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
    socket.emit('authenticated', '© BOT-LUCAS Autenticado!');
    socket.emit('message', '© BOT-LUCAS Autenticado!');
    console.log('© BOT-LUCAS Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-LUCAS Falha na autenticação, reiniciando...');
    console.error('© BOT-LUCAS Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-LUCAS Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-LUCAS Cliente desconectado!');
  console.log('© BOT-LUCAS Cliente desconectado', reason);
  client.initialize();
});
});


client.on('message', async msg => {

  const mediaPath = MessageMedia.fromFilePath('./saiba-mais.ogg');
  const mediaPath1 = MessageMedia.fromFilePath('./lucas.png');

  if (msg.body === 'Olá, tudo bem?') {
    let sections = [{title:'Olá, seja bem vinda!',rows:[
      {title:'Me manda um áudio', description: 'Você vai ser direcionado para conversar com uns de nossos especialistas'},
      {title:'Onde fica?', description: 'Enviaremos a localização e as informações adicionais'},
      {title:'Me manda foto', description: 'Enviarei mais informações de como trabalhamos aqui'}
    ]}];
    let list = new List('Bem vinda!!','Quero começar uma seção!',sections,'📅 Agenda!','©LUCAS');
    client.sendMessage(msg.from, list);
  }
  if (msg.body.includes('Me manda um áudio')) {
    client.sendMessage(msg.from, mediaPath, {sendAudioAsVoice: true});
  }
  if (msg.body.includes('Onde fica?')) {
    client.sendMessage(msg.from, "Nós nos localizamos aqui: https://www.google.com/");
  }
  if (msg.body.includes('Me manda foto')) {
    client.sendMessage(msg.from, mediaPath1, {caption: 'Esse sou eu ❤'});
  }
});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
});


// ESTRATÉGIA ZAP DAS GALÁXIAS
// ZDG © 2020
// www.zapdasgalaxias.com.br  