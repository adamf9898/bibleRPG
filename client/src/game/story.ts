/**
 * story.ts
 * 
 * Contains the main story structure and utilities for the Bible RPG game.
 */

export type StoryNode = {
    id: string;
    text: string;
    choices: Choice[];
};

export type Choice = {
    text: string;
    nextNodeId: string;
    effect?: (state: GameState) => void;
};

export type GameState = {
    inventory: string[];
    flags: Record<string, boolean>;
    [key: string]: any;
};

export const storyNodes: Record<string, StoryNode> = {
    start: {
        id: "start",
        text: "You awaken in a quiet village in ancient Israel. The sun rises over the hills. What will you do?",
        choices: [
            { text: "Visit the marketplace", nextNodeId: "marketplace"```
/**
 * story.ts
 *
 * Defines the story structure and utilities for the Bible RPG game.
 */

export type StoryNode = {
    id: string;
    text: string;
    choices: Choice[];
};

export type Choice = {
    text: string;
    nextNodeId: string;
    effect?: (state: GameState) => void;
};

export type GameState = {
    inventory: string[];
    flags: Record<string, boolean>;
    [key: string]: any;
};

export const storyNodes: Record<string, StoryNode> = {
    start: {
        id: "start",
        text: "You find yourself in a peaceful village at sunrise. The day is full of possibilities. What would you like to do?",
        choices: [
            { text: "Explore the village square", nextNodeId: "villageSquare" },
            { text: "Visit the nearby fields", nextNodeId: "fields" }
        ]
    },
    villageSquare: {
        id: "villageSquare",
        text: "The village square is bustling with activity. Merchants are setting up their stalls.",
        choices: [
            { text: "Talk to a merchant", nextNodeId: "merchant" },
            { text: "Return to the village entrance", nextNodeId: "start" }
        ]
    },
    fields: {
        id: "fields",
        text: "The fields are quiet, with a gentle breeze blowing through the crops.",
        choices: [
            { text: "Help a farmer", nextNodeId: "farmer" },
            { text: "Return to the village entrance", nextNodeId: "start" }
        ]
    },
    merchant: {
        id: "merchant",
        text: "The merchant greets you warmly and offers to show you his wares.",
        choices: [
            { text: "Browse wares", nextNodeId: "browseWares" },
            { text: "Say goodbye", nextNodeId: "villageSquare" }
        ]
    },
    farmer: {
        id: "farmer",
        text: "The farmer thanks you for your help and offers you some fresh produce.",
        choices: [
            { text: "Accept the gift", nextNodeId: "fields", effect: (state) => { state.inventory.push('Fresh Produce'); } },
            { text: "Decline politely", nextNodeId: "fields" }
        ]
    },
    browseWares: {
        id: "browseWares",
        text: "You see a variety of goods: pottery, cloth, and spices.",
        choices: [
            { text: "Buy pottery", nextNodeId: "villageSquare", effect: (state) => { state.inventory.push('Pottery'); } },
            { text: "Return to the square", nextNodeId: "villageSquare" }
        ]
    }
};