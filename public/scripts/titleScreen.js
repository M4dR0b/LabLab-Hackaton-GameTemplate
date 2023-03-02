export default class TitleScene extends Phaser.Scene {
    constructor(sceneManager) {
        super('title');
        this.sceneManager = sceneManager;
    }

    preload() {
        console.log("gameplaypreload");
        // add your preload code here
        this.load.setBaseURL('');
        this.load.image('background', '/SpinTheWheel/img/tiledbackground3.png');
        this.load.image('title', '/SpinTheWheel/img/logo-sheet0.png');
        this.load.image('button-up', '/SpinTheWheel/img/play-sheet0.png');
    }

    create() {
        //background Tile
        var texture = this.textures.get('background');
        
        var frame = texture.get();
        var width = this.scale.gameSize.width;
        var height = this.scale.gameSize.height;

        var bg = this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        bg.alpha = 0.2;

        var tiles = Math.ceil(width / frame.width);

        for (var i = 0; i < tiles; i++) {
            bg.tilePositionX += frame.width;
        }

        // Add the title image with entry animation
        const title = this.add.image(width / 2, -200, 'title');
        this.tweens.add({
            targets: title,
            y: height / 2 - 200,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Add fade in animation for title
                this.tweens.add({
                    targets: title,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });
            }
        });

        // Add the start button with entry animation and up/down animation
        const button = this.add.image(width / 2, height + 100, 'button-up').setInteractive({ useHandCursor: true, up: 'button-up', down: 'button-down' });
        this.tweens.add({
            targets: button,
            y:  height / 2 + 100,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Add fade in animation for button
                this.tweens.add({
                    targets: button,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });

                // Add loop up/down animation for button
                this.tweens.add({
                    targets: button,
                    y: button.y + 10,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        button.on('pointerover', function () {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power2',
            });
        });

        button.on('pointerout', function () {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2',
            });
        });

        button.on('pointerdown', function () {
            this.sceneManager.switchScene("gameplayScene", this.scene.key);
        }, this);
    }
}
