document.addEventListener("DOMContentLoaded", async () => {

    updateStreakDisplay();

    await loadDailyCiphers();

    const input =
        document.getElementById("solution-input");

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    evaluateSubmission();
                }

            }
        );
    }
});