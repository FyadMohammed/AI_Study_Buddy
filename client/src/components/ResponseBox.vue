<template>
    <div 
    v-if="visible"
    class="mt-6 w-full max-w-xl bg-black p-4
    rounded-xl shadow-md"
    >
    <p class="text-gray-800 text-lg">
        {{ displayedText }}
    </p>
    </div>
</template>

<script>
export default {
    props: ["trigger"],
    data() {
        return {
            message:
            "Hi there dear student. Sorry, we haven't added the AI module for this topic yet. But the topic will soon be available.",
            displayedText: "",
            visible: false,
            index: 0,
        };
    },

    watch: {
        trigger(newVal) {
            if(newVal){
                this.startTyping();
            }
        },
    },
    
    methods: {
        startTyping() {
            this.visible=true;
            this.displayedText="";
            this.index=0;

            const interval= setInterval(() => {
                if (this.index < this.message.length) {
                    this.displayedText += this.message[this.index];
                    this.index;
                } else {
                    clearInterval(interval);
                }
            }, 30); //typing speed: every 30ms (0.03 sec).
        },
    },
};
</script>