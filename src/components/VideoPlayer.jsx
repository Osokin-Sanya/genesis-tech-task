import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SelectOutlined,
  SoundOutlined,
} from "@ant-design/icons";

import { Storage } from "../utils";

export default function VideoPlayer({ lesson }) {
  const { link, duration } = lesson || {};
  const url = link ? link : "";

  const videoRef = useRef(null);
  const hlsRef = useRef(new Hls());

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      hlsRef?.current?.detachMedia();
      hlsRef?.current?.destroy();

      videoRef?.current?.removeEventListener("loadedmetadata", onVideoPlay);
    };
  }, []);

  useEffect(() => {
    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = hlsRef.current;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, onVideoPlay);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // If HLS is not supported, try to play the video directly
      videoRef.current.src = url;
      videoRef.current.addEventListener("loadedmetadata", onVideoPlay);
    }
  }, [url]);

  useEffect(() => {
    const savedProgress = Storage.getVideoProgress(url);
    if (savedProgress) {
      videoRef.current.currentTime = savedProgress;
      setCurrentTime(savedProgress);
    }
  }, [url]);

  function onVideoPlay() {
    videoRef.current.pause();
    setIsPlaying(false);
  }

  const handlePlay = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleVolumeChange = (event) => {
    videoRef.current.volume = event.target.value;
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      // spacebar
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (event.keyCode === 37) {
      // left arrow
      videoRef.current.currentTime -= 5;
    } else if (event.keyCode === 39) {
      // right arrow
      videoRef.current.currentTime += 5;
    }
  };

  const rewindVideo = (event) => {
    const value = Number(event.target.value);
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVideoClick = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePiP = () => {
    document.pictureInPictureElement
      ? document.exitPictureInPicture()
      : videoRef.current.requestPictureInPicture();
  };

  function handleTimeUpdate(event) {
    const currentTime = Number(event.target.currentTime);
    setCurrentTime(currentTime);
    Storage.setVideoProgress(url, currentTime);
  }

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        controls={false}
        onKeyDown={handleKeyDown}
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={url} type="application/x-mpegURL" />
      </video>
      <div className="controls">
        {isPlaying ? (
          <PauseCircleOutlined onClick={handlePause} className="video-button" />
        ) : (
          <PlayCircleOutlined onClick={handlePlay} className="video-button" />
        )}

        <SelectOutlined onClick={handlePiP} className="video-button" />
        <SoundOutlined className="video-button" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="1"
          onChange={handleVolumeChange}
        />
        <div style={{ width: 500, display: "flex", alignItems: "center" }}>
          <DoubleLeftOutlined />
          <input
            style={{ width: "100%" }}
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(event) => rewindVideo(event)}
          />
          <DoubleRightOutlined />
        </div>
      </div>
    </div>
  );
}
