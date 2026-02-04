import confetti from 'canvas-confetti';

// Warp-like colors - vibrant and celebratory
const colors = ['#ff0080', '#ff8c00', '#40e0d0', '#7b68ee', '#00ff7f', '#ffd700', '#ff69b4', '#00bfff'];

/**
 * Basic confetti burst - good for small celebrations
 */
export function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
}

/**
 * Full screen confetti explosion - Warp style!
 * Fires from multiple angles for maximum coverage
 */
export function triggerConfettiCannon() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    // Left side cannon
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });

    // Right side cannon
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Fireworks effect - multiple bursts across the screen
 */
export function triggerFireworks() {
  const duration = 4000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Random bursts across the screen
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * School pride / celebration - continuous side cannons
 */
export function triggerSchoolPride() {
  const end = Date.now() + 3000;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff0080', '#ff8c00', '#ffd700'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#7b68ee', '#00bfff', '#40e0d0'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Realistic confetti - falls from top like real confetti
 */
export function triggerRealisticConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

/**
 * MEGA celebration - combines multiple effects (use for milestones!)
 */
export function triggerMegaCelebration() {
  // Initial burst
  triggerRealisticConfetti();

  // Followed by side cannons
  setTimeout(() => {
    triggerConfettiCannon();
  }, 500);

  // Then fireworks
  setTimeout(() => {
    triggerFireworks();
  }, 1500);
}

/**
 * Stars effect - star-shaped confetti
 */
export function triggerStars() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

/**
 * Emoji confetti - custom shapes (hearts, stars, etc.)
 */
export function triggerEmojiConfetti() {
  const scalar = 2;
  const heart = confetti.shapeFromText({ text: '❤️', scalar });
  const star = confetti.shapeFromText({ text: '⭐', scalar });
  const money = confetti.shapeFromText({ text: '💰', scalar });

  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0.5,
    decay: 0.96,
    startVelocity: 20,
    shapes: [heart, star, money],
    scalar,
  };

  function shoot() {
    confetti({ ...defaults, particleCount: 30 });
    confetti({ ...defaults, particleCount: 5, flat: true });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

// Export a preset map for easy access
export const confettiPresets = {
  basic: triggerConfetti,
  cannon: triggerConfettiCannon,
  fireworks: triggerFireworks,
  pride: triggerSchoolPride,
  realistic: triggerRealisticConfetti,
  mega: triggerMegaCelebration,
  stars: triggerStars,
  emoji: triggerEmojiConfetti,
} as const;

export type ConfettiPreset = keyof typeof confettiPresets;
