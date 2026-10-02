const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;

createApp().listen(port, () => {
  console.log(`Tasks API sur http://localhost:${port} — documentation : http://localhost:${port}/docs`);
});
