class Queue {
    constructor() {
        this.items = [];
        this.currentIndex = -1;
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getCurrent() {
        if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
            return this.items[this.currentIndex];
        }
        return null;
    }

    next() {
        if (this.currentIndex < this.items.length - 1) {
            this.currentIndex++;
            return this.getCurrent();
        }
        return null;
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.getCurrent();
        }
        return null;
    }
    
    hasMore() {
        return this.currentIndex < this.items.length - 1;
    }
}

class AudioPlayer {
    constructor(audioId, onPrevious, onNext) {
        this.audio = document.getElementById(audioId);
        this.onPrevious = onPrevious;
        this.onNext = onNext;
        this.createControls();
        this.addEventListeners();
    }
    
    createControls() {
        const container = document.createElement('div');
        container.className = 'audio-player';
        
        this.audioTitle = document.createElement('div');
        this.audioTitle.className = 'audio-title';
        container.appendChild(this.audioTitle);
        
        this.playBtn = document.createElement('button');
        this.playBtn.innerHTML = '▶';
        this.playBtn.className = 'play-btn';

        this.prevBtn = document.createElement('button');
        this.prevBtn.innerHTML = '⏮';
        this.prevBtn.className = 'prev-btn';

        this.nextBtn = document.createElement('button');
        this.nextBtn.innerHTML = '⏭';
        this.nextBtn.className = 'next-btn';

        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = 0;
        this.volumeSlider.max = 1;
        this.volumeSlider.step = 0.1;
        this.volumeSlider.value = 1;
        this.volumeSlider.className = 'volume-slider';

        this.progressBar = document.createElement('input');
        this.progressBar.type = 'range';
        this.progressBar.min = 0;
        this.progressBar.max = 100;
        this.progressBar.value = 0;
        this.progressBar.className = 'progress-bar';

        this.currentTime = document.createElement('span');
        this.currentTime.className = 'current-time';
        this.currentTime.textContent = '0:00';

        this.duration = document.createElement('span');
        this.duration.className = 'duration';
        this.duration.textContent = '0:00';

        this.volumetext = document.createElement('span');
        this.volumetext.className = 'volumetext';
        this.volumetext.textContent = '🔉';

        container.appendChild(this.progressBar);
        container.appendChild(this.currentTime);
        container.appendChild(this.duration);
        container.appendChild(this.prevBtn);
        container.appendChild(this.playBtn);
        container.appendChild(this.nextBtn);
        container.appendChild(this.volumetext);
        container.appendChild(this.volumeSlider);

        this.audio.parentNode.insertBefore(container, this.audio.nextSibling);
    }

    addEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => {
            if (this.onPrevious) this.onPrevious();
        });
        this.nextBtn.addEventListener('click', () => {
            if (this.onNext) this.onNext();
        });
        this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = this.volumeSlider.value;
            this.updateVolumeIcon();
        });
        this.progressBar.addEventListener('input', () => {
            const seekTime = (this.progressBar.value / 100) * this.audio.duration;
            this.audio.currentTime = seekTime;
        });
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => {
            this.progressBar.max = 100;
            this.updateDuration();
        });
        this.audio.addEventListener('play', () => {
            this.playBtn.innerHTML = '⏸';
        });
        this.audio.addEventListener('pause', () => {
            this.playBtn.innerHTML = '▶';
        });
    }
    
    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }
    
    playPrevious() {
        if (this.onPrevious) this.onPrevious();
    }
    
    playNext() {
        if (this.onNext) this.onNext();
    }
    
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.value = percent;
        this.updateCurrentTime();
    }
    
    updateCurrentTime() {
        const currentMinutes = Math.floor(this.audio.currentTime / 60);
        const currentSeconds = Math.floor(this.audio.currentTime % 60);
        this.currentTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }
    
    updateDuration() {
        if (isNaN(this.audio.duration)) return;
        const durationMinutes = Math.floor(this.audio.duration / 60);
        const durationSeconds = Math.floor(this.audio.duration % 60);
        this.duration.textContent = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    }
    
    updateVolumeIcon() {
        const volume = this.audio.volume;
        if (volume === 0) {
            this.volumetext.textContent = '🔇';
        } else if (volume < 0.5) {
            this.volumetext.textContent = '🔈';
        } else {
            this.volumetext.textContent = '🔉';
        }
    }
    
    setTitle(title) {
        this.audioTitle.textContent = title || 'Unknown';
    }
}

class Controlmedia {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.songQueue = new Queue();
        this.isPlaying = false;
    }
    
    nextaudio() {
        this.audioPlayer.audio.pause();
        this.audioPlayer.audio.currentTime = 0;
        if (!this.songQueue.isEmpty() && this.songQueue.next()) {
            this.playNextAudio();
        } else {
            this.isPlaying = false;
        }
    }
    
    playNextAudio() {
        const audioItem = this.songQueue.getCurrent();
        if (audioItem) {
            this.audioPlayer.audio.src = audioItem.url;
            this.audioPlayer.setTitle(audioItem.title);
            this.audioPlayer.audio.load();
            this.audioPlayer.audio.play();
        }
    }
    
    playPreviousAudio() {
        const audioItem = this.songQueue.previous();
        if (audioItem) {
            this.audioPlayer.audio.src = audioItem.url;
            this.audioPlayer.setTitle(audioItem.title);
            this.audioPlayer.audio.load();
            this.audioPlayer.audio.play();
        }
    }

    addSong(audioItem) {
        console.log('addSong', audioItem);
        if (audioItem) {
            this.songQueue.enqueue(audioItem);
            if (!this.isPlaying) {
                this.isPlaying = true;
                this.kickstartPlayer();
            }
        }
    }

    kickstartPlayer() {
        this.songQueue.next(); // Start at the first song
        this.isPlaying = true;
        this.playNextAudio();

        this.audioPlayer.audio.onended = () => {
            this.nextaudio();
        };
    }
}
export { Queue, AudioPlayer, Controlmedia };