import { Quest } from '../../shared/types';

export const quests: Quest[] = [
  {
    id: 'quest1',
    title: 'The Good Samaritan',
    description: 'Help a stranger in need, as told in Luke 10:25-37.',
    scripture: 'Luke 10:25-37',
    completed: false,
  },
  {
    id: 'quest2',
    title: 'David and Goliath',
    description: 'Face a giant challenge with faith, as David did.',
    scripture: '1 Samuel 17',
    completed: false,
  },
  {
    id: 'quest3',
    title: 'The Prodigal Son',
    description: 'Experience forgiveness and return home.',
    scripture: 'Luke 15:11-32',
    completed: false,
  },
  // Add more scripture-based quests here
];
