<script setup>
import {onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch} from 'vue';
import SearchBox from '@/view/SearchBox.vue';
import TranslationResult from '@/view/TranslationResult.vue';
import SeargeResult from '@/view/SeargeResult.vue';
import DeobfuscatedResult from '@/view/DeobfuscatedResult.vue';
import {addSuggestion, getQueryRecorder, mode, modes} from '@/Global.js';

let id = 0;
let searchMessage;
let websocket;
const views = [
  TranslationResult,
  SeargeResult,
  DeobfuscatedResult,
  DeobfuscatedResult
];
const header = useTemplateRef('header');
const glass = useTemplateRef('glass');
const placeholder = useTemplateRef('placeholder');
const results = ref([]);
const view = shallowRef(TranslationResult);
watch(mode, () => {
  view.value = views[mode.value];
});

function handleMessage(event) {
  const message = JSON.parse(event.data);
  if (message.id < 0) {
    addSuggestion(message);
  } else if (message.id === id) {
    switch (message.side) {
      case undefined:
        break;
      case '0':
        message.key = message.name + message.version;
        message.version += ' (Client Side)';
        break;
      case '1':
        message.key = message.name + message.version;
        message.version += ' (Server Side)';
        break;
      default:
        message.key = message.name + message.version;
        message.version += ' (Both Side)';
    }
    results.value.push(message);
  }
}

function disconnect() {
  if (websocket) {
    websocket.close();
    websocket = undefined;
    console.log('WebSocket disconnected');
  }
}

function connect() {
  return new Promise((resolve) => {
    if (!websocket) {
      websocket = new WebSocket('ws://localhost:3000');
    }
    websocket.onopen = () => {
      console.log('WebSocket connected');
      resolve(websocket);
    };
    websocket.onmessage = handleMessage;
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    websocket.onclose = disconnect;
  });
}

function handleSearch(text) {
  results.value = [];
  searchMessage = JSON.stringify({id: ++id, mode: mode.value, query: text});
  if (!websocket) {
    connect().then(ws => ws.send(searchMessage));//latest
  } else if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(searchMessage);
  }
}

function handleQuery(text) {
  const recorder = getQueryRecorder(text);
  if (!recorder) return;
  const msg = JSON.stringify({id: -1, mode: mode.value, query: text});
  if (!websocket) {
    connect().then(ws => {
      ws.send(msg);//cached
      recorder(text);
    });
  } else if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(msg);
    recorder(text);
  }
}

function onSelect(index) {
  if (mode.value === index) return;
  mode.value = index;
  results.value = [];
}

function syncHeight() {
  const height = header.value.offsetHeight;
  glass.value.style.minHeight = height + parseInt(getComputedStyle(document.documentElement).fontSize) * 0.5 + 'px';
  placeholder.value.style.minHeight = height + 'px';
}

onMounted(() => {
  connect();
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
  syncHeight();
});
onUnmounted(() => {
  disconnect();
  window.removeEventListener('resize', syncHeight);
  window.removeEventListener('load', syncHeight);
});
</script>

<template>
  <main>
    <div class="glass" ref="glass"/>
    <div class="header" ref="header">
      <div class="panel">
        <div class="nav-bar">
          <button
              v-for="(item, index) in modes"
              :class="{ selected: mode === index }"
              @click="onSelect(index)"
          >{{ item }}
          </button>
        </div>
        <SearchBox
            @search="handleSearch"
            @clear="results = []"
            @query="handleQuery"
        />
      </div>
    </div>
    <div class="result-container">
      <div ref="placeholder" style="margin-bottom: -15px"/>
      <component :is="view" v-for="item in results" :data="item" :key="item.key ?? item.version"/>
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100%;
}

.glass {
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1) 80%, rgba(255, 255, 255, 0));
  mask: linear-gradient(to bottom, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0));
  backdrop-filter: blur(2px);
  position: fixed;
  z-index: 999;
}
 
.header {
  position: fixed;
  height: fit-content;
  width: 100%;
  padding: 1rem;
  z-index: 1000;
}

.panel {
  height: fit-content;
  width: 100%;
  border: 1px solid #b0b0b0;
  border-radius: 8px;
  background-color: white;
}

.nav-bar {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 5px;
  border: 1px solid #dadada;
  border-top: none;
  margin-bottom: 2px;
  border-radius: 8px
}

button {
  border: none white;
  padding: 10px 8px;
  cursor: pointer;
  border-radius: 8px;
  background: white;
  color: black;
  flex: 1;
}

.selected {
  background: hsla(160, 100%, 35%, 1);
  color: white;
  padding: 8px 6px;
  border: 2px solid hsla(160, 100%, 30%, 1);
}

button:hover {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  padding: 8px 6px;
  border: 2px solid hsla(160, 100%, 35%, 1);
}

button:active {
  background: hsla(160, 100%, 32%, 1);
  padding: 8px 6px;
  border: 2px solid hsla(160, 100%, 30%, 1);
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: auto;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  scrollbar-width: none;
}
</style>
