const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Crear una instancia de Express
const app = express();
app.use(express.json()); // Middleware para manejar JSON en las solicitudes
app.use(cors()); // Middleware para permitir CORS

// Crear un servidor HTTP y una instancia de Socket.IO
const servidorHttp = createServer(app);
const io = new Server(servidorHttp, {
  path: "/tiempo-real",
  cors: {
    origin: "*", // Permitir solicitudes desde cualquier origen
  },
});

const juegos = {}; // Objeto para almacenar los juegos y sus datos

// Manejar las conexiones de Socket.IO
io.on("connection", (socket) => {
  let idJuegoActual = null; // Variable para almacenar el ID del juego actual del socket

  // Manejar el evento para que un jugador se una a un juego
  socket.on("unirseJuego", (datos) => {
    const { idJuego, apodo } = datos; // Extraer ID del juego y apodo del jugador
    idJuegoActual = idJuego; // Actualizar el ID del juego actual

    if (!juegos[idJuego]) {
      juegos[idJuego] = { jugadores: [] }; // Crear un nuevo juego si no existe
    }

    juegos[idJuego].jugadores.push({ id: socket.id, apodo }); // Agregar el jugador al juego
    socket.join(idJuego); // Unir el socket a la sala del juego

    console.log(`El jugador ${apodo} se unió al juego ${idJuego}`);
    console.log(`Jugadores en el juego ${idJuego}:`, juegos[idJuego].jugadores);

    io.to(idJuego).emit("jugadorUnido", juegos[idJuego]); // Notificar a todos los jugadores en el juego
  });

  // Manejar el evento para iniciar el juego
  socket.on("iniciarJuego", () => {
    console.log(`Intentando iniciar el juego ${idJuegoActual}`);
    if (idJuegoActual && juegos[idJuegoActual].jugadores.length > 1) {
      // Seleccionar un Marco aleatorio entre los jugadores
      juegos[idJuegoActual].marco = juegos[idJuegoActual].jugadores[Math.floor(Math.random() * juegos[idJuegoActual].jugadores.length)];
      
      console.log(`El juego ha comenzado. Marco es: ${juegos[idJuegoActual].marco.apodo}`);
      
      const idSocketMarco = juegos[idJuegoActual].marco.id;
      // Notificar al Marco y a los otros jugadores que el juego ha comenzado
      io.to(idSocketMarco).emit("juegoIniciado", { marco: juegos[idJuegoActual].marco, jugadores: juegos[idJuegoActual].jugadores });
      io.to(idJuegoActual).emit("juegoIniciadoParaOtros", { mensaje: "El juego ha comenzado." });
    } else {
      // Emitir error si no hay suficientes jugadores
      socket.emit("error", { mensaje: "No hay suficientes jugadores para iniciar el juego." });
    }
  });

  // Manejar el evento para notificar que el Marco ha hablado
  socket.on("notificarMarco", () => {
    if (idJuegoActual && juegos[idJuegoActual].marco) {
      const jugadoresPolo = juegos[idJuegoActual].jugadores.filter(jugador => jugador.id !== juegos[idJuegoActual].marco.id);
      // Notificar a los jugadores Polo disponibles
      io.to(juegos[idJuegoActual].marco.id).emit("mostrarPolo", { jugadores: jugadoresPolo });
      io.to(idJuegoActual).emit("marcoHablo", { idMarco: juegos[idJuegoActual].marco.id });
    } else {
      // Emitir error si el juego no ha comenzado
      socket.emit("error", { mensaje: "El juego aún no ha comenzado." });
    }
  });

  // Manejar el evento para seleccionar el siguiente Marco
  socket.on("seleccionarSiguienteMarco", (idNuevoMarco) => {
    if (idJuegoActual && juegos[idJuegoActual].jugadores.find(jugador => jugador.id === idNuevoMarco)) {
      juegos[idJuegoActual].marco = juegos[idJuegoActual].jugadores.find(jugador => jugador.id === idNuevoMarco);
      // Notificar a todos los jugadores sobre el nuevo Marco
      io.to(idJuegoActual).emit("nuevoMarcoSeleccionado", { nuevoMarco: juegos[idJuegoActual].marco });
      io.to(idJuegoActual).emit("juegoIniciadoParaOtros", { mensaje: "Nuevo Marco ha sido seleccionado." });
    } else {
      // Emitir error si el jugador no se encuentra
      socket.emit("error", { mensaje: "Jugador no encontrado." });
    }
  });

  // Manejar el evento para notificar que un Polo ha hablado
  socket.on("notificarPolo", () => {
    if (idJuegoActual) {
      // Notificar a todos los jugadores que un Polo ha hablado
      io.to(idJuegoActual).emit("poloHablo");
    }
  });

  // Manejar el evento para seleccionar un Polo
  socket.on("seleccionarPolo", (idJugadorSeleccionado) => {
    if (idJuegoActual && juegos[idJuegoActual].jugadores.find(jugador => jugador.id === idJugadorSeleccionado)) {
      // Notificar a todos los jugadores que un jugador ha sido seleccionado como Polo
      io.to(idJuegoActual).emit("jugadorSeleccionadoComoPolo", { idJugador: idJugadorSeleccionado });
    } else {
      // Emitir error si el jugador no se encuentra
      socket.emit("error", { mensaje: "Jugador no encontrado." });
    }
  });
});

// Iniciar el servidor en el puerto 5050
servidorHttp.listen(5050, () => {
  console.log(`El servidor está ejecutándose en http://localhost:5050`);
});
