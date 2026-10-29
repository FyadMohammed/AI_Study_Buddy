<script setup>
// ─── HISTORY PAGE ────────────────────────────────────────────────────────────
// Every topic studied so far, newest first.
//
// What it does:
//   Fetches the list once when the page opens, renders a row per topic, and
//   navigates to /study/<id> when one is clicked.
//
// Why the list is lightweight:
//   GET /topics returns only id, title and created_at. The flashcards and quiz
//   are not fetched here because this screen never shows them — pulling them
//   for every row would be three extra queries per topic for data nobody reads.
//   StudyPage fetches the full topic when one is actually opened.
//
// What it talks to:
//   - apiClient.getTopics
//   - the router, via <RouterLink>
// ─────────────────────────────────────────────────────────────────────────────

import { ref, onMounted } from 'vue';
import { getTopics } from '../api/apiClient';

const isLoading = ref(false);
const error     = ref(null);
const topics    = ref([]);

const loadTopics = async () => {
    isLoading.value = true;
    error.value     = null;

    try {
        topics.value = await getTopics();
    } catch (caughtError) {
        error.value = caughtError.message;
    } finally {
        isLoading.value = false;
    }
};

// onMounted runs once, right after this component first appears on screen.
// Fetching in setup directly would also work, but onMounted is the conventional
// place and keeps "when does this happen" obvious to anyone reading.
onMounted(loadTopics);
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-slate-100 mb-6">Your topics</h2>

        <!-- Loading -->
        <div v-if="isLoading"
             class="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
            <div class="flex items-center gap-3">
                <div class="h-5 w-5 rounded-full border-2 border-blue-300/30 border-t-blue-300 animate-spin"></div>
                <p class="text-blue-300">Loading your topics...</p>
            </div>
        </div>

        <!-- Error -->
        <div v-if="error"
             class="p-4 bg-red-500/20 rounded-xl border border-red-400/30">
            <p class="text-red-300">{{ error }}</p>
            <button @click="loadTopics"
                    class="mt-3 px-4 py-2 rounded-lg bg-red-500/30 text-red-100 text-sm">
                Try again
            </button>
        </div>

        <!-- Empty -->
        <div v-if="!isLoading && !error && topics.length === 0"
             class="p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-center">
            <p class="text-slate-400 mb-4">You haven't studied anything yet.</p>
            <RouterLink to="/"
                        class="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold inline-block">
                Start a topic
            </RouterLink>
        </div>

        <!-- The list -->
        <div v-if="topics.length > 0" class="space-y-3">
            <!-- RouterLink renders a real <a> and navigates without reloading
                 the page. :key uses the row id, which is unique and stable. -->
            <RouterLink
                v-for="topic in topics"
                :key="topic.id"
                :to="{ name: 'study', params: { id: topic.id } }"
                class="block p-5 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50
                       hover:border-purple-500/50 hover:bg-slate-800/70 transition-all"
            >
                <p class="text-lg font-semibold text-slate-100">{{ topic.title }}</p>
                <p class="text-sm text-slate-500 mt-1">{{ topic.created_at }}</p>
            </RouterLink>
        </div>
    </div>
</template>
