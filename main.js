'use strict';

var mainMenu = {
	preload: function() {

	},
	create: function() {
		game.stage.backgroundColor = game.rnd.pick(colorsArray);
		this.text = game.add.text(game.world.centerX, game.world.centerY / 6, "- BreakoutClone -");

    //  Centers the text
    this.text.anchor.set(0.5);
    this.text.align = 'center';

    //  Our font + size
    this.text.font = 'Arial';
    this.text.fontWeight = 'bold';
    this.text.fontSize = 70;
    this.text.fill = '#ffffff';
		this.text.stroke = '#242424';
		this.text.strokeThickness = 3;

    //  Here we create our fake reflection :)
    //  It's just another Text object, with an alpha gradient and flipped vertically

    this.textReflect = game.add.text(game.world.centerX, game.world.centerY / 6 + 50, "- BreakoutClone -");

    //  Centers the text
    this.textReflect.anchor.set(0.5);
    this.textReflect.align = 'center';
    this.textReflect.scale.y = -1;

    //  Our font + size
    this.textReflect.font = 'Arial';
		this.textReflect.fontWeight = 'bold';
    this.textReflect.fontSize = 70;

    //  Here we create a linear gradient on the Text context.
    //  This uses the exact same method of creating a gradient as you do on a normal Canvas context.
    var grd = this.textReflect.context.createLinearGradient(0, 0, 0, this.text.canvas.height);

    //  Add in 2 color stops
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(1, 'rgba(255,255,255,0.15)');

    //  And apply to the Text
    this.textReflect.fill = grd;
		let style = {font: "35px Arial", fill: "white", stroke: "#242424", strokeThickness: 3, align: "left"}
		this.ng = game.add.text(game.world.centerX, game.world.centerY / 3 + game.world.centerY / 6, "New game", style);
		this.ng.anchor.setTo(0.5,0.5)
		this.ng.inputEnabled = true;
		this.ng.events.onInputUp.add(function() {
			game.state.start('main');
		})
	},
	update: function() {
	}
}
var mainState = {
	preload: function() {

		game.load.image('brick', 'brick.png');
		game.load.image('ball', 'ball.png');

	},
	create: function() {

		game.stage.backgroundColor = this.changeBackColor();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.world.enableBody = true;

		this.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		this.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		this.pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);

		this.paddle = game.add.sprite(game.world.centerX, 450, 'brick');
		this.paddle.anchor.setTo(0.5);
		this.paddle.scale.setTo(2, 0.5);

		this.paddle.body.immovable = true;

		this.bricks = game.add.group();

		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 5; j++) {
				let brick = game.add.sprite(55+i*80, 55+j*45, 'brick');
				let hp = game.rnd.integerInRange(1, 3);
				brick.health = hp;
				let tintVar = hp * 3;
				brick.tint = "0x"+tintVar+tintVar+tintVar+tintVar+tintVar+tintVar;
				brick.body.immovable = true;
				this.bricks.add(brick);
			}
		}

		this.ball = game.add.sprite(200, 300, 'ball');
		this.ball.anchor.setTo(0.5);
		// Line of code below is buggy and I don't know why
		// this.ball.body.setCircle(16);
		this.ball.body.velocity.x = 200;
		this.ball.body.velocity.y = 200;
		this.ball.tint = 0xffffff;

		this.ball.body.bounce.setTo(1);
		this.ball.body.collideWorldBounds = true;

		this.bricksCount = this.bricks.children.length;
		userData.bricksDestroyed += this.bricksCount;

		let style = {font: "35px Arial", fill: "white", stroke: "#242424", strokeThickness: 3, align: "left"}
		this.text = game.add.text(10, 10, this.bricksCount, style);

	},
	update: function() {

		if (this.left.isDown) this.paddle.body.velocity.x  = -350;
		else if (this.right.isDown) this.paddle.body.velocity.x = 350;
		else this.paddle.body.velocity.x = 0;

		this.pauseKey.onUp.add(this.gamePause, this);

		game.physics.arcade.collide(this.ball, this.paddle, this.paddleBounce, null, this);
		game.physics.arcade.collide(this.ball, this.bricks, this.hit, null, this);

		if (this.ball.y > this.paddle.y)
		this.gameRepeat();
		if (0 >= this.bricksCount)
		this.gamePause();

	},
	hit: function(ball, brick) {

		if(brick.health - 1 == 0) {
			this.bricksCount -= 1;
			game.stage.backgroundColor = this.changeBackColor();
		}
		this.updateText();
		brick.damage(1);
		let tintVar = brick.health * 3;
		brick.tint = "0x"+tintVar+tintVar+tintVar+tintVar+tintVar+tintVar;
		// TODO: Randomize bounce angle after brick hitting.
		// ball.body.velocity.y = -1*ball.body.velocity.y;
		// ball.body.velocity.x = -1*ball.body.velocity.x;
		// ball.body.velocity.x = 1*4*(ball.x - brick.x);

	},
	changeBackColor: function() {
		return game.rnd.pick(colorsArray);
	},
	updateText: function() {
		this.text.setText(this.bricksCount);
	},
	paddleBounce: function(ball, paddle) {
		ball.body.velocity.x = -1*4*(paddle.x - ball.x);
		ball.body.velocity.y = -250;
	},
	gameRepeat: function() {
		userData.repeats += 1;
		userData.bricksDestroyed -= this.bricksCount;
		game.state.start('main');
	},
	gamePause: function() {
		this.pauseData.pause = !this.pauseData.pause;
		if(this.pauseData.pause) {
			this.gamePausing();
			console.log('pauza');
		} else {
			this.gameUnPausing();
			console.log('koniec pauzy');
		}
	},
	gamePausing: function() {
		// pauseData.pause = true;
		console.log(this.pauseData.ball.x);
		this.pauseData.ball.x = this.ball.body.velocity.x;
		console.log(this.pauseData.ball.x);
		this.pauseData.ball.y = this.ball.body.velocity.y;
		this.pauseData.paddle.x = this.paddle.body.velocity.x;
		this.pauseData.paddle.y = this.paddle.body.velocity.y;
		this.ball.body.velocity.x = 0;
		this.ball.body.velocity.y = 0;
		this.paddle.body.velocity.x = 0;
		this.paddle.body.velocity.y = 0;
		this.menuPause();
	},
	gameUnPausing: function() {
		// pauseData.pause = false;
		this.menuUnPause();
		this.ball.body.velocity.x = this.pauseData.ball.x;
		this.ball.body.velocity.y = this.pauseData.ball.y;
		this.paddle.body.velocity.x = this.pauseData.paddle.x;
		this.paddle.body.velocity.y = this.pauseData.paddle.y;
	},
	menuPause: function() {
		if(this.pauseData.pause) {

		// this.paused = true;
		let lineHeight = 45;
		let style = {font: "35px Arial", fill: "white", stroke: "#242424", strokeThickness: 3, align: "left"}
		this.ngp = game.add.text(game.world.centerX, game.world.centerY / 3 + game.world.centerY / 6, "Nowa gra", style);
		this.ngp.anchor.setTo(0.5,0.5)
		this.ngp.inputEnabled = true;
		this.ngp.events.onInputUp.add(function() {
			game.state.start('main');
		});
		this.mm = game.add.text(game.world.centerX, game.world.centerY / 3 + game.world.centerY / 6 + lineHeight, "Menu Główne", style);
		this.mm.anchor.setTo(0.5,0.5)
		this.mm.inputEnabled = true;
		this.mm.events.onInputUp.add(function() {
			game.state.start('menu');
		});
		this.rep = game.add.text(game.world.centerX, game.world.centerY / 3 + game.world.centerY / 6 + 2 * lineHeight, "Powtórz", style);
		this.rep.anchor.setTo(0.5,0.5)
		this.rep.inputEnabled = true;
		this.rep.events.onInputUp.add(function() {
			this.gameRepeat();
		});
		let points = Math.floor(userData.bricksDestroyed / userData.repeats);
		userData.points = points;
		this.poi = game.add.text(game.world.centerX, game.world.centerY / 3 + game.world.centerY / 6 + -1 * lineHeight, 'Pun', style);
		this.poi.anchor.setTo(0.5, 0.5);
		let pointText = "Punkty : "+points;
		this.poi.setText(pointText);
		}
	},
	menuUnPause: function() {
	if(!this.pauseData.pause) {
		this.ngp.destroy();
		this.mm.destroy();
		this.rep.destroy();
		this.poi.destroy();
		// this.paused = false;
	}
},
pauseData: {
	pause: false,
	ball: {
		x: 0,
		y: 0
	},
	paddle: {
		x: 0,
		y: 0
	}
}
};

var userData = {
	repeats: 0,
	bricksDestroyed: 0,
	points: 0
};


var game = new Phaser.Game(700,500);
game.state.add('main', mainState);
game.state.add('menu', mainMenu);
game.state.start('menu');

// window.addEventListener('keydown', function(event){
// 	if(event.keyCode == Phaser.Keyboard.P) {
// 		game.paused = !game.paused;
// 		console.log('paused');
// 		game.state.states.main.gamePause();
// 	}
// })

// window.onkeydown = function(e) {
// 	if(e.keyCode == Phaser.Keyboard.P) {
// 		console.log('pauze');
// 	}
// }

// Material pallete colors
var colorsArray = [
  "#f44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#ef5350",
  "#EC407A",
  "#AB47BC",
  "#7E57C2",
  "#5C6BC0",
  "#42A5F5",
  "#29B6F6",
  "#26C6DA",
  "#26A69A",
  "#66BB6A",
  "#9CCC65",
  "#D4E157",
  "#FFEE58",
  "#FFCA28",
  "#FFA726",
  "#FF7043",
  "#8D6E63",
  "#f44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#e53935",
  "#D81B60",
  "#8E24AA",
  "#5E35B1",
  "#3949AB",
  "#1E88E5",
  "#039BE5",
  "#00ACC1",
  "#00897B",
  "#43A047",
  "#7CB342",
  "#C0CA33",
  "#FDD835",
  "#FFB300",
  "#FB8C00",
  "#F4511E",
  "#d32f2f",
  "#C2185B",
  "#7B1FA2",
  "#512DA8",
  "#303F9F",
  "#1976D2",
  "#0288D1",
  "#0097A7",
  "#00796B",
  "#388E3C",
  "#689F38",
  "#AFB42B",
  "#FBC02D",
  "#FFA000",
  "#F57C00",
  "#E64A19",
  "#c62828",
  "#AD1457",
  "#6A1B9A",
  "#4527A0",
  "#283593",
  "#1565C0",
  "#0277BD",
  "#00838F",
  "#00695C",
  "#2E7D32",
  "#558B2F",
  "#9E9D24",
  "#F9A825",
  "#FF8F00",
  "#536DFE",
  "#448AFF",
  "#40C4FF",
  "#18FFFF",
  "#64FFDA",
  "#69F0AE",
  "#B2FF59",
  "#EEFF41",
  "#FFFF00",
  "#FFD740",
  "#FFAB40",
  "#FF6E40",
  "#ff1744",
  "#F50057",
  "#D500F9",
  "#651FFF",
  "#3D5AFE",
  "#2979FF",
  "#00B0FF",
  "#00E5FF",
  "#1DE9B6",
  "#00E676",
  "#76FF03",
  "#C6FF00",
  "#FFEA00",
  "#FFC400",
  "#FF9100",
  "#FF3D00",
  "#d50000",
  "#C51162",
  "#AA00FF",
  "#6200EA",
  "#304FFE",
  "#2962FF",
  "#0091EA",
  "#00B8D4",
  "#00BFA5",
  "#00C853",
  "#64DD17",
  "#AEEA00",
  "#FFD600",
  "#FFAB00",
  "#FF6D00",
  "#DD2C00"
]
