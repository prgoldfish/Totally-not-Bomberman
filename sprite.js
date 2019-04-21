class Sprite
{
    constructor(frames)
    {
        this.frames = frames;
    }

    draw(ctx, x, y, dir, step)
    {
        let n = this.frames[dir].length;
        ctx.drawImage(this.frames[dir][step % n], x, y)
    }

    pattern(ctx, dir, step, mode)
    {
        let n = this.frames[dir].length;
        return ctx.createPattern(this.frames[dir][step % n], mode)
    }
}
