<script setup>
// ─── STUDY PAGE ──────────────────────────────────────────────────────────────
// Shows one topic: summary, flashcards, quiz.
//
// What it does:
//   Reads the id out of the URL, fetches that topic from the backend, and
//   hands the three pieces to the three display components.
//
// Where its data comes from:
//   Always GET /topics/:id. Never from the previous page. That means this one
//   screen serves both paths — a topic you just generated and a topic you
//   clicked in the history list — with no special cases.
//
// What it talks to:
//   - the router, for the :id parameter
//   - apiClient.getTopicById
//   - SummaryCard, FlashcardList, QuizCard
// ─────────────────────────────────────────────────────────────────────────────

import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SummaryCard   from '../components/SummaryCard.vue';
import FlashcardList from '../components/FlashcardList.vue';
import QuizCard      from '../components/QuizCard.vue';
import { getTopicById } from '../api/apiClient';

// useRoute() gives the CURRENT route, including its parameters.
// Note: useRoute (singular route, read what we are on)
//       vs useRouter (the thing you navigate WITH).
const route = useRoute();

const isLoading = ref(false);
const error     = ref(null);
const studyData = ref(null);

const loadTopic = async (topicId) => {
    // Three answers at the top: working, no error yet, nothing to show yet.
    isLoading.value = true;
    error.value     = null;
    studyData.value = null;

    try {
        studyData.value = await getTopicById(topicId);
    } catch (caughtError) {
        error.value = caughtError.message;
    } finally {
        isLoading.value = false;
    }
};

// watch(..., { immediate: true }) does two jobs in one line:
//   immediate -> run once now, for the id we arrived with
//   watch     -> run again whenever the id in the URL changes
//
// The second half matters. Going from /study/4 to /study/7 reuses this same
// component instance — Vue does not rebuild a page just because a parameter
// changed. Without the watch, the URL would update and the content would not.
watch(() => route.params.id, (newId) => {
    if (newId) loadTopic(newId);
}, { immediate: true });

const handleQuizComplete = ({ score, total }) => {
    console.log(`Quiz complete: ${score}/${total}`);
};
</script>

<template>
    <div>
        <!-- Loading -->
        <div v-if="isLoading"
             class="max-w-xl mx-auto mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
            <div class="flex items-center gap-3">
                <div class="h-5 w-5 rounded-full border-2 border-blue-300/30 border-t-blue-300 animate-spin"></div>
                <p class="text-blue-300">Loading topic...</p>
            </div>
        </div>

        <!-- Error -->
        <div v-if="error"
             class="max-w-xl mx-auto mt-6 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
            <p class="text-red-300">{{ error }}</p>
            <RouterLink to="/" class="text-red-200 underline text-sm mt-2 inline-block">
                Back to home
            </RouterLink>
        </div>

        <!-- The topic -->
        <template v-if="studyData">
            <h2 class="max-w-2xl mx-auto text-3xl font-bold text-slate-100 mb-1">
                {{ studyData.title }}
            </h2>
            <p v-if="studyData.created_at" class="max-w-2xl mx-auto text-sm text-slate-500 mb-4">
                Studied {{ studyData.created_at }}
            </p>

            <SummaryCard :summary="studyData.summary" />

            <FlashcardList v-if="studyData.flashcards" :flashcards="studyData.flashcards" />

            <!-- :key tells Vue this is a different quiz when the id changes, so
                 it destroys the old instance instead of reusing it. Without it,
                 the previous topic's score and position would survive. -->
            <QuizCard
                v-if="studyData.quiz"
                :key="studyData.id"
                :quiz="studyData.quiz"
                @scoreComplete="handleQuizComplete"
            />
        </template>
    </div>
</template>
