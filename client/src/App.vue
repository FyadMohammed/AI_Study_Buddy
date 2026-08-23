<script setup>
import TopicInput from "./components/TopicInput.vue";
import SummaryCard from "./components/SummaryCard.vue";
import FlashcardList from "./components/FlashcardList.vue";
import QuizCard from "./components/QuizCard.vue";
import { ref } from 'vue' // Add this!

const isLoading = ref(false);
const error = ref(null);
const studyData = ref(null);

const handleTopicSubmit = async (topic) => {
  console.log("Starting AI generation for:", topic);

  isLoading.value = true;
  error.value=null;
  studyData.value= null;
 
  try {
    const response = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    const responseEnvelope = await response.json();
    
    if (!responseEnvelope.success) {
      // Use the specific error message the backend sent, if present
      throw new Error(responseEnvelope.error || 'Server error');
    }
    // Unwrap the data payload before assigning to the reactive state
    const studyPayload = responseEnvelope.data;
    studyData.value = {
      id: studyPayload.id,
      summary: studyPayload.summary,
      flashcards: studyPayload.flashcards,
      quiz: studyPayload.quiz
    };
    
  } catch (caughtError) {
    console.error(caughtError);
    error.value = caughtError.message || "Failed to generate study material. Please try again.";
    
  } finally {
    isLoading.value = false;
  }

}

const handleQuizComplete = ({ score, total }) => {
  console.log(`Quiz complete: ${score}/${total}`);
};
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] text-white font-sans p-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500
      bg-clip-text text-transparent mb-1 py-2">STUD LLM</h1>
      <p class="text-slate-400">Your AI Study Partner</p>
    </header>

    <main>
      <TopicInput @submitTopic="handleTopicSubmit" />
      
      <!-- Loading Indicator  -->
      <div v-if="isLoading" class="max-w-xl mx-auto mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
        <div class="flex items-center gap-3">
          <!-- Tailwind's animate-spin turns this ring continuously. The trick is
               a circle with a faint border all round and one bright edge on top,
               so the spin is visible. -->
          <div class="h-5 w-5 rounded-full border-2 border-blue-300/30 border-t-blue-300 animate-spin"></div>
          <p class="text-blue-300">Generating study material...</p>
        </div>
      </div>

      <!-- Error Message -->
       <div v-if="error" class="max-w-xl mx-auto mt-6 p-4 bg-red-500/20 rounded-xl border border-red-400/30">
        <p class="text-red-300">{{ error }}</p>
       </div>

      <!-- Summary Card -->
      <SummaryCard v-if="studyData" :summary="studyData.summary" />
      
      <!-- Flashcard List -->
      <FlashcardList v-if="studyData?.flashcards" :flashcards="studyData.flashcards"/>

      <!-- Quiz-->
      <QuizCard
        v-if= "studyData?.quiz"
        :key="studyData.id"
        :quiz="studyData.quiz"
        @scoreComplete="handleQuizComplete"
      />
    </main>
  </div>
</template>
