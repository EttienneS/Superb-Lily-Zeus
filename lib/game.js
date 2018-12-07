// global variables
let monsters = [];
let monsterDamage = 0.05;
let monsterCount = 250;
let monsterRegenRate = 0.01;
let monsterCg;
let monsterActive = 0.6;
let monsterRegenThreshold = 0.25;

let cursor;
let weaponX;
let weaponZ;
let springX;
let springZ;
let weaponCg; 
let isSwinging = false;
let weaponDamage = 0.25;

let player;
let playerSpeed = 10;
let lifeText;
let lifeThreshold = 0.25;
let playerSpawnSpace = 250;
let playerRegenRate = 0.0005;

var gameOver = false;
var scattered = false;

var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 50;
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 50;

var style = 
{
    charcoal: "#383F51",
    spanishgray: "#948D9B", 
    operamauve: "#B279A7",
    plum: "#E899DC",
    shampoo: "#FEC9F1",
    font: "30px Consolas",
    fontLarge: "60px Consolas"
}

var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', 
{ 
    preload: preload, 
    create: create, 
    update: update, 
    render: render 
});

function preload() 
{
    game.load.image('monster', 'assets/monster.png');
    game.load.image('player', 'assets/lilly.png');
    game.load.image('X', 'assets/X.png');
    game.load.image('Z', 'assets/Z.png');
    game.load.image('cursor', 'assets/cursor.png');
    game.load.image('menu', 'assets/menu.png');
}

function addTextElements()
{
    lifeText = game.add.text(80, 25, "Life: 100", { font: style.font, fill: style.plum, align: "left" });
    lifeText.anchor.set(0.5);
    
    var pause_label = game.add.text(width - 150, 20, 'Pause', { font: style.font, fill: style.plum, align: "left" });
    pause_label.inputEnabled = true;
    pause_label.events.onInputUp.add(showPauseMenu, self);
    game.input.onDown.add(unpause, self);
}

function showGameOver()
{
    if (!gameOver)
    {
        game.add.text(game.world.centerX/2, game.world.centerY, "Game Over \n(Press F5 to try again)", { font: style.fontLarge, fill: style.plum, align: "center" });
        gameOver = true;
    }
}

function showVictory()
{
    if (!gameOver)
    {
        game.add.text(game.world.centerX/2, game.world.centerY, "You win! \n(Press F5 to try again)", { font: style.fontLarge, fill: style.plum, align: "center" });
        gameOver = true;
    }
}

function isAlive()
{
    let life = Math.trunc((player.body.sprite.alpha - lifeThreshold) * 100);
    lifeText.text = "Life: " + life;
    
    return life > 0;
}

function create() 
{
    addTextElements();
    game.stage.backgroundColor = style.charcoal;
    
    game.time.advancedTiming = true;
    
    //  To make the sprite move we need to enable p2 Physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    
    monsterCg = game.physics.p2.createCollisionGroup();
    weaponCg = game.physics.p2.createCollisionGroup();
    
    // ensure the objects still collide with the bounds of the stage
    game.physics.p2.updateBoundsCollisionGroup();
    
    cursors = game.input.keyboard.createCursorKeys();
    
    createWeaponX();
    createWeaponZ();
    createPlayer();
    createCursor();
    createMonsters(monsterCount);
    
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);
    
    showPauseMenu();
}


function showPauseMenu () {
    // When the pause button is pressed, we pause the game
    game.paused = true;
    
    // Then add the menu
    menu = game.add.sprite(width/2, height/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
    
    // And a label to illustrate which menu item was chosen. (This is not necessary)
    choiseLabel = game.add.text(width/2, height/2+150, 'Click anywhere to resume', { font: style.font, fill: style.plum });
    choiseLabel.anchor.setTo(0.5, 0.5);
}

function unpause(event){
    // Only act if paused
    if(game.paused)
    {
        menu.destroy();
        choiseLabel.destroy();
        
        game.paused = false;
    }
};

function createMonsters(monsterCount)
{
    for (var x = 0; x < monsterCount; x++)
    {
        // spawn a monster sprite in a random point in the game world
        
        var spawnX = game.world.randomX;
        var spawnY = game.world.randomY;
        
        while (Phaser.Math.distance(player.body.x,player.body.y,spawnX,spawnY) < playerSpawnSpace)
        {
            spawnX = game.world.randomX;
            spawnY = game.world.randomY;
        }
        
        var monster = game.add.sprite(spawnX, spawnY, 'monster');
        
        // add the sprite to an array
        monsters.push(monster);
        
        // anchor to the center of the sprite
        monster.anchor.set(0.5);
        
        // enable p2 physics for the sprite (to make it move)
        game.physics.p2.enable(monster);
        
        monster.scale.set(1.5);
        
        monster.body.setCollisionGroup(monsterCg)
        monster.body.collides([monsterCg, weaponCg]);
    }
}

function createWeaponX()
{
    weaponX = game.add.sprite(game.world.centerX - 50, game.world.centerY, 'X');
    game.physics.p2.enable(weaponX);
    weaponX.body.setCollisionGroup(weaponCg)
    weaponX.body.collides(monsterCg, hitMonster, this);
    
    weaponX.scale.set(1.5);
}

function createWeaponZ()
{
    weaponZ = game.add.sprite(game.world.centerX + 50, game.world.centerY, 'Z');
    game.physics.p2.enable(weaponZ);
    weaponZ.body.setCollisionGroup(weaponCg)
    weaponZ.body.collides(monsterCg, hitMonster, this);
    weaponZ.scale.set(1.5);
    
}

function createPlayer()
{
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    game.physics.p2.enable(player);
    
    player.body.static = true;
    
    player.scale.set(0.25);

    player.body.setRectangle(60, 60, 0, 0);
    player.body.setCollisionGroup(weaponCg)
    player.body.collides(monsterCg, hitMonster, this);
    
}

function createCursor()
{
    cursor = game.add.sprite(game.world.centerX, game.world.centerY, 'cursor');
    game.physics.p2.enable(cursor);
    
    cursor.scale.set(0.5);
    cursor.body.static = true;
}

function hitMonster(body1, body2) 
{
    if (gameOver)
    {
        return;
    }
    
    if (body1 === player.body)
    {
        if (body2.sprite.alpha > monsterActive)
        {
            if (body1.sprite.alpha > lifeThreshold)
            {
                body1.sprite.alpha -= monsterDamage;
            }
            else
            {
                body1.sprite.alpha = lifeThreshold;
            }
        }
    }
    else
    {
        body2.sprite.alpha -= weaponDamage;
    }
    
}

function click(pointer)
{    
    if (!gameOver)
    {
        springX = game.physics.p2.createSpring(cursor, weaponX, 0, 30, 1);
        springZ = game.physics.p2.createSpring(cursor, weaponZ, 0, 30, 1);
        isSwinging = true;
    }
}

function release() 
{    
    //game.time.slowMotion = 1.0;
    game.physics.p2.removeSpring(springX);
    game.physics.p2.removeSpring(springZ);
    isSwinging = false;
} 

function move(pointer, x, y, isDown)
{
    cursor.body.x = x;
    cursor.body.y = y;
}

function accelerateToObject(obj1, x, y, speed) 
{
    if (obj1 == null)
    {
        console.log('ghost gone');
    }
    else
    {
        if (typeof speed === 'undefined') 
        { 
            speed = 60;
        }
        var angle = Math.atan2(y - obj1.y, x - obj1.x);
        
        obj1.body.rotation = angle + game.math.degToRad(90); 
        obj1.body.force.x = Math.cos(angle) * speed;    
        obj1.body.force.y = Math.sin(angle) * speed;
    }
}

function updateMonster(monster)
{
    if (monster != null)
    {
        if (monster.alpha < 1 && monster.alpha > monsterRegenThreshold)
        {
            monster.alpha += monsterRegenRate;
        }
        
        if (monster.alpha >= monsterActive)
        {
            if (!gameOver)
            {
                accelerateToObject(monster, player.body.x, player.body.y, 200);
            }
        }
        
        if (monster.alpha < 0.2)
        {
            monster.alpha = 0.19;
        }
    }
}

function victory()
{
    var victory = true;
    
    for (var x = 0; x < monsters.length; x++)
    {
        if (monsters[x].body.sprite.alpha > monsterActive)
        {
            victory = false;
            break;
        }
    }
    
    return victory;
}

function scatter()
{
    if (!scattered)
    {
        monsters.forEach(monster => 
            {
                scatterMonster(monster);
            });
            scattered = true;
        }
    }
    
    function scatterMonster(monster)
    {
        accelerateToObject(monster, game.world.randomX, game.world.randomY, 1000000);
    }
    
    function update() 
    {
        if (!isAlive())
        {
            player.body.static = false;
            showGameOver();
            
            scatter();
            
            return;
        }
        else
        {
            if (player.body.sprite.alpha < 1.0)
            {
                player.body.sprite.alpha += playerRegenRate;
            }
            
        }
        
        if (victory())
        {
            showVictory();
            scatter();
            return;
        }
        
        monsters.forEach(monster => updateMonster(monster));
        handleInput();
        
    }
    
    function handleInput()
    {
        let padding = 24;
        if (game.input.keyboard.isDown(Phaser.Keyboard.A) && player.body.x > padding)
        {
            player.body.x -= playerSpeed;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.D) && player.body.x < game.width-padding)
        {
            player.body.x += playerSpeed;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.y > padding)
        {
            player.body.y -= playerSpeed;
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.S) && player.body.y < game.height-padding)
        {
            player.body.y += playerSpeed;
        }
    }
    
    function render(){}
    
    
    