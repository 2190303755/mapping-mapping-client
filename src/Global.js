import {customRef, ref} from 'vue';

function getCache(count) {
    const cache = [];
    for (let i = 0; i < count; ++i) {
        cache.push(new Set());
    }
    return cache;
}

export const inputText = ref('');

let lastInput;
const suggestions = getCache(4);
const queried = getCache(4);

export const modes = [
    "本地化键名",
    "半反混淆名",
    "方法反混淆名",
    "字段反混淆名"
];

export const mode = customRef((
    track,
    trigger
) => {
    let val = 0;
    return {
        get() {
            track();
            return val;
        },
        set(value) {
            if (val === value) return;
            trigger();
            val = value;
            lastInput = undefined;
            placeholder.value = undefined;
            filtered.value = '';
            inputText.value = '';
        }
    };
});

export const placeholder = customRef((
    track,
    trigger
) => {
    let last, text;
    return {
        get() {
            track();
            if (last !== mode.value) {
                text = '请输入' + modes[mode.value];
            }
            return text;
        },
        set() {
            trigger();
        }
    };
});

export const filtered = customRef((
    track,
    trigger
) => {
    let last;
    let array = [];
    return {
        get() {
            track();
            return array;
        },
        set(query) {
            trigger();
            array = [];
            if (query === undefined) {
                if (last === undefined) return;
                query = last;
            } else {
                last = query;
            }
            if (!query.length) return;
            const matcher = query.toLowerCase();
            const matches = [];
            const lower = [];
            for (const key of suggestions[mode.value]) {
                let index = key.indexOf(query);
                if (index === -1) {
                    index = key.toLowerCase().indexOf(matcher);
                    if (index === -1) continue;
                    const array = lower[index];
                    if (array) {
                        array.push(key);
                    } else {
                        lower[index] = [key];
                        if (!matches[index]) {
                            matches[index] = [];
                        }
                    }
                    continue;
                }
                const array = matches[index];
                if (array) {
                    array.push(key);
                } else {
                    matches[index] = [key];
                }
            }
            for (const index in matches) {
                for (const key of matches[index].sort()) {
                    array.push(key);
                    if (array.length > 9) return;
                }
                if (lower[index]) {
                    for (const key of lower[index].sort()) {
                        array.push(key);
                        if (array.length > 9) return;
                    }
                }
                if (array.length > 9) return;
            }
        }
    };
});

let debounce;

export function addSuggestion(message) {
    const type = message.mode;
    if (type === mode.value) {
        suggestions[type].add(message.value);
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            filtered.value = inputText.value;
        }, 10);
    } else {
        suggestions[type < 1 || type > 3 ? 0 : type].add(message.value);
    }
}

export function handleInput(input) {
    if (lastInput === input) return false;
    filtered.value = input;
    return true;
}

export function getQueryRecorder(query) {
    const queries = queried[mode.value];
    if (queries.has(query)) return undefined;
    return queries.add.bind(queries);
}