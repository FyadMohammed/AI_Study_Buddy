<template>
  <div class="flex flex-col items-center p-4">
    <input
      v-model="topic"
      type="text"
      placeholder="Enter a topic"
      class="border px-3 py-2 rounded w-full max-w-md bg-amber-100
       focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      @click="submitTopic"
      class="bg-blue-400 text-white px-4 py-2 rounded-3xl 
      hover:bg-blue-600 transition-colors mt-3"
    >
      Generate
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      topic: ''
    };
  },
  methods: {
    submitTopic() {
      if (!this.topic) return alert("Please type a topic!");
      this.$emit('submit-topic', this.topic);
      this.topic = ''; // optional: clear input after submitting
    }
  }
};
</script>
