import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const trailerVideos = [
  '/videos/trailer-1.mp4',
  '/videos/trailer-2.mp4',
  '/videos/trailer-3.mp4',
  '/videos/trailer-4.mp4',
  '/videos/trailer-5.mp4',
];

export const VideoHero = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentVideo]);

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % trailerVideos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + trailerVideos.length) % trailerVideos.length);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideo}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <video
            ref={videoRef}
            src={trailerVideos[currentVideo]}
            className="h-full w-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onEnded={nextVideo}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-4"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium tracking-wider text-primary backdrop-blur-sm">
            MES CAMPUS SCHOOL, KUTTIPPURAM
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="block">Annual Day</span>
          <span className="text-gradient-gold block italic">Celebration</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          A grand celebration of talent, creativity, and excellence
        </motion.p>

        {/* Video Navigation Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex gap-3"
        >
          {trailerVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentVideo
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-foreground/30 hover:bg-foreground/50'
              }`}
            />
          ))}
        </motion.div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={prevVideo}
          className="rounded-full border border-foreground/20 bg-background/30 p-3 backdrop-blur-md transition-all hover:border-primary hover:bg-primary/20"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        
        <button
          onClick={togglePlay}
          className="rounded-full border border-primary bg-primary/20 p-4 backdrop-blur-md transition-all hover:bg-primary/30"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-primary" />
          ) : (
            <Play className="h-6 w-6 text-primary" />
          )}
        </button>

        <button
          onClick={nextVideo}
          className="rounded-full border border-foreground/20 bg-background/30 p-3 backdrop-blur-md transition-all hover:border-primary hover:bg-primary/20"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>

        <button
          onClick={toggleMute}
          className="ml-4 rounded-full border border-foreground/20 bg-background/30 p-3 backdrop-blur-md transition-all hover:border-primary hover:bg-primary/20"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-foreground" />
          ) : (
            <Volume2 className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-8 text-sm text-muted-foreground"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};
