// /workspaces/bibleRPG/client/src/game/quests.ts

export type QuestStatus = 'not-started' | 'in-progress' | 'completed' | 'failed';

export interface QuestObjective {
    id: string;
    description: string;
    completed: boolean;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    objectives: QuestObjective[];
    status: QuestStatus;
    rewards?: string[];
}

export class QuestManager {
    private quests: Map<string, Quest> = new Map();

    addQuest(quest: Quest): void {
        this.quests.set(quest.id, quest);
    }

    getQuest(id: string): Quest | undefined {
        return this.quests.get(id);
    }

    updateQuestStatus(id: string, status: QuestStatus): void {
        const quest = this.quests.get(id);
        if (quest) {
            quest.status = status;
        }
    }

    completeObjective(questId: string, objectiveId: string): void {
        const quest = this.quests.get(questId);
        if (quest) {
            const obj = quest.objectives.find(o => o.id === objectiveId);
            if (obj) {
                obj.completed = true;
                if (quest.objectives.every(o => o.completed)) {
                    quest.status = 'completed';
                }
            }
        }
    }

    getAllQuests(): Quest[] {
        return Array.from(this.quests.values());
    }
}