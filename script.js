/* ==========================================
   DURGA PUJA MUSIC WEBSITE
========================================== */


/* -------------------------
   MOBILE MENU
------------------------- */

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

}

/* Close mobile menu when tapping anywhere outside it */

function closeMenu() {
    document.getElementById("mobileMenu").style.display = "none";
}

document.addEventListener("click", (e) => {

    const menu = document.getElementById("mobileMenu");
    const menuBtn = document.querySelector(".menu-btn");

    if (menu.style.display !== "block") return;

    /* tap on the ☰ button is handled by toggleMenu(); a tap on a menu link should close it too */
    if (menuBtn.contains(e.target)) return;

    if (menu.contains(e.target) && !e.target.closest("a")) return;

    closeMenu();

});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});


/* ==========================================
   MUSIC PLAYER
========================================== */

const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");

const currentSong =
    document.getElementById("currentSong");

const currentArtist =
    document.getElementById("currentArtist");

const progressBar =
    document.getElementById("progressBar");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const volumeBar =
    document.getElementById("volumeBar");

const volumeBtn =
    document.getElementById("volumeBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const songList =
    document.getElementById("songList");


/* -------------------------
   PLAYLIST DATA

   MP3 folder structure:
   /songs/puja-trending/
   /songs/chandi-path/
   /songs/mahalaya/
   /songs/vijaya-dashami/

   Add/remove songs inside each playlist as needed.
------------------------- */

const playlists = [
    {
        title: "পুজোর ট্রেন্ডিং গান",
        artist: "Puja Trending Songs",
        icon: "🎵",
        songs: [],
        youtubePlaylistId: "PLHV8378nPd2k"
    },

    {
        title: "চণ্ডীপাঠ",
        artist: "Chandi Path",
        icon: "🔱",
        songs: [],
        // Add more YouTube video IDs here (the part after v= or youtu.be/)
        youtubeVideoIds: [
            "YQFNRoi7rEc"
        ]
    },

    {
        title: "মহালয়ার গান",
        artist: "Mahalaya Songs",
        icon: "🌅",
        songs: [],

        /* One long YouTube video split by timestamps.
           Add one line per song: ["minutes:seconds", "Song name"] */
        youtubeChapters: {
            videoId: "LOlyrK53QM4",
            tracks: [
                ["0:06",  "Ya Chandi"],
                ["1:43",  "Simhastha Sashisekhara"],
                ["2:39",  "Bajlo Tomar Aalor Benu With Narration"],
                ["7:01",  "Jago Durga Dashapraharanadharinee"],
                ["8:48",  "Ogo Amar Agamani-alo"],
                ["12:07", "Tabo Achintya Rupa-charita-mahima"],
                ["16:06", "Aham Rudrebhirvasubhischara"],
                ["20:07", "Akhila-bimane Taba Jaya-gane"],
                ["24:11", "Jayanati Mangala Kali"],
                ["24:43", "Subhra Sankha-rabe"],
                ["27:33", "Jatajutasamayuktamardhendukrita-sekharam"],
                ["32:00", "Namo Chandi, Namo Chandi"],
                ["35:05", "Ma Go Tabu Beene Sangeeta"],
                ["38:38", "Bimane Bimane"],
                ["41:39", "Jaya Jaya Japyajaye"],
                ["44:11", "He Chinmoyi"],
                ["47:07", "Amala-kirane Tribhubana-manoharini"],
                ["51:12", "Jayanti Mangala Kali - Pankaj Kumar Mullick"],
                ["58:11", "Santi Dile Bhari"]
            ]
        }
    },

    {
        title: "বিজয়া দশমী",
        artist: "Vijaya Dashami",
        icon: "🪔",
        songs: [],

        /* One long YouTube video split by timestamps.
           Add one line per song: ["minutes:seconds", "Song name"] */
        youtubeChapters: {
            videoId: "xJQd6c4N2ZU",
            tracks: [
                ["0:00",  "Le Paglu Dance"],
                ["3:33",  "Bhojo Gourango"],
                ["7:00",  "Lady Killer Romeo"],
                ["10:44", "DuJone Title Track"],
                ["13:22", "Poran Jai Jolia Re"],
                ["18:01", "Bolo Na Tumi Amar"],
                ["21:21", "Mala Re"],
                ["25:39", "Pyaar Ka Bukhar"],
                ["28:53", "Gobhir Joler Fish"],
                ["32:53", "Jay Govinda Jay Gopala"],
                ["36:56", "Pyarelal"],
                ["43:15", "Remix Qawwali"],
                ["47:13", "Kolkatar Rasogolla"],
                ["50:31", "Desi Chhori"],
                ["54:17", "Dhitang Dhitang"]
            ]
        }
    }
];

let currentPlaylistIndex = 0;
let currentIndex = 0;
let isPlaying = false;
let repeat = false;

/* YouTube IFrame Player */
let youtubePlayer = null;
let youtubeReady = false;
let youtubeProgressTimer = null;
let chapterHoldUntil = 0;   // short pause of auto chapter detection after a click
let youtubeLoadedIndex = 0; // which playlist is currently loaded in the YouTube player

/* Music entry popup */
let musicStartPending = false;

function setupMusicStartPopup() {
    const overlay = document.getElementById("musicStartOverlay");
    const yesBtn = document.getElementById("musicStartYes");
    const noBtn = document.getElementById("musicStartNo");

    if (!overlay || !yesBtn || !noBtn) return;

    yesBtn.addEventListener("click", function () {
        musicStartPending = true;
        overlay.style.display = "none";

        // Keep the user on the Home screen.
        const home = document.getElementById("home");
        if (home) home.scrollIntoView({ behavior: "smooth", block: "start" });

        // Start the first song immediately when YouTube is ready.
        if (youtubeReady && youtubePlayer) {
            musicStartPending = false;
            currentPlaylistIndex = 0;
            currentIndex = 0;
            youtubePlayer.playVideoAt(0);
        }
    });

    noBtn.addEventListener("click", function () {
        musicStartPending = false;
        overlay.style.display = "none";

        const home = document.getElementById("home");
        if (home) home.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

setupMusicStartPopup();


/* -------------------------
   CREATE PLAYLIST LIST
------------------------- */

function createSongList() {

    songList.innerHTML = "";

    playlists.forEach((playlist, index) => {

        const wrapper = document.createElement("div");
        wrapper.className = "playlist-wrapper";
        wrapper.id = `playlist-wrapper-${index}`;

        const card = document.createElement("div");
        card.className = "song-card playlist-card";
        card.id = `playlist-${index}`;

        const playlistSubtitle = playlist.youtubePlaylistId
            ? `${playlist.artist} • YouTube Playlist`
            : playlist.youtubeVideoIds
                ? `${playlist.artist} • ${playlist.youtubeVideoIds.length} songs`
                : playlist.youtubeChapters
                    ? `${playlist.artist} • ${playlist.youtubeChapters.tracks.length} songs`
                    : `${playlist.artist} • ${playlist.songs.length} songs`;

        card.innerHTML = `
            <div class="song-number playlist-icon">${playlist.icon}</div>
            <div class="song-info">
                <h3>${playlist.title}</h3>
                <p>${playlistSubtitle}</p>
            </div>
            <button class="playlist-toggle" type="button"
                    aria-label="Open ${playlist.title}">
                <span>⌄</span>
            </button>
        `;

        const dropdown = document.createElement("div");
        dropdown.className = "playlist-dropdown";

        if (playlist.youtubePlaylistId || playlist.youtubeVideoIds ||
            playlist.youtubeChapters) {
            dropdown.innerHTML = `
                <div class="youtube-playlist" id="youtube-playlist-list-${index}">
                    <div class="youtube-loading">
                        🎵 Playlist-এর গানগুলি লোড হচ্ছে...
                    </div>
                </div>
            `;
        } else if (playlist.songs.length === 0) {
            dropdown.innerHTML = `
                <div class="empty-playlist">
                    এই playlist-এ এখনও কোনো গান যোগ করা হয়নি।
                </div>
            `;
        } else {
            playlist.songs.forEach((song, songIndex) => {
                const songItem = document.createElement("button");
                songItem.type = "button";
                songItem.className = "dropdown-song";
                songItem.innerHTML = `
                    <span class="dropdown-number">
                        ${String(songIndex + 1).padStart(2, "0")}
                    </span>
                    <span class="dropdown-song-info">
                        <strong>${song.title}</strong>
                        <small>${song.artist}</small>
                    </span>
                    <span class="dropdown-play">▶</span>
                `;
                songItem.onclick = (event) => {
                    event.stopPropagation();
                    loadPlaylist(index);
                    loadSong(songIndex);
                    playSong();
                };
                dropdown.appendChild(songItem);
            });
        }

        card.onclick = (event) => {
            if (event.target.closest(".playlist-toggle") ||
                event.target === card ||
                event.target.closest(".song-info") ||
                event.target.closest(".playlist-icon")) {
                const isOpen = wrapper.classList.contains("open");
                document.querySelectorAll(".playlist-wrapper.open")
                    .forEach(item => item.classList.remove("open"));
                if (!isOpen) wrapper.classList.add("open");
            }
        };

        wrapper.appendChild(card);
        wrapper.appendChild(dropdown);
        songList.appendChild(wrapper);
    });
}

createSongList();

/* Playlists made of individual YouTube videos can be listed immediately */
playlists.forEach((playlist, index) => {
    if (playlist.youtubeVideoIds) {
        buildYouTubeList(index, playlist.youtubeVideoIds);
    }
    if (playlist.youtubeChapters) {
        buildYouTubeChapterList(index);
    }
});


/* -------------------------
   IS YOUTUBE PLAYLIST
------------------------- */

function isYoutubeVideoList(index = youtubeLoadedIndex) {
    const playlist = playlists[index];
    return !!(playlist && playlist.youtubeVideoIds);
}

function isYoutubeChapterList(index = youtubeLoadedIndex) {
    const playlist = playlists[index];
    return !!(playlist && playlist.youtubeChapters);
}

/* Lists that move with simple next / previous steps */
function isYoutubeStepList(index) {
    return isYoutubeVideoList(index) || isYoutubeChapterList(index);
}

/* "1:02:10", "4:35" or a number of seconds  ->  seconds */
function parseTimestamp(value) {
    if (typeof value === "number") return value;
    const parts = String(value).trim().split(":").map(Number);
    return parts.reduce((total, part) => total * 60 + (part || 0), 0);
}

function getChapterTracks(index) {
    const playlist = playlists[index];
    if (!playlist || !playlist.youtubeChapters) return [];
    if (!playlist._chapterTracks) {
        playlist._chapterTracks = playlist.youtubeChapters.tracks
            .map(([time, title]) => ({
                start: parseTimestamp(time),
                title: title
            }))
            .sort((a, b) => a.start - b.start);
    }
    return playlist._chapterTracks;
}

/* Start / end seconds of one song inside the long video */
function getChapterRange(index, chapterIndex, videoLength) {
    const tracks = getChapterTracks(index);
    const track = tracks[chapterIndex];
    if (!track) return null;
    const next = tracks[chapterIndex + 1];
    let end = next ? next.start : (videoLength || 0);
    if (!end || end <= track.start) end = track.start;
    return { start: track.start, end: end };
}

function findChapterIndex(index, time) {
    const tracks = getChapterTracks(index);
    let found = 0;
    for (let i = 0; i < tracks.length; i++) {
        if (time >= tracks[i].start - 0.3) found = i;
    }
    return found;
}

function isYoutubePlaylist(index = currentPlaylistIndex) {
    const playlist = playlists[index];
    return !!(playlist &&
        (playlist.youtubePlaylistId || playlist.youtubeVideoIds ||
         playlist.youtubeChapters));
}


/* -------------------------
   LOAD PLAYLIST
------------------------- */

function loadPlaylist(index) {

    currentPlaylistIndex = index;
    currentIndex = 0;

    document.querySelectorAll(".song-card")
        .forEach(card => card.classList.remove("active"));

    const activeCard =
        document.getElementById(`playlist-${index}`);

    if (activeCard) {
        activeCard.classList.add("active");
    }

    loadSong(0);
}


/* -------------------------
   CURRENT PLAYLIST
------------------------- */

function getCurrentPlaylist() {
    return playlists[currentPlaylistIndex];
}


/* -------------------------
   LOAD SONG
------------------------- */

function loadSong(index) {

    const playlist = getCurrentPlaylist();

    if (!playlist) return;

    /* YouTube playlist */
    if (playlist.youtubePlaylistId || playlist.youtubeVideoIds ||
        playlist.youtubeChapters) {

        if (!youtubeReady || !youtubePlayer) return;

        playYouTubeItem(currentPlaylistIndex, index);
        return;
    }

    /* Existing local MP3 playlist */
    if (!playlist.songs.length) return;

    currentIndex = index;

    const song = playlist.songs[index];

    audio.src = song.file;

    currentSong.textContent = song.title;
    currentArtist.textContent =
        `${playlist.title} • ${song.artist}`;

    document.querySelectorAll(".song-card")
        .forEach(card => card.classList.remove("active"));

    const activePlaylist =
        document.getElementById(`playlist-${currentPlaylistIndex}`);

    if (activePlaylist) {
        activePlaylist.classList.add("active");
    }
}


/* -------------------------
   PLAY
------------------------- */

function playSong() {

    if (isYoutubePlaylist()) {

        if (!youtubeReady || !youtubePlayer) return;

        youtubePlayer.playVideo();
        return;
    }

    audio.play()
        .then(() => {

            isPlaying = true;
            playBtn.textContent = "❚❚";

        })
        .catch(() => {

            console.log("Audio could not be played.");

        });
}


/* -------------------------
   PAUSE
------------------------- */

function pauseSong() {

    if (isYoutubePlaylist()) {

        if (youtubeReady && youtubePlayer) {
            youtubePlayer.pauseVideo();
        }
        return;
    }

    audio.pause();

    isPlaying = false;

    playBtn.textContent = "▶";
}


/* -------------------------
   TOGGLE PLAY
------------------------- */

function togglePlay() {

    if (isYoutubePlaylist()) {

        if (!youtubeReady || !youtubePlayer) return;

        const state = youtubePlayer.getPlayerState();

        if (state === YT.PlayerState.PLAYING) {
            youtubePlayer.pauseVideo();
        } else {
            youtubePlayer.playVideo();
        }

        return;
    }

    if (!audio.src) {
        loadSong(0);
    }

    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}


/* -------------------------
   NEXT
------------------------- */

function nextSong() {

    if (isYoutubePlaylist()) {

        if (!youtubeReady || !youtubePlayer) return;

        if (isYoutubeStepList(currentPlaylistIndex)) {
            stepYouTubeVideoList(1);
            return;
        }

        youtubePlayer.nextVideo();
        return;
    }

    const playlist = getCurrentPlaylist();

    if (!playlist || !playlist.songs.length) return;

    currentIndex++;

    if (currentIndex >= playlist.songs.length) {
        currentIndex = 0;
    }

    loadSong(currentIndex);
    playSong();
}


/* -------------------------
   PREVIOUS
------------------------- */

function previousSong() {

    if (isYoutubePlaylist()) {

        if (!youtubeReady || !youtubePlayer) return;

        if (isYoutubeStepList(currentPlaylistIndex)) {
            stepYouTubeVideoList(-1);
            return;
        }

        youtubePlayer.previousVideo();
        return;
    }

    const playlist = getCurrentPlaylist();

    if (!playlist || !playlist.songs.length) return;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = playlist.songs.length - 1;
    }

    loadSong(currentIndex);
    playSong();
}


/* ==========================================
   YOUTUBE IFRAME PLAYER API
   The video itself stays hidden.
   A custom scrollable playlist is shown instead.
========================================== */

let youtubePlaylistItems = [];
let youtubeListLoaded = false;

window.onYouTubeIframeAPIReady = function () {

    let host = document.getElementById("youtube-player-host");

    if (!host) {
        host = document.createElement("div");
        host.id = "youtube-player-host";
        document.body.appendChild(host);
    }

    const playerMount = document.createElement("div");
    playerMount.id = "youtube-hidden-player";
    host.appendChild(playerMount);

    youtubePlayer = new YT.Player("youtube-hidden-player", {
        width: "1",
        height: "1",
        playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            listType: "playlist",
            list: "PLHV8378nPd2k"
        },
        events: {
            onReady: onYouTubeReady,
            onStateChange: onYouTubeStateChange,
            onError: onYouTubeError
        }
    });
};

async function onYouTubeReady() {

    youtubeReady = true;
    youtubePlayer.setVolume(80);
    volumeBar.value = 0.8;

    youtubePlaylistItems =
        youtubePlayer.getPlaylist() || [];

    await buildYouTubePlaylistList();
    updateYouTubeSongInfo();

    // If the user selected Yes in the entry popup, start song 1.
    if (musicStartPending) {
        musicStartPending = false;
        currentPlaylistIndex = 0;
        currentIndex = 0;
        youtubePlayer.playVideoAt(0);
    }
}

async function buildYouTubePlaylistList() {
    await buildYouTubeList(0, youtubePlaylistItems);
}

async function buildYouTubeList(playlistIndex, videoIds) {

    const listBox =
        document.getElementById(`youtube-playlist-list-${playlistIndex}`);

    if (!listBox) return;

    if (!videoIds.length) {
        listBox.innerHTML = `
            <div class="youtube-empty">
                এই YouTube playlist-এ কোনো গান পাওয়া যায়নি।
            </div>
        `;
        return;
    }

    const playlist = playlists[playlistIndex];

    listBox.innerHTML = "";

    for (let index = 0; index < videoIds.length; index++) {

        const videoId = videoIds[index];
        let title =
            `YouTube Song ${String(index + 1).padStart(2, "0")}`;

        try {
            const response = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.title) title = data.title;
            }
        } catch (error) {
            console.log("Could not load YouTube title:", videoId);
        }

        const item = document.createElement("button");
        item.type = "button";
        item.className = "youtube-song-item";
        item.dataset.index = index;
        item.dataset.playlist = playlistIndex;

        item.innerHTML = `
            <span class="youtube-song-number">
                ${String(index + 1).padStart(2, "0")}
            </span>
            <img
                class="youtube-song-thumb"
                src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
                alt=""
                loading="lazy"
            >
            <span class="youtube-song-info">
                <strong class="youtube-song-title">
                    ${escapeHTML(title)}
                </strong>
                <small class="youtube-song-source">
                    YouTube • ${escapeHTML(playlist.artist)}
                </small>
            </span>
            <span class="youtube-song-play">▶</span>
        `;

        item.onclick = (event) => {
            event.stopPropagation();
            loadYouTubePlaylistSong(index, playlistIndex);
        };

        listBox.appendChild(item);
    }

    updateYouTubeListActive();
}

/* Song list for one long video with timestamps */
function buildYouTubeChapterList(playlistIndex) {

    const listBox =
        document.getElementById(`youtube-playlist-list-${playlistIndex}`);

    if (!listBox) return;

    const playlist = playlists[playlistIndex];
    const tracks = getChapterTracks(playlistIndex);
    const videoId = playlist.youtubeChapters.videoId;

    if (!tracks.length) {
        listBox.innerHTML = `
            <div class="youtube-empty">
                এই playlist-এ কোনো গান পাওয়া যায়নি।
            </div>
        `;
        return;
    }

    listBox.innerHTML = "";

    tracks.forEach((track, index) => {

        const item = document.createElement("button");
        item.type = "button";
        item.className = "youtube-song-item";
        item.dataset.index = index;
        item.dataset.playlist = playlistIndex;

        item.innerHTML = `
            <span class="youtube-song-number">
                ${String(index + 1).padStart(2, "0")}
            </span>
            <img
                class="youtube-song-thumb"
                src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
                alt=""
                loading="lazy"
            >
            <span class="youtube-song-info">
                <strong class="youtube-song-title">
                    ${escapeHTML(track.title)}
                </strong>
                <small class="youtube-song-source">
                    ${formatTime(track.start)} • ${escapeHTML(playlist.artist)}
                </small>
            </span>
            <span class="youtube-song-play">▶</span>
        `;

        item.onclick = (event) => {
            event.stopPropagation();
            loadYouTubePlaylistSong(index, playlistIndex);
        };

        listBox.appendChild(item);
    });

    updateYouTubeListActive();
}

/* Shows the song that matches the current time of the long video */
function syncYouTubeChapter() {

    const tracks = getChapterTracks(youtubeLoadedIndex);

    if (!tracks.length) return;

    if (Date.now() >= chapterHoldUntil) {
        let time = 0;
        try { time = youtubePlayer.getCurrentTime() || 0; } catch (e) {}
        currentIndex = findChapterIndex(youtubeLoadedIndex, time);
    }

    currentPlaylistIndex = youtubeLoadedIndex;

    const track = tracks[currentIndex] || tracks[0];

    currentSong.textContent = track.title;
    currentArtist.textContent =
        `${playlists[youtubeLoadedIndex].title} • YouTube`;

    updateYouTubeListActive();
}

function updateChapterProgress() {

    const total = youtubePlayer.getDuration();
    const current = youtubePlayer.getCurrentTime();

    if (Date.now() >= chapterHoldUntil) {
        const found = findChapterIndex(youtubeLoadedIndex, current);
        if (found !== currentIndex) {
            currentIndex = found;
            syncYouTubeChapter();
        }
    }

    const range = getChapterRange(youtubeLoadedIndex, currentIndex, total);

    if (!range) return;

    /* Repeat: loop the current song only */
    if (repeat && range.end - range.start > 2 &&
        current >= range.end - 0.6) {
        youtubePlayer.seekTo(range.start, true);
        return;
    }

    const length = range.end - range.start;
    const position = Math.min(Math.max(current - range.start, 0), length);

    progressBar.value = length ? (position / length) * 100 : 0;
    currentTime.textContent = formatTime(position);
    duration.textContent = formatTime(length);
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function loadYouTubePlaylistSong(index, playlistIndex = 0) {

    if (!youtubeReady || !youtubePlayer) return;

    playYouTubeItem(playlistIndex, index);
}

/* Plays one item. Video-ID lists (like Chandi Path) are played one
   video at a time, so they never mix with the trending playlist. */
function playYouTubeItem(playlistIndex, itemIndex) {

    if (!youtubeReady || !youtubePlayer) return;

    const playlist = playlists[playlistIndex];

    if (!playlist) return;

    if (playlist.youtubeVideoIds) {

        const videoId = playlist.youtubeVideoIds[itemIndex];

        if (!videoId) return;

        youtubeLoadedIndex = playlistIndex;
        currentPlaylistIndex = playlistIndex;
        currentIndex = itemIndex;

        youtubePlayer.loadVideoById(videoId);

    } else if (playlist.youtubeChapters) {

        const videoId = playlist.youtubeChapters.videoId;
        const range = getChapterRange(playlistIndex, itemIndex);

        if (!range) return;

        let sameVideo = false;
        try {
            sameVideo = youtubePlayer.getVideoData().video_id === videoId;
        } catch (e) {}

        youtubeLoadedIndex = playlistIndex;
        currentPlaylistIndex = playlistIndex;
        currentIndex = itemIndex;
        chapterHoldUntil = Date.now() + 1500;

        if (sameVideo) {
            youtubePlayer.seekTo(range.start, true);
            youtubePlayer.playVideo();
        } else {
            youtubePlayer.loadVideoById({
                videoId: videoId,
                startSeconds: range.start
            });
        }

    } else if (playlist.youtubePlaylistId) {

        if (youtubeLoadedIndex !== playlistIndex) {

            youtubeLoadedIndex = playlistIndex;
            currentPlaylistIndex = playlistIndex;
            currentIndex = itemIndex;

            youtubePlayer.loadPlaylist({
                listType: "playlist",
                list: playlist.youtubePlaylistId,
                index: itemIndex
            });

        } else {

            currentPlaylistIndex = playlistIndex;
            currentIndex = itemIndex;

            youtubePlayer.playVideoAt(itemIndex);
        }

    } else {
        return;
    }

    updateYouTubeSongInfo();
    updateYouTubeListActive();
}

/* Next / previous inside a video-ID list */
function stepYouTubeVideoList(direction) {

    const playlist = playlists[currentPlaylistIndex];

    const count = playlist.youtubeVideoIds
        ? playlist.youtubeVideoIds.length
        : getChapterTracks(currentPlaylistIndex).length;

    if (!count) return;

    const nextIndex =
        (currentIndex + direction + count) % count;

    playYouTubeItem(currentPlaylistIndex, nextIndex);
}

function updateYouTubeListActive() {

    document.querySelectorAll(".youtube-song-item")
        .forEach((item) => {

            const isCurrent =
                Number(item.dataset.playlist) === currentPlaylistIndex &&
                Number(item.dataset.index) === currentIndex;

            item.classList.toggle("active", isCurrent);

            const playIcon =
                item.querySelector(".youtube-song-play");

            if (playIcon) {
                playIcon.textContent =
                    isCurrent && isPlaying
                        ? "❚❚"
                        : "▶";
            }
        });
}

function onYouTubeStateChange(event) {

    if (!youtubePlayer) return;

    if (event.data === YT.PlayerState.PLAYING) {

        isPlaying = true;
        playBtn.textContent = "❚❚";
        startYouTubeProgress();
        updateYouTubeSongInfo();
        updateYouTubeListActive();

    } else if (event.data === YT.PlayerState.PAUSED) {

        isPlaying = false;
        playBtn.textContent = "▶";
        stopYouTubeProgress();
        updateYouTubeListActive();

    } else if (event.data === YT.PlayerState.ENDED) {

        isPlaying = false;
        playBtn.textContent = "▶";
        stopYouTubeProgress();

        if (repeat) {

            if (isYoutubeChapterList()) {
                const range = getChapterRange(
                    youtubeLoadedIndex, currentIndex,
                    youtubePlayer.getDuration()
                );
                if (range) youtubePlayer.seekTo(range.start, true);
            }

            youtubePlayer.playVideo();

        } else if (isYoutubeVideoList()) {

            const ids = playlists[youtubeLoadedIndex].youtubeVideoIds;

            if (currentIndex < ids.length - 1) {
                playYouTubeItem(youtubeLoadedIndex, currentIndex + 1);
            }
        }

        updateYouTubeListActive();

    } else if (event.data === YT.PlayerState.CUED) {

        updateYouTubeSongInfo();
        updateYouTubeListActive();
    }
}

function onYouTubeError(event) {

    console.log("YouTube Player Error:", event.data);

    const reasons = {
        2:   "ভিডিও ID ঠিক নেই",
        5:   "ব্রাউজারে চালানো যাচ্ছে না",
        100: "ভিডিওটি পাওয়া যায়নি বা private",
        101: "ভিডিওর মালিক এখানে চালানোর অনুমতি দেননি",
        150: "ভিডিওর মালিক এখানে চালানোর অনুমতি দেননি"
    };

    currentSong.textContent = "এই গানটি চালানো যাচ্ছে না";
    currentArtist.textContent =
        `${reasons[event.data] || "Unknown error"} (code ${event.data})`;

    isPlaying = false;
    playBtn.textContent = "▶";
    stopYouTubeProgress();
    updateYouTubeListActive();
}

function updateYouTubeSongInfo() {

    if (!youtubeReady || !youtubePlayer) return;

    if (isYoutubeChapterList()) {
        syncYouTubeChapter();
        return;
    }

    try {

        const data = youtubePlayer.getVideoData();

        if (data && data.title) {
            currentSong.textContent = data.title;
            currentArtist.textContent =
                `${playlists[youtubeLoadedIndex].title} • YouTube`;
        }

        if (!isYoutubeVideoList()) {

            const playlist = youtubePlayer.getPlaylist();
            const videoId =
                youtubePlayer.getVideoData()?.video_id;

            if (playlist && videoId) {
                const foundIndex = playlist.indexOf(videoId);
                if (foundIndex !== -1) currentIndex = foundIndex;
            }
        }

        currentPlaylistIndex = youtubeLoadedIndex;

        updateYouTubeListActive();

    } catch (error) {
        console.log("Could not read YouTube video data.");
    }
}

function startYouTubeProgress() {

    stopYouTubeProgress();

    youtubeProgressTimer = setInterval(() => {

        if (!youtubeReady || !youtubePlayer) return;

        if (isYoutubeChapterList()) {
            updateChapterProgress();
            return;
        }

        const total = youtubePlayer.getDuration();
        const current = youtubePlayer.getCurrentTime();

        if (!total) return;

        progressBar.value = (current / total) * 100;
        currentTime.textContent = formatTime(current);
        duration.textContent = formatTime(total);

    }, 500);
}

function stopYouTubeProgress() {

    if (youtubeProgressTimer) {
        clearInterval(youtubeProgressTimer);
        youtubeProgressTimer = null;
    }
}

/* -------------------------
   AUTO NEXT
-------------------------

/* -------------------------
   AUTO NEXT
------------------------- */

audio.addEventListener(
    "ended",
    () => {

        if (repeat) {

            audio.currentTime = 0;

            playSong();

        } else {

            nextSong();

        }

    }
);


/* -------------------------
   PROGRESS
------------------------- */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) return;

        const progress =
            (audio.currentTime / audio.duration) * 100;

        progressBar.value = progress;

        currentTime.textContent =
            formatTime(audio.currentTime);

        duration.textContent =
            formatTime(audio.duration);

    }
);


/* -------------------------
   SEEK
------------------------- */

progressBar.addEventListener(
    "input",
    () => {

        if (isYoutubePlaylist()) {

            if (!youtubeReady || !youtubePlayer) return;

            const total =
                youtubePlayer.getDuration();

            if (isYoutubeChapterList(currentPlaylistIndex)) {

                const range = getChapterRange(
                    currentPlaylistIndex, currentIndex, total
                );

                if (!range) return;

                chapterHoldUntil = Date.now() + 1000;

                youtubePlayer.seekTo(
                    range.start +
                    (progressBar.value / 100) * (range.end - range.start),
                    true
                );

                return;
            }

            if (!total) return;

            youtubePlayer.seekTo(
                (progressBar.value / 100) * total,
                true
            );

            return;
        }

        if (!audio.duration) return;

        audio.currentTime =
            (progressBar.value / 100) *
            audio.duration;

    }
);


/* -------------------------
   FORMAT TIME
------------------------- */

function formatTime(seconds) {

    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return `${minutes}:${secs
        .toString()
        .padStart(2, "0")}`;

}


/* -------------------------
   VOLUME
------------------------- */

audio.volume = 0.8;

volumeBar.value = 0.8;


volumeBar.addEventListener(
    "input",
    () => {

        const value =
            Number(volumeBar.value);

        /* YouTube volume */
        if (isYoutubePlaylist()) {

            if (youtubeReady && youtubePlayer) {
                youtubePlayer.setVolume(value * 100);
            }

            volumeBtn.textContent =
                value === 0 ? "🔇" : "🔊";

            return;
        }

        /* Existing local audio volume */
        audio.volume = value;

        volumeBtn.textContent =
            audio.volume === 0 ? "🔇" : "🔊";
    }
);


/* -------------------------
   MUTE
------------------------- */

function toggleMute() {

    if (isYoutubePlaylist()) {

        if (!youtubeReady || !youtubePlayer) return;

        const volume =
            youtubePlayer.isMuted()
                ? 80
                : 0;

        if (youtubePlayer.isMuted()) {

            youtubePlayer.unMute();
            youtubePlayer.setVolume(volume);
            volumeBar.value = 0.8;
            volumeBtn.textContent = "🔊";

        } else {

            youtubePlayer.mute();
            volumeBar.value = 0;
            volumeBtn.textContent = "🔇";
        }

        return;
    }

    audio.muted = !audio.muted;

    volumeBtn.textContent =
        audio.muted ? "🔇" : "🔊";
}


/* -------------------------
   REPEAT
------------------------- */

function toggleRepeat() {

    repeat = !repeat;

    repeatBtn.classList.toggle(
        "active",
        repeat
    );

}


/* ==========================================
   BENGALI CALENDAR
========================================== */


/*
   Bengali month information.

   This calendar uses the traditional
   Bengali calendar structure used in
   West Bengal for this UI.
*/

const bengaliMonths = [

    {
        name: "বৈশাখ",
        days: 31
    },

    {
        name: "জ্যৈষ্ঠ",
        days: 31
    },

    {
        name: "আষাঢ়",
        days: 32
    },

    {
        name: "শ্রাবণ",
        days: 32
    },

    {
        name: "ভাদ্র",
        days: 31
    },

    {
        name: "আশ্বিন",
        days: 30
    },

    {
        name: "কার্তিক",
        days: 30
    },

    {
        name: "অগ্রহায়ণ",
        days: 29
    },

    {
        name: "পৌষ",
        days: 30
    },

    {
        name: "মাঘ",
        days: 29
    },

    {
        name: "ফাল্গুন",
        days: 30
    },

    {
        name: "চৈত্র",
        days: 30
    }

];


const bengaliWeekdays = [
    "রবি",
    "সোম",
    "মঙ্গল",
    "বুধ",
    "বৃহঃ",
    "শুক্র",
    "শনি"
];


const tithis = [

    "প্রতিপদ",
    "দ্বিতীয়া",
    "তৃতীয়া",
    "চতুর্থী",
    "পঞ্চমী",
    "ষষ্ঠী",
    "সপ্তমী",
    "অষ্টমী",
    "নবমী",
    "দশমী",
    "একাদশী",
    "দ্বাদশী",
    "ত্রয়োদশী",
    "চতুর্দশী",
    "পূর্ণিমা"

];


/* Current English date */

let today = new Date();


/*
   Approximate Bengali year.

   Bengali year changes around
   Bengali New Year in April.
*/

function getBengaliYear(date) {

    const year = date.getFullYear();

    /* Bengali New Year (Poila Boishakh) = 15 April */

    const afterNewYear =
        date.getMonth() > 3 ||
        (date.getMonth() === 3 && date.getDate() >= 15);

    return afterNewYear ? year - 593 : year - 594;

}


/* Days between two calendar dates (ignores time of day / DST) */

function daysBetween(from, to) {

    const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

    return Math.round((b - a) / 86400000);

}


/*
   English date -> Bengali date (West Bengal style).

   Bengali year starts on 15 April. Month lengths come from
   bengaliMonths above. They match the published West Bengal
   panjika (Kolkata) for Bengali year 1433:

   বৈশাখ 15 Apr, জ্যৈষ্ঠ 16 May, আষাঢ় 16 Jun, শ্রাবণ 18 Jul,
   ভাদ্র 19 Aug, আশ্বিন 19 Sep, কার্তিক 19 Oct, অগ্রহায়ণ 18 Nov,
   পৌষ 17 Dec, মাঘ 16 Jan, ফাল্গুন 14 Feb, চৈত্র 16 Mar

   Month lengths change slightly from year to year, so for a new
   Bengali year check these 12 numbers against that year's panjika.
*/

function getBengaliDate(date) {

    const year = getBengaliYear(date);

    /* Gregorian year in which this Bengali year started */

    const startYear = year + 593;

    const bengaliNewYear = new Date(startYear, 3, 15);

    let day = daysBetween(bengaliNewYear, date) + 1;

    let monthIndex = 0;

    for (let i = 0; i < bengaliMonths.length; i++) {

        const isLast = i === bengaliMonths.length - 1;

        if (day <= bengaliMonths[i].days || isLast) {

            monthIndex = i;

            break;

        }

        day -= bengaliMonths[i].days;

    }

    return {

        year: year,

        monthIndex: monthIndex,

        day: day

    };

}


/* -------------------------
   REAL TITHI CALCULATION

   Tithi = how far the Moon is ahead of the Sun
   (every 12 degrees = 1 tithi). Like a Panjika,
   the tithi that is running at sunrise (about
   5:45 AM in West Bengal) is the tithi of that day.
------------------------- */

function sunLongitude(T) {

    const rad = Math.PI / 180;

    const L0 = 280.46646 + 36000.76983 * T;
    const M = 357.52911 + 35999.05029 * T;

    const C =
        1.914602 * Math.sin(M * rad) +
        0.019993 * Math.sin(2 * M * rad);

    return L0 + C;

}


function moonLongitude(T) {

    const rad = Math.PI / 180;

    const L = 218.3165 + 481267.8813 * T;
    const D = 297.8502 + 445267.1115 * T;
    const M = 357.5291 + 35999.0503 * T;
    const Mp = 134.9634 + 477198.8676 * T;
    const F = 93.2721 + 483202.0175 * T;

    return (
        L +
        6.289 * Math.sin(Mp * rad) +
        1.274 * Math.sin((2 * D - Mp) * rad) +
        0.658 * Math.sin(2 * D * rad) +
        0.214 * Math.sin(2 * Mp * rad) -
        0.186 * Math.sin(M * rad) -
        0.114 * Math.sin(2 * F * rad) -
        0.059 * Math.sin((2 * D - 2 * Mp) * rad) -
        0.057 * Math.sin((2 * D - M - Mp) * rad) +
        0.053 * Math.sin((2 * D + Mp) * rad) +
        0.046 * Math.sin((2 * D - M) * rad) +
        0.041 * Math.sin((M - Mp) * rad) -
        0.035 * Math.sin(D * rad) -
        0.030 * Math.sin((M + Mp) * rad)
    );

}


/*
   Sunrise moment (UTC milliseconds) for a civil date in Kolkata.

   Uses the open-source Astronomy Engine library (MIT license,
   https://github.com/cosinekitty/astronomy) when it has loaded.
   If it did not load (offline), a fixed 05:45 AM India time is used.
*/

const KOLKATA = { lat: 22.5726, lon: 88.3639, elevation: 9 };

function getSunriseMs(date) {

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    /* start of this civil day in India = 18:30 UTC of the day before */

    const dayStartUtc = Date.UTC(y, m, d) - 5.5 * 3600000;

    if (typeof Astronomy !== "undefined") {

        try {

            const observer = new Astronomy.Observer(
                KOLKATA.lat,
                KOLKATA.lon,
                KOLKATA.elevation
            );

            const rise = Astronomy.SearchRiseSet(
                Astronomy.Body.Sun,
                observer,
                +1,
                new Date(dayStartUtc),
                1
            );

            if (rise && rise.date) return rise.date.getTime();

        } catch (err) {

            /* use the fallback below */

        }

    }

    return Date.UTC(y, m, d, 0, 15);   /* 05:45 AM IST */

}


/* How far the Moon is ahead of the Sun (0 - 360 degrees) */

function getElongation(ms) {

    if (typeof Astronomy !== "undefined") {

        try {

            return Astronomy.MoonPhase(new Date(ms));

        } catch (err) {

            /* use the fallback below */

        }

    }

    const jd = ms / 86400000 + 2440587.5;

    const T = (jd - 2451545.0) / 36525;

    let elongation =
        (moonLongitude(T) - sunLongitude(T)) % 360;

    if (elongation < 0) elongation += 360;

    return elongation;

}


function getTithi(date) {

    const elongation = getElongation(getSunriseMs(date));

    const number = Math.floor(elongation / 12) % 30;   /* 0 - 29 */

    const shukla = number < 15;

    const index = number % 15;                         /* 0 - 14 */

    let name = tithis[index];

    if (index === 14) {
        name = shukla ? "পূর্ণিমা" : "অমাবস্যা";
    }

    return {

        name: name,

        paksha: shukla ? "শুক্লপক্ষ" : "কৃষ্ণপক্ষ",

        isSpecial: index === 14

    };

}


/* -------------------------
   BENGALI NUMBERS
------------------------- */

function toBn(value) {

    const digits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

    return String(value).replace(/\d/g, (d) => digits[d]);

}


/* -------------------------
   BENGALI MONTH HELPERS
------------------------- */

/* English date of the 1st day of a Bengali month */

function getBengaliMonthStart(year, monthIndex) {

    let offset = 0;

    for (let i = 0; i < monthIndex; i++) {
        offset += bengaliMonths[i].days;
    }

    return new Date(year + 593, 3, 15 + offset);

}


/* Number of days in a Bengali month (চৈত্র gets the extra day in leap years) */

function getBengaliMonthLength(year, monthIndex) {

    if (monthIndex < bengaliMonths.length - 1) {
        return bengaliMonths[monthIndex].days;
    }

    const yearStart = new Date(year + 593, 3, 15);
    const nextYearStart = new Date(year + 594, 3, 15);

    const yearLength = daysBetween(yearStart, nextYearStart);

    let before = 0;

    for (let i = 0; i < monthIndex; i++) {
        before += bengaliMonths[i].days;
    }

    return yearLength - before;

}


/* -------------------------
   CALENDAR STATE
   (the Bengali month being shown)
------------------------- */

const todayBengali = getBengaliDate(today);

let viewYear = todayBengali.year;

let viewMonth = todayBengali.monthIndex;


/* -------------------------
   RENDER CALENDAR
------------------------- */

function renderCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    grid.innerHTML = "";


    const start =
        getBengaliMonthStart(viewYear, viewMonth);

    const daysInMonth =
        getBengaliMonthLength(viewYear, viewMonth);

    const end =
        new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + daysInMonth - 1
        );


    /* Header: Bengali month + year, and the English dates it covers */

    document.getElementById("monthName").textContent =
        `${bengaliMonths[viewMonth].name} ${toBn(viewYear)}`;

    const fmtStart =
        start.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: start.getFullYear() !== end.getFullYear()
                ? "numeric"
                : undefined
        });

    const fmtEnd =
        end.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    document.getElementById("englishMonth").textContent =
        `${fmtStart} – ${fmtEnd}`;


    /* Empty cells before the first day */

    for (let i = 0; i < start.getDay(); i++) {

        const empty = document.createElement("div");

        empty.className = "calendar-day empty";

        grid.appendChild(empty);

    }


    const pujaDays = {

        "2026-10-17": "ষষ্ঠী",

        "2026-10-18": "সপ্তমী",

        "2026-10-19": "অষ্টমী",

        "2026-10-20": "নবমী",

        "2026-10-21": "দশমী"

    };


    for (let bengaliDay = 1; bengaliDay <= daysInMonth; bengaliDay++) {

        const current =
            new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() + bengaliDay - 1
            );

        const isToday =
            current.toDateString() === today.toDateString();

        const cell = document.createElement("div");

        cell.className = "calendar-day";

        if (isToday) {
            cell.classList.add("today");
        }

        const dateKey =
            current.getFullYear() + "-" +
            String(current.getMonth() + 1).padStart(2, "0") + "-" +
            String(current.getDate()).padStart(2, "0");

        if (pujaDays[dateKey]) {
            cell.classList.add("puja");
        }

        /* small English date; add month name on the 1st of a month and the first cell */

        const englishLabel =
            (bengaliDay === 1 || current.getDate() === 1)
                ? current.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short"
                })
                : current.getDate();

        cell.innerHTML = `

            <div class="english-date">
                ${englishLabel}
            </div>

            <div class="bengali-date">
                ${toBn(bengaliDay)}
            </div>

            <div class="tithi">
                ${getTithi(current).name}
            </div>

            ${isToday
                ? `<div class="today-mark">আজ</div>`
                : ""}

            ${pujaDays[dateKey]
                ? `<div class="puja-label">${pujaDays[dateKey]}</div>`
                : ""}

        `;

        grid.appendChild(cell);

    }

}


/* -------------------------
   PREVIOUS / NEXT BENGALI MONTH
------------------------- */

function previousMonth() {

    viewMonth--;

    if (viewMonth < 0) {
        viewMonth = bengaliMonths.length - 1;
        viewYear--;
    }

    renderCalendar();

}


function nextMonth() {

    viewMonth++;

    if (viewMonth >= bengaliMonths.length) {
        viewMonth = 0;
        viewYear++;
    }

    renderCalendar();

}


/* -------------------------
   TODAY INFORMATION
------------------------- */

function updateToday() {

    const bengali = getBengaliDate(today);

    document.getElementById("todayDate").textContent =
        `${toBn(bengali.day)} ${bengaliMonths[bengali.monthIndex].name}, ${toBn(bengali.year)}`;

    const t = getTithi(today);

    document.getElementById("todayTithi").textContent =
        t.isSpecial
            ? `আজ ${t.name}`
            : `আজ ${t.paksha}, ${t.name}`;

}


/* INITIALIZE */

renderCalendar();

updateToday();


/* Update automatically when the date changes (page left open past midnight) */

setInterval(() => {

    const now = new Date();

    if (now.toDateString() !== today.toDateString()) {

        today = now;

        const b = getBengaliDate(today);

        viewYear = b.year;

        viewMonth = b.monthIndex;

        renderCalendar();

        updateToday();

    }

}, 60000);


// Set initial volume
audio.volume = 0.8;


/* -------------------------
   QR POPUP
------------------------- */

const qrOverlay = document.getElementById("qrOverlay");

function openQr() {
    qrOverlay.classList.add("show");
}

document.getElementById("qrOpenBtn").addEventListener("click", openQr);

const qrLabel = document.getElementById("qrLabel");
qrLabel.addEventListener("click", openQr);
qrLabel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openQr();
    }
});

document.getElementById("qrCloseBtn").addEventListener("click", () => {
    qrOverlay.classList.remove("show");
});

qrOverlay.addEventListener("click", (e) => {
    if (e.target === qrOverlay) qrOverlay.classList.remove("show");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") qrOverlay.classList.remove("show");
});