// Placeholder for player actions and game logic

export type PlayerAction =
  | { type: 'move'; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'interact'; targetId: string }
  | { type: 'quest'; questId: string; action: 'start' | 'complete' }
  | { type: string; [key: string]: any }; // fallback for unknown actions

export function handlePlayerAction(action: PlayerAction, playerId: string) {
  switch (action.type) {
    case 'move':
      console.log(`Player ${playerId} moves ${action.direction}`);
      // TODO: Implement movement logic
      break;
    case 'interact':
      console.log(`Player ${playerId} interacts with ${action.targetId}`);
      // TODO: Implement interaction logic
      break;
    case 'quest':
      console.log(
        `Player ${playerId} ${action.action}s quest ${action.questId}`
      );
      // TODO: Implement quest logic
      break;
    default:
      console.log(`Player ${playerId} performed unknown action:`, action);
  }
}
