import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from './ClientStarter';
import * as UnityEngine from "UnityEngine";

export default class SlowPadController extends ZepetoScriptBehaviour {
    public obj: UnityEngine.GameObject;
    public goal: UnityEngine.GameObject;

    Update() {
        this.transform.position = UnityEngine.Vector3.MoveTowards(this.transform.position, this.goal.transform.position, 0.02);
    }

    OnTriggerEnter(other) {
        if (other.gameObject.CompareTag("Player")) {
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalRunSpeed -= 3;
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalWalkSpeed -= 3;
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalJumpPower -= 3;
        }
    }

    OnTriggerExit(other) {
        if (other.gameObject.CompareTag("Player")) {
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalRunSpeed += 3;
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalWalkSpeed += 3;
            this.obj.GetComponent<ClientStarter>().getCharacter().character.additionalJumpPower += 3;
        }
    }
}