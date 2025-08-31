export interface PlayerStats {
    health: number;
    mana: number;
    strength: number;
    agility: number;
    intelligence: number;
    experience: number;
    level: number;
}

export interface PlayerInventoryItem {
    id: string;
    name: string;
    quantity: number;
}

export interface Player {
    id: string;
    name: string;
    stats: PlayerStats;
    inventory: PlayerInventoryItem[];
    gold: number;
}

export function createDefaultPlayer(name: string): Player {
    return {
        id: crypto.randomUUID(),
        name,
        stats: {
            health: 100,
            mana: 50,
            strength: 10,
            agility: 10,
            intelligence: 10,
            experience: 0,
            level: 1,
        },
        inventory: [],
        gold: 0,
    };
}