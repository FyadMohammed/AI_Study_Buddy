<script setup>
  import TopicInput from "./components/TopicInput.vue";
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
      await new Promise( resolve => setTimeout(resolve,2000));
      studyData.value = {
        summary: `Detailed explanation of ${topic}...`,

        flashcards: [
          { front: 'Term 1', back: 'Definition 1' },
          { front: 'Term 2', back: 'Definition 2'}
        ]
      }
    }catch{
      error.value = "Failed to generate study material. Please try again.";
    }finally {
      isLoading.value = false;
    }

  } 
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] text-white font-sans p-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500
      bg-clip-text text-transparent mb-2">Study Buddy</h1>
      <p class="text-slate-400">Your AI Study Partner</p>
    </header>
    <main>
      <TopicInput
      @submitTopic="handleTopicSubmit"/>
    </main>
  </div>
</template>
