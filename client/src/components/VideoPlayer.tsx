import './VideoPlayer.css'

type VideoPlayerProps = {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
}

export default function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  className = '',
}: VideoPlayerProps) {
  return (
    <div className={`video-player ${className}`.trim()}>
      <video
        src={src}
        poster={poster}
        title={title}
        controls={!autoPlay}
        autoPlay={autoPlay}
        muted={muted || autoPlay}
        loop={loop}
        playsInline
        preload="metadata"
      />
    </div>
  )
}
