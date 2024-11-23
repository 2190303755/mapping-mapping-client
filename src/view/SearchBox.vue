<script setup>
import {ref} from 'vue';
import {filtered, handleInput, inputText, placeholder} from '@/Global.js';

const emit = defineEmits(['search', 'clear', 'query']);
let selected = -1;
const highlight = ref(-1);

function onSearch() {
  if (inputText.value.length) {
    emit('search', inputText.value);
  } else {
    emit('clear');
  }
  filtered.value = '';
}

let debounce;

function onInput() {
  selected = -1;
  highlight.value = -1;
  const input = inputText.value;
  if (handleInput(input) && input.length) {
    clearTimeout(debounce);
    debounce = setTimeout(
        () => emit('query', input),
        100
    );
  }
}

function onSuggestionClick(event) {
  const view = event.target;
  inputText.value = view.textContent;
  onSearch();
}

function onSelect(event) {
  const keys = filtered.value;
  if (!keys.length) {
    selected = -1;
    return;
  }
  event.preventDefault();
  if (selected < 0) {
    selected = keys.length - 1;
  } else if (selected >= keys.length) {
    selected = 0;
  }
  highlight.value = selected;
  const key = keys[selected];
  if (key && key.length) {
    inputText.value = key;
  }
}

function onArrowUp(event) {
  --selected;
  onSelect(event);
}

function onArrowDown(event) {
  ++selected;
  onSelect(event);
}

function onMouseLeave() {
  highlight.value = selected;
}
</script>

<template>
  <div class="search-box">
    <input
        type="search"
        v-model.trim="inputText"
        @keyup.enter="onSearch"
        @keydown.up="onArrowUp"
        @keydown.down="onArrowDown"
        @keydown.tab="onArrowDown"
        @input="onInput"
        :placeholder="placeholder"
    />
    <button @click="onSearch">查询</button>
  </div>
  <ul v-show="filtered.length">
    <li
        v-for="(suggestion, index) in filtered"
        :key="index"
        :class="{ highlighted: index === highlight }"
        @keyup.enter="onSearch"
        @click="onSuggestionClick"
        @mouseenter="highlight = index"
        @mouseleave="onMouseLeave"
    >{{ suggestion }}
    </li>
  </ul>
</template>

<style scoped>
.search-box {
  display: flex;
  gap: 5px;
  align-items: center;
  border: 1px solid #dadada;
  padding: 5px;
  margin: 5px;
  border-radius: 8px;
}

.search-box input {
  border: none;
  outline: none;
  padding: 10px;
  flex-grow: 1;
}

.search-box button {
  background: hsla(160, 100%, 35%, 1);
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 8px;
}

.search-box button:hover {
  background: hsla(160, 100%, 37%, 1);
}

.search-box button:active {
  background: hsla(160, 100%, 32%, 1);
}

ul {
  display: flex;
  gap: 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  list-style-type: none;
  margin-top: 5px;
  padding: 5px;
  position: absolute;
  overflow-y: auto;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

li {
  padding: 8px;
  cursor: pointer;
  width: 100%;
}

li.highlighted {
  color: hsla(160, 100%, 30%, 1);
}

li.highlighted:hover {
  color: hsla(160, 100%, 35%, 1);
}

li.highlighted:active {
  color: hsla(160, 100%, 25%, 1);
}
</style>