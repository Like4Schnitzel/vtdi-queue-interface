export type YouTubeResponse = {
    title: string,
    author_name: string,
    author_url: string,
    type: string,
    height: number,
    width: number,
    version: string,
    provider_name: string,
    provider_url: string,
    thumbnail_height: number,
    thumbnail_width: number,
    thumbnail_url: number,
    html: string
}

export type QueueInfo = {
    url: string,
    info: YouTubeResponse,
    uniqueID: number,
    timeStartedPlaying: number,
    width: number,
    height: number,
    transcodeProgress: number
}

export type Queue = {
    cooldownStartTime: number,
    videos: QueueInfo[]
}
