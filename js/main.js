const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,  // Ajustar al ancho de la ventana
  height: window.innerHeight,  // Ajustar al alto de la ventana
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,  // Ajusta automáticamente para adaptarse a la pantalla
    autoCenter: Phaser.Scale.CENTER_BOTH  // Centra el juego en la pantalla
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player, platforms, enemies, life = 3, lifeText;
let juggling = false, invulnerable = false, gravityChanged = false;
let jugglingCount = 3, invulnerableTimer, healthBar;
let cursors, invulnerableIcon;
let abilityIcons = [];


function preload() {
  // Cargar imágenes
  this.load.image('player', 'game-assets/img/character_idle.png');
  this.load.image('platform', 'game-assets/img/tile_6.png');
  this.load.image('background', 'game-assets/img/background.webp');
  this.load.image('juggling_ball', 'game-assets/img/ball.png');
  this.load.image('enemy', 'game-assets/img/character_walking_1.png');
  this.load.image('heart', 'game-assets/img/tile_1.png');
  this.load.image('juggling_icon', 'game-assets/img/juggling_icon.png');
  this.load.image('invulnerable_icon', 'game-assets/img/invulnerable_icon.png');
  this.load.image('gravity_icon', 'game-assets/img/balloons.png');
}

function generateRandomPlatforms(scene) {
  platforms = scene.physics.add.staticGroup(); // Crear grupo de plataformas

  // Ahora generar plataformas en niveles más altos
  const extraPlatformGroups = [10]; // Cantidad de plataformas por grupo
  let currentY = 800; // Posición Y inicial para las plataformas adicionales
  let leftToRight = true; // Variable para controlar la dirección

  for (let i = 0; i < 5; i++) { // Generar 5 niveles adicionales
    const groupSize = extraPlatformGroups[Phaser.Math.Between(0, extraPlatformGroups.length - 1)]; // Elegir un grupo aleatorio
    let baseX;

    // Determinar la dirección de generación
    if (leftToRight) {
      baseX = 30; // Posición X inicial para la nueva línea de plataformas (izquierda)
    } else {
      baseX = 30 + (groupSize - 1) * 80; // Posición X inicial para la nueva línea de plataformas (derecha)
    }

    for (let j = 0; j < groupSize; j++) {
      // Calcular la posición X según la dirección
      const x = leftToRight ? baseX + (j * 100) : baseX - (j * 100); 

      // Crear plataforma en la nueva línea
      platforms.create(x, currentY, 'platform').setScale(0.5).refreshBody();
    }

    // Alternar la dirección para la siguiente fila
    leftToRight = !leftToRight;
    currentY -= 200; // Bajar para la siguiente línea de plataformas
  }
}


//función para confirgurar los controles
function setUpControls(scene) {
  cursors = scene.input.keyboard.createCursorKeys();
  
  // Activar malabarismo con la tecla "3"
  scene.input.keyboard.on('keydown-3', () => {
    juggling = true; // Activa el malabarismo al presionar "3"
  });

  // Activar gravedad con globos con la tecla "2"
  scene.input.keyboard.on('keydown-2', () => {
    changeGravity(scene); // Cambia la gravedad al presionar "2"
  });

  // Activar invulnerabilidad con la tecla "1"
  scene.input.keyboard.on('keydown-1', () => {
    activateInvulnerability(); // Activa la invulnerabilidad al presionar "1"
  });
}


function spawnAbilityIcon(scene) {
  const icons = [
    { key: 'juggling_icon', ability: 'juggling' },
    { key: 'gravity_icon', ability: 'gravity' },
    { key: 'invulnerable_icon', ability: 'invulnerable' }
  ];

  const randomIndex = Phaser.Math.Between(0, icons.length - 1);
  const selectedIcon = icons[randomIndex];

  // Crear el ícono en una posición aleatoria en la parte superior
  const x = Phaser.Math.Between(650, 750);
  const icon = scene.physics.add.sprite(x, 0, selectedIcon.key).setScale(0.5).setInteractive(); // Crear como sprite físico
  icon.body.setGravityY(300); // Establecer gravedad para que caiga
  icon.body.setCollideWorldBounds(true); // No salir de los límites del mundo

  // Añadir colisión con el suelo
  scene.physics.add.collider(icon, platforms); // Colisión con las plataformas

  // Añadir colisión entre el jugador y el ícono
  scene.physics.add.overlap(player, icon, () => {
    activateAbility(selectedIcon.ability);
    icon.destroy(); // Destruir el icono al recogerlo
  });
}

function activateAbility(ability) {
  switch (ability) {
    case 'juggling':
      juggling = true;
      jugglingCount = 3; // Restablecer las bolas de malabarismo
      break;
    case 'gravity':
      changeGravity(player.scene);
      break;
    case 'invulnerable':
      activateInvulnerability();
      break;
  }
}

function createPlayer(scene) {
  player = scene.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.2); // Rebotar un poco
  player.setCollideWorldBounds(true, true, true, false); // No salir de los límites del mundo
}


function create() {
  // Crear el fondo y plataformas
  this.add.image(750, 350, 'background').setScale(2,1.5);

  platforms = this.physics.add.staticGroup();
  generateRandomPlatforms(this, 10)
  

  
  // Crear jugador
  createPlayer(this); 

  // Añadir colisión entre jugador y plataformas
  this.physics.add.collider(player, platforms);


  // Crear enemigos
  enemies = this.physics.add.group();
  createEnemies(this);

 
  setUpControls(this); // Configura los controles aquí

  cursors =  this.input.keyboard.createCursorKeys();
  invulnerableIcon = this.add.image(100, 100, 'invulnerable_icon').setAlpha(0.3);// Inicializa el icono

   // Evento para detectar cuando el jugador deja de estar en contacto con un enemigo
   this.physics.world.on('collisionend', (colliderA, colliderB) => {
    if (colliderA.gameObject === player || colliderB.gameObject === player) {
      resetHit(); // Resetea el estado de isHit
    }
  });

  // Texto y barra de vida
  lifeText = this.add.text(1400, 20, 'Vidas: ' + life, { fontSize: '24px', fill: '#fff' });
  healthBar = this.add.graphics();
  updateHealthBar(this);
  spawnAbilityIcon(this); 
}

function createEnemies(scene) {
  enemies = scene.physics.add.group(); // Asegúrate de inicializar el grupo aquí

  for (let i = 0; i < 7; i++) { // Cambia el número según cuántos enemigos quieras
    const enemy = enemies.create(Phaser.Math.Between(100, 700), 0, 'enemy');
    enemy.setBounce(0.5);
    enemy.setVelocity(Phaser.Math.Between(-100, 100), 20); // Movimiento inicial
    enemy.setCollideWorldBounds(true); // No salir de los límites
    enemy.setGravityY(100); // Añadir gravedad
  }

  scene.physics.add.collider(enemies, platforms);

  // Añadir colisión entre el jugador y los enemigos
  scene.physics.add.overlap(player, enemies, hitEnemy, null, scene);
}




function update() {
  handleMovement(cursors, player); // Asegúrate de que esta función esté definida
  //handleAbilities(this); // Llama a la función de habilidades aquí
}

if (abilityIcons.length < 1) {
  spawnAbilityIcon(this);
}


function updateHealthBar(scene) {
  healthBar.clear();
  healthBar.fillStyle(0xff0000, 1); // Rojo para la salud perdida
  healthBar.fillRect(650, 50, 100, 20); // Fondo de la barra

  healthBar.fillStyle(0x00ff00, 1); // Verde para la salud actual
  healthBar.fillRect(650, 50, life * 33.33, 20); // Ajusta el ancho según la vida
}


function handleMovement(cursors, player) {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);  // Movimiento a la izquierda
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);  // Movimiento a la derecha
  } else {
    player.setVelocityX(0);  // Detenerse
  }

  // Saltar
  if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down) {
    player.setVelocityY(-330);  // Velocidad de salto
  }
}

// Funciones de habilidades
function throwJugglingBalls(scene) {
  if (jugglingCount > 0) {
    juggling = true; // Cambia a true al lanzar
    let ball = scene.physics.add.sprite(player.x, player.y, 'juggling_ball');
    ball.setVelocity(200, -200);  // Trayectoria de la bola
    scene.physics.add.collider(ball, platforms, () => ball.destroy());
    scene.physics.add.overlap(ball, enemies, hitEnemyWithBall, null, scene);
    jugglingCount--;
  } else {
    juggling = false;
  }
}

function changeGravity(scene) {
  gravityChanged = true;
  scene.physics.world.gravity.y = 250; // Cambiar gravedad
}

function resetGravity(scene) {
  gravityChanged = false;
  scene.physics.world.gravity.y = 500; // Restaurar gravedad
}

function activateInvulnerability() {
  if (!invulnerable) { // Solo activar si no está ya activo
    invulnerable = true;
    invulnerableIcon.setAlpha(1);
    
    invulnerableTimer = setTimeout(() => {
      invulnerable = false;
      invulnerableIcon.setAlpha(0.3);
    }, 10000);
  }
}


