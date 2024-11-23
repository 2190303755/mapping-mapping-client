<script setup>
import {ref} from 'vue';

const props = defineProps({
  data: Object
});
const expanded = ref(false);

function onPress(event) {
  event.target.classList.add('pressed');
}

function onRelease(event) {
  expanded.value = !expanded.value;
  if (event.type === "keyup") {
    event.target.classList.remove('pressed');
  }
}

function preventSelection(event) {
  if (event.detail !== 1) {
    event.preventDefault();
  }
}
</script>

<template>
  <div :class="{
    'search-result': true,
    'expendable': true,
    'expended': expanded
  }">
    <div
        class="result-head"
        @click="onRelease"
        @keydown.enter="onPress"
        @keyup.enter="onRelease"
        @mousedown="preventSelection"
        tabindex="0">
      <h5 class="result-title">{{ data.name }}</h5>
      <p class="result-version">{{ data.version }}</p>
      <p class="result-desc">{{ data.desc }}</p>
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 62 62" fill="#666">
        <path d="M31 43l23-23a4 4 0 1 1 6 6l-26 26a4 4 0 0 1-6 0l-26-26a4 4 0 1 1 6-6z"/>
      </svg>
    </div>
    <div class="result-content">
      <p class="result-text" v-for="clazz in data.classes">{{ clazz }}</p>
    </div>
  </div>
</template>

<style scoped>

.result-head {
  display: grid;
  grid-template-rows: max-content max-content;
  grid-template-columns: 1fr max-content max-content;
}

.result-title {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
}

.result-version {
  grid-row: 1 / 3;
  grid-column: 2 / 3;
  place-self: center;
}

.result-desc {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}

.result-content {
  padding: 0 10px 0;
}

.expended .result-content {
  padding: 5px 10px 5px;
}
</style>