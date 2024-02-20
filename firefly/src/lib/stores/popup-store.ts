import { writable, type Writable } from "svelte/store";

export const popupMessage: Writable<string[]> = writable<string[]>([]);