var game = new Phaser.Game(1280, 800, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

console.log("this is a test")

function preload() 
{
    
    game.load.image('monster', 'assets/monster.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('shield', 'assets/shield3.png');
    
}

var monsters = [];
var player;
var shield;

var line;
var mouseSpring;
var isSwingingShield = false;

function create() 
{
    game.stage.backgroundColor = '#00000';
    
    //  To make the sprite move we need to enable p2 Physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    cursors = game.input.keyboard.createCursorKeys();
    
    shield = game.add.sprite(game.world.randomX, game.world.randomY, 'shield');
    game.physics.p2.enable(shield);
    
    player = game.add.sprite(0, 0, 'player');
    game.physics.p2.enable(player);
    
    player.body.static = true;
    player.body.data.shapes[0].sensor = true;
    
    player.anchor.set(0.5);
    
    line = new Phaser.Line(shield.x, shield.y, player.x, player.y);
    
    game.input.onDown.add(click, this);
    game.input.onUp.add(release, this);
    game.input.addMoveCallback(move, this);
        
    for (var x = 0; x < 50; x++)
    {
        // spawn a monster sprite in a random point in the game world
        var monsterSprite = game.add.sprite(game.world.randomX, game.world.randomY, 'monster');
        
        // add the sprite to an array
        monsters.push(monsterSprite);
        
        // anchor to the center of the sprite
        monsterSprite.anchor.set(0.5);
        
        // enable p2 physics for the sprite (to make it move)
        game.physics.p2.enable(monsterSprite);
    }
}

function click(pointer)
{    
    var bodies = game.physics.p2.hitTest(pointer.position, [ shield.body ]);
    
    if (bodies.length)
    {
        //  Attach to the first body the mouse hit
        mouseSpring = game.physics.p2.createSpring(player, bodies[0], 0, 30, 1);
        line.setTo(shield.x, shield.y, game.input.mousePointer.x, game.input.mousePointer.y);
        isSwingingShield = true;
    }
    
}

function release() 
{    
    game.physics.p2.removeSpring(mouseSpring);
    isSwingingShield = false;
}

function move(pointer, x, y, isDown)
{
    //if (!isSwingingShield)
    //{
        player.body.x = x;
        player.body.y = y;
   // }
    line.setTo(shield.x, shield.y, player.x, player.y);    
}

function accelerateToObject(obj1, x, y, speed) 
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

function update () 
{
    monsters.forEach(monster => 
        {
            accelerateToObject(monster, game.input.mousePointer.x, game.input.mousePointer.y, 200);
        });
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
        {
            accelerateToObject(shield, game.input.mousePointer.x, game.input.mousePointer.y, 5000);
        }
    }
    
    function preRender() 
    {
        if (line)
        {
            line.setTo(shield.x, shield.y, game.input.mousePointer.x, game.input.mousePointer.y);
        }
    }
    
    function render () 
    {
       // game.debug.inputInfo(32, 32);
        
        if (isSwingingShield)
        {
            game.debug.geom(line);
        }
    }