// global variables
let monsters = [];
let player;
let weaponX;
let weaponZ;

let playerSpeed = 10;

let springX;
let springZ;
let isSwingingShield = false;

let monsterCg;
let weaponCg; 

let text;

var game = new Phaser.Game(1440, 900, Phaser.AUTO, 'game', 
{ 
    preload: preload, 
    create: create, 
    update: update, 
    render: render 
});


function preload() 
{
    game.load.image('monster', 'assets/monster.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('X', 'assets/X.png');
    game.load.image('Z', 'assets/Z.png');
}

function showInstruction()
{
    var style = { font: "15px Consolas", fill: "#ff0044", align: "left" };
    var text = game.add.text(300, 100, 
        "Avoid the ghosts while trying to hit them with your shields.\n"+
        "Use WASD to move\n"+
        "Call both shields to you by left clicking.\n"+
        "Press X - Call blue shield\n" +
        "Press Z - Call pink shield\n" + 
        "Alt to pause", style);
    text.anchor.set(0.5);
}

function showLife()
{
    text.text = "Life: " + Math.trunc(player.body.sprite.alpha *100);
}

function create() 
{
    showInstruction();
    game.stage.backgroundColor = '#000000';

    game.time.advancedTiming = true;

    // game.physics.p2.restitution = 0.9;

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
    createMonsters(200);
    
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);
    
    showInstruction();
    
    var style = { font: "25px Consolas", fill: "#ffFF44", align: "left" };
    text = game.add.text(1200, 50, "Life: 100", style);
    text.anchor.set(0.5);
}

function createMonsters(monsterCount)
{
    for (var x = 0; x < monsterCount; x++)
    {
        // spawn a monster sprite in a random point in the game world
        var monster = game.add.sprite(game.world.randomX, game.world.randomY, 'monster');
        
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
    weaponX = game.add.sprite(game.world.randomX, game.world.randomY, 'X');
    game.physics.p2.enable(weaponX);
    weaponX.body.setCollisionGroup(weaponCg)
    weaponX.body.collides(monsterCg, hitMonster, this);
}

function createWeaponZ()
{
    weaponZ = game.add.sprite(game.world.randomX, game.world.randomY, 'Z');
    game.physics.p2.enable(weaponZ);
    weaponZ.body.setCollisionGroup(weaponCg)
    weaponZ.body.collides(monsterCg, hitMonster, this);
}

function createPlayer()
{
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    game.physics.p2.enable(player);
    
    player.body.static = true;
    
    player.scale.set(1.5);
    //player.anchor.set(0.5);

    player.body.setCollisionGroup(weaponCg)
    player.body.collides(monsterCg, hitMonster, this);

}

function hitMonster(body1, body2) 
{
    if (body1 === player.body)
    {
        body1.sprite.alpha -= 0.025;
    }
    else
    {
        body2.sprite.alpha -= 0.5;
    }
    
}

function click(pointer)
{    
    //game.time.slowMotion = 1.5;
    springX = game.physics.p2.createSpring(player, weaponX, 0, 30, 1);
    springZ = game.physics.p2.createSpring(player, weaponZ, 0, 30, 1);
    isSwingingShield = true;
}

function release() 
{    
    //game.time.slowMotion = 1.0;
    game.physics.p2.removeSpring(springX);
    game.physics.p2.removeSpring(springZ);
    isSwingingShield = false;
} 

function move(pointer, x, y, isDown)
{
    //player.body.x = x;
    //player.body.y = y;
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
        if (monster.alpha < 1 && monster.alpha > 0.2)
        {
            monster.alpha += 0.01;
        }
        
        if (monster.alpha > 0.8)
        {
            accelerateToObject(monster, player.body.x, player.body.y, 200);
        }
        
        if (monster.alpha < 0.2)
        {
            monster.alpha = 0.19;
        }
    }
}

function update () 
{
    showLife();

    monsters.forEach(monster => updateMonster(monster));
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
    {
        accelerateToObject(weaponX, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.X))
    {
        accelerateToObject(weaponZ, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.A))
    {
        player.body.x -= playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D))
    {
        player.body.x += playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.W))
    {
        player.body.y -= playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S))
    {
        player.body.y += playerSpeed;
    }
}

function render(){}