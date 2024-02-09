<div class="w-full h-full flex items-center justify-center">
    <div class="loading-text flex justify-between text-white">
        <span style="--i:000ms" class="animation-delay">L</span>
        <span style="--i:100ms" class="animation-delay">O</span>
        <span style="--i:200ms" class="animation-delay">A</span>
        <span style="--i:300ms" class="animation-delay">D</span>
        <span style="--i:400ms" class="animation-delay">I</span>
        <span style="--i:500ms" class="animation-delay">N</span>
        <span style="--i:600ms" class="animation-delay">G</span>
        <span style="--i:700ms" class="animation-delay">.</span>
        <span style="--i:800ms" class="animation-delay">.</span>
        <span style="--i:900ms" class="animation-delay">.</span>
    </div>
</div>

<style>
    .animation-delay {
        font-size: 8rem;
        opacity: 0;
        transform: translateX(0rem);
        animation: move-letter 2.4s infinite ease-in-out;
        animation-delay: var(--i);
    }

    @keyframes move-letter {
        0% {
            transform: translateX(-12rem);
            opacity: 0;
        }

        33.3%, 66% {
            transform: translateX(0);
            opacity: 1;
        }

        100% {
            transform: translateX(12rem);
            opacity: 0;
        }
    }
</style>