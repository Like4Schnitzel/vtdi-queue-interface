from os import remove
from os import path
from subprocess import Popen
from subprocess import PIPE
from threading import Thread
from time import sleep
from sys import stdout
from pprint import pprint
from json import load
from json import loads
from requests import get
from requests import post
from requests import delete
from sseclient import SSEClient
from playsound import playsound
from time import time
from yt_dlp import YoutubeDL

def handle_queue_item(item: dict, src_dir: str, server_url: str, server_password: str):
    # download video
    ydl_ops = {
        'format': 'bv+ba',
        'outtmpl': f'{src_dir}/data/queue/%(title)s_%(id)s.%(ext)s'
    }
    with YoutubeDL(ydl_ops) as ydl:
        info = ydl.extract_info(item["url"])
        item["fileName"] = f'{src_dir}/data/queue/{info["title"]}_{info["id"]}.{info["ext"]}'
        item["vtdiFileName"] = f'{src_dir}/data/queue/{info["title"]}_{info["id"]}_{item["width"]}_{item["height"]}.vtdi'
        ydl.download([item["url"]])

    # transcode video
    transcode_process = Popen([
        f'{src_dir}/build/Transcoder',
        '--path',
        item["fileName"],
        '--vtdi-path',
        item["vtdiFileName"],
        '--width',
        str(item["width"]),
        '--height',
        str(item["height"]),
        '-n'
        ], stdout=PIPE)

    next_progress_num = ""
    track_next_chars = False
    progress_sent = False
    for c in iter(lambda: transcode_process.stdout.read(1), b''):
        if c == b'%':
            track_next_chars = False
            response = post(f'{server_url}/queue', timeout=5, json={
                'method': 'updateProgress',
                'password': server_password,
                'progress': float(next_progress_num),
                'uniqueID': item["uniqueID"]
            })
            response_code = loads(response.text)["status"]

            # if video has been removed from queue, stop decoding
            if response_code == 410:
                transcode_process.kill()
                remove(item["vtdiFileName"])
                return

            next_progress_num = ""
            progress_sent = True

        if track_next_chars:
            next_progress_num += c.decode()

        if c == b'\r':
            track_next_chars = True

    # in case the file already exists and it returns
    if not progress_sent:
        post(f'{server_url}/queue', timeout=5, json={
            'method': 'updateProgress',
            'password': server_password,
            'progress': 100,
            'uniqueID': item["uniqueID"]
        })

def play_video(src_dir: str, server_url: str, password: str, video: dict):
    console_safe_filename = video["vtdiFileName"].replace(" ", "\\ ")
    decode_process = Popen([
        'konsole',
        '--fullscreen',
        '-e',
        f'{src_dir}/build/Decoder {console_safe_filename}'
    ])
    playsound(video["fileName"], False)
    decode_process.wait()

    # remove video from queue after it's done playing
    delete(f'{server_url}/queue', timeout=5, json={
        'password': password,
        'index': 0
    })

def main():
    dir_path =  path.dirname(path.realpath(__file__))
    env_json = open(f'{dir_path}/env.json', encoding='utf-8')
    env_vars = load(env_json)

    start_time = time()
    queue = loads(get(f'{env_vars["URL"]}/queue', timeout=5).text)['videos']
    end_time = time()
    one_way_latency_seconds = (end_time - start_time) / 2
    for video in queue:
        Thread(target=handle_queue_item, args=[
            video, env_vars["VTDI_SRC_DIR"],
            env_vars["URL"],
            env_vars["POST_PASSWORD"]
        ]).start()

    messages = SSEClient(f'{env_vars["URL"]}/api/sse')

    for msg in messages:
        if msg.event == 'queueItemAdded':
            queue_item = loads(msg.data)
            queue.append(queue_item)
            Thread(target=handle_queue_item, args=[
                queue_item,
                env_vars["VTDI_SRC_DIR"],
                env_vars["URL"],
                env_vars["POST_PASSWORD"]
            ]).start()

        elif msg.event == 'queueItemRemoved':
            queue_index = loads(msg.data)
            #item = queue[queue_index]
            #video_id = item["url"][item["url"].rfind('=')+1:]
            #file_location = f'{env_vars["VTDI_SRC_DIR"]}/data/queue/{string_to_valid_filename(item["info"]["title"])}_{video_id}.mp4'
            #remove(file_location)
            queue.pop(queue_index)

        elif msg.event == 'playVideo':
            sleep(one_way_latency_seconds)
            Thread(target=play_video, args=[
                env_vars["VTDI_SRC_DIR"],
                env_vars["URL"],
                env_vars["POST_PASSWORD"],
                queue[0]
            ]).start()

if __name__ == '__main__':
    main()
