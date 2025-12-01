<script>
import TopicInput from "./components/TopicInput.vue";
import AnimatedGreeting from "./components/AnimatedGreeting.vue";
import ResponseBox from "./components/ResponseBox.vue";

export default {
  components: { 
    TopicInput,
    AnimatedGreeting,
    ResponseBox
   },

   data() {
    return {
      showResponse: false, 
    }
   },

  methods: {
    submitTopic(topic) {
      console.log("Topic submitted:", topic);
      this.showResponse = true; // Show the response box
    },
  },
}
</script>

<template>
  <div class="bg-purple-500 min-h-screen">
    <AnimatedGreeting/>
    <TopicInput @submit-topic="submitTopic"/>
    <ResponseBox :trigger="showResponse"/>
  </div>
</template>

<style></style>