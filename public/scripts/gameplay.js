import HealthBar from './healthBar.js';

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'gameplayScene' });
    console.log("gameplayconstrut");
    this.isSpinning = false; // add this flag
    this.hasAnswer = false;
    this.buttonContainer;
    this.questionContainer;
    this.healthBar;
    this.spinText;

    this.maxHealth = 200;
    this.currentHealth = 100;
    this.currentTargetSegmentNumber = 0;
    this.allSegmentNumbers = Array.from({ length: 10 }, (_, i) => i);
    this.answerResponse;
    this.shadow;
    this.counter = 0;
    let myObject = JSON.parse(localStorage.getItem("globalJsonData"));
    this.questions = myObject;
    console.log(myObject, this.questions);
  }

  preload() {
    console.log("gameplaypreload");
    // add your preload code here
    this.load.setBaseURL('');
    this.load.image('wheel', '/SpinTheWheel/img/wheel-sheet0.png');
    this.load.image('background', '/SpinTheWheel/img/tiledbackground3.png');
    this.load.image('segment_image', '/SpinTheWheel/img/truefalse-sheet1.png');
    this.load.image('spin-button', '/SpinTheWheel/img/swheel-sheet0.png');
    this.load.image('healthbar', '/SpinTheWheel/img/s_d-sheet0.png');
    this.load.image('answerButton', '/SpinTheWheel/img/button-sheet0.png');
    this.load.image('correct', '/SpinTheWheel/img/correct.png');
    this.load.image('wrong', '/SpinTheWheel/img/wrong.png');
    // this.load.json('questions', '/scripts/questions.json');
    // this.load.json('questions', '/scripts/game_template.json');
    // console.log("game", globalJsonData);
    // this.cache.json.add('questions', null, globalJsonData);

    // Load the JSON data from the cache
    // this.load.json('questions', null);
    // this.load.json('questions', '../uploads/game_template.json');

    for (let i = 0; i < 10; i++) {
      const imageName = `number-${i < 10 ? '0' + i : i}.png`;
      console.log(imageName);
      this.load.image(`segment_image_${i}`, `/SpinTheWheel/img/${imageName}`);
    }
  }

  create() {
    console.log("gameplaycreate");
    this.scale.resize(window.innerWidth, window.innerHeight);

    // this.questions = this.load.json('questions', null);
    console.log(this.questions);

    //background Tile
    var texture = this.textures.get('background');
    var frame = texture.get();
    var width = this.scale.gameSize.width;
    var height = this.scale.gameSize.height;
    const centerX = this.scale.gameSize.width / 2;
    const centerY = this.scale.gameSize.height / 2;

    var bg = this.add.tileSprite(width / 2, height / 2, width, height, 'background');
    bg.alpha = 0.2;

    var tiles = Math.ceil(width / frame.width);

    for (var i = 0; i < tiles; i++) {
      bg.tilePositionX += frame.width;
    }

    // Create the health bar
    this.healthBar = new HealthBar(this, 250, 50, this.currentHealth, this.maxHealth);

    // Create the wheel image
    const wheel = this.add.image(0, 0, 'wheel');

    //setting image to be always resized
    wheel.displayWidth = this.scale.gameSize.width;
    wheel.displayHeight = this.scale.gameSize.height;
    wheel.setOrigin(0.5);
    const scaleFactor = Math.min(this.scale.gameSize.width / wheel.width, this.scale.gameSize.height / wheel.height);
    wheel.setScale(scaleFactor / 1.1);

    const segmentImages = this.createSegmentImages(wheel, 10, 160);

    const wheelContainer = this.add.container(centerX + (centerX / 2) - 200, this.scale.gameSize.height / 2);
    wheelContainer.add(wheel);
    segmentImages.forEach((segmentImage) => {
      wheelContainer.add(segmentImage);
    });

    wheelContainer.setScale(0.9);

    // Create the button image
    const spinButton = this.add.image(wheelContainer.x, wheelContainer.y, 'spin-button');
    spinButton.setOrigin(0.5);
    spinButton.setScale(scaleFactor - 0.1);
    spinButton.setInteractive();
    spinButton.on('pointerdown', () => {
      this.spinWheel(wheelContainer, pointer);
    });
    //spin thext
    this.spinText = this.add.text(spinButton.x, spinButton.y - 35, "SPIN", { fontSize: '36px', fill: '#6CBB3C', fontWeight: "bolder" }).setOrigin(0.5, 0.5);

    const textScaleTween = this.tweens.add({
      targets: this.spinText,
      scaleX: 0.93,
      scaleY: 0.93,
      ease: 'Quad.easeInOut',
      duration: 700,
      yoyo: true,
      repeat: -1
    });
    textScaleTween.pause();

    spinButton.on('pointerover', () => {
      textScaleTween.play();
    });

    spinButton.on('pointerout', () => {
      textScaleTween.stop();
      this.spinText.setScale(1);
    });

    // Create the pointer object and position it at the bottom of the buttpn
    const pointer = this.add.rectangle(spinButton.x, 100 + spinButton.y + spinButton.displayHeight / 2, 10, 10, 0xff0000);
    pointer.setOrigin(0.5, 0);
    pointer.setScale(3);
    pointer.visible = false;
  }

  spinWheel(wheelContainer, pointer) {
    if (this.isSpinning || this.hasAnswer) return;

    this.isSpinning = true;
    this.spinText.setStyle({ fill: '#c3c3c3' });

    const numSegments = 10;
    const segmentAngle = (Math.PI * 2) / numSegments;

    // Get a random segment number and remove it from the list of available segment numbers
    const randomIndex = Phaser.Math.Between(0, this.allSegmentNumbers.length - 1);
    const targetSegmentNumber = this.allSegmentNumbers[randomIndex];
    // this.allSegmentNumbers.splice(randomIndex, 1);

    // Calculate the target angle and spin time based on the target segment number
    const targetAngle = 6 * Math.PI + targetSegmentNumber * segmentAngle + segmentAngle / 2;
    const spinTime = 3000 + targetSegmentNumber * 50;
    const ease = 'Quart.easeOut';

    this.tweens.add({
      targets: wheelContainer,
      rotation: targetAngle,
      ease: ease,
      duration: spinTime,
      onComplete: () => {
        this.isSpinning = false;

        const intersectingComponents = wheelContainer.list.filter((component) => {
          return Phaser.Geom.Intersects.RectangleToRectangle(pointer.getBounds(), component.getBounds());
        });

        let segmentNumber = null;

        intersectingComponents.forEach((component) => {
          if (component.texture.key.startsWith('segment_image_')) {
            segmentNumber = parseInt(component.texture.key.replace('segment_image_', ''));
          }
        });

        if (segmentNumber !== null) {
          console.log('Wheel stopped on segment ' + segmentNumber);

          const selectedQuestion = this.questions.game_template[segmentNumber];
          console.log("selectedQuestion:", selectedQuestion);
          this.createQuestionContainer(50, 130, selectedQuestion.question);
          this.add.existing(this.questionContainer);

          this.createButtonContainer(this.scale.gameSize.width / 4, this.scale.gameSize.height / 2, selectedQuestion.answers, this.healthBar);
          this.add.existing(this.buttonContainer);

        }
      }
    });
  }

  createQuestionContainer(x, y, question) {
    if (this.questionContainer) {
      this.questionContainer.destroy();
    }
    this.questionContainer = this.add.container(x, y);
    const radius = 10;
    const color = 0x000000;
    const lineWidth = 4;
    let padding = 25;
    let questionBox = this.add.graphics();

    questionBox.fillStyle(0xffffff, 1);

    this.questionText = this.add.text(padding, padding, question, { fontSize: '34px', fill: '#000', fontWeight: "bolder" });
    let textwidth = this.questionText.width + padding * 2;
    let textheight = this.questionText.height + padding * 2;
    questionBox.fillRect(0, 0, textwidth, textheight);

    questionBox.lineStyle(lineWidth, color);
    questionBox.strokeRoundedRect(0, 0, textwidth, textheight, radius); // Use fixed width and height in the strokeRoundedRect method

    this.questionContainer.add(questionBox);
    this.questionContainer.add(this.questionText);

    return this.questionContainer;
  }

  evaluateResponse(x, y, isCorrect) {
    if (this.answerResponse) {
      this.answerResponse.destroy();
    }

    this.counter += 1;
    if (this.counter == 10) {
      if (this.currentHealth < 100) {
        alert("YOU LOOSE");
      }
      else {
        alert("YOU WIN");
      }
    }

    let image = isCorrect ? 'correct' : 'wrong';
    console.log(image);
    this.shadow = this.add.image(x, y + 5, image).setAlpha(0.6);
    this.shadow.setTint(0x000000);
    this.answerResponse = this.add.image(x, y, image);
    setTimeout(() => {
      this.answerResponse.destroy();
      this.shadow.destroy();
      this.hasAnswer = false;
    }, 1500)
  }


  createButtonContainer(x, y, answers, healthBar) {
    this.hasAnswer = true;

    // Remove any existing buttons
    if (this.buttonContainer) {
      this.buttonContainer.destroy();
    }

    this.buttonContainer = this.add.container(x, y);
    const shuffledAnswers = Phaser.Utils.Array.Shuffle(answers);

    // Loop through each answer and dynamically create the corresponding button
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const button = this.add.image(-200, 120 * i, 'answerButton').setAlpha(0);
      const buttonText = this.add.text(button.x, button.y, answer.content, { fontSize: '16px', fill: '#000' }).setAlpha(0);

      button.setInteractive();
      buttonText.setOrigin(0.5, 0.5);

      this.buttonContainer.add(button);
      this.buttonContainer.add(buttonText);

      button.on('pointerdown', () => {
        if (answer.isCorrect) {
          this.evaluateResponse(x, y, true);
          console.log('Correct answer');
          healthBar.increase(20);
          this.currentHealth += 20;
          if (this.currentHealth >= this.maxHealth) {
            alert("YOU WON");
          }
        } else {
          this.evaluateResponse(x, y, false);
          console.log('Incorrect answer');
          healthBar.decrease(20);
          this.currentHealth -= 20;
          if (this.currentHealth <= 0) {
            alert("YOU LOOSE");
          }
        }
        console.log("MINE",);
        this.buttonContainer.destroy();
        this.spinText.setStyle({ fill: '#6CBB3C' });

        if (this.questionContainer) {
          this.questionContainer.destroy();
        }
      });
    }

    // Tween animations for buttons and text
    for (let i = 0; i < this.buttonContainer.list.length; i += 2) {
      const button = this.buttonContainer.list[i];
      const buttonText = this.buttonContainer.list[i + 1];

      this.tweens.add({
        targets: [button, buttonText],
        x: 0,
        alpha: 1,
        duration: 500,
        delay: i * 100,
        ease: 'Power2',
      });
    }

    return this.buttonContainer;
  }

  createSegmentImages(wheel, numSegments, segmentRadius) {
    segmentRadius = (wheel.displayWidth * segmentRadius) / 500;
    const segmentAngle = (Math.PI * 2) / numSegments;
    const segmentImages = [];

    for (let i = 0; i < numSegments; i++) {
      const angle = i * segmentAngle;
      const x = wheel.x + Math.cos(angle) * segmentRadius;
      const y = wheel.y + Math.sin(angle) * segmentRadius;

      const key = `segment_image_${i}`;
      const segmentImage = this.add.image(x, y, key);

      const scaleFactor = Math.min(this.scale.gameSize.width / wheel.width, this.scale.gameSize.height / wheel.height);
      segmentImage.setScale(scaleFactor / 3);
      segmentImage.setOrigin(0.5, 0.5);
      segmentImage.rotation = angle + Math.PI / 2;
      segmentImages.push(segmentImage);
    }

    this.segmentImages = segmentImages;

    return segmentImages;
  }
}

