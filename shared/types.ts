// Shared types between client and server
export interface Player {
  id: string;
  name: string;
  location: string;
  inventory: Item[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  scripture: string;
  completed: boolean;
}
