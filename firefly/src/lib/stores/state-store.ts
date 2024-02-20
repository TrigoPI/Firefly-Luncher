import { writable, type Writable } from "svelte/store";

export type AppState = "idle" | "download" | "lunching";
export const stateStore: Writable<AppState> = writable("idle");