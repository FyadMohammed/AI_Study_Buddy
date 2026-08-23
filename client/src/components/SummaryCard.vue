<script setup>

//We define what data this component "recieves"
defineProps({
    summary: {
        type: String,
        required: true
    }
});
</script>

<template>
    <!-- main container with glassmorphism ( transparency + blur ) -->
    <div class="bg-slate-800/50 backdrop-blur-md rounded-2xl mt-3 p-7 border border-slate-700/50 shadow-xl mb-8">
        <div class="p-3 bg-purple-500/20 rounded-lg text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M8 7h6" />
                <path d="M8 11h8" />
            </svg>
        </div>
        <h2 class="text-2xl font-semibold text-slate-100">Topic Summary</h2>

        <div class="text-slate-300 leading-relaxed text-lg">
            {{ summary }}
        </div>
    </div>
</template>