const GuacamoleLite = require('guacamole-lite');
const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const PORT = 8080;

const guacdOptions = {
  port: 4822 // port of guacd
};

const clientOptions = {
  crypt: {
      cypher: 'AES-256-CBC',
      key: 'MySuperSecretKeyForParamsToken12'
  },
  log: {
    level: 'NORMAL',
    stdLog: (...args) => {
        console.log('[MyLog]', ...args)
    },
    errorLog: (...args) => {
        console.error('[MyLog]', ...args)
    }
}
};

const guacServer = new GuacamoleLite({server}, guacdOptions, clientOptions);

server.listen(PORT, () => {
  console.log(`Listen : ${PORT}`);
});

