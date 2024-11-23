<script setup>
const props = defineProps({
  data: Object
});
</script>

<template>
  <div class="search-result">
    <h5 class="result-title">{{ data.name }}</h5>
    <p class="result-desc">{{ data.desc }}</p>
    <p class="result-version">{{ data.version }}</p>
  </div>
</template>

<style scoped>

.search-result {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr max-content;
}

.result-title {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
}

.result-version {
  grid-row: 1 / 3;
  grid-column: 2 / 3;
}

.result-desc {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}
</style>