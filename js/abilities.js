
function handleAbilities(scene) {

  if (juggling) {
    throwJugglingBalls(scene);
  }

  //  Comprueba la gravedad
  if (gravityChanged) {
    scene.physics.world.gravity.y = 250; // Cambiar gravedad
  } else {
    resetGravity(scene); // Restaurar gravedad
  }

  // Activar invulnerabilidad
  if (invulnerable) {
    activateInvulnerability();
  }
}

function throwJugglingBalls(scene) {
  if (jugglingCount > 0) {
    let ball = scene.physics.add.sprite(player.x, player.y, 'juggling_ball');
    ball.setVelocity(200, -200);  // Trayectoria de la bola
    scene.physics.add.collider(ball, platforms, () => ball.destroy());
    scene.physics.add.overlap(ball, enemies, hitEnemyWithBall, null, scene);
    jugglingCount--;
    
    if (jugglingCount == 0){
      juggling = false; // Desactivar malabarismo cuando no hay bolas
    }
  }
}

function changeGravity(scene) {
  if (!gravityChanged) { // comprueba 
    gravityChanged = true;
    scene.physics.world.gravity.y = 250; // Cambiar gravedad
  }
}

function resetGravity(scene) {
  if (gravityChanged) { // cambia si no ha cambiado
    gravityChanged = false;
    scene.physics.world.gravity.y = 500; // Restaurar gravedad
  }
}

function activateInvulnerability() {
  if (!invulnerable) { 
    invulnerable = true;
    invulnerableIcon.setAlpha(1);
    
    invulnerableTimer = setTimeout(() => {
      invulnerable = false;
      invulnerableIcon.setAlpha(0.3);
    }, 10000);
  }
}