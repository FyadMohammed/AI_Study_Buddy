const databaseService = require('./services/databaseService');

console.log('--- Testing the database layer ---');

const fakeTopicPayload = {
    title: 'Photosynthesis (test)',
    summary: 'Plants convert sunlight into chemical energy stored as glucose.',
    flashcards: [
        { q: 'What gas do plants release?', a: 'Oxygen.' },
        { q: 'Where does photosynthesis happen?', a: 'In the chloroplasts of leaves.' }
    ],
    quiz: [
        {
            question: 'Which gas is released during photosynthesis?',
            choices: ['Carbon dioxide', 'Oxygen', 'Nitrogen'],
            answerIndex: 1
        }
    ]
};

console.log('\n1. Saving a fake topic...');
const savedTopicId = databaseService.saveTopic(fakeTopicPayload);
console.log('   Saved with id:', savedTopicId);

console.log('\n2. Listing all topics...');
const allTopics = databaseService.getAllTopics();
console.log('   Total topics in database:', allTopics.length);
allTopics.slice(0, 3).forEach((topic) => {
    console.log(`   - [${topic.id}] ${topic.title} (created ${topic.created_at})`);
});

console.log('\n3. Reading the saved topic back...');
const reloadedTopic = databaseService.getTopicById(savedTopicId);
console.log('   Title:           ', reloadedTopic.title);
console.log('   Flashcards count:', reloadedTopic.flashcards.length);
console.log('   Quiz count:      ', reloadedTopic.quiz.length);
console.log('   First flashcard: ', reloadedTopic.flashcards[0]);
console.log('   First quiz Q:    ', reloadedTopic.quiz[0]);

console.log('\n--- All checks passed ---');
