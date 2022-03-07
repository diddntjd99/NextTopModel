import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image } from 'UnityEngine.UI'
import * as UnityEngine from "UnityEngine";

export default class FadeController extends ZepetoScriptBehaviour {
    private image: Image;

    private timer: number;

    Start() {
        this.image = this.GetComponent<Image>();
        this.timer = 0;
    }

    Update() {
        this.timer +=  UnityEngine.Time.deltaTime;
        if (this.timer > 0.005) {
            var color: UnityEngine.Color = this.image.color;

            if (color.a > 0) {
                color.a -= UnityEngine.Time.deltaTime;
            }

            this.image.color = color;

            this.timer = 0;
        }
    }
}