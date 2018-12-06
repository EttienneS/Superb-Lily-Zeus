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

let lifeText;
let lifeThreshold = 0.25;

let monsterActive = 0.6;
let monsterRegen = 0.25;

let playerSpace = 250;

let shieldDamage = 0.25;
let monsterDamage = 0.05;

let monsterCount = 200;

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

function addTextElements()
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

    lifeText = game.add.text(1200, 50, "Life: 100", style);
    lifeText.anchor.set(0.5);
}

var gameOver = false;
function showGameOver()
{
    if (!gameOver)
    {
        var style = { font: "60px Consolas", fill: "#ff0044", align: "center" };
        game.add.text(game.world.centerX/2, game.world.centerY, "Game Over \n(Press F5 to try again)", style);
        gameOver = true;
    }
}

function showVictory()
{
    if (!gameOver)
    {
        var style = { font: "60px Consolas", fill: "#ff0044", align: "center" };
        game.add.text(game.world.centerX/2, game.world.centerY, "You win! \n(Press F5 to try again)", style);
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
    game.stage.backgroundColor = '#000000';

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
    createMonsters(monsterCount);
    
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);
}

function createMonsters(monsterCount)
{
    for (var x = 0; x < monsterCount; x++)
    {
        // spawn a monster sprite in a random point in the game world
        
        var spawnX = game.world.randomX;
        var spawnY = game.world.randomY;

        while (Phaser.Math.distance(player.body.x,player.body.y,spawnX,spawnY) < playerSpace)
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

    player.body.setCollisionGroup(weaponCg)
    player.body.collides(monsterCg, hitMonster, this);

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
        body2.sprite.alpha -= shieldDamage;
    }
    
}

function click(pointer)
{    
    if (!gameOver)
    {
        springX = game.physics.p2.createSpring(player, weaponX, 0, 30, 1);
        springZ = game.physics.p2.createSpring(player, weaponZ, 0, 30, 1);
        isSwingingShield = true;
    }
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
        if (monster.alpha < 1 && monster.alpha > monsterRegen)
        {
            monster.alpha += 0.01;
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

var scattered = false;
function scatter()
{
    if (!scattered)
    {
        monsters.forEach(monster => 
        {
            accelerateToObject(monster, game.world.randomX, game.world.randomY, 1000000);
        });
        scattered = true;
    }
}

function update () 
{
    if (!isAlive())
    {
        player.body.static = false;
        showGameOver();

        scatter();

        return;
    }

    if (victory())
    {
        showVictory();
        scatter();
        return;
    }

    monsters.forEach(monster => updateMonster(monster));
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
    {
        accelerateToObject(weaponX, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.X))
    {
        accelerateToObject(weaponZ, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.A) && player.body.x > 0)
    {
        player.body.x -= playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D) && player.body.x < game.width)
    {
        player.body.x += playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.y > 0)
    {
        player.body.y -= playerSpeed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S) && player.body.y < game.height)
    {
        player.body.y += playerSpeed;
    }
}

function render(){}