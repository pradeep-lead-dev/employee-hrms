import React, { useState } from "react";
import { Spin } from "antd"; // Import Spin from Ant Design
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const VideoFeed = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [hasError, setHasError] = useState(false); // Track error state

  const handleLoad = () => {
    setIsLoading(false); // Stop loading when the video is loaded
  };

  const handleError = () => {
    setHasError(true); // Set error if the video fails to load
    setIsLoading(false); // Stop loading in case of error
  };

  const videoStreamURI = `${import.meta.env.VITE_API_URI}`

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && !hasError && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" /> {/* Show Spin while loading */}
        </div>
      )}
      {hasError && <div className="error-message">Failed to load video.</div>}
      <div style={{position : "relative"}}>
        <img 
          src={`${videoStreamURI}/api/dashboard/video/${src}`}
          //src="https://dotsito.s3.ap-south-1.amazonaws.com/Live+feed+waiting+-+gif.gif"
          title="Camera Feed"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          onLoad={handleLoad} // Handle successful load
          onError={handleError} // Handle load error
          style={{ display: isLoading || hasError ? "none" : "block" }} // Hide video if loading or error
        />
        <a 
        href={`${videoStreamURI}/api/dashboard/video/${src}`}
        target="_blank" // Opens in a new tab
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          right: "0px",
          bottom: "0px",
        }}
        > <FullscreenIcon  fontSize="large" sx={{ color: "white"}} />  </a>
      </div>
    </div>
  );
};

export default VideoFeed;
