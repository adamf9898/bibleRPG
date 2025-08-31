// Placeholder for world state and logic
export interface World {
  locations: Location[];
  npcs: NPC[];
  events: GameEvent[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  scripture: string;
}

export interface NPC {
  id: string;
  name: string;
  dialog: string[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  triggered: boolean;
}

export const initialWorld: World = {
  locations: [],
  npcs: [],
  events: [],
};
