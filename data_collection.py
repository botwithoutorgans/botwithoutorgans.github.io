import youtube_dl

playlist_url = 'https://youtube.com/playlist?list=PLiR8NqajHNPbaX2rBoA2z6IPGpU0IPlS2'

# Create a youtube_dl options object
ydl_opts = {
    'outtmpl': 'audio_data/%(title)s.%(ext)s',
    'ignoreerrors': True,
    'format': 'bestaudio/best',
    'force_ipv4': True,
    'geo_bypass': True,
}


# Download all videos in the playlist
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    ydl.download([playlist_url]) 
