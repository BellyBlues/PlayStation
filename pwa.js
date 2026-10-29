
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./service-worker.js");

      console.log("PS1 Emulator offline support registered.");

      await registration.update();
    } catch (error) {
      console.error("PWA registration failed:", error);
    }
  });
}
