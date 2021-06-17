var doctorAnimation, doctor;
var backgroundImg, bg;
var invisibleGround;
var coronaImg, coronaGroup;
var vaccineImg, vaccineGroup;
var maskImg, maskGroup;
var oxygenCylinderImg, oxygenCylinderGroup;
var personWithVirusImg, personWithVirusGroup;
var personWithoutMaskImg, personWithoutMaskGroup;
var jumpSound, killSound, hurtSound, oxygenSound, highScoreSound;
var vaccines = 10, masks = 10;
var score = 0, lives = 3;
var gameState = "PLAY";
var restartImg, restart;
localStorage["High Score"] = 0;

function preload() {
  backgroundImg = loadImage("img/background.jpg");
  doctorAnimation = loadAnimation("img/doctor1.png", "img/doctor2.png", "img/doctor3.png", "img/doctor4.png", "img/doctor5.png");
  coronaImg = loadImage("img/coronavirus.png");
  vaccineImg = loadImage("img/vaccine.png");
  maskImg = loadImage("img/mask.png");
  oxygenCylinderImg = loadImage("img/oxygenTank.png");
  personWithVirusImg = loadImage("img/personWithCoronavirus.png");
  personWithoutMaskImg = loadImage("img/personWithoutMask.png");
  restartImg = loadImage("img/restart.png");
  jumpSound = loadSound("sounds/jump.mp3");
  killSound = loadSound("sounds/kill.mp3");
  hurtSound = loadSound("sounds/hurt.mp3");
  oxygenSound = loadSound("sounds/oxygenTank.mp3");
  highScoreSound = loadSound("sounds/highScore.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("green");
  bg = createSprite(displayWidth/2, 250, 100, 100);
  bg.addImage("bg", backgroundImg);
  bg.scale = displayWidth/300;
  bg.velocityX = -10;

  doctor = createSprite(100, windowHeight-150, 50, 50);
  doctor.addAnimation("doctorRunning", doctorAnimation);
  doctor.scale = 2;

  invisibleGround = createSprite(100, windowHeight-75, 50, 20);
  invisibleGround.visible = false;

  restart = createSprite(windowWidth/2, windowHeight/2+50, 50, 50);
  restart.addImage(restartImg);
  restart.scale = 0.5;
  restart.visible = false;

  restart.depth = bg.depth;
  bg.depth += 1;

  coronaGroup = new Group();
  vaccineGroup = new Group();
  maskGroup = new Group();
  oxygenCylinderGroup = new Group();
  personWithVirusGroup = new Group();
  personWithoutMaskGroup = new Group();
}

function draw() {
  background(255,255,255);

  if(gameState === "PLAY") {
    if(bg.x < windowWidth/2-150) {
      bg.x = windowWidth/2;
    }

    if(keyDown("space") && doctor.y > 570) {
      doctor.velocityY = -15;
      jumpSound.play();
    }

    doctor.velocityY = doctor.velocityY + 0.5;

    doctor.collide(invisibleGround);

    spawnVirus();
    spawnVaccine();
    spawnMask();
    spawnOxygenCylinder();
    spawnPersonVirus();
    spawnPersonMask();
    reload();

    if(coronaGroup.isTouching(doctor)) {
      coronaGroup.destroyEach();
      hurtSound.play();
      lives -= 1;
    }

    if(oxygenCylinderGroup.isTouching(doctor)) {
      oxygenCylinderGroup.destroyEach();
      oxygenSound.play();
      score += 10;
    }

    if(vaccineGroup.isTouching(personWithVirusGroup)) {
      vaccineGroup.destroyEach();
      personWithVirusGroup.destroyEach();
      killSound.play();
      score += 5;
    }

    if(maskGroup.isTouching(personWithVirusGroup) || doctor.isTouching(personWithVirusGroup)) {
      maskGroup.destroyEach();
      personWithVirusGroup.destroyEach();
      killSound.play();
      lives -= 1;
    }

    if(maskGroup.isTouching(personWithoutMaskGroup)) {
      maskGroup.destroyEach();
      personWithoutMaskGroup.destroyEach();
      killSound.play();
      score += 2;
    }

    if(vaccineGroup.isTouching(personWithoutMaskGroup) || doctor.isTouching(personWithoutMaskGroup)) {
      vaccineGroup.destroyEach();
      personWithoutMaskGroup.destroyEach();
      killSound.play();
      lives -= 1;
    }

    if(lives === 0) {
      gameState = "END";
    }

    console.log(masks, vaccines);

    drawSprites();

    stroke("black");
    textSize(20);
    fill("black");
    text("V : Vaccines; M : Masks; Spacebar : Jump; R : Reload materials", windowWidth/3, 50);
    text("Score: " + score, windowWidth - 125, 30);
    text("Lives: " + lives, windowWidth - 125, 60);
    text("No of Vaccines: " + vaccines, windowWidth/20, 30);
    text("No of Masks: " + masks, windowWidth/20, 60);

  } else if(gameState === "END") {
    doctor.visible = false;
    coronaGroup.destroyEach();
    maskGroup.destroyEach();
    vaccineGroup.destroyEach();
    personWithoutMaskGroup.destroyEach();
    personWithVirusGroup.destroyEach();
    oxygenCylinderGroup.destroyEach();
    bg.velocityX = -10;

    if(localStorage["High Score"] < score) {
      localStorage["High Score"] = score;
      highScoreSound.play();
    }

    stroke("black");
    textSize(50);
    fill("black");
    text("You Lost", windowWidth/2-100, windowHeight/2-300);
    text("Your score is " + score, windowWidth/2-150, windowHeight/2 - 200);
    text("Your High Score is " + localStorage["High Score"], windowWidth/2 - 150, windowHeight/2 - 100);
    textSize(20);
    text("Sound files from zapsplat.com", windowWidth-300, windowHeight-50);

    restart.visible = true;

    if(mousePressedOver(restart)) {
      reset();
    }

    drawSprites();
  }
}

function spawnVirus() {
  if(frameCount % 300 === 0) {
    var corona = createSprite(windowWidth+100, windowHeight - 135, 50, 50);
    corona.addImage(coronaImg);
    corona.scale = 0.1;
    corona.velocityX = -5;
    corona.lifetime = windowWidth+100;
    corona.debug = true;
    coronaGroup.add(corona);
  }
}

function spawnVaccine() {
  if(vaccines > 0) {
    if(keyDown("v")) {
      vaccine = createSprite(doctor.x, doctor.y, 50, 50);
      vaccine.addImage(vaccineImg);
      vaccine.velocityX = 3;
      vaccine.scale = 0.1;
      vaccine.lifetime = windowWidth/2;
      vaccines -= 1;
      vaccineGroup.add(vaccine);
    }
  }
}

function spawnMask() {
  if(masks > 0) {
    if (keyDown("m")) {
      mask = createSprite(doctor.x, doctor.y, 50, 50);
      mask.addImage(maskImg);
      mask.velocityX = 3;
      mask.scale = 0.1;
      masks -= 1;
      mask.lifetime = windowWidth/2;
      maskGroup.add(mask);
    }
  }
}

function spawnOxygenCylinder() {
  if(frameCount % 550 === 0) {
    oxygenCylinder = createSprite(windowWidth + 100, windowHeight - 125, 50, 50);
    oxygenCylinder.addImage(oxygenCylinderImg);
    oxygenCylinder.scale = 0.1;
    oxygenCylinder.velocityX = -5;
    oxygenCylinderGroup.add(oxygenCylinder);
  }
}

function spawnPersonVirus() {
  if(frameCount % 450 === 0) {
    personVirus = createSprite(windowWidth+ 100, windowHeight - 150, 50, 50);
    personVirus.addImage(personWithVirusImg);
    personVirus.scale = 0.2;
    personVirus.velocityX = -5;
    personWithVirusGroup.add(personVirus);
  }
}

function spawnPersonMask() {
  if(frameCount % 650 === 0) {
    personMask = createSprite(windowWidth + 100, windowHeight - 150, 50, 50);
    personMask.addImage(personWithoutMaskImg);
    personMask.scale = 0.4;
    personMask.velocityX = -5;
    personWithoutMaskGroup.add(personMask);
  }
}

function reload() {
  if(masks === 0 || vaccines === 0) {
    if(keyDown("r")) {
      vaccines = 10;
      masks = 10;
    }
  }
}

function reset() {
  gameState = "PLAY";
  restart.visible = false;
  score = 0;
  lives = 3;
  doctor.visible = true;
  doctor.x = 100;
  doctor.y = windowHeight-150;
  vaccines = 10;
  masks = 10;
}