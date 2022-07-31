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
  authStrategy: new LocalAuth({ clientId: 'bot-zdg-server' }),
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
  socket.emit('message', '© BOT-ZDG - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-ZDG QRCode recebido, aponte a câmera seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('message', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('© BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-ZDG Autenticado!');
    socket.emit('message', '© BOT-ZDG Autenticado!');
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-ZDG Cliente desconectado!');
  console.log('© BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});


client.on('message', async msg => {

  const mediaPath = MessageMedia.fromFilePath('./jegue.ogg');
  const mediaPath1 = MessageMedia.fromFilePath('./biquini.jpg');
  const mediaPath2 = MessageMedia.fromFilePath('./nude.jpg');

  if (msg.body === 'lucas-bot') {
    let sections = [{title:'Olá bem vindo!',rows:[{title:'Agende o seu horário', description: 'você será redirecionado'},{title:'Foto de biquini', description: 'Eu quero'},{title:'Manda nude', description: 'Só se for agora'}]}];
    let list = new List('Tá na seca? Prazer meu nome é água.','1 copo 1/2 cheio',sections,'😻 Baba baby!','© Comunidade ZDG');
    client.sendMessage(msg.from, list);
  }
  if (msg.body.includes('Ouça minha voz')) {
    client.sendMessage(msg.from, mediaPath, {sendAudioAsVoice: true});
  }
  if (msg.body.includes('Foto de biquini')) {
    client.sendMessage(msg.from, mediaPath1, {caption: '🥰 Pedaço de mal caminho'});
  }
  if (msg.body.includes('Manda nude')) {
    client.sendMessage(msg.from, mediaPath2, {caption: '👿 Vem neném que aqui é Furacão 2000'});
  }

});

    
server.listen(port, function() {
        console.log('App running on *: ' + port);
});


// ESTRATÉGIA ZAP DAS GALÁXIAS
// ZDG © 2020
// www.zapdasgalaxias.com.br  