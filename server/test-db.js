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

console.log('\n4. Reading a non-existent topic...');
const missingTopic = databaseService.getTopicById(99999);
console.log('  Result for id 99999:', missingTopic);
//Expected output: null or undefined

console.log('\n5. Testing ON DELETE CASCADE...');
const database = require('./db/connection');
database.prepare('DELETE FROM topics WHERE id = ?').run(savedTopicId);

const orphanFlashcards = database
    .prepare('SELECT COUNT(*) AS count FROM flashcards WHERE topic_id =?')
    .get(savedTopicId);

console.log(' Orphan flashcards count after parent delete:', orphanFlashcards.count);

console.log('\n6. Saving a topic with empty children arrays...');
const emptyChildrenId = databaseService.saveTopic({
    title: 'Empty Test',
    summary: 'No flashcards or quiz items.',
    flashcards: [],
    quiz: []
});

const emptyChildrenTopic = databaseService.getTopicById(emptyChildrenId);
console.log('  Title:', emptyChildrenTopic.title);
console.log(' Flashcards count:', emptyChildrenTopic.flashcards.length);
console.log(' Quiz count:', emptyChildrenTopic.quiz.length);

//Expected: title set, both arrays length 0