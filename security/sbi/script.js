let countdown;
let timerDisplay = document.getElementById("timer");

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerDisplay.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdown);
            timerDisplay.textContent = "Time's up!";
            document.getElementById("otpContainer").style.display = "none"; 
        }
    }, 1000);
}

<?php if (isset($showOtpForm)): ?>
    document.getElementById("otpContainer").style.display = "block";
    startTimer(300);
<?php endif; ?>
