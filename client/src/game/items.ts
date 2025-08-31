export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    value: number;
    weight: number;
    effects?: Record<string, number | string>;
    stackable?: boolean;
}

export const items: Item[] = [
    {
        id: 'sword_iron',
        name: 'Iron Sword',
        description: 'A sturdy iron sword. Reliable in battle.',
        type: 'weapon',
        value: 100,
        weight: 5,
        effects: { attack: 5 },
    },
    {
        id: 'armor_leather',
        name: 'Leather Armor',
        description: 'Light armor made from toughened leather.',
        type: 'armor',
        value: 75,
        weight: 8,
        effects: { defense: 3 },
    },
    {
        id: 'potion_healing',
        name: 'Healing Potion',
        description: 'Restores a small amount of health.',
        type: 'consumable',
        value: 25,
        weight: 0.5,
        effects: { heal: 20 },
        stackable: true,
    },
    {
        id: 'scroll_ancient',
        name: 'Ancient Scroll',
        description: 'A mysterious scroll with unreadable text.',
        type: 'quest',
        value: 0,
        weight: 0.2,
    },
    {
        id: 'coin_gold',
        name: 'Gold Coin',
        description: 'A shiny gold coin. Currency of the realm.',
        type: 'misc',
        value: 1,
        weight: 0.01,
        stackable: true,
    },
];