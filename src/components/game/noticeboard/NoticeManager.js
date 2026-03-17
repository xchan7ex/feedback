
export class NoticeManager {
    constructor(board) {
        this.board = board;
        this.notices = [];
    }

    initializeDefaults() {
        // Mock data - in real app, fetch from quests/state
        const defaultNotices = [
            {
                id: 'n1',
                text: "MISSING:\nCalculus Homework\nReward: 5 Credits",
                type: 'quest',
                color: 0xfffbea,
                x: -1.0, y: 0.6, rotation: -0.1
            },
            {
                id: 'n2',
                text: "EVENT:\nCampus Hackathon\nTonight at 8PM",
                type: 'info',
                color: 0xe6f2ff,
                x: 0.8, y: 0.7, rotation: 0.15
            },
            {
                id: 'n3',
                text: "FOR SALE:\nRusty Bike\nNeeds work.",
                type: 'trade',
                color: 0xffebcd,
                x: -0.9, y: -0.6, rotation: 0.05
            },
            {
                id: 'n4',
                text: "BEWARE:\nThe Dean is\nwatching.",
                type: 'warning',
                color: 0xffcccc,
                x: 0.7, y: -0.5, rotation: -0.12
            }
        ];

        defaultNotices.forEach(n => {
            this.board.addNotice(n);
        });
    }

    update(deltaTime, gameState) {
        // Logic to add/remove notices based on time/state
        // For example, if it's night, add spooky notices
    }
}
