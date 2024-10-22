let isHit = false; // Variable para controlar el estado del impacto

function hitEnemy(player, enemy) {
  if (!invulnerable && !isHit) {
    isHit = true; // Marca que el jugador ha sido golpeado
    life--;  
    lifeText.setText('Vidas: ' + life);

    if (life <= 0) {
      player.scene.restart(); 
    }
  }

  if (gravityChanged) resetGravity(player.scene);
  juggling = false;
  invulnerable = false;
  clearTimeout(invulnerableTimer);
}

function hitEnemyWithBall(ball, enemy) {
  ball.destroy();  // La bola desaparece al chocar

  // Desaparecer el enemigo temporalmente
  enemy.disableBody(true, true);

  // El enemigo reaparece después de 3 segundos
  setTimeout(() => {
    enemy.enableBody(true, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 300), true, true);
  }, 3000);
}

function resetHit() {
  isHit = false; // Restablece el estado
}
