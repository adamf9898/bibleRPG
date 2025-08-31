/**
 * world.ts
 * 
 * This module defines the World class for the BibleRPG game.
 * The World manages the game map, entities, and world state.
 */

export interface Position {
    x: number;
    y: number;
}

export interface Entity {
    id: string;
    name: string;
    position: Position;
    // Add more properties as needed
}

export class World {
    width: number;
    height: number;
    entities: Map<string, Entity>;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.entities = new Map();
    }

    addEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
    }

    removeEntity(entityId: string): void {
        this.entities.delete(entityId);
    }

    moveEntity(entityId: string, newPosition: Position): boolean {
        const entity = this.entities.get(entityId);
        if (!entity) return false;
        if (!this.isWithinBounds(newPosition)) return false;
        entity.position = newPosition;
        return true;
    }

    isWithinBounds(pos: Position): boolean {
        return (
            pos.x >= 0 &&
            pos.y >= 0 &&
            pos.x < this.width &&
            pos.y < this.height
        );
    }

    getEntity(entityId: string): Entity | undefined {
        return this.entities.get(entityId);
    }

    getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }
}