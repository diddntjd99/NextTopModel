import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Room, RoomData } from 'ZEPETO.Multiplay'
import { Button } from 'UnityEngine.UI'
import ClientStarter from './ClientStarter';
import * as UnityEngine from "UnityEngine";


export default class OpeningController extends ZepetoScriptBehaviour {
    public opening: UnityEngine.GameObject[];
    public openingGoal: UnityEngine.GameObject;
    public obj: UnityEngine.GameObject;
    public skipButton: Button;

    private room: Room;
    
    private flag: boolean;
    private index: number;
    private timer: number;
    private delay: number;

    Start() {
        this.skipButton.gameObject.SetActive(true);

        this.flag = false;
        this.index = -1;
        this.timer = 0;
        this.delay = 2;

        this.room = this.obj.GetComponent<ClientStarter>().getRoom();
        this.skipButton.onClick.AddListener(() => this.openingSkip(this.room, this.skipButton.gameObject));
    }

    Update() {
        this.timer += UnityEngine.Time.deltaTime;
        if(this.flag) {
            this.opening[this.index].transform.position = UnityEngine.Vector3.MoveTowards(this.opening[this.index].transform.position, this.openingGoal.transform.position, 0.4);
        }
        if(this.timer > this.delay) {
            this.flag = true;
            this.index++;
            this.timer = 0;

            if(this.index == 2) {
                this.delay = 6;
            } else {
                this.delay = 4;
            }

            if(this.index == this.opening.length) {
                this.room.Send("openingFinish", "");
                this.flag = false;
            }
        }
    }

    openingSkip(room:Room, skipButton:UnityEngine.GameObject) {
        room.Send("openingFinish", "");

        skipButton.gameObject.SetActive(false);
    }
}