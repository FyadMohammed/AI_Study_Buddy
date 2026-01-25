<script setup>
    import { ref } from "vue";

    const userTopic = ref("");

    const emit = defineEmits(["submitTopic"]);

    const handleGenerate = () => {
        if(userTopic.value.trim()){
            emit("submitTopic", userTopic.value);
        }
    }
</script>

<template>
    <div class="max-w-xl mx-auto mt-10 p-6 bg-white/10 backdrop-blur-md
    rounded-2xl border border-white/20 shadow-xl ">
    <h2 class="text-2xl font-bold mb-6">What do you want to learn today?</h2>
client
        <div class="flex gap-2">
            <input type="text"
            v-model="userTopic"
            placeholder="Enter your topic"
            class="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20
            focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            />
            <button
                @click="handleGenerate"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500
                to-indigo-500 text-white font-semibold rounded-xl
                active:scale-95 transition-all shadow-lg">
                Generate
            </button>
        </div>
    </div>
</template>