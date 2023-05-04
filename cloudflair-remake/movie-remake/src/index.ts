import { fetchAndApply } from "./askQuestions";

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(fetchAndApply(event.request));
});