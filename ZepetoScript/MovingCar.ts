import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import * as UnityEngine from "UnityEngine";

export default class MovingCar extends ZepetoScriptBehaviour {
    private goFlag:boolean;
    private waitFlag:boolean;
    private timer:number;

    Start() {
        this.goFlag = true;
        this.waitFlag = false;
        this.timer = 0;
    }

    Update() {
        if(this.goFlag) {
            this.transform.Translate(0, -0.01, 0);
        }

        if(this.waitFlag) {
            this.timer += UnityEngine.Time.deltaTime;
            if(this.timer > 2) {
                this.timer = 0;

                this.goFlag = true;
                this.waitFlag = false;
            }
        }
    }

    OnTriggerEnter(other) {
        if(other.gameObject.CompareTag("Crosswalk")) {
            this.goFlag = false;
            this.waitFlag = true;
        }
        if(other.gameObject.CompareTag("Turn")) {
            this.transform.Rotate(0, 0, 90);
        }
    }
}