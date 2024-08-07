import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi

# Function to get video IDs from the Y Combinator YouTube channel
def get_video_ids(channel_url):
    video_ids = []
    page_token = ""

    while True:
        url = f"{channel_url}/videos?pbj=1&page_token={page_token}"
        response = requests.get(url)
        if response.status_code != 200:
            break

        data = response.json()
        items = data[1]['response']['contents']['twoColumnBrowseResultsRenderer']['tabs'][1]['tabRenderer']['content']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'][0]['gridRenderer']['items']

        for item in items:
            video_id = item['gridVideoRenderer']['videoId']
            video_ids.append(video_id)

        next_page_token = data[1]['response']['continuationContents']['gridContinuation']['continuations'][0]['nextContinuationData']['continuation']
        if not next_page_token:
            break
        page_token = next_page_token

    return video_ids

# Function to get transcripts using youtube-transcript-api
def get_transcripts(video_ids):
    transcripts = {}
    for video_id in video_ids:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcripts[video_id] = transcript_list
        except Exception as e:
            print(f"Could not retrieve transcript for video {video_id}: {e}")
    return transcripts

# Function to save transcripts to a file
def save_transcripts(transcripts, output_file='transcripts.txt'):
    with open(output_file, 'w') as f:
        for video_id, transcript in transcripts.items():
            f.write(f"Video ID: {video_id}\n")
            for entry in transcript:
                f.write(f"{entry['start']}: {entry['text']}\n")
            f.write("\n")

if __name__ == "__main__":
    channel_url = 'https://www.youtube.com/c/ycombinator'
    video_ids = get_video_ids(channel_url)
    transcripts = get_transcripts(video_ids)
    save_transcripts(transcripts)
    print(f"Transcripts saved to transcripts.txt")
