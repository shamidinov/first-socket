const express = require('express');
const socket = require('socket.io');
const http = require('http');
const ejs = require('ejs');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

const users = {};

const app = express();
const server = http.createServer(app);
const IO = socket(server);

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(express.static('static'));
app.use(cors());

IO.on('connection', (client) => {
  client.on('login', (username) => {
    users[username] = client.id;

    client.broadcast.emit('new_login', username);

    console.log(users);
  });

  client.on('send_message', (data) => {
    console.log('send_message', data, users[data.receiver]);

    client.to(users[data.receiver]).emit('receive_message', {
      from: data.from,
      message: data.message,
    });
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

server.listen(PORT, () => console.log(PORT));
