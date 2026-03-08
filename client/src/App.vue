<script setup>
import TopicInput from "./components/TopicInput.vue";
import SummaryCard from "./components/SummaryCard.vue";
import FlashcardList from "./components/FlashcardList.vue";
import { ref } from 'vue' // Add this!

//1. Loading the state: is the AI thinking?

const isLoading = ref(false);

//2. Study Data: This will hold the AI's response
const studyData = ref(null);

//3. Error State: What if the AI fails?
const error = ref(null);

const handleTopicSubmit = async (topic) => {
  console.log("Starting AI generation for:", topic);

  isLoading.value = true;

  try {
    const res = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!res.ok) {
      throw new Error('Server error');
    }

    const data = await res.json();

    studyData.value = {
      summary: data.summary,
      flashcards: data.flashcards,
      quiz: data.quiz
    };
  } catch (e) {
    console.error(e);
    error.value = "Failed to generate study material. Please try again.";
  } finally {
    isLoading.value = false;
  }

}
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] text-white font-sans p-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500
      bg-clip-text text-transparent mb-2">Study Buddy</h1>
      <p class="text-slate-400">Your AI Study Partner</p>
    </header>

    <main>
      <TopicInput @submitTopic="handleTopicSubmit" />
      
      <!-- Loading Indicator  -->
      <div v-if="isLoading" class="max-w-xl mx-auto mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
        <p class="text-blue-300">Generating study material...</p>
      </div>

      <!-- Error Message -->
       <div v-if="error" class="max-w-xl mx-auto mt-6 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
        <p class="text-red-300">{{ error }}</p>
       </div>

      <!-- Summary Card -->
      <SummaryCard v-if="studyData" :summary="studyData.summary" />
      
      <!-- Flashcard List -->
      <FlashcardList v-if="studyData?.flashcards" :flashcards="studyData.flashcards" />

      <!-- Quiz-->
    </main>
  </div>
</template>
