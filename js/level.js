class Level{
	constructor(blockSize){
		//coordonnées du spawn (en haut à gauche par défaut)
		this.playerSpawn = [0, 0];
		// Dimensions en cases du niveau
		this.width = 19;
		this.height = 13;

		// Carte du jeu
		this.map = [];

		// Bombes et explosions actuellemnt sur le terrain
		this.bombs = [];
		this.explosions = [];
		this.blockSize = blockSize; //Taille d'une case en pixels
		
		for (let i = 0; i < this.height; i++) { // Initialisation par défaut du niveau (Que de l'herbe)
			let line = [];
			for (let j = 0; j < this.width; j++) {
				line.push(new Case(caseTypes.GROUND));
			}
			this.map.push(line);
		}
	}

	init(lvlName) // Chargement du niveau via un serveur distant
	{
		return new Promise((success, fail) => {
			let req = new XMLHttpRequest();
			req.addEventListener("readystatechange", (ev) => {
				if(req.readyState == req.DONE)
				{
					if(req.status == 200) // Si la requête est un succès
					{
						let lvl = JSON.parse(req.responseText);
						if(!Level.checkLevel(lvl)) // On vérifie si le niveau est valide
						{
							fail("Niveau invalide");
							return;
						}
						for (const coord of lvl.Boxes) // On place toutes les caisses
						{
							this.putOnMap(coord, caseTypes.BOX)
						}
						for (const coord of lvl.Blocks) // On place les blocs indestructibles
						{
							this.putOnMap(coord, caseTypes.BLOCK);
						}
						this.putOnMap(lvl.Exit, caseTypes.EXIT); // On place la sortie
						this.putOnMap(lvl.PlayerSpawn, caseTypes.PLAYERSPAWN); // On place l'endroit de spawn du joueur
						this.playerSpawn = lvl.PlayerSpawn;
						success();
					}
					else // En cas d'échec du chargement distant
					{
						let errorText;
						if(req.status == 0) // Cette erreur survient quand la page est chargée directement (avec file://) et non via le serveur
						{
							errorText = "La page web doit-être chargée via le serveur et non directement."
						}
						else // Erreur 404, etc...
						{
							errorText = "Erreur " + req.status + " " + req.statusText;
						}
						
						fail(errorText);
					}
				}
			});
			req.open("GET", "level?lvl=" + lvlName, true); // Création de la requête
			req.send(); // Envoi
		});
	}

	putOnMap(coords, typeCase) // Change le type de d'une case
	{
		if(coords[0] < this.width && coords[1] < this.height && coords[0] >= 0 && coords[1] >= 0) // On vérifie qua la case est bien dans le niveau
		{
			this.map[coords[1]][coords[0]].type = typeCase;
		}
	}

	static checkLevel(level) // Vérifie si un niveau (dans un objet JSON) est valide
	{
		// On vérifie si les champs "Boxes", "Blocks", "Exit" et "PlayerSpawn" existent
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

	isBombHere(coords) // Indique si une bombe est à telles coordonnées
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
		return coord * this.blockSize; // On multiplie par la taille d'une case
	}
};

class Case
{
	constructor(typeCase)
	{
		this.type = typeCase; // Type de case : Sol, Boite, Bloc, Sortie ou Spawn
		this.destroyed = false; // Indique si la case est détruite
		this.exploding = false; // Indique si la case est en train d'être détruite (pour les animations)
	}

	destroy(timer) // Détruit la case au bout de timer ms
	{
		if(this.type == caseTypes.BOX || this.type == caseTypes.EXIT) // Seules les cases BOX et EXIT peuvent être détruites
		{
			this.exploding = true;
			window.setTimeout(() => {
				this.destroyed = true;
			}, timer);
			return true;
		}
		else
		{
			return false;
		}
	}

	canBlock() // Indique si la case peut bloque le joueur ou une explosion
	{
		switch(this.type)
		{
			case caseTypes.GROUND:
			case caseTypes.PLAYERSPAWN:
				return false;
			
			case caseTypes.BOX: // Peut bloquer seulement si la case n'est pas détruite
			case caseTypes.EXIT: 
				return !this.destroyed;

			case caseTypes.BLOCK:
				return true;
			
			default:
				return false;
		}
	}
}

// Les différents types de cases
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
		// Horaire où la bombe a été posée
		this.putTime = putTime;
		// Depuis combien de temps la bombe a été posée
		this.timeSincePut = 0;
		// Si la bombe a explosé ou non
		this.exploded = false;
		//Coordonnées de la bombe
		this.x = coords[0];
		this.y = coords[1];
	}

	explode(actualTime) // Fait exploser la bombe si le décompte (5 secs) est écoulé
	{
		this.timeSincePut = actualTime - this.putTime;
		if(!this.exploded && this.timeSincePut >= 5000)  // explose au bout de 5 secondes
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
		this.explArea = { // Taille de l'explosion dans chaque direction
			"North" : 0,
			"West" : 0,
			"East" : 0,
			"South" : 0
		};
		// Coordonnées du centre de l'explosion
		this.x = x;
		this.y = y;
		// Horaire du début de l'explosion
		this.explTime = actualTime;

		// Détermination de la zone de l'explosion (Direction Est)
		for (let i = 1; i <= explSize; i++) { //Pour explSize cases s'éloignant du centre vers l'est
			
			if((this.x + i) < level.width)
			{
				if(level.map[y][this.x + i].canBlock()) // On vérifie si la case peut bloquer une explosion
				{
					level.map[y][this.x + i].destroy(explDuration); // On la détruit (Ne fonctionne que si la case est destructible)
					break;
				}
				else
				{
					this.explArea["East"]++; // On augmente la zone de l'explosion
				}
				
			}
			else // Si on dépasse du niveau
			{
				break;
			}
		}

		// Détermination de la zone de l'explosion (Direction Ouest)
		for (let i = 1; i <= explSize; i++) { //Pour explSize cases s'éloignant du centre vers l'ouest
			
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

		// Détermination de la zone de l'explosion (Direction Sud)
		for (let i = 1; i <= explSize; i++) { //Pour explSize cases s'éloignant du centre vers le sud
			
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

		// Détermination de la zone de l'explosion (Direction Nord)
		for (let i = 1; i <= explSize; i++) { //Pour explSize cases s'éloignant du centre vers le nord
			
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

	inArea(coords) // Détermine si les coordonnées en paramètre sont dans la zone de l'explosion
	{
		//On récupère les coordonées min et max de x et y 
		let minX = this.x - this.explArea["West"];
		let maxX = this.x + this.explArea["East"];
		let minY = this.y - this.explArea["North"];
		let maxY = this.y + this.explArea["South"];

		//Si le y des coordonnées correspond au y des explosions et que le x des coordonées est compris entre minX et maxX
		if(minX <= coords[0] && maxX >= coords[0] && this.y == coords[1])
		{
			return true; // Dans la ligne horizontale de l'explosion
		}
		//Si le x des coordonnées correspond au y des explosions et que le y des coordonées est compris entre minY et maxY
		if(minY <= coords[1] && maxY >= coords[1] && this.x == coords[0])
		{
			return true; // Dans la ligne verticale de l'explosion
		}

		return false;
	}

	draw(ctx, sprite, level, blockSize) // Dessine l'explosion
	{
		//On récupère les coordonées min et max de x et y 
		let minX = this.x - this.explArea["West"];
		let maxX = this.x + this.explArea["East"];
		let minY = this.y - this.explArea["North"];
		let maxY = this.y + this.explArea["South"];

		// Dessin du centre
		sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(this.y), "center", 0);
		
		// Dessin des 4 branches de l'explosion
		ctx.fillStyle = sprite.pattern(ctx, "horizontal", 0, "repeat"); // On crée le pattern pour la partie horizontale de l'explosion

		if(this.explArea["West"] > 0) //Branche gauche
		{
			ctx.fillRect(level.mapToCanvas(minX + 1), level.mapToCanvas(this.y), (this.explArea["West"] - 1) * blockSize, blockSize); //Dessin de la partie horizontale
			sprite.draw(ctx, level.mapToCanvas(minX), level.mapToCanvas(this.y), "left", 0); // Dessin du bout gauche de l'explosion
		}
		if(this.explArea["East"] > 0) // Branche droite
		{
			ctx.fillRect(level.mapToCanvas(this.x + 1), level.mapToCanvas(this.y), (this.explArea["East"] - 1) * blockSize, blockSize); //Dessin de la partie horizontale
			sprite.draw(ctx, level.mapToCanvas(maxX), level.mapToCanvas(this.y), "right", 0); // Dessin du bout droit de l'explosion
		}
		
		
		ctx.fillStyle = sprite.pattern(ctx, "vertical", 0, "repeat"); // On crée le pattern pour la partie verticale de l'explosion
		if(this.explArea["North"] > 0) //Branche du haut
		{
			ctx.fillRect(level.mapToCanvas(this.x), level.mapToCanvas(minY + 1), blockSize, (this.explArea["North"] - 1) * blockSize); //Dessin de la partie verticale
			sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(minY), "up", 0); // Dessin du bout du haut de l'explosion
		}
		if(this.explArea["South"] > 0) //Branche du bas
		{
			ctx.fillRect(level.mapToCanvas(this.x), level.mapToCanvas(this.y + 1), blockSize, (this.explArea["South"] - 1) * blockSize); //Dessin de la partie verticale
			sprite.draw(ctx, level.mapToCanvas(this.x), level.mapToCanvas(maxY), "down", 0); // Dessin du bout du bas de l'explosion
		}
	}
}
