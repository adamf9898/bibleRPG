import React from 'react';

type Quest = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
};

type QuestLogProps = {
    quests: Quest[];
    onSelectQuest?: (quest: Quest) => void;
};

const QuestLog: React.FC<QuestLogProps> = ({ quests, onSelectQuest }) => {
    return (
        <div className="quest-log">
            <h2>Quest Log</h2>
            {quests.length === 0 ? (
                <p>No quests available.</p>
            ) : (
                <ul>
                    {quests.map((quest) => (
                        <li
                            key={quest.id}
                            className={quest.completed ? 'completed' : ''}
                            onClick={() => onSelectQuest && onSelectQuest(quest)}
                            style={{ cursor: onSelectQuest ? 'pointer' : 'default' }}
                        >
                            <strong>{quest.title}</strong>
                            <p>{quest.description}</p>
                            {quest.completed && <span style={{ color: 'green' }}>✔ Completed</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default QuestLog;