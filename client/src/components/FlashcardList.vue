<script setup>
import {ref} from 'vue';

defineProps({
    flashcards: {
        type: Array,
        required: true
    }
});

const flipped = ref({});

const toggleFlip = (index) => {
    flipped.value[index] = !flipped.value[index];
};


</script>

<template>
    <div class="max-w-2xl mx-auto mt-8">
        <h2 class="text-2xl font-bold mb-4 text-slate-100">Flash Cards</h2>
        <div
            v-for="(card,index) in flashcards"
            :key="index"
            @click="toggleFlip(index)"
            class="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 cursor-pointer mb-4
            hover:border-purple-500/50 transition-all"
        >
        <div v-if="!flipped[index]">
            <p class="text-sm text-purple-400 mb-2">Question</p>
            <p class="text-lg text-slate-200"> {{ card.question }}</p>
        </div>

        <div v-else>
            <p class="text-sm text-green-400 mb-2">Answer</p>
            <p class="text-lg text-slate-200"> {{ card.answer }}</p>
        </div>
        <p class="text-xs text-slate-500 mt-4 text-center">Click to flip card</p>
        </div>
    </div>
</template>