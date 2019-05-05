class Sprite // Classe permettant de stocker différentes image pour faire des animations
{
    constructor(frames)
    {
        // Contient toutes images pour chaque direction possible
        this.frames = frames;
    }

    draw(ctx, x, y, dir, step) // Dessine l'image en direction dir n°step aux coordonnées (x,y) dans le contexte ctx
    {
        let n = this.frames[dir].length;
        ctx.drawImage(this.frames[dir][step % n], x, y)
    }

    pattern(ctx, dir, step, mode) // Crée un pattern (Une image qui se repète)
    {
        let n = this.frames[dir].length;
        return ctx.createPattern(this.frames[dir][step % n], mode)
    }
}
