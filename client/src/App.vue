<script setup>
// ─── APP SHELL ───────────────────────────────────────────────────────────────
// What survives on every screen: the header, the navigation links, and the
// hole the current page is rendered into.
//
// It holds no state of its own any more. isLoading, error and studyData moved
// into the pages that actually use them — HomePage, StudyPage and HistoryPage.
//
// <router-view /> is the hole. The router decides which page component fills
// it, based on the address bar.
// ─────────────────────────────────────────────────────────────────────────────
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] text-white font-sans p-8">

    <header class="text-center mb-8">
      <RouterLink to="/">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500
                   bg-clip-text text-transparent mb-1 py-2">STUD LLM</h1>
      </RouterLink>
      <p class="text-slate-400">Your AI Study Partner</p>

      <!-- router-link-active is added automatically to whichever link matches
           the current URL, so the active tab can style itself. -->
      <nav class="flex justify-center gap-6 mt-6">
        <RouterLink to="/"
                    class="text-slate-400 hover:text-white transition-colors"
                    active-class="text-white font-semibold">
          Home
        </RouterLink>
        <RouterLink to="/history"
                    class="text-slate-400 hover:text-white transition-colors"
                    active-class="text-white font-semibold">
          History
        </RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
