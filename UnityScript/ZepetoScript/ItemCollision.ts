import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Room} from 'ZEPETO.Multiplay'
import ClientStarter from './ClientStarter';
import { AudioSource, GameObject, Random } from 'UnityEngine'

export default class ItemCollision extends ZepetoScriptBehaviour {
    public obj:GameObject;
    public audioObj:GameObject;
    public item: GameObject[];

    private room:Room;
    private audioSource: AudioSource;

    Start() {
        this.audioSource = this.audioObj.GetComponent<AudioSource>();
    }

    Update() {
        this.gameObject.transform.Rotate(0, 0.5, 0);
    }

    OnTriggerEnter(other) {
        if(other.gameObject.CompareTag("Player")) {
            this.audioSource.Play();

            GameObject.Destroy(this.gameObject);

            this.room = this.obj.GetComponent<ClientStarter>().getRoom();
            this.room.Send("deleteItemServer", this.gameObject.name);

            var score = this.obj.GetComponent<ClientStarter>().getScore();
            if(this.gameObject == this.item[0]) {
                score += 2;
            } else if(this.gameObject == this.item[1]) {
                score += 5;
            } else if(this.gameObject == this.item[2]) {
                var random = Random.Range(1, 11);
                score += random;
            }
            this.obj.GetComponent<ClientStarter>().setScore(score);
        }
    }
}