<script setup>
// ─── HOME PAGE ───────────────────────────────────────────────────────────────
// The landing screen. Welcome text, the topic box, and nothing else.
//
// What it does:
//   Takes a topic, asks the backend to generate study material, then sends the
//   user to /study/<new id>.
//
// What it does NOT do:
//   Render the summary, flashcards or quiz. Those belong to StudyPage. This
//   page's only job is to turn a typed topic into an id and navigate.
//
// Why navigate instead of showing the results here:
//   The generated topic now has a row in the database and a real URL. The user
//   can bookmark /study/68, reload it, or reach the same screen later from the
//   history list. One screen renders a topic, no matter where it came from.
// ─────────────────────────────────────────────────────────────────────────────

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TopicInput from '../components/TopicInput.vue';
import { generateTopic } from '../api/apiClient';

// useRouter() gives the object used to navigate in code,
// the equivalent of clicking a link.
const router = useRouter();

const isLoading = ref(false);
const error     = ref(null);

const handleTopicSubmit = async (topic) => {
    // Three answers, at the top, before anything can go wrong:
    // working = yes, error = none, results = none (there are none to hold here).
    isLoading.value = true;
    error.value     = null;

    try {
        const studyPayload = await generateTopic(topic);

        // Success: hand over to StudyPage via the URL.
        router.push({ name: 'study', params: { id: studyPayload.id } });

    } catch (caughtError) {
        // apiClient has already logged the technical detail and handed us a
        // sentence meant for a human.
        error.value = caughtError.message;

    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <TopicInput @submitTopic="handleTopicSubmit" />

        <!-- Loading indicator -->
        <div v-if="isLoading"
             class="max-w-xl mx-auto mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
            <div class="flex items-center gap-3">
                <div class="h-5 w-5 rounded-full border-2 border-blue-300/30 border-t-blue-300 animate-spin"></div>
                <p class="text-blue-300">Generating study material...</p>
            </div>
        </div>

        <!-- Error message -->
        <div v-if="error"
             class="max-w-xl mx-auto mt-6 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
            <p class="text-red-300">{{ error }}</p>
        </div>

        <!-- Idle hint -->
        <p v-if="!isLoading && !error" class="text-center text-slate-500 mt-10">
            Type a topic above, or browse what you have already studied.
        </p>
    </div>
</template>
