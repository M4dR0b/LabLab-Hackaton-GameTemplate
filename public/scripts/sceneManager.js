export default class SceneManager {
  constructor(game) {
    this.game = game;
    console.log(this.game)
  }

  switchScene(key, sceneToStop) {
    
    // Check if the scene exists
    if (this.game.scene.isActive(key)) {
      console.log(`Scene '${key}' is already active.`);
      return;
    }

    // Stop the current scene
    const currentScene = sceneToStop;
    if (this.game.scene.isActive(currentScene)) {
      this.game.scene.stop(currentScene);
    }

    // Start the new scene
    console.log("here", key, this.game.scene);
    this.game.scene.stop('title');
    this.game.scene.start(key);
    // this.scene.transition({ target: key, duration: 2000 });
  }
}
