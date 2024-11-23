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
      <p class="result-title">{{ data.version }}</p>
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 62 62" fill="#666">
        <path d="M31 43l23-23a4 4 0 1 1 6 6l-26 26a4 4 0 0 1-6 0l-26-26a4 4 0 1 1 6-6z"/>
      </svg>
    </div>
    <div class="result-content">
      <div class="content-line" v-for="item in data.entries" :key="item[0]">
        <h5 class="result-title">{{ item[1] }}</h5>
        <p class="result-text">{{ item[0] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-head {
  display: grid;
  grid-template-columns: 1fr max-content;
}

.content-line {
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: 10px;
  padding: 0 8px 0;
  place-items: baseline;
  border-radius: 8px;
}

.content-line:hover {
  background-color: #f7f7f7;
}

.result-content {
  padding: 0 2px 0;
}

.expended .result-content {
  padding: 5px 2px 5px;
}
</style>