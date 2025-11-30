<template>
    <div class="text-center py-10">
        <h1 class="text-3xl md:text-4xl font-bold text-black-500 font-serif ">
            {{ displayedText }}
        </h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            fulltext: "Hello there, student. What do you want to learn today?",
            displayedText: "",
            index:0,
        };
    },

    mounted(){
        this.startTyping();
    },
    methods: {
        startTyping() {
            const interval = setInterval(() => {
                if (this.index < this.fulltext.length) {
                    this.displayedText += this.fulltext[this.index];
                    this.index++;
                } else {
                    clearInterval(interval);
                }
            }, 100); //speed: every 100ms (0.1 sec). 
        },
    },
};
</script>

<style>
h1 {
    transition: opacity 0.3s ease;
}
</style>