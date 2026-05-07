<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    quiz: {
        type: Array,
        required: true
    }
});

//outgoing event to parent component to send score data when quiz is complete
const emit = defineEmits(["scoreComplete"]);

//reference variables declared that vue watches for changes and updates the UI

const currentIndex = ref(0); // track which question we're on
const selectedIndex = ref(null); // track which choice the user has selected for the current question, null if none selected
const score = ref(0); // track how many questions the user has answered correctly
const finished = ref(false); // track whether the quiz is finished

// 
const currentQuestion = computed(() => props.quiz[currentIndex.value]);
const isAnswered = computed(() => selectedIndex.value !== null);
const isCorrect = computed(
    () => isAnswered.value && selectedIndex.value === currentQuestion.value.answerIndex
);

const selectChoice = (index) => {
    if (isAnswered.value) return;
    selectedIndex.value = index;
    if (index === currentQuestion.value.answerIndex) {
        score.value++;
    }
};

const nextQuestion = () => {
    if (currentIndex.value < props.quiz.length - 1) {
        currentIndex.value++;
        selectedIndex.value = null;
    } else {
        finished.value = true;
        emit("scoreComplete", { score: score.value, total: props.quiz.length });
    }
};

const restart = () => {
    currentIndex.value = 0;
    selectedIndex.value = null;
    score.value = 0;
    finished.value = false;
};

const choiceClass = (index) => {
    if (!isAnswered.value) {
        return "bg-slate-700/40 border-slate-600/50 hover:border-purple-500/50 hover:bg-slate-700/60";
    }
    if (index === currentQuestion.value.answerIndex) {
        return "bg-green-500/20 border-green-400/50 text-green-200";
    }
    if (index === selectedIndex.value) {
        return "bg-red-500/20 border-red-400/50 text-red-200";
    }
    return "bg-slate-700/30 border-slate-600/30 text-slate-400";
};
</script>

<template>
    <div class="max-w-2xl mx-auto mt-8">
        <h2 class="text-2xl font-bold mb-4 text-slate-100">Quiz</h2>

        <div v-if="!finished" class="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
            <p class="text-sm text-purple-400 mb-2">
                Question {{ currentIndex + 1 }} of {{ quiz.length }}
            </p>
            <p class="text-lg text-slate-200 mb-6">{{ currentQuestion.question }}</p>

            <div class="space-y-3">
                <button
                    v-for="(choice, index) in currentQuestion.choices"
                    :key="index"
                    @click="selectChoice(index)"
                    :disabled="isAnswered"
                    :class="choiceClass(index)"
                    class="w-full text-left px-4 py-3 rounded-xl border transition-all text-slate-200 disabled:cursor-not-allowed"
                >
                    {{ choice }}
                </button>
            </div>

            <div v-if="isAnswered" class="mt-6 flex items-center justify-between">
                <p :class="isCorrect ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                    {{ isCorrect ? 'Correct!' : 'Incorrect.' }}
                </p>
                <button
                    @click="nextQuestion"
                    class="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold active:scale-95 transition-all shadow-lg"
                >
                    {{ currentIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz' }}
                </button>
            </div>
        </div>

        <div v-else class="bg-slate-800/50 backdrop-blur-md rounded-xl p-8 border border-slate-700/50 text-center">
            <p class="text-sm text-purple-400 mb-2">Quiz Complete</p>
            <p class="text-4xl font-bold text-slate-100 mb-2">
                {{ score }} / {{ quiz.length }}
            </p>
            <p class="text-slate-400 mb-6">
                You scored {{ Math.round((score / quiz.length) * 100) }}%
            </p>
            <button
                @click="restart"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold active:scale-95 transition-all shadow-lg"
            >
                Try Again
            </button>
        </div>
    </div>
</template>
