var game = new Phaser.Game(1280, 800, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

console.log("this is a test")

function preload() {
    
    // load the dragon.png as a 'dragon' sprite
    game.load.image('dragon', 'assets/dragon.png');
    
}

var sprites = [];

function create() {
    
    //  To make the sprite move we need to enable Arcade Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    for (var x = 0; x < 500; x++)
    {
        // spawn a dragon sprite in a random point in the game world
        var dragonSprite = game.add.sprite(game.world.randomX,game.world.randomY, 'dragon');

        // add the sprite to an array
        sprites.push(dragonSprite);
        
        // anchor to the center of the sprite
        dragonSprite.anchor.set(0.5);

        // enable arcade physics for the sprite (to make it move)
        game.physics.arcade.enable(dragonSprite);
    }
}

function scatter(sprite)
{
    // reset the sprite to a random point in the game world
    sprite.body.x =  game.world.randomX;
    sprite.body.y =  game.world.randomY;
}

function update () {
    
    // loop through each sprite and move it closer to the cursor
    // if already at the cursor scatter it away again
    sprites.forEach(sprite => {
        //  If the sprite is > 8px away from the pointer then let's move to it
        if (game.physics.arcade.distanceToPointer(sprite, game.input.activePointer) > 5)
        {
            //  Make the object seek to the active pointer (mouse or touch).
            game.physics.arcade.moveToPointer(sprite, 300);
        }
        else
        {
            //  Otherwise turn off velocity because we're close enough to the pointer
            sprite.body.velocity.set(0);

            game.physics.
            scatter(sprite);
        }
    });
}

function render () {
	game.debug.inputInfo(32, 32);
}