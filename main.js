let frames = 0;
let gameStatus = 0; //0=partie en cours, 1=gagné, 2=perdu

window.addEventListener("load", async () => {
    let images = await loadImages();
    //console.log(images);
	let canvas = document.getElementById("gameCanvas");
	canvas.width = 336;
	canvas.height = 240;
    let ctx = canvas.getContext("2d");
    //drawBackground(ctx, images);
    let level = new Level(images["block"].width);
    level.init(lvl);
    player = new Character(level.playerSpawn, images["block"].width);
    gameStatus = 0;
    let input = new KeyManager();

    document.addEventListener("keydown", (e) => {
        input.keyDown(e.key);
    });

    document.addEventListener("keyup", (e) => {
        input.keyUp(e.key);
    });

    
    function loop(time)
    {
        frames++;
        //console.log("Loop");
        if(gameStatus == 0){
            player.update();
            characterInput(input, level, player);
            updateBombs(input, level, player, time);
            if(updateExplosions(level, player, time)){
                //partie perdue
                gameStatus = 2;
            }else{
                let playerCase = level.map[player.coords[1]][player.coords[0]];
                if(playerCase.type == caseTypes.EXIT && playerCase.destroyed){
                    //partie gagnée
                    gameStatus = 1;
                }
            }
        }
        drawLevel(ctx, images, level, player);

        if(gameStatus == 1){
            //affiche l'ecran de victoire
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = "gold";
            ctx.strokeStyle = "black";
            ctx.font = "32px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText("YOU WIN", ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.strokeText("YOU WIN", ctx.canvas.width/2, ctx.canvas.height/2);
        }
        if(gameStatus == 2){
            //affiche le Game Over
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
            ctx.font = "32px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.strokeText("GAME OVER", ctx.canvas.width/2, ctx.canvas.height/2);
        }

        requestAnimationFrame(loop);
    }

    window.setInterval(() => {
        document.getElementById("fpsCounter").innerHTML = "FPS : " + frames;
        frames = 0;
    }, 1000);

   /* //TEST: revele la sortie et fait tourner le personnage après 5 secondes
    window.setTimeout(() => {
        level.map[10][16].destroyed = true;
        player.turn(directions.EAST);
        drawLevel(ctx, images, level, player);
        console.log(level.map);
    }, 5000);
    //TEST: deplace le personnage après 6 secondes
    window.setTimeout(() => {
        player.move();
        drawLevel(ctx, images, level, player);
        console.log(level.map);
    }, 6000);
    //TEST: met a jour le personnage a intervalles reguliers
    window.setInterval(function(){
        player.update();
        drawLevel(ctx, images, level, player);
    }, 1000/60);*/

    requestAnimationFrame(loop);
});

async function loadImages() {
    return {
        block : await loadImageToCanvas("block"),
        bomb : await loadBomb(),
        box : await loadImageToCanvas("box"),
        char : await loadCharacter(),
        expl : await loadExplosions(),
        ground : await loadImageToCanvas("ground"),
        stairs : await loadImageToCanvas("stairs"),
        walls : await loadWalls()
    };
}

// dessine le contenu du niveau
function drawLevel(ctx, images, level, character){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBackground(ctx, images);
    let blockSize = images["block"].width; // Taille d'une case
    for(let y = 0; y < level.height; y++){
        for(let x = 0; x < level.width; x++){
            let posX = blockSize * (x + 1);
            let posY = blockSize * (y + 1);
            let lvlCase = level.map[y][x];
            switch (lvlCase.type){
                case caseTypes.BOX:
                    if(!lvlCase.destroyed)
                    {
                        ctx.drawImage(images["box"], posX, posY, blockSize, blockSize);
                    }
                    break;
                case caseTypes.BLOCK:
                    ctx.drawImage(images["block"], posX, posY, blockSize, blockSize);
                    break;
                case caseTypes.EXIT:
                    if(!lvlCase.destroyed)
                    {
                        ctx.drawImage(images["box"], posX, posY, blockSize, blockSize);
                    }
                    else
                    {
                        ctx.drawImage(images["stairs"], posX, posY, blockSize, blockSize);
                    }
                   break;
            }
        }
    }
    for (const expl of level.explosions) {
        expl.draw(ctx, images["expl"], level, blockSize);     
    }
    for (const bomb of level.bombs) {
        //calcul du clignotement
        let flash = 0;
        if(bomb.timeSincePut >= 2500){
            //flash = Math.trunc(frames / 30);
            flash = Math.floor(bomb.timeSincePut/250 + 1) % 2;
        }
        if(bomb.timeSincePut >= 4000){
            flash = frames % 2;
        }
        images["bomb"].draw(ctx, blockSize * (bomb.x + 1), blockSize * (bomb.y + 1), "fuse", flash);
    }
    drawCharacter(ctx, images, character);
}

//dessine le sol et les murs
function drawBackground(ctx, images){
    let walls = images["walls"];
    let width = ctx.canvas.width; // Largeur du canvas
    let height = ctx.canvas.height; // Hauteur du canvas
    let blockSize = images["block"].width; // Taille d'une case

    ctx.fillStyle = ctx.createPattern(images["ground"], "repeat");
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = walls.pattern(ctx, "topDown", 0, "repeat");
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillStyle = walls.pattern(ctx, "left", 0, "repeat");
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillStyle = walls.pattern(ctx, "right", 0, "repeat");
    ctx.fillRect(width - blockSize, 0, blockSize, height);
    ctx.fillStyle = walls.pattern(ctx, "topDown", 0, "repeat");
    ctx.fillRect(0, height - blockSize, width, blockSize);
    walls.draw(ctx, 0, 0, "cornerLeft", 0);
    walls.draw(ctx, width - blockSize, 0, "cornerRight", 0);
}

//dessine le personnage
function drawCharacter(ctx, images, character){
    let blockSize = images["block"].width; // Taille d'une case
    let step = 0;
    if(character.mov > 0){
        step = Math.floor(character.mov * 4 / blockSize);
        //console.log(step);
    }
    switch(character.direction){
        case directions.NORTH:
            posX = blockSize * (character.coords[0] + 1);
            posY = blockSize * (character.coords[1] + 1) - character.mov;
            images["char"].draw(ctx, posX, posY, "north", step);
            break;
        case directions.EAST:
            posX = blockSize * (character.coords[0] + 1) + character.mov;
            posY = blockSize * (character.coords[1] + 1);
            images["char"].draw(ctx, posX, posY, "east", 3 - step);
            break;
        case directions.SOUTH:
            posX = blockSize * (character.coords[0] + 1);
            posY = blockSize * (character.coords[1] + 1) + character.mov;
            images["char"].draw(ctx, posX, posY, "south", step);
            break;
        case directions.WEST:
            posX = blockSize * (character.coords[0] + 1) - character.mov;
            posY = blockSize * (character.coords[1] + 1);
            images["char"].draw(ctx, posX, posY, "west", step);
            break;
    }
}

function characterInput(input, level, player)
{
    let direction = player.direction;
    let keyPressed = true;
    let blocked = true;
    if(input.isKeyDown("ArrowUp"))
    {
        direction = directions.NORTH;
        if(player.coords[1] - 1 >= 0){
            let newCoords = [player.coords[0], player.coords[1] - 1];
            blocked = level.map [player.coords[1] - 1] [player.coords[0]].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowDown"))
    {
        direction = directions.SOUTH;
        if(player.coords[1] + 1 < level.height){
            let newCoords = [player.coords[0], player.coords[1] + 1];
            blocked = level.map [player.coords[1] + 1] [player.coords[0]].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowLeft"))
    {
        direction = directions.WEST;
        if(player.coords[0] - 1 >= 0){
            let newCoords = [player.coords[0] - 1, player.coords[1]];
            blocked = level.map[player.coords[1]][player.coords[0] - 1].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else if(input.isKeyDown("ArrowRight"))
    {
        direction = directions.EAST;
        if(player.coords[0] + 1 < level.width){
            let newCoords = [player.coords[0] + 1, player.coords[1]];
            blocked = level.map[player.coords[1]][player.coords[0] + 1].canBlock();
            blocked = blocked || level.isBombHere(newCoords);
        }
    }
    else
    {
        keyPressed = false;
    }
    if(keyPressed)
    {
        player.turn(direction);
        if(!blocked) player.move();
    }
}

function updateBombs(input, level, player, actualTime)
{
    let timeSinceLastBomb = actualTime - player.lastBombDate;
    let explDuration = 1000;
    if(input.isKeyDown(" ") && !level.isBombHere(player.coords) && timeSinceLastBomb > 500)
    {
        level.bombs.push(new Bombe(actualTime, player.coords));
        player.lastBombDate = actualTime;
    }

    let newBombArray = [];
    for (const bomb of level.bombs) {
        if(!bomb.explode(actualTime)) 
        {
            newBombArray.push(bomb); // On garde que les bombes n'ayant pas encore explosé
        }
        else
        {
            level.explosions.push(new Explosion(bomb.x, bomb.y, level, actualTime, explDuration, 2));
        }
    }
    level.bombs = newBombArray;
}

//renvoie true si joueur touché
function updateExplosions(level, player, actualTime)
{
    let explDuration = 1000;
    let newExplArray = [];
    for (const expl of level.explosions) {
        if(actualTime - expl.explTime < explDuration) // Les explosions restent pour 1 seconde
        {
            newExplArray.push(expl);
            if(expl.inArea(player.coords))
            {
                console.log("Game over");
                return true;
            }
        }      
    }
    level.explosions = newExplArray;
    return false;
}
