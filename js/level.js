class Level{
	//constructeur exemple, a generer depuis un fichier passé en paramètre
	constructor(blockSize){
		//tableau de cases d'une taille de 19x13
		/*this.map = [[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[1, 2, 1, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
					[0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]];
		*/
		//coordonnées du spawn (en haut à gauche par défaut)
		this.playerSpawn = [0, 0];
		this.width = 19;
		this.height = 13;
		this.map = [];
		this.bombs = [];
		this.explosions = [];
		this.blockSize = blockSize;
		for (let i = 0; i < this.height; i++) { // Imitialisation par défaut du niveau (Que de l'herbe)
			let line = [];
			for (let j = 0; j < this.width; j++) {
				line.push(new Case(caseTypes.GROUND));
			}
			this.map.push(line);
		}
	}

	init(lvlName)
	{
		return new Promise((success, fail) => {
			let req = new XMLHttpRequest();
			req.addEventListener("readystatechange", (ev) => {
				if(req.readyState == req.DONE)
				{
					if(req.status == 200)
					{
						let lvl = JSON.parse(req.responseText);
						if(!Level.checkLevel(lvl))
						{
							fail("Niveau invalide");
							return;
						}
						for (const coord of lvl.Boxes) 
						{
							this.putOnMap(coord, caseTypes.BOX)
						}
						for (const coord of lvl.Blocks) 
						{
							this.putOnMap(coord, caseTypes.BLOCK);
						}
						this.putOnMap(lvl.Exit, caseTypes.EXIT);
						this.putOnMap(lvl.PlayerSpawn, caseTypes.PLAYERSPAWN);
						this.playerSpawn = lvl.PlayerSpawn;
						success();
					}
					else
					{
						let errorText;
						if(req.status == 0)
						{
							errorText = "La page web doit-être chargée via le serveur et non directement."
						}
						else
						{
							errorText = "Erreur " + req.status + " " + req.statusText;
						}
						
						fail(errorText);
					}
				}
			});
			req.open("GET", "level?lvl=" + lvlName, true);
			req.send();
		});
	}

	putOnMap(coords, typeCase)
	{
		if(coords[0] < this.width && coords[1] < this.height && coords[0] >= 0 && coords[1] >= 0)
		{
			this.map[coords[1]][coords[0]].type = typeCase;
		}
		else
		{
			console.log(coords);
		}
	}

	static checkLevel(level)
	{
		if(level.Boxes === undefined)
		{
			console.log("Boites invalides");
			return false;
		}
		if(level.Blocks === undefined)
		{
			console.log("Blocs invalides");
			return false;
		}
		if(level.Exit === undefined || level.Exit.length !== 2) // La sortie a 2 coordonnées
		{
			console.log("Exit invalide");
			return false;
		}
		if(level.PlayerSpawn === undefined || level.PlayerSpawn.length !== 2) // Le spawn du joueur a 2 coordonnées
		{
			console.log("Spawn invalide");
			return false;
		}
		return true;

	}

	isBombHere(coords)
	{
		for (const bomb of this.bombs) {
			if(coords[0] == bomb.x && coords[1] == bomb.y)
			{
				return true;
			}
		}
		return false;
	}

	mapToCanvas(coord) // Traduit une coordonnée du niveau en coordonée du canvas
	{
		coord++; // Décalage à cause des murs
		return coord * this.blockSize;
	}
};

class Case
{
	constructor(typeCase)
	{
		this.type = typeCase;
		this.destroyed = false;
		this.exploding = false;
	}

	destroy(timer)
	{
		if(this.type == caseTypes.BOX || this.type == caseTypes.EXIT){
			this.exploding = true;
			window.setTimeout(() => {
				this.destroyed = true;
			}, timer);
			return true;
		}else{
			return false;
		}
	}

	canBlock()
	{
		switch(this.type)
		{
			case caseTypes.GROUND:
			case caseTypes.PLAYERSPAWN:
				return false;
			
			case caseTypes.BOX:
			case caseTypes.EXIT:
				return !this.destroyed;

			case caseTypes.BLOCK:
				return true;
			
			default:
				return false;
		}
	}
}

let caseTypes = {
	GROUND : 0,
	BOX : 1,
	BLOCK : 2,
	EXIT : 3,
	PLAYERSPAWN : 4
};

class Bombe
{
	constructor(putTime, coords)
	{
		this.putTime = putTime;
		this.timeSincePut = 0;
		this.exploded = false;
		this.x = coords[0];
		this.y = coords[1];
	}

	explode(actualTime)
	{
		this.timeSincePut = actualTime - this.putTime;
		if(!this.exploded && this.timeSincePut >= 5000)  // explose au bout de 5 secandes
		{
			this.explode = true;
			return true;
		}
		else
		{
			return false;
		}
	}
}

class Explosion
{
	constructor(x, y, level, actualTime, explDuration, explSize)
	{
		this.explArea = {
			"North" : 0,
			"West" : 0,
			"East" : 0,
			"South" : 0
		};
		this.x = x;
		this.y = y;
		this.explTime = actualTime;
		for (let i = 1; i <= explSize; i++) {
			
			if((this.x + i) < level.width)
			{
				if(level.map[y][this.x + i].canBlock())
				{
					level.map[y][this.x + i].destroy(explDuration);
					break;
				}
				else
				{
					this.explArea["East"]++;
				}
				
			}
			else
			{
				break;
			}
		}

		for (let i = 1; i <= explSize; i++) {
			
			if((this.x - i) >=0)
			{
				if (level.map[y][this.x - i].canBlock()) 
				{
					level.map[y][this.x - i].destroy(explDuration);
					break;
				} 
				else 
				{
					this.explArea["West"]++;
				}
				
			}
			else
			{
				break;
			}
		}

		for (let i = 1; i <= explSize; i++) {
			
			if((this.y + i) < level.height)
			{
				if (level.map[this.y + i][x].canBlock()) 
				{
					level.map[this.y + i][x].destroy(explDuration);
					break;
				} 
				else
				{
					this.explArea["South"]++;
				}
				
			}
			else
			{
				break;
			}
		}

		for (let i = 1; i <= explSize; i++) {
			
			if((this.y - i) >= 0)
			{
				if (level.map[this.y - i][x].canBlock())
				{
					level.map[this.y - i][x].destroy(explDuration)
					break;
				} 
				else
				{
					this.explArea["North"]++;
				}
				
			}
			else
			{
				break;
			}
		}
	}

	inArea(coords)
	{
		let minX = this.x - this.explArea["West"];
		let maxX = this.x + this.explArea["East"];
		let minY = this.y - this.explArea["North"];
		let maxY = this.y + this.explArea["South"];

		if(minX <= coords[0] && maxX >= coords[0] && this.y == coords[1])
		{
			return true; // Dans la ligne horizontale de l'explosion
		}
		if(minY <= coords[1] && maxY >= coords[1] && this.x == coords[0])
		{
			return true; // Dans la ligne verticale de l'explosion
		}

		return false;
	}

	draw(ctx, sprite, level, blockSize)
	{
		let minX = this.x - this.explArea["West"];
		let maxX = this.x + this.explArea["East"];
		let minY = this.y - this.explArea["North"];
		let maxY = this.y + this.explArea["South"];

		// Dessin du centre
		sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(this.y), "center", 0);
		
		// Dessin des 4 branches de l'explosion
		ctx.fillStyle = sprite.pattern(ctx, "horizontal", 0, "repeat");

		if(this.explArea["West"] > 0)
		{
			ctx.fillRect(level.mapToCanvas(minX + 1), level.mapToCanvas(this.y), (this.explArea["West"] - 1) * blockSize, blockSize);
			sprite.draw(ctx, level.mapToCanvas(minX), level.mapToCanvas(this.y), "left", 0);
		}
		if(this.explArea["East"] > 0)
		{
			ctx.fillRect(level.mapToCanvas(this.x + 1), level.mapToCanvas(this.y), (this.explArea["East"] - 1) * blockSize, blockSize);
			sprite.draw(ctx, level.mapToCanvas(maxX), level.mapToCanvas(this.y), "right", 0);
		}
		
		
		ctx.fillStyle = sprite.pattern(ctx, "vertical", 0, "repeat");
		if(this.explArea["North"] > 0)
		{
			ctx.fillRect(level.mapToCanvas(this.x), level.mapToCanvas(minY + 1), blockSize, (this.explArea["North"] - 1) * blockSize);
			sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(minY), "up", 0);
		}
		if(this.explArea["South"] > 0)
		{
			ctx.fillRect(level.mapToCanvas(this.x), level.mapToCanvas(this.y + 1), blockSize, (this.explArea["South"] - 1) * blockSize);
			sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(maxY), "down", 0);
		}
	}
}
