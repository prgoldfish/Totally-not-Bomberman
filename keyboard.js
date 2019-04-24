class KeyManager
{
    constructor()
    {
        this.keyMap = {};
    }

    keyDown(name)
    {
        console.log("Pressed " + name);
        this.keyMap[name] = true;
    }

    keyUp(name)
    {
        console.log("Released " + name);
        this.keyMap[name] = false;
    }

    isKeyDown(name)
    {
        if(this.keyMap[name] !== undefined)
        {
            return this.keyMap[name];
        }
        return false;
    }
}