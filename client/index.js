// Conectar al servidor de Socket.IO en la ruta /tiempo-real
let socket = io("http://localhost:5050", { path: "/tiempo-real" });

// Event listener para el botón de unirse al juego
document.getElementById("join-button").addEventListener("click", () => {
  const idJuego = document.getElementById("game-id").value; // Obtener el ID del juego
  const apodoJugador = document.getElementById("player-id").value; // Obtener el apodo del jugador

  if (idJuego && apodoJugador) {
    // Emitir evento para unirse al juego con el ID y apodo proporcionados
    socket.emit("unirseJuego", { idJuego, apodo: apodoJugador });
  } else {
    // Mostrar mensaje de error si faltan datos
    document.getElementById("error-message").textContent = "Por favor, ingresa tanto el ID del juego como el ID del jugador.";
  }
});

// Event listener para el botón de iniciar el juego
document.getElementById("start-button").addEventListener("click", () => {
  const idJuego = document.getElementById("game-id").value; // Obtener el ID del juego

  if (idJuego) {
    // Emitir evento para iniciar el juego con el ID proporcionado
    socket.emit("iniciarJuego");
  } else {
    // Mostrar mensaje de error si falta el ID del juego
    document.getElementById("error-message").textContent = "Por favor, ingresa un ID de juego para iniciar el juego.";
  }
});

// Event listener para el botón de notificar Marco
document.getElementById("marco-button").addEventListener("click", () => {
  const idJuego = document.getElementById("game-id").value; // Obtener el ID del juego

  if (idJuego) {
    // Emitir evento para notificar Marco con el ID proporcionado
    socket.emit("notificarMarco");
  } else {
    // Mostrar mensaje de error si falta el ID del juego
    document.getElementById("error-message").textContent = "Por favor, ingresa un ID de juego para notificar Marco.";
  }
});

// Event listener para el botón de notificar Polo
document.getElementById("polo-button").addEventListener("click", () => {
  const idJuego = document.getElementById("game-id").value; // Obtener el ID del juego

  if (idJuego) {
    // Emitir evento para notificar Polo con el ID proporcionado
    socket.emit("notificarPolo");
  } else {
    // Mostrar mensaje de error si falta el ID del juego
    document.getElementById("error-message").textContent = "Por favor, ingresa un ID de juego para notificar Polo.";
  }
});

// Manejar errores enviados desde el servidor
socket.on("error", (datos) => {
  document.getElementById("error-message").textContent = datos.mensaje; // Mostrar mensaje de error en la interfaz
});

// Manejar el evento cuando un jugador se une al juego
socket.on("jugadorUnido", (datos) => {
  const contenedorDatos = document.getElementById("data-container");
  // Mostrar la lista de jugadores en el juego
  contenedorDatos.innerHTML = `<p>Jugadores en el juego: ${datos.jugadores.map(jugador => jugador.apodo).join(', ')}</p>`;
});

// Manejar el evento cuando el juego ha comenzado
socket.on("juegoIniciado", (datos) => {
  const contenedorDatos = document.getElementById("data-container");
  // Mostrar el mensaje de que el juego ha comenzado y quién es el Marco
  contenedorDatos.innerHTML = `<p>¡El juego ha comenzado! El Marco es: ${datos.marco.apodo}</p>`;

  const jugadorActualId = socket.id; // Obtener el ID del jugador actual
  const esMarco = datos.marco.id === jugadorActualId; // Verificar si el jugador actual es el Marco

  if (esMarco) {
    // Mostrar botón de notificar Marco y ocultar el botón de notificar Polo si el jugador es el Marco
    document.getElementById("marco-button").style.display = "block";
    document.getElementById("polo-button").style.display = "none";
  } else {
    // Mostrar botón de notificar Polo y ocultar el botón de notificar Marco si el jugador no es el Marco
    document.getElementById("marco-button").style.display = "none";
    document.getElementById("polo-button").style.display = "block";
  }
});

// Manejar el evento para mostrar la lista de jugadores Polo disponibles
socket.on("mostrarPolo", (datos) => {
  const contenedorDatos = document.getElementById("data-container");
  // Mostrar la lista de jugadores Polo disponibles y un botón para elegir el siguiente Marco
  const listaPolo = datos.jugadores.map(jugador => `<li>${jugador.apodo}</li>`).join('');
  contenedorDatos.innerHTML += `<p>Jugadores Polo disponibles:</p><ul>${listaPolo}</ul><button id="elegir-marco">Elegir siguiente Marco</button>`;
  
  // Event listener para el botón de elegir siguiente Marco
  document.getElementById("elegir-marco").addEventListener("click", () => {
    const idJuego = document.getElementById("game-id").value; // Obtener el ID del juego
    const siguienteMarcoId = prompt("Ingresa el ID del siguiente Marco:"); // Pedir el ID del siguiente Marco
    
    if (siguienteMarcoId) {
      // Emitir evento para seleccionar el siguiente Marco con el ID proporcionado
      socket.emit("seleccionarSiguienteMarco", siguienteMarcoId);
    }
  });
});

// Manejar el evento cuando se selecciona un nuevo Marco
socket.on("nuevoMarcoSeleccionado", (datos) => {
  const contenedorDatos = document.getElementById("data-container");
  // Mostrar el nuevo Marco seleccionado
  contenedorDatos.innerHTML += `<p>Nuevo Marco seleccionado: ${datos.nuevoMarco.apodo}</p>`;
});
