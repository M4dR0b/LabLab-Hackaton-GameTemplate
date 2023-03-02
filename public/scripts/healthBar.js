export default class HealthBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value, maxValue) {
      super(scene, x, y);

      this.barHeight = 60;
  
      this.backgroundBar = this.scene.add.rectangle(x, y, maxValue, this.barHeight, 0x555555);
      this.scene.add.existing(this.backgroundBar);
  
      this.fillBar = this.scene.add.rectangle(x, y, value, this.barHeight, 0x55ff00).setOrigin(1,0.5);

      this.scene.add.existing(this.fillBar);
  
      const image = this.scene.add.image(x-this.backgroundBar.width / 2, y, 'healthbar').setOrigin(1,0.5);
      this.scene.add.existing(image);
  
      this.maxValue = maxValue;
    }
  
    decrease(value) {
      const newValue = Phaser.Math.Clamp(value, 0, this.maxValue);
      this.fillBar.width -= value;
    }
  
    increase(value) {
      const newValue = Phaser.Math.Clamp(value, 0, this.maxValue);
      this.fillBar.width += value;
    }
  }
  