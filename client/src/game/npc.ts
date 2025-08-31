export interface NPC {
    id: string;
    name: string;
    description: string;
    dialogue: string[];
    position: {
        x: number;
        y: number;
    };
    sprite: string;
    interact: () => void;
}

export class BasicNPC implements NPC {
    id: string;
    name: string;
    description: string;
    dialogue: string[];
    position: { x: number; y: number };
    sprite: string;

    constructor(
        id: string,
        name: string,
        description: string,
        dialogue: string[],
        position: { x: number; y: number },
        sprite: string
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dialogue = dialogue;
        this.position = position;
        this.sprite = sprite;
    }

    interact() {
        // Example interaction: log the first dialogue line
        if (this.dialogue.length > 0) {
            console.log(`${this.name} says: "${this.dialogue[0]}"`);
        } else {
            console.log(`${this.name} has nothing to say.`);
        }
    }
}