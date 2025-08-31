const SCRIPTURES = [
    {
        id: 1,
        book: "Genesis",
        chapter: 1,
        verse: 1,
        text: "In the beginning God created the heaven and the earth."
    },
    {
        id: 2,
        book: "Exodus",
        chapter: 20,
        verse: 13,
        text: "Thou shalt not kill."
    },
    {
        id: 3,
        book: "Psalm",
        chapter: 23,
        verse: 1,
        text: "The LORD is my shepherd; I shall not want."
    },
    {
        id: 4,
        book: "Isaiah",
        chapter: 53,
        verse: 5,
        text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."
    },
    {
        id: 5,
        book: "Matthew",
        chapter: 5,
        verse: 8,
        text: "Blessed are the pure in heart: for they shall see God."
    },
    {
        id: 6,
        book: "John",
        chapter: 3,
        verse: 16,
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
    },
    {
        id: 7,
        book: "Acts",
        chapter: 2,
        verse: 38,
        text: "Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost."
    },
    {
        id: 8,
        book: "Romans",
        chapter: 12,
        verse: 2,
        text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God."
    },
    {
        id: 9,
        book: "1 Corinthians",
        chapter: 13,
        verse: 4,
        text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,"
    },
    {
        id: 10,
        book: "Philippians",
        chapter: 4,
        verse: 13,
        text: "I can do all things through Christ which strengtheneth me."
    },
    {
        id: 11,
        book: "Philippians",
        chapter: 4,
        verse: 8,
        text: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things."
    },
    {
        id: 12,
        book: "1 Corinthians",
        chapter: 13,
        verse: 5,
        text: "Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;"
    },
    {
        id: 13,
        book: "1 Corinthians",
        chapter: 13,
        verse: 6,
        text: "Rejoiceth not in iniquity, but rejoiceth in the truth;"
    },
    {
        id: 14,
        book: "1 Corinthians",
        chapter: 13,
        verse: 7,
        text: "Beareth all things, believeth all things, hopeth all things, endureth all things."
    }
];

const QUESTS = [
    {
        id: 1,
        npc: 1,
        title: "The Good Samaritan",
        dialogue: "NPC: 'A certain man went down from Jerusalem to Jericho...' (Luke 10:30-37)\nWill you help your neighbor?",
        completion: "You have shown kindness, just as the Good Samaritan did.",
        scripture: "Luke 10:30-37",
        scriptureText: "And Jesus answering said, A certain man went down from Jerusalem to Jericho, and fell among thieves... (full passage here)",
        completed: false,
    },
    {
        id: 2,
        npc: 2,
        title: "The Great Commission",
        dialogue: "NPC: 'Go ye therefore, and teach all nations...' (Matthew 28:19)\nWill you share the gospel?",
        completion: "You have shared the good news!",
        scripture: "Matthew 28:19",
        scriptureText: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.",
        completed: false,
    },
    {
        id: 3,
        npc: 1,
        title: "The Lost Sheep",
        dialogue: "NPC: 'What man of you, having an hundred sheep, if he lose one of them...' (Luke 15:4-7)\nWill you seek the lost?",
        completion: "You found the lost sheep and brought it home.",
        scripture: "Luke 15:4-7",
        scriptureText: "What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it?...",
        completed: false,
    },
    {
        id: 4,
        npc: 2,
        title: "Think on These Things",
        dialogue: "NPC: 'Finally, brethren, whatsoever things are true, honest, just, pure...' (Philippians 4:8)\nWill you meditate on virtue?",
        completion: "You have grown in wisdom by thinking on virtuous things.",
        scripture: "Philippians 4:8",
        scriptureText: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.",
        completed: false,
        virtueReward: { virtue: 2, praise: 1, think: 3 }
    },
    {
        id: 5,
        npc: 1,
        title: "Love Envieth Not",
        dialogue: "NPC: 'Charity suffereth long, and is kind; charity envieth not...' (1 Corinthians 13:4)\nWill you practice selfless love?",
        completion: "You have shown charity that envieth not and seeketh not her own.",
        scripture: "1 Corinthians 13:4-5",
        scriptureText: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;",
        completed: false,
        virtueReward: { charity: 3, kind: 2, 'envieth_not': 2, 'not_self_seeking': 2 }
    },
    {
        id: 6,
        npc: 2,
        title: "Rejoice in Truth",
        dialogue: "NPC: 'Rejoiceth not in iniquity, but rejoiceth in the truth...' (1 Corinthians 13:6)\nWill you stand for truth?",
        completion: "You have chosen truth over falsehood and gained honesty.",
        scripture: "1 Corinthians 13:6",
        scriptureText: "Rejoiceth not in iniquity, but rejoiceth in the truth;",
        completed: false,
        virtueReward: { true: 3, honest: 2, just: 1 }
    }
];
