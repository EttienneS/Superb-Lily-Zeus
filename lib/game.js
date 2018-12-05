var game = new Phaser.Game(1440, 900, Phaser.AUTO, 'game', 
{ 
    preload: preload, 
    create: create, 
    update: update, 
    render: render 
});

// global variables
var monsters = [];
var player;
var weaponX;
var weaponZ;

var springX;
var springZ;
var isSwingingShield = false;

var monsterCollisionGroup;
var weaponCollisionGroup; 

function preload() 
{
    game.load.image('monster', 'assets/monster.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('X', 'assets/X.png');
    game.load.image('Z', 'assets/Z.png');
}

function showInstruction()
{
    var style = { font: "35px Arial", fill: "#ff0044", align: "left" };

    var text = game.add.text(300, 150, "Call both shields to you by clicking\nX - Only blue shield\nZ - Only pink shield", style);

    text.anchor.set(0.5);
}

function create() 
{
    showInstruction();
    game.stage.backgroundColor = '#000000';
    
    //  To make the sprite move we need to enable p2 Physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    
    monsterCollisionGroup = game.physics.p2.createCollisionGroup();
    weaponCollisionGroup = game.physics.p2.createCollisionGroup();
    
    // ensure the objects still collide with the bounds of the stage
    game.physics.p2.updateBoundsCollisionGroup();
    
    cursors = game.input.keyboard.createCursorKeys();
    
    createWeaponX();
    createWeaponZ();
    createPlayer();
    createMonsters(100);
    
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);

    showInstruction();
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
        
        monster.body.setCollisionGroup(monsterCollisionGroup)
        monster.body.collides([monsterCollisionGroup, weaponCollisionGroup]);
    }
}

function createWeaponX()
{
    weaponX = game.add.sprite(game.world.randomX, game.world.randomY, 'X');
    game.physics.p2.enable(weaponX);
    weaponX.body.setCollisionGroup(weaponCollisionGroup)
    weaponX.body.collides(monsterCollisionGroup, hitMonster, this);
}

function createWeaponZ()
{
    weaponZ = game.add.sprite(game.world.randomX, game.world.randomY, 'Z');
    game.physics.p2.enable(weaponZ);
    weaponZ.body.setCollisionGroup(weaponCollisionGroup)
    weaponZ.body.collides(monsterCollisionGroup, hitMonster, this);
}

function createPlayer()
{
    player = game.add.sprite(0, 0, 'player');
    game.physics.p2.enable(player);
    
    player.body.static = true;
    player.body.data.shapes[0].sensor = true;
    
    player.scale.set(1.5);
    player.anchor.set(0.5);
}

function hitMonster(body1, body2) 
{
    body2.sprite.alpha -= 0.3;
}

function click(pointer)
{    
    springX = game.physics.p2.createSpring(player, weaponX, 0, 30, 1);
    springZ = game.physics.p2.createSpring(player, weaponZ, 0, 30, 1);
    isSwingingShield = true;
}

function release() 
{    
    game.physics.p2.removeSpring(springX);
    game.physics.p2.removeSpring(springZ);
    isSwingingShield = false;
} 

function move(pointer, x, y, isDown)
{
    player.body.x = x;
    player.body.y = y;
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

function update () 
{
    monsters.forEach(monster => 
        {
            if (monster != null)
            {
                if (monster.alpha < 1 && monster.alpha > 0.2)
                {
                    monster.alpha += 0.01;
                }
                
                if (monster.alpha > 0.8)
                {
                    accelerateToObject(monster, game.input.mousePointer.x, game.input.mousePointer.y, 200);
                }

                if (monster.alpha < 0.2)
                {
                    monster.alpha = 0.19;
                }
            }
            
        });
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
        {
            accelerateToObject(weaponX, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.X))
        {
            accelerateToObject(weaponZ, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
        }
    }
    
    function render () 
    {
        // game.debug.inputInfo(32, 32);
    }