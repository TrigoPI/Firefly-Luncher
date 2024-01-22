<script lang="ts">
    let isMouseEnter: boolean = false;
</script>

<div class="background {isMouseEnter? "mouse-enter" : ""}"></div>
<div class="w-full h-full relative overflow-hidden">
    <div class="py-8 flex flex-col justify-center items-center relative bg-opacity-90 bg-neutral-950">
        <h1 class="tracking-in-expand title text-white flex">FIREFLY</h1>
        <button 
            class="scale-in-center flex play py-10 px-24 text-8xl rounded-md duration-100 absolute top-full -translate-y-1/2 hover:scale-110 bg-green-700"
            on:mouseenter={ () => isMouseEnter = true  }
            on:mouseleave={ () => isMouseEnter = false }
        >
            PLAY
        </button>
    </div>
</div>

<style>
    .background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        background: url(https://wallpapers-clan.com/wp-content/uploads/2023/11/cool-minecraft-pixel-desktop-wallpaper-preview.jpg);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        transition-duration: 600ms;
    }

    .mouse-enter {
        scale: 1.1;
    }

    .title {
        font-size: 15rem;
        font-weight: 500;
    }

    .play {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700;
    }
</style>