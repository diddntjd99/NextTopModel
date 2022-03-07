import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Room, RoomData } from 'ZEPETO.Multiplay'
import { VideoPlayer } from 'UnityEngine.Video'
import { Button } from 'UnityEngine.UI'
import ClientStarter from './ClientStarter';
import * as UnityEngine from "UnityEngine";

export default class VideoController extends ZepetoScriptBehaviour {
    public videoPlayer: VideoPlayer;
    public obj: UnityEngine.GameObject;
    public skipButton: Button;

    private room: Room;

    Start() {
        this.skipButton.gameObject.SetActive(true);

        this.room = this.obj.GetComponent<ClientStarter>().getRoom();
        this.skipButton.onClick.AddListener(() => this.openingSkip(this.room, this.skipButton.gameObject));

        this.videoPlayer.Play();
    }

    Update() {
        if (this.videoPlayer.isPrepared) {
            if (!this.videoPlayer.isPlaying) {
                this.room.Send("openingFinish", this.gameObject.name);
            }
        }
    }

    openingSkip(room:Room, skipButton:UnityEngine.GameObject) {
        room.Send("openingFinish", this.gameObject.name);

        skipButton.gameObject.SetActive(false);
    }
}