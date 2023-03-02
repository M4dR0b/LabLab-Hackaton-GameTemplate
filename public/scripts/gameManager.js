//game manager
import SceneManager from './sceneManager.js';
import TitleScene from './titleScreen.js';
import GameplayScene from './gameplay.js';

var game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [TitleScene],
    backgroundColor: '#ADD8E6',
    callbacks: {
        postBoot: function (game) {
            // Add the scene manager to the game object
            game.scene.add('sceneManager', sceneManager, true);
        }
    }
});

const sceneManager = new SceneManager(game);
// Pass the scene manager instance to the TitleScene
game.scene.add('title', new TitleScene(sceneManager));
game.scene.add('gameplayScene', new GameplayScene());

export default sceneManager;